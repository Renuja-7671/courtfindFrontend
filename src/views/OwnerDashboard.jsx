import React, { useEffect, useState } from 'react';
import { getDashboardStats, getIncomeOverview, getTotalIncomeForYear, getRecentBookings, getPaymentHistory, getArenaRevenueDistribution, fetchMostBookedCourts } from '../services/ownerAuthService';
import { downloadArenaRevenueReport } from '../services/reportService';
import { Container, Card, Table, Row, Col, Spinner, Form } from 'react-bootstrap';
import { Bar, Pie } from 'react-chartjs-2';
import Sidebar from "../components/ownerSidebar";
import {
  Chart as ChartJS,
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js';
import { motion, AnimatePresence } from 'framer-motion';
import { FaMoneyBillWave, FaCalendarCheck, FaFutbol } from 'react-icons/fa'; // for icons
import { PieChart, Pie as RechartsPie, Cell, Tooltip as RechartsTooltip, Legend as RechartsLegend } from 'recharts'; // from Recharts




ChartJS.register(BarElement, CategoryScale, LinearScale, Tooltip, Legend, ArcElement);
const COLORS = ['#FFBB28',  '#845EC2', '#0088FE', '#00C49F', '#FF8042'];


const OwnerDashboard = () => {
  const [stats, setStats] = useState({
    totalArenas: 0, totalBookings: 0, totalIncome: 0,
  });
  const [incomeData, setIncomeData] = useState({ labels: [], values: [] });
  const [bookings, setBookings] = useState([]);
  const [payments, setPayments] = useState([]);
  const [showAllBookings, setShowAllBookings] = useState(false);
  const [showAllPayments, setShowAllPayments] = useState(false);
  const [pieData, setPieData] = useState({ labels: [], values: [] });
  const [data, setData] = useState([]);
  const [year, setYear] = useState(new Date().getFullYear());
  const [totalIncome, setTotalIncome] = useState(null);
  const token = localStorage.getItem("authToken");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('authToken');
        const [statsRes, bookingsRes, paymentsRes, pieRes] = await Promise.all([
          getDashboardStats(token),
          getRecentBookings(token),
          getPaymentHistory(token),
          getArenaRevenueDistribution(token)
        ]);

        setStats(statsRes);
        setPieData({ labels: pieRes.labels, values: pieRes.values });
        setBookings(bookingsRes);
        setPayments(paymentsRes);

      } catch (error) {
        console.error("Failed to fetch dashboard data:", error);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    const fetchIncomeOverview = async (token, year) => {
      try {
        const [incomeRes, totalIncome] = await Promise.all([
        getIncomeOverview(token, year),
        getTotalIncomeForYear(token,year)
        ]);

        const numericValues = incomeRes.values.map(v => Number(v) || 0);
        setIncomeData({ labels: incomeRes.labels, values: numericValues });
        setTotalIncome(totalIncome);
      } catch (error) {
        console.error('Error loading income overview', error);
      }
    };
    fetchIncomeOverview(token, year);
  }, [token, year]);

  useEffect(() => {
    const loadData = async (token) => {
      try {
        const result = await fetchMostBookedCourts(token);
        console.log("The mb courts", result);
        const formatted = result.map(item => ({
          cName: item.courtName,
          // aName: item.arenaName,
          value: item.bookingsCount
        }));
        setData(formatted);
      } catch (error) {
        console.error('Error loading chart data', error);
      }
    };
    loadData(token);
  }, [token]);

  const handleReport01Download = async (token) => {
    try {
      const data = await downloadArenaRevenueReport(token);

      const url = window.URL.createObjectURL(new Blob([data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `Arena_Revenue_Report_${Date.now()}.pdf`);
      document.body.appendChild(link);
      link.click();
    } catch (error) {
      console.error('Failed to download report:', error);
      alert('Error downloading report');
    }
  }

  return (
    <Container className="min-vh-100 d-flex flex-column  align-items-center">
      <Row className="w-100" text-center>
        <Col className="p-4 m-0" md={3}>
          <Sidebar />
        </Col>

        <Col md={9}>
          {/* Stats cards */}
          <Row className="g-4 mb-4">
            <Col md={4}>
              <motion.div whileHover={{ scale: 1.02 }}>
                <Card className="shadow-sm rounded-3 text-center border-0">
                  <Card.Body>
                    <FaFutbol size={32} color="#4e73df" className="mb-2" />
                    <h6 className="fw-semibold text-muted">Total Arenas</h6>
                    <h3 className="fw-bold">{stats.totalArenas}</h3>
                  </Card.Body>
                </Card>
              </motion.div>
            </Col>
            <Col md={4}>
              <motion.div whileHover={{ scale: 1.02 }}>
                <Card className="shadow-sm rounded-3 text-center border-0">
                  <Card.Body>
                    <FaCalendarCheck size={32} color="#1cc88a" className="mb-2" />
                    <h6 className="fw-semibold text-muted">Total Bookings</h6>
                    <h3 className="fw-bold">{stats.totalBookings}</h3>
                  </Card.Body>
                </Card>
              </motion.div>
            </Col>
            <Col md={4}>
              <motion.div whileHover={{ scale: 1.02 }}>
                <Card className="shadow-sm rounded-3 text-center border-0">
                  <Card.Body>
                    <FaMoneyBillWave size={32} color="#f6c23e" className="mb-2" />
                    <h6 className="fw-semibold text-muted">Annual Income(For Current Year)</h6>
                    <h3 className="fw-bold">LKR {stats.totalIncome}</h3>
                  </Card.Body>
                </Card>
              </motion.div>
            </Col>
          </Row>

          {/* Income overview */}
          <Card className="shadow-sm rounded-5 mb-4 border-1">
          <Card.Body>
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h4 className="fw-semibold mb-0">📊 Income Overview – {year}</h4>
              <Form.Select
                style={{ width: '150px' }}
                value={year}
                onChange={(e) => setYear(e.target.value)}
              >
                {Array.from({ length: 10 }, (_, i) => {
                  const y = new Date().getFullYear() - i;
                  return (
                    <option key={y} value={y}>{y}</option>
                  );
                })}
              </Form.Select>
            </div>
            <div className='mb-4'>
              <h5>The Total Income ({year}) :- <span style={{ fontSize:"40px", fontFamily:"monospace", color:"darkred" }}>LKR.{totalIncome}</span></h5>
            </div>
            <div style={{ height: '400px', position: 'relative' }}>
            {incomeData.values.length === 0 ? (
              <div className="text-center py-5">
                <Spinner animation="border" variant="primary" />
                <p className="mt-2">Loading income data...</p>
              </div>
            ) : (
            <Bar
              data={{
                labels: incomeData.labels,
                datasets: [{
                  label: 'Monthly Income (LKR)',
                  data: incomeData.values,
                  backgroundColor: '#4e73df',
                  borderRadius: 6,
                  barThickness: 28,
                }]
              }}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                  x: {
                    grid: {
                      display: false
                    }
                  },
                  y: {
                    beginAtZero: true,
                    ticks: {
                      callback: (value) => `Rs. ${value.toLocaleString()}`
                    }
                  }
                },
                plugins: {
                  tooltip: {
                    callbacks: {
                      label: (context) => `Rs. ${context.raw.toLocaleString()}`
                    }
                  },
                  legend: {
                    display: false
                  },
                  title: {
                    display: false
                  }
                }
              }}
              height={350}
            />
            )}
            </div>
          </Card.Body>
        </Card>

          <Row>
          
          {/* Arena Revenue Distribution */}
          <Col md={6} className="mb-4">
          <Card className="shadow-sm rounded-5 mb-4 border-1">
            <Card.Body>
              <h4 className="fw-semibold mb-3">🏟️ Revenue Division by Arena</h4> 
              <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', flexDirection: 'column' }}>
              <div style={{ width: '380px', height: '380px', paddingTop:'10px' }}>
              <Pie
                data={{
                  labels: pieData.labels,
                  datasets: [{
                    data: pieData.values,
                    backgroundColor: [
                      '#4e73df', '#1cc88a', '#36b9cc', '#f6c23e', '#e74a3b', '#858796'
                    ],
                    borderWidth: 1
                  }]
                }}
                options={{
                  responsive: true,
                  plugins: {
                    legend: {
                      position: 'bottom'
                    }
                  }
                }}
              />
              </div>
              <div className="d-flex justify-content-between mb-3 p-3">
                <button className="btn btn-primary " onClick={handleReport01Download}>
                  Download Arena Revenue Report
                </button>
              </div>
              </div>
            </Card.Body>
          </Card>
          </Col>

          {/* Most booked courts */}
          <Col md={6} className="mb-4">
          <Card className="shadow-sm rounded-5 mb-4 border-1">
            <Card.Body>
              <h4 className="fw-semibold mb-3">🏟️ Most Booked Courts</h4>
              <div style={{ width: '400px', height: '400px', marginTop:'10px' }}>
                <PieChart width={450} height={400}>
                  <RechartsPie
                    data={data}
                    cx="50%"
                    cy="50%"
                    label
                    outerRadius={175}
                    fill="#8884d8"
                    dataKey="value"
                    nameKey="cName"
                  >
                    {data.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </RechartsPie>
                  <RechartsTooltip />
                  <RechartsLegend />
                </PieChart>
              </div>
              </Card.Body>
          </Card>
          </Col>
          </Row>


          {/* Recent bookings */}
          <Card className="shadow-sm rounded-3 mb-4 border-0">
            <Card.Body>
              <h5 className="fw-semibold mb-3">📅 Recent Bookings</h5>
              <Table striped hover responsive className="align-middle">
                <thead className="table-light">
                  <tr>
                    <th>ID</th><th>Arena</th><th>Court</th><th>Date</th><th>Start</th><th>End</th>
                  </tr>
                </thead>
                <tbody>
                  <AnimatePresence>
                    {(showAllBookings ? bookings : bookings.slice(0, 5)).map(b => (
                      <motion.tr key={b.bookingId}
                        initial={{ opacity: 0, y: -8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -8 }}
                        transition={{ duration: 0.2 }}
                      >
                        <td>{b.bookingId}</td>
                        <td>{b.arenaName}</td>
                        <td>{b.court}</td>
                        <td>{b.booking_date.split('T')[0]}</td>
                        <td>{b.startTime}</td>
                        <td>{b.end_time}</td>
                      </motion.tr>
                    ))}
                  </AnimatePresence>
                </tbody>
              </Table>
              <div className="d-flex justify-content-center">
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  className="btn btn-outline-primary"
                  onClick={() => setShowAllBookings(!showAllBookings)}
                >
                  {showAllBookings ? 'See Less' : 'See More'}
                </motion.button>
              </div>
            </Card.Body>
          </Card>

          {/* Payments */}
          <Card className="shadow-sm rounded-3 mb-4 border-0">
            <Card.Body>
              <h5 className="fw-semibold mb-3">💰 All Transactions Done Realted to Owner</h5>
              <Table striped hover responsive className="align-middle">
                <thead className="table-light">
                  <tr><th>ID</th><th>Description</th><th>Date</th><th>Amount (LKR)</th></tr>
                </thead>
                <tbody>
                  <AnimatePresence>
                    {(showAllPayments ? payments : payments.slice(0, 5)).map(p => (
                      <motion.tr key={p.paymentId}
                        initial={{ opacity: 0, y: -8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -8 }}
                        transition={{ duration: 0.2 }}
                      >
                        <td>{p.paymentId}</td>
                        <td>{p.paymentDesc}</td>
                        <td>{p.paid_at.split('T')[0]}</td>
                        <td>{p.amount}</td>
                      </motion.tr>
                    ))}
                  </AnimatePresence>
                </tbody>
              </Table>
              <div className="d-flex justify-content-center">
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  className="btn btn-outline-primary"
                  onClick={() => setShowAllPayments(!showAllPayments)}
                >
                  {showAllPayments ? 'See Less' : 'See More'}
                </motion.button>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default OwnerDashboard;