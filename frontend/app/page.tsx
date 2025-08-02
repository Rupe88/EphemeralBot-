'use client';
import { motion } from 'framer-motion';
import { Navigation } from '../components/Navigation';
import { Hero } from '../components/Hero';
import { PricingSection } from '../components/PricingSection';
import {
  Bot,
  Clock,
  Shield,
  Zap,
  Check,
  Star,
  Users,
  TrendingUp,
  Zap as Lightning,
} from 'lucide-react';

export default function LandingPage() {
  const features = [
    {
      icon: <Clock className="h-8 w-8" />,
      title: 'Set & Forget',
      description:
        'Configure once and let EphemeralBot handle the rest. Messages are automatically deleted at the specified time.',
      color: 'text-discord-green',
      bgColor: 'bg-discord-green/10',
    },
    {
      icon: <Shield className="h-8 w-8" />,
      title: 'Keep Channels Clean',
      description:
        'No more old messages causing confusion or drama. Keep your Discord organized and focused on current conversations.',
      color: 'text-discord-blurple',
      bgColor: 'bg-discord-blurple/10',
    },
    {
      icon: <Zap className="h-8 w-8" />,
      title: 'Simple Setup',
      description:
        "Just use /expire setup #channel 24 and you're done! No complex configuration needed.",
      color: 'text-discord-yellow',
      bgColor: 'bg-discord-yellow/10',
    },
  ];

  const stats = [
    {
      number: '500+',
      label: 'Servers Using EphemeralBot',
      color: 'text-discord-blurple',
    },
    { number: '50K+', label: 'Messages Deleted', color: 'text-discord-green' },
    { number: '99.9%', label: 'Uptime', color: 'text-discord-fuchsia' },
    { number: '24/7', label: 'Support', color: 'text-discord-yellow' },
  ];

  return (
    <div className="min-h-screen">
      <Navigation />

      {/* Hero Section */}
      <Hero />

      {/* Features Section */}
      <section id="features" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              Why Choose EphemeralBot?
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              The perfect solution for Discord servers that want to keep
              conversations fresh and relevant.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                className="card text-center p-8"
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: index * 0.2 }}
                viewport={{ once: true }}
                whileHover={{ y: -10 }}
              >
                <div
                  className={`w-16 h-16 ${feature.bgColor} rounded-full flex items-center justify-center mx-auto mb-6 ${feature.color}`}
                >
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold mb-4">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 bg-gradient-to-r from-discord-blurple to-discord-fuchsia">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            className="grid grid-cols-2 md:grid-cols-4 gap-8"
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            {stats.map((stat, index) => (
              <motion.div
                key={stat.label}
                className="text-center text-white"
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                whileHover={{ scale: 1.05 }}
              >
                <div
                  className={`text-3xl md:text-4xl font-bold mb-2 ${stat.color}`}
                >
                  {stat.number}
                </div>
                <div className="text-white/80 text-sm md:text-base">
                  {stat.label}
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              How It Works
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Get started in just 3 simple steps
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                step: '1',
                title: 'Add Bot to Server',
                description:
                  'Click "Add to Discord" and authorize EphemeralBot in your server.',
                icon: <Bot className="h-8 w-8" />,
              },
              {
                step: '2',
                title: 'Setup Auto-Expiration',
                description:
                  'Use /expire setup #channel 24 to set up auto-deletion for 24 hours.',
                icon: <Zap className="h-8 w-8" />,
              },
              {
                step: '3',
                title: 'Sit Back & Relax',
                description:
                  'Messages are automatically deleted at the specified time. No manual work needed.',
                icon: <Shield className="h-8 w-8" />,
              },
            ].map((item, index) => (
              <motion.div
                key={item.step}
                className="text-center"
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: index * 0.2 }}
                viewport={{ once: true }}
              >
                <div className="relative">
                  <div className="w-16 h-16 bg-discord-blurple text-white rounded-full flex items-center justify-center mx-auto mb-6 text-2xl font-bold">
                    {item.step}
                  </div>
                  {index < 2 && (
                    <div className="hidden md:block absolute top-8 left-full w-full h-0.5 bg-discord-blurple/30 transform translate-x-4" />
                  )}
                </div>
                <div className="w-12 h-12 bg-discord-blurple/10 text-discord-blurple rounded-full flex items-center justify-center mx-auto mb-4">
                  {item.icon}
                </div>
                <h3 className="text-xl font-semibold mb-4">{item.title}</h3>
                <p className="text-gray-600">{item.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <PricingSection />

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-discord-blurple to-discord-fuchsia">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Ready to Clean Up Your Discord?
            </h2>
            <p className="text-xl text-white/80 mb-8 max-w-2xl mx-auto">
              Join thousands of Discord servers that are already using
              EphemeralBot to keep their channels organized.
            </p>
            <motion.div
              className="flex flex-col sm:flex-row gap-4 justify-center items-center"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              viewport={{ once: true }}
            >
              <button
                className="bg-white text-discord-blurple px-8 py-4 rounded-lg font-semibold text-lg hover:bg-gray-100 transition-colors"
                onClick={() => {
                  const url = `https://discord.com/api/oauth2/authorize?client_id=${process.env.NEXT_PUBLIC_DISCORD_CLIENT_ID}&permissions=8192&scope=bot%20applications.commands`;
                  window.open(url, '_blank');
                }}
              >
                Add to Discord - Free
              </button>
              <button
                className="border-2 border-white text-white px-8 py-4 rounded-lg font-semibold text-lg hover:bg-white hover:text-discord-blurple transition-colors"
                onClick={() =>
                  document
                    .getElementById('pricing')
                    ?.scrollIntoView({ behavior: 'smooth' })
                }
              >
                View Pricing
              </button>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-2 mb-4 md:mb-0">
              <Bot className="h-6 w-6 text-discord-blurple" />
              <span className="text-xl font-bold">EphemeralBot</span>
            </div>
            <div className="flex items-center space-x-6">
              <a
                href="#"
                className="text-gray-400 hover:text-white transition-colors"
              >
                Privacy Policy
              </a>
              <a
                href="#"
                className="text-gray-400 hover:text-white transition-colors"
              >
                Terms of Service
              </a>
              <a
                href="#"
                className="text-gray-400 hover:text-white transition-colors"
              >
                Support
              </a>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t border-gray-800 text-center text-gray-400">
            <p>&copy; 2024 EphemeralBot. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
