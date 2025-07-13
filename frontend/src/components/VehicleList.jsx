import React, { useState, useEffect } from 'react';
import { getAllVehicles, deleteVehicle } from '../services/api';
import { FaSync, FaTrash } from 'react-icons/fa';

export default function VehicleList() {
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deleteLoading, setDeleteLoading] = useState('');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [vehicleToDelete, setVehicleToDelete] = useState(null);

  useEffect(() => {
    fetchVehicles();
  }, []);

  const fetchVehicles = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await getAllVehicles();
      setVehicles(data);
    } catch (err) {
      setError('Failed to fetch vehicles. Please try again.');
      console.error('Error fetching vehicles:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteClick = (vehicle) => {
    setVehicleToDelete(vehicle);
    setShowDeleteModal(true);
  };

  const handleDeleteConfirm = async () => {
    if (!vehicleToDelete) return;
    
    try {
      setDeleteLoading(vehicleToDelete._id);
      await deleteVehicle(vehicleToDelete._id);
      
      // Remove the deleted vehicle from the state
      setVehicles(prev => prev.filter(v => v._id !== vehicleToDelete._id));
      setShowDeleteModal(false);
      setVehicleToDelete(null);
      setError('');
    } catch (err) {
      const errorMessage = err.response?.data?.error || 'Failed to delete vehicle';
      setError(errorMessage);
      console.error('Error deleting vehicle:', err);
    } finally {
      setDeleteLoading('');
    }
  };

  const handleDeleteCancel = () => {
    setShowDeleteModal(false);
    setVehicleToDelete(null);
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <h2 className="text-2xl font-bold text-gray-800">All Vehicles</h2>
        <div className="text-center py-12 text-gray-600">Loading vehicles...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <h2 className="text-2xl font-bold text-gray-800">All Vehicles</h2>
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
        <button 
          onClick={fetchVehicles} 
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
        <h2 className="text-2xl font-bold text-gray-800">All Vehicles ({vehicles.length})</h2>
        <button 
          onClick={fetchVehicles} 
          className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg transition-colors flex items-center gap-2"
        >
          <FaSync className="text-sm" />
          Refresh List
        </button>
      </div>

      {vehicles.length === 0 ? (
        <div className="text-center py-16 text-gray-600">
          <p className="text-lg">No vehicles found. Add some vehicles to get started!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {vehicles.map((vehicle) => (
            <div key={vehicle._id} className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start mb-4 pb-4 border-b border-gray-100">
                <h3 className="text-lg font-semibold text-gray-800">{vehicle.name}</h3>
                <div className="flex items-center gap-2">
                  <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded font-mono">
                    ID: {vehicle._id.slice(-6)}
                  </span>
                  <button
                    onClick={() => handleDeleteClick(vehicle)}
                    disabled={deleteLoading === vehicle._id}
                    className="text-red-500 hover:text-red-700 p-1 rounded hover:bg-red-50 transition-colors disabled:opacity-50"
                    title="Delete Vehicle"
                  >
                    <FaTrash className="text-sm" />
                  </button>
                </div>
              </div>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Capacity:</span>
                  <span className="font-semibold text-gray-800">{vehicle.capacityKg} kg</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Tyres:</span>
                  <span className="font-semibold text-gray-800">{vehicle.tyres}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Added:</span>
                  <span className="font-semibold text-gray-800">
                    {new Date(vehicle.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && vehicleToDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Delete Vehicle</h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete "<strong>{vehicleToDelete.name}</strong>"? 
              This action cannot be undone.
            </p>
            <div className="text-sm text-gray-500 mb-6">
              <p><strong>Vehicle Details:</strong></p>
              <p>• Capacity: {vehicleToDelete.capacityKg} kg</p>
              <p>• Tyres: {vehicleToDelete.tyres}</p>
            </div>
            <div className="flex gap-3 justify-end">
              <button
                onClick={handleDeleteCancel}
                disabled={deleteLoading === vehicleToDelete._id}
                className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteConfirm}
                disabled={deleteLoading === vehicleToDelete._id}
                className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 disabled:opacity-50"
              >
                {deleteLoading === vehicleToDelete._id ? 'Deleting...' : 'Delete Vehicle'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
