import { NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { collection, query, where, getDocs, updateDoc, doc } from 'firebase/firestore';

// Polyfill fetch
if (typeof global.fetch === 'undefined') {
  // @ts-ignore
  global.fetch = require('node-fetch').default || require('node-fetch');
}

// Simple validation function that doesn't use the problematic package
async function validateSSLCommerzPayment(body: any) {
  const storeId = process.env.SSLCZ_STORE_ID;
  const storePasswd = process.env.SSLCZ_STORE_PASSWD;
  const isLive = process.env.SSLCZ_SANDBOX_MODE !== 'true';

  if (!storeId || !storePasswd) {
    return { status: 'ERROR', error: 'Missing credentials' };
  }

  const val_id = body.val_id;
  if (!val_id) {
    return { status: 'ERROR', error: 'Missing val_id' };
  }

  // Use SSLCommerz validation API directly
  const validationUrl = isLive
    ? 'https://securepay.sslcommerz.com/validator/api/validationserverAPI.php'
    : 'https://sandbox.sslcommerz.com/validator/api/validationserverAPI.php';

  const params = new URLSearchParams({
    val_id: val_id,
    store_id: storeId,
    store_passwd: storePasswd,
    format: 'json',
    v: '1'
  });

  try {
    const response = await fetch(`${validationUrl}?${params.toString()}`);
    if (!response.ok) {
      throw new Error(`Validation API returned ${response.status}`);
    }
    return await response.json();
  } catch (error: any) {
    console.error('Validation API error:', error);
    return { status: 'ERROR', error: error.message };
  }
}

export async function POST(request: Request) {
  console.log('=== PAYMENT SUCCESS CALLBACK STARTED ===');
  
  let body: any = {};
  
  try {
    // Try to parse as form data first (SSLCommerz sends form data)
    try {
      const formData = await request.formData();
      body = Object.fromEntries(formData.entries());
      console.log('Parsed as form data');
    } catch (formError) {
      // If not form data, try JSON
      try {
        body = await request.json();
        console.log('Parsed as JSON');
      } catch (jsonError) {
        console.error('Could not parse request body:', jsonError);
        body = {};
      }
    }

    console.log('Payment success callback body:', JSON.stringify(body, null, 2));

    const storeId = process.env.SSLCZ_STORE_ID;
    const storePasswd = process.env.SSLCZ_STORE_PASSWD;
    const isLive = process.env.SSLCZ_SANDBOX_MODE !== 'true';
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';

    console.log('Environment check:', {
      storeId: storeId ? 'Set' : 'Missing',
      storePasswd: storePasswd ? 'Set' : 'Missing',
      isLive,
      baseUrl
    });

    if (!storeId || !storePasswd || !baseUrl) {
      console.error('Server configuration missing for SSLCommerz');
      return NextResponse.redirect(new URL('/payment/fail?reason=server-config', baseUrl));
    }

    const { tran_id, val_id, status, amount, bank_tran_id, currency, card_type, card_no, card_brand } = body;

    if (!tran_id) {
      console.error('Missing tran_id in success callback');
      return NextResponse.redirect(new URL('/payment/fail?reason=missing-tran-id', baseUrl));
    }

    console.log('Looking for order with tran_id:', tran_id);

    // Find the order in Firestore
    const ordersQuery = query(collection(db, "orders"), where("tran_id", "==", tran_id));
    const querySnapshot = await getDocs(ordersQuery);

    if (querySnapshot.empty) {
      console.error(`Order not found for tran_id: ${tran_id}`);
      return NextResponse.redirect(
        new URL(`/payment/fail?reason=order-not-found&tran_id=${tran_id}`, baseUrl)
      );
    }

    const orderDoc = querySnapshot.docs[0];
    const orderId = orderDoc.id;
    const orderRef = doc(db, "orders", orderId);
    
    console.log(`Found order: ${orderId}, current status: ${orderDoc.data().status}`);

    // Validate the payment with SSLCommerz
    console.log('Validating payment with SSLCommerz...');
    const validation = await validateSSLCommerzPayment(body);
    console.log('Validation result:', validation);

    // Update order based on validation result
    const updateData: any = {
      successCallbackReceived: true,
      successCallbackAt: new Date().toISOString(),
      successCallbackData: body,
      validationResult: validation,
    };

    // Check if validation was successful
    const isValid = validation?.status === 'VALID' || validation?.status === 'VALIDATED';
    
    if (isValid) {
      console.log('Payment validation successful, marking as paid');
      
      updateData.status = 'paid';
      updateData.paymentStatus = 'completed';
      updateData.val_id = val_id || '';
      updateData.bank_tran_id = bank_tran_id || '';
      updateData.paidAmount = amount || orderDoc.data().amount;
      updateData.paidCurrency = currency || 'BDT';
      updateData.paymentMethod = card_type || 'card';
      updateData.cardNo = card_no ? `****${card_no.slice(-4)}` : '';
      updateData.cardBrand = card_brand || '';
      updateData.paymentDate = new Date().toISOString();
      updateData.verifiedAt = new Date().toISOString();
      
      // Also update related documents if needed
      const orderData = orderDoc.data();
      if (orderData.offerId) {
        try {
          const offerRef = doc(db, "offers", orderData.offerId);
          await updateDoc(offerRef, {
            status: 'accepted',
            paymentCompleted: true,
            updatedAt: new Date().toISOString()
          });
          console.log(`Updated offer ${orderData.offerId} to accepted`);
        } catch (offerError) {
          console.error('Error updating offer:', offerError);
        }
      }
    } else {
      console.warn('Payment validation failed or incomplete, marking as pending verification');
      updateData.status = 'pending_verification';
      updateData.paymentStatus = 'needs_verification';
    }

    await updateDoc(orderRef, updateData);
    console.log(`Order ${orderId} updated successfully`);

    // Redirect to success page
    console.log(`Redirecting to /orders/${orderId}`);
    return NextResponse.redirect(
      new URL(`/orders/${orderId}?payment=success&valid=${isValid ? 'yes' : 'no'}`, baseUrl)
    );

  } catch (error: any) {
    console.error("Error in payment success callback:", error);
    console.error("Error stack:", error.stack);
    console.error("Request body at time of error:", body);
    
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
    return NextResponse.redirect(
      new URL(`/payment/fail?reason=server-error&error=${encodeURIComponent(error.message)}`, baseUrl)
    );
  }
}