import React from 'react';
import { FaceIcon, ZapIcon, SparklesIcon, UsersIcon } from './common/Icons';

const BenefitCard: React.FC<{ icon: React.ReactElement; title: string; description: string }> = ({ icon, title, description }) => (
  <div className="bg-gray-900/50 p-6 rounded-2xl border border-gray-800 text-center sm:text-left">
    <div className="text-fuchsia-500 mb-4 inline-block">{icon}</div>
    <h3 className="text-xl font-bold text-white mb-2">{title}</h3>
    <p className="text-gray-400">{description}</p>
  </div>
);

const BenefitsComponent: React.FC = () => {
  const benefits = [
    { icon: <FaceIcon className="h-8 w-8" />, title: 'Studio-Quality Results', description: 'Get professional, high-resolution imagery without the cost of a photoshoot.' },
    { icon: <ZapIcon className="h-8 w-8" />, title: 'Instant Turnaround', description: 'Generate dozens of creative assets in minutes, not days. Perfect for tight deadlines.' },
    { icon: <UsersIcon className="h-8 w-8" />, title: 'Brand Consistency', description: 'Create a cohesive look for your entire team or social media presence with consistent results.' },
    { icon: <SparklesIcon className="h-8 w-8" />, title: 'Endless Possibilities', description: 'From corporate headshots to marketing posters, create exactly what you need. Every image can be perfected with our free AI Toolkit, featuring powerful color correction and a flawless airbrush for that final professional touch.' },
  ];

  return (
    <section id="examples" className="py-20 bg-[#141416]">
      <div className="container mx-auto px-6">
        <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-black text-white mb-2">The Creator's Ultimate Tool</h2>
            <p className="text-lg text-gray-400 max-w-2xl mx-auto">
                Elevate your brand, streamline your workflow, and create without limits.
            </p>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {benefits.map((benefit, index) => (
            <BenefitCard key={index} {...benefit} />
          ))}
        </div>
      </div>
    </section>
  );
};

export const Benefits = React.memo(BenefitsComponent);