import Stripe from 'stripe';

// Initialize the Stripe client with the secret key
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16',
});

export { stripe }; 