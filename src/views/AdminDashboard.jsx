import React, { useState, useEffect } from 'react';
import AdminLayout from "../components/AdminLayout";
import apiClient from "../services/adminApiService";
import { FaUsers, FaDollarSign } from 'react-icons/fa';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';
import './styles/AdminDashboard.css';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalPlayers: 0,
    totalOwners: 0,
    totalRevenue: 0 // Changed from averageRevenue
  });
  const [chartData, setChartData] = useState({ revenueByActivity: [] });
  const [topRatedArenas, setTopRatedArenas] = useState([]);
  const [visibleArenas, setVisibleArenas] = useState(5); // Initial limit
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [statsResponse, chartResponse, arenasResponse] = await Promise.all([
          apiClient.get('/admin/user-stats'),
          apiClient.get('/admin/revenue-by-activity'),
          apiClient.get('/admin/top-rated-arenas')
        ]);
        setStats({
          totalUsers: statsResponse.data.totalUsers,
          totalPlayers: statsResponse.data.totalPlayers,
          totalOwners: statsResponse.data.totalOwners,
          totalRevenue: statsResponse.data.totalRevenue // Changed from averageRevenue
        });
        setChartData({ revenueByActivity: chartResponse.data.revenueByActivity });
        setTopRatedArenas(arenasResponse.data.topRatedArenas);
        setError(null);
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Failed to load data.');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const formatRevenue = (amount) => {
  if (amount >= 1000000) {
    return `LKR ${(amount / 1000000).toFixed(1)}M`;
  } else if (amount >= 1000) {
    return `LKR ${Math.floor(amount / 1000)}K`; // Changed to Math.floor for rounding down
  } else {
    return `LKR ${amount.toFixed(0)}`;
  }
};

  // Bar Chart Data
  const barChartData = {
    labels: chartData.revenueByActivity.map(item => item.activity_name),
    datasets: [
      {
        label: 'Revenue (LKR)',
        data: chartData.revenueByActivity.map(item => item.total_amount),
        backgroundColor: ['#a855f7', '#3b82f6', '#93c5fd', '#facc15'],
        borderColor: ['#a855f7', '#3b82f6', '#93c5fd', '#facc15'],
        borderWidth: 1
      }
    ]
  };

  const barChartOptions = {
    scales: {
      y: { beginAtZero: true, title: { display: true, text: 'Amount (LKR)' } },
      x: { title: { display: true, text: 'Pricing Activities' } }
    },
    plugins: {
      legend: { position: 'top' },
      title: { display: true, text: 'Revenue by Activity' }
    }
  };

  const handleViewAll = () => {
    setVisibleArenas(topRatedArenas.length); // Show all arenas
  };

  if (loading) return <AdminLayout><div>Loading...</div></AdminLayout>;
  if (error) return <AdminLayout><div>Error: {error}</div></AdminLayout>;

  return (
    <AdminLayout>
      <div className="admin-dashboard-container">
        <div className="stats-header">
          <div className="stats-box">
            <FaUsers className="stats-icon" />
            <div className="stats-text">
              <span className="stats-number">{stats.totalUsers}</span>
              <span className="stats-label">Total Users</span>
            </div>
          </div>
          <div className="stats-box">
            <FaUsers className="stats-icon" />
            <div className="stats-text">
              <span className="stats-number">{stats.totalPlayers}</span>
              <span className="stats-label">Players in Total</span>
            </div>
          </div>
          <div className="stats-box">
            <FaUsers className="stats-icon" />
            <div className="stats-text">
              <span className="stats-number">{stats.totalOwners}</span>
              <span className="stats-label">Owners in Total</span>
            </div>
          </div>
          <div className="stats-box">
            <FaDollarSign className="stats-icon" />
            <div className="stats-text">
              <span className="stats-number">{formatRevenue(stats.totalRevenue)}</span> {/* Changed from stats.averageRevenue */}
              <span className="stats-label">Total Revenue</span> {/* Changed from Average Revenue */}
            </div>
          </div>
        </div>
        <div className="chart-container">
          <Bar data={barChartData} options={barChartOptions} />
        </div>
        {/* Top Rated Arenas List */}
        <div className="top-rated-arenas-container">
          <h2>Top Rated Arenas</h2>
          <ul className="arenas-list">
            {topRatedArenas.slice(0, visibleArenas).map(arena => (
              <li key={arena.arenaId} className="arena-item">
                <span className="arena-name">{arena.name}</span>
                <span className="arena-location">{arena.city}, {arena.country}</span>
                <span className="arena-rating">Rating: {arena.average_rating.toFixed(1)}</span>
              </li>
            ))}
          </ul>
          {visibleArenas < topRatedArenas.length && (
            <button className="view-all-button" onClick={handleViewAll}>View All</button>
          )}
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminDashboard;