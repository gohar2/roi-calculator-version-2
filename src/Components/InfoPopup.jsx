import React from 'react';
import { jsPDF } from 'jspdf';
import logo from '../Images/64469a0e797d2d34b5888432_Machine-Solutions-p-500.jpg';

const InfoPopup = ({ 
  showPopup, 
  setShowPopup, 
  step, 
  inputs,
  setStep, 
  formData, 
  setFormData, 
  setShowResults,
  results,
  enabled
}) => {
  if (!showPopup) return null;
  const handleDownloadPDF = (info = {}) => {
    console.log('Inside handleDownloadPDF. Results state:', results);

    const doc = new jsPDF();
    const {
      company = '',
      salesperson = '',
      email = '',
      phone = '',
      productName = '',
      productModel = ''
    } = info;
    
    const margin = 7;
    let yPosition = margin;
    const pageWidth = doc.internal.pageSize.width;
    
    // Add logo and title side by side
    doc.addImage(logo, 'JPEG', margin, yPosition, 35, 26);
    
    // Add title next to logo
    doc.setFontSize(20);
    doc.setFont(undefined, 'bold');
    doc.text('ROI Calculator', margin + 40, yPosition + 15); // Position text next to logo
    yPosition += 30; // Add space after logo and title

    doc.setFontSize(10);
    doc.setFont(undefined, 'normal');
    doc.text('Machine Solutions | Medical Device Manufacturing', margin + 40, yPosition - 10);  

    if (company || salesperson || email || phone || productName || productModel) {
      doc.setFontSize(11);
      doc.setFont(undefined, 'bold');
      doc.text(`Prepared for: ${company}`, margin, yPosition);
      yPosition += 7;
      doc.text(`Prepared by: ${salesperson} ${email} ${phone}`, margin, yPosition);
      yPosition += 7;
      doc.text(`Product: ${productName}`, margin, yPosition);
      yPosition += 7;
      doc.text(`Model#: ${productModel}`, margin, yPosition);
      yPosition += 15;
    }

    // Helper function to add footer with date
    const addFooter = (pageNumber) => {
      const pageHeight = doc.internal.pageSize.height;
      doc.setFontSize(10);
      doc.setFont(undefined, 'normal');
      doc.text(`Generated on: ${new Date().toLocaleDateString()}`, margin, pageHeight - 10);
      doc.text(`Page ${pageNumber}`, pageWidth - margin, pageHeight - 10, { align: 'right' });
    };

    // Helper function to draw a section with proper table format
    const drawSection = (title, leftColumnData, rightColumnData, yPos) => {
      // Check if we need a new page
      if (yPos > doc.internal.pageSize.height - 50) {
        addFooter(doc.internal.getNumberOfPages());
        doc.addPage();
        yPos = margin;
      }

      // Section header with background
      doc.setFillColor(111, 190, 76);
      doc.rect(0, yPos, pageWidth, 15, 'F');
      doc.setFontSize(14);
      doc.setFont(undefined, 'bold');
      doc.setTextColor(255,255,255);
      doc.text(title, pageWidth / 2, yPos + 10, { align: 'center' });
      yPos += 25;
      doc.setTextColor(0, 0, 0);

      // Column headers
      const leftColStart = pageWidth * 0.05;
      const rightColStart = pageWidth * 0.55;
      const colWidth = pageWidth * 0.4;


      doc.setFontSize(12);
      doc.setFont(undefined, 'bold');
      doc.text('Current', leftColStart + colWidth/2, yPos, { align: 'center' });
      doc.text('Post Install', rightColStart + colWidth/2, yPos, { align: 'center' });
      yPos += 15;

      // Draw the data in two columns
      const maxRows = Math.max(leftColumnData.length, rightColumnData.length);
      
      for (let i = 0; i < maxRows; i++) {
        doc.setFontSize(10);
        
        // Left column data
        if (leftColumnData[i]) {
          doc.setFont(undefined, 'normal');
          doc.text(leftColumnData[i][0], leftColStart, yPos);
          doc.setFont(undefined, 'bold');
          doc.text(leftColumnData[i][1].toString(), leftColStart + colWidth - 10, yPos, { align: 'right' });
        }
        
        // Right column data
        if (rightColumnData[i]) {
          doc.setFont(undefined, 'normal');
          doc.text(rightColumnData[i][0], rightColStart, yPos);
          doc.setFont(undefined, 'bold');
          doc.text(rightColumnData[i][1].toString(), rightColStart + colWidth - 10, yPos, { align: 'right' });
        }
        
        yPos += 6;
      }

      return yPos + 10;
    };

    // Labor Configuration Section
    const laborCurrentData = [
      ['Work Shifts', inputs.workShiftsCurrent || 0],
      ['Days per Year', inputs.daysPerYearCurrent || 0],
      ['Hours per Shift', inputs.hoursPerShiftCurrent || 0],
      ['Number of Operators', inputs.noOfOperatorsCurrent || 0],
      ['Operator Annual Cost (pre-overtime)', inputs.operatorAnnualCostPreOvertimeCurrent],
      ['Overtime Rate per Hour',inputs.overtimeRatePerHourCurrent],
      ['Annual Overtime Hours per Operator',inputs.annualOvertimeHoursperOperatorCurrent],
      // ['Operator Hours/Week', inputs.operatorHoursCurrent || 0],
      // ['Operator Wage ($/hr)', `$${(inputs.operatorWageCurrent || 0).toLocaleString()}`],
      ['Technicians', inputs.techniciansCurrent || 0],
      // ['Annual Cost per Operator', `$${(results.annualCostPerOperatorCurrent || 0).toLocaleString()}`],
      ['Annual Cost per Technician', `$${(inputs.annualCostPerTechnicianCurrent || 0).toLocaleString()}`]
    ];

    const laborPostData = [
      ['Work Shifts', inputs.workShiftsPost || 0],
      ['Days per Year', inputs.daysPerYearPost || 0],
      ['Hours per Shift', inputs.hoursPerShiftPost || 0],
      ['Number of Operators', inputs.noOfOperatorsPost || 0],
      ['Operator Annual Cost (pre-overtime)', `$${(inputs.operatorAnnualCostPreOvertimePost||0).toLocaleString()}`],
      ['Overtime Rate per Hour',inputs.overtimeRatePerHourPost],
      ['Annual Overtime Hours per Operator',inputs.annualOvertimeHoursperOperatorPost],
      // ['Operator Hours/Week', inputs.operatorHoursCurrent || 0],
      // ['Operator Wage ($/hr)', `$${(inputs.operatorWageCurrent || 0).toLocaleString()}`],
      ['Technicians', inputs.techniciansPost || 0],
      // ['Annual Cost per Operator', `$${(results.annualCostPerOperatorCurrent || 0).toLocaleString()}`],
      ['Annual Cost per Technician', `$${(inputs.annualCostPerTechnicianPost || 0).toLocaleString()}`]
    ];

    yPosition = drawSection('Labor Configuration', laborCurrentData, laborPostData, yPosition);

    // Materials & Production Section
    const materialsCurrentData = [
      ['Annual Parts Goal', (inputs.annualPartsGoalCurrent || 0).toLocaleString()],
      ['Machine Uptime', `${inputs.machineUptimeCurrent || 0}%`],
      ['Scrap Percentage', `${inputs.scrapPercentageCurrent || 0}%`],
      ['Material Cost per Unit', `$${(inputs.materialCostPerUnitCurrent || 0).toLocaleString()}`],
      // ['Sell Price per Part', `$${(inputs.sellPricePerPartCurrent || 0).toLocaleString()}`]
    ];

    const materialsPostData = [
      ['Annual Parts Goal', (inputs.annualPartsGoalPost || 0).toLocaleString()],
      ['Machine Uptime', `${inputs.machineUptimePost || 0}%`],
      ['Scrap Percentage', `${inputs.scrapPercentagePost || 0}%`],
      ['Material Cost per Unit', `$${(inputs.materialCostPerUnitPost || 0).toLocaleString()}`],
      // ['Sell Price per Part', `$${(inputs.sellPricePerPartPost || 0).toLocaleString()}`]
    ];

    yPosition = drawSection('Materials & Production', materialsCurrentData, materialsPostData, yPosition);

    // Investment & Revenue Section
    const investmentCurrentData = [
      ['New Equipment Cost', `$${(inputs.newEquipmentCost || 0).toLocaleString()}`],
      // ['Sell Price per Part', `$${(inputs.sellPricePerPartCurrent || 0).toLocaleString()}`]
    ];

    const investmentPostData = [
      ['New Equipment Cost', `$${(inputs.newEquipmentCost || 0).toLocaleString()}`],
      // ['Sell Price per Part', `$${(inputs.sellPricePerPartPost || 0).toLocaleString()}`]
    ];

    yPosition = drawSection('Investment & Revenue', investmentCurrentData, investmentPostData, yPosition);

     // Check if we need a new page
     if (yPosition > 200) {
      doc.addPage();
      yPosition = margin;
    }

    // Two-column results layout
    const sectionMargin = pageWidth * 0.05; // match other sections (left 5%)
    const leftTableX = sectionMargin;
    const leftTableWidth = pageWidth * 0.55; // narrower to give space for right column
    const rightTableX = sectionMargin + leftTableWidth + 5; // right beside it

    doc.setFillColor(111, 190, 76);
      doc.rect(0, yPosition, pageWidth, 15, 'F');
      doc.setFontSize(14);
      doc.setFont(undefined, 'bold');
      doc.setTextColor(255,255,255);
      doc.text("Comparisons", pageWidth / 2, yPosition + 10, { align: 'center' });
      yPosition += 25;
      doc.setTextColor(0, 0, 0);

    // Left side: Current vs Post Install
    doc.setFontSize(12);
    doc.setFont(undefined, 'bold');
    doc.text('Current vs Post Install', leftTableX, yPosition);
    
    // Right side: 3-Year ROI
    doc.text('3-Year ROI', rightTableX, yPosition);
    yPosition += 15;

    // Current vs Post Install table data
    const comparisonData = [
      ['Total Labor Cost', 
       `$${(results.totalLaborCostCurrent || 0).toLocaleString()}`, 
       `$${(results.totalLaborCostPost || 0).toLocaleString()}`],
      ['Material Cost', 
       `$${(results.annualMaterialCostCurrent || 0).toLocaleString()}`, 
       `$${(results.annualMaterialCostPost || 0).toLocaleString()}`],
      ['Material Waste Cost', 
       `$${(results.materialWasteCostCurrent || 0).toLocaleString()}`, 
       `$${(results.materialWasteCostPost || 0).toLocaleString()}`],
    ];

    // ROI table data
    const roiData = [
      ['Year 1', `$${(results.year1CashFlow || 0).toLocaleString()}`],
      ['Year 2', `$${(results.year2CashFlow || 0).toLocaleString()}`],
      ['Year 3', `$${(results.year3CashFlow || 0).toLocaleString()}`],
      ['Net Cash Flow', `$${(results.netCashFlow || 0).toLocaleString()}`]
    ];

    let leftTableY = yPosition;
    let rightTableY = yPosition;

    // Draw left table headers
    doc.setFontSize(10);
    doc.setFont(undefined, 'bold');
    doc.text('Metric', leftTableX, leftTableY);
    doc.text('Current', leftTableX + leftTableWidth * 0.42, leftTableY, { align: 'center' });
    doc.text('Post Install', leftTableX + leftTableWidth * 0.68, leftTableY, { align: 'center' });


    leftTableY += 12;

    // Draw right table headers
    doc.text('Year', rightTableX, rightTableY);
    doc.text('ROI ', rightTableX + 60, rightTableY, { align: 'right' });
    rightTableY += 12;

    // Draw left table (Current vs Post Install)
    comparisonData.forEach((row) => {
      doc.setFontSize(10);
      doc.setFont(undefined, 'normal');
      doc.text(row[0], leftTableX, leftTableY);
      doc.setFont(undefined, 'bold');
      doc.text(row[1], leftTableX + leftTableWidth * 0.42, leftTableY, { align: 'center' });
      doc.text(row[2], leftTableX + leftTableWidth * 0.68, leftTableY, { align: 'center' });


      leftTableY += 7;
    });

    // Draw right table (3-Year ROI)
    roiData.forEach((row) => {
      doc.setFontSize(10);
      doc.setFont(undefined, 'normal');
      doc.text(row[0], rightTableX, rightTableY);
      doc.setFont(undefined, 'bold');
      doc.text(row[1], rightTableX + 60, rightTableY, { align: 'right' });
      rightTableY += 7;
    });

    // Key Metrics Summary
    yPosition = Math.max(leftTableY, rightTableY) + 10;
    
    // Check if we need a new page for key metrics
    if (yPosition > 220) {
      doc.addPage();
      yPosition = margin;
    }
    
    // doc.setFontSize(12);
    // doc.setFont(undefined, 'bold');
    // doc.text('Key Performance Indicators', margin, yPosition);
    // yPosition += 15;

    doc.setFillColor(111, 190, 76);
      doc.rect(0, yPosition, pageWidth, 15, 'F');
      doc.setFontSize(14);
      doc.setFont(undefined, 'bold');
      doc.setTextColor(255,255,255);
      doc.text("Key Performance Indicators", pageWidth / 2, yPosition + 10, { align: 'center' });
      yPosition += 25;
      doc.setTextColor(0, 0, 0);

    const keyMetrics = [
      ['Annual Cost Savings', `$${(results.totalAnnualSavings || 0).toLocaleString()}`],
      // ['Payback Period', typeof results.paybackPeriod === 'number' ? `${results.paybackPeriod.toFixed(1)} months` : 'N/A'],
      ['Internal Rate of Return', `${(results.irr || 0).toFixed(1)}%`],
      ['Net Present Value', `$${(results.npv || 0).toLocaleString()}`]
    ];

    keyMetrics.forEach(([label, value]) => {
      // rightTableY += 12;
      doc.setFontSize(10);
      doc.setFont(undefined, 'normal');
      doc.text(label + ':', margin, yPosition);
      doc.setFont(undefined, 'bold');
      doc.text(value, margin + 90, yPosition, { align: 'right' });
      yPosition += 7;
    });

    // After all content is added, add footer to the last page
    addFooter(doc.internal.getNumberOfPages());

    // Save the PDF
    doc.save('roi-calculator-report.pdf');
  };
  
  const handleDetailedDownloadPDF = (info = {}) => {
    console.log('Inside handleDetailedDownloadPDF. Results state:', results);

    const doc = new jsPDF();
    const {
      company = '',
      salesperson = '',
      email = '',
      phone = '',
      productName = '',
      productModel = ''
    } = info;
    
    const margin = 7;
    let yPosition = margin;
    const pageWidth = doc.internal.pageSize.width;
    
    // Add logo and title side by side
    doc.addImage(logo, 'JPEG', margin, yPosition, 35, 26);
    
    // Add title next to logo
    doc.setFontSize(20);
    doc.setFont(undefined, 'bold');
    doc.text('ROI Calculator', margin + 40, yPosition + 15); // Position text next to logo
    yPosition += 30; // Add space after logo and title

    doc.setFontSize(10);
    doc.setFont(undefined, 'normal');
    doc.text('Machine Solutions | Medical Device Manufacturing', margin + 40, yPosition - 10);  

    if (company || salesperson || email || phone || productName || productModel) {
      doc.setFontSize(11);
      doc.setFont(undefined, 'bold');
      doc.text(`Prepared for: ${company}`, margin, yPosition);
      yPosition += 7;
      doc.text(`Prepared by: ${salesperson} ${email} ${phone}`, margin, yPosition);
      yPosition += 7;
      doc.text(`Product: ${productName}`, margin, yPosition);
      yPosition += 7;
      doc.text(`Model#: ${productModel}`, margin, yPosition);
      yPosition += 15;
    }

    // Helper function to add footer with date
    const addFooter = (pageNumber) => {
      const pageHeight = doc.internal.pageSize.height;
      doc.setFontSize(10);
      doc.setFont(undefined, 'normal');
      doc.text(`Generated on: ${new Date().toLocaleDateString()}`, margin, pageHeight - 10);
      doc.text(`Page ${pageNumber}`, pageWidth - margin, pageHeight - 10, { align: 'right' });
    };

    // Helper function to draw a section with proper table format
    const drawSection = (title, LeftColumnTitle, RightColumnTitle, leftColumnData, rightColumnData, yPos) => {
      // Check if we need a new page
      if (yPos > doc.internal.pageSize.height - 50) {
        addFooter(doc.internal.getNumberOfPages());
        doc.addPage();
        yPos = margin;
      }

      // Section header with background
      doc.setFillColor(111, 190, 76);
      doc.rect(0, yPos, pageWidth, 15, 'F');
      doc.setFontSize(14);
      doc.setFont(undefined, 'bold');
      doc.setTextColor(255,255,255);
      doc.text(title, pageWidth / 2, yPos + 10, { align: 'center' });
      yPos += 25;
      doc.setTextColor(0, 0, 0);

      // Column headers
      const leftColStart = pageWidth * 0.05;
      const rightColStart = pageWidth * 0.55;
      const colWidth = pageWidth * 0.4;


      doc.setFontSize(12);
      doc.setFont(undefined, 'bold');
      doc.text(LeftColumnTitle, leftColStart + colWidth/2, yPos, { align: 'center' });
      doc.text(RightColumnTitle, rightColStart + colWidth/2, yPos, { align: 'center' });
      yPos += 15;

      // Draw the data in two columns
      const maxRows = Math.max(leftColumnData.length, rightColumnData.length);
      
      for (let i = 0; i < maxRows; i++) {
        doc.setFontSize(10);
        
        // Left column data
        if (leftColumnData[i]) {
          doc.setFont(undefined, 'normal');
          doc.text(leftColumnData[i][0], leftColStart, yPos);
          doc.setFont(undefined, 'bold');
          doc.text(leftColumnData[i][1].toString(), leftColStart + colWidth - 10, yPos, { align: 'right' });
        }
        
        // Right column data
        if (rightColumnData[i]) {
          doc.setFont(undefined, 'normal');
          doc.text(rightColumnData[i][0], rightColStart, yPos);
          doc.setFont(undefined, 'bold');
          doc.text(rightColumnData[i][1].toString(), rightColStart + colWidth - 10, yPos, { align: 'right' });
        }
        
        yPos += 6;
      }

      return yPos + 10;
    };
    // `$${(results.annualCostPerOperatorCurrent || 0).toLocaleString()}`
    // CPA Parameters and Annual Benefits
    const CPAParameters = [
      ['Initial Capital Investment', `$${(inputs.initialCapitalInvestment || 0).toLocaleString()}`],
      ['Existing Equipment Write-Off', `$${(inputs.existingEquipmentWriteOff || 0).toLocaleString()}`],
      ['Asset Class', inputs.assetClass || 0],
      ['Tax Rate (%)', `${inputs.taxRate || 0}%`],
      ['Discount Rate (%)', `${inputs.discountRate || 0}%`],
    ];
    const AnnualBenefits = [
      ['Year 1 Benefits', `$${(inputs.annualBenefits[0] || 0).toLocaleString()}`],
      ['Year 2 Benefits', `$${(inputs.annualBenefits[1] || 0).toLocaleString()}`],
      ['Year 3 Benefits', `$${(inputs.annualBenefits[2] || 0).toLocaleString()}`],
      ['Year 4 Benefits', `$${(inputs.annualBenefits[3] || 0).toLocaleString()}`],
      ['Year 5 Benefits', `$${(inputs.annualBenefits[4] || 0).toLocaleString()}`],
    ];
    yPosition = drawSection('CPA Parameters','Parameters','Annual Benefits', CPAParameters, AnnualBenefits, yPosition);

    // Annual Cash Flows and Tax Analysis side by side
    const AnnualCashFlows = [
      ['Year 1 Cash Flow', `$${(results.cashFlow && results.cashFlow[0] ? results.cashFlow[0] : 0).toLocaleString()}`],
      ['Year 2 Cash Flow', `$${(results.cashFlow && results.cashFlow[1] ? results.cashFlow[1] : 0).toLocaleString()}`],
      ['Year 3 Cash Flow', `$${(results.cashFlow && results.cashFlow[2] ? results.cashFlow[2] : 0).toLocaleString()}`],
      ['Year 4 Cash Flow', `$${(results.cashFlow && results.cashFlow[3] ? results.cashFlow[3] : 0).toLocaleString()}`],
      ['Year 5 Cash Flow', `$${(results.cashFlow && results.cashFlow[4] ? results.cashFlow[4] : 0).toLocaleString()}` ],
    ];
    const TaxAnalysis = [
      ['Tax Rate', `${results.taxRate || 0}%`],
      ['Asset Life', results.assetLife || 0],
      ['Discount Rate', `${results.discountRate || 0}%`],
    ];
    yPosition = drawSection('Cash Flows and Tax Analysis', 'Annual Cash Flows', 'Tax Analysis', AnnualCashFlows, TaxAnalysis, yPosition);

    // Check if we need a new page
    if (yPosition > 200) {
      doc.addPage();
      yPosition = margin;
    }

    // Year-by-Year Breakdown Table
    // yPosition += 15;
    doc.setFillColor(111, 190, 76);
    doc.rect(0, yPosition, pageWidth, 15, 'F');
    doc.setFontSize(12);
    doc.setFont(undefined, 'bold');
    doc.setTextColor(255,255,255);
    doc.text('Year-by-Year Breakdown', pageWidth / 2, yPosition + 10, { align: 'center' });
    doc.setTextColor(0,0,0);
    yPosition += 25;
    doc.setFontSize(10);
    doc.setFont(undefined, 'bold');
    const headers = ['Year', 'Benefits', 'Depreciation', 'Pre-Tax Income', 'Tax', 'Net Income', 'Cash Flow'];
    let x = margin;
    headers.forEach((h, i) => {
      doc.text(h, x, yPosition);
      x += 27;
    });
    yPosition += 7;
    doc.setFont(undefined, 'normal');
    const nYears = Math.max(
      results.benefits?.length || 0,
      results.depreciation?.length || 0,
      results.preTaxIncome?.length || 0,
      results.tax?.length || 0,
      results.netIncome?.length || 0,
      results.cashFlow?.length || 0
    );
    for (let t = 0; t < nYears; t++) {
      x = margin;
      doc.text(`${t + 1}`, x, yPosition);
      x += 27;
      doc.text(`$${(results.benefits && results.benefits[t] !== undefined ? results.benefits[t] : 0).toLocaleString()}`, x, yPosition);
      x += 27;
      doc.text(`$${(results.depreciation && results.depreciation[t] !== undefined ? results.depreciation[t] : 0).toLocaleString()}`, x, yPosition);
      x += 27;
      doc.text(`$${(results.preTaxIncome && results.preTaxIncome[t] !== undefined ? results.preTaxIncome[t] : 0).toLocaleString()}`, x, yPosition);
      x += 27;
      doc.text(`$${(results.tax && results.tax[t] !== undefined ? results.tax[t] : 0).toLocaleString()}`, x, yPosition);
      x += 27;
      doc.text(`$${(results.netIncome && results.netIncome[t] !== undefined ? results.netIncome[t] : 0).toLocaleString()}`, x, yPosition);
      x += 27;
      doc.text(`$${(results.cashFlow && results.cashFlow[t] !== undefined ? results.cashFlow[t] : 0).toLocaleString()}`, x, yPosition);
      yPosition += 6;
      // if (yPosition > doc.internal.pageSize.height - 20) {
      //   addFooter(doc.internal.getNumberOfPages());
      //   doc.addPage();
      //   yPosition = margin + 10;
      // }
    }
    yPosition += 10;

    // doc.setFontSize(12);
    // doc.setFont(undefined, 'bold');
    // doc.text('Key Performance Indicators', margin, yPosition);
    // yPosition += 15;

    const keyMetrics = [
      ['Return on Investment', `$${(results.roi || 0).toLocaleString()}`],
      ['Payback Period', typeof results.paybackPeriod === 'number' ? `${results.paybackPeriod.toFixed(1)} Years` : 'N/A'],
      // ['Internal Rate of Return', `${(results.irr || 0).toFixed(1)}%`],
      ['Net Present Value', `$${(results.npv || 0).toLocaleString()}`]
    ];

    // keyMetrics.forEach(([label, value]) => {
    //   doc.setFontSize(10);
    //   doc.setFont(undefined, 'normal');
    //   doc.text(label + ':', margin, yPosition);
    //   doc.setFont(undefined, 'bold');
    //   doc.text(value, margin + 80, yPosition, { align: 'right' });
    //   yPosition += 7;
    // });

    // Key Performance Indicators and Investment Summary side by side
    const investmentSummary = [
      ['Year 0 Outflow', `$${(results.year0Outflow || 0).toLocaleString()}`],
      ['Initial Investment', `$${(results.investment || 0).toLocaleString()}`],
      ['Equipment Write-Off', `$${(results.writeOff || 0).toLocaleString()}`],
      ['Total Net Cash Flow', `$${(results.netCashFlow || 0).toLocaleString()}`],
    ];
    yPosition = drawSection('Summary','Key Performance Indicators','Investment Summary', keyMetrics, investmentSummary, yPosition);

    // addFooter(doc.internal.getNumberOfPages());

    // Save the PDF
    doc.save('detailed-roi-calculator-report.pdf');
  };

  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex justify-center items-center">
      <div className="bg-white p-6 rounded-xl shadow-xl w-[90%] max-w-md">
        {step === 'ask' && (
          <>
            <h2 className="text-xl font-bold mb-4 text-center text-darkBlue">Add details to the PDF?</h2>
            <div className="flex justify-end space-x-3">
              <button 
                onClick={() => {
                  setShowPopup(false);
                  setShowResults(true);
                  setTimeout(() => {
                    if (enabled) {
                      handleDetailedDownloadPDF(formData);
                    } else {
                      handleDownloadPDF(formData);
                    }
                    setStep('ask'); // reset for next time
                  }, 100); // Trigger fresh calculations
                }} 
                className="px-4 py-2 text-gray-600"
              >
                No
              </button>

              <button 
                onClick={() => setStep('form')} 
                className="px-4 py-2 bg-darkBlue text-white rounded-md"
              >
                Yes
              </button>
            </div>
          </>
        )}

        {step === 'form' && (
          <>
            <h2 className="text-xl font-bold mb-4 text-center">Enter Report Details</h2>
            {['company', 'salesperson', 'email', 'phone', 'productName', 'productModel'].map((key) => (
              <input
                key={key}
                type="text"
                placeholder={key.replace(/([A-Z])/g, ' $1').replace(/^\w/, c => c.toUpperCase())}
                value={formData[key]}
                onChange={(e) => setFormData({ ...formData, [key]: e.target.value })}
                className="w-full mb-3 px-4 py-2 border rounded-md"
              />
            ))}
            <div className="flex justify-end space-x-3">
              <button 
                onClick={() => setShowPopup(false)} 
                className="px-4 py-2 text-gray-600"
              >
                Cancel
              </button>
              <button
                className="px-4 py-2 bg-darkBlue text-white rounded-md"
                onClick={() => {
                  localStorage.setItem('roiUserInfo', JSON.stringify(formData));
                  setShowPopup(false);
                  setShowResults(true); // Ensure calculation
                  setTimeout(() => {
                    if (enabled) {
                      handleDetailedDownloadPDF(formData);
                    } else {
                      handleDownloadPDF(formData);
                    }
                    setStep('ask'); // reset for next time
                  }, 100);
                }}
              >
                Submit & Download
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default InfoPopup; 