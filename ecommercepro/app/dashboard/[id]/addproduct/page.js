"use client";

import { useParams } from "next/navigation";

export default function AddProductPage() {
  const { id } = useParams();

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-6">
      <div className="bg-white p-10 rounded-2xl shadow-xl max-w-lg w-full text-center">
        <h1 className="text-3xl font-extrabold text-gray-800 mb-4">Add New Product</h1>
        <p className="text-gray-600 mb-8">
          Welcome to your seller dashboard! You can now start adding your products to the store.
        </p>
        
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-12 mb-6 cursor-pointer hover:border-blue-500 transition-colors">
          <p className="text-gray-400">Click to upload product images (Placeholder)</p>
        </div>

        <button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-lg transition-colors">
          Submit Product
        </button>
      </div>
    </div>
  );
}
