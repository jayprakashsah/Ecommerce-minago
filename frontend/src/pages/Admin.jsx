import React from 'react';
import AddProductForm from '../components/AddProductForm';
const API = import.meta.env.VITE_API_URL;

function Admin({ onAddProduct }) {
  return (
    <div className="container mx-auto px-6 mt-10 mb-20">
      <h2 className="text-3xl font-bold text-gray-900 mb-6 text-center">Admin Dashboard</h2>
      <div className="max-w-4xl mx-auto">
        <AddProductForm onAdd={onAddProduct} />
      </div>
    </div>
  );
}

export default Admin;