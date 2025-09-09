import React, { useState } from 'react';
import { ordersAPI, CreateOrderData, Order } from '../services/api';

interface OrderFormProps {
  options: {
    deliveryTimes: string[];
    locations: string[];
    products: string[];
  };
  onOrderCreated: (order: Order) => void;
}

const OrderForm: React.FC<OrderFormProps> = ({ options, onOrderCreated }) => {
  const [formData, setFormData] = useState<CreateOrderData>({
    purchaseDate: '',
    deliveryTime: '',
    deliveryLocation: '',
    productName: '',
    quantity: 1,
    message: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'quantity' ? parseInt(value) || 1 : value
    }));
  };

  const getMinDate = () => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  };

  const isSunday = (dateString: string) => {
    const date = new Date(dateString);
    return date.getDay() === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    // Client-side validation
    if (isSunday(formData.purchaseDate)) {
      setError('Delivery is not available on Sundays. Please select another date.');
      setLoading(false);
      return;
    }

    const selectedDate = new Date(formData.purchaseDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (selectedDate < today) {
      setError('Purchase date cannot be in the past.');
      setLoading(false);
      return;
    }

    try {
      const order = await ordersAPI.createOrder(formData);
      onOrderCreated(order);
      setSuccess('Order created successfully!');
      
      // Reset form
      setFormData({
        purchaseDate: '',
        deliveryTime: '',
        deliveryLocation: '',
        productName: '',
        quantity: 1,
        message: ''
      });
    } catch (error: any) {
      setError(error.response?.data?.error || 'Failed to create order');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="order-form">
      <h2>Create New Order</h2>

      {error && (
        <div className="error-message">
          {error}
        </div>
      )}

      {success && (
        <div className="success-message">
          {success}
        </div>
      )}

      <form onSubmit={handleSubmit} className="form">
        <div className="form-group">
          <label htmlFor="purchaseDate">Purchase Date *</label>
          <input
            type="date"
            id="purchaseDate"
            name="purchaseDate"
            value={formData.purchaseDate}
            onChange={handleInputChange}
            min={getMinDate()}
            required
            className="form-input"
          />
          <small className="form-hint">Note: Delivery not available on Sundays</small>
        </div>

        <div className="form-group">
          <label htmlFor="deliveryTime">Preferred Delivery Time *</label>
          <select
            id="deliveryTime"
            name="deliveryTime"
            value={formData.deliveryTime}
            onChange={handleInputChange}
            required
            className="form-select"
          >
            <option value="">Select delivery time</option>
            {options.deliveryTimes.map(time => (
              <option key={time} value={time}>{time}</option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="deliveryLocation">Delivery Location *</label>
          <select
            id="deliveryLocation"
            name="deliveryLocation"
            value={formData.deliveryLocation}
            onChange={handleInputChange}
            required
            className="form-select"
          >
            <option value="">Select location</option>
            {options.locations.map(location => (
              <option key={location} value={location}>{location}</option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="productName">Product *</label>
          <select
            id="productName"
            name="productName"
            value={formData.productName}
            onChange={handleInputChange}
            required
            className="form-select"
          >
            <option value="">Select product</option>
            {options.products.map(product => (
              <option key={product} value={product}>{product}</option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="quantity">Quantity *</label>
          <input
            type="number"
            id="quantity"
            name="quantity"
            value={formData.quantity}
            onChange={handleInputChange}
            min="1"
            max="100"
            required
            className="form-input"
          />
        </div>

        <div className="form-group">
          <label htmlFor="message">Message (Optional)</label>
          <textarea
            id="message"
            name="message"
            value={formData.message}
            onChange={handleInputChange}
            placeholder="Any special instructions or notes..."
            maxLength={500}
            rows={4}
            className="form-textarea"
          />
          <small className="form-hint">{(formData.message ?? '').length}/500 characters</small>
        </div>

        <button 
          type="submit" 
          disabled={loading}
          className="submit-btn"
        >
          {loading ? 'Creating Order...' : 'Create Order'}
        </button>
      </form>
    </div>
  );
};

export default OrderForm;