import React from 'react';
import ProductCard from '../components/ProductCard';

function ProductList({ products, onAddToCart }) {
  return (
    <div className="container mx-auto px-6 mt-10 mb-20">
      <h2 className="text-3xl font-bold text-gray-900 mb-8">All Products</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8">
        {products.map((prod) => (
          <ProductCard key={prod.id} product={prod} onAddToCart={onAddToCart} />
        ))}
      </div>
    </div>
  );
}

export default ProductList;