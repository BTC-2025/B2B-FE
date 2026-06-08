import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import NavBar from "../components/NavBar";
import SecondaryNavBar from "../components/SecondaryNavBar";
import ProductCard from "../components/ProductCard";
import TopUtilityBar from "../components/TopUtilityBar";
import { FaHeart, FaTrash } from "react-icons/fa";

export default function Wishlist() {
  const navigate = useNavigate();
  const [wishlistItems, setWishlistItems] = useState(() => {
    return JSON.parse(localStorage.getItem("wishlist") || "[]");
  });

  const handleRemove = (id) => {
    const updated = wishlistItems.filter((item) => item._id !== id);
    setWishlistItems(updated);
    localStorage.setItem("wishlist", JSON.stringify(updated));
  };

  const handleMoveToCart = (item) => {
    let cart = JSON.parse(localStorage.getItem("cart") || "[]");
    if (!cart.some((c) => c._id === item._id)) {
      cart.push({ ...item, quantity: item.moq || 1 });
      localStorage.setItem("cart", JSON.stringify(cart));
    }
    // Remove from wishlist
    handleRemove(item._id);
  };

  return (
    <div className="bg-[#F4F5F7] min-h-screen flex flex-col">
      <TopUtilityBar />
      <NavBar />
      <SecondaryNavBar />

      <main className="flex-1 overflow-y-auto custom-scrollbar p-6 max-w-7xl mx-auto w-full">
        <div className="flex justify-between items-center mb-10">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">My Favorites & Wishlist</h1>
            <p className="text-gray-500 mt-1">Saved products for future sourcing and comparison.</p>
          </div>
        </div>

        {wishlistItems.length === 0 ? (
          <div className="bg-white p-20 rounded-3xl text-center shadow-sm border border-gray-100">
             <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6 text-red-500">
               <FaHeart size={36} />
             </div>
             <h2 className="text-xl font-bold text-gray-800 mb-2">Your wishlist is empty</h2>
             <p className="text-gray-500 mb-8">Save products you're interested in to easily find them later.</p>
             <button
               onClick={() => navigate("/")}
               className="bg-[#00C2A0] text-white px-8 py-4 rounded-xl font-bold hover:bg-[#00a689] transition-colors cursor-pointer"
             >
               Start Sourcing
             </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6">
            {wishlistItems.map((p) => (
              <div key={p._id} className="relative group flex flex-col justify-between bg-white rounded-lg shadow p-2 border border-gray-150">
                <div
                  onClick={() => handleRemove(p._id)}
                  className="absolute top-4 right-4 aggression-z-10 w-8 h-8 bg-white/90 backdrop-blur-md rounded-full flex items-center justify-center text-red-500 shadow-sm cursor-pointer hover:bg-red-50 hover:text-red-700 transition-all z-20"
                  title="Remove from Wishlist"
                >
                  <FaTrash size={12} />
                </div>
                
                <div className="flex-1">
                  <ProductCard product={{
                    ...p,
                    id: p._id,
                    name: p.title,
                    price: typeof p.price === "number" ? `₹${p.price.toLocaleString()}` : p.price,
                    image: p.images?.[0] || "https://images.unsplash.com/photo-1546868871-7041f2a55e12?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
                  }} />
                </div>

                <div className="mt-3 flex gap-2">
                  <button
                    onClick={() => handleMoveToCart(p)}
                    className="w-full text-xs font-bold py-2 border.5 border-[#195BAC] text-[#195BAC] hover:bg-[#195BAC]/10 rounded-lg transition-all cursor-pointer text-center"
                  >
                    Move to Cart
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
