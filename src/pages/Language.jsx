import NavBar from "../components/NavBar";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Language() {
  const navigate = useNavigate();
  const [selectedLanguage, setSelectedLanguage] = useState("English");

  const languages = [
    "English",
    "Spanish",
    "French",
    "German",
    "Chinese",
    "Arabic",
    "Hindi",
  ];

  return (
    <div className="bg-background min-h-screen">
      <NavBar />
      <div className="max-w-2xl mx-auto p-8">
        <button
          onClick={() => navigate("/settings")}
          className="mb-6 text-primary hover:underline flex items-center"
        >
          ← Back to Settings
        </button>

        <h1 className="text-3xl font-bold mb-6">Select Language</h1>

        <div className="bg-white rounded-lg shadow overflow-hidden">
          {languages.map((lang) => (
            <div
              key={lang}
              onClick={() => {
                setSelectedLanguage(lang);
                // In a real app, you would apply the language context/redux here
              }}
              className={`flex items-center justify-between p-4 border-b border-gray-100 cursor-pointer ${
                selectedLanguage === lang ? "bg-blue-50" : "hover:bg-gray-50"
              }`}
            >
              <span
                className={`text-lg ${
                  selectedLanguage === lang
                    ? "font-semibold text-primary"
                    : "text-gray-700"
                }`}
              >
                {lang}
              </span>
              {selectedLanguage === lang && (
                <span className="text-primary font-bold">✓</span>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
