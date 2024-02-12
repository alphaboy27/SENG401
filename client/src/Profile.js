import React, { useState, useEffect } from 'react';
import './Profile.css';

function Profile() {
  const [profileData, setProfileData] = useState(null);
  const [error, setError] = useState(null);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: ''
  });

  useEffect(() => {
    // Retrieve user data from local storage
    const userData = localStorage.getItem('user');
    if (userData) {
      setProfileData(JSON.parse(userData));
    } else {
      fetchProfileData();
    }
  }, []);

  const fetchProfileData = async () => {
    try {
      const response = await fetch('/api/profile'); // Adjust the endpoint as per your backend setup
      if (!response.ok) {
        throw new Error('Failed to fetch profile data');
      }
      const data = await response.json();
      setProfileData(data);
      setFormData({
        name: data.name,
        description: data.description || ''
      });
    } catch (error) {
      setError(error.message);
    }
  };

  const handleEdit = () => {
    setEditing(true);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('/api/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });
      if (!response.ok) {
        throw new Error('Failed to update profile');
      }
      setEditing(false);
      fetchProfileData();
    } catch (error) {
      setError(error.message);
    }
  };

  if (error) {
    return <div className="error-message">{error}</div>;
  }

  if (!profileData) {
    return <div>Loading...</div>;
  }

  return (
    <div className="profile-container">
      <h2 className="profile-title">User Profile</h2>
      {editing ? (
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="name">Name:</label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="description">Description:</label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
            ></textarea>
          </div>
          <button type="submit">Save</button>
        </form>
      ) : (
        <div className="profile-content">
          <p>Name: {profileData.name}</p>
          <p>Username: {profileData.username}</p>
          <p>Email: {profileData.email}</p>
          <p>Role: {profileData.role}</p>
          <p>Description: {profileData.description || 'Add a description to attract recruiters!'}</p>
          <button onClick={handleEdit}>Edit</button>
        </div>
      )}
    </div>
  );
}

export default Profile;
