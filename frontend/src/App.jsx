import React, { useState } from 'react';
import './App.css';
import { FaTruck, FaPlus, FaSearch, FaList, FaCalendarAlt } from 'react-icons/fa';
import AddVehicle from './components/AddVehicle';
import SearchAndBook from './components/SearchAndBook';
import VehicleList from './components/VehicleList';
import BookingList from './components/BookingList';

function App() {
  const [activeTab, setActiveTab] = useState('add-vehicle');

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-500 via-purple-600 to-purple-800">
      <header className=" text-center py-8 mb-8">
        <h1 className="text-4xl font-bold text-white mb-2 flex items-center justify-center gap-3">
          <FaTruck className="text-blue-300" />
          FleetLink-Logistics Vehicle Booking System
        </h1>
        <p className="text-lg text-gray-300">Manage your fleet and bookings efficiently</p>
      </header>

      <div className="max-w-6xl mx-auto px-4">
        <div className="flex bg-white/10 rounded-t-xl overflow-hidden mb-0">
          <button 
            className={`flex-1 py-4 px-6 text-white font-medium transition-all duration-300 ${
              activeTab === 'add-vehicle' 
                ? 'bg-white/20 border-b-2 border-blue-400' 
                : 'hover:bg-white/10'
            }`}
            onClick={() => setActiveTab('add-vehicle')}
          >
            <div className="flex items-center justify-center gap-2">
              <FaPlus className="text-sm" />
              Add Vehicle
            </div>
          </button>
          <button 
            className={`flex-1 py-4 px-6 text-white font-medium transition-all duration-300 ${
              activeTab === 'search-book' 
                ? 'bg-white/20 border-b-2 border-blue-400' 
                : 'hover:bg-white/10'
            }`}
            onClick={() => setActiveTab('search-book')}
          >
            <div className="flex items-center justify-center gap-2">
              <FaSearch className="text-sm" />
              Search & Book
            </div>
          </button>
          <button 
            className={`flex-1 py-4 px-6 text-white font-medium transition-all duration-300 ${
              activeTab === 'vehicle-list' 
                ? 'bg-white/20 border-b-2 border-blue-400' 
                : 'hover:bg-white/10'
            }`}
            onClick={() => setActiveTab('vehicle-list')}
          >
            <div className="flex items-center justify-center gap-2">
              <FaList className="text-sm" />
              All Vehicles
            </div>
          </button>
          <button 
            className={`flex-1 py-4 px-6 text-white font-medium transition-all duration-300 ${
              activeTab === 'booking-list' 
                ? 'bg-white/20 border-b-2 border-blue-400' 
                : 'hover:bg-white/10'
            }`}
            onClick={() => setActiveTab('booking-list')}
          >
            <div className="flex items-center justify-center gap-2">
              <FaCalendarAlt className="text-sm" />
              All Bookings
            </div>
          </button>
        </div>

        <div className="bg-white rounded-b-xl shadow-xl p-8 min-h-[500px]">
          {activeTab === 'add-vehicle' && <AddVehicle />}
          {activeTab === 'search-book' && <SearchAndBook />}
          {activeTab === 'vehicle-list' && <VehicleList />}
          {activeTab === 'booking-list' && <BookingList />}
        </div>
      </div>
    </div>
  );
}

export default App;
