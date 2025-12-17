import React from 'react';
import { Link } from 'react-router-dom';
import ProductCard from '../components/ProductCard';
const API = import.meta.env.VITE_API_URL;

function Home({ topProducts, onAddToCart }) {
  return (
    <div>
      {/* Hero Section */}
      <div className="container mx-auto px-6 mt-8">
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-3xl p-10 md:p-16 text-white relative overflow-hidden shadow-2xl">
          <div className="relative z-10 md:w-1/2">
            <span className="bg-white/20 text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider backdrop-blur-sm">New Collection</span>
            <h1 className="text-5xl md:text-6xl font-black mt-4 mb-6 leading-tight">Welcome to <br/> Minago.</h1>
            <Link to="/products" className="bg-white text-indigo-600 px-8 py-3 rounded-xl font-bold hover:bg-indigo-50 transition shadow-lg inline-block">
              Shop Now
            </Link>
          </div>
          <img src="https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=800&q=80" className="absolute right-0 top-0 h-full w-1/2 object-cover opacity-30 mix-blend-overlay" />
        </div>
      </div>

      {/* Top 3 Products */}
      <div className="container mx-auto px-6 mt-16 mb-20">
        <h2 className="text-3xl font-bold text-gray-900 mb-8">Top Trending</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
          {topProducts.map((prod) => (
            <ProductCard key={prod.id} product={prod} onAddToCart={onAddToCart} />
          ))}
        </div>
      </div>

      {/* Footer */}
      <div className="bg-slate-900 text-slate-400 py-12 text-center text-sm">
        <p>&copy; 2024 Minago Shop. Home Page.</p>
      </div>
    </div>
  );
}

export default Home;