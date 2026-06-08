import React, { useState } from "react";
import CheckIcon from "@mui/icons-material/Check";
import { marketplaceFeatures } from "../../../data/marketplaceFeatures";

const PlanCard = ({ plan, isAnnual }) => {
  const { name, price, features, recommended, isEnterprise } = plan;
  // Calculate price based on annual toggle (just simple math for demo)

  return (
    <div
      className={`relative p-6 sm:p-8 rounded-2xl border transition-all duration-300 hover:-translate-y-1 hover:shadow-xl flex flex-col
        ${
          recommended
            ? "border-[#195BAC] bg-white dark:bg-slate-800 shadow-lg ring-1 ring-[#195BAC]/20"
            : "border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:border-[#195BAC]/50"
        }
      `}
    >
      {recommended && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#195BAC] text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
          Recommended
        </div>
      )}

      <div className="mb-6">
        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
          {name}
        </h3>
        <div className="flex items-baseline gap-1">
          <span className="text-3xl font-extrabold text-[#195BAC]">
            {isEnterprise ? "" : isAnnual ? "₹" : "₹"}
            {isEnterprise
              ? "Custom"
              : isAnnual
                ? Math.floor(price * 12 * 0.9).toLocaleString()
                : price.toLocaleString()}
          </span>
          {!isEnterprise && (
            <span className="text-gray-500 dark:text-gray-400 font-medium">
              /{isAnnual ? "year" : "month"}
            </span>
          )}
        </div>
        {isAnnual && !isEnterprise && (
          <p className="text-sm text-green-600 font-medium mt-1">
            Save 10% with annual billing
          </p>
        )}
      </div>

      <ul className="space-y-4 mb-8 flex-1">
        {features.map((feature, idx) => (
          <li key={idx} className="flex items-start gap-3">
            <span
              className={`mt-0.5 flex-shrink-0 ${recommended ? "text-[#195BAC]" : "text-gray-400"}`}
            >
              <CheckIcon fontSize="small" />
            </span>
            <span className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed">
              {feature}
            </span>
          </li>
        ))}
      </ul>

      <button
        className={`w-full py-3 rounded-xl font-semibold transition-all duration-200
          ${
            recommended
              ? "bg-[#195BAC] text-white hover:bg-[#154b8f] shadow-lg hover:shadow-[#195BAC]/25"
              : isEnterprise
                ? "bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:bg-slate-800 dark:hover:bg-gray-100"
                : "bg-gray-50 dark:bg-slate-700 text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-slate-600 border border-gray-200 dark:border-slate-600"
          }
        `}
      >
        {isEnterprise ? "Contact Sales" : "Select Plan"}
      </button>
    </div>
  );
};

const SubscriptionPage = () => {
  const [isAnnual, setIsAnnual] = useState(false);

const plans = [
  {
    name: "Basic",
    price: 499,
    features: marketplaceFeatures.sellerFeatures.slice(0, 5),
    recommended: false,
  },
  {
    name: "Pro",
    price: 1499,
    features: marketplaceFeatures.sellerFeatures.slice(0, 10),
    recommended: true,
  },
  {
    name: "Enterprise",
    price: 0,
    features: marketplaceFeatures.enterpriseFeatures,
    recommended: false,
    isEnterprise: true,
  },
];

  return (
    <div className="flex-1 overflow-y-auto custom-scrollbar bg-gray-50/50 dark:bg-slate-900/50 p-4 sm:p-6 lg:p-10 pb-20">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-12">
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Unlock Growth with{" "}
            <span className="text-[#195BAC]">Seller Subscriptions</span>
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400">
            Choose the plan that fits your business needs and scale your B2B
            sales.
          </p>

          {/* Toggle */}
          <div className="flex items-center justify-center gap-4 mt-8">
            <span
              className={`text-sm font-medium ${!isAnnual ? "text-gray-900 dark:text-white" : "text-gray-500"}`}
            >
              Monthly
            </span>
            <button
              onClick={() => setIsAnnual(!isAnnual)}
              className={`relative w-14 h-7 rounded-full transition-colors duration-300 focus:outline-none ${
                isAnnual ? "bg-[#195BAC]" : "bg-gray-300 dark:bg-slate-600"
              }`}
            >
              <div
                className={`absolute top-1 left-1 w-5 h-5 bg-white rounded-full shadow-md transition-transform duration-300 ${
                  isAnnual ? "translate-x-7" : "translate-x-0"
                }`}
              />
            </button>
            <span
              className={`text-sm font-medium ${isAnnual ? "text-gray-900 dark:text-white" : "text-gray-500"}`}
            >
              Annually{" "}
              <span className="text-[#195BAC] text-xs font-bold">
                (Save 10%)
              </span>
            </span>
          </div>
        </div>

        {/* Plans Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {plans.map((plan, index) => (
            <PlanCard key={index} plan={plan} isAnnual={isAnnual} />
          ))}
        </div>

        {/* Footer */}
        <div className="flex flex-col sm:flex-row items-center justify-between mt-16 pt-8 border-t border-gray-200 dark:border-slate-800 text-sm text-gray-500">
          <div className="flex gap-4 mb-4 sm:mb-0">
            <a href="#" className="hover:text-[#195BAC]">
              Terms & Conditions
            </a>
            <a href="#" className="hover:text-[#195BAC]">
              Privacy Policy
            </a>
          </div>
          <div>© 2026 BURJ TECH</div>
        </div>
      </div>
    </div>
  );
};

export default SubscriptionPage;
