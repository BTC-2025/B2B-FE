import React from "react";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import TrendingDownIcon from "@mui/icons-material/TrendingDown";
import MoreHorizIcon from "@mui/icons-material/MoreHoriz";
import FilterListIcon from "@mui/icons-material/FilterList";
import GroupAddIcon from '@mui/icons-material/GroupAdd';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import QueryStatsIcon from '@mui/icons-material/QueryStats';
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';

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
      <span className="text-gray-400">Since last week</span>
    </div>
  </div>
);

const DashboardHome = () => {
  return (
    <div className="flex-1 overflow-y-auto custom-scrollbar p-4 sm:p-6 lg:p-8 pb-20 bg-[#F4F5F7] dark:bg-slate-900">
      {/* Title Section */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Welcome Back, Seller Dashboard
          </h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
            Here is what's happening with your store today.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <input
            type="date"
            className="px-4 py-2 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg text-sm text-gray-600 dark:text-gray-300 outline-none focus:border-[#195BAC]"
          />
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          title="Customers"
          value="1,456"
          change="+6.5%"
          isPositive={true}
          icon={<GroupAddIcon />}
          colorInfo={{ bg: "bg-[#E9F4FF]", text: "text-[#195BAC]" }}
        />
        <StatCard
          title="Revenue"
          value="$3.345"
          change="-0.10%"
          isPositive={false}
          icon={<AccountBalanceWalletIcon />}
          colorInfo={{
            bg: "bg-green-50 dark:bg-green-900/20",
            text: "text-green-600",
          }}
        />
        <StatCard
          title="Profit"
          value="60%"
          change="-0.2%"
          isPositive={false}
          icon={<QueryStatsIcon />}
          colorInfo={{
            bg: "bg-purple-50 dark:bg-purple-900/20",
            text: "text-purple-600",
          }}
        />
        <StatCard
          title="Invoices"
          value="1.135"
          change="+11.5%"
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
        {/* Invoice Statistics (Donut) */}
        <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-700">
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-bold text-gray-800 dark:text-white">
              Invoice Statistics
            </h3>
            <button className="text-gray-400 hover:text-gray-600">
              <MoreHorizIcon />
            </button>
          </div>
          <div className="flex items-center justify-center relative h-64">
            {/* CSS Conic Gradient for Donut Chart approximation */}
            <div
              className="w-48 h-48 rounded-full relative"
              style={{
                background: "conic-gradient(#195BAC 0% 40%, #E9F4FF 40% 100%)",
              }}
            >
              <div className="absolute inset-4 bg-white dark:bg-slate-800 rounded-full flex flex-col items-center justify-center z-10 shadow-inner">
                <span className="text-3xl font-bold text-gray-800 dark:text-white">
                  1.135
                </span>
                <span className="text-xs text-gray-500">Invoices</span>
              </div>
            </div>
          </div>
          <div className="flex justify-center gap-6 mt-4">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-[#195BAC]"></span>
              <span className="text-sm text-gray-600 dark:text-gray-300">
                Paid
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-[#E9F4FF]"></span>
              <span className="text-sm text-gray-600 dark:text-gray-300">
                Unpaid
              </span>
            </div>
          </div>
        </div>

        {/* Sales Analytics (Line/Graph) */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-700">
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-bold text-gray-800 dark:text-white">
              Sales Analytics
            </h3>
            <button className="text-gray-400 hover:text-gray-600">
              <MoreHorizIcon />
            </button>
          </div>
          {/* Simulated Line Chart Area */}
          <div className="relative h-64 w-full flex items-end justify-between px-2 gap-2">
            {/* Fake Bars/lines simulation */}
            {[40, 65, 45, 70, 50, 80, 55, 60, 75, 50, 65, 85].map((h, i) => (
              <div
                key={i}
                className="flex flex-col items-center gap-2 flex-1 group"
              >
                <div
                  className="w-full bg-[#E9F4FF] dark:bg-slate-700 rounded-t-sm relative transition-all duration-300 group-hover:bg-[#195BAC]/20"
                  style={{ height: `${h}%` }}
                >
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-2 h-2 bg-[#195BAC] rounded-full opacity-0 group-hover:opacity-100 transition-opacity"></div>
                </div>
                <span className="text-xs text-gray-400 dark:text-gray-500">
                  {
                    [
                      "Jan",
                      "Feb",
                      "Mar",
                      "Apr",
                      "May",
                      "Jun",
                      "Jul",
                      "Aug",
                      "Sep",
                      "Oct",
                      "Nov",
                      "Dec",
                    ][i]
                  }
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Invoices Table */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-700 overflow-hidden">
        <div className="p-6 border-b border-gray-100 dark:border-slate-700 flex justify-between items-center">
          <h3 className="font-bold text-gray-800 dark:text-white">
            Recent Invoices
          </h3>
          <button className="flex items-center gap-2 px-3 py-1.5 border border-gray-200 dark:border-slate-600 rounded-lg text-sm text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors">
            <FilterListIcon fontSize="small" />
            Filter
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-gray-100 dark:border-slate-700 text-xs text-gray-400 uppercase tracking-wider">
                <th className="px-6 py-4 font-semibold">No</th>
                <th className="px-6 py-4 font-semibold">Id Customer</th>
                <th className="px-6 py-4 font-semibold">Customer Name</th>
                <th className="px-6 py-4 font-semibold">Items Name</th>
                <th className="px-6 py-4 font-semibold">Order Date</th>
                <th className="px-6 py-4 font-semibold">Status</th>
                <th className="px-6 py-4 font-semibold text-right">Price</th>
              </tr>
            </thead>
            <tbody className="text-sm">
              {[
                {
                  no: 1,
                  id: "#065499",
                  name: "Eren Yaeger",
                  item: "1x Black Backpack",
                  date: "21/07/2022 08:21",
                  status: "Paid",
                  price: "$101",
                  statusColor: "bg-teal-100 text-teal-700",
                },
                {
                  no: 2,
                  id: "#065500",
                  name: "Levi Ackerman",
                  item: "1x Distro Backpack",
                  date: "21/07/2022 08:21",
                  status: "Pending",
                  price: "$144",
                  statusColor: "bg-orange-100 text-orange-700",
                },
                {
                  no: 3,
                  id: "#065501",
                  name: "Rainer Brown",
                  item: "1x New Backpack",
                  date: "21/07/2022 08:21",
                  status: "Paid",
                  price: "$121",
                  statusColor: "bg-teal-100 text-teal-700",
                },
                {
                  no: 4,
                  id: "#065502",
                  name: "Historia Reiss",
                  item: "2x Black Backpack",
                  date: "21/07/2022 08:21",
                  status: "Overdue",
                  price: "$300",
                  statusColor: "bg-red-100 text-red-700",
                },
              ].map((row, index) => (
                <tr
                  key={index}
                  className="hover:bg-gray-50 dark:hover:bg-slate-700/50 transition-colors border-b border-gray-50 dark:border-slate-800 last:border-none"
                >
                  <td className="px-6 py-4 text-gray-500 dark:text-gray-400">
                    {row.no}
                  </td>
                  <td className="px-6 py-4 text-gray-800 dark:text-white font-medium">
                    {row.id}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-slate-600 flex items-center justify-center text-xs font-bold text-gray-600 dark:text-gray-300">
                        {row.name.charAt(0)}
                      </div>
                      <span className="text-gray-800 dark:text-gray-200 font-medium">
                        {row.name}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-gray-600 dark:text-gray-300">
                    {row.item}
                  </td>
                  <td className="px-6 py-4 text-gray-500 dark:text-gray-400">
                    {row.date}
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold ${row.statusColor} bg-opacity-50`}
                    >
                      {row.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right font-bold text-gray-800 dark:text-white">
                    {row.price}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default DashboardHome;
