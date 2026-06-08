import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { loginUser } from "../../services/api";

const SellerLogin = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    try {
      const data = await loginUser({ email, password });
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data));
      navigate("/seller-dashboard");
    } catch (err) {
      setError(err.response?.data?.message || "Invalid credentials");
    }
  };

  return (
    <div className="bg-[#E9F4FF] font-display min-h-screen flex flex-col items-center justify-center p-4 sm:p-6 relative ">
      {/* Header */}
      <header className="absolute top-0 w-full flex items-center justify-between px-6 py-4 md:px-10 lg:px-16 z-10">
        <div className="flex items-center gap-3">
          <div className="size-8 text-[#195BAC]">
            <svg
              className="w-full h-full"
              viewBox="0 0 48 48"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <defs>
                <clipPath id="clip0">
                  <rect width="48" height="48" fill="white" />
                </clipPath>
              </defs>
            </svg>
          </div>
        </div>

        <div className="flex items-center gap-6">
          <span className="text-sm font-medium cursor-pointer hover:text-[#195BAC]">
            Help Center
          </span>
          <span className="text-sm font-medium hidden sm:block cursor-pointer hover:text-[#195BAC]">
            Contact Support
          </span>
        </div>
      </header>

      {/* Login Card */}
      <main className="w-full max-w-[520px] relative z-20">
        <div className="bg-white rounded-2xl shadow-xl border border-[#f0f2f4] overflow-hidden">
          <div className="px-8 pt-10 pb-8 sm:px-12 sm:pt-12 sm:pb-10">
            {/* Title */}
            <div className="text-center mb-8">
              <h1 className="text-[32px] font-bold mb-2">
                Welcome Back, Seller
              </h1>
              <p className="text-[#647487]">
                Log in to manage your store and orders efficiently.
              </p>
            </div>

            {error && (
              <div className="mb-4 p-3 bg-red-100 text-red-700 text-sm rounded-lg font-medium">
                {error}
              </div>
            )}

            {/* Form */}
            <form
              className="flex flex-col gap-5"
              onSubmit={handleLogin}
            >
              {/* Email */}
              <label>
                <p className="pb-2 font-medium">Email Address</p>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@company.com"
                  required
                  className="w-full h-14 rounded-lg border border-[#dce0e5] bg-white p-[15px] focus:ring-2 focus:ring-[#195BAC]/20 focus:border-[#195BAC] outline-none"
                />
              </label>

              {/* Password */}
              <label>
                <div className="flex justify-between pb-2">
                  <p className="font-medium">Password</p>
                </div>

                <div className="flex rounded-lg border border-[#dce0e5] focus-within:ring-2 focus-within:ring-[#195BAC]/20">
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    required
                    className="flex-1 h-14 bg-white p-[15px] outline-none rounded-l-lg"
                  />
                </div>
              </label>
              <span className="text-[#195BAC] text-sm font-medium cursor-pointer">
                Forgot Password?
              </span>

              {/* Login Button */}
              <button className="mt-2 h-12 bg-[#195BAC] hover:bg-[#154a8f] text-white rounded-lg font-bold">
                Log In
              </button>
            </form>

            {/* Divider */}
            <div className="flex items-center gap-4 py-8">
              <div className="flex-1 h-px bg-[#dce0e5]" />
              <p className="text-sm text-[#647487]">Or continue with</p>
              <div className="flex-1 h-px bg-[#dce0e5]" />
            </div>

            {/* Social Login */}
            <div className="flex gap-4">
              <button className="flex-1 h-12 border rounded-lg flex items-center justify-center gap-2">
                <img
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuA9qw2nEqby26skVOedJwxTFM1qDezNxZwGnDb6JGV-R7O4hnlEeAXK90B0_CyopvwJyP01E0NIG9sh6vTT0glXxq3AHQP4GrzWRl-geHLcw-uaaOF6Qk4yBu9SqB6oXys4MLsHsmWqjrYmu6wfL0hmt7YLv_doS9T1QOROzYcQOns4nyuWIzBHM2GnRfFB1g86oXLVTZnpV2sEy0cdvfVCKClEFAvs2T0NL3KdxQjDj_LGBc0T3F13gjpmAA7PKrPTtsgZTs5WDQU"
                  alt="Google"
                  className="h-5 w-5"
                />
                Google
              </button>

              <button className="flex-1 h-12 border rounded-lg flex items-center justify-center gap-2">
                <span className="material-symbols-outlined">ios</span>
                Apple
              </button>
            </div>
          </div>

          {/* Footer */}
          <div className="bg-[#fcfdfd] border-t px-8 py-5 text-center">
            <p className="text-sm">
              New to the platform?
              <span
                onClick={() => navigate("/seller-signup")}
                className="text-[#195BAC] font-bold ml-1 cursor-pointer"
              >
                Sign Up
              </span>
            </p>
          </div>
        </div>

        {/* Trust */}
        <div className="mt-8 text-center text-sm text-[#647487] flex justify-center gap-2">
          <span className="material-symbols-outlined">lock</span>
          Secure, encrypted connection
        </div>
      </main>

      {/* Decorative Background */}
      <div className="fixed inset-0 -z-10 pointer-events-none">
        <div className="absolute top-[-10%] left-[-5%] w-[40%] h-[40%] bg-[#195BAC]/5 rounded-full blur-3xl" />
        <div className="absolute bottom-[-10%] right-[-5%] w-[40%] h-[40%] bg-[#195BAC]/10 rounded-full blur-3xl" />
      </div>
    </div>
  );
};

export default SellerLogin;
