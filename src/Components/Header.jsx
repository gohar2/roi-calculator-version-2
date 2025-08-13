import React from 'react';
import { Download } from 'lucide-react';
import logo from '../Images/64469a0e797d2d34b5888432_Machine-Solutions-p-500.jpg';
import ToggleButton from './ToggleButton';

const Header = ({ setShowPopup, enabled, setEnabled, downloadBtn }) => {

  return (
    <div className="bg-white shadow-lg border-b sticky top-0 z-10">
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="logo rounded-lg flex items-center justify-center">
              <img src={logo} alt="Logo" className="w-full h-full object-contain" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-darkBlue calculator-heading">ROI Calculator</h1>
              <p className="text-sm text-darkBlue">Machine Solutions | Medical Device Manufacturing</p>
            </div>
          </div>
          <div className="flex space-x-2">
            <ToggleButton checked={enabled} onCheckedChange={setEnabled}/>
            <button 
              onClick={() => setShowPopup(true)}
              className="download-btn p-2 text-lightGreen hover:bg-blue-50 rounded-lg transition-colors "
              id='download-btn'
              title="Download Report"
            >
              <Download className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
      
    </div>
  );
};

export default Header; 