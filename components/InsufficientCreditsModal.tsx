import React from 'react';
import { Modal } from './common/Modal';
import { Button } from './common/Button';
import { ExclamationIcon } from './common/Icons';

interface InsufficientCreditsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onGoToPricing: () => void;
  required: number;
  current: number;
}

const InsufficientCreditsModal: React.FC<InsufficientCreditsModalProps> = ({ isOpen, onClose, onGoToPricing, required, current }) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className="text-center">
        <div className="flex justify-center mb-4">
          <ExclamationIcon className="h-16 w-16 text-yellow-400" />
        </div>
        <h2 className="text-2xl font-bold text-white mb-3">Insufficient Credits</h2>
        <p className="text-gray-300 mb-6">
          This action requires {required} {required > 1 ? 'credits' : 'credit'}, but you only have {current}. Please purchase more credits to continue.
        </p>
        <div className="flex flex-col sm:flex-row gap-4">
            <Button onClick={onClose} variant="secondary" className="w-full">
              Maybe Later
            </Button>
            <Button onClick={onGoToPricing} variant="primary" className="w-full">
              View Pricing
            </Button>
        </div>
      </div>
    </Modal>
  );
};

export default InsufficientCreditsModal;
