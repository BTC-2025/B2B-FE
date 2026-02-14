import React from "react";
import LightModeIcon from "@mui/icons-material/LightMode";
import DarkModeIcon from "@mui/icons-material/DarkMode";
import NotificationsIcon from "@mui/icons-material/Notifications";
import SearchIcon from "@mui/icons-material/Search";
import DiamondIcon from "@mui/icons-material/Diamond";

const Header = ({ setSidebarOpen, darkMode, toggleTheme, onNavigate }) => {
  return (
    <header className="h-16 bg-white dark:bg-slate-800 border-b border-gray-200 dark:border-slate-700 flex items-center justify-between px-4 sm:px-6 lg:px-10 sticky top-0 z-20 shadow-sm transition-colors duration-300">
      <div className="flex items-center flex-1 gap-4">
        <button
          className="lg:hidden text-gray-500 hover:text-[#195BAC] transition-colors p-1 rounded-md active:bg-gray-100"
          onClick={() => setSidebarOpen(true)}
        >
          <span className="material-symbols-outlined">menu</span>
        </button>

        {/* Search */}
        <div className="flex-1 max-w-xl hidden sm:block">
          <div className="relative group">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#195BAC] transition-colors flex items-center justify-center">
              <SearchIcon />
            </span>
            <input
              type="text"
              placeholder="Search products, orders, or help..."
              className="w-full h-10 pl-10 pr-4 bg-gray-50 dark:bg-slate-700 border border-transparent rounded-lg text-sm focus:bg-white dark:focus:bg-slate-800 focus:border-[#195BAC] focus:ring-4 focus:ring-[#195BAC]/10 outline-none transition-all duration-300 placeholder:text-gray-400 dark:text-gray-200"
            />
          </div>
        </div>
      </div>

      {/* Right Actions */}
      <div className="flex items-center gap-2 sm:gap-4 ml-4">
        <button
          onClick={() => onNavigate && onNavigate("subscription")}
          className="hidden sm:flex items-center gap-2 text-amber-500 bg-amber-50 dark:bg-amber-500/10 hover:bg-amber-100 dark:hover:bg-amber-500/20 px-3 py-1.5 rounded-full font-medium transition-colors border border-amber-200 dark:border-amber-500/20 mr-2"
        >
          <DiamondIcon fontSize="small" />
          <span className="text-sm">B2B Premium</span>
        </button>
        <button
          onClick={toggleTheme}
          className="text-gray-500 dark:text-gray-300 hover:text-[#195BAC] dark:hover:text-[#4dabf7] hover:bg-[#195BAC]/5 p-2 rounded-full transition-colors flex items-center justify-center"
        >
          {darkMode ? <LightModeIcon /> : <DarkModeIcon />}
        </button>

        <button className="relative text-gray-500 hover:text-[#195BAC] hover:bg-[#195BAC]/5 p-2 rounded-full transition-colors flex items-center justify-center">
          <NotificationsIcon />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border border-white"></span>
        </button>

        <div className="pl-2 border-l border-gray-200">
          <div className="w-9 h-9 bg-gradient-to-br from-[#195BAC] to-[#2a75d1] rounded-full text-white flex items-center justify-center font-bold shadow-md cursor-pointer hover:shadow-lg transition-shadow">
            A
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
