import React, { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { registerUser, loginWithGoogle } from "../../services/api";

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

const SellerRegister = () => {
  const navigate = useNavigate();
  const [companyName, setCompanyName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showGoogleModal, setShowGoogleModal] = useState(false);
  const authInFlightRef = useRef(false);

  const handleRegister = async (e) => {
    e.preventDefault();
    if (authInFlightRef.current) return;
    setError("");

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    authInFlightRef.current = true;
    setLoading(true);
    try {
      const data = await registerUser({
        name: companyName,
        email,
        password,
        role: "SELLER",
        companyName,
        country: "India",
      });
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data));
      navigate("/seller-dashboard");
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed");
    } finally {
      authInFlightRef.current = false;
      setLoading(false);
    }
  };

  const handleGoogleSignup = async (googleEmail, googleName) => {
    if (authInFlightRef.current) return;
    setShowGoogleModal(false);
    setError("");
    authInFlightRef.current = true;
    setLoading(true);
    try {
      const data = await loginWithGoogle({ 
        email: googleEmail, 
        name: googleName,
        role: "SELLER",
        companyName: googleName + "'s Store"
      });
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data));
      navigate("/seller-dashboard");
    } catch (err) {
      setError(err.response?.data?.message || "Google Signup failed");
    } finally {
      authInFlightRef.current = false;
      setLoading(false);
    }
  };

  return (
    <div className="relative flex min-h-screen w-full flex-col bg-[#E9F4FF] font-display overflow-x-hidden text-[#111417] scroll-smooth">
      
      {/* Top Navigation */}
      <header className="flex items-center justify-between border-b border-[#f0f2f4] px-6 lg:px-10 py-3 bg-white shadow-sm z-10">
        <div className="flex items-center gap-3">
          <div className="size-10 flex items-center justify-center rounded-lg bg-[#195bac]/10 text-[#195bac]" />
          <h2 className="text-lg font-bold tracking-tight">Seller Portal</h2>
        </div>

        <div className="flex gap-3">
          <button className="min-w-[84px] h-10 px-4 rounded-lg bg-[#f0f2f4] hover:bg-[#e4e7eb] text-sm font-bold">
            Help
          </button>
          <button
            onClick={() => navigate("/seller-login")}
            className="min-w-[84px] h-10 px-4 rounded-lg bg-[#195bac] hover:bg-[#154a8f] text-white text-sm font-bold shadow-sm"
          >
            Log In
          </button>
        </div>
      </header>

      {/* Main Layout */}
      <main className="flex-1 flex justify-center py-8 lg:py-12 px-4 sm:px-6">
        <div className="flex flex-col items-center w-full max-w-[960px]">

          {/* Heading */}
          <div className="text-center mb-8 max-w-2xl px-4">
            <h1 className="text-3xl md:text-4xl font-black mb-3">
              Start Selling Today
            </h1>
            <p className="text-[#647487] text-base md:text-lg">
              Create your seller account to start listing and selling products.
            </p>
          </div>

          {/* Form Card */}
          <div className="w-full max-w-[800px] bg-white rounded-xl shadow-md border border-[#e5e7eb]/50 overflow-hidden">
            
            {/* Progress Bar */}
            <div className="w-full h-1.5 bg-[#f0f2f4]">
              <div className="h-full w-1/3 bg-[#195bac] rounded-r-full"></div>
            </div>

            <div className="p-6 md:p-8 lg:p-10">
              {error && (
                <div className="mb-4 p-3 bg-red-100 text-red-700 text-sm rounded-lg font-medium">
                  {error}
                </div>
              )}

              {/* Google Signup Button */}
              <button
                type="button"
                onClick={() => setShowGoogleModal(true)}
                disabled={loading}
                className="w-full flex items-center justify-center gap-3 py-3 rounded-xl border-2 border-gray-200 hover:border-[#195BAC]/30 hover:bg-gray-50 transition-all font-semibold text-gray-700 mb-6 disabled:opacity-60"
              >
                <GoogleIcon />
                <span>Continue with Google</span>
              </button>

              <div className="flex items-center gap-4 mb-6">
                <div className="flex-1 h-px bg-gray-200" />
                <span className="text-xs text-gray-400 font-medium">or register with email</span>
                <div className="flex-1 h-px bg-gray-200" />
              </div>

              <form className="flex flex-col gap-6" onSubmit={handleRegister}>

                {/* Company Name */}
                <div className="flex flex-col gap-2">
                  <label className="font-medium">Company Name</label>
                  <input
                    required
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    className="h-14 rounded-lg border border-[#dce0e5] px-4 focus:border-[#195bac] outline-none shadow-sm"
                    placeholder="Ex. Tech Solutions Ltd."
                  />
                </div>

                {/* Username / Email */}
                <div className="flex flex-col gap-2">
                  <label className="font-medium">Email / Username</label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="h-14 rounded-lg border border-[#dce0e5] px-4 focus:border-[#195bac] outline-none shadow-sm"
                    placeholder="seller@email.com"
                  />
                </div>

                {/* Password */}
                <div className="flex flex-col gap-2">
                  <label className="font-medium">Password</label>
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="h-14 rounded-lg border border-[#dce0e5] px-4 focus:border-[#195bac] outline-none shadow-sm"
                    placeholder="Enter password"
                  />
                </div>

                {/* Confirm Password */}
                <div className="flex flex-col gap-2">
                  <label className="font-medium">Confirm Password</label>
                  <input
                    type="password"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="h-14 rounded-lg border border-[#dce0e5] px-4 focus:border-[#195bac] outline-none shadow-sm"
                    placeholder="Re-enter password"
                  />
                </div>

                {/* Terms */}
                <div className="flex items-start gap-3 mt-2 px-1">
                  <input
                    type="checkbox"
                    required
                    className="h-5 w-5 rounded border-[#dce0e5] text-[#195bac] focus:ring-[#195bac]/20 cursor-pointer"
                  />
                  <p className="text-sm text-[#647487]">
                    By registering, you agree to our{" "}
                    <a className="text-[#195bac] font-semibold hover:underline" href="#">
                      Terms of Service
                    </a>{" "}
                    and{" "}
                    <a className="text-[#195bac] font-semibold hover:underline" href="#">
                      Privacy Policy
                    </a>.
                  </p>
                </div>

                {/* Submit */}
                <button
                  type="submit"
                  className="h-12 rounded-lg bg-[#195bac] hover:bg-[#154a8f] text-white font-bold shadow-md transition-all active:scale-[0.99]"
                >
                  Register & Continue
                </button>
              </form>

              {/* Footer */}
              <div className="mt-8 flex justify-center border-t border-[#f0f2f4] pt-6">
                <p className="text-[#647487]">
                  Already have an account?
                  <span
                    onClick={() => navigate("/seller-login")}
                    className="text-[#195bac] font-bold hover:underline ml-1 cursor-pointer"
                  >
                    Log in
                  </span>
                </p>
              </div>
            </div>
          </div>

          {/* Trust Signals */}
          <div className="mt-8 flex flex-wrap justify-center gap-6 md:gap-12 opacity-80">
            <div className="flex items-center gap-2 text-[#647487]">
              <span className="material-symbols-outlined">lock</span>
              <span className="text-sm font-medium">Secure SSL Encryption</span>
            </div>
            <div className="flex items-center gap-2 text-[#647487]">
              <span className="material-symbols-outlined">verified_user</span>
              <span className="text-sm font-medium">
                Verified Business Platform
              </span>
            </div>
            <div className="flex items-center gap-2 text-[#647487]">
              <span className="material-symbols-outlined">support_agent</span>
              <span className="text-sm font-medium">24/7 Seller Support</span>
            </div>
          </div>

        </div>
      </main>

      {/* Google Sign-in Mock Modal */}
      {showGoogleModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-[420px] rounded-2xl shadow-2xl border border-gray-100 overflow-hidden flex flex-col transform scale-100 transition-all duration-300">
            
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <GoogleIcon />
                <span className="font-semibold text-gray-700">Sign up with Google</span>
              </div>
              <button 
                onClick={() => setShowGoogleModal(false)}
                className="text-gray-400 hover:text-gray-600 text-2xl font-bold cursor-pointer"
              >
                &times;
              </button>
            </div>

            <div className="p-6">
              <div className="flex flex-col gap-3">
                <p className="text-sm text-gray-500 mb-2">Choose an account to continue to Seller Portal</p>
                {[
                  { name: "John Smith", email: "john.smith@gmail.com", avatar: "JS" },
                  { name: "Sarah Connor", email: "sarah.connor@cyberdyne.com", avatar: "SC" }
                ].map((acc) => (
                  <button
                    key={acc.email}
                    onClick={() => handleGoogleSignup(acc.email, acc.name)}
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
              </div>
            </div>
            
            <div className="p-4 bg-gray-50 text-center text-xs text-gray-400 border-t border-gray-100">
              By continuing, Google will share your name and email address with B2BMarket.
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SellerRegister;
