import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || '';
  // You can log the cancelled transaction details here if needed
  const formData = await request.formData();
  const body = Object.fromEntries(formData.entries());
  console.log("Payment cancelled:", body);

  // We redirect to a static page that will show the cancellation message
  return NextResponse.redirect(new URL('/payment/cancel', baseUrl));
}