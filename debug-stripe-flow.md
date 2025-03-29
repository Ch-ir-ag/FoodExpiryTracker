# Stripe Integration Debugging Guide

## 1. Check Your Environment Variables

Make sure these environment variables are correctly set:

```
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_*****
STRIPE_SECRET_KEY=sk_*****
STRIPE_WEBHOOK_SECRET=whsec_*****
SUPABASE_SERVICE_ROLE_KEY=eyJ*****
```

## 2. Verify Webhook Configuration in Stripe Dashboard

1. Go to the [Stripe Dashboard](https://dashboard.stripe.com/webhooks)
2. Ensure your webhook endpoint is set to `https://your-domain.com/api/stripe/webhook`
3. Make sure it has these events enabled:
   - `checkout.session.completed`
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`

## 3. Run the Setup SQL Script

Run the SQL script in your Supabase SQL Editor:

```sql
-- From src/scripts/create_subscription_tables.sql
```

## 4. Checking Webhook Delivery with the Test Endpoint

Test if webhooks are being delivered with our test endpoint:

1. In the Stripe Dashboard, go to Webhooks
2. Add a temporary webhook endpoint: `https://your-domain.com/api/stripe/webhook-test`
3. Click "Send test webhook" and select "checkout.session.completed"
4. Check your logs to see if the test webhook was received

## 5. Emergency Manual Subscription Creation

If subscriptions still aren't being created, you can manually create one:

```bash
curl -X POST https://your-domain.com/api/stripe/create-subscription \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "user-id-from-auth-getUser",
    "subscriptionId": "sub_xyz123", 
    "customerId": "cus_abc456",
    "status": "active"
  }'
```

Or use the browser console on your premium page:

```javascript
fetch('/api/stripe/create-subscription', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    userId: 'your-user-id', // Get this from console.log(user.id) in your React code
    subscriptionId: 'your-subscription-id', // From Stripe dashboard
    customerId: 'your-customer-id', // From Stripe dashboard
    status: 'active'
  })
}).then(r => r.json()).then(console.log)
```

## 6. Testing the Subscription Status

To test if a user's subscription is active:

```javascript
fetch('/api/stripe/check-subscription', {
  method: 'GET',
  headers: { 'Content-Type': 'application/json' },
  credentials: 'include'
}).then(r => r.json()).then(console.log)
```

## 7. Check Logs for These Error Messages

Look for these specific errors in your logs:

1. `❌ STRIPE_WEBHOOK_SECRET is not set` - Environment variable issue
2. `❌ stripe-signature header is missing` - Webhook delivery issue
3. `❌ Webhook signature verification failed` - Webhook secret mismatch
4. `❌ Failed to get supabaseAdmin client` - Supabase service role key issue
5. Any database-related error - Could be permissions issue

## 8. Debugging Steps When Payments Work But Database Updates Fail

1. First, check if the webhook is being received (see logs)
2. If received but failing, check for database errors in the logs
3. If no webhook is received, check your Stripe webhook configuration
4. If all else fails, use the manual subscription creation endpoint 