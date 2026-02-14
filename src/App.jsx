import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Sell from "./pages/Sell";
import CategoryPage from "./pages/CategoryPage";
import Settings from "./pages/Settings";
import Language from "./pages/Language";

import ChatBot from "./pages/ChatBot";
import Cart from "./pages/Cart";
import Orders from "./pages/Orders";
import SellerLogin from "./components/seller/SellerLogin";
import SellerRegister from "./components/seller/SellerRegister";
import SellerDashboard from "./pages/SellerDashboard/SellerDashboard";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/sell" element={<Sell />} />
        <Route path="/category/:categoryName" element={<CategoryPage />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/language" element={<Language />} />
        <Route path="/help-desk" element={<ChatBot />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/orders" element={<Orders />} />
        <Route path="/seller-login" element={<SellerLogin />} />
        <Route path="/seller-signup" element={<SellerRegister />} />
        <Route path="/seller-dashboard" element={<SellerDashboard />} />
      </Routes>
    </BrowserRouter>
  );
}
