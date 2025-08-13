import React from 'react';
import { Calculator, Calendar } from 'lucide-react';

const DetailedBreakdown = ({ results }) => {
  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  };

  return (
    <div className='detailed-breakdown-container max-w-7xl mx-auto px-6 py-8 grid gap-10'>
      {/* Investment Summary */}
      <div className="space-y-6">

        {/* Cash Flow Analysis */}
        <div className="bg-white rounded-xl p-6 shadow-xl">
          <h3 className="font-semibold text-darkBlue mb-4 flex items-center">
            <Calendar className="w-5 h-5 mr-2" />
            Annual Cash Flows
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            <div className="text-center">
              <p className="text-xs text-gray-600">Year 1</p>
              <p className="font-bold text-darkBlue">{formatCurrency(results.year1CashFlow)}</p>
            </div>
            <div className="text-center">
              <p className="text-xs text-gray-600">Year 2</p>
              <p className="font-bold text-darkBlue">{formatCurrency(results.year2CashFlow)}</p>
            </div>
            <div className="text-center">
              <p className="text-xs text-gray-600">Year 3</p>
              <p className="font-bold text-darkBlue">{formatCurrency(results.year3CashFlow)}</p>
            </div>
            <div className="text-center">
              <p className="text-xs text-gray-600">Year 4</p>
              <p className="font-bold text-darkBlue">{formatCurrency(results.year4CashFlow)}</p>
            </div>
            <div className="text-center">
              <p className="text-xs text-gray-600">Year 5</p>
              <p className="font-bold text-darkBlue">{formatCurrency(results.year5CashFlow)}</p>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-r from-indigo-50 to-indigo-100 rounded-xl p-6 shadow-xl">
          <h3 className="font-semibold text-darkBlue mb-4 flex items-center">
            <Calculator className="w-5 h-5 mr-2" />
            Investment Summary
          </h3>
          <div className="space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-darkBlue">Initial Investment:</span>
              <span className="font-bold text-darkBlue">{formatCurrency(results.investment)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-darkBlue">Equipment Write-Off:</span>
              <span className="font-bold text-darkBlue">{formatCurrency(results.writeOff)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-darkBlue">Total Outflow (Year 0):</span>
              <span className="font-bold text-darkBlue">{formatCurrency(results.year0Outflow)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-darkBlue">Total Cash Flow:</span>
              <span className="font-bold text-lightGreen">{formatCurrency(results.netCashFlow)}</span>
            </div>
          </div>
        </div>

      </div>

      {/* Detailed Breakdown */}
      {results.preTaxIncome && results.preTaxIncome.length > 0 && (
        <div className="bg-white rounded-xl p-6 shadow-xl">
          <h3 className="font-semibold text-darkBlue mb-4">Detailed Year-by-Year Breakdown</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-2">Year</th>
                  <th className="text-right py-2">Benefits</th>
                  <th className="text-right py-2">Depreciation</th>
                  <th className="text-right py-2">Pre-Tax Income</th>
                  <th className="text-right py-2">Tax</th>
                  <th className="text-right py-2">Net Income</th>
                  <th className="text-right py-2">Cash Flow</th>
                </tr>
              </thead>
              <tbody>
                {results.preTaxIncome.map((_, index) => (
                  <tr key={index} className="border-b border-gray-100">
                    <td className="py-2 font-medium">{index + 1}</td>
                    <td className="text-right py-2">{formatCurrency(results.benefits[index])}</td>
                    <td className="text-right py-2">{formatCurrency(Array.isArray(results.depreciation) ? results.depreciation[index] : results.depreciation)}</td>
                    <td className="text-right py-2">{formatCurrency(results.preTaxIncome[index])}</td>
                    <td className="text-right py-2">{formatCurrency(results.tax[index])}</td>
                    <td className="text-right py-2">{formatCurrency(results.netIncome[index])}</td>
                    <td className="text-right py-2 font-bold">{formatCurrency(results.cashFlow[index])}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default DetailedBreakdown; 
