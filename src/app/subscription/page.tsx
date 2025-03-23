import SubscriptionButton from '@/components/SubscriptionButton';

export default function SubscriptionPage() {
  // This would typically come from your Stripe dashboard or a database
  const subscriptionPlans = [
    {
      id: 'basic',
      name: 'Basic Plan',
      priceId: process.env.NEXT_PUBLIC_STRIPE_BUTTON_ID || '',
      price: '$4.99',
      period: 'month',
      features: [
        'Track up to 100 food items',
        'Expiry notifications',
        'Basic food classification',
      ],
      cta: 'Start Basic Plan',
      popular: false,
    },
    {
      id: 'premium',
      name: 'Premium Plan',
      priceId: process.env.NEXT_PUBLIC_STRIPE_BUTTON_ID || '',
      price: '$9.99',
      period: 'month',
      features: [
        'Unlimited food items',
        'Advanced expiry predictions',
        'Priority support',
        'Advanced food classification',
        'Export and reporting',
      ],
      cta: 'Start Premium Plan',
      popular: true,
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center">
          <h1 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
            Choose Your Plan
          </h1>
          <p className="mt-4 text-xl text-gray-600">
            Select the subscription plan that works best for you
          </p>
        </div>

        <div className="mt-12 space-y-4 sm:space-y-0 sm:grid sm:grid-cols-2 sm:gap-6 lg:max-w-4xl lg:mx-auto xl:max-w-none xl:mx-0 xl:grid-cols-2">
          {subscriptionPlans.map((plan) => (
            <div
              key={plan.id}
              className={`border rounded-lg shadow-sm divide-y divide-gray-200 ${
                plan.popular
                  ? 'border-blue-500 ring-2 ring-blue-500'
                  : 'border-gray-200'
              }`}
            >
              {plan.popular && (
                <div className="absolute inset-x-0 top-0 transform translate-y-px">
                  <div className="flex justify-center transform -translate-y-1/2">
                    <span className="inline-flex rounded-full bg-blue-600 px-4 py-1 text-sm font-semibold text-white">
                      Most Popular
                    </span>
                  </div>
                </div>
              )}
              <div className="p-6">
                <h2 className="text-lg leading-6 font-medium text-gray-900">
                  {plan.name}
                </h2>
                <p className="mt-4">
                  <span className="text-4xl font-extrabold text-gray-900">
                    {plan.price}
                  </span>{' '}
                  <span className="text-base font-medium text-gray-500">
                    /{plan.period}
                  </span>
                </p>
                <p className="mt-4 text-sm text-gray-500">
                  All the basics for tracking your food expiry dates.
                </p>
                <SubscriptionButton
                  priceId={plan.priceId}
                  buttonText={plan.cta}
                  className="mt-8 block w-full"
                />
              </div>
              <div className="pt-6 pb-8 px-6">
                <h3 className="text-xs font-medium text-gray-900 tracking-wide uppercase">
                  What's included
                </h3>
                <ul className="mt-6 space-y-4">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex space-x-3">
                      <svg
                        className="flex-shrink-0 h-5 w-5 text-green-500"
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                      <span className="text-sm text-gray-500">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
} 