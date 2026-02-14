import { useNavigate } from "react-router-dom";
import { majorCategories, categoryMap } from "../data/categoryStructure";
import { categories } from "../data/Category";
import { useState, useRef, useEffect } from "react";
import { FaChevronDown, FaBars, FaChevronRight } from "react-icons/fa";

export default function SecondaryNavBar() {
  const navigate = useNavigate();
  const [activeCategory, setActiveCategory] = useState(null);
  const [dropdownPos, setDropdownPos] = useState({ top: 0, left: 0 });
  const [showAllCategories, setShowAllCategories] = useState(false);
  const scrollRef = useRef(null);

  useEffect(() => {
    const handleScroll = () => setActiveCategory(null);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleMouseEnter = (category, e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setDropdownPos({ top: rect.bottom, left: rect.left });
    setActiveCategory(category);
  };

  const handleMouseLeave = () => {
    setActiveCategory(null);
  };

  const scrollRight = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: 200, behavior: "smooth" });
    }
  };

  return (
    <div className="bg-gray-100 border-gray-200 relative z-40 hidden md:block">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center gap-6 text-sm font-medium text-gray-700 py-2">
          {/* All Categories Button */}
          <div className="relative">
            <button
              onClick={() => setShowAllCategories(!showAllCategories)}
              className="flex items-center gap-2 hover:text-primary transition-colors font-bold pr-4 border-r border-gray-300"
            >
              <FaBars />
              <span>All Categories</span>
            </button>

            {showAllCategories && (
              <div className="absolute top-full left-0 mt-2 w-64 bg-white shadow-xl rounded-lg border border-gray-100 max-h-80 overflow-y-auto custom-scrollbar z-50">
                {categories.map((cat, idx) => {
                  const Icon = cat.icon;
                  return (
                    <div
                      key={idx}
                      onClick={() => {
                        navigate(`/category/${encodeURIComponent(cat.name)}`);
                        setShowAllCategories(false);
                      }}
                      className="flex items-center px-4 py-2 hover:bg-gray-50 cursor-pointer text-sm text-gray-700 hover:text-primary border-b border-gray-50 last:border-none group"
                    >
                      <span className="w-6 h-6 flex items-center justify-center mr-3 text-gray-400 group-hover:text-primary transition-colors">
                        {Icon && <Icon />}
                      </span>
                      <span className="font-medium">{cat.name}</span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Major Categories (Horizontal List) */}
          <div className="flex items-center flex-1 min-w-0 relative">
            <div
              ref={scrollRef}
              onScroll={() => setActiveCategory(null)}
              className="flex-1 flex items-center gap-6 overflow-x-auto py-3 no-scrollbar mask-gradient scroll-smooth"
              style={{
                scrollbarWidth: "none",
                msOverflowStyle: "none",
              }}
            >
              <style>{`
                .no-scrollbar::-webkit-scrollbar {
                  display: none;
                }
              `}</style>
              {majorCategories.map((category) => (
                <div
                  key={category}
                  className="relative group cursor-pointer whitespace-nowrap"
                  onMouseEnter={(e) => handleMouseEnter(category, e)}
                  onMouseLeave={handleMouseLeave}
                  onClick={(e) => {
                    if (activeCategory === category) {
                      setActiveCategory(null);
                    } else {
                      const rect = e.currentTarget.getBoundingClientRect();
                      setDropdownPos({ top: rect.bottom, left: rect.left });
                      setActiveCategory(category);
                    }
                  }}
                >
                  <div className="flex items-center hover:text-primary  py-1 px-1 rounded-md">
                    {category}
                    {categoryMap[category] && (
                      <FaChevronDown className="ml-1 text-[10px] opacity-0 group-hover:opacity-100 transition-opacity" />
                    )}
                  </div>

                  {/* Sub-Category Dropdown */}
                  {categoryMap[category] && activeCategory === category && (
                    <div
                      style={{ top: dropdownPos.top, left: dropdownPos.left }}
                      className="fixed pt-1 w-56 z-50 animate-in fade-in zoom-in-95 duration-100"
                    >
                      <div className="bg-white/90 backdrop-blur-sm shadow-xl rounded-lg border border-gray-200 py-2">
                        {categoryMap[category].map((subCat) => (
                          <div
                            key={subCat}
                            onClick={(e) => {
                              e.stopPropagation();
                              navigate(
                                `/category/${encodeURIComponent(subCat)}`
                              );
                              setActiveCategory(null);
                            }}
                            className="px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-primary cursor-pointer transition-colors"
                          >
                            {subCat}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Arrow Button */}
            <button
              onClick={scrollRight}
              className="flex items-center justify-center h-8 w-8 ml-2 rounded-full bg-white shadow-md border border-gray-100 text-gray-600 hover:text-primary hover:bg-gray-50 z-10"
            >
              <FaChevronRight size={12} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
