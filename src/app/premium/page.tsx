'use client';

import { Crown, CheckCircle, Lock, Zap, Utensils, Calendar, Receipt, LineChart } from 'lucide-react';
import SubscriptionButton from '@/components/SubscriptionButton';
import { useAuth } from '@/contexts/AuthContext';
import { useEffect, useState } from 'react';

export default function PremiumPage() {
  const { user, loading } = useAuth();
  const [isClient, setIsClient] = useState(false);
  
  // Using a proper Stripe price ID instead of a button ID
  // Stripe price IDs start with 'price_' not 'buy_btn_'
  const premiumPriceId = 'price_1R5pIuAo8cvZCXlJqcN9JlcK';
  
  // Set isClient to true after component mounts
  useEffect(() => {
    setIsClient(true);
  }, []);
  
  if (!isClient) {
    return <div className="min-h-screen pt-24 pb-16 px-4">Loading...</div>;
  }

  return (
    <div className="min-h-screen pt-24 pb-16 px-4 bg-gradient-to-br from-blue-50 to-white">
      <div className="max-w-5xl mx-auto">
        {user && (
          <div className="bg-blue-50 p-4 rounded-lg mb-8 text-center">
            <p className="text-blue-800">
              You're signed in as <span className="font-semibold">{user.email}</span>. 
              Your subscription will be linked to this account.
            </p>
          </div>
        )}
        
        {!user && (
          <div className="bg-yellow-50 p-4 rounded-lg mb-8 text-center">
            <p className="text-yellow-800">
              You're not signed in. You can still purchase a subscription, but consider 
              <a href="/#signup" className="font-semibold text-blue-600 hover:text-blue-800 ml-1">
                creating a free account first
              </a> to easily manage your subscription later.
            </p>
          </div>
        )}
      
        <div className="text-center mb-12">
          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800 mb-4">
            <Crown size={16} className="mr-1" />
            Premium Features
          </span>
          <h1 className="text-4xl sm:text-5xl font-extrabold text-gray-900 mb-4">
            Upgrade to <span className="text-blue-600">Expiroo Premium</span>
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Take control of your food waste with advanced features designed to save you time and money.
          </p>
        </div>

        {/* Premium Plan Features */}
        <div className="grid md:grid-cols-2 gap-8 mb-12">
          <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100 hover:shadow-lg transition-shadow">
            <div className="flex items-center mb-4">
              <Receipt className="w-8 h-8 text-blue-600 mr-3" />
              <h3 className="text-xl font-semibold text-gray-900">Unlimited Receipt Uploads</h3>
            </div>
            <p className="text-gray-600 mb-3">
              Upload as many receipts as you want without any limits, making it easy to track all your food items.
            </p>
            <div className="flex items-center text-green-600 text-sm">
              <CheckCircle size={16} className="mr-1" />
              <span>No upload limits</span>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100 hover:shadow-lg transition-shadow">
            <div className="flex items-center mb-4">
              <Zap className="w-8 h-8 text-blue-600 mr-3" />
              <h3 className="text-xl font-semibold text-gray-900">AI-Powered Expiry Prediction</h3>
            </div>
            <p className="text-gray-600 mb-3">
              Our advanced AI algorithms predict expiry dates with much higher accuracy, giving you better control.
            </p>
            <div className="flex items-center text-green-600 text-sm">
              <CheckCircle size={16} className="mr-1" />
              <span>Up to 97% accuracy rate</span>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100 hover:shadow-lg transition-shadow">
            <div className="flex items-center mb-4">
              <Utensils className="w-8 h-8 text-blue-600 mr-3" />
              <h3 className="text-xl font-semibold text-gray-900">Dynamic Food Recipes</h3>
            </div>
            <p className="text-gray-600 mb-3">
              Get personalized recipe suggestions based on items that are about to expire, reducing food waste.
            </p>
            <div className="flex items-center text-green-600 text-sm">
              <CheckCircle size={16} className="mr-1" />
              <span>Weekly recipe suggestions</span>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100 hover:shadow-lg transition-shadow">
            <div className="flex items-center mb-4">
              <Calendar className="w-8 h-8 text-blue-600 mr-3" />
              <h3 className="text-xl font-semibold text-gray-900">Advanced Calendar View</h3>
            </div>
            <p className="text-gray-600 mb-3">
              Visualize your food expiry dates on a calendar, making it easier to plan your meals ahead of time.
            </p>
            <div className="flex items-center text-green-600 text-sm">
              <CheckCircle size={16} className="mr-1" />
              <span>Monthly expiry calendar</span>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100 hover:shadow-lg transition-shadow">
            <div className="flex items-center mb-4">
              <LineChart className="w-8 h-8 text-blue-600 mr-3" />
              <h3 className="text-xl font-semibold text-gray-900">Food Waste Analytics</h3>
            </div>
            <p className="text-gray-600 mb-3">
              Get detailed reports on how much food you're saving and the environmental impact of your actions.
            </p>
            <div className="flex items-center text-green-600 text-sm">
              <CheckCircle size={16} className="mr-1" />
              <span>Monthly impact reports</span>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100 hover:shadow-lg transition-shadow">
            <div className="flex items-center mb-4">
              <Lock className="w-8 h-8 text-blue-600 mr-3" />
              <h3 className="text-xl font-semibold text-gray-900">Priority Support</h3>
            </div>
            <p className="text-gray-600 mb-3">
              Get priority access to our support team, ensuring any issues are resolved as quickly as possible.
            </p>
            <div className="flex items-center text-green-600 text-sm">
              <CheckCircle size={16} className="mr-1" />
              <span>24/7 premium support</span>
            </div>
          </div>
        </div>

        {/* Pricing Section */}
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden mb-8">
          <div className="p-8 border-b border-gray-200">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Premium Plan</h2>
            <p className="text-gray-600">Unlock all premium features and take full control of your food waste.</p>
          </div>
          
          <div className="p-8">
            <div className="flex items-baseline mb-6">
              <span className="text-5xl font-extrabold text-gray-900">$9.99</span>
              <span className="text-lg text-gray-600 ml-2">/month</span>
            </div>
            
            <ul className="space-y-4 mb-8">
              <li className="flex items-center">
                <CheckCircle className="w-5 h-5 text-green-500 mr-2" />
                <span className="text-gray-700">Unlimited Receipt Uploads</span>
              </li>
              <li className="flex items-center">
                <CheckCircle className="w-5 h-5 text-green-500 mr-2" />
                <span className="text-gray-700">AI-Powered Expiry Prediction</span>
              </li>
              <li className="flex items-center">
                <CheckCircle className="w-5 h-5 text-green-500 mr-2" />
                <span className="text-gray-700">Dynamic Food Recipes</span>
              </li>
              <li className="flex items-center">
                <CheckCircle className="w-5 h-5 text-green-500 mr-2" />
                <span className="text-gray-700">Advanced Calendar View</span>
              </li>
              <li className="flex items-center">
                <CheckCircle className="w-5 h-5 text-green-500 mr-2" />
                <span className="text-gray-700">Food Waste Analytics</span>
              </li>
              <li className="flex items-center">
                <CheckCircle className="w-5 h-5 text-green-500 mr-2" />
                <span className="text-gray-700">Priority Support</span>
              </li>
            </ul>
            
            <SubscriptionButton 
              priceId={premiumPriceId} 
              buttonText="Upgrade to Premium" 
              className="w-full py-3 text-lg"
            />
            
            <p className="text-center text-sm text-gray-500 mt-4">
              7-day money-back guarantee. Cancel anytime.
            </p>
          </div>
        </div>
        
        {/* Testimonials */}
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">What Our Premium Users Say</h2>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-xl shadow-md">
              <p className="text-gray-600 mb-4">
                "Expiroo Premium has saved me hundreds of euros by preventing food waste. The recipe suggestions are fantastic!"
              </p>
              <p className="font-medium text-gray-900">- Sarah K.</p>
            </div>
            
            <div className="bg-white p-6 rounded-xl shadow-md">
              <p className="text-gray-600 mb-4">
                "The AI expiry predictions are incredibly accurate. I no longer throw away food due to inaccurate expiry dates."
              </p>
              <p className="font-medium text-gray-900">- Marcus T.</p>
            </div>
            
            <div className="bg-white p-6 rounded-xl shadow-md">
              <p className="text-gray-600 mb-4">
                "The calendar view has completely changed how I plan my meals. Worth every penny for the time savings alone!"
              </p>
              <p className="font-medium text-gray-900">- Elena M.</p>
            </div>
          </div>
        </div>
        
        {/* FAQ */}
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Frequently Asked Questions</h2>
          <div className="text-left space-y-4">
            <div className="bg-white p-6 rounded-xl shadow-md">
              <h3 className="font-medium text-gray-900 mb-2">Can I cancel my subscription anytime?</h3>
              <p className="text-gray-600">Yes, you can cancel your subscription at any time. If you cancel, you'll continue to have access to premium features until the end of your billing period.</p>
            </div>
            
            <div className="bg-white p-6 rounded-xl shadow-md">
              <h3 className="font-medium text-gray-900 mb-2">Is there a free trial available?</h3>
              <p className="text-gray-600">We offer a 7-day money-back guarantee. If you're not satisfied with Premium, contact us within 7 days for a full refund.</p>
            </div>
            
            <div className="bg-white p-6 rounded-xl shadow-md">
              <h3 className="font-medium text-gray-900 mb-2">How does the AI expiry prediction work?</h3>
              <p className="text-gray-600">Our AI analyzes thousands of food items, their properties, and storage conditions to predict the most accurate expiry dates, even for items without explicit dates on the packaging.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 