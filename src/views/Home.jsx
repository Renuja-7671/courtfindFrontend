import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getArenaByRating, getSportForHome } from '../services/arenaService';

const Homepage = () => {
    const navigate = useNavigate();
    const [arenas, setArenas] = useState([]);
    const [sports, setSports] = useState([]);
    const [selectedSport, setSelectedSport] = useState('');
    const [venueLocation, setVenueLocation] = useState('');
    const [loading, setLoading] = useState(true);
    const [searchLoading, setSearchLoading] = useState(false);
    const [error, setError] = useState('');
    const [showAllArenas, setShowAllArenas] = useState(false);
    const [hoveredCard, setHoveredCard] = useState(null);

    // Fetch initial data
    useEffect(() => {
        fetchInitialData();
    }, []);

    const fetchInitialData = async () => {
        try {
            setLoading(true);
            const [arenasData, sportsData] = await Promise.all([
                getArenaByRating(),
                getSportForHome()
            ]);
            setArenas(arenasData);
            setSports(sportsData);
            setError('');
        } catch (err) {
            console.error('Error fetching initial data:', err);
            setError('Failed to load data. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = async (e) => {
        e.preventDefault();
        
        if (!selectedSport && !venueLocation) {
            setError('Please select a sport or enter a venue location');
            return;
        }

        const searchParams = new URLSearchParams();
        if (selectedSport) searchParams.append('sport', selectedSport);
        if (venueLocation) searchParams.append('venue', venueLocation);
        navigate(`/explore-now?${searchParams.toString()}`);
    };

    const handleSportSelection = (sportName) => {
        navigate(`/explore-now?sport=${encodeURIComponent(sportName)}`);
    };

    const handleStartBooking = () => {
        if (localStorage.getItem('authToken')) {
            navigate('/explore-now');
        } else {
            localStorage.setItem('redirectAfterLogin', '/explore-now');
            navigate('/login');
        }
    };

    const handleArenaBookNow = (arenaName) => {
        if (localStorage.getItem('authToken')) {
            navigate(`/explore-now?venue=${encodeURIComponent(arenaName)}`);
        } else {
            localStorage.setItem('redirectVenue', arenaName);
            navigate('/login');
        }
    };

    const resetSearch = () => {
        setSelectedSport('');
        setVenueLocation('');
        fetchInitialData();
    };

    const displayedArenas = showAllArenas ? arenas : arenas.slice(0, 6);

    if (loading) {
        return (
            <div className="d-flex justify-content-center align-items-center" style={{ height: '200px' }}>
                <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Loading...</span>
                </div>
            </div>
        );
    }

    return (
        <div className="homepage">
            {/* Hero Section */}
            <section className="hero-section text-center text-white py-5" style={{
                background: 'linear-gradient(rgba(0,0,0,0.5), rgba(0,0,0,0.5)), url(`${process.env.REACT_APP_API_BASE_URL}/uploads/home.png`)',
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                minHeight: '400px'
            }}>
                <div className="container">
                    <h1 className="display-4 fw-bold mb-3">Book Your Sports Arena</h1>
                    <h2 className="h3 mb-4">Effortlessly Today</h2>
                    <p className="lead mb-4">Welcome to our premier sports arena booking system.</p>
                    
                    {/* Process Steps */}
                    <div className="row justify-content-center mt-5">
                        <div className="col-md-3 mb-4">
                            <div className="text-center">
                                <div className="bg-white text-primary rounded-circle d-inline-flex align-items-center justify-content-center mb-3" style={{width: '80px', height: '80px'}}>
                                    <svg width="32" height="32" fill="currentColor" viewBox="0 0 16 16">
                                        <path d="M8 16s6-5.686 6-10A6 6 0 0 0 2 6c0 4.314 6 10 6 10zm0-7a3 3 0 1 1 0-6 3 3 0 0 1 0 6z"/>
                                    </svg>
                                </div>
                                <h5>Step 01: Choose Your Desired Arena</h5>
                                <p className="small">Browse our extensive list of available sports arenas.</p>
                            </div>
                        </div>
                        <div className="col-md-3 mb-4">
                            <div className="text-center">
                                <div className="bg-white text-primary rounded-circle d-inline-flex align-items-center justify-content-center mb-3" style={{width: '80px', height: '80px'}}>
                                    <svg width="32" height="32" fill="currentColor" viewBox="0 0 16 16">
                                        <path d="M3.5 0a.5.5 0 0 1 .5.5V1h8V.5a.5.5 0 0 1 1 0V1h1a2 2 0 0 1 2 2v11a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2V3a2 2 0 0 1 2-2h1V.5a.5.5 0 0 1 .5-.5zM1 4v10a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V4H1z"/>
                                    </svg>
                                </div>
                                <h5>Step 02: Select Your Date and Time</h5>
                                <p className="small">Pick the date and time that works best for you.</p>
                            </div>
                        </div>
                        <div className="col-md-3 mb-4">
                            <div className="text-center">
                                <div className="bg-white text-primary rounded-circle d-inline-flex align-items-center justify-content-center mb-3" style={{width: '80px', height: '80px'}}>
                                    <svg width="32" height="32" fill="currentColor" viewBox="0 0 16 16">
                                        <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14zm0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16z"/>
                                        <path d="M10.97 4.97a.235.235 0 0 0-.02.022L7.477 9.417 5.384 7.323a.75.75 0 0 0-1.06 1.06L6.97 11.03a.75.75 0 0 0 1.079-.02l3.992-4.99a.75.75 0 0 0-1.071-1.05z"/>
                                    </svg>
                                </div>
                                <h5>Step 03: Complete Your Booking Details</h5>
                                <p className="small">Fill out the necessary information to finalize your booking.</p>
                            </div>
                        </div>
                    </div>
                    
                    <button 
                        className="btn btn-primary btn-lg mt-4"
                        onClick={handleStartBooking}
                    >
                        Start Booking
                    </button>
                </div>
            </section>

            <div className="container my-5">
                {/* Sports Selection */}
                <section className="mb-5">
                    <h3 className="mb-4">Explore by Sports</h3>
                    <div className="row">
                        {sports.map((sport) => (
                            <div key={sport.sportId} className="col-6 col-md-2 mb-3">
                                <button 
                                    className="btn btn-outline-primary w-100 py-2"
                                    onClick={() => handleSportSelection(sport.name)}
                                >
                                    {sport.name}
                                </button>
                            </div>
                        ))}
                    </div>
                </section>

                {/* Search Form */}
                <section className="mb-5">
                    <div className="row justify-content-center">
                        <div className="col-md-8">
                            <div className="row">
                                <div className="col-md-5">
                                    <div className="mb-3">
                                        <label className="form-label">Sport</label>
                                        <input 
                                            type="text" 
                                            className="form-control"
                                            placeholder="Enter a sport"
                                            value={selectedSport} 
                                            onChange={(e) => setSelectedSport(e.target.value)}
                                        />
                                    </div>
                                </div>
                                <div className="col-md-5">
                                    <div className="mb-3">
                                        <label className="form-label">Venue</label>
                                        <input 
                                            type="text" 
                                            className="form-control"
                                            placeholder="Enter a venue or city"
                                            value={venueLocation}
                                            onChange={(e) => setVenueLocation(e.target.value)}
                                        />
                                    </div>
                                </div>
                                <div className="col-md-2 d-flex align-items-end">
                                    <button 
                                        className="btn btn-primary w-100 mb-3"
                                        disabled={searchLoading}
                                        onClick={handleSearch}
                                    >
                                        {searchLoading ? (
                                            <div className="spinner-border spinner-border-sm" role="status">
                                                <span className="visually-hidden">Loading...</span>
                                            </div>
                                        ) : (
                                            <svg width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                                                <path d="M11.742 10.344a6.5 6.5 0 1 0-1.397 1.398h-.001c.03.04.062.078.098.115l3.85 3.85a1 1 0 0 0 1.415-1.414l-3.85-3.85a1.007 1.007 0 0 0-.115-.1zM12 6.5a5.5 5.5 0 1 1-11 0 5.5 5.5 0 0 1 11 0z"/>
                                            </svg>
                                        )}
                                    </button>
                                </div>
                            </div>
                            
                            {(selectedSport || venueLocation) && (
                                <div className="text-center">
                                    <button className="btn btn-outline-secondary btn-sm" onClick={resetSearch}>
                                        Clear Search
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </section>

                {/* Error Display */}
                {error && (
                    <div className="alert alert-danger mb-4" role="alert">
                        {error}
                    </div>
                )}

                {/* Featured Venues */}
                <section className="mb-5">
                    <div className="d-flex justify-content-between align-items-center mb-4">
                        <h3>Featured Venues</h3>
                        {arenas.length > 6 && (
                            <button 
                                className="btn btn-outline-primary"
                                onClick={() => setShowAllArenas(!showAllArenas)}
                            >
                                {showAllArenas ? 'Show Less' : 'See More'}
                            </button>
                        )}
                    </div>
                    
                    {displayedArenas.length === 0 ? (
                        <div className="text-center py-5">
                            <h5>No venues found</h5>
                            <p className="text-muted">Try adjusting your search criteria.</p>
                        </div>
                    ) : (
                        <div className="row">
                            {displayedArenas.map((arena) => (
                                <div key={arena.arenaId} className="col-md-4 mb-4">
                                    <div 
                                        className="card h-100 position-relative"
                                        onMouseEnter={() => setHoveredCard(arena.arenaId)}
                                        onMouseLeave={() => setHoveredCard(null)}
                                        style={{ cursor: 'pointer', overflow: 'hidden' }}
                                    >
                                        <img 
                                            src={arena.image_url ? `${process.env.REACT_APP_API_BASE_URL}${arena.image_url}` : "https://via.placeholder.com/300x200?text=Arena+Image"}
                                            className="card-img-top"
                                            alt={arena.name}
                                            style={{ height: '200px', objectFit: 'cover' }}
                                        />
                                        
                                        {/* Default content - always visible */}
                                        <div className="card-body d-flex flex-column">
                                            <h5 className="card-title">{arena.name}</h5>
                                            <p className="card-text text-muted">
                                                <svg width="16" height="16" fill="currentColor" viewBox="0 0 16 16" className="me-2">
                                                    <path d="M8 16s6-5.686 6-10A6 6 0 0 0 2 6c0 4.314 6 10 6 10zm0-7a3 3 0 1 1 0-6 3 3 0 0 1 0 6z"/>
                                                </svg>
                                                {arena.city}, {arena.country}
                                            </p>
                                            <div className="d-flex justify-content-between align-items-center mt-auto">
                                                <div>
                                                    <svg width="16" height="16" fill="gold" viewBox="0 0 16 16" className="me-1">
                                                        <path d="M3.612 15.443c-.386.198-.824-.149-.746-.592l.83-4.73L.173 6.765c-.329-.314-.158-.888.283-.95l4.898-.696L7.538.792c.197-.39.73-.39.927 0l2.184 4.327 4.898.696c.441.062.612.636.282.95l-3.522 3.356.83 4.73c.078.443-.36.79-.746.592L8 13.187l-4.389 2.256z"/>
                                                    </svg>
                                                    <span className="fw-bold">
                                                        {arena.average_rating ? Number(arena.average_rating).toFixed(1) : 'No rating'}
                                                    </span>
                                                </div>
                                                <button 
                                                    className="btn btn-primary btn-sm" 
                                                    onClick={() => handleArenaBookNow(arena.name)}
                                                >
                                                    Book Now
                                                </button>
                                            </div>
                                        </div>
                                        
                                        {/* Hover overlay with description */}
                                        {hoveredCard === arena.arenaId && (
                                            <div 
                                                className="position-absolute top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center"
                                                style={{ 
                                                    backgroundColor: 'rgba(0, 0, 0, 0.85)',
                                                    color: 'white',
                                                    zIndex: 10,
                                                    transition: 'all 0.3s ease'
                                                }}
                                            >
                                                <div className="text-center p-4">
                                                    <h5 className="mb-3">{arena.name}</h5>
                                                    <p className="mb-3">{arena.description}</p>
                                                    <div className="mb-3">
                                                        <svg width="16" height="16" fill="gold" viewBox="0 0 16 16" className="me-1">
                                                            <path d="M3.612 15.443c-.386.198-.824-.149-.746-.592l.83-4.73L.173 6.765c-.329-.314-.158-.888.283-.95l4.898-.696L7.538.792c.197-.39.73-.39.927 0l2.184 4.327 4.898.696c.441.062.612.636.282.95l-3.522 3.356.83 4.73c.078.443-.36.79-.746.592L8 13.187l-4.389 2.256z"/>
                                                        </svg>
                                                        <span className="fw-bold">
                                                            {arena.average_rating ? Number(arena.average_rating).toFixed(1) : 'No rating'}
                                                        </span>
                                                    </div>
                                                    <button 
                                                        className="btn btn-primary" 
                                                        onClick={() => handleArenaBookNow(arena.name)}
                                                    >
                                                        Book Now
                                                    </button>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </section>
            </div>
        </div>
    );
};

export default Homepage;