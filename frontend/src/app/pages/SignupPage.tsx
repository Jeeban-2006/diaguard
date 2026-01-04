import React from 'react';
import { useNavigate } from 'react-router-dom';
import AuthModal from '../components/AuthModal';

export default function SignupPage() {
  const navigate = useNavigate();

  return (
    <AuthModal
      open={true}
      mode="signup"
      onClose={() => navigate('/')}
      onSuccess={() => navigate('/')}
    />
  );
}
