import NavBar from "../components/NavBar";
import { useNavigate } from "react-router-dom";

export default function Cart() {
  const navigate = useNavigate();
  return (
    <div className="bg-background h-screen flex flex-col">
      <NavBar />
      <main className="flex-1 p-8 overflow-y-auto custom-scrollbar">
        <div className="max-w-7xl mx-auto">
          <button
            onClick={() => navigate("/")}
            className="mb-4 text-primary hover:underline"
          >
            ← Continue Shopping
          </button>
          <h1 className="text-3xl font-bold mb-6">Shopping Cart</h1>
          <div className="bg-white p-10 rounded-lg shadow text-center">
            <h2 className="text-xl text-gray-500">Your cart is empty</h2>
            <button
              onClick={() => navigate("/")}
              className="mt-4 bg-primary text-white px-6 py-2 rounded-lg"
            >
              Browse Products
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
