import React, { useState, useEffect } from 'react';
import AdminLayout from "../components/AdminLayout";
import apiClient from "../services/adminApiService";
import { FaEye, FaTrash, FaUsers, FaTimes } from 'react-icons/fa';
import './styles/AdminOwners.css';

const AdminOwners = () => {
  const [owners, setOwners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalOwners, setTotalOwners] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [selectedOwner, setSelectedOwner] = useState(null);
  const [modalLoading, setModalLoading] = useState(false);

  const ownersPerPage = 10;

  // Fetch owners data
  const fetchOwners = async (page = 1, search = '') => {
    try {
      setLoading(true);
      const response = await apiClient.get('/admin/owners', {
        params: {
          page,
          limit: ownersPerPage,
          search: search.trim()
        }
      });
      
      const { owners: fetchedOwners, totalOwners: total, totalPages: pages, hasMore: more } = response.data;
      
      if (page === 1) {
        setOwners(fetchedOwners);
      } else {
        setOwners(prev => [...prev, ...fetchedOwners]);
      }
      
      setTotalOwners(total);
      setTotalPages(pages);
      setHasMore(more);
      setCurrentPage(page);
      setError(null);
    } catch (err) {
      console.error('Error fetching owners:', err);
      setError('Failed to load owners data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Initial data fetch
  useEffect(() => {
    fetchOwners(1, searchTerm);
  }, []);

  // Handle search
  const handleSearch = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    setCurrentPage(1);
    fetchOwners(1, value);
  };

  // Handle "See More" button
  const handleSeeMore = () => {
    if (hasMore && !loading) {
      fetchOwners(currentPage + 1, searchTerm);
    }
  };

  // Handle view owner info
  const handleViewInfo = async (ownerId) => {
    try {
      setModalLoading(true);
      setShowModal(true);
      
      const response = await apiClient.get(`/admin/owners/${ownerId}`);
      setSelectedOwner(response.data);
      setModalLoading(false);
    } catch (err) {
      console.error('Error fetching owner details:', err);
      alert('Failed to load owner details: ' + (err.response?.data?.error || err.message));
      setShowModal(false);
      setModalLoading(false);
    }
  };

  // Handle delete owner
  const handleDeleteOwner = async (ownerId, ownerName) => {
    if (!window.confirm(`Are you sure you want to delete ${ownerName}? This action cannot be undone.`)) {
      return;
    }
    
    try {
      await apiClient.delete(`/admin/owners/${ownerId}`);
      
      // Remove the deleted owner from state
      setOwners(owners.filter(owner => owner.userId !== ownerId));
      setTotalOwners(prev => prev - 1);
      
      alert('Owner deleted successfully!');
    } catch (err) {
      console.error('Error deleting owner:', err);
      alert('Failed to delete owner: ' + (err.response?.data?.error || err.message));
    }
  };

  // Close modal
  const closeModal = () => {
    setShowModal(false);
    setSelectedOwner(null);
    setModalLoading(false);
  };

  // Format date
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (loading && currentPage === 1) {
    return <AdminLayout><div className="loading">Loading owners data...</div></AdminLayout>;
  }

  if (error && owners.length === 0) {
    return <AdminLayout><div className="error">Error: {error}</div></AdminLayout>;
  }

  return (
    <AdminLayout>
      <div className="admin-owners-container">
        {/* Header Section */}
        <div className="owners-header">
          <div className="owners-stats">
            <FaUsers className="stats-icon" />
            <div className="stats-text">
              <span className="stats-number">{totalOwners}</span>
              <span className="stats-label">Owners in Total</span>
            </div>
          </div>
        </div>

        <h1>Manage Owners</h1>

        {/* Search Bar */}
        <div className="search-container">
          <input
            type="text"
            placeholder="Search by name"
            value={searchTerm}
            onChange={handleSearch}
            className="search-input"
          />
        </div>

        {/* Owners Table */}
        <div className="owners-table">
          <div className="table-header">
            <div className="table-column id-column">ID</div>
            <div className="table-column name-column">Owner Name</div>
            <div className="table-column email-column">Email</div>
            <div className="table-column actions-column">Actions</div>
          </div>
          
          {owners.map((owner, index) => (
            <div key={owner.userId} className="table-row">
              <div className="table-column id-column">
                {String(index + 1).padStart(2, '0')}
              </div>
              <div className="table-column name-column">
                {`${owner.firstName} ${owner.lastName || ''}`.trim()}
              </div>
              <div className="table-column email-column">
                {owner.email}
              </div>
              <div className="table-column actions-column">
                <button 
                  onClick={() => handleViewInfo(owner.userId)}
                  className="view-btn"
                  title="View Info"
                >
                  View Info
                </button>
                <button 
                  onClick={() => handleDeleteOwner(owner.userId, `${owner.firstName} ${owner.lastName || ''}`.trim())}
                  className="delete-btn"
                  title="Delete Profile"
                >
                  Delete Profile
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* See More Button */}
        {hasMore && (
          <div className="see-more-container">
            <button 
              onClick={handleSeeMore}
              disabled={loading}
              className="see-more-btn"
            >
              {loading ? 'Loading...' : 'See More'}
            </button>
          </div>
        )}

        {/* No owners found */}
        {owners.length === 0 && !loading && (
          <div className="no-owners">
            No owners found {searchTerm && `for "${searchTerm}"`}
          </div>
        )}

        {/* Owner Details Modal */}
        {showModal && (
          <div className="modal-overlay" onClick={closeModal}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h2>More Information</h2>
                <button onClick={closeModal} className="close-btn">
                  <FaTimes />
                </button>
              </div>
              
              {modalLoading ? (
                <div className="modal-loading">Loading owner details...</div>
              ) : selectedOwner ? (
                <div className="modal-body">
                  <div className="owner-details">
                    {/* <div className="detail-row">
                      <span className="detail-label">Password:</span>
                      <span className="detail-value">••••••••••</span>
                    </div> */}
                    <div className="detail-row">
                      <span className="detail-label">Mobile number:</span>
                      <span className="detail-value">{selectedOwner.mobile || 'Not provided'}</span>
                    </div>
                    <div className="detail-row">
                      <span className="detail-label">Country:</span>
                      <span className="detail-value">{selectedOwner.country || 'Not provided'}</span>
                    </div>
                    <div className="detail-row">
                      <span className="detail-label">Province:</span>
                      <span className="detail-value">{selectedOwner.province || 'Not provided'}</span>
                    </div>
                    <div className="detail-row">
                      <span className="detail-label">Zip code:</span>
                      <span className="detail-value">{selectedOwner.zip || 'Not provided'}</span>
                    </div>
                    <div className="detail-row">
                      <span className="detail-label">Address:</span>
                      <span className="detail-value">{selectedOwner.address || 'Not provided'}</span>
                    </div>
                    <div className="detail-row">
                      <span className="detail-label">Joined:</span>
                      <span className="detail-value">{formatDate(selectedOwner.created_at)}</span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="modal-error">Failed to load owner details</div>
              )}
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default AdminOwners;