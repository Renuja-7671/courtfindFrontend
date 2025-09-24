
import React, { useState, useEffect } from 'react';
import AdminLayout from "../components/AdminLayout";
import apiClient from "../services/adminApiService";
import './styles/AdminPricing.css';


const PRICING_TOPIC = "Price for new arena addition";

const AdminPricing = () => {
  const [price, setPrice] = useState('');
  const [pricingId, setPricingId] = useState(null);
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch the pricing entry for new arena addition
  useEffect(() => {
    const fetchPricing = async () => {
      try {
        setLoading(true);
        const response = await apiClient.get('/admin/pricing');
        // Find the entry with the correct topic
        const arenaPricing = response.data.find(item => item.activity_name === PRICING_TOPIC || item.activityName === PRICING_TOPIC);
        if (arenaPricing) {
          setPrice(arenaPricing.price);
          setPricingId(arenaPricing.id);
        }
        setError(null);
      } catch (err) {
        console.error('Error fetching pricing data:', err);
        setError('Failed to load pricing data. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    fetchPricing();
  }, []);


  // Handle editing
  const handleEdit = () => {
    setEditing(true);
  };

  // Handle saving the price (update or add)
  const handleSave = async () => {
    try {
      if (pricingId) {
        await apiClient.put('/admin/pricing', {
          id: pricingId,
          activity_name: PRICING_TOPIC,
          price: parseFloat(price)
        });
        alert('Price updated successfully!');
      } else {
        const response = await apiClient.post('/admin/pricing', {
          activity_name: PRICING_TOPIC,
          price: parseFloat(price)
        });
        setPricingId(response.data.id);
        alert('Price added successfully!');
      }
      setEditing(false);
    } catch (err) {
      console.error('Error saving price:', err);
      alert('Failed to save price: ' + (err.response?.data?.error || err.message));
    }
  };

  // Cancel editing
  const handleCancel = () => {
    setEditing(false);
    // Optionally, reload the price from backend
  };

  if (loading) return <AdminLayout><div>Loading pricing data...</div></AdminLayout>;
  if (error) return <AdminLayout><div>Error: {error}</div></AdminLayout>;

  return (
    <AdminLayout>
      <div className="admin-pricing-container">
        <h1>Pricing Management</h1>
        <div className="pricing-table single-pricing">
          <div className="pricing-header">
            <div className="pricing-column activity-column">Activity</div>
            <div className="pricing-column price-column">Price (LKR)</div>
            <div className="pricing-column actions-column">Actions</div>
          </div>
          <div className="pricing-row">
            <div className="pricing-column activity-column">
              {PRICING_TOPIC}
            </div>
            <div className="pricing-column price-column">
              {editing ? (
                <input
                  type="number"
                  value={price}
                  onChange={e => setPrice(e.target.value)}
                  className="price-input"
                />
              ) : (
                price
              )}
            </div>
            <div className="pricing-column actions-column">
              {editing ? (
                <div className="edit-actions">
                  <button onClick={handleSave} className="save-btn">Save</button>
                  <button onClick={handleCancel} className="cancel-btn">Cancel</button>
                </div>
              ) : (
                <button onClick={handleEdit} className="update-btn">Update</button>
              )}
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};
export default AdminPricing;