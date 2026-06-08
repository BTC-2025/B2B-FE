import { BrowserRouter, Routes, Route } from "react-router-dom";
import { lazy, Suspense } from "react";

// ── Code-split every page so only the current route's JS is loaded ──
const Home               = lazy(() => import("./pages/Home"));
const Sell               = lazy(() => import("./pages/Sell"));
const CategoryPage       = lazy(() => import("./pages/CategoryPage"));
const Settings           = lazy(() => import("./pages/Settings"));
const Language           = lazy(() => import("./pages/Language"));
const PostRFQ            = lazy(() => import("./pages/PostRFQ"));
const Wishlist           = lazy(() => import("./pages/Wishlist"));
const ProductDetailPage  = lazy(() => import("./pages/ProductDetailPage"));
const ChatBot            = lazy(() => import("./pages/ChatBot"));
const Cart               = lazy(() => import("./pages/Cart"));
const Orders             = lazy(() => import("./pages/Orders"));
const Login              = lazy(() => import("./pages/Login"));
const Register           = lazy(() => import("./pages/Register"));
const SellerLogin        = lazy(() => import("./components/seller/SellerLogin"));
const SellerRegister     = lazy(() => import("./components/seller/SellerRegister"));
const SellerDashboard    = lazy(() => import("./pages/SellerDashboard/SellerDashboard"));

// Minimal full-screen shimmer shown during lazy chunk download
function PageSkeleton() {
  return (
    <div className="h-screen w-screen flex flex-col">
      {/* Top nav placeholder */}
      <div className="h-10 w-full skeleton-shimmer" />
      <div className="h-14 w-full bg-white border-b border-gray-100" />
      {/* Body placeholder */}
      <div className="flex-1 p-8 grid grid-cols-2 md:grid-cols-4 xl:grid-cols-5 gap-6 bg-[#E9F4FF]">
        {Array.from({ length: 10 }).map((_, i) => (
          <div key={i} className="bg-white rounded-2xl p-3 flex flex-col gap-3 border border-gray-100">
            <div className="h-44 rounded-xl skeleton-shimmer" />
            <div className="h-3 w-full rounded-full skeleton-shimmer" />
            <div className="h-3 w-3/5 rounded-full skeleton-shimmer" />
            <div className="h-4 w-2/5 rounded-full skeleton-shimmer" />
            <div className="h-8 rounded-lg skeleton-shimmer mt-auto" />
          </div>
        ))}
      </div>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Suspense fallback={<PageSkeleton />}>
        <Routes>
          <Route path="/"                  element={<Home />} />
          <Route path="/sell"              element={<Sell />} />
          <Route path="/category/:categoryName" element={<CategoryPage />} />
          <Route path="/settings"          element={<Settings />} />
          <Route path="/language"          element={<Language />} />
          <Route path="/help-desk"         element={<ChatBot />} />
          <Route path="/cart"              element={<Cart />} />
          <Route path="/orders"            element={<Orders />} />
          <Route path="/login"             element={<Login />} />
          <Route path="/register"          element={<Register />} />
          <Route path="/seller-login"      element={<SellerLogin />} />
          <Route path="/seller-signup"     element={<SellerRegister />} />
          <Route path="/seller-dashboard"  element={<SellerDashboard />} />
          <Route path="/post-rfq"          element={<PostRFQ />} />
          <Route path="/wishlist"          element={<Wishlist />} />
          <Route path="/product/:productId" element={<ProductDetailPage />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}
