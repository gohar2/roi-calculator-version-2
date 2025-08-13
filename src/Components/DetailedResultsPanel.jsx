import React from 'react';
import { TrendingUp, DollarSign, Clock, Calendar,BarChart3 } from 'lucide-react';
import DetailedBreakdown from './DetailedBreakdown';

const DetailedResultsPanel = ({ results }) => {
  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  };

  const formatPercentage = (value) => {
    return new Intl.NumberFormat('en-US', {
      style: 'percent',
      minimumFractionDigits: 1,
      maximumFractionDigits: 1
    }).format(value / 100);
  };

  // Determine the number of years used in the calculation
  const nYears = Math.max(
    results.cashFlow?.length || 0,
    results.depreciation?.length || 0,
    results.benefits?.length || 0
  );

  return (
    <div>
      <div className="space-y-6">
        {/* Key ROI Metrics */}
        <div className="bg-gradient-to-r from-green-50 to-green-100 rounded-xl p-6 text-center">
          <TrendingUp className="w-10 h-10 text-darkBlue mx-auto mb-3" />
          <p className="text-sm text-darkBlue font-medium">Return on Investment (ROI)</p>
          <p className="text-3xl font-bold text-darkBlue">{results.roi?.toFixed(1)}%</p>
          <p className="text-xs text-gray-500 mt-1">Calculated over {nYears} year{nYears !== 1 ? 's' : ''}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-xl p-4 text-center">
            <DollarSign className="w-8 h-8 text-darkBlue mx-auto mb-2" />
            <p className="text-sm text-darkBlue font-medium">Net Present Value</p>
            <p className="text-2xl font-bold text-darkBlue">{formatCurrency(results.npv)}</p>
            <p className="text-xs text-gray-500 mt-1">Calculated over {nYears} year{nYears !== 1 ? 's' : ''}</p>
          </div>
          
          <div className="bg-gradient-to-r from-purple-50 to-purple-100 rounded-xl p-4 text-center">
            <Clock className="w-8 h-8 text-darkBlue mx-auto mb-2" />
            <p className="text-sm text-darkBlue font-medium">Payback Period</p>
            <p className="text-2xl font-bold text-darkBlue">
              {results.paybackPeriod ? `${results.paybackPeriod} years` : 'N/A'}
            </p>
            <p className="text-xs text-gray-500 mt-1">Calculated over {nYears} year{nYears !== 1 ? 's' : ''}</p>
          </div>
        </div>

{/* Tax Analysis */}
        <div className="bg-gradient-to-r from-yellow-50 to-yellow-100 rounded-xl p-6">
          <h3 className="font-semibold text-darkBlue mb-4 flex items-center">
            <BarChart3 className="w-5 h-5 mr-2" />
            Tax Analysis
          </h3>
          <div className="space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-darkBlue">Tax Rate:</span>
              <span className="font-bold text-darkBlue">{results.taxRate}%</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-darkBlue">Asset Life:</span>
              <span className="font-bold text-darkBlue">{results.assetLife} years</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-darkBlue">Discount Rate:</span>
              <span className="font-bold text-darkBlue">{results.discountRate}%</span>
            </div>
          </div>
        </div>
      </div>
      
      {/* Detailed Breakdown Component */}
      {/* <DetailedBreakdown results={results} /> */}
    </div>
  );
};

export default DetailedResultsPanel; 