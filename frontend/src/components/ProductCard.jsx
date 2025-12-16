import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaShoppingCart, FaStar, FaTrash, FaEdit, FaExclamationCircle, FaCheckCircle, FaBolt } from 'react-icons/fa';

function ProductCard({ product, onAddToCart, userRole, onEdit, onDelete }) {
  const navigate = useNavigate();

  // LOGIC: Check Stock Status
  // If quantity is missing, assume 10 (safe default)
  const qty = product.quantity !== undefined ? product.quantity : 10;
  const isOutOfStock = qty < 1;
  const isLowStock = qty > 0 && qty < 5; 

  // LOGIC: Determine Display Image
  // 1. Try 'product.image' (legacy single image)
  // 2. If missing, try the first item in 'product.images' (new gallery array)
  // 3. Fallback to empty string (handled by onError)
  const displayImage = product.image || (product.images && product.images.length > 0 ? product.images[0] : '');

  // LOGIC: Handle Buy Now (Direct Checkout)
  const handleBuyNow = (e) => {
    e.stopPropagation(); // Prevent opening product details
    if (isOutOfStock) return;
    navigate('/checkout', { 
      state: { 
        buyNowItem: { ...product, qty: 1 } 
      } 
    });
  };

  // LOGIC: Handle Add To Cart
  const handleAddToCart = (e) => {
    e.stopPropagation(); // Prevent opening product details
    if (isOutOfStock) return;
    onAddToCart(product);
  };

  return (
    <div className={`group bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden border flex flex-col relative ${isOutOfStock ? 'border-red-200 bg-red-50' : 'border-gray-100'}`}>
      
      {/* --- STATUS BADGES --- */}
      <div className="absolute top-3 left-3 z-10 flex flex-col gap-2 pointer-events-none">
        {isOutOfStock && (
          <span className="bg-red-600 text-white text-xs font-bold px-3 py-1 rounded-full shadow-md flex items-center gap-1">
            <FaExclamationCircle /> Out of Stock
          </span>
        )}
        {!isOutOfStock && (
          <span className="bg-emerald-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-md flex items-center gap-1">
            <FaCheckCircle /> In Stock
          </span>
        )}
      </div>

      {/* --- PRODUCT IMAGE (CLICKABLE LINK) --- */}
      <Link to={`/product/${product._id}`} className="block relative pt-[100%] overflow-hidden bg-gray-50 cursor-pointer">
        <img 
          src={displayImage} 
          alt={product.title} 
          crossOrigin="anonymous" 
          referrerPolicy="no-referrer"
          loading="lazy"
          onError={(e) => {
            e.target.onerror = null; 
            e.target.removeAttribute('crossOrigin'); 
            e.target.src = "https://via.placeholder.com/300?text=No+Image"; 
          }}
          className={`absolute top-0 left-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105 ${isOutOfStock ? 'grayscale opacity-60' : ''}`}
        />
      </Link>

      {/* --- CONTENT --- */}
      <div className="p-5 flex flex-col flex-grow">
        <Link to={`/product/${product._id}`} className="hover:text-indigo-600 transition-colors">
            <h3 className="font-bold text-gray-800 text-lg mb-1 truncate">{product.title}</h3>
        </Link>
        
        {/* Rating & Low Stock Warning */}
        <div className="flex items-center mb-3">
           <div className="flex text-yellow-400 text-sm">
             {[...Array(5)].map((_, i) => (
                <FaStar key={i} className={i < Math.floor(product.stars) ? "fill-current" : "text-gray-200"} />
             ))}
           </div>
           {isLowStock && (
             <span className="text-xs font-bold text-orange-500 ml-auto animate-pulse">
               Hurry! Only {qty} left
             </span>
           )}
        </div>

        <div className="flex items-center justify-between mt-auto gap-2">
          <div className="flex-grow">
             <span className="text-xl font-bold text-indigo-900">${product.price}</span>
             {product.oldPrice && (
               <span className="text-sm text-gray-400 line-through ml-2 hidden sm:inline-block">${product.oldPrice}</span>
             )}
          </div>
          
          {/* --- ACTION BUTTONS --- */}
          
          {/* 1. Buy Now (Lightning Bolt) */}
          <button 
            onClick={handleBuyNow}
            disabled={isOutOfStock} 
            className={`p-3 rounded-xl transition-colors duration-300 shadow-sm ${
              isOutOfStock 
                ? 'bg-gray-200 text-gray-400 cursor-not-allowed opacity-50' 
                : 'bg-indigo-100 text-indigo-600 hover:bg-indigo-600 hover:text-white'
            }`}
            title={isOutOfStock ? "Out of Stock" : "Buy Now"}
          >
            <FaBolt />
          </button>

          {/* 2. Add To Cart (Cart Icon) */}
          <button 
            onClick={handleAddToCart}
            disabled={isOutOfStock} 
            className={`p-3 rounded-xl transition-colors duration-300 shadow-sm ${
              isOutOfStock 
                ? 'bg-gray-200 text-gray-400 cursor-not-allowed opacity-50' 
                : 'bg-gray-100 text-gray-600 hover:bg-indigo-600 hover:text-white'
            }`}
            title={isOutOfStock ? "Out of Stock" : "Add to Cart"}
          >
            <FaShoppingCart />
          </button>
        </div>

        {/* --- ADMIN CONTROLS --- */}
        {userRole === 'admin' && (
          <div className="mt-4 pt-4 border-t border-gray-100 flex gap-2">
            <button 
              onClick={() => onEdit(product)}
              className="flex-1 flex items-center justify-center gap-2 bg-blue-50 text-blue-600 py-2 rounded-lg text-sm font-bold hover:bg-blue-100 transition"
            >
              <FaEdit /> Edit
            </button>
            <button 
              onClick={() => onDelete(product._id)}
              className="flex-1 flex items-center justify-center gap-2 bg-red-50 text-red-600 py-2 rounded-lg text-sm font-bold hover:bg-red-100 transition"
            >
              <FaTrash /> Delete
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default ProductCard;