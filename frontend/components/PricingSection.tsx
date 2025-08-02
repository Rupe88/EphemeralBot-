'use client';
import { motion } from 'framer-motion';
import { useState } from 'react';
import { Check, Star, Zap, Shield, Users, Crown } from 'lucide-react';
import { AnimatedButton } from './ui/Button';

interface PricingTier {
  name: string;
  price: number;
  description: string;
  features: string[];
  popular?: boolean;
  icon: React.ReactNode;
  color: string;
}

const pricingTiers: PricingTier[] = [
  {
    name: 'Free',
    price: 0,
    description: 'Perfect for small servers',
    icon: <Zap className="h-6 w-6" />,
    color: 'text-gray-600',
    features: [
      '1 channel per server',
      'All expiration times (1h, 6h, 24h, 7d)',
      'Basic dashboard',
      'Community support',
      'Message tracking',
      'Basic analytics',
    ],
  },
  {
    name: 'Premium',
    price: 6,
    description: 'Best for growing communities',
    icon: <Crown className="h-6 w-6" />,
    color: 'text-discord-blurple',
    popular: true,
    features: [
      'Unlimited channels',
      'Advanced dashboard with analytics',
      'Pin protection',
      'Role & user exclusions',
      'Priority support',
      'Custom expiration times',
      'Bulk channel management',
      'Webhook notifications',
    ],
  },
];

export function PricingSection() {
  const [selectedTier, setSelectedTier] = useState<PricingTier | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleUpgrade = async (tier: PricingTier) => {
    if (tier.price === 0) return;

    setIsProcessing(true);
    try {
      // This would integrate with your backend payment API
      const response = await fetch('/api/payments/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('auth-token')}`,
        },
        body: JSON.stringify({
          serverId: 'selected-server-id', // This would come from user selection
          tier: tier.name.toLowerCase(),
        }),
      });

      const { checkout_url } = await response.json();
      window.location.href = checkout_url;
    } catch (error) {
      console.error('Payment error:', error);
      alert('Payment processing failed. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <section id="pricing" className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
        >
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            Simple, Affordable Pricing
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Start free, upgrade when you need more channels. No hidden fees,
            cancel anytime.
          </p>
        </motion.div>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {pricingTiers.map((tier, index) => (
            <motion.div
              key={tier.name}
              className={`relative rounded-2xl p-8 border-2 transition-all duration-300 ${
                tier.popular
                  ? 'border-discord-blurple shadow-2xl scale-105'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: index * 0.2 }}
              viewport={{ once: true }}
              whileHover={{ scale: 1.02 }}
            >
              {/* Popular Badge */}
              {tier.popular && (
                <motion.div
                  className="absolute -top-4 left-1/2 transform -translate-x-1/2"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.5 }}
                >
                  <span className="bg-discord-blurple text-white px-4 py-2 rounded-full text-sm font-medium flex items-center">
                    <Star className="h-4 w-4 mr-1" />
                    Most Popular
                  </span>
                </motion.div>
              )}

              {/* Header */}
              <div className="text-center mb-8">
                <div
                  className={`inline-flex items-center justify-center w-12 h-12 rounded-full bg-gray-100 mb-4 ${tier.color}`}
                >
                  {tier.icon}
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">
                  {tier.name}
                </h3>
                <p className="text-gray-600 mb-4">{tier.description}</p>
                <div className="flex items-baseline justify-center">
                  <span className="text-5xl font-bold text-gray-900">
                    ${tier.price}
                  </span>
                  <span className="text-gray-500 ml-2">/month</span>
                </div>
              </div>

              {/* Features */}
              <ul className="space-y-4 mb-8">
                {tier.features.map((feature, featureIndex) => (
                  <motion.li
                    key={feature}
                    className="flex items-center"
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.8 + featureIndex * 0.1 }}
                    viewport={{ once: true }}
                  >
                    <Check className="h-5 w-5 text-discord-green mr-3 flex-shrink-0" />
                    <span className="text-gray-700">{feature}</span>
                  </motion.li>
                ))}
              </ul>

              {/* CTA Button */}
              <AnimatedButton
                className="w-full"
                variant={tier.popular ? 'default' : 'outline'}
                size="lg"
                loading={isProcessing && selectedTier?.name === tier.name}
                onClick={() => {
                  setSelectedTier(tier);
                  handleUpgrade(tier);
                }}
              >
                {tier.price === 0 ? 'Current Plan' : 'Upgrade Now'}
              </AnimatedButton>
            </motion.div>
          ))}
        </div>

        {/* FAQ Section */}
        <motion.div
          className="mt-20 text-center"
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
        >
          <h3 className="text-2xl font-bold text-gray-900 mb-8">
            Frequently Asked Questions
          </h3>
          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <div className="text-left">
              <h4 className="font-semibold text-gray-900 mb-2">
                Can I cancel anytime?
              </h4>
              <p className="text-gray-600">
                Yes, you can cancel your subscription at any time. No questions
                asked.
              </p>
            </div>
            <div className="text-left">
              <h4 className="font-semibold text-gray-900 mb-2">
                What payment methods do you accept?
              </h4>
              <p className="text-gray-600">
                We accept all major credit cards, PayPal, and other secure
                payment methods.
              </p>
            </div>
            <div className="text-left">
              <h4 className="font-semibold text-gray-900 mb-2">
                Is my data secure?
              </h4>
              <p className="text-gray-600">
                Absolutely. We use industry-standard encryption and never store
                sensitive Discord data.
              </p>
            </div>
            <div className="text-left">
              <h4 className="font-semibold text-gray-900 mb-2">
                Do you offer refunds?
              </h4>
              <p className="text-gray-600">
                Yes, we offer a 30-day money-back guarantee for all premium
                subscriptions.
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
