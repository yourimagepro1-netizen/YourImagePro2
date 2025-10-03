import React from 'react';
import { CogIcon } from './common/Icons';

const MaintenancePage: React.FC = () => {
  return (
    <div className="container mx-auto px-6 py-20 flex flex-col items-center justify-center min-h-screen">
      <div className="max-w-xl w-full text-center">
        <div className="flex justify-center mb-6">
            <CogIcon className="h-20 w-20 text-cyan-400 animate-spin-slow" />
        </div>
        <h1 className="text-4xl font-black text-white mb-4">Under Maintenance</h1>
        <p className="text-lg text-gray-300 mb-6">
            Your Image Pro is currently undergoing scheduled maintenance. We are making some improvements and will be back online shortly.
        </p>
        <div className="bg-gray-900/50 p-4 rounded-lg border border-gray-800">
            <p className="text-gray-400">
                Don't worry, all your account information and creations are safe. Thank you for your patience.
            </p>
        </div>
      </div>
    </div>
  );
};

export default MaintenancePage;
