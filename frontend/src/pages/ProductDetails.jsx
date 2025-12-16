import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { FaShoppingCart, FaBolt, FaStar, FaArrowLeft, FaCheckCircle, FaExclamationCircle } from 'react-icons/fa';

function ProductDetails({ onAddToCart }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // State for the currently selected image in the gallery
  const [selectedImage, setSelectedImage] = useState('');

  useEffect(() => {
    axios.get(`http://localhost:3000/products`)
      .then(res => {
        const found = res.data.find(p => p._id === id);
        setProduct(found);
        
        // Set initial selected image (Try 'images' array first, fallback to 'image' string)
        if (found) {
            if (found.images && found.images.length > 0) {
                setSelectedImage(found.images[0]);
            } else {
                setSelectedImage(found.image);
            }
        }
        setLoading(false);
      })
      .catch(err => setLoading(false));
  }, [id]);

  if (loading) return <div className="text-center mt-20">Loading...</div>;
  if (!product) return <div className="text-center mt-20">Product not found.</div>;

  // --- STOCK LOGIC ---
  const qty = product.quantity !== undefined ? product.quantity : 0;
  const isOutOfStock = qty < 1;

  // Prepare the list of images for the gallery
  const galleryImages = (product.images && product.images.length > 0) 
    ? product.images 
    : [product.image];

  // --- HANDLERS ---
  const handleBuyNow = () => {
    if (isOutOfStock) return; // Stop if out of stock
    navigate('/checkout', { state: { buyNowItem: { ...product, qty: 1 } } });
  };

  const handleAddToCart = () => {
    if (isOutOfStock) return; // Stop if out of stock
    onAddToCart(product);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-gray-500 hover:text-indigo-600 mb-6 font-bold">
        <FaArrowLeft /> Back
      </button>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-10 bg-white p-6 md:p-10 rounded-3xl shadow-sm border border-gray-100">
        
        {/* --- LEFT: IMAGE GALLERY --- */}
        <div>
            {/* Main Large Image */}
            <div className="relative bg-gray-50 rounded-2xl overflow-hidden h-[300px] md:h-[450px] mb-4">
            <img 
                src={selectedImage} 
                alt={product.title} 
                crossOrigin="anonymous"
                className={`w-full h-full object-contain mix-blend-multiply p-4 ${isOutOfStock ? 'grayscale opacity-60' : ''}`}
            />
            {isOutOfStock && (
                <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-20">
                  <span className="bg-red-600 text-white text-xl font-bold px-6 py-2 rounded-full shadow-lg">Out of Stock</span>
                </div>
            )}
            </div>

            {/* Thumbnail Row (Scrollable if many images) */}
            {galleryImages.length > 1 && (
                <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
                    {galleryImages.map((img, idx) => (
                        <button 
                            key={idx} 
                            onClick={() => setSelectedImage(img)}
                            className={`w-20 h-20 flex-shrink-0 rounded-xl overflow-hidden border-2 transition-all ${
                                selectedImage === img ? 'border-indigo-600 shadow-md scale-105' : 'border-gray-100 hover:border-indigo-200'
                            }`}
                        >
                            <img src={img} alt="thumb" className="w-full h-full object-cover cross-origin-anonymous" />
                        </button>
                    ))}
                </div>
            )}
        </div>

        {/* --- RIGHT: DETAILS --- */}
        <div className="flex flex-col justify-center">
          <div className="mb-4">
             {isOutOfStock ? (
               <span className="bg-red-100 text-red-600 px-4 py-1.5 rounded-full text-sm font-bold inline-flex items-center gap-2 border border-red-200">
                 <FaExclamationCircle /> Out of Stock
               </span>
             ) : (
               <span className="bg-emerald-100 text-emerald-700 px-4 py-1.5 rounded-full text-sm font-bold inline-flex items-center gap-2 border border-emerald-200">
                 <FaCheckCircle /> In Stock ({qty} left)
               </span>
             )}
          </div>
          
          <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-4">{product.title}</h1>
          
          <div className="flex items-center gap-2 mb-6">
             <div className="flex text-yellow-400 text-lg">
                {[...Array(5)].map((_, i) => <FaStar key={i} className={i < Math.floor(product.stars) ? "fill-current" : "text-gray-200"} />)}
             </div>
             <span className="text-gray-400 text-sm">({product.stars} Stars)</span>
          </div>

          <p className="text-gray-600 leading-relaxed mb-8 text-lg">
            {product.description || "No specific description available for this product."}
          </p>

          <div className="flex items-end gap-4 mb-8">
             <span className="text-4xl font-bold text-indigo-900">${product.price}</span>
             {product.oldPrice && <span className="text-xl text-gray-400 line-through mb-1">${product.oldPrice}</span>}
          </div>

          {/* --- BUTTONS (UPDATED FOR STOCK LOGIC) --- */}
          <div className="flex flex-col sm:flex-row gap-4 mt-auto">
            
            {/* ADD TO CART */}
            <button 
              onClick={handleAddToCart}
              disabled={isOutOfStock}
              className={`flex-1 py-4 rounded-xl font-bold text-lg flex items-center justify-center gap-2 border-2 transition duration-200
                ${isOutOfStock 
                    ? 'bg-gray-100 border-gray-200 text-gray-400 cursor-not-allowed opacity-60' // Dimmed & Disabled
                    : 'border-indigo-100 text-indigo-700 hover:border-indigo-600 hover:bg-indigo-50' // Active
                }`}
            >
              <FaShoppingCart /> {isOutOfStock ? "Unavailable" : "Add to Cart"}
            </button>

            {/* BUY NOW */}
            <button 
              onClick={handleBuyNow}
              disabled={isOutOfStock}
              className={`flex-1 py-4 rounded-xl font-bold text-lg flex items-center justify-center gap-2 shadow-xl transition duration-200 transform
                ${isOutOfStock 
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed shadow-none opacity-60' // Dimmed & Disabled
                    : 'bg-indigo-600 text-white hover:bg-indigo-700 hover:-translate-y-1 shadow-indigo-200' // Active
                }`}
            >
              <FaBolt /> {isOutOfStock ? "Out of Stock" : "Buy Now"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProductDetails;