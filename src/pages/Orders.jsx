import React, { useEffect, useState } from "react";
import NavBar from "../components/NavBar";
import SecondaryNavBar from "../components/SecondaryNavBar";
import TopUtilityBar from "../components/TopUtilityBar";
import { useNavigate } from "react-router-dom";
import { fetchOrders } from "../services/api";
import { FaClipboardList } from "react-icons/fa";

export default function Orders() {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadOrdersList = async () => {
      try {
        const data = await fetchOrders();
        setOrders(data);
      } catch (err) {
        console.error("Error loading B2B orders:", err);
      } finally {
        setLoading(false);
      }
    };

    loadOrdersList();
  }, []);

  return (
    <div className="bg-[#F4F5F7] min-h-screen flex flex-col">
      <TopUtilityBar />
      <NavBar />
      <SecondaryNavBar />

      <main className="flex-1 p-6 md:p-8 max-w-7xl mx-auto w-full overflow-y-auto custom-scrollbar">
        <div className="mb-4">
          <button
            onClick={() => navigate("/")}
            className="text-primary hover:underline font-bold text-sm"
          >
            ← Back to Sourcing
          </button>
        </div>

        <h1 className="text-3xl font-bold mb-8 text-gray-800">Order Transactions</h1>

        {loading ? (
          <div className="text-center py-12 text-gray-500 font-medium">
            Loading order histories...
          </div>
        ) : orders.length === 0 ? (
          <div className="bg-white p-16 rounded-2xl text-center shadow-md border border-gray-100 max-w-2xl mx-auto">
            <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6 text-gray-400">
              <FaClipboardList size={32} />
            </div>
            <h2 className="text-xl font-bold text-gray-800 mb-2">No transactions found</h2>
            <p className="text-gray-500 mb-8">You haven't placed any B2B sourcing contracts on this account.</p>
            <button
              onClick={() => navigate("/")}
              className="bg-primary text-white px-6 py-2.5 rounded-lg font-bold hover:bg-blue-700 transition-all cursor-pointer"
            >
              Browse Products
            </button>
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-150 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50/50 text-xs text-gray-400 uppercase tracking-wider font-semibold">
                    <th className="px-6 py-4 font-bold">Transaction ID</th>
                    <th className="px-6 py-4 font-bold">Supplier Info</th>
                    <th className="px-6 py-4 font-bold">Product Ordered</th>
                    <th className="px-6 py-4 font-bold">Grand Total</th>
                    <th className="px-6 py-4 font-bold">Status</th>
                    <th className="px-6 py-4 font-bold">Contract Date</th>
                  </tr>
                </thead>
                <tbody className="text-sm">
                  {orders.map((order) => {
                    const firstProduct = order.products?.[0]?.product;
                    const itemsText = order.products?.length > 1 
                      ? `${firstProduct?.title || "Product"} and ${order.products.length - 1} other items`
                      : firstProduct?.title || "Wholesale Sourcing Item";

                    return (
                      <tr
                        key={order._id}
                        className="hover:bg-gray-50 transition-colors border-b border-gray-50 last:border-none"
                      >
                        <td className="px-6 py-4 text-gray-800 font-bold font-mono">
                          {order._id.slice(-6).toUpperCase()}
                        </td>
                        <td className="px-6 py-4">
                          <span className="font-semibold text-gray-700">
                            {order.supplier?.companyName || "Burj Tech Wholesale"}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-gray-600 max-w-xs truncate font-medium">
                          {itemsText}
                        </td>
                        <td className="px-6 py-4 text-gray-800 font-extrabold text-base">
                          ₹{order.totalAmount.toLocaleString()}
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                              order.status === "DELIVERED"
                                ? "bg-teal-100 text-teal-700"
                                : order.status === "CANCELLED"
                                  ? "bg-red-100 text-red-700"
                                  : "bg-orange-100 text-orange-700"
                            }`}
                          >
                            {order.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-gray-500 font-medium">
                          {new Date(order.createdAt).toLocaleDateString()}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
