import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  console.log('⚠️ WEBHOOK TEST RECEIVED ⚠️', new Date().toISOString());
  
  // Log headers
  const headers = Object.fromEntries([...req.headers.entries()]);
  console.log('Headers:', JSON.stringify(headers, null, 2));
  
  // Log body
  try {
    const body = await req.text();
    console.log('Body:', body.substring(0, 500) + (body.length > 500 ? '...' : ''));
  } catch (err) {
    console.error('Error reading body:', err);
  }
  
  // Always respond with success to Stripe
  return NextResponse.json({ received: true }, { status: 200 });
} 