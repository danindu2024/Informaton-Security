// frontend/src/App.tsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { useAuth0 } from '@auth0/auth0-react';
import Auth0ProviderWithHistory from './auth/Auth0ProviderWithHistory';
import LoginPage from './components/LoginPage';
import Dashboard from './components/Dashboard';
import Loading from './components/Loading';
import './App.css';

const AppContent: React.FC = () => {
  const { isLoading, isAuthenticated, getAccessTokenSilently } = useAuth0();

  React.useEffect(() => {
    const saveToken = async () => {
      if (isAuthenticated) {
        try {
          const token = await getAccessTokenSilently({
            authorizationParams: {
              audience: process.env.REACT_APP_AUTH0_AUDIENCE,
              scope: 'openid profile email'
            }
          });
          localStorage.setItem('auth0_token', token);
        } catch (error) {
          console.error('Error getting token:', error);
        }
      }
    };
    saveToken();
  }, [isAuthenticated, getAccessTokenSilently]);

  if (isLoading) {
    return <Loading />;
  }

  return (
    <div className="App">
      <Router>
        <Routes>
          <Route 
            path="/" 
            element={isAuthenticated ? <Dashboard /> : <LoginPage />} 
          />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/callback" element={<Loading />} />
        </Routes>
      </Router>
    </div>
  );
};

const App: React.FC = () => {
  return (
    <Auth0ProviderWithHistory>
      <AppContent />
    </Auth0ProviderWithHistory>
  );
};

export default App;