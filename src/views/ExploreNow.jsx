import React, { useEffect, useState } from "react";
import { Card, Button, Container, Row, Col, Form } from "react-bootstrap";
import { FaSearch } from "react-icons/fa";
import { getAllArenas, searchArenas } from "../services/arenaService";
import { MdOutlineSportsScore } from "react-icons/md";
import { useNavigate, useSearchParams } from "react-router-dom";

const ExploreNow = () => {
    const [arenas, setArenas] = useState([]);
    const [filters, setFilters] = useState({ sport: "", venue: "" });
    const navigate = useNavigate();
    const [searchParams, setSearchParams] = useSearchParams();

    useEffect(() => {
        const fetchData = async () => {
            const sportId = searchParams.get("sportId");
            const sport = searchParams.get("sport") || "";
            const venue = searchParams.get("venue") || "";

            // Pre-populate filters from query parameters
            setFilters(prev => ({ ...prev, sport, venue }));

            let updatedSport = sport;
            if (sportId) {
                try {
                    //console.log("Fetching sport for sportId:", sportId); // Debug log
                    const response = await fetch(`${process.env.REACT_APP_API_BASE_URL}/common/sport`);
                    const sports = await response.json();
                    //console.log("Sports data:", sports); // Debug log
                    updatedSport = sports.find(s => s.id === parseInt(sportId))?.name || "";
                    //console.log("Mapped sport name:", updatedSport); // Debug log
                    if (!updatedSport) {
                        console.warn("No sport name found for sportId:", sportId);
                    }
                    setFilters(prev => ({ ...prev, sport: updatedSport }));
                } catch (error) {
                    console.error("Error fetching sport name:", error);
                }
            }

            // Wait for filters to update before searching
            if (updatedSport || venue) {
                //console.log("Searching with filters:", { sport: updatedSport, venue }); // Debug log
                const data = await searchArenas({ sport: updatedSport, venue });
                //console.log("Search results:", data); // Debug log
                setArenas(data);
            } else {
                const data = await getAllArenas();
                setArenas(data);
            }
        };
        fetchData();
    }, [searchParams]);

    const handleSearch = async () => {
        const data = await searchArenas(filters);
        setArenas(data);
    };

    const handleBookNow = (courtId) => {
        navigate(`/view/${courtId}`);
    };

    const handleClearFilters = async () => {
    setFilters({ sport: "", venue: "" });
    setSearchParams({});
    const data = await getAllArenas();
    setArenas(data);
    };


    return (
        <>
        <style>
                {`
                .card-title {
                    font-size: 1.1rem;
                    font-weight: 600;
                }

                .card-subtitle {
                    font-size: 0.9rem;
                }

                .card:hover {
                    transform: translateY(-5px);
                    transition: 0.3s ease;
                    box-shadow: 0 8px 20px rgba(0, 0, 0, 0.1);
                }
                `}
            </style>
        <Container className="py-5">
            <Row className="justify-content-center text-center mb-4">
                <h2 className="fw-bold display-6">🏟️ Explore Arenas & Courts Near You</h2>
                <p className="text-muted">Search by sport or location to find your ideal spot</p>
            </Row>

            {/* Search Filters */}
            <Row className="justify-content-center mb-5">
                <Col md={4} className="mb-2">
                    <Form.Control
                        placeholder="e.g. Football, Badminton"
                        value={filters.sport}
                        onChange={(e) => setFilters({ ...filters, sport: e.target.value })}
                        className="rounded-pill shadow-sm"
                    />
                </Col>
                <Col md={4} className="mb-2">
                    <Form.Control
                        placeholder="Enter a city or venue"
                        value={filters.venue}
                        onChange={(e) => setFilters({ ...filters, venue: e.target.value })}
                        className="rounded-pill shadow-sm"
                    />
                </Col>
                <Col md="auto" className="mb-2">
                    <Button variant="dark" onClick={handleSearch} className="px-4 py-2 rounded-pill">
                        <FaSearch className="me-2" />
                        Search
                    </Button>
                    <Button variant="outline-secondary" onClick={handleClearFilters} className="px-4 py-2 rounded-pill">
                        View All
                    </Button>
                </Col>
            </Row>

            {/* Arena Cards */}
            <Row>
                {arenas.length === 0 ? (
                    <div className="text-center text-muted fs-5">No arenas found. Try different filters.</div>
                ) : (
                    arenas.map((arena) => (
                        <Col md={4} sm={6} key={arena.id} className="mb-4 d-flex">
                            <Card className="shadow-sm w-100 rounded-4 border-0 overflow-hidden">
                                <div style={{ height: "200px", overflow: "hidden" }}>
                                    <Card.Img
                                        variant="top"
                                        src={`${process.env.REACT_APP_API_BASE_URL}${arena.image_url}`}
                                        style={{ objectFit: "cover", height: "100%", width: "100%" }}
                                    />
                                </div>
                                <Card.Body className="d-flex flex-column justify-content-between">
                                    <div>
                                        <Card.Title className="fw-semibold fs-5">{arena.arenaName}</Card.Title>
                                        <Card.Subtitle className="mb-2 text-muted small">
                                            {arena.courtName} • {arena.city}, {arena.country}
                                        </Card.Subtitle>
                                        <Card.Text className="text-secondary mt-2">
                                            <MdOutlineSportsScore className="me-2" />
                                            {arena.sport}
                                        </Card.Text>
                                    </div>
                                    <div className="text-end">
                                        <Button
                                            variant="outline-dark"
                                            size="sm"
                                            className="rounded-pill px-4 mt-3"
                                            onClick={() => handleBookNow(arena.courtId)}
                                        >
                                            Book Now
                                        </Button>
                                    </div>
                                </Card.Body>
                            </Card>
                        </Col>
                    ))
                )}
            </Row>
        </Container>
        </>
);

};

export default ExploreNow;