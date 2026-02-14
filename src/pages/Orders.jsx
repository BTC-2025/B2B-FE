import NavBar from "../components/NavBar";
import { useNavigate } from "react-router-dom";

export default function Orders() {
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
            ← Back to Home
          </button>
          <h1 className="text-3xl font-bold mb-6">Order Transactions</h1>
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <table className="w-full text-left">
              <thead className="bg-gray-100 border-b">
                <tr>
                  <th className="p-4">Order ID</th>
                  <th className="p-4">Date</th>
                  <th className="p-4">Status</th>
                  <th className="p-4">Total</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td colSpan="4" className="text-center p-8 text-gray-500">
                    No transactions found.
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}
