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
  const [activeTab, setActiveTab] = useState('profile');

  useEffect(() => {
    if (!isAuthenticated) {
      window.location.href = '/login';
      return;
    }

    const fetchData = async () => {
      try {
        const [userProfile, userOrders, appOptions] = await Promise.all([
          userAPI.getProfile(),
          ordersAPI.getOrders(),
          optionsAPI.getOptions()
        ]);
        
        setUser(userProfile);
        setOrders(userOrders);
        setOptions(appOptions);
      } catch (error) {
        console.error('Error fetching data:', error);
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
      returnTo: window.location.origin,
    },
  });
};

  const handleOrderCreated = (newOrder: Order) => {
    setOrders(prev => [newOrder, ...prev]);
  };

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <h1>Secure E-commerce Dashboard</h1>
        <div className="user-info">
          <span>Welcome, {auth0User?.name}</span>
          <button onClick={handleLogout} className="logout-btn">
            Logout
          </button>
        </div>
      </header>

      <nav className="dashboard-nav">
        <button 
          className={activeTab === 'profile' ? 'active' : ''}
          onClick={() => setActiveTab('profile')}
        >
          Profile
        </button>
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
          My Orders
        </button>
      </nav>

      <main className="dashboard-content">
        {activeTab === 'profile' && user && (
          <UserProfile user={user} onUpdate={setUser} />
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