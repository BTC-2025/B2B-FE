import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { categories } from "../data/Category";
import {
  FaChevronDown,
  FaChevronUp,
  FaHeadset,
  FaShoppingCart,
  FaClipboardList,
} from "react-icons/fa";
import { IoSettingsSharp } from "react-icons/io5";

export default function SideBar() {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <aside className="w-64 bg-white p-4 shadow h-full flex flex-col">
      {/* Category Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-3 bg-primary text-white rounded-lg shadow-md hover:opacity-90 transition-opacity mb-4"
      >
        <span className="font-semibold">All Categories</span>
        {isOpen ? <FaChevronUp /> : <FaChevronDown />}
      </button>

      {/* Categories List Container */}
      <div
        className={`transition-all duration-300 ease-in-out bg-gray-50 rounded-lg custom-scrollbar ${
          isOpen
            ? "max-h-60 opacity-100 p-2 mb-4 overflow-y-auto shadow-inner border border-gray-200"
            : "max-h-0 opacity-0 overflow-hidden"
        }`}
      >
        <ul className="space-y-2 text-sm">
          {categories.map((category, index) => (
            <li
              key={index}
              onClick={() =>
                navigate(`/category/${encodeURIComponent(category)}`)
              }
              className="cursor-pointer hover:text-primary hover:bg-white p-2 rounded transition-colors duration-200"
            >
              {category}
            </li>
          ))}
        </ul>
      </div>

      <button
        onClick={() => navigate("/cart")}
        className="w-full flex items-center space-x-3 p-2 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors text-left"
      >
        <FaShoppingCart className="text-primary" />
        <span>My Cart</span>
      </button>
      <button
        onClick={() => navigate("/orders")}
        className="w-full flex items-center space-x-3 p-2 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors text-left"
      >
        <FaClipboardList className="text-primary" />
        <span>My Orders</span>
      </button>

      <button
        onClick={() => navigate("/help-desk")}
        className="w-full flex items-center space-x-3 p-2 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors text-left"
      >
        <FaHeadset className="text-primary" />
        <span>Help Desk</span>
      </button>

      {/* Settings Button */}
      <button
        onClick={() => navigate("/settings")}
        className="w-full flex items-center justify-center space-x-2 p-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors mt-auto"
      >
        <IoSettingsSharp />
        <span>Settings</span>
      </button>
    </aside>
  );
}
