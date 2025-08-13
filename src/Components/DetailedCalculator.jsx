import React, { useState, useEffect } from 'react';
import { Calculator, TrendingUp, Users, Factory, Package, Download } from 'lucide-react';
import SliderInput from './SliderInput';
import InfoPopup from './InfoPopup';
import DetailedResultsPanel from './DetailedResultsPanel';
import DetailedBreakdown from './DetailedBreakdown';
import { getDepreciationSchedule } from './depreciationUtils';

const DetailedCalculator = ({showPopup, setShowPopup, enabled, setEnabled, formData, setFormData, step, setStep}) => {
  // New state for automation line question and depreciation schedule
  const [isFullAutomationLine, setIsFullAutomationLine] = useState(false); // default NO
  const [depreciationSchedule, setDepreciationSchedule] = useState('N/A'); // default N/A

  const [inputs, setInputs] = useState({
    initialCapitalInvestment:50000,
    existingEquipmentWriteOff:25000,
    annualBenefits:[20000,42000,56300,51032,87675,32189,98541],
    assetClass:57.0, // default to 57.0
    taxRate:25,
    depreciationMethod: 'macrs', // 'macrs' or 'straight-line'
    discountRate: 10,
  });

  useEffect(() => {
    // Sync assetClass in inputs with automation toggle
    setInputs(prev => ({
      ...prev,
      assetClass: isFullAutomationLine ? 48 : 57.0
    }));
  }, [isFullAutomationLine]);

  const [calcInputs, setCalcInputs] = useState(inputs); // NEW: committed inputs for calculation
  const [results, setResults] = useState({});
  const [showResults, setShowResults] = useState(false);

  // Calculate all metrics
  useEffect(() => {
    // Use calcInputs instead of inputs for all calculations
    let assetClass = isFullAutomationLine ? 48 : 57.0;
    if (calcInputs.assetClass !== assetClass) {
      setCalcInputs(prev => ({ ...prev, assetClass }));
      return;
    }
    let assetLife = assetClass === 3 ? 5 : assetClass === 4 ? 7 : (assetClass === 48 ? 7 : assetClass === 57.0 ? 5 : 5);
    if (depreciationSchedule === '5') assetLife = 5;
    else if (depreciationSchedule === '7') assetLife = 7;
    let macrsYears = calcInputs.annualBenefits.length;
    if (calcInputs.depreciationMethod === 'macrs') {
      if (assetLife === 5) macrsYears = 6;
      else if (assetLife === 7) macrsYears = 8;
    }
    const investment = calcInputs.initialCapitalInvestment;
    const writeOff = calcInputs.existingEquipmentWriteOff;
    const benefits = calcInputs.annualBenefits;
    const taxRate = calcInputs.taxRate / 100;
    const discountRate = (calcInputs.discountRate || 10) / 100;
    const depreciationArray = getDepreciationSchedule(
      investment,
      assetLife,
      calcInputs.depreciationMethod || 'macrs',
      calcInputs.depreciationMethod === 'macrs' ? macrsYears : benefits.length
    );
    const paddedBenefits = [...benefits];
    if (calcInputs.depreciationMethod === 'macrs' && depreciationArray.length > benefits.length) {
      while (paddedBenefits.length < depreciationArray.length) {
        paddedBenefits.push(0);
      }
    }
    const year0Outflow = investment + writeOff;
    const preTaxIncome = [];
    const tax = [];
    const netIncome = [];
    const cashFlow = [];
    let npv = -year0Outflow;
    let totalCashFlow = 0;
    let cumulativeCash = 0;
    let paybackPeriod = null;
    for (let t = 0; t < depreciationArray.length; t++) {
      preTaxIncome[t] = paddedBenefits[t] - depreciationArray[t];
      tax[t] = preTaxIncome[t] * taxRate;
      netIncome[t] = preTaxIncome[t] - tax[t];
      cashFlow[t] = netIncome[t] + depreciationArray[t];
      totalCashFlow += cashFlow[t];
      npv += cashFlow[t] / Math.pow(1 + discountRate, t + 1);
      cumulativeCash += cashFlow[t];
      if (paybackPeriod === null && cumulativeCash >= year0Outflow) {
        paybackPeriod = t + 1;
      }
    }
    const roi = (totalCashFlow - year0Outflow) / year0Outflow;
    const newResults = {
      year1CashFlow: cashFlow[0] || 0,
      year2CashFlow: cashFlow[1] || 0,
      year3CashFlow: cashFlow[2] || 0,
      year4CashFlow: cashFlow[3] || 0,
      year5CashFlow: cashFlow[4] || 0,
      netCashFlow: totalCashFlow,
      npv: npv,
      roi: roi * 100,
      paybackPeriod: paybackPeriod,
      depreciation: depreciationArray,
      year0Outflow: year0Outflow,
      preTaxIncome: preTaxIncome,
      tax: tax,
      netIncome: netIncome,
      cashFlow: cashFlow,
      investment: investment,
      writeOff: writeOff,
      benefits: paddedBenefits,
      assetLife: assetLife,
      taxRate: calcInputs.taxRate,
      discountRate: calcInputs.discountRate || 10,
      depreciationMethod: calcInputs.depreciationMethod || 'macrs',
      assetClass: calcInputs.assetClass
    };
    setResults(newResults);
  }, [calcInputs, isFullAutomationLine, depreciationSchedule]); // Only recalculate when calcInputs or relevant triggers change

  const handleInputChange = (field, value) => {
    setInputs(prev => ({
      ...prev,
      [field]: field === 'depreciationMethod' ? value : parseFloat(value) || 0
    }));
  };

  const handleCalculate = () => {
    setCalcInputs(inputs); // Commit current inputs for calculation
    setShowResults(true);
  };

  return (
    <div>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
        <InfoPopup
          showPopup={showPopup}
          setShowPopup={setShowPopup}
          step={step}
          setStep={setStep}
          inputs={calcInputs}
          formData={formData}
          setFormData={setFormData}
          setShowResults={setShowResults}
          results={results}
          enabled={enabled}
        />
        
        {/* <Header setShowPopup={setShowPopup} /> */}

        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="calculator-container grid gap-8">

            {/* ROI Parameters */}
            <div className="bg-white rounded-2xl shadow-xl p-8">
              <div className="flex items-center space-x-3 mb-8">
                <Factory className="w-6 h-6 text-lightGreen" />
                <h2 className="text-xl font-bold text-darkBlue">ROI Parameters</h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                <div>
                  <h3 className="text-lg font-semibold text-darkBlue mb-4">ROI Parameters</h3>
                  {/* Automation Line Question */}
                  <SliderInput
                    label="Initial Capital Investment ($)"
                    value={inputs.initialCapitalInvestment}
                    onChange={(value) => handleInputChange('initialCapitalInvestment', value)}
                    min={0}
                    max={1000000}
                    suffix="$"
                  />
                  <SliderInput
                    label="Existing Equipment Write-Off ($)"
                    value={inputs.existingEquipmentWriteOff}
                    onChange={(value) => handleInputChange('existingEquipmentWriteOff', value)}
                    min={0}
                    max={500000}
                    suffix="$"
                  />
                  <div className="mb-6">
                    <label className="block text-sm font-medium text-darkBlue mb-1">
                      Is this a full automation line installation?
                    </label>
                    <div className="flex space-x-4">
                      <button
                        type="button"
                        className={`px-4 py-2 rounded-lg border ${isFullAutomationLine ? 'bg-lightGreen text-white' : 'bg-white text-darkBlue border-gray-300'}`}
                        onClick={() => setIsFullAutomationLine(true)}
                      >
                        Yes
                      </button>
                      <button
                        type="button"
                        className={`px-4 py-2 rounded-lg border ${!isFullAutomationLine ? 'bg-lightGreen text-white' : 'bg-white text-darkBlue border-gray-300'}`}
                        onClick={() => setIsFullAutomationLine(false)}
                      >
                        No
                      </button>
                    </div>
                  </div>
                  {/* Asset Class (read-only, synced with automation line) */}
                  <div className="mb-6">
                    <label className="block text-sm font-medium text-darkBlue mb-1">
                      Asset Class
                    </label>
                    <input
                      type="text"
                      value={inputs.assetClass}
                      readOnly
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 bg-gray-100 text-gray-700"
                    />
                  </div>
                  {/* Depreciation Schedule Dropdown */}
                  <div className="mb-6">
                    <label htmlFor="depreciationSchedule" className="block text-sm font-medium text-darkBlue mb-1">
                      Depreciation Schedule
                    </label>
                    <select
                      id="depreciationSchedule"
                      value={depreciationSchedule}
                      onChange={e => setDepreciationSchedule(e.target.value)}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-lightGreen"
                    >
                      <option value="N/A">N/A (Based on Asset Class)</option>
                      <option value="5">5 year</option>
                      <option value="7">7 year</option>
                    </select>
                  </div>                 
                  {/* Asset Class slider removed, now controlled by automation line question */}
                  {/* Depreciation Method Dropdown */}
                  <div className="mb-6">
                    <label htmlFor="depreciationMethod" className="block text-sm font-medium text-darkBlue mb-1">
                      Depreciation Method
                    </label>
                    <select
                      id="depreciationMethod"
                      value={inputs.depreciationMethod}
                      onChange={e => handleInputChange('depreciationMethod', e.target.value)}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-lightGreen"
                    >
                      <option value="macrs">MACRS (Accelerated)</option>
                      <option value="straight-line">Straight-Line</option>
                    </select>
                  </div>
                  <SliderInput
                    label="Tax Rate (%)"
                    value={inputs.taxRate}
                    onChange={(value) => handleInputChange('taxRate', value)}
                    min={0}
                    max={50}
                    suffix="%"
                  />
                  <SliderInput
                    label="Discount Rate (%)"
                    value={inputs.discountRate || 10}
                    onChange={(value) => handleInputChange('discountRate', value)}
                    min={0}
                    max={20}
                    suffix="%"
                  />
                </div>
                
                <div>
                  <h3 className="text-lg font-semibold text-darkBlue mb-4">Annual Benefits</h3>
                  <SliderInput
                    label="Year 1 Benefits ($)"
                    value={inputs.annualBenefits[0] || 0}
                    onChange={(value) => {
                      const newBenefits = [...inputs.annualBenefits];
                      newBenefits[0] = value;
                      setInputs(prev => ({ ...prev, annualBenefits: newBenefits }));
                    }}
                    min={0}
                    max={200000}
                    suffix="$"
                  />
                  <SliderInput
                    label="Year 2 Benefits ($)"
                    value={inputs.annualBenefits[1] || 0}
                    onChange={(value) => {
                      const newBenefits = [...inputs.annualBenefits];
                      newBenefits[1] = value;
                      setInputs(prev => ({ ...prev, annualBenefits: newBenefits }));
                    }}
                    min={0}
                    max={200000}
                    suffix="$"
                  />
                  <SliderInput
                    label="Year 3 Benefits ($)"
                    value={inputs.annualBenefits[2] || 0}
                    onChange={(value) => {
                      const newBenefits = [...inputs.annualBenefits];
                      newBenefits[2] = value;
                      setInputs(prev => ({ ...prev, annualBenefits: newBenefits }));
                    }}
                    min={0}
                    max={200000}
                    suffix="$"
                  />
                  <SliderInput
                    label="Year 4 Benefits ($)"
                    value={inputs.annualBenefits[3] || 0}
                    onChange={(value) => {
                      const newBenefits = [...inputs.annualBenefits];
                      newBenefits[3] = value;
                      setInputs(prev => ({ ...prev, annualBenefits: newBenefits }));
                    }}
                    min={0}
                    max={200000}
                    suffix="$"
                  />
                  <SliderInput
                    label="Year 5 Benefits ($)"
                    value={inputs.annualBenefits[4] || 0}
                    onChange={(value) => {
                      const newBenefits = [...inputs.annualBenefits];
                      newBenefits[4] = value;
                      setInputs(prev => ({ ...prev, annualBenefits: newBenefits }));
                    }}
                    min={0}
                    max={200000}
                    suffix="$"
                  />
                </div>
              </div>
              <button
                onClick={handleCalculate}
                className="w-full mt-8 text-white font-bold bg-darkBlue py-4 px-8 rounded-xl transition-all duration-300 transform hover:scale-105 shadow-lg"
              >
                Calculate Comprehensive ROI
              </button>
            </div>
            
            {/* Results Panel */}
            <div className="space-y-6">
              <div className="bg-white rounded-2xl shadow-xl p-8 sticky top-24">
                <div className="flex items-center space-x-3 mb-8">
                  <TrendingUp className="w-6 h-6 text-lightGreen" />
                  <h2 className="text-xl font-bold text-darkBlue">Detailed Analysis</h2>
                </div>

                {showResults ? (
                  <>
                    <DetailedResultsPanel results={results} />
                  </>
                ) : (
                  <div className="text-center py-12">
                    <Calculator className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500">Configure your parameters and click "Calculate Comprehensive ROI" to see your results</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          
        </div>

        {/* Detailed Results Section */}
        {showResults && (
          <DetailedBreakdown results={results} />
        )}
      </div>
    </div>
  );
};

export default DetailedCalculator;