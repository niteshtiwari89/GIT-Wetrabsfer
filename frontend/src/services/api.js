import axios from 'axios';

const API_BASE = 'https://git-wetrabsfer.vercel.app/api';

const api = axios.create({
  baseURL: API_BASE,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});





export const addVehicle = async (vehicleData) => {
  const response = await api.post('/vehicles', vehicleData);
  return response.data;
};

export const getAllVehicles = async () => {
  const response = await api.get('/vehicles');
  return response.data;
};

export const searchAvailableVehicles = async (searchParams) => {
  
  const response = await api.get('/vehicles/available', { params:searchParams });
  return response.data;
};

export const createBooking = async (bookingData) => {
  const response = await api.post('/bookings', bookingData);
  return response.data;
};

export const getAllBookings = async () => {
  const response = await api.get('/bookings');
  return response.data;
};

export const deleteVehicle = async (vehicleId) => {
  const response = await api.delete(`/vehicles/${vehicleId}`);
  return response.data;
};

export const deleteBooking = async (bookingId) => {
  const response = await api.delete(`/bookings/${bookingId}`);
  return response.data;
};


// Health Check
export const healthCheck = () => axios.get('https://git-wetrabsfer.vercel.app/health');
