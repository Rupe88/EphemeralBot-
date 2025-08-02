'use client';
import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { Bot, ArrowRight } from 'lucide-react';
import { AnimatedButton } from '../../components/ui/Button';

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    // Check if user is already authenticated
    const token = localStorage.getItem('auth-token');
    if (token) {
      router.push('/dashboard');
      return;
    }

    // Handle OAuth callback
    const code = searchParams.get('code');
    if (code) {
      handleOAuthCallback(code);
    }
  }, [searchParams]);

  const handleOAuthCallback = async (code: string) => {
    try {
      const response = await fetch(
        `${
          process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'
        }/api/auth/callback?code=${code}`
      );

      if (response.ok) {
        const { token, user } = await response.json();
        localStorage.setItem('auth-token', token);
        router.push('/dashboard');
      } else {
        console.error('OAuth callback failed');
        router.push('/login?error=auth_failed');
      }
    } catch (error) {
      console.error('OAuth callback error:', error);
      router.push('/login?error=auth_failed');
    }
  };

  const handleDiscordLogin = () => {
    const clientId = process.env.NEXT_PUBLIC_DISCORD_CLIENT_ID;
    const redirectUri = `${window.location.origin}/login`;
    const scope = 'identify guilds';

    const authUrl = `https://discord.com/api/oauth2/authorize?client_id=${clientId}&redirect_uri=${encodeURIComponent(
      redirectUri
    )}&response_type=code&scope=${encodeURIComponent(scope)}`;

    window.location.href = authUrl;
  };

  const error = searchParams.get('error');

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center">
      <div className="max-w-md w-full mx-auto px-4">
        <motion.div
          className="bg-white rounded-2xl shadow-xl p-8"
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* Logo */}
          <div className="text-center mb-8">
            <motion.div
              className="inline-flex items-center justify-center w-16 h-16 bg-discord-blurple rounded-full mb-4"
              whileHover={{ scale: 1.1 }}
              transition={{ type: 'spring', stiffness: 400, damping: 17 }}
            >
              <Bot className="h-8 w-8 text-white" />
            </motion.div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Welcome to EphemeralBot
            </h1>
            <p className="text-gray-600">
              Manage your Discord message expiration rules
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <motion.div
              className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
            >
              <p className="text-red-700 text-sm">
                {error === 'auth_failed'
                  ? 'Authentication failed. Please try again.'
                  : 'An error occurred. Please try again.'}
              </p>
            </motion.div>
          )}

          {/* Login Button */}
          <AnimatedButton
            className="w-full mb-6"
            size="lg"
            onClick={handleDiscordLogin}
          >
            <Bot className="mr-3 h-5 w-5" />
            Continue with Discord
            <ArrowRight className="ml-3 h-5 w-5" />
          </AnimatedButton>

          {/* Features */}
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-discord-green/10 rounded-full flex items-center justify-center">
                <Bot className="h-4 w-4 text-discord-green" />
              </div>
              <span className="text-sm text-gray-600">
                Manage message expiration rules
              </span>
            </div>

            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-discord-blurple/10 rounded-full flex items-center justify-center">
                <Bot className="h-4 w-4 text-discord-blurple" />
              </div>
              <span className="text-sm text-gray-600">
                View server statistics and analytics
              </span>
            </div>

            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-discord-fuchsia/10 rounded-full flex items-center justify-center">
                <Bot className="h-4 w-4 text-discord-fuchsia" />
              </div>
              <span className="text-sm text-gray-600">
                Upgrade to premium for unlimited channels
              </span>
            </div>
          </div>

          {/* Footer */}
          <div className="mt-8 pt-6 border-t border-gray-200 text-center">
            <p className="text-xs text-gray-500">
              By continuing, you agree to our{' '}
              <a href="#" className="text-discord-blurple hover:underline">
                Terms of Service
              </a>{' '}
              and{' '}
              <a href="#" className="text-discord-blurple hover:underline">
                Privacy Policy
              </a>
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
