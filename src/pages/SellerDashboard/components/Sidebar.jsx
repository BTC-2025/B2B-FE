import React, { useState } from "react";
import { FaShoppingCart } from "react-icons/fa";
import BarChartIcon from "@mui/icons-material/BarChart";
import { IoStar } from "react-icons/io5";
import { AiFillCustomerService } from "react-icons/ai";
import AccountBalanceWalletIcon from "@mui/icons-material/AccountBalanceWallet";
import SettingsIcon from "@mui/icons-material/Settings";
import LogoutIcon from "@mui/icons-material/Logout";
import { MdInventory } from "react-icons/md";
import SpaceDashboardIcon from "@mui/icons-material/SpaceDashboard";

const NavItem = ({
  icon,
  label,
  active,
  hasSubMenu,
  badge,
  onClick,
  isOpen,
}) => {
  return (
    <div
      onClick={onClick}
      className={`flex items-center justify-between px-4 py-3 rounded-lg cursor-pointer transition-colors ${active ? "bg-[#195BAC]/10 text-[#195BAC] dark:bg-[#195BAC]/20 dark:text-[#5c9ce6]" : "hover:bg-gray-50 dark:hover:bg-slate-700 text-gray-600 dark:text-gray-400"}`}
    >
      <div className="flex items-center gap-3">
        {typeof icon === "string" ? (
          <span
            className={`material-symbols-outlined text-xl ${active ? "fill-current" : ""}`}
          >
            {icon}
          </span>
        ) : (
          <span
            className={`text-xl flex items-center justify-center ${active ? "text-[#195BAC] dark:text-[#5c9ce6]" : ""}`}
          >
            {icon}
          </span>
        )}
        <span className="font-medium">{label}</span>
      </div>
      {hasSubMenu && (
        <span
          className={`material-symbols-outlined text-gray-400 text-sm transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
        >
          
        </span>
      )}
      {badge && (
        <span className="bg-[#00C2A0] text-white text-[10px] font-bold px-1.5 py-0.5 rounded">
          {badge}
        </span>
      )}
    </div>
  );
};

const SubNavItem = ({ label, active, onClick }) => {
  return (
    <div
      onClick={onClick}
      className={`py-2 px-3 rounded-md text-sm cursor-pointer transition-colors ${active ? "bg-[#195BAC] text-white shadow-md" : "text-gray-500 dark:text-gray-400 hover:text-[#195BAC] dark:hover:text-[#5c9ce6]"}`}
    >
      {label}
    </div>
  );
};

const Sidebar = ({ isOpen, setIsOpen, onNavigate }) => {
  const [isProductsOpen, setIsProductsOpen] = useState(true);

  return (
    <>
      {/* Overlay for mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-20 lg:hidden glass-overlay"
          onClick={() => setIsOpen(false)}
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-30 w-64 bg-white dark:bg-slate-800 border-r border-gray-200 dark:border-slate-700 transform transition-transform duration-300 lg:translate-x-0 lg:static lg:inset-0 flex flex-col ${isOpen ? "translate-x-0" : "-translate-x-full"}`}
      >
        {/* Logo */}
        <div className="flex items-center gap-2 h-16 px-6 border-b border-gray-100 dark:border-slate-700 flex-shrink-0">
          <div className="w-8 h-8 bg-[#195BAC] rounded-full flex items-center justify-center text-white font-bold text-lg shadow-sm">
            S
          </div>
          <span className="text-xl font-bold text-[#195BAC] dark:text-[#5c9ce6] tracking-tight">
            SellerPoint
          </span>
          <button
            className="ml-auto lg:hidden text-gray-500 hover:text-[#195BAC] transition-colors"
            onClick={() => setIsOpen(false)}
          >
            <span className="material-symbols-outlined">menu_open</span>
          </button>
        </div>

        {/* Nav Items with custom scrollbar */}
        <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1 custom-scrollbar">
          <NavItem
            icon={<SpaceDashboardIcon />}
            label="Dashboard"
            onClick={() => onNavigate && onNavigate("dashboard")}
          />

          <div className="pt-2 pb-1">
            <NavItem
              icon={<MdInventory />}
              label="Products"
              hasSubMenu
              isOpen={isProductsOpen}
              onClick={() => setIsProductsOpen(!isProductsOpen)}
            />
            <div
              className={`overflow-hidden transition-all duration-300 ease-in-out ${isProductsOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0"}`}
            >
              <div className="ml-9 mt-1 space-y-1 border-l-2 border-gray-100 dark:border-slate-700 pl-3">
                <SubNavItem
                  label="Top Products"
                  onClick={() => onNavigate && onNavigate()}
                />
                <SubNavItem
                  label="Product Grid"
                  onClick={() => onNavigate && onNavigate()}
                />
                <SubNavItem
                  label="Product Management"
                  onClick={() => onNavigate && onNavigate()}
                />
                <SubNavItem
                  label="Product Categories"
                  onClick={() => onNavigate && onNavigate()}
                />
                <SubNavItem
                  label="Add New Product +"
                  active
                  onClick={() => onNavigate && onNavigate("add-product")}
                />
              </div>
            </div>
          </div>

          <NavItem
            icon={<FaShoppingCart />}
            label="Orders"
            onClick={() => onNavigate && onNavigate("orders")}
          />
          <NavItem
            icon={<BarChartIcon />}
            label="Statistics"
            onClick={() => onNavigate && onNavigate("statistics")}
          />
          <NavItem
            icon={<IoStar />}
            label="Reviews"
            onClick={() => onNavigate && onNavigate("reviews")}
          />
          <NavItem
            icon={<AiFillCustomerService />}
            label="Customers"
            onClick={() => onNavigate && onNavigate("customers")}
          />
          <NavItem
            icon={<AccountBalanceWalletIcon />}
            label="Transactions"
            onClick={() => onNavigate && onNavigate("transactions")}
          />
          <NavItem
            icon={<span className="material-symbols-outlined">payments</span>}
            label="Subscription Plans"
            onClick={() => onNavigate && onNavigate("subscription")}
          />
          <div className="pt-4 mt-4 border-t border-gray-100 dark:border-slate-700">
            <NavItem
              icon={<SettingsIcon />}
              label="Settings"
              onClick={() => onNavigate && onNavigate("settings")}
            />
            <NavItem icon={<LogoutIcon />} label="Logout" />
          </div>
        </nav>
      </aside>
    </>
  );
};

export default Sidebar;
