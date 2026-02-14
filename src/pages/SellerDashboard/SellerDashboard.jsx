import React, { useState, useEffect } from "react";
import Sidebar from "./components/Sidebar";
import Header from "./components/Header";
import ProductEditor from "./components/ProductEditor";
import { products as initialProducts } from "../../data/Product";
import ProductCard from "../../components/ProductCard";
import DashboardHome from "./components/DashboardHome";
import SubscriptionPage from "./components/SubscriptionPage";

const SellerDashboard = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [activeView, setActiveView] = useState("dashboard"); // Default view
  const [allProducts, setAllProducts] = useState(initialProducts);

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [darkMode]);

  const toggleTheme = () => {
    setDarkMode(!darkMode);
  };

  const handleNavigate = (view) => {
    setActiveView(view);
    if (window.innerWidth < 1024) {
      setSidebarOpen(false);
    }
  };

  const handleAddProduct = (newProduct) => {
    setAllProducts((prev) => [newProduct, ...prev]);
    setActiveView("products"); // Switch to product list view
  };

  const renderContent = () => {
    if (activeView === "add-product") {
      return (
        <ProductEditor isNewProduct={true} onAddProduct={handleAddProduct} />
      );
    }

    if (activeView === "products") {
      return (
        <div className="flex-1 overflow-y-auto custom-scrollbar p-4 sm:p-6 lg:p-10 pb-20">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
            Product Grid
          </h1>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {allProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      );
    }

    if (activeView === "subscription") {
      return <SubscriptionPage />;
    }

    // Default: Dashboard Home Template
    return <DashboardHome />;
  };

  return (
    <div
      className={`flex h-screen bg-[#F4F5F7] dark:bg-slate-900 font-sans text-slate-800 dark:text-gray-100 overflow-hidden`}
    >
      {/* Sidebar */}
      <Sidebar
        isOpen={sidebarOpen}
        setIsOpen={setSidebarOpen}
        onNavigate={handleNavigate}
      />

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
        <Header
          setSidebarOpen={setSidebarOpen}
          darkMode={darkMode}
          toggleTheme={toggleTheme}
          onNavigate={handleNavigate}
        />

        {/* Content Body */}
        {renderContent()}
      </main>
    </div>
  );
};

export default SellerDashboard;
