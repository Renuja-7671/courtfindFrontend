import React, { useState, useEffect } from 'react';
import AdminLayout from "../components/AdminLayout";
import apiClient from "../services/adminApiService";
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
import './styles/AdminProfit.css';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const AdminProfit = () => {
  const [chartData, setChartData] = useState({ revenueByActivity: [] });
  const [monthlyAnalysis, setMonthlyAnalysis] = useState([]);
  const [visibleItems, setVisibleItems] = useState(5); // Initial limit for activities
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth() + 1); // 1-12, current month
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear()); // 2025
  const [totalProfit, setTotalProfit] = useState(0);
  const [monthIncrease, setMonthIncrease] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [chartResponse, analysisResponse] = await Promise.all([
          apiClient.get('/admin/revenue-by-activity'),
          apiClient.get(`/admin/monthly-revenue-analysis?month=${currentMonth}&year=${currentYear}`)
        ]);
        setChartData({ revenueByActivity: chartResponse.data.revenueByActivity });
        const analysisData = analysisResponse.data.analysisData;
        setMonthlyAnalysis(analysisData);
        setTotalProfit(analysisData.reduce((sum, item) => sum + item.total_amount, 0));
        // Fetch previous month's total for increase calculation
        const prevMonth = currentMonth === 1 ? 12 : currentMonth - 1;
        const prevYear = currentMonth === 1 ? currentYear - 1 : currentYear;
        const prevResponse = await apiClient.get(`/admin/monthly-revenue-analysis?month=${prevMonth}&year=${prevYear}`);
        const prevTotal = prevResponse.data.analysisData.reduce((sum, item) => sum + item.total_amount, 0);
        setMonthIncrease(totalProfit - prevTotal);
        setError(null);
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Failed to load data.');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [currentMonth, currentYear]);

  const formatRevenue = (amount) => {
    if (amount >= 1000000) {
      return `LKR ${(amount / 1000000).toFixed(1)}M`;
    } else if (amount >= 1000) {
      return `LKR ${(amount / 1000).toFixed(0)}K`;
    } else {
      return `LKR ${amount.toFixed(0)}`;
    }
  };

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
      y: { beginAtZero: true, title: { display: true, text: 'Amount (LKR)' }, ticks: { font: { size: 10 } } },
      x: { title: { display: true, text: 'Arenas' }, ticks: { font: { size: 10 }, maxRotation: 45 } }
    },
    plugins: {
      legend: { display: false },
      title: { display: true, text: 'Revenue by Arenas', font: { size: 14 } }
    },
    maintainAspectRatio: false,
  };

  const handleSeeMore = () => {
    setVisibleItems(prev => Math.min(prev + 5, monthlyAnalysis.length));
  };

  const handlePrevMonth = () => {
    setCurrentMonth(prev => prev === 1 ? 12 : prev - 1);
    setCurrentYear(prev => prev === 2025 && currentMonth === 1 ? 2024 : prev);
  };

  const handleNextMonth = () => {
    setCurrentMonth(prev => prev === 12 ? 1 : prev + 1);
    setCurrentYear(prev => prev === 2024 && currentMonth === 12 ? 2025 : prev);
  };

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  if (loading) return <AdminLayout><div className="loading">Loading...</div></AdminLayout>;
  if (error) return <AdminLayout><div className="error">Error: {error}</div></AdminLayout>;

  return (
    <AdminLayout>
      <div className="admin-profit">
        <h1>Profit Overview</h1>
        <div className="chart-wrapper">
          <Bar data={barChartData} options={barChartOptions} />
        </div>
        <div className="monthly-analysis">
          <h2>{monthNames[currentMonth - 1]} {currentYear}</h2>
          <ul className="analysis-list">
            {monthlyAnalysis.slice(0, visibleItems).map((item, index) => (
              <li key={index} className="analysis-item">
                <span className="activity-name">{item.activity_name}</span>
                <span className="activity-amount">{formatRevenue(item.total_amount)}</span>
              </li>
            ))}
          </ul>
          {visibleItems < monthlyAnalysis.length && (
            <button className="see-more-button" onClick={handleSeeMore}>See More</button>
          )}
          <div className="analysis-summary">
            <p>Total Profit: {formatRevenue(totalProfit)}</p>
            <p>Month Increase: {monthIncrease >= 0 ? `+${formatRevenue(monthIncrease)}` : formatRevenue(monthIncrease)}</p>
          </div>
          <div className="month-navigation">
            <button className="nav-button" onClick={handlePrevMonth}>Previous</button>
            <button className="nav-button" onClick={handleNextMonth}>Next</button>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminProfit;