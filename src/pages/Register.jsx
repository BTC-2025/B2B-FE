import { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { registerUser, loginWithGoogle } from "../services/api";

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

export default function Register() {
  const navigate = useNavigate();
  const [role, setRole] = useState("BUYER");
  const [name, setName] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [agreed, setAgreed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showGoogleModal, setShowGoogleModal] = useState(false);
  const [customGoogleEmail, setCustomGoogleEmail] = useState("");
  const [customGoogleName, setCustomGoogleName] = useState("");
  const [showCustomGoogleForm, setShowCustomGoogleForm] = useState(false);
  const authInFlightRef = useRef(false);

  const strength = (() => {
    if (!password) return 0;
    let s = 0;
    if (password.length >= 8) s++;
    if (/[A-Z]/.test(password)) s++;
    if (/[0-9]/.test(password)) s++;
    if (/[^A-Za-z0-9]/.test(password)) s++;
    return s;
  })();

  const strengthLabel = ["", "Weak", "Fair", "Good", "Strong"][strength];
  const strengthColor = ["", "bg-red-400", "bg-orange-400", "bg-yellow-400", "bg-green-500"][strength];

  const handleRegister = async (e) => {
    e.preventDefault();
    setError("");
    if (authInFlightRef.current) return;
    if (password !== confirmPassword) { setError("Passwords do not match."); return; }
    if (!agreed) { setError("You must agree to the Terms of Service."); return; }
    const trimmedName = name.trim();
    const trimmedEmail = email.trim().toLowerCase();
    const trimmedCompanyName = companyName.trim();
    if (!trimmedName || !trimmedEmail) {
      setError("Please enter your name and email address.");
      return;
    }
    authInFlightRef.current = true;
    setLoading(true);
    try {
      const payload = { name: trimmedName, email: trimmedEmail, password, role, country: "India" };
      if (role === "SELLER") payload.companyName = trimmedCompanyName || trimmedName;
      const data = await registerUser(payload);
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data));
      navigate(role === "SELLER" ? "/seller-dashboard" : "/");
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed. Please try again.");
    } finally {
      authInFlightRef.current = false;
      setLoading(false);
    }
  };

  const handleGoogleRegister = () => {
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
      const data = await loginWithGoogle({ 
        email: trimmedEmail, 
        name: trimmedName,
        role: role,
        companyName: role === "SELLER" ? (trimmedName + "'s Store") : undefined
      });
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data));
      
      const userRole = data.role || data.user?.role;
      navigate(userRole === "SELLER" ? "/seller-dashboard" : "/");
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Google Sign-Up failed. Please try again."
      );
    } finally {
      authInFlightRef.current = false;
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#E9F4FF] via-white to-[#EEF6FF] flex flex-col">

      {/* Top bar */}
      <header className="flex items-center justify-between px-8 py-4">
        <button onClick={() => navigate("/")} className="flex items-center gap-2">
          <div className="w-9 h-9 bg-[#195BAC] rounded-xl flex items-center justify-center shadow-lg shadow-[#195BAC]/30">
            <span className="text-white font-black text-lg">B</span>
          </div>
          <span className="text-xl font-black text-[#195BAC] tracking-tight">B2BMarket</span>
        </button>
        <div className="flex items-center gap-3 text-sm text-gray-500">
          <span>Already have an account?</span>
          <button onClick={() => navigate("/login")} className="text-[#195BAC] font-bold hover:underline">
            Sign In
          </button>
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center p-4 py-8">
        <div className="w-full max-w-[500px]">

          <div className="bg-white rounded-3xl shadow-2xl shadow-[#195BAC]/10 border border-gray-100 overflow-hidden">
            <div className="h-1.5 bg-gradient-to-r from-[#195BAC] via-[#2e7de5] to-[#00C2A0]" />

            <div className="px-8 pt-8 pb-6 sm:px-10 sm:pt-10">
              <div className="mb-6">
                <h1 className="text-3xl font-black text-gray-900 mb-1">Create account</h1>
                <p className="text-gray-500 text-sm">Join 200,000+ businesses on B2BMarket</p>
              </div>

              {/* Role Tab */}
              <div className="flex bg-gray-100 rounded-xl p-1 mb-6">
                {[
                  { key: "BUYER",  label: "🛒  I'm a Buyer" },
                  { key: "SELLER", label: "🏭  I'm a Seller" },
                ].map(({ key, label }) => (
                  <button
                    key={key}
                    onClick={() => { setRole(key); setError(""); }}
                    className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all ${
                      role === key
                        ? "bg-white text-[#195BAC] shadow-sm"
                        : "text-gray-500 hover:text-gray-700"
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>

              {/* Google */}
              <button
                type="button"
                onClick={handleGoogleRegister}
                disabled={loading}
                className="w-full flex items-center justify-center gap-3 py-3 rounded-xl border-2 border-gray-200 hover:border-[#195BAC]/30 hover:bg-gray-50 transition-all font-semibold text-gray-700 mb-5 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                <GoogleIcon />
                <span>Continue with Google</span>
              </button>

              <div className="flex items-center gap-4 mb-5">
                <div className="flex-1 h-px bg-gray-200" />
                <span className="text-xs text-gray-400 font-medium">or register with email</span>
                <div className="flex-1 h-px bg-gray-200" />
              </div>

              {error && (
                <div className="mb-4 flex items-start gap-2 p-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl">
                  <span>⚠️</span>
                  <span>{error}</span>
                </div>
              )}

              <form onSubmit={handleRegister} className="flex flex-col gap-4">
                {/* Full Name */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-semibold text-gray-700">Full Name</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="John Smith"
                    required
                    className="w-full h-12 rounded-xl border-2 border-gray-200 px-4 text-sm focus:border-[#195BAC] focus:ring-4 focus:ring-[#195BAC]/10 outline-none transition-all"
                  />
                </div>

                {/* Company Name (Seller only) */}
                {role === "SELLER" && (
                  <div className="flex flex-col gap-1.5">
                    <label className="text-sm font-semibold text-gray-700">Company Name</label>
                    <input
                      type="text"
                      value={companyName}
                      onChange={(e) => setCompanyName(e.target.value)}
                      placeholder="Your Company Ltd."
                      className="w-full h-12 rounded-xl border-2 border-gray-200 px-4 text-sm focus:border-[#195BAC] focus:ring-4 focus:ring-[#195BAC]/10 outline-none transition-all"
                    />
                  </div>
                )}

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
                  <label className="text-sm font-semibold text-gray-700">Password</label>
                  <div className="relative">
                    <input
                      type={showPw ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Min. 8 characters"
                      required
                      minLength={8}
                      autoComplete="new-password"
                      className="w-full h-12 rounded-xl border-2 border-gray-200 px-4 pr-12 text-sm focus:border-[#195BAC] focus:ring-4 focus:ring-[#195BAC]/10 outline-none transition-all"
                    />
                    <button type="button" onClick={() => setShowPw(!showPw)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 text-lg">
                      {showPw ? "🙈" : "👁"}
                    </button>
                  </div>
                  {/* Strength Bar */}
                  {password && (
                    <div className="flex items-center gap-2 mt-1">
                      <div className="flex gap-1 flex-1">
                        {[1, 2, 3, 4].map((i) => (
                          <div key={i} className={`h-1.5 flex-1 rounded-full transition-all ${i <= strength ? strengthColor : "bg-gray-200"}`} />
                        ))}
                      </div>
                      <span className={`text-xs font-semibold ${["","text-red-500","text-orange-500","text-yellow-600","text-green-600"][strength]}`}>
                        {strengthLabel}
                      </span>
                    </div>
                  )}
                </div>

                {/* Confirm Password */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-semibold text-gray-700">Confirm Password</label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Re-enter your password"
                    required
                    autoComplete="new-password"
                    className={`w-full h-12 rounded-xl border-2 px-4 text-sm outline-none transition-all focus:ring-4 focus:ring-[#195BAC]/10 ${
                      confirmPassword && confirmPassword !== password
                        ? "border-red-400 focus:border-red-400"
                        : "border-gray-200 focus:border-[#195BAC]"
                    }`}
                  />
                  {confirmPassword && confirmPassword !== password && (
                    <p className="text-xs text-red-500">Passwords do not match</p>
                  )}
                </div>

                {/* Terms */}
                <label className="flex items-start gap-3 cursor-pointer group mt-1">
                  <input
                    type="checkbox"
                    checked={agreed}
                    onChange={(e) => setAgreed(e.target.checked)}
                    className="w-4 h-4 mt-0.5 rounded border-gray-300 text-[#195BAC] focus:ring-[#195BAC]/30"
                  />
                  <span className="text-xs text-gray-500 leading-relaxed">
                    I agree to B2BMarket's{" "}
                    <a href="#" className="text-[#195BAC] font-semibold hover:underline">Terms of Service</a>
                    {" "}and{" "}
                    <a href="#" className="text-[#195BAC] font-semibold hover:underline">Privacy Policy</a>
                  </span>
                </label>

                {/* Submit */}
                <button
                  type="submit"
                  disabled={loading || !agreed}
                  className="w-full h-12 bg-[#195BAC] hover:bg-[#154a8f] active:scale-[0.98] text-white rounded-xl font-bold text-sm transition-all shadow-lg shadow-[#195BAC]/25 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-1"
                >
                  {loading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Creating account…
                    </>
                  ) : (
                    `Create ${role === "BUYER" ? "Buyer" : "Seller"} Account`
                  )}
                </button>
              </form>
            </div>

            <div className="bg-gray-50 border-t border-gray-100 px-8 py-4 sm:px-10 text-center">
              <p className="text-sm text-gray-500">
                Already registered?{" "}
                <button onClick={() => navigate("/login")} className="text-[#195BAC] font-bold hover:underline">
                  Sign in here
                </button>
              </p>
            </div>
          </div>

          <div className="mt-6 flex justify-center gap-6 text-xs text-gray-400">
            <span>🔒 SSL Encrypted</span>
            <span>✅ Verified Platform</span>
            <span>🌍 24/7 Support</span>
          </div>
        </div>
      </main>

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
                <span className="font-semibold text-gray-700">Sign up with Google</span>
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
                  <p className="text-sm text-gray-500">Sign up with a custom Google Account</p>
                  
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
                      Sign Up
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
