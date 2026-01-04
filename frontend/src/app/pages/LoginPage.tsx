import React from 'react';
import { useNavigate } from 'react-router-dom';
import AuthModal from '../components/AuthModal';

export default function LoginPage() {
  const navigate = useNavigate();

  

  return (
    <AuthModal
      open={true}
      mode="login"
      onClose={() => navigate('/')}
      onSuccess={() => navigate('/')}
    />
  );
}
