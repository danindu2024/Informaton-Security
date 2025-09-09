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
        <h1>Secure E-commerce</h1>
        <p>Welcome to our secure shopping platform</p>
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