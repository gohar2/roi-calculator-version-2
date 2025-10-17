import React, { useState, useEffect } from "react";
import { Calculator, TrendingUp, Users, Factory, Package } from "lucide-react";
import SliderInput from "./SliderInput";
import DetailedResults from "./DetailedResults";
import ResultsPanel from "./ResultsPanel";
import InfoPopup from "./InfoPopup";

const validateInputs = (inputs) => {
  const errors = [];
  if (!inputs || typeof inputs !== "object") {
    errors.push("Inputs are missing or invalid");
    return errors;
  }

  // Validate percentages are between 0-100
  if (
    inputs.scrapPercentageCurrent < 0 
    || inputs.scrapPercentageCurrent > 1
  ) {
    errors.push("Current scrap percentage must be between 0-1");
  }

  if (inputs.machineUptimeCurrent < 0 || inputs.machineUptimeCurrent > 1) {
    errors.push("Machine uptime must be between 0-1");
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

  if (
    results.laborSavings < 0 &&
    Math.abs(results.laborSavings) >
      results.materialSavings + results.materialWasteSavings
  ) {
    warnings.push("Labor cost increases exceed material savings");
  }

  return warnings;
};

const ROICalculator = ({
  showPopup,
  setShowPopup,
  enabled,
  setEnabled,
  formData,
  setFormData,
  step,
  setStep,
}) => {
  const [errors, setErrors] = useState([]);
  const [warnings, setWarnings] = useState([]);
  const [inputs, setInputs] = useState({
    // Labor - Current
    workShifts: 1,
    daysPerYear: 250,
    hoursPerShift: 8,
    noOfOperatorsCurrent: 2,
    noOfOperatorsPost: 2,
    hourlyWageOperator: 22,
    annualOvertimeHoursperOperator: 60,
    overtimeRatePerHour: 35,
    techniciansCurrent: 1,
    techniciansPost: 0,
    annualCostPerTechnician: 75000,
    // Labor - Post (mirrors Current)
    workShiftsPost: 1,
    daysPerYearPost: 250,
    hoursPerShiftPost: 8,
    hourlyWageOperatorPost: 22,
    annualOvertimeHoursperOperatorPost: 60,
    overtimeRatePerHourPost: 35,
    annualCostPerTechnicianPost: 75000,

    // Materials
    annualPartsGoal: 100000,
    annualPartsGoalPost: 100000,
    machineUptimeCurrent: 0.9,
    machineUptimePost: 0.99,
    scrapPercentageCurrent: 0.1,
    scrapPercentagePost: 0.02,
    materialCostPerUnit: 12,
    materialCostPerUnitPost: 12,
    unitValuePerGoodUnit: 0,
    unitValuePerGoodUnit: 0,
    unitValuePerGoodUnitPost: 0,
    // Margin for contribution per additional unit (as percent of material unit cost)
    marginPercentOfMaterialUnitCost: 75,

    // Capital Equipment
    newEquipmentCost: 500000,
    discountRate: 10,
    existingEquipmentWriteOff: 0,
  });

  const [calcInputs, setCalcInputs] = useState(inputs);
  const [results, setResults] = useState({});
  const [showResults, setShowResults] = useState(false);

  // Improved IRR calculation using Newton-Raphson method with better convergence
  const computeIRR = (cashFlows) => {
    // Check for valid cash flows (need at least one negative and one positive)
    const hasNegative = cashFlows.some((cf) => cf < 0);
    const hasPositive = cashFlows.some((cf) => cf > 0);

    if (!hasNegative || !hasPositive) {
      console.log(
        "IRR: Invalid cash flows - need both positive and negative values"
      );
      return null;
    }

    console.log("IRR Calculation - Cash Flows:", cashFlows);

    // NPV function
    const npv = (rate, flows) => {
      return flows.reduce((sum, cf, period) => {
        if (period === 0) return sum + cf; // No discounting for period 0
        return sum + cf / Math.pow(1 + rate, period);
      }, 0);
    };

    // NPV derivative for Newton-Raphson method
    const npvDerivative = (rate, flows) => {
      return flows.reduce((sum, cf, period) => {
        if (period === 0) return sum; // No contribution from period 0
        return sum - (period * cf) / Math.pow(1 + rate, period + 1);
      }, 0);
    };

    // Newton-Raphson method
    let rate = 0.1; // Initial guess (10%)
    const maxIterations = 100;
    const tolerance = 1e-10;

    for (let i = 0; i < maxIterations; i++) {
      const npvValue = npv(rate, cashFlows);
      const npvDeriv = npvDerivative(rate, cashFlows);

      console.log(
        `IRR Iteration ${i}: rate=${rate}, npv=${npvValue}, derivative=${npvDeriv}`
      );

      // Check for convergence
      if (Math.abs(npvValue) < tolerance) {
        console.log(`IRR Converged at iteration ${i}: ${rate * 100}%`);
        return rate;
      }

      // Check if derivative is too small (avoid division by zero)
      if (Math.abs(npvDeriv) < 1e-15) {
        console.log("IRR: Derivative too small, trying bisection method");
        break;
      }

      // Newton-Raphson update
      const newRate = rate - npvValue / npvDeriv;

      // Prevent rate from going too negative (below -95%)
      if (newRate <= -0.95) {
        console.log("IRR: Rate too negative, trying bisection method");
        break;
      }

      rate = newRate;
    }

    // If Newton-Raphson fails, try bisection method
    console.log("Switching to bisection method for IRR calculation");

    let lowRate = -0.95;
    let highRate = 10.0; // 1000% maximum

    // Ensure we have opposite signs at boundaries
    const npvLow = npv(lowRate, cashFlows);
    const npvHigh = npv(highRate, cashFlows);

    if (npvLow * npvHigh > 0) {
      console.log("IRR: No root found in range - NPV doesn't change sign");
      return null;
    }

    for (let i = 0; i < maxIterations; i++) {
      const midRate = (lowRate + highRate) / 2;
      const npvMid = npv(midRate, cashFlows);

      console.log(`IRR Bisection ${i}: rate=${midRate}, npv=${npvMid}`);

      if (
        Math.abs(npvMid) < tolerance ||
        Math.abs(highRate - lowRate) < tolerance
      ) {
        console.log(`IRR Bisection converged: ${midRate * 100}%`);
        return midRate;
      }

      if (npvMid * npvLow < 0) {
        highRate = midRate;
      } else {
        lowRate = midRate;
      }
    }

    console.log("IRR: Failed to converge");
    return null;
  };

  // Calculate all metrics
  useEffect(() => {
    // Normalize percentage-like inputs (support 0-1 or 0-100 entries)
    const normalizePercent = (value) => {
      if (value == null || isNaN(value)) return 0;
      return value > 1 ? value / 100 : value;
    };
    // Mirror Excel percent handling for Good Units: uptime and scrap are percents
    const toPercentFraction = (v) => (v > 1 ? v / 100 : v || 0);
    // const scrapCurrent = calcInputs.scrapPercentageCurrent;
    // const scrapPost = calcInputs.scrapPercentagePost;
    // const uptimeCurrent = calcInputs.machineUptimeCurrent;
    // const uptimePost = calcInputs.machineUptimePost;
    const toDecimal = (percentValue) => {
      const value = percentValue || 0;
      // If value is already a decimal (0-1), use it as is
      // If value is a percentage (1-100), convert to decimal
      return value <= 1 ? value : value / 100;
    };
    const scrapCurrent = toDecimal(calcInputs.scrapPercentageCurrent);
    const scrapPost = toDecimal(calcInputs.scrapPercentagePost);
    const uptimeCurrent = toDecimal(calcInputs.machineUptimeCurrent);
    const uptimePost = toDecimal(calcInputs.machineUptimePost);

    // Regular labor costs (separate current/post)
    const totalWorkingHoursCurrent =
      calcInputs.workShifts * calcInputs.daysPerYear * calcInputs.hoursPerShift;
    const totalWorkingHoursPost =
      (calcInputs.workShiftsPost || calcInputs.workShifts) *
      (calcInputs.daysPerYearPost || calcInputs.daysPerYear) *
      (calcInputs.hoursPerShiftPost || calcInputs.hoursPerShift);
    const currentRegularLaborCost =
      calcInputs.noOfOperatorsCurrent *
      totalWorkingHoursCurrent *
      calcInputs.hourlyWageOperator;
    const postRegularLaborCost =
      calcInputs.noOfOperatorsPost *
      totalWorkingHoursPost *
      (calcInputs.hourlyWageOperatorPost || calcInputs.hourlyWageOperator);

    // Overtime costs
    const currentOvertimeCost =
      calcInputs.noOfOperatorsCurrent *
      calcInputs.annualOvertimeHoursperOperator *
      calcInputs.overtimeRatePerHour;
    const postOvertimeCost =
      calcInputs.noOfOperatorsPost *
      (calcInputs.annualOvertimeHoursperOperatorPost !== undefined ? calcInputs.annualOvertimeHoursperOperatorPost : calcInputs.annualOvertimeHoursperOperator) *
      (calcInputs.overtimeRatePerHourPost !== undefined ? calcInputs.overtimeRatePerHourPost : calcInputs.overtimeRatePerHour);

    // Technician costs
    const currentTechnicianCost =
      calcInputs.techniciansCurrent * calcInputs.annualCostPerTechnician;
    const postTechnicianCost =
      calcInputs.techniciansPost *
      (calcInputs.annualCostPerTechnicianPost ||
        calcInputs.annualCostPerTechnician);

    // Total labor costs
    const currentTotalLaborCost =
      currentRegularLaborCost + currentOvertimeCost + currentTechnicianCost;
    const postTotalLaborCost =
      postRegularLaborCost + postOvertimeCost + postTechnicianCost;

      console.log("Overtime Debug:", {
        currentOvertimeCost,
        postOvertimeCost,
        currentRegularLaborCost,
        postRegularLaborCost,
        currentTotalLaborCost,
        postTotalLaborCost,
        laborSavings: currentTotalLaborCost - postTotalLaborCost,
        overtimeSavings: currentOvertimeCost - postOvertimeCost,
        // Debug Post Install values
        noOfOperatorsPost: calcInputs.noOfOperatorsPost,
        annualOvertimeHoursperOperatorPost: calcInputs.annualOvertimeHoursperOperatorPost,
        overtimeRatePerHourPost: calcInputs.overtimeRatePerHourPost
      });

    // Excel-aligned Material Calculations (consolidate scrap into cost)
    const currentMaterialCost =
      calcInputs.annualPartsGoal *
      (1 + scrapCurrent) *
      calcInputs.materialCostPerUnit;
    const postMaterialCost =
      (calcInputs.annualPartsGoalPost || calcInputs.annualPartsGoal) *
      (1 + scrapPost) *
      (calcInputs.materialCostPerUnitPost ?? calcInputs.materialCostPerUnit);

    // Good units path (uptime and scrap) and unit-value delta (B24/B25/B26/B27/B28 equivalent)
    const goodUnitsCurrent = Math.round(
      calcInputs.annualPartsGoal * uptimeCurrent * (1 - scrapCurrent)
    );
    const goodUnitsPost = Math.round(
      calcInputs.annualPartsGoalPost  * uptimePost * (1 - scrapPost)
    );
    const deltaGoodUnits = goodUnitsPost - goodUnitsCurrent;
    // Unit-value benefit removed from calculation per request
    const deltaUnitValueBenefit = 0;
    
    console.log("goodUnitsCurrent:",goodUnitsCurrent)

    // Savings Calculations (cost deltas plus unit-value benefit). Waste is already embedded in material costs above.
    const currentTotalCosts = currentTotalLaborCost + currentMaterialCost;
    const postTotalCosts = postTotalLaborCost + postMaterialCost;
    console.log("postTotalCosts", postTotalCosts);
    console.log("currentTotalCosts", currentTotalCosts);
    const annualSavings =
      currentTotalCosts - postTotalCosts + deltaUnitValueBenefit;

    const laborSavings = Math.round(currentTotalLaborCost - postTotalLaborCost);
    const materialSavings = currentMaterialCost - postMaterialCost;

    // Contribution per Additional Unit (Excel-like IF logic)
    // B30: variable cost per unit = IF(B25<=0,0, I4/B25)
    const variableCostPerUnit = goodUnitsPost <= 0 ? 0 : postMaterialCost / goodUnitsPost;
    // B29: margin percent as fraction (treat numeric like Excel percent input)
    const marginPctFraction =
      calcInputs.marginPercentOfMaterialUnitCost > 1
        ? calcInputs.marginPercentOfMaterialUnitCost / 100
        : calcInputs.marginPercentOfMaterialUnitCost || 0;
    // B27: IF(OR(B30="",B30=0,B29=""),0,B30*B29)
    const contributionPerAdditionalUnit =
      variableCostPerUnit === 0 || marginPctFraction === 0
        ? 0
        : marginPctFraction * variableCostPerUnit;
    const additionalContributionFromUnits = deltaGoodUnits * contributionPerAdditionalUnit;


    // Cash Flows sheet-like IF handling for yearly cash flows
    // Year 0 handled separately below.
    // Excel has: Year n benefit = B16 + (B26*B27) + IF(B5=n, B9, 0)
    // Here, B16 maps to annualSavings; (B26*B27) is additionalContributionFromUnits; B9 is unitValueBenefit (0 here)
    const baseYearBenefit = annualSavings + (deltaGoodUnits * contributionPerAdditionalUnit);
    const oneTimeBenefit = 0; // keep parity with current sheet setup where unit value benefit is 0
    const yearCount = 3; // Inputs_Results!$B$5 equivalent currently fixed to 3 years
    const year1ROI = yearCount >= 1 ? baseYearBenefit + (yearCount === 1 ? oneTimeBenefit : 0) : "";
    const year2ROI = yearCount >= 2 ? baseYearBenefit + (yearCount === 2 ? oneTimeBenefit : 0) : "";
    const year3ROI = yearCount >= 3 ? baseYearBenefit + (yearCount === 3 ? oneTimeBenefit : 0) : "";

    // Discounted ROI (optional, based on discountRate input)
    const r = (calcInputs.discountRate || 0) / 100;
    const isBlankOrZero = (v) => v === "" || v === 0;
    const disc = (t, cf) => (isBlankOrZero(cf) ? "" : 1 / Math.pow(1 + r, t));
    const discountedYearlyROI = [
      isBlankOrZero(year1ROI) ? 0 : year1ROI * (disc(1, year1ROI) || 1),
      isBlankOrZero(year2ROI) ? 0 : year2ROI * (disc(2, year2ROI) || 1),
      isBlankOrZero(year3ROI) ? 0 : year3ROI * (disc(3, year3ROI) || 1),
    ];
    const discountedTotalROIOver3Years =
      discountedYearlyROI[0] + discountedYearlyROI[1] + discountedYearlyROI[2];

    const totalROIOver3Years =
      (year1ROI === "" ? 0 : year1ROI) +
      (year2ROI === "" ? 0 : year2ROI) +
      (year3ROI === "" ? 0 : year3ROI);
    const netCashFlow3Year = totalROIOver3Years - calcInputs.newEquipmentCost;

    // ROI per Excel:
    // =IF(B4<0,(SUM(OFFSET(B4,1,0,Inputs_Results!$B$5,1))+B4)/-B4,"")
    // Here B4 is year0Outflow; years count is 3
    const year0Outflow = -(
      (calcInputs.newEquipmentCost || 0) +
      (calcInputs.existingEquipmentWriteOff || 0)
    );
    const sumYears = totalROIOver3Years;
    const roiPercentage3Year =
      year0Outflow < 0
        ? ((sumYears + year0Outflow) / -year0Outflow) * 100
        : "";

    // Build nominal cash flows for IRR calculation
    const nominalFlows = [
      year0Outflow,
      year1ROI === "" ? 0 : year1ROI,
      year2ROI === "" ? 0 : year2ROI,
      year3ROI === "" ? 0 : year3ROI,
    ];

    // Calculate IRR using improved method
    const irrRate = computeIRR(nominalFlows);
    const annualIRR = irrRate != null ? irrRate * 100 : null;

    const paybackPeriod =
      annualSavings > 0 ? calcInputs.newEquipmentCost / annualSavings : null;

    // Cash Flows sheet parity (Year 0 outflow, discounting, cumulative)
    const discountFactors = [
      1,
      isBlankOrZero(year1ROI) ? "" : 1 / Math.pow(1 + r, 1),
      isBlankOrZero(year2ROI) ? "" : 1 / Math.pow(1 + r, 2),
      isBlankOrZero(year3ROI) ? "" : 1 / Math.pow(1 + r, 3),
    ];
    const discountedFlows = nominalFlows.map((v, i) => {
      const df = discountFactors[i];
      return df === "" ? 0 : v * df;
    });
    const cumulativeNominal = nominalFlows.reduce((arr, v, i) => {
      if (i === 0) {
        arr.push(v);
      } else {
        const shouldBlank = discountFactors[i] === "" || v === 0;
        arr.push(shouldBlank ? "" : ((arr[i - 1] === "" ? 0 : arr[i - 1]) + v));
      }
      return arr;
    }, []);
    const cumulativeDiscounted = discountedFlows.reduce((arr, v, i) => {
      if (i === 0) {
        arr.push(v);
      } else {
        const shouldBlank = discountFactors[i] === "" || nominalFlows[i] === 0;
        arr.push(shouldBlank ? "" : ((arr[i - 1] === "" ? 0 : arr[i - 1]) + v));
      }
      return arr;
    }, []);
    const npv = discountedFlows.reduce((a, b) => a + b, 0);

    const newResults = {
      // Current State
      currentTotalLaborCost,
      postTotalLaborCost,
      currentMaterialCost,
      postMaterialCost,
      currentMaterialWasteCost: 0,
      postMaterialWasteCost: 0,
      // Added metrics (Current vs Post Install)
      annualMaterialSpendCurrent: currentMaterialCost,
      annualMaterialSpendPost: postMaterialCost,
      annualLaborCostCurrent: currentTotalLaborCost,
      annualLaborCostPost: postTotalLaborCost,
      totalOperatingCostCurrent: currentTotalCosts,
      totalOperatingCostPost: postTotalCosts,

      // Savings breakdown
      laborSavings,
      materialSavings,
      materialWasteSavings: 0,
      deltaGoodUnits,
      unitValueBenefit: deltaUnitValueBenefit,
      contributionPerAdditionalUnit,
      additionalContributionFromUnits,
      annualSavings,

      // ROI metrics
      paybackPeriod,
      totalROIOver3Years,
      netCashFlow3Year,
      roiPercentage3Year,
      annualIRR,

      // Discounted metrics
      discountedYearlyROI,
      discountedTotalROIOver3Years,

      // Cash Flows parity data
      cashFlows: nominalFlows.map((v, i) => ({
        year: i, // 0 is initial outflow
        nominal: v,
        discountFactor: discountFactors[i],
        discounted: discountedFlows[i],
        cumulativeNominal: cumulativeNominal[i],
        cumulativeDiscounted: cumulativeDiscounted[i],
      })),
      npv,

      // 3-year breakdown
      // yearlyROI: [annualSavings, annualSavings, annualSavings],

      // Investment
      investment: calcInputs.newEquipmentCost,
      existingEquipmentWriteOff: calcInputs.existingEquipmentWriteOff,
    };

    console.log("Calculated Results (Cost Savings Based):", newResults);
    console.log(`Final IRR: ${annualIRR}%`);
    setResults(newResults);

    const newWarnings = validateCalculations(newResults);
    setWarnings(newWarnings);
  }, [calcInputs]);

  const handleInputChange = (field, value) => {
    setInputs((prev) => ({ ...prev, [field]: parseFloat(value) || 0 }));
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
                <h2 className="text-xl font-bold text-darkBlue">
                  Materials & Production
                </h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                <div>
                  <h3 className="text-lg font-semibold text-darkBlue mb-4">
                    Current State
                  </h3>
                  <SliderInput
                    label="Annual Parts Goal"
                    value={inputs.annualPartsGoal}
                    onChange={(value) =>
                      handleInputChange("annualPartsGoal", value)
                    }
                    min={0}
                    max={5000000}
                  />
                  <SliderInput
                    label="Machine Uptime"
                    value={inputs.machineUptimeCurrent}
                    onChange={(value) =>
                      handleInputChange("machineUptimeCurrent", value)
                    }
                    min={0}
                    max={1}
                    suffix="%"
                    step={0.01}
                    decimals={2}
                    isDecimalPercentage={true}
                  />

                  <SliderInput
                    label="Scrap Percentage"
                    value={inputs.scrapPercentageCurrent}
                    onChange={(value) =>
                      handleInputChange("scrapPercentageCurrent", value)
                    }
                    min={0}
                    max={1}
                    suffix="%"
                    step={0.01}
                    decimals={2}
                    isDecimalPercentage={true}
                  />
                  <SliderInput
                    label="Material Cost per Unit"
                    value={inputs.materialCostPerUnit}
                    onChange={(value) =>
                      handleInputChange("materialCostPerUnit", value)
                    }
                    min={0}
                    max={100}
                    suffix="$"
                  />
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-darkBlue mb-4">
                    Post Install
                  </h3>
                  <SliderInput
                    label="Annual Parts Goal"
                    value={inputs.annualPartsGoalPost}
                    onChange={(value) =>
                      handleInputChange("annualPartsGoalPost", value)
                    }
                    min={0}
                    max={5000000}
                  />
                  <SliderInput
                    label="Machine Uptime"
                    value={inputs.machineUptimePost}
                    onChange={(value) =>
                      handleInputChange("machineUptimePost", value)
                    }
                    min={0}
                    max={1}
                    suffix="%"
                    step={0.01}
                    decimals={2}
                    isDecimalPercentage={true}
                  />
                  <SliderInput
                    label="Scrap Percentage"
                    value={inputs.scrapPercentagePost}
                    onChange={(value) =>
                      handleInputChange("scrapPercentagePost", value)
                    }
                    min={0}
                    max={1}
                    suffix="%"
                    step={0.01}
                    decimals={2}
                    isDecimalPercentage={true}
                  />
                  <SliderInput
                    label="Material Cost per Unit (Post)"
                    value={inputs.materialCostPerUnitPost}
                    onChange={(value) =>
                      handleInputChange("materialCostPerUnitPost", value)
                    }
                    min={0}
                    max={100}
                    suffix="$"
                  />
                </div>
              </div>
            </div>

            {/* Labor Section */}
            <div className="bg-white rounded-2xl shadow-xl p-8">
              <div className="flex items-center space-x-3 mb-8">
                <Users className="w-6 h-6 text-lightGreen" />
                <h2 className="text-xl font-bold text-darkBlue">
                  Labor Configuration
                </h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                <div>
                  <h3 className="text-lg font-semibold text-darkBlue mb-4">
                    Current State
                  </h3>
                  <SliderInput
                    label="Work Shifts"
                    value={inputs.workShifts}
                    onChange={(value) => handleInputChange("workShifts", value)}
                    min={0}
                    max={4}
                    step={0.01}
                    decimals={2}
                  />
                  <SliderInput
                    label="Days per Year"
                    value={inputs.daysPerYear}
                    onChange={(value) =>
                      handleInputChange("daysPerYear", value)
                    }
                    min={0}
                    max={320}
                    step={0.01}
                    decimals={2}
                  />
                  <SliderInput
                    label="Hours per Shift"
                    value={inputs.hoursPerShift}
                    onChange={(value) =>
                      handleInputChange("hoursPerShift", value)
                    }
                    min={0}
                    max={12}
                    step={0.01}
                    decimals={2}
                  />
                  <SliderInput
                    label="Number of Operators"
                    value={inputs.noOfOperatorsCurrent}
                    onChange={(value) =>
                      handleInputChange("noOfOperatorsCurrent", value)
                    }
                    min={0}
                    max={20}
                  />
                  <SliderInput
                    label="Hourly Wage Per Operator"
                    value={inputs.hourlyWageOperator}
                    onChange={(value) =>
                      handleInputChange("hourlyWageOperator", value)
                    }
                    min={0}
                    max={60}
                    step={0.01}
                    decimals={2}
                  />
                  <SliderInput
                    label="Overtime Rate per Hour"
                    value={inputs.overtimeRatePerHour}
                    onChange={(value) =>
                      handleInputChange("overtimeRatePerHour", value)
                    }
                    min={0}
                    max={200}
                    step={0.01}
                    decimals={2}
                  />
                  <SliderInput
                    label="Annual Overtime Hours per Operator"
                    value={inputs.annualOvertimeHoursperOperator}
                    onChange={(value) =>
                      handleInputChange("annualOvertimeHoursperOperator", value)
                    }
                    min={0}
                    max={1000}
                    step={0.01}
                    decimals={2}
                  />
                  <SliderInput
                    label="Technicians"
                    value={inputs.techniciansCurrent}
                    onChange={(value) =>
                      handleInputChange("techniciansCurrent", value)
                    }
                    min={0}
                    max={5}
                  />
                  <SliderInput
                    label="Annual Cost per Technician"
                    value={inputs.annualCostPerTechnician}
                    onChange={(value) =>
                      handleInputChange("annualCostPerTechnician", value)
                    }
                    min={0}
                    max={200000}
                    suffix="$"
                  />
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-darkBlue mb-4">
                    Post Install
                  </h3>
                  <SliderInput
                    label="Work Shifts"
                    value={inputs.workShiftsPost}
                    onChange={(value) =>
                      handleInputChange("workShiftsPost", value)
                    }
                    min={0}
                    max={4}
                    step={0.01}
                    decimals={2}
                  />
                  <SliderInput
                    label="Days per Year"
                    value={inputs.daysPerYearPost}
                    onChange={(value) =>
                      handleInputChange("daysPerYearPost", value)
                    }
                    min={0}
                    max={320}
                    step={0.01}
                    decimals={2}
                  />
                  <SliderInput
                    label="Hours per Shift"
                    value={inputs.hoursPerShiftPost}
                    onChange={(value) =>
                      handleInputChange("hoursPerShiftPost", value)
                    }
                    min={0}
                    max={12}
                    step={0.01}
                    decimals={2}
                  />
                  <SliderInput
                    label="Number of Operators"
                    value={inputs.noOfOperatorsPost}
                    onChange={(value) =>
                      handleInputChange("noOfOperatorsPost", value)
                    }
                    min={0}
                    max={20}
                  />
                  <SliderInput
                    label="Hourly Wage Per Operator"
                    value={inputs.hourlyWageOperatorPost}
                    onChange={(value) =>
                      handleInputChange("hourlyWageOperatorPost", value)
                    }
                    min={0}
                    max={60}
                    step={0.01}
                    decimals={2}
                  />
                  <SliderInput
                    label="Overtime Rate per Hour"
                    value={inputs.overtimeRatePerHourPost}
                    onChange={(value) =>
                      handleInputChange("overtimeRatePerHourPost", value)
                    }
                    min={0}
                    max={200}
                    step={0.01}
                    decimals={2}
                  />
                  <SliderInput
                    label="Annual Overtime Hours per Operator"
                    value={inputs.annualOvertimeHoursperOperatorPost}
                    onChange={(value) =>
                      handleInputChange(
                        "annualOvertimeHoursperOperatorPost",
                        value
                      )
                    }
                    min={0}
                    max={1000}
                    step={0.01}
                    decimals={2}
                  />
                  <SliderInput
                    label="Technicians"
                    value={inputs.techniciansPost}
                    onChange={(value) =>
                      handleInputChange("techniciansPost", value)
                    }
                    min={0}
                    max={5}
                  />
                  <SliderInput
                    label="Annual Cost per Technician"
                    value={inputs.annualCostPerTechnicianPost}
                    onChange={(value) =>
                      handleInputChange("annualCostPerTechnicianPost", value)
                    }
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
                  onChange={(value) =>
                    handleInputChange("newEquipmentCost", value)
                  }
                  min={0}
                  max={10000000}
                  suffix="$"
                />
                <SliderInput
                  label="Discount Rate (%)"
                  value={inputs.discountRate}
                  onChange={(value) => handleInputChange("discountRate", value)}
                  min={0}
                  max={50}
                  suffix="%"
                  step={0.01}
                  decimals={2}
                />
              </div>
            </div>       
            <div className="bg-white rounded-2xl shadow-xl p-8">
              <div className="flex items-center space-x-3 mb-8">
                <Factory className="w-6 h-6 text-lightGreen" />
                <h2 className="text-xl font-bold text-darkBlue">Productivity Gains</h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
              <SliderInput
                    label="Margin % of Material Unit Cost"
                    value={inputs.marginPercentOfMaterialUnitCost}
                    onChange={(value) =>
                      handleInputChange(
                        "marginPercentOfMaterialUnitCost",
                        value
                      )
                    }
                    min={0}
                    max={100}
                    suffix="%"
                    step={0.01}
                    decimals={2}
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
                <h2 className="text-xl font-bold text-darkBlue">
                  Cost Savings Analysis
                </h2>
              </div>
              {warnings?.length > 0 && showResults && (
                <div className="mb-6 p-4 rounded-lg bg-amber-50 border border-amber-200 text-amber-800">
                  <p className="font-semibold mb-2">Heads up:</p>
                  <ul className="list-disc ml-5 space-y-1">
                    {warnings.map((w, i) => (
                      <li key={i}>{w}</li>
                    ))}
                  </ul>
                </div>
              )}
              {showResults ? (
                <div>
                  <ResultsPanel results={results} />
                  <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                    <p className="text-sm text-blue-700">
                      <strong>Note:</strong> These financial metrics reflect
                      cost savings only, not revenue assumptions.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="text-center py-12">
                  <Calculator className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">
                    Configure your parameters and click "Calculate ROI" to see
                    your results
                  </p>
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
