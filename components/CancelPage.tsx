import React from 'react';
import { Button } from './common/Button';
import { ExclamationIcon } from './common/Icons';

interface CancelPageProps {
  onRetry: () => void;
  message?: string;
}

const CancelPage: React.FC<CancelPageProps> = ({ onRetry, message }) => {
  return (
    <div className="container mx-auto px-6 py-20 flex flex-col items-center justify-center min-h-[60vh]">
      <div className="max-w-md w-full text-center bg-gray-900/50 p-8 rounded-2xl border border-gray-800">
        <div className="flex justify-center mb-4">
            <ExclamationIcon className="h-16 w-16 text-yellow-400" />
        </div>
        <h2 className="text-3xl font-bold text-white mb-4">Payment Canceled</h2>
        <p className="text-gray-300 mb-8">
            {message || "Your transaction was not completed, and you have not been charged. You can return to our plans and try again whenever you're ready."}
        </p>
        <Button onClick={onRetry} variant="primary" className="w-full text-lg">
          View Plans
        </Button>
      </div>
    </div>
  );
};

export default CancelPage;
