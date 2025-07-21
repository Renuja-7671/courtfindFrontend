import React, { useState, useEffect } from 'react';
import { Container, Card, Dropdown, Table, Button, Tabs, Tab, Row, Col } from 'react-bootstrap';
import Sidebar from "../components/ownerSidebar";
import { Line } from 'react-chartjs-2';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js';
import {
  getTotalRevenueService,
  getYearlyChartDataService,
  getMonthlyChartDataService,
  getAllTransactionsService,
  getPaymentHistoryService,
  getCurrentMonthRevenueService
} from '../services/ownerAuthService';
import { FaDownload, FaEye, FaEyeSlash } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

const MyProfitPage = () => {
  const [showAllTransactions, setShowAllTransactions] = useState(false);
  const [showAllPayments, setShowAllPayments] = useState(false);
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [currentMonthRevenue, setCurrentMonthRevenue] = useState(0);
  const [yearlyChartData, setYearlyChartData] = useState({ labels: [], datasets: [] });
  const [monthlyChartData, setMonthlyChartData] = useState({ labels: [], datasets: [] });
  const [transactions, setTransactions] = useState([]);
  const [payments, setPayments] = useState([]);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [showCombinedLine, setShowCombinedLine] = useState(false);
  const navigate = useNavigate();
  const token = localStorage.getItem('token');

  const years = Array.from({ length: 3 }, (_, i) => new Date().getFullYear() - i);
  const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

  const arenaColors = [
    '#007bff', '#6c757d', '#28a745', '#dc3545',
    '#ffc107', '#17a2b8', '#6f42c1', '#fd7e14'
  ];

  const createCombinedData = (chartData) => {
    if (!chartData.datasets || chartData.datasets.length === 0) return chartData;

    const combinedData = chartData.labels.map((_, index) =>
      chartData.datasets.reduce((sum, dataset) => sum + (dataset.data[index] || 0), 0)
    );

    const datasetsWithCombined = [
      ...chartData.datasets.map((dataset, index) => ({
        ...dataset,
        borderColor: arenaColors[index % arenaColors.length],
        backgroundColor: arenaColors[index % arenaColors.length] + '20',
        borderWidth: 2,
        tension: 0.4,
        pointRadius: 4,
        pointHoverRadius: 6,
        hidden: false
      })),
      ...(showCombinedLine ? [{
        label: 'Total Combined',
        data: combinedData,
        borderColor: '#1F2937',
        backgroundColor: '#1F293720',
        borderWidth: 3,
        borderDash: [5, 5],
        tension: 0.4,
        pointRadius: 5,
        pointHoverRadius: 7,
      }] : [])
    ];

    return { ...chartData, datasets: datasetsWithCombined };
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
          font: { size: 12, weight: 'normal', family: 'inherit' }
        },
        onClick: () => {}
      },
      title: {
        display: true,
        text: '',
        font: { size: 32, weight: 'bold', family: 'inherit' },
        color: '#1F2937',
        padding: { bottom: 20 }
      },
      tooltip: {
        mode: 'index',
        intersect: false,
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleFont: { size: 14 },
        bodyFont: { size: 12 },
        cornerRadius: 8,
        callbacks: {
          label: (context) => `${context.dataset.label}: LKR ${context.parsed.y.toLocaleString('en-LK')}`
        }
      }
    },
    scales: {
      x: {
        grid: { display: true, color: 'rgba(0,0,0,0.1)' },
        ticks: { font: { size: 11 } }
      },
      y: {
        beginAtZero: true,
        grid: { display: true, color: 'rgba(0,0,0,0.1)' },
        ticks: {
          font: { size: 11 },
          callback: (value) => `LKR ${value.toLocaleString('en-LK')}`
        }
      }
    },
    interaction: {
      mode: 'nearest',
      axis: 'x',
      intersect: false
    }
  };

  const generatePaymentPDF = (payment) => {
  const doc = new jsPDF();

  doc.text("Payment Receipt", 14, 15);

  doc.autoTable({
    startY: 25,
    head: [['Field', 'Value']],
    body: [
      ['Payment ID', payment.paymentId],
      ['Description', payment.payment_description],
      ['Date', new Date(payment.date).toLocaleDateString('en-LK')],
      ['Amount (LKR)', `LKR ${payment.amount.toLocaleString('en-LK')}`],
    ]
  });

  doc.save(`Payment_${payment.paymentId}.pdf`);
};


  // Fetch charts, transactions, payments, total revenue
  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [revenue, yearly, monthly, tx, pay] = await Promise.all([
          getTotalRevenueService(token),
          getYearlyChartDataService(token, selectedYear),
          getMonthlyChartDataService(token, selectedYear, selectedMonth),
          getAllTransactionsService(token),
          getPaymentHistoryService(token)
        ]);

        setTotalRevenue(revenue.totalRevenue || 0);
        setYearlyChartData(yearly);
        setMonthlyChartData(monthly);
        setTransactions(tx);
        setPayments(pay);
      } catch (error) {
        console.error(error);
      }
    };

    if (token) fetchAll();
  }, [token, selectedYear, selectedMonth]);

  // Separate fetch for current month revenue
  useEffect(() => {
    const fetchCurrentMonthRevenue = async () => {
      try {
        const data = await getCurrentMonthRevenueService(token);
        setCurrentMonthRevenue(data.currentMonthRevenue || 0);
      } catch (error) {
        console.error('Error fetching current month revenue:', error);
      }
    };

    if (token) fetchCurrentMonthRevenue();
  }, [token]);

  return (
    <Container className="min-vh-100 d-flex flex-column align-items-center" >
      <Row className="w-100" text-center>
        <Col className="p-4 m-0" md={3}>
          <Sidebar />
        </Col>
        <Col md={9} className="p-4 m-0 d-flex flex-column justify-content-center align-items-center">
          <div className="w-100" style={{ maxWidth: "1200px", backgroundColor: '#f8f9fa' }}>
            
            {/* Header */}
            <Row className="mb-4">
              <Col>
                <h2 className="fw-bold text-dark text-center">Profit Summary</h2>
              </Col>
            </Row>

            {/* Revenue Cards */}
            <Row className="mb-4 justify-content-center" style={{ gap: '1rem'}}>
              <Col md={4}>
                <Card className="text-center shadow-sm border-0" style={{ backgroundColor: '#D6EBFF' }}>
                  <Card.Body>
                    <Card.Title className="fw-bold text-dark">Total Revenue</Card.Title>
                    <Card.Text className="display-6 fw-bold text-dark">
                      {totalRevenue.toLocaleString('en-LK', { style: 'currency', currency: 'LKR' })}
                    </Card.Text>
                  </Card.Body>
                </Card>
              </Col>

              <Col md={3}>
                <Card className="text-center shadow-sm border-0" style={{ backgroundColor: '#FFF3CD' }}>
                  <Card.Body>
                    <Card.Title className="fw-bold text-dark">This Month</Card.Title>
                    <Card.Text className="display-6 fw-bold text-dark">
                      {currentMonthRevenue.toLocaleString('en-LK', { style: 'currency', currency: 'LKR' })}
                    </Card.Text>
                  </Card.Body>
                </Card>
              </Col>
            </Row>

            {/* Charts */}
            <Row className="mb-4">
              <Col>
                <Card className="shadow-sm border-0">
                  <Card.Body>
                    <div className="d-flex justify-content-between align-items-center mb-3">
                      <div className="d-flex gap-3">
                        <Dropdown>
                          <Dropdown.Toggle variant="outline-primary" className="px-3">{selectedYear}</Dropdown.Toggle>
                          <Dropdown.Menu>
                            {years.map(year => (
                              <Dropdown.Item key={year} onClick={() => setSelectedYear(year)}>{year}</Dropdown.Item>
                            ))}
                          </Dropdown.Menu>
                        </Dropdown>

                        <Dropdown>
                          <Dropdown.Toggle variant="outline-primary" className="px-3">{months[selectedMonth - 1]}</Dropdown.Toggle>
                          <Dropdown.Menu>
                            {months.map((month, i) => (
                              <Dropdown.Item key={i} onClick={() => setSelectedMonth(i + 1)}>{month}</Dropdown.Item>
                            ))}
                          </Dropdown.Menu>
                        </Dropdown>
                      </div>

                      <Button
                        variant={showCombinedLine ? "primary" : "outline-primary"}
                        size="sm"
                        onClick={() => setShowCombinedLine(!showCombinedLine)}
                        className="d-flex align-items-center gap-2"
                      >
                        {showCombinedLine ? <FaEyeSlash /> : <FaEye />}
                        {showCombinedLine ? 'Hide Combined' : 'Show Combined'}
                      </Button>
                    </div>

                    <Tabs defaultActiveKey="monthly" className="mb-3">
                      <Tab eventKey="yearly" title="Monthly">
                        <div style={{ height: '400px' }}>
                          <Line
                            options={{
                              ...chartOptions,
                              plugins: {
                                ...chartOptions.plugins,
                                title: {
                                  ...chartOptions.plugins.title,
                                  text: `Arena Profits - ${selectedYear}`
                                }
                              }
                            }}
                            data={createCombinedData(yearlyChartData)}
                          />
                        </div>
                      </Tab>
                      <Tab eventKey="monthly" title="Daily">
                        <div style={{ height: '400px' }}>
                          <Line
                            options={{
                              ...chartOptions,
                              plugins: {
                                ...chartOptions.plugins,
                                title: {
                                  ...chartOptions.plugins.title,
                                  text: `Arena Profits - ${months[selectedMonth - 1]} ${selectedYear}`
                                }
                              }
                            }}
                            data={createCombinedData(monthlyChartData)}
                          />
                        </div>
                      </Tab>
                    </Tabs>

                    {/* Add button here */}
                    <div className="d-flex justify-content-end mt-3">
                      <Button
                        variant="primary"
                        onClick={() => navigate('/courtwise-profit')}
                      >
                        Switch to Detailed View
                      </Button>
                    </div>

                  </Card.Body>
                </Card>
              </Col>
            </Row>

            {/* Recent Transactions */}
            <Row className="mb-4">
              <Col>
                <Card className="shadow-sm border-0">
                  <Card.Body>
                    <h4 className="mb-3 fw-bold">Revenue from Recent Bookings</h4>
                    <Table hover>
                      <thead>
                        <tr>
                          <th>Booking ID</th>
                          <th>Player Name</th>
                          <th>Date</th>
                          <th>Amount (LKR)</th>
                        </tr>
                      </thead>
                      <tbody>
                        {(showAllTransactions ? transactions : transactions.slice(0, 5)).map(tx => (
                          <tr key={tx.bookingId}>
                            <td>{tx.bookingId}</td>
                            <td>{tx.player_name}</td>
                            <td>{new Date(tx.date).toLocaleDateString('en-LK')}</td>
                            <td className="fw-normal">
                              {tx.amount.toLocaleString('en-LK', { style: 'currency', currency: 'LKR' })}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </Table>
                    <div className="d-flex justify-content-end mt-3">
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={() => setShowAllTransactions(!showAllTransactions)}
                      >
                        {showAllTransactions ? 'Show Less' : 'See More'}
                      </Button>
                    </div>
                  </Card.Body>
                </Card>
              </Col>
            </Row>

            {/* Payment History */}
            <Row>
              <Col>
                <Card className="shadow-sm border-0">
                  <Card.Body>
                    <h4 className="mb-3 fw-bold">Payments Done by Owner</h4>
                    <Table hover>
                      <thead>
                        <tr>
                          <th>Payment ID</th>
                          <th>Description</th>
                          <th>Date</th>
                          <th>Amount (LKR)</th>
                          <th>Receipt</th>
                        </tr>
                      </thead>
                      <tbody>
                        {(showAllPayments ? payments : payments.slice(0, 5)).map(payment => (
                          <tr key={payment.paymentId}>
                            <td>{payment.paymentId}</td>
                            <td>{payment.payment_description}</td>
                            <td>{new Date(payment.date).toLocaleDateString('en-LK')}</td>
                            <td className="fw-normal">
                              {payment.amount.toLocaleString('en-LK', { style: 'currency', currency: 'LKR' })}
                            </td>
                            <td>
                          <FaDownload
                            style={{ cursor: 'pointer', color: '#007bff' }}
                            title="Download Receipt"
                            onClick={() => generatePaymentPDF(payment)}
                          />
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </Table>
                    <div className="d-flex justify-content-end mt-3">
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={() => setShowAllPayments(!showAllPayments)}
                      >
                        {showAllPayments ? 'Show Less' : 'See More'}
                      </Button>
                    </div>
                  </Card.Body>
                </Card>
              </Col>
            </Row>

          </div>
        </Col>
      </Row>
    </Container>
  );
};

export default MyProfitPage;
