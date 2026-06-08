import React, { useState, useEffect, useRef } from "react";
import { FaChevronDown, FaGlobe, FaRobot } from "react-icons/fa";

export default function TopUtilityBar() {
  const [searchScope, setSearchScope] = useState("Products");
  const [showLangDropdown, setShowLangDropdown] = useState(false);
  const [showDeliverDropdown, setShowDeliverDropdown] = useState(false);
  
  const [selectedCountry, setSelectedCountry] = useState(() => {
    const saved = localStorage.getItem("selectedCountry");
    return saved ? JSON.parse(saved) : { code: "IN", name: "India", flag: "🇮🇳" };
  });

  const [selectedLang, setSelectedLang] = useState(() => {
    return localStorage.getItem("selectedLang") || "English";
  });

  const [selectedCurrency, setSelectedCurrency] = useState(() => {
    return localStorage.getItem("selectedCurrency") || "INR";
  });

  const deliverRef = useRef(null);
  const langRef = useRef(null);

  const countries = [
    { code: "IN", name: "India", flag: "🇮🇳" },
    { code: "US", name: "United States", flag: "🇺🇸" },
    { code: "GB", name: "United Kingdom", flag: "🇬🇧" },
    { code: "CN", name: "China", flag: "🇨🇳" },
    { code: "DE", name: "Germany", flag: "🇩🇪" },
    { code: "FR", name: "France", flag: "🇫🇷" },
    { code: "JP", name: "Japan", flag: "🇯🇵" },
    { code: "AU", name: "Australia", flag: "🇦🇺" },
    { code: "CA", name: "Canada", flag: "🇨🇦" },
    { code: "AE", name: "UAE", flag: "🇦🇪" },
    { code: "BR", name: "Brazil", flag: "🇧🇷" },
    { code: "RU", name: "Russia", flag: "🇷🇺" },
    { code: "SG", name: "Singapore", flag: "🇸🇬" },
    { code: "KR", name: "South Korea", flag: "🇰🇷" },
    { code: "IT", name: "Italy", flag: "🇮🇹" },
    { code: "ES", name: "Spain", flag: "🇪🇸" },
    { code: "MX", name: "Mexico", flag: "🇲🇽" },
    { code: "ID", name: "Indonesia", flag: "🇮🇩" },
    { code: "TR", name: "Turkey", flag: "🇹🇷" },
    { code: "SA", name: "Saudi Arabia", flag: "🇸🇦" },
    { code: "ZA", name: "South Africa", flag: "🇿🇦" },
    { code: "NL", name: "Netherlands", flag: "🇳🇱" },
    { code: "CH", name: "Switzerland", flag: "🇨🇭" },
    { code: "SE", name: "Sweden", flag: "🇸🇪" },
    { code: "BE", name: "Belgium", flag: "🇧🇪" },
  ];

  const currencies = [
    { code: "INR", name: "Indian Rupee", flag: "🇮🇳" },
    { code: "USD", name: "US Dollar", flag: "🇺🇸" },
    { code: "EUR", name: "Euro", flag: "🇪🇺" },
    { code: "GBP", name: "British Pound", flag: "🇬🇧" },
    { code: "AED", name: "UAE Dirham", flag: "🇦🇪" },
    { code: "CNY", name: "Chinese Yuan", flag: "🇨🇳" },
    { code: "JPY", name: "Japanese Yen", flag: "🇯🇵" },
    { code: "AUD", name: "Australian Dollar", flag: "🇦🇺" },
    { code: "CAD", name: "Canadian Dollar", flag: "🇨🇦" },
    { code: "SGD", name: "Singapore Dollar", flag: "🇸🇬" },
  ];

  const languages = [
    { name: "English", code: "en" },
    { name: "हिन्दी", code: "hi" },
    { name: "中文", code: "zh" },
    { name: "Español", code: "es" },
    { name: "Français", code: "fr" },
    { name: "Deutsch", code: "de" },
    { name: "日本語", code: "ja" },
    { name: "العربية", code: "ar" },
  ];

  useEffect(() => {
    function handleClickOutside(event) {
      if (deliverRef.current && !deliverRef.current.contains(event.target)) {
        setShowDeliverDropdown(false);
      }
      if (langRef.current && !langRef.current.contains(event.target)) {
        setShowLangDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleCountrySelect = (country) => {
    setSelectedCountry(country);
    localStorage.setItem("selectedCountry", JSON.stringify(country));
    window.dispatchEvent(new Event("localeChange"));
    setShowDeliverDropdown(false);
  };

  const handleSaveLangCurrency = () => {
    localStorage.setItem("selectedLang", selectedLang);
    localStorage.setItem("selectedCurrency", selectedCurrency);
    window.dispatchEvent(new Event("localeChange"));
    setShowLangDropdown(false);
  };

  return (
    <div className="bg-[#F4F5F7] border-b border-gray-200 text-[12px] text-gray-600 py-1.5 px-6 hidden lg:block">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        {/* Left Side: Modes & Scope */}
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-1.5 cursor-pointer group hover:text-[#195BAC] transition-colors">
            <div className="relative">
               <FaRobot className="text-sm text-[#195BAC] animate-pulse" />
               <div className="absolute -top-1 -right-1 w-1.5 h-1.5 bg-[#00C2A0] rounded-full border border-white"></div>
            </div>
            <span className="font-bold tracking-tight">AI Mode</span>
          </div>

          <div className="h-3 w-[1px] bg-gray-300"></div>

          <div className="flex items-center gap-4 font-medium">
            <span 
              onClick={() => setSearchScope("Products")}
              className={`cursor-pointer transition-colors ${searchScope === "Products" ? "text-[#195BAC] font-bold" : "hover:text-gray-900"}`}
            >
              Products
            </span>
            <span 
              onClick={() => setSearchScope("Manufacturers")}
              className={`cursor-pointer transition-colors ${searchScope === "Manufacturers" ? "text-[#195BAC] font-bold" : "hover:text-gray-900"}`}
            >
              Manufacturers
            </span>
          </div>

          <div className="h-3 w-[1px] bg-gray-300"></div>

          <div className="flex items-center gap-1.5 cursor-pointer hover:text-gray-900 transition-colors">
            <FaGlobe className="text-[10px]" />
            <span>Worldwide</span>
          </div>
        </div>

        {/* Right Side: Delivery & Localization */}
        <div className="flex items-center gap-6">
          {/* Deliver to Button */}
          <div className="relative" ref={deliverRef}>
            <div 
              className="flex items-center gap-2 cursor-pointer hover:text-gray-900 transition-colors border-r border-gray-300 pr-6 group"
              onClick={() => {
                setShowDeliverDropdown(!showDeliverDropdown);
                setShowLangDropdown(false);
              }}
            >
              <span className="opacity-70">Deliver to:</span>
              <span className="flex items-center gap-1 font-bold">
                <span className="text-sm">{selectedCountry.flag}</span>
                {selectedCountry.code}
                <FaChevronDown className={`text-[8px] transition-transform duration-200 ${showDeliverDropdown ? "rotate-180" : ""}`} />
              </span>
            </div>

            {/* Deliver to Dropdown */}
            {showDeliverDropdown && (
              <div className="absolute top-full left-0 mt-2 w-64 bg-white shadow-2xl rounded-xl border border-gray-100 z-[100] overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                <div className="p-3 border-b border-gray-50 bg-gray-50/50 flex justify-between items-center">
                  <span className="font-bold text-gray-400 uppercase tracking-widest text-[10px]">Select Country</span>
                  <span className="text-[10px] bg-[#195BAC]/10 text-[#195BAC] px-2 py-0.5 rounded-full font-bold">Shipping to</span>
                </div>
                <div className="max-h-72 overflow-y-auto custom-scrollbar p-1">
                  {countries.map((country) => (
                    <div 
                      key={country.code} 
                      onClick={() => handleCountrySelect(country)}
                      className={`px-4 py-2.5 hover:bg-gray-50 flex items-center justify-between cursor-pointer rounded-lg group/item transition-colors ${selectedCountry.code === country.code ? "bg-blue-50/50" : ""}`}
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-base">{country.flag}</span>
                        <span className={`font-medium group-hover/item:text-[#195BAC] ${selectedCountry.code === country.code ? "text-[#195BAC] font-bold" : "text-gray-700"}`}>
                          {country.name}
                        </span>
                      </div>
                      <span className={`text-[10px] font-bold ${selectedCountry.code === country.code ? "text-[#195BAC]" : "text-gray-300"}`}>{country.code}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Language & Currency Button */}
          <div className="relative" ref={langRef}>
            <div 
              className="flex items-center gap-2 cursor-pointer hover:text-gray-900 transition-colors group"
              onClick={() => {
                setShowLangDropdown(!showLangDropdown);
                setShowDeliverDropdown(false);
              }}
            >
              <span className="font-bold flex items-center gap-1 capitalize">
                {selectedLang}-{selectedCurrency}
                <FaChevronDown className={`text-[8px] transition-transform duration-200 ${showLangDropdown ? "rotate-180" : ""}`} />
              </span>
            </div>

            {/* Language/Currency Dropdown */}
            {showLangDropdown && (
              <div className="absolute top-full right-0 mt-2 w-72 bg-white shadow-2xl rounded-2xl border border-gray-100 z-[100] overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                <div className="p-4 border-b border-gray-50 bg-gray-50/50">
                  <h3 className="font-bold text-gray-800 text-sm">Regional Settings</h3>
                  <p className="text-[10px] text-gray-400 mt-0.5">Set your preferred language and currency</p>
                </div>
                
                <div className="p-4 space-y-4">
                  {/* Language Selection */}
                  <div>
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-2">Language</label>
                    <div className="grid grid-cols-2 gap-2">
                      {languages.map((lang) => (
                        <div 
                          key={lang.code}
                          onClick={() => setSelectedLang(lang.name)}
                          className={`px-3 py-1.5 rounded-lg border text-center cursor-pointer transition-all ${selectedLang === lang.name ? "border-[#195BAC] bg-blue-50 text-[#195BAC] font-bold" : "border-gray-100 hover:border-gray-200 text-gray-600"}`}
                        >
                          {lang.name}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Currency Selection */}
                  <div>
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-2">Currency</label>
                    <div className="max-h-40 overflow-y-auto custom-scrollbar border border-gray-50 rounded-xl">
                      {currencies.map((curr) => (
                        <div 
                          key={curr.code} 
                          onClick={() => setSelectedCurrency(curr.code)}
                          className={`px-4 py-2 hover:bg-gray-50 flex items-center justify-between cursor-pointer group/item ${selectedCurrency === curr.code ? "bg-blue-50/30" : ""}`}
                        >
                          <div className="flex items-center gap-3">
                            <span className="text-sm">{curr.flag}</span>
                            <span className={`font-medium group-hover/item:text-[#195BAC] ${selectedCurrency === curr.code ? "text-[#195BAC] font-bold" : "text-gray-700"}`}>{curr.code}</span>
                          </div>
                          <span className="text-[10px] text-gray-400">{curr.name}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-gray-50/50 border-t border-gray-100">
                   <button 
                    onClick={handleSaveLangCurrency}
                    className="w-full py-2.5 bg-[#195BAC] text-white rounded-xl font-bold hover:bg-[#154d92] transition-all shadow-lg shadow-[#195BAC]/20"
                   >
                     Save Changes
                   </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

