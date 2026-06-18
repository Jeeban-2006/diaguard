import { supabase } from '@/lib/supabase';
import type { Profile } from '@/lib/supabase';

export interface AuthError {
  message: string;
  code?: string;
}

export interface AuthResult {
  success: boolean;
  error?: AuthError;
}

export async function getCurrentUser() {
  const { data: { user } } = await supabase.auth.getUser();
  return user;
}

export async function getProfile(userId: string): Promise<Profile | null> {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();
  if (error || !data) return null;
  return data as Profile;
}

export interface UpdateProfileInput {
  full_name?: string | null;
}

export async function updateProfile(userId: string, input: UpdateProfileInput): Promise<AuthResult> {
  try {
    const { error } = await supabase
      .from('profiles')
      .update(input)
      .eq('id', userId);
    if (error) return { success: false, error: { message: error.message } };
    return { success: true };
  } catch (error) {
    return { success: false, error: { message: 'Failed to update profile' } };
  }
}

/**
 * Sign up a new user and create their profile
 */
export async function signUp(email: string, password: string): Promise<AuthResult> {
  try {
    // 1. Create auth user
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
    });

    if (authError) {
      return { success: false, error: { message: authError.message, code: authError.code } };
    }

    if (!authData.user) {
      return { success: false, error: { message: 'Failed to create user' } };
    }

    // 2. Create profile (with conflict handling)
    const { error: profileError } = await supabase
      .from('profiles')
      .upsert(
        {
          id: authData.user.id,
          email: authData.user.email,
          created_at: new Date().toISOString(),
        },
        {
          onConflict: 'id',
          ignoreDuplicates: false,
        }
      );

    if (profileError) {
      console.error('Profile creation error:', profileError);
      // Don't fail the signup if profile creation fails - it can be retried
    }

    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: { message: 'An unexpected error occurred during signup' },
    };
  }
}

/**
 * Sign in an existing user
 */
export async function signIn(email: string, password: string): Promise<AuthResult> {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      return { success: false, error: { message: error.message, code: error.code } };
    }

    if (!data.user) {
      return { success: false, error: { message: 'Login failed' } };
    }

    // Ensure profile exists (in case it wasn't created during signup)
    await ensureProfileExists(data.user.id, data.user.email || '');

    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: { message: 'An unexpected error occurred during login' },
    };
  }
}

/**
 * Sign out the current user
 */
export async function signOut(): Promise<AuthResult> {
  try {
    const { error } = await supabase.auth.signOut();

    if (error) {
      return { success: false, error: { message: error.message } };
    }

    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: { message: 'An unexpected error occurred during logout' },
    };
  }
}

/**
 * Request password reset email
 */
export async function resetPassword(email: string): Promise<AuthResult> {
  try {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: window.location.origin,
    });

    if (error) {
      return { success: false, error: { message: error.message } };
    }

    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: { message: 'An unexpected error occurred while requesting password reset' },
    };
  }
}

/**
 * Update user password (used during recovery flow)
 */
export async function updatePassword(password: string): Promise<AuthResult> {
  try {
    const { error } = await supabase.auth.updateUser({ password });
    if (error) {
      return { success: false, error: { message: error.message } };
    }
    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: { message: 'An unexpected error occurred while updating password' },
    };
  }
}

/**
 * Ensure a profile exists for a user
 */
async function ensureProfileExists(userId: string, email: string): Promise<void> {
  const { error } = await supabase
    .from('profiles')
    .upsert(
      {
        id: userId,
        email,
        created_at: new Date().toISOString(),
      },
      {
        onConflict: 'id',
        ignoreDuplicates: true,
      }
    );

  if (error) {
    console.error('Error ensuring profile exists:', error);
  }
}

/**
 * Get user-friendly error message
 */
export function getAuthErrorMessage(error: AuthError): string {
  const errorMessages: Record<string, string> = {
    'Invalid login credentials': 'Invalid email or password',
    'User already registered': 'This email is already registered',
    'Email not confirmed': 'Please confirm your email before logging in',
    'Password should be at least 6 characters': 'Password must be at least 6 characters',
  };

  return errorMessages[error.message] || error.message || 'An error occurred';
}