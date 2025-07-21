import React, { useState, useEffect } from 'react';
import AdminLayout from "../components/AdminLayout";
import apiClient from "../services/adminApiService";
import { FaSave, FaTrash } from 'react-icons/fa';
import './styles/AdminPricing.css';

const AdminPricing = () => {
  const [pricingItems, setPricingItems] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [editActivity, setEditActivity] = useState('');
  const [editPrice, setEditPrice] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [newActivity, setNewActivity] = useState({
    activity_name: '',
    price: ''
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(5);
  const [totalItems, setTotalItems] = useState(0);

  // Fetch all pricing items
  useEffect(() => {
    const fetchPricingData = async () => {
      try {
        setLoading(true);
        const response = await apiClient.get('/admin/pricing');
        setPricingItems(response.data);
        setTotalItems(response.data.length);
        setError(null);
      } catch (err) {
        console.error('Error fetching pricing data:', err);
        setError('Failed to load pricing data. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchPricingData();
  }, []);

  // Handle starting edit for an item
  const handleEdit = (id, currentActivity, currentPrice) => {
    setEditingId(id);
    setEditActivity(currentActivity);
    setEditPrice(currentPrice);
  };

  // Handle updating an item
  const handleUpdate = async (id) => {
    try {
      await apiClient.put('/admin/pricing', {
        id: id,
        activity_name: editActivity,
        price: parseFloat(editPrice)
      });
      
      // Update local state to reflect the change
      setPricingItems(pricingItems.map(item => 
        item.id === id ? {
          ...item, 
          activity_name: editActivity,
          price: parseFloat(editPrice)
        } : item
      ));
      
      // Exit edit mode
      setEditingId(null);
      setEditActivity('');
      setEditPrice('');
      
      alert('Item updated successfully!');
    } catch (err) {
      console.error('Error updating item:', err);
      alert('Failed to update item: ' + (err.response?.data?.error || err.message));
    }
  };

  // Handle deleting a pricing item
  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this pricing item?')) {
      return;
    }
    
    try {
      await apiClient.delete(`/admin/pricing/${id}`);
      
      // Remove the deleted item from our state
      setPricingItems(pricingItems.filter(item => item.id !== id));
      setTotalItems(prevTotal => prevTotal - 1);
      
      alert('Pricing item deleted successfully!');
    } catch (err) {
      console.error('Error deleting pricing item:', err);
      alert('Failed to delete pricing item: ' + (err.response?.data?.error || err.message));
    }
  };

  // Handle adding a new pricing item
  const handleAddPricing = async (e) => {
    e.preventDefault();
    
    if (!newActivity.activity_name || !newActivity.price) {
      alert('Activity name and price are required');
      return;
    }
    
    try {
      const response = await apiClient.post('/admin/pricing', {
        activity_name: newActivity.activity_name,
        price: parseFloat(newActivity.price)
      });
      
      // Add the new item to our state
      const newItem = {
        id: response.data.id,
        activity_name: newActivity.activity_name,
        price: parseFloat(newActivity.price)
      };
      
      setPricingItems([...pricingItems, newItem]);
      setTotalItems(prevTotal => prevTotal + 1);
      
      // Clear form and hide it
      setNewActivity({ activity_name: '', price: '' });
      setShowAddForm(false);
      
      alert('New pricing item added successfully!');
    } catch (err) {
      console.error('Error adding pricing item:', err);
      alert('Failed to add pricing item: ' + (err.response?.data?.error || err.message));
    }
  };

  // Cancel edit mode
  const cancelEdit = () => {
    setEditingId(null);
    setEditActivity('');
    setEditPrice('');
  };

  // Pagination logic
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = pricingItems.slice(indexOfFirstItem, indexOfLastItem);
  
  // Calculate total pages
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  
  // Change page
  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  if (loading) return <AdminLayout><div>Loading pricing data...</div></AdminLayout>;
  if (error) return <AdminLayout><div>Error: {error}</div></AdminLayout>;

  return (
    <AdminLayout>
      <div className="admin-pricing-container">
        <h1>Pricing Management</h1>
        
        <div className="pricing-table">
          <div className="pricing-header">
            <div className="pricing-column activity-column">Activity</div>
            <div className="pricing-column price-column">Price(LKR)</div>
            <div className="pricing-column actions-column">Actions</div>
          </div>
          
          {currentItems.map(item => (
            <div key={item.id} className="pricing-row">
              <div className="pricing-column activity-column">
                {editingId === item.id ? (
                  <input
                    type="text"
                    value={editActivity}
                    onChange={(e) => setEditActivity(e.target.value)}
                    className="activity-input"
                  />
                ) : (
                  item.activity_name
                )}
              </div>
              <div className="pricing-column price-column">
                {editingId === item.id ? (
                  <input
                    type="number"
                    value={editPrice}
                    onChange={(e) => setEditPrice(e.target.value)}
                    className="price-input"
                  />
                ) : (
                  item.price
                )}
              </div>
              <div className="pricing-column actions-column">
                {editingId === item.id ? (
                  <div className="edit-actions">
                    <button onClick={() => handleUpdate(item.id)} className="save-btn">Save</button>
                    <button onClick={cancelEdit} className="cancel-btn">Cancel</button>
                  </div>
                ) : (
                  <div className="regular-actions">
                    <button 
                      onClick={() => handleEdit(item.id, item.activity_name, item.price)} 
                      className="update-btn"
                    >
                      Update  <FaSave />
                    </button>
                    <button 
                      onClick={() => handleDelete(item.id)} 
                      className="delete-btn"
                      title="Delete"
                    >
                      <FaTrash />
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
        
        {/* Pagination */}
        {totalPages > 1 && (
          <div className="pagination">
            <button 
              onClick={() => paginate(currentPage - 1)}
              disabled={currentPage === 1}
              className="page-btn"
            >
              Previous
            </button>
            
            <div className="page-numbers">
              {Array.from({ length: totalPages }, (_, i) => (
                <button
                  key={i}
                  onClick={() => paginate(i + 1)}
                  className={`page-number ${currentPage === i + 1 ? 'active' : ''}`}
                >
                  {i + 1}
                </button>
              ))}
            </div>
            
            <button 
              onClick={() => paginate(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="page-btn"
            >
              Next
            </button>
          </div>
        )}
        
        {showAddForm ? (
          <div className="add-form">
            <h2>Add New Pricing</h2>
            <form onSubmit={handleAddPricing}>
              <div className="form-group">
                <label>Activity Name:</label>
                <input
                  type="text"
                  value={newActivity.activity_name}
                  onChange={(e) => setNewActivity({...newActivity, activity_name: e.target.value})}
                  required
                />
              </div>
              <div className="form-group">
                <label>Price (LKR):</label>
                <input
                  type="number"
                  value={newActivity.price}
                  onChange={(e) => setNewActivity({...newActivity, price: e.target.value})}
                  required
                />
              </div>
              <div className="form-buttons">
                <button type="submit" className="save-btn">Save</button>
                <button type="button" onClick={() => setShowAddForm(false)} className="cancel-btn">Cancel</button>
              </div>
            </form>
          </div>
        ) : (
          <button onClick={() => setShowAddForm(true)} className="add-activity-btn">
            Add a new activity
          </button>
        )}
      </div>
    </AdminLayout>
  );
};

export default AdminPricing;