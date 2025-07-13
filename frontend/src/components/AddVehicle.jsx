import React, { useState } from 'react';
import { addVehicle } from '../services/api';

export default function AddVehicle(){
  const [formData, setFormData] = useState({
    name: '',
    capacityKg: '',
    tyres: ''
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      const vehicleData = {
        name: formData.name,
        capacityKg: parseInt(formData.capacityKg),
        tyres: parseInt(formData.tyres)
      };

      const response = await addVehicle(vehicleData);
      
      setMessage(`Vehicle "${response.name}" added successfully! ID: ${response._id}`);
      setMessageType('success');
      
      // Reset form
      setFormData({
        name: '',
        capacityKg: '',
        tyres: ''
      });
    } catch (error) {
      const errorMessage = error.response?.data?.error || error.response?.data?.details || error.message;
      setMessage(`Error: ${errorMessage}`);
      setMessageType('error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-800">Add New Vehicle</h2>
      
      {message && (
        <div className={`p-4 rounded-lg border ${
          messageType === 'success' 
            ? 'bg-green-50 border-green-200 text-green-700' 
            : 'bg-red-50 border-red-200 text-red-700'
        }`}>
          {message}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-2">
          <label htmlFor="name" className="block text-sm font-semibold text-gray-700">
            Vehicle Name:
          </label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
            placeholder="Enter vehicle name (e.g., Truck-001)"
            className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 transition-colors"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label htmlFor="capacityKg" className="block text-sm font-semibold text-gray-700">
              Capacity (kg):
            </label>
            <input
              type="number"
              id="capacityKg"
              name="capacityKg"
              value={formData.capacityKg}
              onChange={handleChange}
              min="1"
              required
              placeholder="Enter capacity in kg"
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 transition-colors"
            />
          </div>
          <div className="space-y-2">
            <label htmlFor="tyres" className="block text-sm font-semibold text-gray-700">
              Number of Tyres:
            </label>
            <input
              type="number"
              id="tyres"
              name="tyres"
              value={formData.tyres}
              onChange={handleChange}
              min="2"
              required
              placeholder="Enter number of tyres"
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 transition-colors"
            />
          </div>
        </div>

        <button 
          type="submit" 
          disabled={loading}
          className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white py-3 px-6 rounded-lg font-semibold hover:from-blue-600 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 transform hover:-translate-y-1 disabled:transform-none"
        >
          {loading ? 'Adding Vehicle...' : 'Add Vehicle'}
        </button>
      </form>
    </div>
  );
}


