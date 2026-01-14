import 'node-fetch'; // Polyfill fetch
import { NextResponse } from 'next/server';
import SSLCommerzPayment from 'sslcommerz-lts';
import { db } from '@/lib/firebase';
import { collection, query, where, getDocs, doc, updateDoc, runTransaction, serverTimestamp } from 'firebase/firestore';

export async function POST(request: Request) {
  // The request body is x-www-form-urlencoded, not JSON
  const formData = await request.formData();
  const body = Object.fromEntries(formData.entries());

  console.log("IPN Body: ", body);

  const storeId = process.env.SSLCZ_STORE_ID;
  const storePasswd = process.env.SSLCZ_STORE_PASSWD;
  const isLive = process.env.SSLCZ_SANDBOX_MODE !== 'true';

  if (!storeId || !storePasswd) {
    return NextResponse.json({ error: 'Server configuration missing.' }, { status: 500 });
  }

  if (!body || !body.tran_id) {
    return NextResponse.json({ error: 'Invalid IPN data.' }, { status: 400 });
  }

  const sslcz = new SSLCommerzPayment(storeId, storePasswd, isLive);
  const validation = await sslcz.validate(body);

  if (validation?.status !== 'VALID') {
    console.error("IPN validation failed:", validation);
    // Even if validation fails, SSL Commerz expects a 200 OK response
    return new NextResponse('IPN Validation Failed', { status: 200 });
  }

  // IPN is valid, now update the database
  const { tran_id, status } = body;

  try {
    const ordersQuery = query(collection(db, "orders"), where("tran_id", "==", tran_id));
    const querySnapshot = await getDocs(ordersQuery);

    if (querySnapshot.empty) {
      console.error(`Order not found for tran_id: ${tran_id}`);
      return new NextResponse('Order not found', { status: 200 });
    }

    const orderDoc = querySnapshot.docs[0];
    const orderData = orderDoc.data();

    // Only process if the order is still pending to prevent duplicate processing
    if (orderData.status !== 'pending') {
      console.log(`Order ${orderDoc.id} already processed. Status: ${orderData.status}`);
      return new NextResponse('Order already processed', { status: 200 });
    }

    if (status === 'VALID') {
      // Payment successful, run the transaction to update all related documents
      await runTransaction(db, async (transaction) => {
        // 1. Update the order status
        transaction.update(orderDoc.ref, { status: "paid" });

        const { offerInfo, buyRequestId } = orderData;

        // 2. Update the accepted offer
        const acceptedOfferRef = doc(db, "offers", offerInfo.id);
        transaction.update(acceptedOfferRef, { status: "accepted" });

        // 3. Reject all other offers for this buy request
        const allOffersQuery = query(collection(db, "offers"), where("buyRequestId", "==", buyRequestId));
        const allOffersSnapshot = await getDocs(allOffersQuery);
        allOffersSnapshot.forEach(offerDoc => {
            if (offerDoc.id !== offerInfo.id) {
                transaction.update(offerDoc.ref, { status: "rejected" });
            }
        });

        // 4. Close the buy request
        const buyRequestRef = doc(db, "buy-requests", buyRequestId);
        transaction.update(buyRequestRef, { status: "closed" });

        // 5. Send notification to the seller
        const notification = {
            userId: offerInfo.sellerId,
            title: "Your offer was accepted!",
            message: `Payment received for your offer on "${offerInfo.buyRequestTitle}".`,
            link: `/seller/orders`,
            read: false,
            createdAt: serverTimestamp(),
        };
        const notificationRef = doc(collection(db, "notifications"));
        transaction.set(notificationRef, notification);
      });
      console.log(`Successfully processed order for tran_id: ${tran_id}`);

    } else {
      // Handle other statuses like FAILED, CANCELLED
      await updateDoc(orderDoc.ref, { status: status.toLowerCase() });
      console.log(`Order status updated to ${status.toLowerCase()} for tran_id: ${tran_id}`);
    }

    return new NextResponse('IPN Processed Successfully', { status: 200 });

  } catch (error) {
    console.error("Error processing IPN:", error);
    return new NextResponse('Error processing IPN', { status: 200 }); // Still return 200
  }
}