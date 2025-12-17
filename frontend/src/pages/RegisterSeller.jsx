import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { FaStore, FaFileUpload } from 'react-icons/fa';

const API = import.meta.env.VITE_API_URL;

function RegisterSeller() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: '', email: '', password: '', phone: '',
    businessName: '', gstNumber: '', shopAddress: ''
  });
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleChange = e => setFormData({ ...formData, [e.target.name]: e.target.value });
  const handleFileChange = e => setFile(e.target.files[0]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const data = new FormData();
    Object.keys(formData).forEach(key => data.append(key, formData[key]));
    if (file) data.append('document', file);

    try {
      await axios.post(`${API}/auth/register-seller`, data);
      alert("Seller application submitted!");
      navigate('/');
    } catch (err) {
      alert(err.response?.data?.message || "Registration Failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-6">
      <form onSubmit={handleSubmit} className="bg-white p-8 rounded-xl w-full max-w-xl space-y-4">
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <FaStore /> Become a Seller
        </h2>

        {Object.keys(formData).map(key => (
          <input
            key={key}
            name={key}
            placeholder={key}
            onChange={handleChange}
            className="w-full p-3 border rounded"
            required
          />
        ))}

        <div className="border p-4 rounded text-center">
          <FaFileUpload />
          <input type="file" onChange={handleFileChange} required />
        </div>

        <button className="w-full bg-indigo-600 text-white py-3 rounded-xl font-bold">
          {loading ? "Submitting..." : "Submit"}
        </button>
      </form>
    </div>
  );
}

export default RegisterSeller;