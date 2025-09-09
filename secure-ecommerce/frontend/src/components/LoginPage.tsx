import React from 'react';
import { useAuth0 } from '@auth0/auth0-react';

const LoginPage: React.FC = () => {
  const { loginWithRedirect, isAuthenticated } = useAuth0();

  React.useEffect(() => {
    if (isAuthenticated) {
      window.location.href = '/dashboard';
    }
  }, [isAuthenticated]);

  return (
    <div className="login-container">
      <div className="login-card">
        <img src="/logo.png" alt="SafeCart Logo" className="login-logo" />
        <h1>SafeCart</h1>
        <p>Bringing you the joy of shopping with the security you deserve</p>
        <button 
          onClick={() => loginWithRedirect()}
          className="login-btn"
        >
          Login / Sign Up
        </button>
      </div>
    </div>
  );
};

export default LoginPage;