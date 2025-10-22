import React from 'react';

interface ProgressBarProps {
  currentStep: number;
  totalSteps: number;
}

const ProgressBar: React.FC<ProgressBarProps> = ({ currentStep, totalSteps }) => {
  const steps = Array.from({ length: totalSteps }, (_, i) => i + 1);

  return (
    <div className="w-full flex items-center justify-center mb-10 px-4">
      {steps.map((step, index) => (
        <React.Fragment key={step}>
          <div className="flex flex-col items-center relative">
            <div
              className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg transition-all duration-300 z-10 ${
                currentStep >= step ? 'bg-gradient-to-br from-[#007BFF] to-[#8A2BE2] text-white shadow-lg' : 'bg-gray-200 dark:bg-gray-700 text-gray-400 dark:text-gray-500'
              }`}
            >
              {step}
            </div>
          </div>
          {index < steps.length - 1 && (
            <div
              className={`flex-1 h-1 mx-2 transition-all duration-500 rounded-full ${
                currentStep > step ? 'bg-gradient-to-r from-[#007BFF] to-[#8A2BE2]' : 'bg-gray-200 dark:bg-gray-700'
              }`}
            />
          )}
        </React.Fragment>
      ))}
    </div>
  );
};

export default ProgressBar;