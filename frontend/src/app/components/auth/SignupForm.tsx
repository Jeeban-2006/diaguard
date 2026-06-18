import React, { useState } from "react";
import { motion } from 'motion/react';
import { signUp, getAuthErrorMessage } from "@/services/authService";
import { supabase } from '@/lib/supabase';
import { Eye, EyeOff } from 'lucide-react';

interface SignupFormProps {
  onSuccess: () => void;
  onSwitchToLogin: () => void;
}

export default function SignupForm({
  onSuccess,
  onSwitchToLogin,
}: SignupFormProps) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [oauthLoading, setOauthLoading] = useState(false);

  const handleGoogleSignup = async () => {
    setOauthLoading(true);
    setError(null);
    const { error } = await supabase.auth.signInWithOAuth({ 
      provider: 'google', 
      options: { redirectTo: window.location.origin } 
    });
    if (error) {
      setError(error.message);
      setOauthLoading(false);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const result = await signUp(email, password);

    if (!result.success) {
      setError(getAuthErrorMessage(result.error));
      setLoading(false);
      return;
    }

    onSuccess(); // Call onSuccess() after successful signup
    setLoading(false);
  };

  return (
    <div className="w-full flex justify-center">
      <form onSubmit={handleSignup} className="w-full flex flex-col pt-4">

        <div className="space-y-4 mb-6">
          <div className="relative">
            <motion.input
              whileFocus={{ scale: 1.01 }}
              id="signup-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-5 py-3.5 rounded-full border border-gray-300 focus:ring-2 focus:ring-[#0B4635] focus:border-transparent transition-all outline-none text-[#1A1A1A] placeholder-gray-400 bg-white"
              placeholder="Full Name"
              disabled={loading}
              required
              style={{ color: '#1A1A1A' }}
            />
          </div>

          <div className="relative">
            <motion.input
              whileFocus={{ scale: 1.01 }}
              id="signup-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-5 py-3.5 rounded-full border border-gray-300 focus:ring-2 focus:ring-[#0B4635] focus:border-transparent transition-all outline-none text-[#1A1A1A] placeholder-gray-400 bg-white"
              placeholder="Email"
              disabled={loading}
              required
              style={{ color: '#1A1A1A' }}
            />
          </div>

          <div className="relative">
            <motion.input
              whileFocus={{ scale: 1.01 }}
              id="signup-password"
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-5 py-3.5 pr-12 rounded-full border border-gray-300 focus:ring-2 focus:ring-[#0B4635] focus:border-transparent transition-all outline-none text-[#1A1A1A] placeholder-gray-400 bg-white"
              placeholder="Create a password"
              disabled={loading}
              required
              style={{ color: '#1A1A1A' }}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none bg-white z-10"
              title={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? <Eye size={18} /> : <EyeOff size={18} />}
            </button>
          </div>
        </div>

        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm"
          >
            {error}
          </motion.div>
        )}

        <motion.button
          whileHover={{ scale: loading ? 1 : 1.02 }}
          whileTap={{ scale: loading ? 1 : 0.98 }}
          type="submit"
          disabled={loading}
          className="w-full py-3.5 px-4 bg-[#0B4635] text-white font-semibold rounded-full shadow-lg hover:shadow-xl hover:bg-[#083327] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center text-sm"
        >
          {loading ? (
            <>
              <svg className="animate-spin h-5 w-5 mr-2" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              Creating account...
            </>
          ) : (
            'Register'
          )}
        </motion.button>

        <div className="relative flex items-center justify-center mt-8 mb-6">
           <div className="absolute inset-0 flex items-center">
               <div className="w-full border-t border-gray-200"></div>
           </div>
           <div className="relative w-fit bg-white px-3 text-xs text-[#666666]">
               or continue with
           </div>
        </div>

        <div className="flex justify-center mb-8">
           <button 
              type="button" 
              onClick={handleGoogleSignup}
              disabled={oauthLoading || loading}
              className="flex items-center gap-2 px-6 py-2 rounded-full bg-white border border-gray-300 text-[#1A1A1A] font-semibold hover:bg-gray-50 transition-colors shadow-sm disabled:opacity-50"
           >
              {oauthLoading ? (
                <svg className="animate-spin h-5 w-5 text-gray-500" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
              ) : (
                <span className="font-bold text-xl">G</span>
              )}
              Continue with Google
           </button>
        </div>

        <p className="text-center text-xs font-semibold text-[#666666]">
          Already have an account?{' '}
          <button
            type="button"
            onClick={onSwitchToLogin}
            className="text-[#0B4635] hover:text-[#083327] font-bold"
            disabled={loading}
          >
            Sign in
          </button>
        </p>

      </form>
    </div>
  );
}
