import { useParams, useNavigate } from "react-router-dom";
import NavBar from "../components/NavBar";
import SecondaryNavBar from "../components/SecondaryNavBar";

export default function CategoryPage() {
  const { categoryName } = useParams();
  const navigate = useNavigate();

  return (
    <div className="bg-background h-screen flex flex-col">
      <NavBar />
      <SecondaryNavBar />
      <main className="flex-1 overflow-y-auto p-8 custom-scrollbar">
        <button
          onClick={() => navigate("/")}
          className="mb-4 text-primary hover:underline"
        >
          ← Back to Home
        </button>
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl font-bold mb-6 text-gray-800">
            {decodeURIComponent(categoryName)}
          </h1>

          <div className="bg-white p-10 rounded-lg shadow text-center">
            <h2 className="text-xl text-gray-500">
              Products for {decodeURIComponent(categoryName)} will appear here.
            </h2>
            <p className="mt-2 text-gray-400">
              This category is currently empty.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
