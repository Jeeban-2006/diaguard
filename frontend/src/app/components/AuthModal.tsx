import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';

interface AuthModalProps {
  open: boolean;
  mode: 'login' | 'signup';
  onClose: () => void;
  onSuccess?: (user: any) => void;
}

export default function AuthModal({ open, mode, onClose, onSuccess }: AuthModalProps) {
  const [localMode, setLocalMode] = useState<'login' | 'signup'>(mode);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLocalMode(mode);
    setError(null);
  }, [mode, open]);

  useEffect(() => {
    if (!open) {
      setName('');
      setEmail('');
      setPassword('');
      setConfirm('');
      setError(null);
      setLoading(false);
    }
  }, [open]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email || !password || (localMode === 'signup' && !name)) {
      setError('Please complete all required fields.');
      return;
    }

    if (localMode === 'signup' && password !== confirm) {
      setError('Passwords do not match.');
      return;
    }

    // Simulate request
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      const user = { name: name || 'User', email };
      onSuccess?.(user);
    }, 900);
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-6"
        >
          <motion.div
            initial={{ y: 30, scale: 0.98 }}
            animate={{ y: 0, scale: 1 }}
            exit={{ y: 30, scale: 0.98 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="w-full max-w-md bg-white rounded-2xl shadow-2xl p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-2xl font-semibold">{localMode === 'login' ? 'Sign In' : 'Create account'}</h3>
              <div className="flex gap-2">
                <button
                  onClick={() => setLocalMode(localMode === 'login' ? 'signup' : 'login')}
                  className="text-sm text-blue-600 hover:underline"
                >
                  {localMode === 'login' ? 'Create account' : 'Sign in'}
                </button>
                <button onClick={onClose} className="text-gray-500 hover:text-gray-700">Close</button>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="flex flex-col gap-3">
              {localMode === 'signup' && (
                <input
                  aria-label="Name"
                  placeholder="Full name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-200"
                />
              )}

              <input
                aria-label="Email"
                placeholder="Email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-200"
              />

              <input
                aria-label="Password"
                placeholder="Password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-200"
              />

              {localMode === 'signup' && (
                <input
                  aria-label="Confirm password"
                  placeholder="Confirm password"
                  type="password"
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-200"
                />
              )}

              {error && <div className="text-sm text-red-600">{error}</div>}

              <div className="flex items-center justify-between mt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 px-4 py-3 bg-gradient-to-r from-blue-600 to-green-600 text-white rounded-lg hover:opacity-95"
                >
                  {loading ? 'Processing...' : localMode === 'login' ? 'Sign In' : 'Create account'}
                </button>
              </div>

              <p className="text-xs text-gray-500 mt-3">
                By continuing you agree to our Terms of Service and Privacy Policy.
              </p>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
