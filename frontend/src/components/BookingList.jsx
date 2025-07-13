import React, { useState, useEffect } from 'react';
import { getAllBookings, deleteBooking } from '../services/api';
import { FaSync, FaTrash } from 'react-icons/fa';

export default function BookingList() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deleteLoading, setDeleteLoading] = useState('');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [bookingToDelete, setBookingToDelete] = useState(null);

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await getAllBookings();
      setBookings(data);
    } catch (err) {
      setError('Failed to fetch bookings. Please try again.');
      console.error('Error fetching bookings:', err);
    } finally {
      setLoading(false);
    }
  };

  const getBookingStatus = (booking) => {
    const now = new Date();
    const startTime = new Date(booking.startTime);
    const endTime = new Date(booking.endTime);

    if (now < startTime) {
      return { status: 'upcoming', label: 'Upcoming', color: '#2196F3' };
    } else if (now >= startTime && now <= endTime) {
      return { status: 'active', label: 'Active', color: '#4CAF50' };
    } else {
      return { status: 'completed', label: 'Completed', color: '#9E9E9E' };
    }
  };

  const handleDeleteClick = (booking) => {
    setBookingToDelete(booking);
    setShowDeleteModal(true);
  };

  const handleDeleteConfirm = async () => {
    if (!bookingToDelete) return;
    
    try {
      setDeleteLoading(bookingToDelete._id);
      await deleteBooking(bookingToDelete._id);
      
      setBookings(prev => prev.filter(b => b._id !== bookingToDelete._id));
      setShowDeleteModal(false);
      setBookingToDelete(null);
      setError('');
    } catch (err) {
      const errorMessage = err.response?.data?.error || 'Failed to delete booking';
      setError(errorMessage);
      console.error('Error deleting booking:', err);
    } finally {
      setDeleteLoading('');
    }
  };

  const handleDeleteCancel = () => {
    setShowDeleteModal(false);
    setBookingToDelete(null);
  };

  const canDeleteBooking = (booking) => {
    const now = new Date();
    const startTime = new Date(booking.startTime);
    const endTime = new Date(booking.endTime);
    
    
    const isActive = now >= startTime && now <= endTime;
    return !isActive; // Can delete if not currently active
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <h2 className="text-2xl font-bold text-gray-800">All Bookings</h2>
        <div className="text-center py-12 text-gray-600">Loading bookings...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <h2 className="text-2xl font-bold text-gray-800">All Bookings</h2>
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
        <button 
          onClick={fetchBookings} 
          className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-colors"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-800">All Bookings ({bookings.length})</h2>
        <button 
          onClick={fetchBookings} 
          className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg transition-colors flex items-center gap-2"
        >
          <FaSync className="text-sm" />
          Refresh List
        </button>
      </div>

      {bookings.length === 0 ? (
        <div className="text-center py-16 text-gray-600">
          <p className="text-lg">No bookings found. Make some bookings to see them here!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {bookings.map((booking) => {
            const statusInfo = getBookingStatus(booking);
            return (
              <div key={booking._id} className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start mb-4 pb-4 border-b border-gray-100">
                  <h3 className="text-lg font-semibold text-gray-800">
                    {booking.vehicleId?.name || 'Unknown Vehicle'}
                  </h3>
                  <div className="flex items-center gap-2">
                    <span 
                      className="px-3 py-1 rounded-full text-xs font-semibold text-white"
                      style={{ backgroundColor: statusInfo.color }}
                    >
                      {statusInfo.label}
                    </span>
                    {(
                      <button
                        onClick={() => handleDeleteClick(booking)}
                        disabled={deleteLoading === booking._id}
                        className="text-red-500 hover:text-red-700 p-1 rounded hover:bg-red-50 transition-colors disabled:opacity-50"
                        title="Delete Booking"
                      >
                        <FaTrash className="text-sm" />
                      </button>
                    )}
                  </div>
                </div>
                
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Customer:</span>
                    <span className="font-semibold text-gray-800">{booking.customerId}</span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-gray-600">Route:</span>
                    <span className="font-semibold text-gray-800">
                      {booking.fromPincode} → {booking.toPincode}
                    </span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-gray-600">Duration:</span>
                    <span className="font-semibold text-gray-800">{booking.estimatedRideDurationHours} hours</span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-gray-600">Start Time:</span>
                    <span className="font-semibold text-gray-800">
                      {new Date(booking.startTime).toLocaleString()}
                    </span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-gray-600">End Time:</span>
                    <span className="font-semibold text-gray-800">
                      {new Date(booking.endTime).toLocaleString()}
                    </span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-gray-600">Vehicle Capacity:</span>
                    <span className="font-semibold text-gray-800">{booking.vehicleId?.capacityKg || 'N/A'} kg</span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-gray-600">Booking ID:</span>
                    <span className="font-semibold text-gray-800 font-mono">{booking._id.slice(-8)}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && bookingToDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Delete Booking</h3>
            <p className="text-gray-600 mb-4">
              Are you sure you want to delete this booking? This action cannot be undone.
            </p>
            <p className="text-sm text-blue-600 mb-6">
              Note: You can delete future bookings or completed bookings, but not bookings that are currently in progress.
            </p>
            <div className="text-sm text-gray-500 mb-6 bg-gray-50 p-4 rounded">
              <p><strong>Booking Details:</strong></p>
              <p>• Vehicle: {bookingToDelete.vehicleId?.name || 'Unknown'}</p>
              <p>• Route: {bookingToDelete.fromPincode} → {bookingToDelete.toPincode}</p>
              <p>• Start: {new Date(bookingToDelete.startTime).toLocaleString()}</p>
              <p>• End: {new Date(bookingToDelete.endTime).toLocaleString()}</p>
              <p>• Status: <span className="font-semibold" style={{ color: getBookingStatus(bookingToDelete).color }}>
                {getBookingStatus(bookingToDelete).label}
              </span></p>
              <p>• Customer: {bookingToDelete.customerId}</p>
            </div>
            <div className="flex gap-3 justify-end">
              <button
                onClick={handleDeleteCancel}
                disabled={deleteLoading === bookingToDelete._id}
                className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteConfirm}
                disabled={deleteLoading === bookingToDelete._id}
                className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 disabled:opacity-50"
              >
                {deleteLoading === bookingToDelete._id ? 'Deleting...' : 'Delete Booking'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}


