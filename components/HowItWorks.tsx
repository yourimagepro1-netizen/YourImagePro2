import React from 'react';

const Step: React.FC<{ number: number; title: string; description: string }> = ({ number, title, description }) => (
  <div className="flex items-start space-x-4">
    <div className="flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-fuchsia-500/20 text-fuchsia-400 font-bold text-xl border-2 border-fuchsia-500">
      {number}
    </div>
    <div>
      <h3 className="text-xl font-semibold text-white">{title}</h3>
      <p className="text-gray-400 mt-1">{description}</p>
    </div>
  </div>
);

const HowItWorksComponent: React.FC = () => {
  return (
    <section id="how-it-works" className="py-20">
      <div className="container mx-auto px-6 text-center">
        <h2 className="text-3xl md:text-4xl font-black text-white mb-4">Your Journey to the Perfect Image</h2>
        <p className="text-lg text-gray-400 max-w-2xl mx-auto mb-12">
          Generate your professional media in a few simple steps.
        </p>
        <div className="max-w-3xl mx-auto text-left grid grid-cols-1 md:grid-cols-1 gap-8">
          <Step number={1} title="Get Your Credits" description="Sign up instantly with your email to receive free generation credits to get started." />
          <Step number={2} title="Upload & Enhance Photo" description="Choose a clear photo. Use our powerful AI Photographer's Toolkit to apply one-click color correction and airbrushing for a perfect base image—it's completely free!" />
          <Step number={3} title="Define Your Creation" description="Browse our library of professional styles or describe your own custom image." />
          <Step number={4} title="Generate Your Media" description="Our AI creates a unique, high-resolution image based on your photo and chosen style or prompt." />
          <Step number={5} title="Download, Edit & Deploy" description="Download your HD creation. Give it a final polish with the AI Toolkit's free airbrush and color controls. Your professional new image is ready to impress!" />
        </div>
        <div className="mt-12 bg-cyan-900/30 border border-cyan-700 text-cyan-300 px-6 py-3 rounded-lg max-w-3xl mx-auto text-sm">
          <strong>Pro Tip:</strong> Use the AI Photographer's Toolkit to retouch your source photo for even better results. A clear photo with natural light is always a great starting point.
        </div>
      </div>
    </section>
  );
};

export const HowItWorks = React.memo(HowItWorksComponent);