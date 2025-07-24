import React, { useState, useEffect } from 'react';
import AdminLayout from "../components/AdminLayout";
import apiClient from "../services/adminApiService";
import { FaEye, FaTrash, FaUsers, FaTimes } from 'react-icons/fa';
import './styles/AdminPlayers.css';

const AdminPlayers = () => {
  const [players, setPlayers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPlayers, setTotalPlayers] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [selectedPlayer, setSelectedPlayer] = useState(null);
  const [modalLoading, setModalLoading] = useState(false);

  const playersPerPage = 10;

  // Fetch players data
  const fetchPlayers = async (page = 1, search = '') => {
    try {
      setLoading(true);
      const response = await apiClient.get('/admin/players', {
        params: {
          page,
          limit: playersPerPage,
          search: search.trim()
        }
      });
      
      const { players: fetchedPlayers, totalPlayers: total, totalPages: pages, hasMore: more } = response.data;
      
      if (page === 1) {
        setPlayers(fetchedPlayers);
      } else {
        setPlayers(prev => [...prev, ...fetchedPlayers]);
      }
      
      setTotalPlayers(total);
      setTotalPages(pages);
      setHasMore(more);
      setCurrentPage(page);
      setError(null);
    } catch (err) {
      console.error('Error fetching players:', err);
      setError('Failed to load players data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Initial data fetch
  useEffect(() => {
    fetchPlayers(1, searchTerm);
  }, []);

  // Handle search
  const handleSearch = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    setCurrentPage(1);
    fetchPlayers(1, value);
  };

  // Handle "See More" button
  const handleSeeMore = () => {
    if (hasMore && !loading) {
      fetchPlayers(currentPage + 1, searchTerm);
    }
  };

  // Handle view player info
  const handleViewInfo = async (playerId) => {
    try {
      setModalLoading(true);
      setShowModal(true);
      
      const response = await apiClient.get(`/admin/players/${playerId}`);
      setSelectedPlayer(response.data);
      setModalLoading(false);
    } catch (err) {
      console.error('Error fetching player details:', err);
      alert('Failed to load player details: ' + (err.response?.data?.error || err.message));
      setShowModal(false);
      setModalLoading(false);
    }
  };

  // Handle delete player
  const handleDeletePlayer = async (playerId, playerName) => {
    if (!window.confirm(`Are you sure you want to delete ${playerName}? This action cannot be undone.`)) {
      return;
    }
    
    try {
      await apiClient.delete(`/admin/players/${playerId}`);
      
      // Remove the deleted player from state
      setPlayers(players.filter(player => player.userId !== playerId));
      setTotalPlayers(prev => prev - 1);
      
      alert('Player deleted successfully!');
    } catch (err) {
      console.error('Error deleting player:', err);
      alert('Failed to delete player: ' + (err.response?.data?.error || err.message));
    }
  };

  // Close modal
  const closeModal = () => {
    setShowModal(false);
    setSelectedPlayer(null);
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
    return <AdminLayout><div className="loading">Loading players data...</div></AdminLayout>;
  }

  if (error && players.length === 0) {
    return <AdminLayout><div className="error">Error: {error}</div></AdminLayout>;
  }

  return (
    <AdminLayout>
      <div className="admin-players-container">
        {/* Header Section */}
        <div className="players-header">
          <div className="players-stats">
            <FaUsers className="stats-icon" />
            <div className="stats-text">
              <span className="stats-number">{totalPlayers}</span>
              <span className="stats-label">Players in Total</span>
            </div>
          </div>
        </div>

        <h1>Manage Players</h1>

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

        {/* Players Table */}
        <div className="players-table">
          <div className="table-header">
            <div className="table-column id-column">ID</div>
            <div className="table-column name-column">Player Name</div>
            <div className="table-column email-column">Email</div>
            <div className="table-column actions-column">Actions</div>
          </div>
          
          {players.map((player, index) => (
            <div key={player.userId} className="table-row">
              <div className="table-column id-column">
                {String(index + 1).padStart(2, '0')}
              </div>
              <div className="table-column name-column">
                {`${player.firstName} ${player.lastName || ''}`.trim()}
              </div>
              <div className="table-column email-column">
                {player.email}
              </div>
              <div className="table-column actions-column">
                <button 
                  onClick={() => handleViewInfo(player.userId)}
                  className="view-btn"
                  title="View Info"
                >
                  View Info
                </button>
                <button 
                  onClick={() => handleDeletePlayer(player.userId, `${player.firstName} ${player.lastName || ''}`.trim())}
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

        {/* No players found */}
        {players.length === 0 && !loading && (
          <div className="no-players">
            No players found {searchTerm && `for "${searchTerm}"`}
          </div>
        )}

        {/* Player Details Modal */}
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
                <div className="modal-loading">Loading player details...</div>
              ) : selectedPlayer ? (
                <div className="modal-body">
                  <div className="player-details">
                    {/* <div className="detail-row">
                      <span className="detail-label">Password:</span>
                      <span className="detail-value">••••••••••</span>
                    </div> */}
                    <div className="detail-row">
                      <span className="detail-label">Mobile number:</span>
                      <span className="detail-value">{selectedPlayer.mobile || 'Not provided'}</span>
                    </div>
                    <div className="detail-row">
                      <span className="detail-label">Country:</span>
                      <span className="detail-value">{selectedPlayer.country || 'Not provided'}</span>
                    </div>
                    <div className="detail-row">
                      <span className="detail-label">Province:</span>
                      <span className="detail-value">{selectedPlayer.province || 'Not provided'}</span>
                    </div>
                    <div className="detail-row">
                      <span className="detail-label">Zip code:</span>
                      <span className="detail-value">{selectedPlayer.zip || 'Not provided'}</span>
                    </div>
                    <div className="detail-row">
                      <span className="detail-label">Address:</span>
                      <span className="detail-value">{selectedPlayer.address || 'Not provided'}</span>
                    </div>
                    <div className="detail-row">
                      <span className="detail-label">Joined:</span>
                      <span className="detail-value">{formatDate(selectedPlayer.created_at)}</span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="modal-error">Failed to load player details</div>
              )}
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default AdminPlayers;