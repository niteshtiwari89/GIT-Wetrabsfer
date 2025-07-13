import React, { useState } from 'react';
import axios from 'axios';

const API_BASE = 'http://localhost:5000/api';

export default function SearchAndBook(){
  const [searchData, setSearchData] = useState({
    capacityRequired: '',
    fromPincode: '',
    toPincode: '',
    startTime: ''
  });
  const [searchResults, setSearchResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('');
  const [bookingLoading, setBookingLoading] = useState('');
  const [bookingSuccess, setBookingSuccess] = useState(null);

  // Set default start time to current time + 1 hour
  React.useEffect(() => {
    const now = new Date();
    now.setHours(now.getHours() + 1);
    const defaultTime = now.toISOString().slice(0, 16);
    setSearchData(prev => ({
      ...prev,
      startTime: defaultTime
    }));
  }, []);

  const handleSearchChange = (e) => {
    const { name, value } = e.target;
    setSearchData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    setSearchResults(null);
    setBookingSuccess(null);

    try {
      const params = new URLSearchParams({
        capacityRequired: searchData.capacityRequired,
        fromPincode: searchData.fromPincode,
        toPincode: searchData.toPincode,
        startTime: new Date(searchData.startTime).toISOString()
      });

      const response = await axios.get(`${API_BASE}/vehicles/available?${params}`);
      setSearchResults(response.data);
      
      if (response.data.vehicles.length === 0) {
        setMessage('No vehicles available for the specified criteria.');
        setMessageType('info');
      } else {
        setMessage(`Found ${response.data.vehicles.length} available vehicles. Estimated ride duration: ${response.data.estimatedRideDurationHours} hours`);
        setMessageType('info');
      }
    } catch (error) {
      const errorMessage = error.response?.data?.error || error.message;
      setMessage(`Error: ${errorMessage}`);
      setMessageType('error');
    } finally {
      setLoading(false);
    }
  };

  const handleBookNow = async (vehicleId) => {
    setBookingLoading(vehicleId);
    setMessage('');
    setBookingSuccess(null);

    try {
      const bookingData = {
        vehicleId: vehicleId,
        fromPincode: searchData.fromPincode,
        toPincode: searchData.toPincode,
        startTime: new Date(searchData.startTime).toISOString(),
        customerId: 'WEB_USER_001' // Hardcoded customer ID as suggested
      };

      const response = await axios.post(`${API_BASE}/bookings`, bookingData);
      
      setBookingSuccess(response.data);
      setMessage(`Booking created successfully! Booking ID: ${response.data._id}`);
      setMessageType('success');
      
      // Remove the booked vehicle from search results
      setSearchResults(prev => ({
        ...prev,
        vehicles: prev.vehicles.filter(v => v._id !== vehicleId)
      }));
    } catch (error) {
      let errorMessage = 'Unknown error occurred';
      
      if (error.response?.status === 409) {
        errorMessage = 'Vehicle became unavailable - already booked for an overlapping time slot';
      } else if (error.response?.status === 404) {
        errorMessage = 'Vehicle not found';
      } else if (error.response?.data?.error) {
        errorMessage = error.response.data.error;
      } else if (error.response?.data?.details) {
        errorMessage = error.response.data.details;
      } else {
        errorMessage = error.message;
      }
      
      setMessage(`Booking Error: ${errorMessage}`);
      setMessageType('error');
    } finally {
      setBookingLoading('');
    }
  };

  const formatDateTime = (dateString) => {
    return new Date(dateString).toLocaleString();
  };

  return (
    <div>
      <h2>Search & Book Vehicles</h2>
      
      {message && (
        <div className={`alert alert-${messageType}`}>
          {message}
        </div>
      )}

      <form onSubmit={handleSearch}>
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="capacityRequired">Required Capacity (kg):</label>
            <input
              type="number"
              id="capacityRequired"
              name="capacityRequired"
              value={searchData.capacityRequired}
              onChange={handleSearchChange}
              min="1"
              required
              placeholder="e.g., 500"
            />
          </div>
          <div className="form-group">
            <label htmlFor="startTime">Start Date & Time:</label>
            <input
              type="datetime-local"
              id="startTime"
              name="startTime"
              value={searchData.startTime}
              onChange={handleSearchChange}
              required
            />
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="fromPincode">From Pincode:</label>
            <input
              type="text"
              id="fromPincode"
              name="fromPincode"
              value={searchData.fromPincode}
              onChange={handleSearchChange}
              required
              placeholder="e.g., 110001"
            />
          </div>
          <div className="form-group">
            <label htmlFor="toPincode">To Pincode:</label>
            <input
              type="text"
              id="toPincode"
              name="toPincode"
              value={searchData.toPincode}
              onChange={handleSearchChange}
              required
              placeholder="e.g., 110010"
            />
          </div>
        </div>

        <button type="submit" className="btn" disabled={loading}>
          {loading ? 'Searching...' : 'Search Availability'}
        </button>
      </form>

      {bookingSuccess && (
        <div className="booking-success">
          <h3>✅ Booking Confirmed!</h3>
          <div className="booking-details">
            <p><strong>Booking ID:</strong> {bookingSuccess._id}</p>
            <p><strong>Vehicle:</strong> {bookingSuccess.vehicleId.name}</p>
            <p><strong>Route:</strong> {bookingSuccess.fromPincode} → {bookingSuccess.toPincode}</p>
            <p><strong>Start Time:</strong> {formatDateTime(bookingSuccess.startTime)}</p>
            <p><strong>End Time:</strong> {formatDateTime(bookingSuccess.endTime)}</p>
            <p><strong>Duration:</strong> {bookingSuccess.estimatedRideDurationHours} hours</p>
            <p><strong>Customer:</strong> {bookingSuccess.customerId}</p>
          </div>
        </div>
      )}

      {searchResults && (
        <div className="search-results">
          <h3>Available Vehicles</h3>
          {searchResults.vehicles.length === 0 ? (
            <div className="no-results">
              No vehicles match your search criteria. Try adjusting the capacity requirement or time.
            </div>
          ) : (
            searchResults.vehicles.map(vehicle => (
              <div key={vehicle._id} className="vehicle-card">
                <div className="vehicle-name">{vehicle.name}</div>
                <div className="vehicle-specs">
                  <div className="spec">
                    <div className="spec-label">Vehicle Name</div>
                    <div className="spec-value">{vehicle.name}</div>
                  </div>
                  <div className="spec">
                    <div className="spec-label">Capacity</div>
                    <div className="spec-value">{vehicle.capacityKg} kg</div>
                  </div>
                  <div className="spec">
                    <div className="spec-label">Tyres</div>
                    <div className="spec-value">{vehicle.tyres}</div>
                  </div>
                  <div className="spec">
                    <div className="spec-label">Estimated Ride Duration</div>
                    <div className="spec-value">{searchResults.estimatedRideDurationHours} hours</div>
                  </div>
                </div>
                <button 
                  className="btn btn-success" 
                  onClick={() => handleBookNow(vehicle._id)}
                  disabled={bookingLoading === vehicle._id}
                >
                  {bookingLoading === vehicle._id ? 'Booking...' : 'Book Now'}
                </button>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};
