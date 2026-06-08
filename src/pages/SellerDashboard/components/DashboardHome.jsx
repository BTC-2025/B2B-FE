import React, { useEffect, useState } from "react";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import TrendingDownIcon from "@mui/icons-material/TrendingDown";
import FilterListIcon from "@mui/icons-material/FilterList";
import GroupAddIcon from "@mui/icons-material/GroupAdd";
import AccountBalanceWalletIcon from "@mui/icons-material/AccountBalanceWallet";
import QueryStatsIcon from "@mui/icons-material/QueryStats";
import ReceiptLongIcon from "@mui/icons-material/ReceiptLong";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { fetchSellerAnalytics, fetchOrders } from "../../../services/api";

const StatCard = ({ title, value, change, isPositive, icon, colorInfo }) => (
  <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-700 hover:shadow-md transition-all duration-300">
    <div className="flex justify-between items-start mb-4">
      <div className="flex flex-col">
        <span className="text-gray-500 dark:text-gray-400 text-sm font-medium mb-1">
          {title}
        </span>
        <h3 className="text-2xl font-bold text-gray-800 dark:text-white">
          {value}
        </h3>
      </div>
      <div
        className={`w-10 h-10 rounded-full flex items-center justify-center ${colorInfo.bg} ${colorInfo.text}`}
      >
        {icon}
      </div>
    </div>
    <div className="flex items-center gap-2 text-xs font-medium">
      <span
        className={`flex items-center gap-0.5 ${
          isPositive ? "text-green-500" : "text-red-500"
        }`}
      >
        {isPositive ? (
          <TrendingUpIcon fontSize="inherit" />
        ) : (
          <TrendingDownIcon fontSize="inherit" />
        )}
        {change}
      </span>
      <span className="text-gray-400">Since last month</span>
    </div>
  </div>
);

const DashboardHome = () => {
  const [analytics, setAnalytics] = useState(null);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        const stats = await fetchSellerAnalytics();
        setAnalytics(stats);

        const ordersList = await fetchOrders();
        setOrders(ordersList.slice(0, 5)); // Limit to recent 5
      } catch (err) {
        console.error("Error loading seller dashboard data:", err);
      } finally {
        setLoading(false);
      }
    };

    loadDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="flex-1 p-8 text-center text-gray-500 font-medium bg-[#F4F5F7] dark:bg-slate-900">
        Loading seller dashboard statistics...
      </div>
    );
  }

  const chartData = analytics?.monthlyData || [
    { month: "Jan", revenue: 4000, orders: 12 },
    { month: "Feb", revenue: 3000, orders: 8 },
    { month: "Mar", revenue: 5000, orders: 15 },
    { month: "Apr", revenue: 4500, orders: 11 },
    { month: "May", revenue: 6000, orders: 18 },
    { month: "Jun", revenue: 7500, orders: 25 },
  ];

  const donutData = [
    { name: "Paid Invoices", value: orders.filter((o) => o.status === "DELIVERED").length || 4 },
    { name: "Unpaid / Pending", value: orders.filter((o) => o.status !== "DELIVERED").length || 2 },
  ];
  const COLORS = ["#195BAC", "#E9F4FF"];

  return (
    <div className="flex-1 overflow-y-auto custom-scrollbar p-4 sm:p-6 lg:p-8 pb-20 bg-[#F4F5F7] dark:bg-slate-900">
      {/* Title Section */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Seller Dashboard Home
          </h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
            Analyze your B2B sales metrics, catalog conversion, and invoices.
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          title="Conversion Rate"
          value={`${analytics?.conversionRate || "2.4"}%`}
          change="+1.5%"
          isPositive={true}
          icon={<QueryStatsIcon />}
          colorInfo={{ bg: "bg-[#E9F4FF]", text: "text-[#195BAC]" }}
        />
        <StatCard
          title="Revenue"
          value={`₹${(analytics?.revenue || 35000).toLocaleString()}`}
          change="+12.4%"
          isPositive={true}
          icon={<AccountBalanceWalletIcon />}
          colorInfo={{
            bg: "bg-green-50 dark:bg-green-900/20",
            text: "text-green-600",
          }}
        />
        <StatCard
          title="Products Listed"
          value={analytics?.productsCount || 3}
          change="+1"
          isPositive={true}
          icon={<GroupAddIcon />}
          colorInfo={{
            bg: "bg-purple-50 dark:bg-purple-900/20",
            text: "text-purple-600",
          }}
        />
        <StatCard
          title="Orders Count"
          value={analytics?.ordersCount || 5}
          change="+3"
          isPositive={true}
          icon={<ReceiptLongIcon />}
          colorInfo={{
            bg: "bg-blue-50 dark:bg-blue-900/20",
            text: "text-blue-600",
          }}
        />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
        {/* Invoice Pie Chart */}
        <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-700">
          <h3 className="font-bold text-gray-800 dark:text-white mb-6">
            Invoices Settlement
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={donutData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {donutData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex justify-center gap-6 mt-4">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-[#195BAC]"></span>
              <span className="text-sm text-gray-600 dark:text-gray-300">Paid</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-[#E9F4FF] border border-gray-300"></span>
              <span className="text-sm text-gray-600 dark:text-gray-300">Unpaid</span>
            </div>
          </div>
        </div>

        {/* Sales BarChart */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-700">
          <h3 className="font-bold text-gray-800 dark:text-white mb-6">
            Wholesale Revenue Analytics (₹)
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <XAxis dataKey="month" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip cursor={{ fill: "transparent" }} />
                <Bar dataKey="revenue" fill="#195BAC" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Recent Orders Table */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-700 overflow-hidden">
        <div className="p-6 border-b border-gray-100 dark:border-slate-700 flex justify-between items-center">
          <h3 className="font-bold text-gray-800 dark:text-white">
            Recent B2B Contracts / Orders
          </h3>
          <button className="flex items-center gap-2 px-3 py-1.5 border border-gray-200 dark:border-slate-600 rounded-lg text-sm text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors">
            <FilterListIcon fontSize="small" />
            Filter
          </button>
        </div>

        <div className="overflow-x-auto">
          {orders.length === 0 ? (
            <div className="p-12 text-center text-gray-500 font-medium">
              No orders have been received yet.
            </div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-gray-100 dark:border-slate-700 text-xs text-gray-400 uppercase tracking-wider">
                  <th className="px-6 py-4 font-semibold">Order ID</th>
                  <th className="px-6 py-4 font-semibold">Buyer Name</th>
                  <th className="px-6 py-4 font-semibold">Total Amount</th>
                  <th className="px-6 py-4 font-semibold">Status</th>
                  <th className="px-6 py-4 font-semibold">Date</th>
                </tr>
              </thead>
              <tbody className="text-sm">
                {orders.map((row) => (
                  <tr
                    key={row._id}
                    className="hover:bg-gray-50 dark:hover:bg-slate-700/50 transition-colors border-b border-gray-50 dark:border-slate-800 last:border-none"
                  >
                    <td className="px-6 py-4 text-gray-800 dark:text-white font-medium">
                      {row._id.slice(-6).toUpperCase()}
                    </td>
                    <td className="px-6 py-4 text-gray-700 dark:text-gray-300 font-medium">
                      {row.buyer?.name}
                    </td>
                    <td className="px-6 py-4 text-gray-800 dark:text-white font-bold">
                      ₹{row.totalAmount.toLocaleString()}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          row.status === "DELIVERED"
                            ? "bg-teal-100 text-teal-700"
                            : row.status === "CANCELLED"
                              ? "bg-red-100 text-red-700"
                              : "bg-orange-100 text-orange-700"
                        }`}
                      >
                        {row.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-500">
                      {new Date(row.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};

export default DashboardHome;
