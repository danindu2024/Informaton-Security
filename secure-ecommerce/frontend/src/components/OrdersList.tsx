import React, { useState, useMemo } from 'react';
import { Order } from '../services/api';

interface OrdersListProps {
  orders: Order[];
}

const OrdersList: React.FC<OrdersListProps> = ({ orders }) => {
  const [filter, setFilter] = useState<'all' | 'past' | 'upcoming'>('all');
  const [sortBy, setSortBy] = useState<'date' | 'status'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  const filteredAndSortedOrders = useMemo(() => {
    let filtered = orders;

    // Filter orders
    if (filter !== 'all') {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      filtered = orders.filter(order => {
        const orderDate = new Date(order.purchaseDate);
        orderDate.setHours(0, 0, 0, 0);

        if (filter === 'past') {
          return orderDate < today || order.status === 'delivered';
        } else {
          return orderDate >= today && order.status !== 'delivered';
        }
      });
    }

    // Sort orders
    const sorted = [...filtered].sort((a, b) => {
      let comparison = 0;

      if (sortBy === 'date') {
        const dateA = new Date(a.purchaseDate);
        const dateB = new Date(b.purchaseDate);
        comparison = dateA.getTime() - dateB.getTime();
      } else {
        comparison = a.status.localeCompare(b.status);
      }

      return sortOrder === 'asc' ? comparison : -comparison;
    });

    return sorted;
  }, [orders, filter, sortBy, sortOrder]);

  const getStatusBadge = (status: string) => {
    const statusClasses = {
      pending: 'status-pending',
      processing: 'status-processing',
      shipped: 'status-shipped',
      delivered: 'status-delivered'
    };

    return (
      <span className={`status-badge ${statusClasses[status as keyof typeof statusClasses]}`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const isUpcoming = (dateString: string, status: string) => {
    const orderDate = new Date(dateString);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    orderDate.setHours(0, 0, 0, 0);

    return orderDate >= today && status !== 'delivered';
  };

  return (
    <div className="orders-list">
      <div className="orders-header">
        <h2>My Orders</h2>
        <div className="orders-stats">
          <span className="stat">
            Total Orders: <strong>{orders.length}</strong>
          </span>
        </div>
      </div>

      <div className="orders-controls">
        <div className="filter-controls">
          <label htmlFor="filter">Filter:</label>
          <select
            id="filter"
            value={filter}
            onChange={(e) => setFilter(e.target.value as any)}
            className="form-select"
          >
            <option value="all">All Orders</option>
            <option value="upcoming">Upcoming Deliveries</option>
            <option value="past">Past Orders</option>
          </select>
        </div>

        <div className="sort-controls">
          <label htmlFor="sortBy">Sort by:</label>
          <select
            id="sortBy"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="form-select"
          >
            <option value="date">Date</option>
            <option value="status">Status</option>
          </select>
          
          <button
            onClick={() => setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc')}
            className="sort-order-btn"
            title={`Sort ${sortOrder === 'asc' ? 'Descending' : 'Ascending'}`}
          >
            {sortOrder === 'asc' ? '↑' : '↓'}
          </button>
        </div>
      </div>

      {filteredAndSortedOrders.length === 0 ? (
        <div className="no-orders">
          <p>No orders found.</p>
          {filter !== 'all' && (
            <button 
              onClick={() => setFilter('all')}
              className="show-all-btn"
            >
              Show All Orders
            </button>
          )}
        </div>
      ) : (
        <div className="orders-grid">
          {filteredAndSortedOrders.map(order => (
            <div key={order._id} className="order-card">
              <div className="order-card-header">
                <div className="order-info">
                  <h3>{order.productName}</h3>
                  {getStatusBadge(order.status)}
                </div>
                {isUpcoming(order.purchaseDate, order.status) && (
                  <span className="upcoming-badge">Upcoming</span>
                )}
              </div>

              <div className="order-details">
                <div className="detail-row">
                  <span className="detail-label">Purchase Date:</span>
                  <span className="detail-value">{formatDate(order.purchaseDate)}</span>
                </div>

                <div className="detail-row">
                  <span className="detail-label">Delivery Time:</span>
                  <span className="detail-value">{order.deliveryTime}</span>
                </div>

                <div className="detail-row">
                  <span className="detail-label">Location:</span>
                  <span className="detail-value">{order.deliveryLocation}</span>
                </div>

                <div className="detail-row">
                  <span className="detail-label">Quantity:</span>
                  <span className="detail-value">{order.quantity}</span>
                </div>

                {order.message && (
                  <div className="detail-row">
                    <span className="detail-label">Message:</span>
                    <span className="detail-value message">{order.message}</span>
                  </div>
                )}

                <div className="detail-row">
                  <span className="detail-label">Order Date:</span>
                  <span className="detail-value">{formatDate(order.createdAt)}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default OrdersList;