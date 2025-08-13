import React, { useState } from 'react';
import ROICalculator from './Components/calculator';
import DetailedCalculator from './Components/DetailedCalculator';
import Header from './Components/Header';


function App() {
  const [enabled, setEnabled] = useState(false);
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

  return (
      <div className="App">
        <Header setShowPopup={handleOpenPopup} enabled={enabled} setEnabled={setEnabled}/>
        {enabled ? (
          <DetailedCalculator
            showPopup={showPopup}
            setShowPopup={setShowPopup}
            enabled={enabled}
            setEnabled={setEnabled}
            formData={formData}
            setFormData={setFormData}
            step={step}
            setStep={setStep}
          />
        ) : (
          <ROICalculator
            showPopup={showPopup}
            setShowPopup={setShowPopup}
            enabled={enabled}
            setEnabled={setEnabled}
            formData={formData}
            setFormData={setFormData}
            step={step}
            setStep={setStep}
          />
        )}
      </div>
  );
}

export default App;



