
import React from 'react';
import { Button } from './common/Button';

interface HeroProps {
  onStart: () => void;
}

const galleryImages = [
  'https://images.unsplash.com/photo-1531123414780-f74242c2b052?q=80&w=400&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?q=80&w=400&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=400&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1552058544-f2b08422138a?q=80&w=400&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1589156280159-27698a70f29e?q=80&w=400&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1554151228-14d9def656e4?q=80&w=400&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=400&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?q=80&w=400&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1566492031773-4f4e44671857?q=80&w=400&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1593104547489-5cfb3839a3b5?q=80&w=400&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1610216705422-caa3fcb6d158?q=80&w=400&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1619946794135-5bc917a27793?q=80&w=400&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1509967419530-da38b4704bc6?q=80&w=400&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1600486913747-55e5470d6f40?q=80&w=400&auto=format&fit=crop',
];

// Duplicate for seamless scroll
const gallery1 = [...galleryImages, ...galleryImages];
const gallery2 = [...[...galleryImages].reverse(), ...[...galleryImages].reverse()];


const GalleryRow = ({ images }: { images: string[] }) => (
  <div className="flex w-max scrolling-wrapper">
    {images.map((src, index) => (
      <div key={index} className="w-48 h-64 mx-2 flex-shrink-0">
        <img src={src} alt={`Generated example ${index + 1}`} className="w-full h-full object-cover rounded-2xl shadow-lg shadow-black/30" loading="lazy" />
      </div>
    ))}
  </div>
);

export const Hero: React.FC<HeroProps> = ({ onStart }) => {
  return (
    <section className="relative pt-24 pb-12 md:pt-32 md:pb-20 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-[#0f0f10] via-transparent to-[#0f0f10] z-10"></div>
      <div className="absolute inset-0 opacity-50">
        <div className="absolute top-0 left-0 w-full h-full transform-gpu -skew-y-6 scale-125 space-y-4">
          <GalleryRow images={gallery1} />
          <div className="ml-[-10rem]">
            <GalleryRow images={gallery2} />
          </div>
        </div>
      </div>
      
      <div className="container mx-auto px-6 relative z-10">
        <div className="max-w-3xl mx-auto text-center">
          <h1 className="text-4xl md:text-6xl font-black text-white leading-tight tracking-tighter mb-4">
            Your Image Pro: AI Design & Photo <span className="text-fuchsia-500">Toolkit.</span>
          </h1>
          <p className="text-lg md:text-xl text-gray-300 mx-auto mb-8">
            Generate stunning flyers, ads, headshots, and marketing assets in seconds with Your Image Pro. The all-in-one AI solution for designers, photographers, and creators.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button onClick={onStart} className="w-full sm:w-auto text-lg py-4">
              Start Creating Now
            </Button>
          </div>
           <p className="text-xs text-gray-400 mt-6 max-w-md mx-auto">
            Upload your assets, describe your vision, and unlock unlimited creative potential.
          </p>
        </div>
      </div>
    </section>
  );
};