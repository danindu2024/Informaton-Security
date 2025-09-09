// frontend/src/components/Dashboard.tsx
import React, { useState, useEffect } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import { userAPI, ordersAPI, optionsAPI, User, Order } from '../services/api';
import UserProfile from './UserProfile';
import OrderForm from './OrderForm';
import OrdersList from './OrdersList';

const Dashboard: React.FC = () => {
  const { logout, user: auth0User, isAuthenticated } = useAuth0();
  const [user, setUser] = useState<User | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [options, setOptions] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('orders');
  const [showProfile, setShowProfile] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!isAuthenticated) {
      window.location.href = '/login';
      return;
    }

    const fetchData = async () => {
      try {
        console.log('Fetching user data...');
        const [userProfile, userOrders, appOptions] = await Promise.all([
          userAPI.getProfile(),
          ordersAPI.getOrders(),
          optionsAPI.getOptions()
        ]);
        
        setUser(userProfile);
        setOrders(userOrders);
        setOptions(appOptions);
        console.log('Data loaded successfully');
      } catch (error: any) {
        console.error('Error fetching data:', error);
        setError(error.response?.data?.error || error.message || 'Failed to load data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [isAuthenticated]);

  const handleLogout = () => {
    localStorage.removeItem('auth0_token');
    logout({ 
      logoutParams: { 
        returnTo: window.location.origin 
      }
    });
  };

  const handleOrderCreated = (newOrder: Order) => {
    setOrders(prev => [newOrder, ...prev]);
    setActiveTab('orders'); // Switch to orders tab after creating
  };

  const handleProfileUpdate = (updatedUser: User) => {
    setUser(updatedUser);
  };

  const toggleProfile = () => {
    setShowProfile(!showProfile);
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(part => part.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  if (loading) {
    return (
      <div className="dashboard">
        <div className="loading">
          <div className="loading-spinner">
            <div className="spinner"></div>
            <p>Loading dashboard...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="dashboard">
        <div className="error-container">
          <div className="error-message">
            <h3>Error Loading Dashboard</h3>
            <p>{error}</p>
            <button onClick={() => window.location.reload()} className="retry-btn">
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <div className="logo-section">
          <img src="/logo_white.png" alt="SafeCart Logo" className="dashboard-logo" />
          <h1>SafeCart</h1>
        </div>
        <div className="user-info">
          <div className="profile-section">
            <button 
              onClick={toggleProfile} 
              className="profile-icon-btn"
              title="View Profile"
            >
              <div className="profile-avatar">
                {auth0User?.picture ? (
                  <img src={auth0User.picture} alt="Profile" />
                ) : (
                  <div className="avatar-initials">
                    {getInitials(auth0User?.name || user?.name || 'User')}
                  </div>
                )}
              </div>
              <span className="profile-name">{auth0User?.name || user?.name}</span>
            </button>
            
            {showProfile && (
              <div className="profile-dropdown">
                <div className="profile-dropdown-content">
                  <div className="profile-info">
                    <strong>{user?.name}</strong>
                    <p>{user?.email}</p>
                  </div>
                  <button 
                    onClick={() => {
                      setActiveTab('profile');
                      setShowProfile(false);
                    }}
                    className="profile-edit-btn"
                  >
                    Edit Profile
                  </button>
                </div>
              </div>
            )}
          </div>
          
          <button onClick={handleLogout} className="logout-btn">
            Logout
          </button>
        </div>
      </header>

      <nav className="dashboard-nav">
        <button 
          className={activeTab === 'order' ? 'active' : ''}
          onClick={() => setActiveTab('order')}
        >
          New Order
        </button>
        <button 
          className={activeTab === 'orders' ? 'active' : ''}
          onClick={() => setActiveTab('orders')}
        >
          My Orders ({orders.length})
        </button>
      </nav>

      <main className="dashboard-content">
        {activeTab === 'profile' && user && (
          <UserProfile user={user} onUpdate={handleProfileUpdate} />
        )}
        {activeTab === 'order' && options && (
          <OrderForm 
            options={options} 
            onOrderCreated={handleOrderCreated}
          />
        )}
        {activeTab === 'orders' && (
          <OrdersList orders={orders} />
        )}
      </main>
    </div>
  );
};

export default Dashboard;