import React from "react";
import { useNavigate } from "react-router-dom";

const SellerRegister = () => {
  const navigate = useNavigate();

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
              <form className="flex flex-col gap-6">

                {/* Company Name */}
                <div className="flex flex-col gap-2">
                  <label className="font-medium">Company Name</label>
                  <input
                    className="h-14 rounded-lg border border-[#dce0e5] px-4 focus:border-[#195bac] outline-none shadow-sm"
                    placeholder="Ex. Tech Solutions Ltd."
                  />
                </div>

                {/* Username / Email */}
                <div className="flex flex-col gap-2">
                  <label className="font-medium">Email / Username</label>
                  <input
                    type="email"
                    className="h-14 rounded-lg border border-[#dce0e5] px-4 focus:border-[#195bac] outline-none shadow-sm"
                    placeholder="seller@email.com"
                  />
                </div>

                {/* Password */}
                <div className="flex flex-col gap-2">
                  <label className="font-medium">Password</label>
                  <input
                    type="password"
                    className="h-14 rounded-lg border border-[#dce0e5] px-4 focus:border-[#195bac] outline-none shadow-sm"
                    placeholder="Enter password"
                  />
                </div>

                {/* Confirm Password */}
                <div className="flex flex-col gap-2">
                  <label className="font-medium">Confirm Password</label>
                  <input
                    type="password"
                    className="h-14 rounded-lg border border-[#dce0e5] px-4 focus:border-[#195bac] outline-none shadow-sm"
                    placeholder="Re-enter password"
                  />
                </div>

                {/* Terms */}
                <div className="flex items-start gap-3 mt-2 px-1">
                  <input
                    type="checkbox"
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
                  type="button"
                  onClick={() => navigate("/seller-login")}
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
    </div>
  );
};

export default SellerRegister;
