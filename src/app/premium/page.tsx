'use client';

import { Crown, CheckCircle, Lock, Zap, Utensils, Calendar, Receipt, LineChart } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useEffect, useState } from 'react';
import Script from 'next/script';

export default function PremiumPage() {
  const { user, loading } = useAuth();
  const [isClient, setIsClient] = useState(false);
  
  // Set isClient to true after component mounts
  useEffect(() => {
    setIsClient(true);
  }, []);
  
  if (!isClient) {
    return <div className="min-h-screen pt-24 pb-16 px-4">Loading...</div>;
  }

  return (
    <div className="min-h-screen pt-24 pb-16 px-4 bg-gradient-to-br from-slate-50 to-white">
      <Script async src="https://js.stripe.com/v3/buy-button.js" />
      
      <div className="max-w-5xl mx-auto">
        {user && (
          <div className="bg-blue-50 border border-blue-100 p-4 rounded-lg mb-8 text-center">
            <p className="text-blue-800">
              You're signed in as <span className="font-semibold">{user.email}</span>. 
              Your subscription will be linked to this account.
            </p>
          </div>
        )}
        
        {!user && (
          <div className="bg-yellow-50 border border-yellow-100 p-4 rounded-lg mb-8 text-center">
            <p className="text-yellow-800">
              You're not signed in. You can still purchase a subscription, but consider 
              <a href="/#signup" className="font-semibold text-blue-600 hover:text-blue-800 ml-1">
                creating a free account first
              </a> to easily manage your subscription later.
            </p>
          </div>
        )}
      
        <div className="text-center mb-16">
          <h1 className="text-4xl sm:text-5xl font-extrabold text-gray-900 mb-6">
            Upgrade to <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600">Expiroo Premium</span>
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Take control of your food waste with advanced features designed to save you time and money.
          </p>
        </div>

        {/* Pricing Card - Elegant Design */}
        <div className="max-w-3xl mx-auto mb-20 overflow-hidden rounded-2xl shadow-lg bg-white">
          <div className="flex flex-col md:flex-row">
            {/* Left side: Features summary */}
            <div className="p-8 md:w-7/12 bg-gradient-to-br from-blue-50 to-indigo-50 border-r border-blue-100">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Premium Benefits</h2>
              
              <ul className="space-y-5">
                <li className="flex">
                  <CheckCircle className="w-5 h-5 text-green-500 mr-3 flex-shrink-0 mt-0.5" />
                  <div>
                    <h3 className="font-semibold text-gray-900">Unlimited Receipt Uploads</h3>
                    <p className="text-gray-600 text-sm">Track all your purchases without limits</p>
                  </div>
                </li>
                <li className="flex">
                  <CheckCircle className="w-5 h-5 text-green-500 mr-3 flex-shrink-0 mt-0.5" />
                  <div>
                    <h3 className="font-semibold text-gray-900">AI-Powered Expiry Prediction</h3>
                    <p className="text-gray-600 text-sm">97% accuracy in predicting when food expires</p>
                  </div>
                </li>
                <li className="flex">
                  <CheckCircle className="w-5 h-5 text-green-500 mr-3 flex-shrink-0 mt-0.5" />
                  <div>
                    <h3 className="font-semibold text-gray-900">Food Waste Analytics</h3>
                    <p className="text-gray-600 text-sm">Track your savings and environmental impact</p>
                  </div>
                </li>
                <li className="flex">
                  <CheckCircle className="w-5 h-5 text-green-500 mr-3 flex-shrink-0 mt-0.5" />
                  <div>
                    <h3 className="font-semibold text-gray-900">Dynamic Food Recipes</h3>
                    <p className="text-gray-600 text-sm">Get suggestions for items about to expire</p>
                  </div>
                </li>
                <li className="flex">
                  <CheckCircle className="w-5 h-5 text-green-500 mr-3 flex-shrink-0 mt-0.5" />
                  <div>
                    <h3 className="font-semibold text-gray-900">Advanced Calendar View</h3>
                    <p className="text-gray-600 text-sm">Visual timeline of all expiring items</p>
                  </div>
                </li>
                <li className="flex">
                  <CheckCircle className="w-5 h-5 text-green-500 mr-3 flex-shrink-0 mt-0.5" />
                  <div>
                    <h3 className="font-semibold text-gray-900">Priority Support</h3>
                    <p className="text-gray-600 text-sm">Fast responses to any questions</p>
                  </div>
                </li>
              </ul>
            </div>
            
            {/* Right side: Pricing and subscribe button */}
            <div className="p-8 md:w-5/12 flex flex-col justify-center">
              <div className="mb-2 text-center">
                <span className="inline-block px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                  3-day free trial
                </span>
              </div>
              <div className="text-center mb-6">
                <div className="flex items-center justify-center">
                  <span className="text-5xl font-extrabold text-gray-900">€2.99</span>
                  <span className="text-lg text-gray-600 ml-2">/month</span>
                </div>
                <p className="text-gray-500 text-sm mt-2">
                  Cancel anytime during your trial with no charge
                </p>
              </div>
              
              <div className="w-full mb-6" 
                id="stripe-buy-button-container"
                ref={(el) => {
                  if (el && isClient) {
                    el.innerHTML = `
                      <stripe-buy-button
                        buy-button-id="buy_btn_1R5pGOAo8cvZCXlJvGM0K8c2"
                        publishable-key="pk_live_51R5oAnAo8cvZCXlJ69o5ltKKDlWsQPlw7L4A44oJ4ghKDtagulnrKJ0vCEd7ZkfGuObiQreaAf9OiD5ZuHvFNm0N00fanB5iKh"
                      >
                      </stripe-buy-button>
                    `;
                  }
                }}
              />
              
              <div className="flex items-center justify-center text-sm text-gray-500 mt-4">
                <Lock size={14} className="mr-1 text-gray-400" />
                <span>Secure payment via Stripe</span>
              </div>
            </div>
          </div>
        </div>

        {/* Feature Highlights */}
        <div className="grid md:grid-cols-3 gap-8 mb-16">
          <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
            <div className="flex items-center mb-4">
              <Receipt className="w-10 h-10 text-blue-600 p-1.5 bg-blue-50 rounded-full mr-3" />
              <h3 className="text-xl font-semibold text-gray-900">Unlimited Uploads</h3>
            </div>
            <p className="text-gray-600 mb-3">
              Upload as many receipts as you want without any limits, making it easy to track all your food items.
            </p>
            <div className="flex items-center text-green-600 text-sm">
              <CheckCircle size={16} className="mr-1" />
              <span>No upload restrictions</span>
            </div>
          </div>

          <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
            <div className="flex items-center mb-4">
              <Zap className="w-10 h-10 text-blue-600 p-1.5 bg-blue-50 rounded-full mr-3" />
              <h3 className="text-xl font-semibold text-gray-900">AI Prediction</h3>
            </div>
            <p className="text-gray-600 mb-3">
              Our advanced AI algorithms predict expiry dates with up to 97% accuracy, giving you precise control.
            </p>
            <div className="flex items-center text-green-600 text-sm">
              <CheckCircle size={16} className="mr-1" />
              <span>Cutting-edge technology</span>
            </div>
          </div>

          <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
            <div className="flex items-center mb-4">
              <Utensils className="w-10 h-10 text-blue-600 p-1.5 bg-blue-50 rounded-full mr-3" />
              <h3 className="text-xl font-semibold text-gray-900">Smart Recipes</h3>
            </div>
            <p className="text-gray-600 mb-3">
              Get personalized recipe suggestions based on items that are about to expire, reducing food waste.
            </p>
            <div className="flex items-center text-green-600 text-sm">
              <CheckCircle size={16} className="mr-1" />
              <span>Personalized for your pantry</span>
            </div>
          </div>
        </div>
        
        {/* Testimonials */}
        <div className="mb-16">
          <h2 className="text-2xl font-bold text-gray-900 mb-8 text-center">What Our Premium Users Say</h2>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
              <div className="flex items-center mb-4">
                <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-medium mr-3">SK</div>
                <div>
                  <p className="font-medium text-gray-900">Sarah K.</p>
                  <div className="flex">
                    {[...Array(5)].map((_, i) => (
                      <svg key={i} className="w-4 h-4 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    ))}
                  </div>
                </div>
              </div>
              <p className="text-gray-600 mb-4">
                "Expiroo Premium has saved me hundreds of euros by preventing food waste. The recipe suggestions are fantastic!"
              </p>
            </div>
            
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
              <div className="flex items-center mb-4">
                <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-medium mr-3">MT</div>
                <div>
                  <p className="font-medium text-gray-900">Marcus T.</p>
                  <div className="flex">
                    {[...Array(5)].map((_, i) => (
                      <svg key={i} className="w-4 h-4 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    ))}
                  </div>
                </div>
              </div>
              <p className="text-gray-600 mb-4">
                "The AI expiry predictions are incredibly accurate. I no longer throw away food due to inaccurate expiry dates."
              </p>
            </div>
            
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
              <div className="flex items-center mb-4">
                <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-medium mr-3">EM</div>
                <div>
                  <p className="font-medium text-gray-900">Elena M.</p>
                  <div className="flex">
                    {[...Array(5)].map((_, i) => (
                      <svg key={i} className="w-4 h-4 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    ))}
                  </div>
                </div>
              </div>
              <p className="text-gray-600 mb-4">
                "The calendar view has completely changed how I plan my meals. Worth every penny for the time savings alone!"
              </p>
            </div>
          </div>
        </div>
        
        {/* FAQ */}
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-8 text-center">Frequently Asked Questions</h2>
          <div className="max-w-3xl mx-auto space-y-6">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
              <h3 className="font-medium text-gray-900 mb-2 flex items-center">
                <span className="h-6 w-6 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 text-sm mr-3">1</span>
                Can I cancel my subscription anytime?
              </h3>
              <p className="text-gray-600 ml-9">Yes, you can cancel your subscription at any time. If you cancel, you'll continue to have access to premium features until the end of your billing period.</p>
            </div>
            
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
              <h3 className="font-medium text-gray-900 mb-2 flex items-center">
                <span className="h-6 w-6 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 text-sm mr-3">2</span>
                How does the free trial work?
              </h3>
              <p className="text-gray-600 ml-9">You'll get full access to all premium features for 3 days without charge. If you decide to keep your subscription after the trial period, you'll be billed €2.99/month. You can cancel anytime before the trial ends.</p>
            </div>
            
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
              <h3 className="font-medium text-gray-900 mb-2 flex items-center">
                <span className="h-6 w-6 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 text-sm mr-3">3</span>
                How does the AI expiry prediction work?
              </h3>
              <p className="text-gray-600 ml-9">Our AI analyzes thousands of food items, their properties, and storage conditions to predict the most accurate expiry dates, even for items without explicit dates on the packaging.</p>
            </div>
            
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
              <h3 className="font-medium text-gray-900 mb-2 flex items-center">
                <span className="h-6 w-6 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 text-sm mr-3">4</span>
                Can I share my premium account with others?
              </h3>
              <p className="text-gray-600 ml-9">Your premium subscription is for personal use. However, we're working on family plans that will allow you to share premium features with your household members.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 