'use client';
import { motion } from 'framer-motion';
import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { Bot, ArrowRight, Sparkles } from 'lucide-react';
import { AnimatedButton } from './ui/Button';

export function Hero() {
  const heroRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    if (heroRef.current && textRef.current) {
      const tl = gsap.timeline();

      tl.fromTo(
        textRef.current,
        { y: 100, opacity: 0 },
        { y: 0, opacity: 1, duration: 1, ease: 'power3.out' }
      );

      tl.fromTo(
        '.hero-feature',
        { y: 50, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.8, stagger: 0.2, ease: 'power2.out' },
        '-=0.5'
      );
    }
  }, []);

  return (
    <section
      ref={heroRef}
      className="relative min-h-screen flex items-center justify-center overflow-hidden"
    >
      {/* Animated Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
        <motion.div
          className="absolute top-20 left-20 w-72 h-72 bg-discord-blurple/10 rounded-full blur-3xl"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.6, 0.3],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
        <motion.div
          className="absolute bottom-20 right-20 w-96 h-96 bg-discord-green/10 rounded-full blur-3xl"
          animate={{
            scale: [1.2, 1, 1.2],
            opacity: [0.4, 0.7, 0.4],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        {/* Main Heading */}
        <motion.h1
          ref={textRef}
          className="text-6xl md:text-8xl font-bold text-gray-900 mb-8"
          initial={{ opacity: 0, y: 100 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: [0.25, 0.46, 0.45, 0.94] }}
        >
          <span className="bg-gradient-to-r from-discord-blurple via-purple-600 to-discord-fuchsia bg-clip-text text-transparent">
            Snapchat
          </span>
          <br />
          <span className="text-gray-900">for Discord</span>
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          className="text-xl md:text-2xl text-gray-600 mb-12 max-w-3xl mx-auto hero-feature"
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
        >
          Auto-delete Discord messages after 1h, 6h, 24h, or 7 days. Keep your
          channels clean and organized without the clutter.
        </motion.p>

        {/* CTA Buttons */}
        <motion.div
          className="flex flex-col sm:flex-row gap-6 justify-center items-center mb-16 hero-feature"
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.5 }}
        >
          <AnimatedButton
            size="xl"
            className="group relative overflow-hidden"
            onClick={() => {
              const url = `https://discord.com/api/oauth2/authorize?client_id=${process.env.NEXT_PUBLIC_DISCORD_CLIENT_ID}&permissions=8192&scope=bot%20applications.commands`;
              window.open(url, '_blank');
            }}
          >
            <Bot className="mr-3 h-6 w-6" />
            Add to Discord - Free
            <ArrowRight className="ml-3 h-5 w-5 group-hover:translate-x-1 transition-transform" />
          </AnimatedButton>

          <AnimatedButton
            variant="outline"
            size="xl"
            onClick={() =>
              document
                .getElementById('pricing')
                ?.scrollIntoView({ behavior: 'smooth' })
            }
          >
            <Sparkles className="mr-3 h-5 w-5" />
            View Pricing - $6/month
          </AnimatedButton>
        </motion.div>

        {/* Stats */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto hero-feature"
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.7 }}
        >
          <motion.div
            className="text-center"
            whileHover={{ scale: 1.05 }}
            transition={{ type: 'spring', stiffness: 400, damping: 17 }}
          >
            <div className="text-3xl font-bold text-discord-blurple mb-2">
              500+
            </div>
            <div className="text-gray-600">Servers Using EphemeralBot</div>
          </motion.div>

          <motion.div
            className="text-center"
            whileHover={{ scale: 1.05 }}
            transition={{ type: 'spring', stiffness: 400, damping: 17 }}
          >
            <div className="text-3xl font-bold text-discord-green mb-2">
              50K+
            </div>
            <div className="text-gray-600">Messages Deleted</div>
          </motion.div>

          <motion.div
            className="text-center"
            whileHover={{ scale: 1.05 }}
            transition={{ type: 'spring', stiffness: 400, damping: 17 }}
          >
            <div className="text-3xl font-bold text-discord-fuchsia mb-2">
              99.9%
            </div>
            <div className="text-gray-600">Uptime</div>
          </motion.div>
        </motion.div>
      </div>

      {/* Floating Elements */}
      <motion.div
        className="absolute top-1/4 left-10 w-20 h-20 bg-discord-blurple/20 rounded-full"
        animate={{
          y: [0, -20, 0],
          rotate: [0, 360],
        }}
        transition={{
          y: { duration: 3, repeat: Infinity, ease: 'easeInOut' },
          rotate: { duration: 20, repeat: Infinity, ease: 'linear' },
        }}
      />

      <motion.div
        className="absolute bottom-1/4 right-10 w-16 h-16 bg-discord-green/20 rounded-full"
        animate={{
          y: [0, 20, 0],
          rotate: [360, 0],
        }}
        transition={{
          y: { duration: 4, repeat: Infinity, ease: 'easeInOut' },
          rotate: { duration: 15, repeat: Infinity, ease: 'linear' },
        }}
      />
    </section>
  );
}
