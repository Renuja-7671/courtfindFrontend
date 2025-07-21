import React, { useState, useEffect } from 'react';
import { getOwnerArenas, getArenaDetails, getArenaCourtYearlyData, fetchTopEarningCourtsLast3Months, fetchPlayerBehaviorAnalysis } from '../services/ownerAuthService';
import { Bar } from 'react-chartjs-2';
import { useNavigate } from 'react-router-dom';
import { Container, Row } from 'react-bootstrap';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const ProfitCourtwise = () => {
  const [arenas, setArenas] = useState([]);
  const [selectedArena, setSelectedArena] = useState(null);
  const [arenaDetails, setArenaDetails] = useState(null);
  const [chartData, setChartData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const currentYear = new Date().getFullYear();

  // **NEW**: top courts & player behavior state
  const [topCourts, setTopCourts] = useState([]);
  const [playerStats, setPlayerStats] = useState({ newPlayers: 0, repeatPlayers: 0 });

  // Color palette for courts
  const courtColors = [
    '#1e40af', '#3b82f6', '#60a5fa', '#93c5fd',
    '#dbeafe', '#1e3a8a', '#1d4ed8', '#2563eb',
  ];

  useEffect(() => {
    fetchArenas();
    // **NEW** fire off our two new data fetches
    fetchTopCourts();
    fetchPlayerBehavior();
  }, []);

  const fetchArenas = async () => {
    try {
      const arenasData = await getOwnerArenas();
      setArenas(arenasData);
      if (arenasData.length > 0) {
        setSelectedArena(arenasData[0].arenaId);
        fetchArenaData(arenasData[0].arenaId);
      }
    } catch (err) {
      setError('Failed to fetch arenas');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchArenaData = async (arenaId) => {
    try {
      setLoading(true);
      const [details, yearlyData] = await Promise.all([
        getArenaDetails(arenaId),
        getArenaCourtYearlyData(arenaId, currentYear)
      ]);
      
      setArenaDetails(details);
      
      // Format chart data with colors
      const formattedData = {
        ...yearlyData,
        datasets: yearlyData.datasets.map((dataset, index) => ({
          ...dataset,
          backgroundColor: courtColors[index % courtColors.length],
          borderColor: courtColors[index % courtColors.length],
          borderWidth: 1,
        }))
      };
      
      setChartData(formattedData);
    } catch (err) {
      setError('Failed to fetch arena data');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // **NEW**: fetch top 3 earning courts
  const fetchTopCourts = async () => {
    try {
      const token = localStorage.getItem("token");
      const data = await fetchTopEarningCourtsLast3Months(token);
      setTopCourts(data);
    } catch (err) {
      console.error("Failed to fetch top courts", err);
    }
  };

  // **NEW**: fetch player behavior and compute new vs repeat counts
  const fetchPlayerBehavior = async () => {
    try {
      const token = localStorage.getItem("token");
      const data = await fetchPlayerBehaviorAnalysis(token);
      const newCount = data.filter(p => p.player_type === 'New').length;
      const repeatCount = data.filter(p => p.player_type === 'Repeat').length;
      setPlayerStats({ newPlayers: newCount, repeatPlayers: repeatCount });
    } catch (err) {
      console.error("Failed to fetch player behavior stats", err);
    }
  };

  const handleArenaChange = (e) => {
    const arenaId = parseInt(e.target.value);
    setSelectedArena(arenaId);
    fetchArenaData(arenaId);
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        align: 'start',
        labels: {
          usePointStyle: true,
          pointStyle: 'circle',
          padding: 20,
          font: { size: 12, family: 'Inter, sans-serif' }
        }
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleColor: 'white',
        bodyColor: 'white',
        cornerRadius: 8,
        displayColors: true,
        callbacks: {
          label: function(context) {
            return `${context.dataset.label}: LKR ${context.parsed.y.toLocaleString()}`;
          }
        }
      }
    },
    scales: {
      x: {
        stacked: true,
        grid: { display: false },
        ticks: {
          font: { size: 12, family: 'Inter, sans-serif' },
          color: '#6b7280'
        }
      },
      y: {
        stacked: true,
        beginAtZero: true,
        grid: { color: '#f3f4f6' },
        ticks: {
          font: { size: 12, family: 'Inter, sans-serif' },
          color: '#6b7280',
          callback: v => v >= 1000 ? (v / 1000) + 'K' : v
        }
      }
    },
    elements: {
      bar: {
        borderRadius: 4,
        borderSkipped: false,
      }
    }
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '16rem' }}>
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="alert alert-danger" role="alert">
        {error}
      </div>
    );
  }

  return (
    <Container className="min-vh-100 d-flex flex-column align-items-center bg-white py-3">
      <Row className="w-100">
        <div className="container-fluid p-5 bg-white">
          {/* Header */}
          <div className="mb-4">
            <h1 className="display-5 fw-bold text-dark mb-4 text-center">Profit of your Arena</h1>
            
            {/* Arena Selector */}
            <div className="mb-4">
              <select
                value={selectedArena || ''}
                onChange={handleArenaChange}
                className="form-select form-select-lg"
                style={{ maxWidth: '28rem', backgroundColor: '#f8f9fa' }}
              >
                <option value="" disabled hidden>Choose an Arena</option>
                {arenas.map((arena) => (
                  <option key={arena.arenaId} value={arena.arenaId}>
                    {arena.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Arena Details */}
            {arenaDetails && (
              <div className="mb-4">
                <h2 className="h4 fw-semibold text-dark mb-1">
                  {arenaDetails.name}
                </h2>
                <p className="text-muted mb-0">
                  {arenaDetails.city}, {arenaDetails.country}
                </p>
              </div>
            )}
          </div>

          {/* Chart Container */}
          {chartData && (
            <div className="card border-0 shadow-sm rounded-3 mb-4">
              <div className="card-body p-4">
                <div style={{ height: '24rem' }}>
                  <Bar data={chartData} options={chartOptions} />
                </div>
              </div>
            </div>
          )}

          {/* Enhanced Top Courts Section */}
          <div className="card border-0 shadow-sm rounded-3 mb-4">
            <div className="card-body p-4">
              <div className="d-flex align-items-center mb-3">
                <div 
                  className="me-3 d-flex align-items-center justify-content-center"
                  style={{ 
                    width: '12px', 
                    height: '12px', 
                    backgroundColor: '#1e40af',
                    borderRadius: '50%'
                  }}
                ></div>
                <h5 className="card-title fw-bold mb-0" style={{ fontFamily: 'Inter, sans-serif', color: '#1f2937' }}>
                  Top 3 Earning Courts (Last 3 Months)
                </h5>
              </div>
              
              {topCourts.length === 0 ? (
                <div className="text-center py-4">
                  <p className="text-muted mb-0" style={{ fontFamily: 'Inter, sans-serif', color: '#6b7280' }}>
                    No data available
                  </p>
                </div>
              ) : (
                <div className="row g-3">
                  {topCourts.map((court, idx) => (
                    <div key={court.court_name + idx} className="col-md-4">
                      <div 
                        className="card h-100 border-0"
                        style={{ 
                          backgroundColor: '#f8f9fa',
                          borderLeft: `4px solid ${courtColors[idx % courtColors.length]}`,
                          borderRadius: '8px'
                        }}
                      >
                        <div className="card-body p-3">
                          <div className="d-flex align-items-center justify-content-between mb-2">
                            <span 
                              className="badge rounded-pill"
                              style={{ 
                                backgroundColor: courtColors[idx % courtColors.length],
                                color: 'white',
                                fontFamily: 'Inter, sans-serif'
                              }}
                            >
                              #{idx + 1}
                            </span>
                            <div 
                              className="text-end"
                              style={{ 
                                fontSize: '1.25rem',
                                fontWeight: '600',
                                color: '#1f2937',
                                fontFamily: 'Inter, sans-serif'
                              }}
                            >
                              LKR {court.total_revenue.toLocaleString()}
                            </div>
                          </div>
                          <h6 
                            className="card-title mb-1"
                            style={{ 
                              fontFamily: 'Inter, sans-serif',
                              color: '#1f2937',
                              fontWeight: '600'
                            }}
                          >
                            {court.court_name}
                          </h6>
                          <p 
                            className="text-muted mb-0"
                            style={{ 
                              fontSize: '0.875rem',
                              fontFamily: 'Inter, sans-serif',
                              color: '#6b7280'
                            }}
                          >
                            {court.arena_name}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Enhanced Player Behavior Section */}
          <div className="card border-0 shadow-sm rounded-3 mb-4">
            <div className="card-body p-4">
              <div className="d-flex align-items-center mb-3">
                <div 
                  className="me-3 d-flex align-items-center justify-content-center"
                  style={{ 
                    width: '12px', 
                    height: '12px', 
                    backgroundColor: '#3b82f6',
                    borderRadius: '50%'
                  }}
                ></div>
                <h5 className="card-title fw-bold mb-0" style={{ fontFamily: 'Inter, sans-serif', color: '#1f2937' }}>
                  Player Behavior (Last 3 Months)
                </h5>
              </div>
              
              <div className="row g-3">
                <div className="col-md-6">
                  <div 
                    className="card h-100 border-0"
                    style={{ 
                      backgroundColor: '#f0f9ff',
                      borderLeft: '4px solid #3b82f6',
                      borderRadius: '8px'
                    }}
                  >
                    <div className="card-body p-3 d-flex align-items-center">
                      <div 
                        className="me-3 d-flex align-items-center justify-content-center"
                        style={{ 
                          width: '40px', 
                          height: '40px', 
                          backgroundColor: '#3b82f6',
                          borderRadius: '50%',
                          fontSize: '1.25rem'
                        }}
                      >
                        🆕
                      </div>
                      <div className="flex-grow-1">
                        <h6 
                          className="mb-1"
                          style={{ 
                            fontFamily: 'Inter, sans-serif',
                            color: '#1f2937',
                            fontWeight: '600'
                          }}
                        >
                          New Players
                        </h6>
                        <div 
                          style={{ 
                            fontSize: '1.5rem',
                            fontWeight: '700',
                            color: '#3b82f6',
                            fontFamily: 'Inter, sans-serif'
                          }}
                        >
                          {playerStats.newPlayers}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="col-md-6">
                  <div 
                    className="card h-100 border-0"
                    style={{ 
                      backgroundColor: '#f0fdf4',
                      borderLeft: '4px solid #10b981',
                      borderRadius: '8px'
                    }}
                  >
                    <div className="card-body p-3 d-flex align-items-center">
                      <div 
                        className="me-3 d-flex align-items-center justify-content-center"
                        style={{ 
                          width: '40px', 
                          height: '40px', 
                          backgroundColor: '#10b981',
                          borderRadius: '50%',
                          fontSize: '1.25rem'
                        }}
                      >
                        🔁
                      </div>
                      <div className="flex-grow-1">
                        <h6 
                          className="mb-1"
                          style={{ 
                            fontFamily: 'Inter, sans-serif',
                            color: '#1f2937',
                            fontWeight: '600'
                          }}
                        >
                          Repeat Players
                        </h6>
                        <div 
                          style={{ 
                            fontSize: '1.5rem',
                            fontWeight: '700',
                            color: '#10b981',
                            fontFamily: 'Inter, sans-serif'
                          }}
                        >
                          {playerStats.repeatPlayers}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Back Button */}
          <div className="d-flex justify-content-start">
            <button
              onClick={() => navigate('/my-profit')}
              className="btn btn-primary btn-lg px-4 py-2"
            >
              Back to summarized view
            </button>
          </div>
        </div>
      </Row>
    </Container>
  );
};

export default ProfitCourtwise;