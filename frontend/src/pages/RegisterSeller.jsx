import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { FaStore, FaIdCard, FaFileUpload, FaUser, FaEnvelope, FaLock, FaMapMarkerAlt, FaPhone } from 'react-icons/fa';

function RegisterSeller() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: '', email: '', password: '', phone: '',
    businessName: '', gstNumber: '', shopAddress: ''
  });
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });
  const handleFileChange = (e) => setFile(e.target.files[0]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const data = new FormData();
    Object.keys(formData).forEach(key => data.append(key, formData[key]));
    if (file) data.append('document', file);

    try {
      await axios.post('${API}/auth/register-seller', data);
      alert("Application Submitted! The Admin will review your details.");
      navigate('/');
    } catch (err) {
      alert("Registration Failed: " + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-6">
      <div className="bg-white rounded-3xl shadow-2xl overflow-hidden max-w-4xl w-full flex flex-col md:flex-row">
        
        {/* Left Side: Info */}
        <div className="md:w-1/3 bg-indigo-600 p-8 text-white flex flex-col justify-center">
          <FaStore className="text-6xl mb-4" />
          <h2 className="text-3xl font-bold mb-4">Become a Seller</h2>
          <p className="opacity-90 mb-6">Join Minago Shop and reach millions of customers today. Fast approval process.</p>
          <ul className="space-y-3 text-sm opacity-80">
            <li className="flex items-center gap-2"><FaIdCard /> Upload Valid ID Proof</li>
            <li className="flex items-center gap-2"><FaMapMarkerAlt /> Provide Shop Address</li>
          </ul>
        </div>

        {/* Right Side: Form */}
        <div className="md:w-2/3 p-10">
          <h3 className="text-2xl font-bold text-gray-800 mb-6">Seller Application</h3>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            {/* Personal Info */}
            <div className="relative"><FaUser className="absolute left-3 top-3.5 text-gray-400"/><input name="username" placeholder="Full Name" onChange={handleChange} className="w-full pl-10 p-3 border rounded-lg" required /></div>
            <div className="relative"><FaEnvelope className="absolute left-3 top-3.5 text-gray-400"/><input name="email" type="email" placeholder="Email Address" onChange={handleChange} className="w-full pl-10 p-3 border rounded-lg" required /></div>
            <div className="relative"><FaPhone className="absolute left-3 top-3.5 text-gray-400"/><input name="phone" placeholder="Mobile Number" onChange={handleChange} className="w-full pl-10 p-3 border rounded-lg" required /></div>
            <div className="relative"><FaLock className="absolute left-3 top-3.5 text-gray-400"/><input name="password" type="password" placeholder="Password" onChange={handleChange} className="w-full pl-10 p-3 border rounded-lg" required /></div>

            {/* Business Info */}
            <div className="md:col-span-2 border-t pt-4 mt-2"><h4 className="font-bold text-gray-600 text-sm mb-2">Business Details</h4></div>
            <input name="businessName" placeholder="Shop / Business Name" onChange={handleChange} className="w-full p-3 border rounded-lg" required />
            <input name="gstNumber" placeholder="GST / Tax ID" onChange={handleChange} className="w-full p-3 border rounded-lg" required />
            <textarea name="shopAddress" placeholder="Full Shop Address" onChange={handleChange} className="md:col-span-2 w-full p-3 border rounded-lg" rows="2" required></textarea>

            {/* Document Upload */}
            <div className="md:col-span-2 border-dashed border-2 border-gray-300 p-4 rounded-lg text-center bg-gray-50">
              <label className="cursor-pointer block">
                <FaFileUpload className="mx-auto text-indigo-500 text-2xl mb-2"/>
                <span className="text-gray-500 text-sm">Upload ID Proof (PDF, JPG, PNG)</span>
                <input type="file" className="hidden" onChange={handleFileChange} required accept="image/*,.pdf" />
              </label>
              {file && <p className="text-xs text-green-600 mt-2">{file.name}</p>}
            </div>

            <button type="submit" disabled={loading} className="md:col-span-2 bg-indigo-600 text-white py-3 rounded-xl font-bold hover:bg-indigo-700 transition">
              {loading ? "Submitting..." : "Submit Application"}
            </button>
          </form>
        </div>

      </div>
    </div>
  );
}

export default RegisterSeller;