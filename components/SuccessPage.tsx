import React from 'react';
import { Button } from './common/Button';
import { CheckIcon } from './common/Icons';

interface SuccessPageProps {
  message: string;
  onContinue: () => void;
}

const SuccessPage: React.FC<SuccessPageProps> = ({ message, onContinue }) => {
  return (
    <div className="container mx-auto px-6 py-20 flex flex-col items-center justify-center min-h-[60vh]">
      <div className="max-w-md w-full text-center bg-gray-900/50 p-8 rounded-2xl border border-gray-800">
        <div className="flex justify-center mb-4">
            <CheckIcon className="h-16 w-16 text-green-400" />
        </div>
        <h2 className="text-3xl font-bold text-white mb-4">Payment Successful!</h2>
        <p className="text-gray-300 mb-8">{message || 'Your account has been updated.'}</p>
        <Button onClick={onContinue} variant="primary" className="w-full text-lg">
          Continue Generating
        </Button>
      </div>
    </div>
  );
};

export default SuccessPage;
