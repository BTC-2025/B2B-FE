import React, { useState } from "react";
import NavBar from "../components/NavBar";
import SecondaryNavBar from "../components/SecondaryNavBar";
import TopUtilityBar from "../components/TopUtilityBar";
import { useNavigate } from "react-router-dom";
import { createOrder } from "../services/api";
import { FaTrash, FaCheck, FaShoppingCart } from "react-icons/fa";

export default function Cart() {
  const navigate = useNavigate();
  const [cartItems, setCartItems] = useState(() => {
    return JSON.parse(localStorage.getItem("cart") || "[]");
  });
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [error, setError] = useState("");

  const handleQuantityChange = (id, val) => {
    const updated = cartItems.map((item) => {
      if (item._id === id) {
        return {
          ...item,
          quantity: Math.max(item.moq || 1, parseInt(val) || 1),
        };
      }
      return item;
    });
    setCartItems(updated);
    localStorage.setItem("cart", JSON.stringify(updated));
  };

  const handleRemove = (id) => {
    const updated = cartItems.filter((item) => item._id !== id);
    setCartItems(updated);
    localStorage.setItem("cart", JSON.stringify(updated));
  };

  const calculateSubtotal = () => {
    return cartItems.reduce((sum, item) => sum + (item.price || 0) * (item.quantity || 1), 0);
  };

  const handleCheckout = async () => {
    setError("");
    const userJson = localStorage.getItem("user");
    if (!userJson) {
      navigate("/seller-login"); // Force login to order
      return;
    }

    try {
      const payload = {
        products: cartItems.map((item) => ({
          product: item._id,
          quantity: item.quantity,
        })),
        shippingAddress: "123 B2B Trade Zone, Mumbai, India",
        paymentMethod: "Bank Transfer",
      };

      await createOrder(payload);
      setOrderPlaced(true);
      setCartItems([]);
      localStorage.setItem("cart", "[]");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to place order.");
    }
  };

  return (
    <div className="bg-[#F4F5F7] min-h-screen flex flex-col">
      <TopUtilityBar />
      <NavBar />
      <SecondaryNavBar />

      <main className="flex-1 p-6 md:p-8 max-w-7xl mx-auto w-full overflow-y-auto custom-scrollbar">
        <div className="mb-4">
          <button
            onClick={() => navigate("/")}
            className="text-primary hover:underline font-bold text-sm"
          >
            ← Continue Sourcing
          </button>
        </div>

        <h1 className="text-3xl font-bold mb-8 text-gray-800">Sourcing Cart</h1>

        {orderPlaced ? (
          <div className="bg-white p-12 rounded-2xl text-center shadow-md border border-gray-100 max-w-xl mx-auto">
            <div className="w-16 h-16 bg-teal-50 text-teal-500 rounded-full flex items-center justify-center mx-auto mb-6">
              <FaCheck size={28} />
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Order Placed Successfully!</h2>
            <p className="text-gray-500 mb-8">
              Your wholesale trade contract has been registered. The supplier has been notified.
            </p>
            <button
              onClick={() => navigate("/orders")}
              className="bg-primary text-white px-8 py-3 rounded-xl font-bold hover:bg-blue-700 transition-all cursor-pointer"
            >
              Track Transactions
            </button>
          </div>
        ) : cartItems.length === 0 ? (
          <div className="bg-white p-16 rounded-2xl text-center shadow-md border border-gray-100 max-w-2xl mx-auto">
            <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6 text-gray-400">
              <FaShoppingCart size={32} />
            </div>
            <h2 className="text-xl font-bold text-gray-800 mb-2">Your sourcing cart is empty</h2>
            <p className="text-gray-500 mb-8">Add products from verified suppliers to start a wholesale transaction.</p>
            <button
              onClick={() => navigate("/")}
              className="bg-[#00C2A0] text-white px-6 py-2.5 rounded-lg font-bold hover:bg-[#00a386] transition-colors cursor-pointer"
            >
              Browse Products
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Left Side: Items List */}
            <div className="lg:col-span-8 space-y-4">
              {error && (
                <div className="p-4 bg-red-50 text-red-600 rounded-xl font-bold text-sm border border-red-100 mb-4">
                  {error}
                </div>
              )}
              {cartItems.map((item) => (
                <div
                  key={item._id}
                  className="bg-white rounded-xl p-4 md:p-6 shadow-sm border border-gray-150 flex flex-col md:flex-row items-center gap-6 justify-between"
                >
                  <div className="flex items-center gap-4 w-full md:w-auto">
                    <img
                      src={item.images?.[0] || "https://images.unsplash.com/photo-1546868871-7041f2a55e12?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"}
                      className="w-20 h-20 object-contain rounded-lg border border-gray-100 flex-shrink-0"
                      alt={item.title}
                    />
                    <div>
                      <h3
                        onClick={() => navigate(`/product/${item._id}`)}
                        className="font-bold text-gray-800 hover:text-primary transition-colors cursor-pointer text-base line-clamp-2"
                      >
                        {item.title}
                      </h3>
                      <p className="text-xs text-gray-400 mt-1">Brand: {item.brand}</p>
                      <p className="text-xs text-[#00C2A0] font-bold mt-0.5">MOQ: {item.moq} pcs</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between w-full md:w-auto gap-8">
                    <div>
                      <span className="text-xs text-gray-400 block font-semibold">Unit Price</span>
                      <span className="font-bold text-gray-800">₹{item.price.toLocaleString()}</span>
                    </div>

                    <div className="flex flex-col items-center gap-1">
                      <span className="text-xs text-gray-400 font-semibold">Quantity</span>
                      <div className="flex items-center border border-gray-300 rounded-lg overflow-hidden h-9">
                        <button
                          onClick={() => handleQuantityChange(item._id, item.quantity - 1)}
                          className="px-2.5 bg-gray-100 hover:bg-gray-200 font-bold"
                        >
                          -
                        </button>
                        <input
                          type="number"
                          value={item.quantity}
                          onChange={(e) => handleQuantityChange(item._id, e.target.value)}
                          className="w-12 text-center text-xs font-bold focus:outline-none"
                        />
                        <button
                          onClick={() => handleQuantityChange(item._id, item.quantity + 1)}
                          className="px-2.5 bg-gray-100 hover:bg-gray-200 font-bold"
                        >
                          +
                        </button>
                      </div>
                    </div>

                    <button
                      onClick={() => handleRemove(item._id)}
                      className="text-red-500 hover:text-red-700 transition-colors p-2 hover:bg-red-50 rounded-lg cursor-pointer"
                      title="Remove Item"
                    >
                      <FaTrash size={14} />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Right Side: Contract Summary */}
            <div className="lg:col-span-4">
              <div className="bg-white rounded-xl border border-gray-150 p-6 shadow-sm sticky top-6 space-y-6">
                <h3 className="font-bold text-gray-850 text-lg border-b border-gray-50 pb-4">
                  Contract Order Summary
                </h3>

                <div className="space-y-3 text-sm text-gray-600">
                  <div className="flex justify-between">
                    <span>Total Unique Items</span>
                    <span className="font-bold text-gray-800">{cartItems.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Total Pieces Quantity</span>
                    <span className="font-bold text-gray-800">
                      {cartItems.reduce((acc, item) => acc + item.quantity, 0)} pcs
                    </span>
                  </div>
                  <hr className="border-gray-50" />
                  <div className="flex justify-between text-base text-gray-800 font-bold">
                    <span>Grand Total</span>
                    <span className="text-[#195BAC] text-lg">
                      ₹{calculateSubtotal().toLocaleString()}
                    </span>
                  </div>
                </div>

                <button
                  onClick={handleCheckout}
                  className="w-full bg-[#00C2A0] text-white py-3 rounded-xl font-bold shadow-lg shadow-[#00C2A0]/20 hover:shadow-xl hover:shadow-[#00C2A0]/30 transition-all hover:bg-[#00a98b] text-sm cursor-pointer"
                >
                  Place B2B Order
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
