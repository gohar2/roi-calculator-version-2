import React, { useState, useEffect } from 'react';
import { Calculator, TrendingUp, Users, Factory, Package } from 'lucide-react';
import SliderInput from './SliderInput';
import DetailedResults from './DetailedResults';
import ResultsPanel from './ResultsPanel';
import InfoPopup from './InfoPopup';

const ROICalculator = ({showPopup, setShowPopup, enabled, setEnabled, formData, setFormData, step, setStep}) => {
  const [inputs, setInputs] = useState({
    // Labor - Current
    workShiftsCurrent: 1,
    daysPerYearCurrent: 250,
    hoursPerShiftCurrent: 8,
    // weeksPerYearCurrent: 52,
    noOfOperatorsCurrent: 6,
    // operatorHoursCurrent: 40,
    annualOvertimeHoursperOperatorCurrent: 60,
    overtimeRatePerHourCurrent: 35,
    operatorAnnualCostPreOvertimeCurrent: 52000,
    // annualCostPerOperatorCurrent: 52000,
    techniciansCurrent: 0,
    annualCostPerTechnicianCurrent: 75000,
    
    // Labor - Post Install
    workShiftsPost: 1,
    daysPerYearPost: 250,
    hoursPerShiftPost: 8,
    // weeksPerYearPost: 52,
    noOfOperatorsPost: 1,
    // operatorHoursPost: 40,
    annualOvertimeHoursperOperatorPost: 60,
    overtimeRatePerHourPost: 35,
    operatorAnnualCostPreOvertimePost: 52000,
    // annualCostPerOperatorPost: 52624,
    techniciansPost: 1,
    annualCostPerTechnicianPost: 75000,
    
    // Materials
    annualPartsGoalCurrent: 1000000,
    annualPartsGoalPost: 1000000,
    machineUptimeCurrent: 83,
    machineUptimePost: 90,
    scrapPercentageCurrent: 5,
    scrapPercentagePost: 1,
    materialCostPerUnitCurrent: 12,
    materialCostPerUnitPost: 12,
    outsourcedPartCostCurrent: 15,  // Cost per part when outsourcing (current state)
    outsourcedPartCostPost: 12,     // Cost per part when outsourcing (post-install)
    
    // Revenue
    
    // Capital Equipment
    newEquipmentCost: 50000
  });

  const [calcInputs, setCalcInputs] = useState(inputs);
  const [results, setResults] = useState({});
  const [showResults, setShowResults] = useState(false);

  const calculateIRR = (cashFlows, guess = 0.1, maxIterations = 1000, tolerance = 1e-6) => {
    let rate = guess;
  
    for (let i = 0; i < maxIterations; i++) {
      let npv = 0;
      let derivative = 0;
  
      for (let t = 0; t < cashFlows.length; t++) {
        npv += cashFlows[t] / Math.pow(1 + rate, t);
        if (t !== 0) {
          derivative -= t * cashFlows[t] / Math.pow(1 + rate, t + 1);
        }
      }
  
      const newRate = rate - npv / derivative;
      if (Math.abs(newRate - rate) < tolerance) {
        return newRate;
      }
      rate = newRate;
    }
  
    return NaN; // didn't converge
  };
  

  // Calculate all metrics
  useEffect(() => {
    // Use calcInputs instead of inputs for all calculations
    const baseLaborCostCurrent = calcInputs.noOfOperatorsCurrent * calcInputs.operatorAnnualCostPreOvertimeCurrent;
    const overtimeCostCurrent = calcInputs.noOfOperatorsCurrent * calcInputs.annualOvertimeHoursperOperatorCurrent * calcInputs.overtimeRatePerHourCurrent;
    const totalOperatorsCostCurrent = baseLaborCostCurrent + overtimeCostCurrent;
    const totalTechniciansCostCurrent = calcInputs.techniciansCurrent * calcInputs.annualCostPerTechnicianCurrent;
    const totalLaborCostCurrent = Math.round(totalOperatorsCostCurrent + totalTechniciansCostCurrent);
    
    const baseLaborCostPost = calcInputs.noOfOperatorsPost * calcInputs.operatorAnnualCostPreOvertimePost;
    const overtimeCostPost = calcInputs.noOfOperatorsPost * calcInputs.annualOvertimeHoursperOperatorPost * calcInputs.overtimeRatePerHourPost;
    const totalOperatorsCostPost = baseLaborCostPost + overtimeCostPost;
    const totalTechniciansCostPost = calcInputs.techniciansPost * calcInputs.annualCostPerTechnicianPost;
    const totalLaborCostPost =  Math.round(totalOperatorsCostPost + totalTechniciansCostPost);
    
    // Materials Calculations
    // const totalPartsProducedGrossCurrent = calcInputs.annualPartsGoalCurrent * (calcInputs.machineUptimeCurrent / 100);
    // const totalPartsProducedNetCurrent = totalPartsProducedGrossCurrent * (1 - calcInputs.scrapPercentageCurrent / 100);
    // const annualMaterialCostCurrent = Math.round(totalPartsProducedGrossCurrent * calcInputs.materialCostPerUnitCurrent);
    // const materialWasteCostCurrent = (totalPartsProducedGrossCurrent * calcInputs.scrapPercentageCurrent / 100) * calcInputs.materialCostPerUnitCurrent;
    // const materialWasteCostCurrent = Math.round((totalPartsProducedGrossCurrent - totalPartsProducedNetCurrent) * calcInputs.materialCostPerUnitCurrent);


    // Materials Calculations with outsourcing handling
    const calculateMaterialCosts = (state) => {
      const isOutsourced = state.materialCostPerUnit === 0;

      if (isOutsourced) {
        return {
          totalPartsProduced: state.annualPartsGoal,  // All parts are purchased
          netPartsProduced: state.annualPartsGoal,    // No scrap in outsourcing
          materialCost: Math.round(state.annualPartsGoal * state.outsourcedPartCost), // Use outsourced part cost
          wasteCost: 0  // No waste in outsourcing
        };
      } else {
        const totalPartsProduced = state.annualPartsGoal * (state.machineUptime / 100);
        const netPartsProduced = totalPartsProduced * (1 - state.scrapPercentage / 100);
        const materialCost = Math.round(totalPartsProduced * state.materialCostPerUnit);
        const wasteCost = Math.round((totalPartsProduced - netPartsProduced) * state.materialCostPerUnit);
        
        return {
          totalPartsProduced,
          netPartsProduced,
          materialCost,
          wasteCost
        };
      }
    };

    // Calculate current state costs
    const currentStateCosts = calculateMaterialCosts({
      annualPartsGoal: calcInputs.annualPartsGoalCurrent,
      machineUptime: calcInputs.machineUptimeCurrent,
      scrapPercentage: calcInputs.scrapPercentageCurrent,
      materialCostPerUnit: calcInputs.materialCostPerUnitCurrent,
      outsourcedPartCost: calcInputs.outsourcedPartCostCurrent
    });

    // Calculate post-install costs
    const postInstallCosts = calculateMaterialCosts({
      annualPartsGoal: calcInputs.annualPartsGoalPost,
      machineUptime: calcInputs.machineUptimePost,
      scrapPercentage: calcInputs.scrapPercentagePost,
      materialCostPerUnit: calcInputs.materialCostPerUnitPost,
      outsourcedPartCost: calcInputs.outsourcedPartCostPost
    });

    // Assign values from calculations
    const totalPartsProducedGrossCurrent = currentStateCosts.totalPartsProduced;
    const totalPartsProducedNetCurrent = currentStateCosts.netPartsProduced;
    const annualMaterialCostCurrent = currentStateCosts.materialCost;
    const materialWasteCostCurrent = currentStateCosts.wasteCost;

    const totalPartsProducedGrossPost = postInstallCosts.totalPartsProduced;
    const totalPartsProducedNetPost = postInstallCosts.netPartsProduced;
    const annualMaterialCostPost = postInstallCosts.materialCost;
    const materialWasteCostPost = postInstallCosts.wasteCost;

    
    // Savings Calculations
    // const laborSavings = Math.round(totalLaborCostCurrent - totalLaborCostPost);
    // const materialSavings = annualMaterialCostCurrent - annualMaterialCostPost;
    // const materialWasteSavings = Math.round(materialWasteCostCurrent - materialWasteCostPost);
    // const materialSavings = materialWasteSavings;

    // Savings Calculations
    const laborSavings = Math.round(totalLaborCostCurrent - totalLaborCostPost);
    const materialSavings = Math.round(annualMaterialCostCurrent - annualMaterialCostPost);
    const wasteSavings = Math.round(materialWasteCostCurrent - materialWasteCostPost);
    const totalMaterialSavings = materialSavings + wasteSavings;


    const totalAnnualSavings = Math.round(laborSavings + totalMaterialSavings);
    // const revenueSavings = annualRevenuePost - annualRevenueCurrent;
    
    // const year0CashFlow = -calcInputs.newEquipmentCost;
    // const annualCashFlow = totalAnnualSavings;

    // const cashFlows = [year0CashFlow, annualCashFlow, annualCashFlow, annualCashFlow];

    const year0CashFlow = -calcInputs.newEquipmentCost;
    const annualCashFlow = totalAnnualSavings;

    const year1CashFlow = Math.round(annualCashFlow);
    const year2CashFlow = Math.round(annualCashFlow);
    const year3CashFlow = Math.round(annualCashFlow);
    const netCashFlow = year1CashFlow + year2CashFlow + year3CashFlow;

    const cashFlows = [year0CashFlow, year1CashFlow, year2CashFlow, year3CashFlow];

    const discountRate = 0.10;
    const npv = Math.round(
            ((annualCashFlow / Math.pow(1 + discountRate, 1)) +
            (annualCashFlow / Math.pow(1 + discountRate, 2)) +
            (annualCashFlow / Math.pow(1 + discountRate, 3)))-calcInputs.newEquipmentCost);
    
    // Calculate IRR and handle edge cases
    let irr;
    if (totalAnnualSavings > 0 && calcInputs.newEquipmentCost > 0) {
      const irrValue = calculateIRR(cashFlows);
      irr = !isNaN(irrValue) ? irrValue * 100 : null;
    } else {
      irr = null;
    }
    
    // Calculate Payback Period (in months)
    let paybackPeriod;
    if (calcInputs.newEquipmentCost <= 0) {
        paybackPeriod = 0;  // No investment needed
    } else if (totalAnnualSavings <= 0) {
        paybackPeriod = Infinity;  // No savings, will never pay back
    } else {
        paybackPeriod = (calcInputs.newEquipmentCost / totalAnnualSavings) * 12;
    }

    const newResults = {
      // Current State
      totalOperatorsCurrent: calcInputs.noOfOperatorsCurrent,
      baseLaborCostCurrent,
      overtimeCostCurrent,
      totalOperatorsCostCurrent,
      totalTechniciansCostCurrent,
      totalLaborCostCurrent,
      totalPartsProducedGrossCurrent,
      totalPartsProducedNetCurrent,
      annualMaterialCostCurrent,
      materialWasteCostCurrent,
      // annualRevenueCurrent,
      // contributionMarginCurrent,
      // contributionMarginRatioCurrent,
      
      // Post Install
      totalOperatorsPost: calcInputs.noOfOperatorsPost,
      baseLaborCostPost,
      overtimeCostPost,
      totalOperatorsCostPost,
      totalTechniciansCostPost,
      totalLaborCostPost,
      totalPartsProducedGrossPost,
      totalPartsProducedNetPost,
      annualMaterialCostPost,
      materialWasteCostPost,
      // annualRevenuePost,
      // contributionMarginPost,
      // contributionMarginRatioPost,
      
      // Improvements
      // contributionMarginImprovement,
      laborSavings,
      materialSavings,
      totalAnnualSavings,
      // materialWasteSavings,
      
      // ROI Metrics
      // ROI Metrics
      annualCashFlow,
      year1CashFlow,
      year2CashFlow,
      year3CashFlow,
      netCashFlow,
      npv,
      irr,
      paybackPeriod: paybackPeriod === Infinity ? 'N/A' : Number(paybackPeriod)
      // annualCashFlow,
      // npv,
      // irr: irr * 100,
      // paybackPeriod
    };

    console.log('Calculated Results (Cost Savings Based):', newResults);
    setResults(newResults);
    
    // Debugging: Log results after setting state
    console.log('Results calculated and set:', newResults);

  }, [calcInputs]);

  const handleInputChange = (field, value) => {
    setInputs(prev => ({ ...prev, [field]: parseFloat(value) || 0 }));
  };

  const handleCalculate = () => {
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
                    value={inputs.annualPartsGoalCurrent}
                    onChange={(value) => handleInputChange('annualPartsGoalCurrent', value)}
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
                    value={inputs.materialCostPerUnitCurrent}
                    onChange={(value) => handleInputChange('materialCostPerUnitCurrent', value)}
                    min={0}
                    max={100}
                    suffix="$"
                  />
                  {inputs.materialCostPerUnitCurrent === 0 && (
                    <SliderInput
                      label="Outsourced Part Cost"
                      value={inputs.outsourcedPartCostCurrent}
                      onChange={(value) => handleInputChange('outsourcedPartCostCurrent', value)}
                      min={0}
                      max={100}
                      suffix="$"
                      disabled={inputs.materialCostPerUnitCurrent !== 0}
                    />
                  )}
                </div>
                
                <div>
                  <h3 className="text-lg font-semibold text-darkBlue mb-4">Post Install</h3>
                  <SliderInput
                    label="Annual Parts Goal"
                    value={inputs.annualPartsGoalPost}
                    onChange={(value) => handleInputChange('annualPartsGoalPost', value)}
                    min={0}
                    max={5000000}
                  />
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
                  <SliderInput
                    label="Material Cost per Unit"
                    value={inputs.materialCostPerUnitPost}
                    onChange={(value) => handleInputChange('materialCostPerUnitPost', value)}
                    min={0}
                    max={100}
                    suffix="$"
                  />
                  {inputs.materialCostPerUnitPost === 0 && (
                    <SliderInput
                      label="Outsourced Part Cost"
                      value={inputs.outsourcedPartCostPost}
                      onChange={(value) => handleInputChange('outsourcedPartCostPost', value)}
                      min={0}
                      max={100}
                      suffix="$"
                      disabled={inputs.materialCostPerUnitPost !== 0}
                    />
                  )}
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
                    value={inputs.workShiftsCurrent}
                    onChange={(value) => handleInputChange('workShiftsCurrent', value)}
                    min={0}
                    max={4}
                    step={0.01}
                    decimals={2}
                  />
                  <SliderInput
                    label="Days per Year"
                    value={inputs.daysPerYearCurrent}
                    onChange={(value) => handleInputChange('daysPerYearCurrent', value)}
                    min={0}
                    max={320}
                    step={0.01}
                    decimals={2}
                  />
                  <SliderInput
                    label="Hours per Shift"
                    value={inputs.hoursPerShiftCurrent}
                    onChange={(value) => handleInputChange('hoursPerShiftCurrent', value)}
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
                    label="Operator Annual Cost (pre-overtime)"
                    value={inputs.operatorAnnualCostPreOvertimeCurrent}
                    onChange={(value) => handleInputChange('operatorAnnualCostPreOvertimeCurrent', value)}
                    min={0}
                    max={200000}
                    step={0.01}
                    decimals={2}
                    suffix="$"
                  />
                  <SliderInput
                    label="Overtime Rate per Hour"
                    value={inputs.overtimeRatePerHourCurrent}
                    onChange={(value) => handleInputChange('overtimeRatePerHourCurrent', value)}
                    min={0}
                    max={200}
                    step={0.01}
                    decimals={2}
                  />
                  <SliderInput
                    label="Annual Overtime Hours per Operator"
                    value={inputs.annualOvertimeHoursperOperatorCurrent}
                    onChange={(value) => handleInputChange('annualOvertimeHoursperOperatorCurrent', value)}
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
                    value={inputs.annualCostPerTechnicianCurrent}
                    onChange={(value) => handleInputChange('annualCostPerTechnicianCurrent', value)}
                    min={0}
                    max={200000}
                    suffix="$"
                  />
                </div>
                
                <div>
                  <h3 className="text-lg font-semibold text-darkBlue mb-4">Post Install</h3>
                  <SliderInput
                    label="Work Shifts"
                    value={inputs.workShiftsPost}
                    onChange={(value) => handleInputChange('workShiftsPost', value)}
                    min={0}
                    max={4}
                    step={0.01}
                    decimals={2}
                  />
                  <SliderInput
                    label="Days per Year"
                    value={inputs.daysPerYearPost}
                    onChange={(value) => handleInputChange('daysPerYearPost', value)}
                    min={0}
                    max={320}
                    step={0.01}
                    decimals={2}
                  />
                  <SliderInput
                    label="Hours per Shift"
                    value={inputs.hoursPerShiftPost}
                    onChange={(value) => handleInputChange('hoursPerShiftPost', value)}
                    min={0}
                    max={12}
                    step={0.01}
                    decimals={2}
                  />
                  <SliderInput
                    label="Number of Operators"
                    value={inputs.noOfOperatorsPost}
                    onChange={(value) => handleInputChange('noOfOperatorsPost', value)}
                    min={0}
                    max={20}
                  />
                  {/* <SliderInput
                    label="Operator Hours per Week"
                    value={inputs.operatorHoursPost}
                    onChange={(value) => handleInputChange('operatorHoursPost', value)}
                    min={0}
                    max={60}
                    step={0.01}
                    decimals={2}
                  /> */}
                  <SliderInput
                    label="Operator Annual Cost (pre-overtime)"
                    value={inputs.operatorAnnualCostPreOvertimePost}
                    onChange={(value) => handleInputChange('operatorAnnualCostPreOvertimePost', value)}
                    min={0}
                    max={200000}
                    step={0.01}
                    decimals={2}
                    suffix="$"
                  />
                  <SliderInput
                    label="Overtime Rate per Hour"
                    value={inputs.overtimeRatePerHourPost}
                    onChange={(value) => handleInputChange('overtimeRatePerHourPost', value)}
                    min={0}
                    max={200}
                    step={0.01}
                    decimals={2}
                  />
                  <SliderInput
                    label="Annual Overtime Hours per Operator"
                    value={inputs.annualOvertimeHoursperOperatorPost}
                    onChange={(value) => handleInputChange('annualOvertimeHoursperOperatorPost', value)}
                    min={0}
                    max={1000}
                    step={0.01}
                    decimals={2}
                  />
                  <SliderInput
                    label="Technicians"
                    value={inputs.techniciansPost}
                    onChange={(value) => handleInputChange('techniciansPost', value)}
                    min={0}
                    max={5}
                  />
                  <SliderInput
                    label="Annual Cost per Technician"
                    value={inputs.annualCostPerTechnicianPost}
                    onChange={(value) => handleInputChange('annualCostPerTechnicianPost', value)}
                    min={0}
                    max={200000}
                    suffix="$"

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