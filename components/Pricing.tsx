import React from 'react';
import { Button } from './common/Button';
import { SUBSCRIPTION_PLANS, CREDIT_PACKS } from '../constants';

interface PricingProps {
  onStart: () => void;
  onCheckout: (priceId: string) => void;
}

const CheckIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-cyan-400" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>;

const SubscriptionCard: React.FC<{ plan: typeof SUBSCRIPTION_PLANS[number], onStart: () => void, onCheckout: (priceId: string) => void }> = ({ plan, onStart, onCheckout }) => {
  
  const handleCTAClick = () => {
    if (plan.key === 'free') {
      onStart();
    } else if ('priceId' in plan && plan.priceId) {
      onCheckout(plan.priceId);
    }
  };
  
  const getButtonProps = () => {
    if (plan.buttonVariant === 'custom') {
      return { className: `w-full ${plan.customButtonClass}` };
    }
    return { variant: plan.buttonVariant, className: 'w-full' };
  };

  const planColor = plan.key === 'professional' ? 'fuchsia' : plan.key === 'creator' ? 'emerald' : plan.key === 'agency' ? 'cyan' : 'gray';

  return (
    <div className={`bg-${planColor}-900/20 p-8 rounded-2xl border-2 border-${planColor}-500 flex flex-col relative`}>
      {plan.badge && (
        <div className="absolute top-0 -translate-y-1/2 left-1/2 -translate-x-1/2 bg-fuchsia-500 text-white text-xs font-bold px-3 py-1 rounded-full uppercase">{plan.badge}</div>
      )}
      <h3 className={`text-2xl font-bold text-${planColor}-300`}>{plan.name}</h3>
      <p className={`text-${planColor}-400/80 mb-6`}>{plan.description}</p>
      <p className="text-4xl font-black mb-6">{plan.price}<span className="text-lg font-medium text-gray-400">{plan.priceTerm}</span></p>
      <ul className="space-y-3 mb-8 flex-grow">
        {plan.features.map(feature => (
          <li key={feature} className="flex items-center gap-3"><CheckIcon /> {feature}</li>
        ))}
      </ul>
      <Button onClick={handleCTAClick} {...getButtonProps() as any}>
        {plan.cta}
      </Button>
    </div>
  );
};

const CreditPackCard: React.FC<{ pack: typeof CREDIT_PACKS[number], onCheckout: (priceId: string) => void }> = ({ pack, onCheckout }) => {
  return (
    <div className="bg-gray-900/50 p-6 rounded-2xl border border-gray-800 text-center flex flex-col justify-between">
      <div>
        <h4 className="text-xl font-bold">{pack.name}</h4>
        <p className="text-gray-400 text-sm mb-3">{pack.images}</p>
        <p className="text-3xl font-black mb-4">{pack.price}</p>
      </div>
      <Button onClick={() => onCheckout(pack.priceId)} variant={pack.buttonVariant} className="w-full">
        {pack.cta}
      </Button>
    </div>
  );
};


const PricingComponent: React.FC<PricingProps> = ({ onStart, onCheckout }) => {
  return (
    <section id="pricing" className="py-20 bg-[#141416]">
      <div className="container mx-auto px-6">
        <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-black text-white mb-4">Find a Plan That Works For You</h2>
            <p className="text-lg text-gray-400 max-w-2xl mx-auto">
                Subscribe for the best value or buy credit packs as you go.
            </p>
        </div>
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {SUBSCRIPTION_PLANS.map(plan => (
            <SubscriptionCard key={plan.key} plan={plan} onStart={onStart} onCheckout={onCheckout} />
          ))}
        </div>
        
        <div className="text-center my-16">
          <h3 className="text-2xl font-bold text-white">Or, Buy a Credit Pack</h3>
          <p className="text-gray-400">One-time purchases for specific needs. Credits never expire.</p>
        </div>

        <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
            {CREDIT_PACKS.map(pack => (
              <CreditPackCard key={pack.key} pack={pack} onCheckout={onCheckout} />
            ))}
        </div>
      </div>
    </section>
  );
};

export const Pricing = React.memo(PricingComponent);