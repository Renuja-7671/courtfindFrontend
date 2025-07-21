// ArenaManagement.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Container, Row, Col, Card, Button, Form, Alert, Spinner } from "react-bootstrap";
import { useAuth } from "../contexts/AuthContext";
import Sidebar from "../components/ownerSidebar";
import { 
  getArenasByOwner, 
  updateArenaName, 
  deleteArena 
} from "../services/arenaService";
import { 
  getCourtsByArena, 
  updateCourtName, 
  deleteCourt 
} from "../services/courtService";

const ArenaManagement = () => {
  const [arenas, setArenas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [editingArena, setEditingArena] = useState(null);
  const [editingCourt, setEditingCourt] = useState(null);
  const [editValues, setEditValues] = useState({});
  
  const navigate = useNavigate();
  const { authToken } = useAuth();

  // Fetch owner's arenas and their courts
  const fetchArenasAndCourts = async () => {
    try {
      setLoading(true);
      setError("");
      
      // Get owner's arenas
      const arenasData = await getArenasByOwner(authToken);
      
      // Get courts for each arena
      const arenasWithCourts = await Promise.all(
        arenasData.map(async (arena) => {
          try {
            const courts = await getCourtsByArena(arena.arenaId, authToken);
            return { ...arena, courts };
          } catch (err) {
            console.error(`Error fetching courts for arena ${arena.arenaId}:`, err);
            return { ...arena, courts: [] };
          }
        })
      );
      
      setArenas(arenasWithCourts);
    } catch (err) {
      console.error("Error fetching arenas:", err);
      setError("Failed to load arenas. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchArenasAndCourts();
  }, [authToken]);

  // Filter arenas by search term
  const filteredArenas = arenas.filter(arena =>
    arena.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Handle arena name edit
  const handleEditArena = (arenaId, currentName) => {
    setEditingArena(arenaId);
    setEditValues({ ...editValues, [`arena_${arenaId}`]: currentName });
  };

  // Handle court name edit
  const handleEditCourt = (courtId, currentName) => {
    setEditingCourt(courtId);
    setEditValues({ ...editValues, [`court_${courtId}`]: currentName });
  };

  // Save arena name
  const saveArenaName = async (arenaId) => {
    try {
      const newName = editValues[`arena_${arenaId}`];
      if (!newName || newName.trim() === "") {
        alert("Arena name cannot be empty");
        return;
      }

      await updateArenaName(arenaId, newName, authToken);
      
      // Update local state
      setArenas(arenas.map(arena =>
        arena.arenaId === arenaId ? { ...arena, name: newName } : arena
      ));
      
      setEditingArena(null);
      setEditValues({ ...editValues, [`arena_${arenaId}`]: "" });
    } catch (err) {
      console.error("Error updating arena name:", err);
      alert("Failed to update arena name");
    }
  };

  // Save court name
  const saveCourtName = async (courtId) => {
    try {
      const newName = editValues[`court_${courtId}`];
      if (!newName || newName.trim() === "") {
        alert("Court name cannot be empty");
        return;
      }

      await updateCourtName(courtId, newName, authToken);
      
      // Update local state
      setArenas(arenas.map(arena => ({
        ...arena,
        courts: arena.courts.map(court =>
          court.courtId === courtId ? { ...court, name: newName } : court
        )
      })));
      
      setEditingCourt(null);
      setEditValues({ ...editValues, [`court_${courtId}`]: "" });
    } catch (err) {
      console.error("Error updating court name:", err);
      alert("Failed to update court name");
    }
  };

  // Delete arena
  const handleDeleteArena = async (arenaId) => {
    if (window.confirm("Are you sure you want to delete this arena? This will also delete all associated courts.")) {
      try {
        await deleteArena(arenaId, authToken);
        setArenas(arenas.filter(arena => arena.arenaId !== arenaId));
      } catch (err) {
        console.error("Error deleting arena:", err);
        alert("Failed to delete arena");
      }
    }
  };

 const handleDeleteCourt = async (courtId) => {
  if (window.confirm("Are you sure you want to delete this court?")) {
    try {
      await deleteCourt(courtId, authToken);
      setArenas(arenas.map(arena => ({
        ...arena,
        courts: arena.courts.filter(court => court.courtId !== courtId)
      })));
      setError(""); // clear any previous error
    } catch (err) {
      console.error("Error deleting court:", err);
      const message = err.response?.data?.message || "Failed to delete court";
      setError(message); // THIS is what triggers your existing <Alert>
    }
  }
};



  // Navigate to add court page with arena ID
  const handleAddCourt = (arenaId) => {
    navigate("/add-courts", { state: { arenaId } });
  };

  // Cancel editing
  const cancelEdit = (type, id) => {
    if (type === 'arena') {
      setEditingArena(null);
      setEditValues({ ...editValues, [`arena_${id}`]: "" });
    } else {
      setEditingCourt(null);
      setEditValues({ ...editValues, [`court_${id}`]: "" });
    }
  };

  if (loading) {
    return (
      <Container className="min-vh-100 d-flex justify-content-center align-items-center">
        <Spinner animation="border" size="lg" />
      </Container>
    );
  }

  return (
    <Container className="min-vh-100 d-flex flex-column  align-items-center">
        <Row className="w-100" text-center>
            <Col className="p-4 m-0"  md={3}>
          <Sidebar />
        </Col>
        <Col md={9} style={{ padding: "2rem 3rem" }}>
            {/* Search Bar */}
            <div style={{ 
              display: "flex", 
              justifyContent: "center", 
              marginBottom: "3rem" 
            }}>
              <div style={{ position: "relative", width: "420px" }}>
                <Form.Control
                  type="text"
                  placeholder="Search by Arena Name"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  style={{
                    paddingLeft: "3rem",
                    paddingRight: "1rem",
                    height: "44px",
                    borderRadius: "22px",
                    border: "2px solid #e2e8f0",
                    fontSize: "0.95rem",
                    backgroundColor: "white",
                    boxShadow: "0 2px 4px rgba(0, 0, 0, 0.04)",
                    outline: "none",
                    transition: "all 0.2s ease"
                  }}
                  onFocus={(e) => e.target.style.borderColor = "#3b82f6"}
                  onBlur={(e) => e.target.style.borderColor = "#e2e8f0"}
                />
                <div style={{
                  position: "absolute",
                  left: "1rem",
                  top: "50%",
                  transform: "translateY(-50%)",
                  fontSize: "1.1rem",
                  color: "#64748b"
                }}>
                  🔍
                </div>
              </div>
            </div>

            {/* Header with Add Button */}
            <div style={{ 
              display: "flex", 
              justifyContent: "space-between", 
              alignItems: "center", 
              marginBottom: "2.5rem" 
            }}>
              <h2 style={{ 
                fontSize: "2rem", 
                fontWeight: "700",
                color: "#1e293b",
                margin: 0,
                letterSpacing: "-0.025em"
              }}>
                Manage Arenas
              </h2>
              <Button 
                style={{
                  backgroundColor: "#3b82f6",
                  border: "none",
                  borderRadius: "8px",
                  padding: "0.75rem 1.5rem",
                  fontSize: "0.95rem",
                  fontWeight: "500",
                  boxShadow: "0 2px 4px rgba(59, 130, 246, 0.2)",
                  transition: "all 0.2s ease"
                }}
                onMouseEnter={(e) => e.target.style.backgroundColor = "#2563eb"}
                onMouseLeave={(e) => e.target.style.backgroundColor = "#3b82f6"}
                onClick={() => navigate("/add-arena")}
              >
                Add a new arena
              </Button>
            </div>

            {error && <Alert variant="danger">{error}</Alert>}

            {/* Arena Cards */}
            {filteredArenas.length === 0 ? (
              <Alert variant="info" style={{ 
                backgroundColor: "#f0f9ff", 
                border: "1px solid #bfdbfe",
                borderRadius: "12px",
                padding: "1.5rem",
                fontSize: "0.95rem"
              }}>
                {searchTerm ? "No arenas found matching your search." : "No arenas found. Add your first arena to get started."}
              </Alert>
            ) : (
              filteredArenas.map((arena) => (
                <Card key={arena.arenaId} style={{ 
                  marginBottom: "2rem",
                  borderRadius: "16px",
                  border: "1px solid #e2e8f0",
                  backgroundColor: "white",
                  boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
                  transition: "all 0.2s ease"
                }}>
                  <Card.Body style={{ padding: "2rem" }}>
                    {/* Arena Name Section */}
                    <div style={{ 
                      display: "flex", 
                      justifyContent: "space-between", 
                      alignItems: "center", 
                      marginBottom: "1.5rem",
                      paddingBottom: "1rem",
                      borderBottom: "1px solid #f1f5f9"
                    }}>
                      <div style={{ display: "flex", alignItems: "center" }}>
                        <span style={{ 
                          fontWeight: "600", 
                          color: "#475569",
                          fontSize: "0.95rem",
                          marginRight: "0.75rem"
                        }}>
                          Arena Name:
                        </span>
                        {editingArena === arena.arenaId ? (
                          <div style={{ display: "flex", alignItems: "center" }}>
                            <Form.Control
                              type="text"
                              value={editValues[`arena_${arena.arenaId}`] || ""}
                              onChange={(e) => setEditValues({
                                ...editValues,
                                [`arena_${arena.arenaId}`]: e.target.value
                              })}
                              style={{ 
                                width: "240px",
                                marginRight: "0.5rem",
                                fontSize: "0.95rem",
                                border: "2px solid #3b82f6",
                                borderRadius: "6px",
                                padding: "0.5rem 0.75rem"
                              }}
                            />
                            <Button
                              variant="success"
                              size="sm"
                              onClick={() => saveArenaName(arena.arenaId)}
                              style={{ 
                                marginRight: "0.5rem",
                                borderRadius: "6px",
                                padding: "0.4rem 0.7rem"
                              }}
                            >
                              ✓
                            </Button>
                            <Button
                              variant="secondary"
                              size="sm"
                              onClick={() => cancelEdit('arena', arena.arenaId)}
                              style={{ 
                                borderRadius: "6px",
                                padding: "0.4rem 0.7rem"
                              }}
                            >
                              ✕
                            </Button>
                          </div>
                        ) : (
                          <div style={{ display: "flex", alignItems: "center" }}>
                            <span style={{ 
                              fontSize: "1.25rem", 
                              fontWeight: "600",
                              color: "#1e293b"
                            }}>
                              {arena.name}
                            </span>
                            <Button
                              variant="link"
                              size="sm"
                              onClick={() => handleEditArena(arena.arenaId, arena.name)}
                              style={{ 
                                padding: "0.25rem 0.5rem",
                                marginLeft: "0.5rem",
                                color: "#64748b",
                                fontSize: "1rem"
                              }}
                            >
                              ✏️
                            </Button>
                          </div>
                        )}
                      </div>
                      <Button 
                        style={{
                          backgroundColor: "#dc2626",
                          border: "none",
                          borderRadius: "8px",
                          padding: "0.6rem 1.2rem",
                          fontSize: "0.9rem",
                          fontWeight: "500",
                          boxShadow: "0 2px 4px rgba(220, 38, 38, 0.2)",
                          transition: "all 0.2s ease"
                        }}
                        onMouseEnter={(e) => e.target.style.backgroundColor = "#b91c1c"}
                        onMouseLeave={(e) => e.target.style.backgroundColor = "#dc2626"}
                        onClick={() => handleDeleteArena(arena.arenaId)}
                      >
                        Remove Arena
                      </Button>
                    </div>

                    {/* Available Courts Section */}
                    <div style={{ marginBottom: "1.5rem" }}>
                      <span style={{ 
                        fontWeight: "600", 
                        color: "#475569",
                        fontSize: "1rem"
                      }}>
                        Available Courts:
                      </span>
                    </div>

                    {arena.courts.length === 0 ? (
                      <Alert variant="warning" style={{ 
                        backgroundColor: "#fef3c7", 
                        border: "1px solid #f59e0b",
                        borderRadius: "8px",
                        padding: "1rem",
                        fontSize: "0.9rem",
                        margin: "0 0 1.5rem 0"
                      }}>
                        No courts available for this arena.
                      </Alert>
                    ) : (
                      <div style={{ marginBottom: "1.5rem" }}>
                        {arena.courts.map((court) => (
                          <div key={court.courtId} style={{ 
                            display: "flex", 
                            justifyContent: "space-between", 
                            alignItems: "center", 
                            marginBottom: "0.75rem",
                            padding: "1rem 1.25rem",
                            backgroundColor: "#f8fafc",
                            borderRadius: "10px",
                            border: "1px solid #e2e8f0",
                            transition: "all 0.2s ease"
                          }}>
                            <div style={{ display: "flex", alignItems: "center", flex: 1 }}>
                              {editingCourt === court.courtId ? (
                                <div style={{ display: "flex", alignItems: "center" }}>
                                  <Form.Control
                                    type="text"
                                    value={editValues[`court_${court.courtId}`] || ""}
                                    onChange={(e) => setEditValues({
                                      ...editValues,
                                      [`court_${court.courtId}`]: e.target.value
                                    })}
                                    style={{ 
                                      width: "200px",
                                      marginRight: "0.5rem",
                                      fontSize: "0.9rem",
                                      border: "2px solid #3b82f6",
                                      borderRadius: "6px",
                                      padding: "0.4rem 0.7rem"
                                    }}
                                  />
                                  <Button
                                    variant="success"
                                    size="sm"
                                    onClick={() => saveCourtName(court.courtId)}
                                    style={{ 
                                      marginRight: "0.5rem",
                                      borderRadius: "6px",
                                      padding: "0.3rem 0.6rem"
                                    }}
                                  >
                                    ✓
                                  </Button>
                                  <Button
                                    variant="secondary"
                                    size="sm"
                                    onClick={() => cancelEdit('court', court.courtId)}
                                    style={{ 
                                      borderRadius: "6px",
                                      padding: "0.3rem 0.6rem"
                                    }}
                                  >
                                    ✕
                                  </Button>
                                </div>
                              ) : (
                                <div style={{ display: "flex", alignItems: "center" }}>
                                  <span style={{ 
                                    fontSize: "1rem",
                                    fontWeight: "500",
                                    color: "#334155"
                                  }}>
                                    {court.name}
                                  </span>
                                  <Button
                                    variant="link"
                                    size="sm"
                                    onClick={() => handleEditCourt(court.courtId, court.name)}
                                    style={{ 
                                      padding: "0.25rem 0.5rem",
                                      marginLeft: "0.5rem",
                                      color: "#64748b",
                                      fontSize: "0.9rem"
                                    }}
                                  >
                                    ✏️
                                  </Button>
                                </div>
                              )}
                            </div>
                            <Button 
                              variant="link"
                              size="sm"
                              onClick={() => handleDeleteCourt(court.courtId)}
                              style={{ 
                                color: "#dc2626",
                                padding: "0.5rem",
                                fontSize: "1.1rem",
                                marginLeft: "1rem"
                              }}
                            >
                              🗑️
                            </Button>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Add Court Button */}
                    <div style={{ textAlign: "center", marginTop: "1.5rem" }}>
                      <Button 
                        style={{
                          backgroundColor: "#3b82f6",
                          border: "none",
                          borderRadius: "8px",
                          padding: "0.75rem 1.5rem",
                          fontSize: "0.95rem",
                          fontWeight: "500",
                          boxShadow: "0 2px 4px rgba(59, 130, 246, 0.2)",
                          transition: "all 0.2s ease"
                        }}
                        onMouseEnter={(e) => e.target.style.backgroundColor = "#2563eb"}
                        onMouseLeave={(e) => e.target.style.backgroundColor = "#3b82f6"}
                        onClick={() => handleAddCourt(arena.arenaId)}
                      >
                        Add a court
                      </Button>
                    </div>
                  </Card.Body>
                </Card>
              ))
            )}

            {/* See More Button */}
            {filteredArenas.length > 0 && (
              <div style={{ textAlign: "center", marginTop: "3rem" }}>
                <Button 
                  style={{
                    backgroundColor: "#3b82f6",
                    border: "none",
                    borderRadius: "10px",
                    padding: "0.875rem 2.5rem",
                    fontSize: "1rem",
                    fontWeight: "500",
                    boxShadow: "0 4px 6px -1px rgba(59, 130, 246, 0.3)",
                    transition: "all 0.2s ease"
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.backgroundColor = "#2563eb";
                    e.target.style.transform = "translateY(-1px)";
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.backgroundColor = "#3b82f6";
                    e.target.style.transform = "translateY(0)";
                  }}
                >
                  See More
                </Button>
              </div>
            )}
          </Col>
        </Row>
      </Container>
  );
};

export default ArenaManagement;