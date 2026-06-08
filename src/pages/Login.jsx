import { useRef, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { loginUser, loginWithGoogle } from "../services/api";

// Google icon SVG (official colors)
function GoogleIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M43.611 20.083H42V20H24v8h11.303C33.654 32.657 29.332 36 24 36c-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 12.955 4 4 12.955 4 24s8.955 20 20 20 20-8.955 20-20c0-1.341-.138-2.65-.389-3.917z" fill="#FFC107"/>
      <path d="M6.306 14.691l6.571 4.819C14.655 15.108 19.001 12 24 12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 16.318 4 9.656 8.337 6.306 14.691z" fill="#FF3D00"/>
      <path d="M24 44c5.166 0 9.86-1.977 13.409-5.192l-6.19-5.238C29.211 35.091 26.715 36 24 36c-5.314 0-9.827-3.307-11.558-7.914l-6.52 5.025C9.505 39.556 16.227 44 24 44z" fill="#4CAF50"/>
      <path d="M43.611 20.083H42V20H24v8h11.303a11.987 11.987 0 01-4.087 5.571l.003-.002 6.19 5.238C36.971 39.205 44 34 44 24c0-1.341-.138-2.65-.389-3.917z" fill="#1976D2"/>
    </svg>
  );
}

export default function Login() {
  const navigate = useNavigate();
  const [tab, setTab] = useState("buyer"); // "buyer" | "seller"
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showGoogleModal, setShowGoogleModal] = useState(false);
  const [customGoogleEmail, setCustomGoogleEmail] = useState("");
  const [customGoogleName, setCustomGoogleName] = useState("");
  const [showCustomGoogleForm, setShowCustomGoogleForm] = useState(false);
  const authInFlightRef = useRef(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    if (authInFlightRef.current) return;
    const trimmedEmail = email.trim().toLowerCase();
    if (!trimmedEmail || !password) {
      setError("Please enter your email and password.");
      return;
    }
    authInFlightRef.current = true;
    setLoading(true);
    try {
      const data = await loginUser({ email: trimmedEmail, password });
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data));
      const role = data.role || data.user?.role;
      if (role === "SELLER") {
        navigate("/seller-dashboard");
      } else {
        navigate("/");
      }
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Invalid email or password. Please try again."
      );
    } finally {
      authInFlightRef.current = false;
      setLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    if (authInFlightRef.current) return;
    setShowGoogleModal(true);
  };

  const submitGoogleAuth = async (googleEmail, googleName) => {
    if (authInFlightRef.current) return;
    const trimmedEmail = googleEmail.trim().toLowerCase();
    const trimmedName = googleName.trim();
    if (!trimmedEmail || !trimmedName) {
      setError("Please enter the Google account name and email.");
      return;
    }
    setShowGoogleModal(false);
    setShowCustomGoogleForm(false);
    setError("");
    authInFlightRef.current = true;
    setLoading(true);
    try {
      const selectedRole = tab === "seller" ? "SELLER" : "BUYER";
      const data = await loginWithGoogle({ 
        email: trimmedEmail, 
        name: trimmedName,
        role: selectedRole,
        companyName: selectedRole === "SELLER" ? (trimmedName + "'s Store") : undefined
      });
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data));
      
      const userRole = data.role || data.user?.role;
      if (userRole === "SELLER") {
        navigate("/seller-dashboard");
      } else {
        navigate("/");
      }
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Google Sign-In failed. Please try again."
      );
    } finally {
      authInFlightRef.current = false;
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#E9F4FF] via-white to-[#EEF6FF] flex flex-col">

      {/* ── Top Bar ── */}
      <header className="flex items-center justify-between px-8 py-4">
        <button
          onClick={() => navigate("/")}
          className="flex items-center gap-2 group"
        >
          <div className="w-9 h-9 bg-[#195BAC] rounded-xl flex items-center justify-center shadow-lg shadow-[#195BAC]/30">
            <span className="text-white font-black text-lg">B</span>
          </div>
          <span className="text-xl font-black text-[#195BAC] tracking-tight">B2BMarket</span>
        </button>
        <div className="flex items-center gap-3 text-sm text-gray-500">
          <span>Don't have an account?</span>
          <button
            onClick={() => navigate("/register")}
            className="text-[#195BAC] font-bold hover:underline"
          >
            Sign Up Free
          </button>
        </div>
      </header>

      {/* ── Main Content ── */}
      <main className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-[460px]">

          {/* Card */}
          <div className="bg-white rounded-3xl shadow-2xl shadow-[#195BAC]/10 border border-gray-100 overflow-hidden">

            {/* Gradient header bar */}
            <div className="h-1.5 bg-gradient-to-r from-[#195BAC] via-[#2e7de5] to-[#00C2A0]" />

            <div className="px-8 pt-8 pb-6 sm:px-10 sm:pt-10">
              {/* Title */}
              <div className="mb-6">
                <h1 className="text-3xl font-black text-gray-900 mb-1">Welcome back</h1>
                <p className="text-gray-500 text-sm">Sign in to continue to B2BMarket</p>
              </div>

              {/* Buyer / Seller Tab */}
              <div className="flex bg-gray-100 rounded-xl p-1 mb-6">
                {[
                  { key: "buyer",  label: "🛒  Buyer" },
                  { key: "seller", label: "🏭  Seller" },
                ].map(({ key, label }) => (
                  <button
                    key={key}
                    onClick={() => { setTab(key); setError(""); }}
                    className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all ${
                      tab === key
                        ? "bg-white text-[#195BAC] shadow-sm"
                        : "text-gray-500 hover:text-gray-700"
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>

              {/* Google Button */}
              <button
                type="button"
                onClick={handleGoogleLogin}
                disabled={loading}
                className="w-full flex items-center justify-center gap-3 py-3 rounded-xl border-2 border-gray-200 hover:border-[#195BAC]/30 hover:bg-gray-50 transition-all font-semibold text-gray-700 mb-5 group disabled:opacity-60 disabled:cursor-not-allowed"
              >
                <GoogleIcon />
                <span>Continue with Google</span>
              </button>

              {/* Divider */}
              <div className="flex items-center gap-4 mb-5">
                <div className="flex-1 h-px bg-gray-200" />
                <span className="text-xs text-gray-400 font-medium">or sign in with email</span>
                <div className="flex-1 h-px bg-gray-200" />
              </div>

              {/* Error */}
              {error && (
                <div className="mb-4 flex items-start gap-2 p-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl">
                  <span className="text-base">⚠️</span>
                  <span>{error}</span>
                </div>
              )}

              {/* Form */}
              <form onSubmit={handleLogin} className="flex flex-col gap-4">
                {/* Email */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-semibold text-gray-700">Email Address</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@company.com"
                    required
                    autoComplete="email"
                    className="w-full h-12 rounded-xl border-2 border-gray-200 px-4 text-sm focus:border-[#195BAC] focus:ring-4 focus:ring-[#195BAC]/10 outline-none transition-all"
                  />
                </div>

                {/* Password */}
                <div className="flex flex-col gap-1.5">
                  <div className="flex justify-between items-center">
                    <label className="text-sm font-semibold text-gray-700">Password</label>
                    <button
                      type="button"
                      onClick={() => navigate("/forgot-password")}
                      className="text-xs text-[#195BAC] font-semibold hover:underline"
                    >
                      Forgot password?
                    </button>
                  </div>
                  <div className="relative">
                    <input
                      type={showPw ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Enter your password"
                      required
                      autoComplete="current-password"
                      className="w-full h-12 rounded-xl border-2 border-gray-200 px-4 pr-12 text-sm focus:border-[#195BAC] focus:ring-4 focus:ring-[#195BAC]/10 outline-none transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPw(!showPw)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 text-lg"
                    >
                      {showPw ? "🙈" : "👁"}
                    </button>
                  </div>
                </div>

                {/* Remember me */}
                <label className="flex items-center gap-2 cursor-pointer group">
                  <input
                    type="checkbox"
                    className="w-4 h-4 rounded border-gray-300 text-[#195BAC] focus:ring-[#195BAC]/30"
                  />
                  <span className="text-sm text-gray-600 group-hover:text-gray-900 transition-colors">
                    Keep me signed in
                  </span>
                </label>

                {/* Submit */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full h-12 bg-[#195BAC] hover:bg-[#154a8f] active:scale-[0.98] text-white rounded-xl font-bold text-sm transition-all shadow-lg shadow-[#195BAC]/25 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-1"
                >
                  {loading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Signing in…
                    </>
                  ) : (
                    `Sign In as ${tab === "buyer" ? "Buyer" : "Seller"}`
                  )}
                </button>
              </form>
            </div>

            {/* Card Footer */}
            <div className="bg-gray-50 border-t border-gray-100 px-8 py-4 sm:px-10 text-center">
              <p className="text-sm text-gray-500">
                New to B2BMarket?{" "}
                <button
                  onClick={() => navigate("/register")}
                  className="text-[#195BAC] font-bold hover:underline"
                >
                  Create a free account
                </button>
              </p>
            </div>
          </div>

          {/* Trust badges */}
          <div className="mt-6 flex justify-center gap-6 text-xs text-gray-400">
            <span className="flex items-center gap-1">🔒 SSL Encrypted</span>
            <span className="flex items-center gap-1">✅ 200K+ Verified Suppliers</span>
            <span className="flex items-center gap-1">🌍 Global Reach</span>
          </div>
        </div>
      </main>

      {/* Decorative blobs */}
      <div className="fixed inset-0 -z-10 pointer-events-none overflow-hidden">
        <div className="absolute -top-20 -left-20 w-96 h-96 bg-[#195BAC]/5 rounded-full blur-3xl" />
        <div className="absolute -bottom-20 -right-20 w-96 h-96 bg-[#00C2A0]/8 rounded-full blur-3xl" />
      </div>

      {/* Google Sign-in Mock Modal */}
      {showGoogleModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-[420px] rounded-2xl shadow-2xl border border-gray-100 overflow-hidden flex flex-col transform scale-100 transition-all duration-300">
            
            {/* Header */}
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <svg width="20" height="20" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M43.611 20.083H42V20H24v8h11.303C33.654 32.657 29.332 36 24 36c-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 12.955 4 4 12.955 4 24s8.955 20 20 20 20-8.955 20-20c0-1.341-.138-2.65-.389-3.917z" fill="#FFC107"/>
                  <path d="M6.306 14.691l6.571 4.819C14.655 15.108 19.001 12 24 12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 16.318 4 9.656 8.337 6.306 14.691z" fill="#FF3D00"/>
                  <path d="M24 44c5.166 0 9.86-1.977 13.409-5.192l-6.19-5.238C29.211 35.091 26.715 36 24 36c-5.314 0-9.827-3.307-11.558-7.914l-6.52 5.025C9.505 39.556 16.227 44 24 44z" fill="#4CAF50"/>
                  <path d="M43.611 20.083H42V20H24v8h11.303a11.987 11.987 0 01-4.087 5.571l.003-.002 6.19 5.238C36.971 39.205 44 34 44 24c0-1.341-.138-2.65-.389-3.917z" fill="#1976D2"/>
                </svg>
                <span className="font-semibold text-gray-700">Sign in with Google</span>
              </div>
              <button 
                onClick={() => { setShowGoogleModal(false); setShowCustomGoogleForm(false); }}
                className="text-gray-400 hover:text-gray-600 text-2xl font-bold cursor-pointer"
              >
                &times;
              </button>
            </div>

            <div className="p-6">
              {!showCustomGoogleForm ? (
                <div className="flex flex-col gap-3">
                  <p className="text-sm text-gray-500 mb-2">Choose an account to continue to B2BMarket</p>
                  
                  {[
                    { name: "John Smith", email: "john.smith@gmail.com", avatar: "JS" },
                    { name: "Sarah Connor", email: "sarah.connor@cyberdyne.com", avatar: "SC" },
                    { name: "Alex Mercer", email: "alex.mercer@gentek.com", avatar: "AM" }
                  ].map((acc) => (
                    <button
                      key={acc.email}
                      onClick={() => submitGoogleAuth(acc.email, acc.name)}
                      disabled={loading}
                      className="flex items-center gap-3 p-3 rounded-xl border border-gray-150 hover:bg-[#F3F9FF] hover:border-[#195BAC]/30 transition-all text-left group cursor-pointer"
                    >
                      <div className="w-9 h-9 rounded-full bg-[#195BAC]/10 text-[#195BAC] font-bold flex items-center justify-center group-hover:bg-[#195BAC] group-hover:text-white transition-colors">
                        {acc.avatar}
                      </div>
                      <div className="flex-1">
                        <div className="font-bold text-gray-800 text-sm">{acc.name}</div>
                        <div className="text-xs text-gray-500">{acc.email}</div>
                      </div>
                    </button>
                  ))}

                  <button
                    onClick={() => setShowCustomGoogleForm(true)}
                    className="mt-3 text-center text-sm font-semibold text-[#195BAC] hover:underline cursor-pointer"
                  >
                    Use another account
                  </button>
                </div>
              ) : (
                <form onSubmit={(e) => {
                  e.preventDefault();
                  submitGoogleAuth(customGoogleEmail, customGoogleName);
                }} className="flex flex-col gap-4">
                  <p className="text-sm text-gray-500">Sign in with a custom Google Account</p>
                  
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-gray-600">Full Name</label>
                    <input
                      type="text"
                      required
                      value={customGoogleName}
                      onChange={(e) => setCustomGoogleName(e.target.value)}
                      placeholder="Jane Doe"
                      className="w-full h-11 rounded-xl border-2 border-gray-200 px-4 text-sm focus:border-[#195BAC] focus:ring-4 focus:ring-[#195BAC]/10 outline-none transition-all"
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-gray-600">Email Address</label>
                    <input
                      type="email"
                      required
                      value={customGoogleEmail}
                      onChange={(e) => setCustomGoogleEmail(e.target.value)}
                      placeholder="jane.doe@gmail.com"
                      className="w-full h-11 rounded-xl border-2 border-gray-200 px-4 text-sm focus:border-[#195BAC] focus:ring-4 focus:ring-[#195BAC]/10 outline-none transition-all"
                    />
                  </div>

                  <div className="flex gap-3 mt-2">
                    <button
                      type="button"
                      onClick={() => setShowCustomGoogleForm(false)}
                      className="flex-1 h-11 rounded-xl border-2 border-gray-250 font-bold text-sm text-gray-600 hover:bg-gray-50 cursor-pointer"
                    >
                      Back
                    </button>
                    <button
                      type="submit"
                      disabled={loading}
                      className="flex-1 h-11 bg-[#195BAC] hover:bg-[#154a8f] text-white rounded-xl font-bold text-sm cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
                    >
                      Sign In
                    </button>
                  </div>
                </form>
              )}
            </div>
            
            <div className="p-4 bg-gray-50 text-center text-xs text-gray-400 border-t border-gray-100">
              To continue, Google will share your name, email address, and profile picture with B2BMarket.
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
