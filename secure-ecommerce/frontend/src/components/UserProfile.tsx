import React, { useState } from 'react';
import { userAPI, User } from '../services/api';

interface UserProfileProps {
  user: User;
  onUpdate: (user: User) => void;
}

const UserProfile: React.FC<UserProfileProps> = ({ user, onUpdate }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    contactNumber: user.contactNumber || '',
    country: user.country || ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const updatedUser = await userAPI.updateProfile(formData);
      onUpdate(updatedUser);
      setIsEditing(false);
    } catch (error: any) {
      setError(error.response?.data?.error || 'Update failed');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      contactNumber: user.contactNumber || '',
      country: user.country || ''
    });
    setIsEditing(false);
    setError('');
  };

  return (
    <div className="user-profile">
      <div className="profile-header">
        <h2>User Profile</h2>
        {!isEditing && (
          <button 
            onClick={() => setIsEditing(true)}
            className="edit-btn"
          >
            Edit Profile
          </button>
        )}
      </div>

      {error && (
        <div className="error-message">
          {error}
        </div>
      )}

      <div className="profile-content">
        <div className="profile-field">
          <label>Username:</label>
          <span>{user.username}</span>
        </div>

        <div className="profile-field">
          <label>Name:</label>
          <span>{user.name}</span>
        </div>

        <div className="profile-field">
          <label>Email:</label>
          <span>{user.email}</span>
        </div>

        {isEditing ? (
          <form onSubmit={handleSubmit} className="profile-form">
            <div className="form-group">
              <label htmlFor="contactNumber">Contact Number:</label>
              <input
                type="tel"
                id="contactNumber"
                name="contactNumber"
                value={formData.contactNumber}
                onChange={handleInputChange}
                placeholder="Enter your contact number"
                className="form-input"
              />
            </div>

            <div className="form-group">
              <label htmlFor="country">Country:</label>
              <input
                type="text"
                id="country"
                name="country"
                value={formData.country}
                onChange={handleInputChange}
                placeholder="Enter your country"
                className="form-input"
              />
            </div>

            <div className="form-actions">
              <button 
                type="submit" 
                disabled={loading}
                className="save-btn"
              >
                {loading ? 'Saving...' : 'Save Changes'}
              </button>
              <button 
                type="button" 
                onClick={handleCancel}
                className="cancel-btn"
              >
                Cancel
              </button>
            </div>
          </form>
        ) : (
          <>
            <div className="profile-field">
              <label>Contact Number:</label>
              <span>{user.contactNumber || 'Not provided'}</span>
            </div>

            <div className="profile-field">
              <label>Country:</label>
              <span>{user.country || 'Not provided'}</span>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default UserProfile;