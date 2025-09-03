import React, { useState, useEffect } from 'react';
import { Calculator, TrendingUp, Users, Factory, Package } from 'lucide-react';
import SliderInput from './SliderInput';
import DetailedResults from './DetailedResults';
import ResultsPanel from './ResultsPanel';
import InfoPopup from './InfoPopup';

const validateInputs = (inputs) => {
  const errors = [];
  if (!inputs || typeof inputs !== 'object') {
    errors.push("Inputs are missing or invalid");
    return errors;
  }

  // Required fields (optional strictness)
  // if (!inputs.annualPartsGoal || inputs.annualPartsGoal <= 0) {
  //   errors.push("Annual parts goal must be greater than 0");
  // }

  // Validate percentages are between 0-100
  if (inputs.scrapPercentageCurrent < 0 || inputs.scrapPercentageCurrent > 100) {
    errors.push("Current scrap percentage must be between 0-100");
  }

  if (inputs.machineUptimeCurrent < 0 || inputs.machineUptimeCurrent > 100) {
    errors.push("Machine uptime must be between 0-100");
  }

  // Validate labor inputs
  if (inputs.hourlyWageOperator <= 0) {
    errors.push("Hourly wage must be greater than 0");
  }

  // Validate investment
  if (inputs.newEquipmentCost <= 0) {
    errors.push("Equipment cost must be greater than 0");
  }

  return errors;
};

const validateCalculations = (results) => {
  const warnings = [];
  
  // Check for unrealistic values
  if (results.paybackPeriod && results.paybackPeriod > 10) {
    warnings.push("Payback period exceeds 10 years - review assumptions");
  }
  
  if (results.annualSavings < 0) {
    warnings.push("Project shows negative savings - costs will increase");
  }
  
  if (results.laborSavings < 0 && Math.abs(results.laborSavings) > results.materialSavings + results.materialWasteSavings) {
    warnings.push("Labor cost increases exceed material savings");
  }
  
  return warnings;
}

const ROICalculator = ({showPopup, setShowPopup, enabled, setEnabled, formData, setFormData, step, setStep}) => {
  const [errors, setErrors] = useState([]);
  const [warnings, setWarnings] = useState([]);
  const [inputs, setInputs] = useState({
    // Labor - Current
    workShifts: 1,
    daysPerYear: 250,
    hoursPerShift: 8,
    noOfOperatorsCurrent: 6,
    noOfOperatorsPost: 8,
    hourlyWageOperator: 15,
    annualOvertimeHoursperOperator: 60,
    overtimeRatePerHour: 35,
    techniciansCurrent: 0,
    techniciansPost: 1,
    annualCostPerTechnician: 75000,
    
    
    // Materials
    annualPartsGoal: 1000000,
    machineUptimeCurrent: 90,
    machineUptimePost: 83,
    scrapPercentageCurrent: 5,
    scrapPercentagePost: 1,
    materialCostPerUnit: 12,
    
    
    // Capital Equipment
    newEquipmentCost: 50000
  });

  const [calcInputs, setCalcInputs] = useState(inputs);
  const [results, setResults] = useState({});
  const [showResults, setShowResults] = useState(false);
  

  // Calculate all metrics
  useEffect(() => {
    

    // Regular labor costs
    const totalWorkingHours = calcInputs.workShifts * calcInputs.daysPerYear * calcInputs.hoursPerShift;
    const currentRegularLaborCost = calcInputs.noOfOperatorsCurrent * totalWorkingHours * calcInputs.hourlyWageOperator
    const postRegularLaborCost = calcInputs.noOfOperatorsPost * totalWorkingHours * calcInputs.hourlyWageOperator

    // Overtime costs
    const currentOvertimeCost = calcInputs.noOfOperatorsCurrent * calcInputs.annualOvertimeHoursperOperator * calcInputs.overtimeRatePerHour;
    const postOvertimeCost = calcInputs.noOfOperatorsPost * calcInputs.annualOvertimeHoursperOperator * calcInputs.overtimeRatePerHour;

    // Technician costs
    const currentTechnicianCost = calcInputs.techniciansCurrent * calcInputs.annualCostPerTechnician;
    const postTechnicianCost = calcInputs.techniciansPost * calcInputs.annualCostPerTechnician;

    // Total labor costs
    const currentTotalLaborCost = currentRegularLaborCost + currentOvertimeCost + currentTechnicianCost;
    const postTotalLaborCost = postRegularLaborCost + postOvertimeCost + postTechnicianCost;

    // Material Calculations
    const currentMaterialWasteCost = calcInputs.annualPartsGoal * (calcInputs.scrapPercentageCurrent/100) * calcInputs.materialCostPerUnit;
    const postMaterialWasteCost = calcInputs.annualPartsGoal * (calcInputs.scrapPercentagePost/100) * calcInputs.materialCostPerUnit;
    const materialWasteSavings = currentMaterialWasteCost - postMaterialWasteCost;

    // Effective production (accounting for uptime)
    const currentEffectiveProduction = calcInputs.annualPartsGoal * (calcInputs.machineUptimeCurrent/100);
    const postEffectiveProduction = calcInputs.annualPartsGoal * (calcInputs.machineUptimePost/100);

    // Material costs for actual production
    const currentMaterialCost = currentEffectiveProduction * calcInputs.materialCostPerUnit;
    const postMaterialCost = postEffectiveProduction * calcInputs.materialCostPerUnit;

    // Savings Calculations
    const currentTotalCosts = currentTotalLaborCost +  currentMaterialCost + currentMaterialWasteCost;
    const postTotalCosts = postTotalLaborCost + postMaterialCost + postMaterialWasteCost;

    const annualSavings = currentTotalCosts - postTotalCosts;

    const laborSavings = Math.round(currentTotalLaborCost - postTotalLaborCost);
    const materialSavings = currentMaterialCost - postMaterialCost;

    const year1ROI = annualSavings;
    const year2ROI = annualSavings;
    const year3ROI = annualSavings;

    const totalROIOver3Years = year1ROI + year2ROI + year3ROI;
    const netCashFlow3Year = totalROIOver3Years - calcInputs.newEquipmentCost;
    
    const roiPercentage3Year = (netCashFlow3Year / calcInputs.newEquipmentCost) * 100;
    const annualIRR = annualSavings > 0 ? (annualSavings / calcInputs.newEquipmentCost) * 100 : null;
    
    const paybackPeriod = annualSavings > 0 ? calcInputs.newEquipmentCost / annualSavings : null;


    const newResults = {
      // Current State
      currentTotalLaborCost,
      postTotalLaborCost,
      currentMaterialCost,
      postMaterialCost,
      currentMaterialWasteCost,
      postMaterialWasteCost,

      // Savings breakdown
      laborSavings,
      materialSavings,
      materialWasteSavings,
      annualSavings,
      
      // ROI metrics
      paybackPeriod,
      totalROIOver3Years,
      netCashFlow3Year,
      roiPercentage3Year,
      annualIRR,

      // 3-year breakdown
      yearlyROI: [annualSavings, annualSavings, annualSavings],

      // Investment
      investment: calcInputs.newEquipmentCost
    };

    console.log('Calculated Results (Cost Savings Based):', newResults);
    setResults(newResults);
    
    // Debugging: Log results after setting state
    console.log('Results calculated and set:', newResults);

    const newWarnings = validateCalculations(newResults);
    setWarnings(newWarnings);

  }, [calcInputs]);

  const handleInputChange = (field, value) => {
    setInputs(prev => ({ ...prev, [field]: parseFloat(value) || 0 }));
  };

  const handleCalculate = () => {
    const validationErrors = validateInputs(inputs);
    setErrors(validationErrors);

    if (validationErrors.length > 0) {
      setShowResults(false); // ensure stale results don't show
      return; // stop calculation
    }
    setCalcInputs(inputs);
    setShowResults(true);
  };


  return (
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
      

      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="calculator-container grid gap-8">
          {/* Input Panel */}
          <div className="space-y-8">
          
            {/* Materials Section */}
            <div className="bg-white rounded-2xl shadow-xl p-8">
              <div className="flex items-center space-x-3 mb-8">
                <Package className="w-6 h-6 text-lightGreen" />
                <h2 className="text-xl font-bold text-darkBlue">Materials & Production</h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                <div>
                  <h3 className="text-lg font-semibold text-darkBlue mb-4">Current State</h3>
                  <SliderInput
                    label="Annual Parts Goal"
                    value={inputs.annualPartsGoal}
                    onChange={(value) => handleInputChange('annualPartsGoal', value)}
                    min={0}
                    max={5000000}
                  />
                  <SliderInput
                    label="Machine Uptime"
                    value={inputs.machineUptimeCurrent}
                    onChange={(value) => handleInputChange('machineUptimeCurrent', value)}
                    min={0}
                    max={100}
                    suffix="%"
                  />
                  
                  <SliderInput
                    label="Scrap Percentage"
                    value={inputs.scrapPercentageCurrent}
                    onChange={(value) => handleInputChange('scrapPercentageCurrent', value)}
                    min={0}
                    max={100}
                    suffix="%"
                  />
                  <SliderInput
                    label="Material Cost per Unit"
                    value={inputs.materialCostPerUnit}
                    onChange={(value) => handleInputChange('materialCostPerUnit', value)}
                    min={0}
                    max={100}
                    suffix="$"
                  />
                </div>
                
                <div>
                  <h3 className="text-lg font-semibold text-darkBlue mb-4">Post Install</h3>
                  <SliderInput
                    label="Machine Uptime"
                    value={inputs.machineUptimePost}
                    onChange={(value) => handleInputChange('machineUptimePost', value)}
                    min={0}
                    max={100}
                    suffix="%"
                  />
                  <SliderInput
                    label="Scrap Percentage"
                    value={inputs.scrapPercentagePost}
                    onChange={(value) => handleInputChange('scrapPercentagePost', value)}
                    min={0}
                    max={100}
                    suffix="%"
                    step={0.1}
                  />
                </div>
              </div>

            </div>

            {/* Labor Section */}
            <div className="bg-white rounded-2xl shadow-xl p-8">
              <div className="flex items-center space-x-3 mb-8">
                <Users className="w-6 h-6 text-lightGreen" />
                <h2 className="text-xl font-bold text-darkBlue">Labor Configuration</h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                <div>
                  <h3 className="text-lg font-semibold text-darkBlue mb-4">Current State</h3>
                  <SliderInput
                    label="Work Shifts"
                    value={inputs.workShifts}
                    onChange={(value) => handleInputChange('workShifts', value)}
                    min={0}
                    max={4}
                    step={0.01}
                    decimals={2}
                  />
                  <SliderInput
                    label="Days per Year"
                    value={inputs.daysPerYear}
                    onChange={(value) => handleInputChange('daysPerYear', value)}
                    min={0}
                    max={320}
                    step={0.01}
                    decimals={2}
                  />
                  <SliderInput
                    label="Hours per Shift"
                    value={inputs.hoursPerShift}
                    onChange={(value) => handleInputChange('hoursPerShift', value)}
                    min={0}
                    max={12}
                    step={0.01}
                    decimals={2}
                  />
                  <SliderInput
                    label="Number of Operators"
                    value={inputs.noOfOperatorsCurrent}
                    onChange={(value) => handleInputChange('noOfOperatorsCurrent', value)}
                    min={0}
                    max={20}
                  />
                  {/* <SliderInput
                    label="Operator Hours per Week"
                    value={inputs.operatorHoursCurrent}
                    onChange={(value) => handleInputChange('operatorHoursCurrent', value)}
                    min={0}
                    max={60}
                    step={0.01}
                    decimals={2}
                  /> */}
                  <SliderInput
                    label="Hourly Wage Per Operator"
                    value={inputs.hourlyWageOperator}
                    onChange={(value) => handleInputChange('hourlyWageOperator', value)}
                    min={0}
                    max={60}
                    step={0.01}
                    decimals={2}
                  />
                  {/* <SliderInput
                    label="Operator Annual Cost (pre-overtime)"
                    value={inputs.operatorAnnualCostPreOvertimeCurrent}
                    onChange={(value) => handleInputChange('operatorAnnualCostPreOvertimeCurrent', value)}
                    min={0}
                    max={200000}
                    step={0.01}
                    decimals={2}
                    suffix="$"
                  /> */}
                  <SliderInput
                    label="Overtime Rate per Hour"
                    value={inputs.overtimeRatePerHour}
                    onChange={(value) => handleInputChange('overtimeRatePerHour', value)}
                    min={0}
                    max={200}
                    step={0.01}
                    decimals={2}
                  />
                  <SliderInput
                    label="Annual Overtime Hours per Operator"
                    value={inputs.annualOvertimeHoursperOperator}
                    onChange={(value) => handleInputChange('annualOvertimeHoursperOperator', value)}
                    min={0}
                    max={1000}
                    step={0.01}
                    decimals={2}
                  />
                  <SliderInput
                    label="Technicians"
                    value={inputs.techniciansCurrent}
                    onChange={(value) => handleInputChange('techniciansCurrent', value)}
                    min={0}
                    max={5}
                  />
                  <SliderInput
                    label="Annual Cost per Technician"
                    value={inputs.annualCostPerTechnician}
                    onChange={(value) => handleInputChange('annualCostPerTechnician', value)}
                    min={0}
                    max={200000}
                    suffix="$"
                  />
                </div>
                
                <div>
                  <h3 className="text-lg font-semibold text-darkBlue mb-4">Post Install</h3>                
                  <SliderInput
                    label="Number of Operators"
                    value={inputs.noOfOperatorsPost}
                    onChange={(value) => handleInputChange('noOfOperatorsPost', value)}
                    min={0}
                    max={20}
                  />
                  
                  <SliderInput
                    label="Technicians"
                    value={inputs.techniciansPost}
                    onChange={(value) => handleInputChange('techniciansPost', value)}
                    min={0}
                    max={5}
                  />
                </div>
              </div>

              
            </div>

            {/* Investment Section */}
            <div className="bg-white rounded-2xl shadow-xl p-8">
              <div className="flex items-center space-x-3 mb-8">
                <Factory className="w-6 h-6 text-lightGreen" />
                <h2 className="text-xl font-bold text-darkBlue">Investment</h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                <SliderInput
                  label="New Equipment Cost"
                  value={inputs.newEquipmentCost}
                  onChange={(value) => handleInputChange('newEquipmentCost', value)}
                  min={0}
                  max={10000000}
                  suffix="$"
                />
              </div>

              

              <button
                onClick={handleCalculate}
                id="calculateROIBtn"
                className="w-full mt-8 text-white font-bold bg-darkBlue py-4 px-8 rounded-xl transition-all duration-300 transform hover:scale-105 shadow-lg"
              >
                Calculate Cost Savings ROI
              </button>
            </div>
          </div>

          {/* Results Panel */}
          <div className="space-y-6">
            <div className="bg-white rounded-2xl shadow-xl p-8 sticky top-24">
              <div className="flex items-center space-x-3 mb-8">
                <TrendingUp className="w-6 h-6 text-lightGreen" />
                <h2 className="text-xl font-bold text-darkBlue">Cost Savings Analysis</h2>
              </div>
              {warnings?.length > 0 && showResults && (
                <div className="mb-6 p-4 rounded-lg bg-amber-50 border border-amber-200 text-amber-800">
                  <p className="font-semibold mb-2">Heads up:</p>
                  <ul className="list-disc ml-5 space-y-1">
                    {warnings.map((w, i) => <li key={i}>{w}</li>)}
                  </ul>
                </div>
              )}
              {showResults ? (
                <div>
                  <ResultsPanel results={results} />
                  <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                    <p className="text-sm text-blue-700">
                      <strong>Note:</strong> These financial metrics reflect cost savings only, not revenue assumptions.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="text-center py-12">
                  <Calculator className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">Configure your parameters and click "Calculate ROI" to see your results</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Detailed Results Section */}
        {showResults && (
          <div>
          <DetailedResults results={results} />
          </div>
        )}
      </div>
    </div>
  );
};

export default ROICalculator;