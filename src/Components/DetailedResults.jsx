import React from "react";

const DetailedResults = ({ results }) => {
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

  return (
    <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-8">
      {/* Current vs Post Install Comparison */}
      <div className="bg-white rounded-2xl shadow-xl p-8">
        <h2 className="text-2xl font-bold text-darkBlue mb-6">
          Current vs Post Install
        </h2>
        <div className="space-y-4">
          <div className="grid grid-cols-3 gap-4 text-sm font-medium text-darkBlue border-b pb-2">
            <span></span>
            <span className="text-center">Current</span>
            <span className="text-center">Post Install</span>
          </div>
          {/* 
          <div className="grid grid-cols-3 gap-4 text-sm">
            <span className="text-darkBlue">Total Labor Cost</span>
            <span className="text-center font-bold text-lightGreen">
              {formatCurrency(results.currentTotalLaborCost)}
            </span>
            <span className="text-center font-bold text-lightGreen">
              {formatCurrency(results.postTotalLaborCost)}
            </span>
          </div>

          <div className="grid grid-cols-3 gap-4 text-sm">
            <span className="text-darkBlue">Material Cost</span>
            <span className="text-center font-bold text-lightGreen">
              {formatCurrency(results.currentMaterialCost)}
            </span>
            <span className="text-center font-bold text-lightGreen">
              {formatCurrency(results.postMaterialCost)}
            </span>
          </div>

          <div className="grid grid-cols-3 gap-4 text-sm">
            <span className="text-darkBlue">Material Waste Cost</span>
            <span className="text-center font-bold text-lightGreen">
              {formatCurrency(results.currentMaterialWasteCost)}
            </span>
            <span className="text-center font-bold text-lightGreen">
              {formatCurrency(results.postMaterialWasteCost)}
            </span>
          </div> */}

          <div className="grid grid-cols-3 gap-4 text-sm">
            <span className="text-darkBlue font-medium">
              Annual Material Spend
            </span>
            <span className="text-center font-bold text-lightGreen">
              {formatCurrency(results.annualMaterialSpendCurrent)}
            </span>
            <span className="text-center font-bold text-lightGreen">
              {formatCurrency(results.annualMaterialSpendPost)}
            </span>
          </div>

          <div className="grid grid-cols-3 gap-4 text-sm">
            <span className="text-darkBlue font-medium">Annual Labor Cost</span>
            <span className="text-center font-bold text-lightGreen">
              {formatCurrency(results.annualLaborCostCurrent)}
            </span>
            <span className="text-center font-bold text-lightGreen">
              {formatCurrency(results.annualLaborCostPost)}
            </span>
          </div>

          <div className="grid grid-cols-3 gap-4 text-sm">
            <span className="text-darkBlue font-semibold">
              Total Operating Cost
            </span>
            <span className="text-center font-bold text-lightGreen">
              {formatCurrency(results.totalOperatingCostCurrent)}
            </span>
            <span className="text-center font-bold text-lightGreen">
              {formatCurrency(results.totalOperatingCostPost)}
            </span>
          </div>

          {/* <div className="grid grid-cols-3 gap-4 text-sm">
                  <span className="text-darkBlue">Annual Revenue</span>
                  <span className="text-center font-bold text-lightGreen">${results.annualRevenueCurrent?.toLocaleString()}</span>
                  <span className="text-center font-bold text-lightGreen">${results.annualRevenuePost?.toLocaleString()}</span>
                </div> */}

          {/* <div className="grid grid-cols-3 gap-4 text-sm border-t pt-2">
                  <span class="text-darkBlue font-medium">Contribution Margin<br /><span>(3 years)</span></span>
                  <span className="text-center font-bold text-lightGreen">${results.contributionMarginCurrent?.toLocaleString()}</span>
                  <span className="text-center font-bold text-lightGreen">${results.contributionMarginPost?.toLocaleString()}</span>
                </div> */}

          <div className="grid grid-cols-3 gap-4 text-sm border-t pt-2"></div>
        </div>
      </div>

      {/* 3-Year Cash Flow Projection */}
      <div className="bg-white rounded-2xl shadow-xl p-8">
        <h2 className="text-2xl font-bold text-darkBlue mb-6">3-Year Cashflow</h2>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4 text-sm font-medium text-darkBlue border-b pb-2">
            <span>Year</span>
            <span className="text-right">Cashflow</span>
          </div>

          <div className="grid grid-cols-2 gap-4 text-sm">
            <span className="text-darkBlue">Year 1</span>
            <span className="text-right font-bold text-lightGreen">
              {formatCurrency(results.yearlyROI[0])}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-4 text-sm">
            <span className="text-darkBlue">Year 2</span>
            <span className="text-right font-bold text-lightGreen">
              {formatCurrency(results.yearlyROI[1])}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-4 text-sm">
            <span className="text-darkBlue">Year 3</span>
            <span className="text-right font-bold text-lightGreen">
              {formatCurrency(results.yearlyROI[2])}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-4 text-sm border-t pt-2">
            <span className="text-darkBlue font-medium">
              Total Cashflow (Years 1–3)
            </span>
            <span className="text-right font-bold text-lightGreen">
              {formatCurrency(results.totalROIOver3Years)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
export default DetailedResults;
