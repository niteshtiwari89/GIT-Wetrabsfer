import React, { useState } from 'react';
import { searchAvailableVehicles, createBooking, getAllVehicles } from '../services/api';
import { FaCheckCircle, FaCheck, FaTimes } from 'react-icons/fa';

export default function SearchAndBook() {
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
      const searchParams = {
        capacityRequired: searchData.capacityRequired,
        fromPincode: searchData.fromPincode,
        toPincode: searchData.toPincode,
        startTime: searchData.startTime
      };

      // Get available vehicles for the search criteria
      const availableData = await searchAvailableVehicles(searchParams);
      
      // Get all vehicles to show availability status
      const allVehiclesData = await getAllVehicles();
      
      // Mark which vehicles are available vs not available
      const vehiclesWithStatus = allVehiclesData.map(vehicle => {
        const isAvailable = availableData.vehicles.some(av => av._id === vehicle._id);
        const meetsCapacity = vehicle.capacityKg >= parseInt(searchData.capacityRequired);
        
        return {
          ...vehicle,
          isAvailable,
          meetsCapacity,
          statusReason: !meetsCapacity ? 'Insufficient capacity' : !isAvailable ? 'Not available (booked)' : 'Available'
        };
      });

      setSearchResults({
        ...availableData,
        allVehiclesWithStatus: vehiclesWithStatus
      });
      
      if (availableData.vehicles.length === 0) {
        setMessage('No vehicles are available for your search criteria.');
        setMessageType('warning');
      } else {
        setMessage(`Found ${availableData.vehicles.length} available vehicle(s) out of ${allVehiclesData.length} total. Estimated ride duration: ${availableData.estimatedRideDurationHours} hours`);
        setMessageType('success');
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

      const bookingResponse = await createBooking(bookingData);
      
      setBookingSuccess(bookingResponse);
      setMessage(`Booking created successfully! Booking ID: ${bookingResponse._id}`);
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
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-800">Search & Book Vehicles</h2>
      
      {message && (
        <div className={`p-4 rounded-lg border ${
          messageType === 'success' 
            ? 'bg-green-50 border-green-200 text-green-700' 
            : messageType === 'warning'
            ? 'bg-yellow-50 border-yellow-200 text-yellow-700'
            : 'bg-red-50 border-red-200 text-red-700'
        }`}>
          {message}
        </div>
      )}

      <form onSubmit={handleSearch} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label htmlFor="capacityRequired" className="block text-sm font-semibold text-gray-700">
              Required Capacity (kg):
            </label>
            <input
              type="number"
              id="capacityRequired"
              name="capacityRequired"
              value={searchData.capacityRequired}
              onChange={handleSearchChange}
              min="1"
              required
              placeholder="e.g., 500"
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 transition-colors"
            />
          </div>
          <div className="space-y-2">
            <label htmlFor="startTime" className="block text-sm font-semibold text-gray-700">
              Start Date & Time:
            </label>
            <input
              type="datetime-local"
              id="startTime"
              name="startTime"
              value={searchData.startTime}
              onChange={handleSearchChange}
              required
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 transition-colors"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label htmlFor="fromPincode" className="block text-sm font-semibold text-gray-700">
              From Pincode:
            </label>
            <input
              type="text"
              id="fromPincode"
              name="fromPincode"
              value={searchData.fromPincode}
              onChange={handleSearchChange}
              required
              placeholder="e.g., 110001"
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 transition-colors"
            />
          </div>
          <div className="space-y-2">
            <label htmlFor="toPincode" className="block text-sm font-semibold text-gray-700">
              To Pincode:
            </label>
            <input
              type="text"
              id="toPincode"
              name="toPincode"
              value={searchData.toPincode}
              onChange={handleSearchChange}
              required
              placeholder="e.g., 110010"
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 transition-colors"
            />
          </div>
        </div>

        <button 
          type="submit" 
          disabled={loading}
          className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white py-3 px-6 rounded-lg font-semibold hover:from-blue-600 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 transform hover:-translate-y-1 disabled:transform-none"
        >
          {loading ? 'Searching...' : 'Search Availability'}
        </button>
      </form>

      {bookingSuccess && (
        <div className="bg-green-50 border border-green-200 rounded-xl p-6">
          <h3 className="text-xl font-bold text-green-800 mb-4 flex items-center gap-2">
            <FaCheckCircle />
            Booking Confirmed!
          </h3>
          <div className="bg-white rounded-lg p-4 space-y-2 text-sm">
            <p><strong className="text-green-700">Booking ID:</strong> {bookingSuccess._id}</p>
            <p><strong className="text-green-700">Vehicle:</strong> {bookingSuccess.vehicleId.name}</p>
            <p><strong className="text-green-700">Route:</strong> {bookingSuccess.fromPincode} → {bookingSuccess.toPincode}</p>
            <p><strong className="text-green-700">Start Time:</strong> {formatDateTime(bookingSuccess.startTime)}</p>
            <p><strong className="text-green-700">End Time:</strong> {formatDateTime(bookingSuccess.endTime)}</p>
            <p><strong className="text-green-700">Duration:</strong> {bookingSuccess.estimatedRideDurationHours} hours</p>
            <p><strong className="text-green-700">Customer:</strong> {bookingSuccess.customerId}</p>
          </div>
        </div>
      )}

      {searchResults && (
        <div className="space-y-8">
          <h3 className="text-xl font-bold text-gray-800">Search Results</h3>
          
          {/* Available Vehicles Section */}
          <div className="space-y-4">
            <h4 className="text-lg font-semibold text-green-700 flex items-center gap-2">
              <FaCheck />
              Available Vehicles ({searchResults.vehicles.length})
            </h4>
            {searchResults.vehicles.length === 0 ? (
              <div className="text-center py-12 text-gray-600 bg-gray-50 rounded-lg">
                No vehicles are available for your search criteria.
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {searchResults.vehicles.map(vehicle => (
                  <div key={vehicle._id} className="bg-white border-l-4 border-green-500 rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex justify-between items-start mb-4">
                      <h5 className="text-lg font-semibold text-gray-800">{vehicle.name}</h5>
                      <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-semibold">
                        Available
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Capacity:</span>
                        <span className="font-semibold">{vehicle.capacityKg} kg</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Tyres:</span>
                        <span className="font-semibold">{vehicle.tyres}</span>
                      </div>
                      <div className="flex justify-between col-span-2">
                        <span className="text-gray-600">Estimated Duration:</span>
                        <span className="font-semibold">{searchResults.estimatedRideDurationHours} hours</span>
                      </div>
                    </div>
                    <button 
                      onClick={() => handleBookNow(vehicle._id)}
                      disabled={bookingLoading === vehicle._id}
                      className="w-full bg-green-500 hover:bg-green-600 text-white py-2 px-4 rounded-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      {bookingLoading === vehicle._id ? 'Booking...' : 'Book Now'}
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Unavailable Vehicles Section */}
          {searchResults.allVehiclesWithStatus && (
            <div className="space-y-4">
              <h4 className="text-lg font-semibold text-red-700 flex items-center gap-2">
                <FaTimes />
                Unavailable Vehicles
              </h4>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {searchResults.allVehiclesWithStatus
                  .filter(vehicle => !vehicle.isAvailable || !vehicle.meetsCapacity)
                  .map(vehicle => (
                    <div key={vehicle._id} className="bg-white border-l-4 border-red-500 rounded-lg p-6 shadow-sm opacity-75">
                      <div className="flex justify-between items-start mb-4">
                        <h5 className="text-lg font-semibold text-gray-800">{vehicle.name}</h5>
                        <span className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-xs font-semibold">
                          {vehicle.statusReason}
                        </span>
                      </div>
                      <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Capacity:</span>
                          <span className="font-semibold">{vehicle.capacityKg} kg</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Tyres:</span>
                          <span className="font-semibold">{vehicle.tyres}</span>
                        </div>
                        <div className="flex justify-between col-span-2">
                          <span className="text-gray-600">Status:</span>
                          <span className="font-semibold text-red-600">{vehicle.statusReason}</span>
                        </div>
                      </div>
                      <button 
                        disabled
                        className="w-full bg-gray-400 text-white py-2 px-4 rounded-lg font-semibold cursor-not-allowed"
                      >
                        Not Available
                      </button>
                    </div>
                  ))
                }
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};


