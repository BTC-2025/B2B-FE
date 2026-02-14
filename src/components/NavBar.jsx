import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { CgProfile } from "react-icons/cg";
import { FaMessage } from "react-icons/fa6";
import { IoIosNotifications } from "react-icons/io";
import { FaBars } from "react-icons/fa";
import { categories } from "../data/Category";
import { FaShoppingCart } from "react-icons/fa";

export default function NavBar() {
  const navigate = useNavigate();
  const [showCategories, setShowCategories] = useState(false);

  return (
    <div className="bg-white px-6 py-3 flex items-center justify-between shadow-md relative z-50">
      {/* Logo & Categories Trigger */}
      <div className="flex items-center space-x-6">
        <h1
          onClick={() => navigate("/")}
          className="text-2xl font-bold text-primary cursor-pointer tracking-tight"
        >
          B2BMarket
        </h1>

        <div className="relative">
          <button
            onClick={() => setShowCategories(!showCategories)}
            className="flex items-center space-x-2 text-gray-700 hover:text-primary font-medium border border-gray-200 px-3 py-1.5 rounded-md hover:border-primary transition-colors hidden"
          >
            <FaBars />
            <span>All Categories</span>
          </button>

          {/* Dropdown Menu */}
          {showCategories && (
            <div className="absolute top-12 left-0 w-64 bg-white shadow-xl rounded-lg border border-gray-100 max-h-96 overflow-y-auto custom-scrollbar">
              {categories.map((cat, idx) => (
                <div
                  key={idx}
                  onClick={() => {
                    navigate(`/category/${encodeURIComponent(cat)}`);
                    setShowCategories(false);
                  }}
                  className="px-4 py-2 hover:bg-gray-50 cursor-pointer text-sm text-gray-700 hover:text-primary"
                >
                  {cat}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Center Search */}
      <div className="flex w-1/3 mx-4">
        <input
          className="w-full border border-gray-300 rounded-l-md px-4 py-2 text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
          placeholder="Search for products, suppliers..."
        />
        <button className="bg-primary text-white px-6 py-2 rounded-r-md font-medium hover:bg-blue-700 transition-colors">
          Search
        </button>
      </div>

      {/* Right Actions */}
      <div className="flex items-center space-x-6 text-gray-600">
        <div className="flex flex-col items-center cursor-pointer hover:text-primary transition-colors relative group">
          <IoIosNotifications size={22} />
          <span className="text-xs">Alerts</span>
        </div>

        <div className="flex flex-col items-center cursor-pointer hover:text-primary transition-colors">
          <FaMessage size={20} />
          <span className="text-xs">Messages</span>
        </div>

        <div
          onClick={() => navigate("/cart")}
          className="flex flex-col items-center cursor-pointer hover:text-primary transition-colors"
        >
          {/* Simple cart icon implementation without import for now, or reuse existing if available in layout, but standard approach: */}
          <span className="text-lg font-bold">
            <FaShoppingCart size={22} />
          </span>
          <span className="text-xs">Cart</span>
        </div>

        <div
          onClick={() => navigate("/settings")}
          className="flex flex-col items-center cursor-pointer hover:text-primary transition-colors"
        >
          <CgProfile size={22} />
          <span className="text-xs">Profile</span>
        </div>

        <button
          onClick={() => navigate("/seller-signup")}
          className="bg-primary text-white px-5 py-2 rounded-md font-semibold hover:bg-blue-700 transition-colors shadow-sm"
        >
          Become a Seller
        </button>
      </div>
    </div>
  );
}
