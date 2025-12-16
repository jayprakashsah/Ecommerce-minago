import React, { useState, useEffect } from 'react';
import { FaBox, FaDollarSign, FaImages, FaTag, FaLayerGroup, FaAlignLeft } from 'react-icons/fa';

function AddProductForm({ onAdd, initialData, isEditing, onCancel }) {
  const [formData, setFormData] = useState({
    title: '', 
    price: '', 
    oldPrice: '', 
    quantity: '', 
    description: '',
    imageUrls: '' // We use a string here for the input box
  });

  useEffect(() => {
    if (initialData) {
      // If editing, join the array back into a string with commas
      const joinedImages = initialData.images && initialData.images.length > 0 
        ? initialData.images.join(', ') 
        : initialData.image || '';

      setFormData({
        title: initialData.title || '',
        price: initialData.price || '',
        oldPrice: initialData.oldPrice || '',
        quantity: initialData.quantity || '10',
        description: initialData.description || '',
        imageUrls: joinedImages
      });
    } else {
      setFormData({ title: '', price: '', oldPrice: '', quantity: '', description: '', imageUrls: '' });
    }
  }, [initialData]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Convert comma-separated string into an Array
    const imagesArray = formData.imageUrls.split(',').map(url => url.trim()).filter(url => url !== '');
    
    // Use the first image as the main thumbnail (fallback)
    const mainImage = imagesArray.length > 0 ? imagesArray[0] : '';

    const finalData = {
        ...formData,
        images: imagesArray, // Send Array
        image: mainImage     // Send Single String (for backward compatibility)
    };

    onAdd(finalData);

    if (!isEditing) {
      setFormData({ title: '', price: '', oldPrice: '', quantity: '', description: '', imageUrls: '' });
    }
  };

  return (
    <div className={`p-8 rounded-2xl shadow-lg border border-gray-100 transition-all ${isEditing ? 'bg-blue-50' : 'bg-white'}`}>
      <div className="flex justify-between items-center mb-6">
        <h3 className={`text-xl font-extrabold ${isEditing ? 'text-blue-700' : 'text-gray-800'}`}>
          {isEditing ? '✏️ Edit Product' : '✨ Add New Product'}
        </h3>
        {isEditing && <button onClick={onCancel} className="text-sm text-gray-500 hover:text-red-500 underline">Cancel</button>}
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Title */}
        <div className="md:col-span-2">
          <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Product Title</label>
          <div className="relative"><FaTag className="absolute left-3 top-3.5 text-gray-400" /><input type="text" name="title" value={formData.title} onChange={handleChange} className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white" required /></div>
        </div>

        {/* Price & Old Price */}
        <div>
          <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Price ($)</label>
          <div className="relative"><FaDollarSign className="absolute left-3 top-3.5 text-gray-400" /><input type="number" name="price" value={formData.price} onChange={handleChange} className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white" required /></div>
        </div>
        <div>
          <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Old Price</label>
          <div className="relative"><FaDollarSign className="absolute left-3 top-3.5 text-gray-400" /><input type="number" name="oldPrice" value={formData.oldPrice} onChange={handleChange} className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white" /></div>
        </div>

        {/* Quantity */}
        <div>
          <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Stock</label>
          <div className="relative"><FaLayerGroup className="absolute left-3 top-3.5 text-gray-400" /><input type="number" name="quantity" value={formData.quantity} onChange={handleChange} className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white" required /></div>
        </div>

        {/* --- NEW: MULTIPLE IMAGES INPUT --- */}
        <div className="md:col-span-2">
          <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Image URLs (Separate with commas)</label>
          <div className="relative">
             <FaImages className="absolute left-3 top-3.5 text-gray-400" />
             <textarea 
                name="imageUrls" 
                value={formData.imageUrls} 
                onChange={handleChange} 
                placeholder="https://image1.jpg, https://image2.jpg, https://image3.jpg" 
                rows="3"
                className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white" 
                required 
             />
          </div>
          <p className="text-xs text-gray-400 mt-1">Tip: Paste multiple links separated by commas to create a gallery.</p>
        </div>

        {/* Description */}
        <div className="md:col-span-2">
          <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Description</label>
          <div className="relative">
             <FaAlignLeft className="absolute left-3 top-3.5 text-gray-400" />
             <textarea name="description" value={formData.description} onChange={handleChange} rows="4" placeholder="Describe your product..." 
               className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white" />
          </div>
        </div>

        <div className="md:col-span-2 mt-2">
          <button type="submit" className={`w-full py-3.5 rounded-xl font-bold text-white shadow-lg transition-all hover:scale-[1.02] ${isEditing ? 'bg-blue-600 hover:bg-blue-700' : 'bg-indigo-600 hover:bg-indigo-700'}`}>
            {isEditing ? 'Update Product' : 'Add Product'}
          </button>
        </div>
      </form>
    </div>
  );
}

export default AddProductForm;