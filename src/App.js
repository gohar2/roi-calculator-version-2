import React, { useState } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import ROICalculator from './Components/calculator';
import DetailedCalculator from './Components/DetailedCalculator';
import Header from './Components/Header';


function App() {
  const [showPopup, setShowPopup] = useState(false);
  const [formData, setFormData] = useState({
    company: '',
    salesperson: '',
    email: '',
    phone: '',
    productName: '',
    productModel: ''
  });
  const [step, setStep] = useState('ask');
  const location = useLocation();

  // Determine if we're on calculator-2 (enabled) or calculator-1 (disabled)
  const enabled = location.pathname === '/calculator-2';

  const handleOpenPopup = () => {
    setFormData({
      company: '',
      salesperson: '',
      email: '',
      phone: '',
      productName: '',
      productModel: ''
    });
    setStep('ask');
    setShowPopup(true);
  };

  // Shared props for both calculators
  const calculatorProps = {
    showPopup,
    setShowPopup,
    formData,
    setFormData,
    step,
    setStep,
    enabled,
    setEnabled: () => {}, // Handled by routing
  };

  return (
    <div className="App">
      <Header 
        setShowPopup={handleOpenPopup} 
        enabled={enabled} 
      />
      <Routes>
        {/* Calculator 1 - Basic ROI Calculator */}
        <Route 
          path="/calculator-1" 
          element={
            <ROICalculator {...calculatorProps} />
          } 
        />
        
        {/* Calculator 2 - Detailed Calculator */}
        <Route 
          path="/calculator-2" 
          element={
            <DetailedCalculator {...calculatorProps} />
          } 
        />
        
        {/* Default route - redirect to calculator-1 */}
        <Route path="/" element={<Navigate to="/calculator-1" replace />} />
        
        {/* Catch all - redirect to calculator-1 */}
        <Route path="*" element={<Navigate to="/calculator-1" replace />} />
      </Routes>
    </div>
  );
}

export default App;



