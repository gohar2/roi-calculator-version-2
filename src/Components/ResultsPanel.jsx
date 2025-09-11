import React from "react";
import { TrendingUp, DollarSign, Clock } from "lucide-react";

const ResultsPanel = ({ results }) => {
  const formatCurrency = (value) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const formatPercentage = (value) => {
    return new Intl.NumberFormat("en-US", {
      style: "percent",
      minimumFractionDigits: 1,
      maximumFractionDigits: 1,
    }).format(value / 100);
  };

  const formatYears = (years) => {
    if (years === null || years === Infinity) return "N/A";
    if (years < 1) return `${(years * 12).toFixed(1)} months`;
    return `${years.toFixed(1)} years`;
  };

  return (
    <div className="space-y-6">
      {/* <div className="bg-gradient-to-r from-green-50 to-green-100 rounded-xl p-6 text-center">
        <DollarSign className="w-10 h-10 text-darkBlue mx-auto mb-3" />
        <p className="text-sm text-darkBlue font-medium">Total Labor Savings</p>
        <p className="text-3xl font-bold text-darkBlue">${results.laborSavings?.toLocaleString()}</p>
      </div> */}
      <div className="bg-gradient-to-r from-green-50 to-green-100 rounded-xl p-6 text-center">
        <DollarSign className="w-10 h-10 text-darkBlue mx-auto mb-3" />
        <p className="text-sm text-darkBlue font-medium">Annual Cost Savings</p>
        <p className="text-3xl font-bold text-darkBlue">
          {formatCurrency(results.annualSavings)}
        </p>
        <p className="text-xs text-gray-600 mt-1">
          Based on labor & material savings only
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4">
        <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-xl p-4 text-center">
          <Clock className="w-8 h-8 text-darkBlue mx-auto mb-2" />
          <p className="text-sm text-darkBlue font-medium">Payback Period</p>
          <p className="text-2xl font-bold text-darkBlue">
            {typeof results.paybackPeriod === "number"
              ? `${formatYears(results.paybackPeriod)} `
              : "N/A"}
          </p>
          <p className="text-xs text-gray-500 mt-1">Calculated over 3 years</p>
        </div>

        <div className="bg-gradient-to-r from-purple-50 to-purple-100 rounded-xl p-4 text-center">
          <TrendingUp className="w-8 h-8 text-darkBlue mx-auto mb-2" />
          <p className="text-sm text-darkBlue font-medium">
            Internal Rate of Return
          </p>
          <p className="text-2xl font-bold text-darkBlue">
            {results.annualIRR !== null
              ? `${formatPercentage(results.annualIRR)}`
              : "N/A"}
          </p>
          <p className="text-xs text-gray-500 mt-1">Calculated over 3 years</p>
        </div>
      </div>

      <div className="bg-gradient-to-r from-indigo-50 to-indigo-100 rounded-xl p-4 text-center">
        <DollarSign className="w-8 h-8 text-darkBlue mx-auto mb-2" />
        <p className="text-sm text-darkBlue font-medium">ROI Percentage</p>
        <p className="text-2xl font-bold text-darkBlue">
          {typeof results.roiPercentage3Year === "number"
            ? `${formatPercentage(results.roiPercentage3Year)}`
            : "N/A"}
        </p>
        <p className="text-xs text-gray-500 mt-1">Calculated over 3 years</p>
      </div>

      <div className="space-y-3">
        <h3 className="font-semibold text-darkBlue">Savings Breakdown</h3>
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-darkBlue">Labor Savings:</span>
            <span className="font-bold text-lightGreen">
              {formatCurrency(results.laborSavings)}
            </span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-darkBlue">Material Savings:</span>
            <span className="font-bold text-lightGreen">
              {formatCurrency(results.materialSavings)}
            </span>
          </div>
          {/* <div className="flex justify-between text-sm">
            <span className="text-darkBlue">Material Waste Savings:</span>
            <span className="font-bold text-lightGreen">
              {formatCurrency(results.materialWasteSavings)}
            </span>
          </div> */}
          {/* Revenue/Sell price based metrics removed per requirements */}
        </div>
      </div>
    </div>
  );
};

export default ResultsPanel;
