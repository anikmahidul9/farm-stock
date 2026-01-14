// app/api/payment/initiate/route.ts
import { NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { collection, addDoc, serverTimestamp, doc, getDoc, updateDoc } from 'firebase/firestore';

// Initialize fetch globally at the module level
if (typeof global.fetch === 'undefined') {
  // @ts-ignore
  global.fetch = require('node-fetch').default || require('node-fetch');
}

// Also initialize other fetch-related globals
if (typeof global.Headers === 'undefined') {
  // @ts-ignore
  global.Headers = require('node-fetch').Headers;
}
if (typeof global.Request === 'undefined') {
  // @ts-ignore
  global.Request = require('node-fetch').Request;
}
if (typeof global.Response === 'undefined') {
  // @ts-ignore
  global.Response = require('node-fetch').Response;
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    console.log('Payment initiation request body:', body);
    
    const { offer, buyer, orderId } = body;

    const storeId = process.env.SSLCZ_STORE_ID;
    const storePasswd = process.env.SSLCZ_STORE_PASSWD;
    const isLive = process.env.SSLCZ_SANDBOX_MODE !== 'true';
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';

    console.log('Payment environment check:', {
      storeId: storeId ? 'Set' : 'Missing',
      storePasswd: storePasswd ? 'Set' : 'Missing',
      isLive,
      baseUrl
    });

    if (!storeId || !storePasswd || !baseUrl) {
      console.error('Missing SSLCommerz configuration');
      return NextResponse.json({ 
        error: 'Server configuration missing for payments.',
        missing: {
          storeId: !storeId,
          storePasswd: !storePasswd,
          baseUrl: !baseUrl
        }
      }, { status: 500 });
    }

    let orderRef;
    let tran_id;
    let paymentData: any = {};
    let orderType = 'single_offer';

    if (orderId) {
      // Cart checkout - use existing order
      console.log('Processing cart checkout for order:', orderId);
      orderRef = doc(db, 'orders', orderId);
      const orderDoc = await getDoc(orderRef);
      
      if (!orderDoc.exists()) {
        console.error('Order not found:', orderId);
        return NextResponse.json({ error: 'Order not found' }, { status: 404 });
      }
      
      const orderData = orderDoc.data();
      tran_id = orderData.tran_id;
      orderType = orderData.orderType || 'cart_checkout';
      
      // Update order with payment initiation timestamp
      await updateDoc(orderRef, {
        paymentInitiatedAt: serverTimestamp(),
        paymentStatus: 'initiated'
      });
      
      // Prepare payment data from order
      paymentData = {
        amount: orderData.amount || orderData.totalAmount || 0,
        productName: orderType === 'cart_checkout' 
          ? `Cart Checkout (${orderData.cartItems?.length || 0} items)` 
          : orderData.offerInfo?.buyRequestTitle || 'Purchase',
        buyerInfo: orderData.buyerInfo || buyer,
        orderId: orderId,
        sellerId: orderData.sellerId || offer?.sellerId || 'multiple',
      };
      
    } else {
      // Single offer checkout (original logic)
      if (!offer || !buyer) {
        console.error('Missing offer or buyer details:', { offer, buyer });
        return NextResponse.json({ 
          error: 'Missing offer or buyer details',
          receivedBody: body 
        }, { status: 400 });
      }

      tran_id = `FS-${Date.now()}`;
      console.log('Creating new single offer order with tran_id:', tran_id);

      // Create an order document in Firestore
      orderRef = await addDoc(collection(db, 'orders'), {
        tran_id,
        offerId: offer.id,
        buyRequestId: offer.buyRequestId,
        buyerId: buyer.uid,
        sellerId: offer.sellerId,
        amount: offer.price,
        currency: 'BDT',
        status: 'pending',
        orderType: 'single_offer',
        createdAt: serverTimestamp(),
        buyerInfo: {
          name: buyer.name,
          email: buyer.email,
          phone: buyer.phone || '01700000000',
          address: buyer.address || 'N/A',
          city: buyer.city || 'Dhaka',
          state: buyer.state || 'Dhaka',
          postcode: buyer.postcode || '1212',
        },
        offerInfo: {
          id: offer.id,
          buyRequestTitle: offer.buyRequestTitle || 'Livestock Purchase',
          sellerName: offer.sellerName,
          price: offer.price,
        },
        paymentStatus: 'initiated',
        paymentInitiatedAt: serverTimestamp(),
      });

      console.log('Order created:', orderRef.id);
      
      // Prepare payment data
      paymentData = {
        amount: offer.price,
        productName: offer.buyRequestTitle || 'Livestock Purchase',
        buyerInfo: buyer,
        orderId: orderRef.id,
        sellerId: offer.sellerId,
      };
    }

    // Ensure all required fields for SSLCommerz
    const amount = paymentData.amount;
    const productName = paymentData.productName;
    const buyerInfo = paymentData.buyerInfo || {};
    
    // Validate amount
    if (!amount || amount <= 0) {
      console.error('Invalid amount:', amount);
      return NextResponse.json({ 
        error: 'Invalid payment amount',
        amount: amount
      }, { status: 400 });
    }

    // Prepare data for SSLCommerz
    const sslczData: Record<string, string> = {
      store_id: storeId,
      store_passwd: storePasswd,
      total_amount: amount.toString(),
      currency: 'BDT',
      tran_id: tran_id,
      success_url: `${baseUrl}/api/payment/success`,
      fail_url: `${baseUrl}/api/payment/fail`,
      cancel_url: `${baseUrl}/api/payment/cancel`,
      ipn_url: `${baseUrl}/api/payment/ipn`,
      shipping_method: 'NO',
      product_name: productName.substring(0, 50),
      product_category: 'Agriculture',
      product_profile: 'general',
      cus_name: (buyerInfo.name || 'Customer').substring(0, 50),
      cus_email: (buyerInfo.email || 'customer@example.com').substring(0, 50),
      cus_add1: (buyerInfo.address || 'Dhaka, Bangladesh').substring(0, 50),
      cus_add2: 'N/A',
      cus_city: (buyerInfo.city || 'Dhaka').substring(0, 50),
      cus_state: (buyerInfo.state || 'Dhaka').substring(0, 50),
      cus_postcode: (buyerInfo.postcode || '1212').substring(0, 50),
      cus_country: 'Bangladesh',
      cus_phone: (buyerInfo.phone || '01700000000').substring(0, 20),
      cus_fax: (buyerInfo.phone || '01700000000').substring(0, 20),
      ship_name: (buyerInfo.name || 'Customer').substring(0, 50),
      ship_add1: (buyerInfo.address || 'Dhaka, Bangladesh').substring(0, 50),
      ship_add2: 'N/A',
      ship_city: (buyerInfo.city || 'Dhaka').substring(0, 50),
      ship_state: (buyerInfo.state || 'Dhaka').substring(0, 50),
      ship_postcode: (buyerInfo.postcode || '1212').substring(0, 50),
      ship_country: 'Bangladesh',
      multi_card_name: 'mastercard,visacard,amexcard,othercards',
      value_a: paymentData.orderId,
      value_b: buyerInfo.uid || 'unknown',
      value_c: orderType,
      value_d: tran_id,
    };

    console.log('Calling SSLCommerz API with:', {
      store_id: storeId,
      tran_id: tran_id,
      amount: amount,
      product_name: productName,
      order_type: orderType
    });

    // Call SSLCommerz API directly
    const sslczUrl = isLive 
      ? 'https://securepay.sslcommerz.com/gwprocess/v4/api.php'
      : 'https://sandbox.sslcommerz.com/gwprocess/v4/api.php';

    const response = await fetch(sslczUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams(sslczData).toString(),
    });

    const apiResponse = await response.json();
    console.log('SSLCommerz API Response:', apiResponse);

    if (apiResponse?.GatewayPageURL) {
      // Create payment session record
      await addDoc(collection(db, 'payment_sessions'), {
        tran_id,
        orderId: paymentData.orderId,
        sessionkey: apiResponse.sessionkey || '',
        gatewayPageURL: apiResponse.GatewayPageURL,
        createdAt: serverTimestamp(),
        storeId: storeId,
        isLive: isLive,
      });

      return NextResponse.json({ 
        url: apiResponse.GatewayPageURL,
        tran_id: tran_id,
        orderId: paymentData.orderId,
        sessionkey: apiResponse.sessionkey,
        orderType: orderType
      });
    } else {
      console.error("SSL Commerz init failed:", apiResponse);
      
      // Update order with failure
      if (orderRef) {
        await updateDoc(orderRef, {
          paymentStatus: 'initiation_failed',
          paymentError: apiResponse.failedreason || 'Unknown error',
          paymentFailedAt: serverTimestamp(),
        });
      }

      return NextResponse.json({ 
        error: 'Failed to create payment session.',
        failedreason: apiResponse.failedreason,
        status: apiResponse.status,
        details: apiResponse
      }, { status: 500 });
    }
  } catch (error: any) {
    console.error("Error in payment initiation:", error);
    return NextResponse.json({ 
      error: 'Internal server error.',
      details: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    }, { status: 500 });
  }
}