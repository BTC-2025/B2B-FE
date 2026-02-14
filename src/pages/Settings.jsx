import NavBar from "../components/NavBar";
import { useNavigate } from "react-router-dom";

export default function Settings() {
  const navigate = useNavigate();

  return (
    <div className="bg-background min-h-screen">
      <NavBar />
      <div className="max-w-4xl mx-auto p-8">
        <h1 className="text-3xl font-bold mb-8">Settings</h1>

        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="p-6 border-b border-gray-100">
            <h2 className="text-xl font-semibold mb-2">General</h2>
            <div
              onClick={() => navigate("/language")}
              className="flex items-center justify-between py-3 cursor-pointer hover:bg-gray-50 rounded-md px-2 -mx-2"
            >
              <span className="text-gray-700">Language</span>
              <span className="text-gray-500">English &gt;</span>
            </div>
            <div className="flex items-center justify-between py-3 cursor-pointer hover:bg-gray-50 rounded-md px-2 -mx-2">
              <span className="text-gray-700">Currency</span>
              <span className="text-gray-500">USD &gt;</span>
            </div>
          </div>

          <div className="p-6">
            <h2 className="text-xl font-semibold mb-2">Account</h2>
            <div className="py-3">
              <button className="text-red-600 hover:text-red-700 font-medium">
                Log Out
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
