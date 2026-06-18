import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { User, LogOut, Pencil, X, Check } from 'lucide-react';
import { getCurrentUser, getProfile, updateProfile, signOut } from '@/services/authService';
import type { Profile } from '@/lib/supabase';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';

export default function ProfilePage() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [fullName, setFullName] = useState('');
  const [saveLoading, setSaveLoading] = useState(false);
  const [error, setError] = useState('');
  const [logoutLoading, setLogoutLoading] = useState(false);

  useEffect(() => {
    loadProfile();
  }, []);

  async function loadProfile() {
    setLoading(true);
    setError('');
    const user = await getCurrentUser();
    if (!user) {
      navigate('/login');
      return;
    }
    const p = await getProfile(user.id);
    setProfile(p || null);
    setFullName(p?.full_name ?? '');
    setLoading(false);
  }

  async function handleSave() {
    const user = await getCurrentUser();
    if (!user) return;
    setSaveLoading(true);
    setError('');
    const result = await updateProfile(user.id, { full_name: fullName || null });
    if (result.success) {
      setProfile((prev) => (prev ? { ...prev, full_name: fullName || null, updated_at: new Date().toISOString() } : null));
      setEditing(false);
    } else {
      setError(result.error?.message ?? 'Update failed');
    }
    setSaveLoading(false);
  }

  async function handleLogout() {
    setLogoutLoading(true);
    const result = await signOut();
    if (result.success) {
      navigate('/login');
    } else {
      setError(result.error?.message ?? 'Logout failed');
    }
    setLogoutLoading(false);
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full"
        />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
        <p className="text-gray-600">Unable to load profile.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <div className="max-w-2xl mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl shadow-xl overflow-hidden"
        >
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-6 text-white">
            <div className="flex items-center justify-between">
              <h1 className="text-2xl font-bold">Profile</h1>
              <Button
                variant="ghost"
                size="icon"
                className="text-white hover:bg-white/20"
                onClick={() => navigate('/dashboard')}
              >
                <X className="w-5 h-5" />
              </Button>
            </div>
          </div>

          <div className="p-6 space-y-6">
            {error && (
              <div className="rounded-lg bg-red-50 text-red-700 px-4 py-3 text-sm">
                {error}
              </div>
            )}

            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
                <User className="w-8 h-8 text-white" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Email</p>
                <p className="font-medium text-gray-900">{profile.email}</p>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Display name</label>
              {editing ? (
                <div className="flex gap-2">
                  <Input
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Your name"
                    className="flex-1"
                  />
                  <Button onClick={handleSave} disabled={saveLoading}>
                    <Check className="w-4 h-4" />
                  </Button>
                  <Button variant="outline" onClick={() => { setEditing(false); setFullName(profile.full_name ?? ''); }}>
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <p className="flex-1 text-gray-900">{profile.full_name || '—'}</p>
                  <Button variant="outline" size="icon" onClick={() => setEditing(true)}>
                    <Pencil className="w-4 h-4" />
                  </Button>
                </div>
              )}
            </div>

            <div>
              <p className="text-sm text-gray-500">Member since</p>
              <p className="text-gray-900">
                {new Date(profile.created_at).toLocaleDateString(undefined, {
                  dateStyle: 'long',
                })}
              </p>
            </div>

            <div className="pt-4 border-t">
              <Button
                variant="destructive"
                className="w-full"
                onClick={handleLogout}
                disabled={logoutLoading}
              >
                <LogOut className="w-4 h-4" />
                {logoutLoading ? 'Signing out…' : 'Sign out'}
              </Button>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
