
import React from 'react';
import { UserState } from '../types';
import { Button } from './common/Button';
import { CameraIcon, ShareIcon } from './common/Icons';

interface HeaderProps {
  user: UserState | null;
  onLogout: () => void;
  onSignIn: () => void;
  onNavigateToHistory: () => void;
  onManageSubscription: () => void;
}

const HeaderComponent: React.FC<HeaderProps> = ({ user, onLogout, onSignIn, onNavigateToHistory, onManageSubscription }) => {

  const handleShareApp = async () => {
    if (!user || user.email === 'guest') return;

    const referralLink = `${window.location.origin}?ref=${encodeURIComponent(user.email)}`;
    const shareData = {
        title: 'Your Image Pro',
        text: 'Create stunning AI designs and photos in seconds with Your Image Pro! Sign up with my link and we both get 2 free credits.',
        url: referralLink,
    };
    try {
        if (navigator.share) {
            await navigator.share(shareData);
        } else {
            await navigator.clipboard.writeText(shareData.url);
            alert('Referral link copied to clipboard! Share it with your friends.');
        }
    } catch (err) {
        console.error('Error sharing:', err);
        alert(`Could not share automatically. Please copy your link manually: ${referralLink}`);
    }
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-[#0f0f10]/80 backdrop-blur-sm border-b border-gray-900">
      <div className="container mx-auto px-6 py-4 flex justify-between items-center">
        <a href="#" onClick={(e) => { e.preventDefault(); window.location.reload(); }} className="flex items-center gap-3 text-3xl font-black tracking-tighter">
          <CameraIcon className="h-9 w-9 text-fuchsia-500" />
          <span>
            <span className="text-white">YourImage</span>
            <span className="text-fuchsia-500">Pro</span>
          </span>
        </a>
        {user ? (
          <div className="flex items-center space-x-2 sm:space-x-4">
            <nav className="hidden md:flex items-center space-x-6 text-sm font-medium text-gray-300">
              {user.email !== 'guest' && <button onClick={onNavigateToHistory} className="hover:text-fuchsia-400 transition-colors">My Creations</button>}
              <a href="#how-it-works" className="hover:text-fuchsia-400 transition-colors">How It Works</a>
              <a href="#pricing" className="hover:text-fuchsia-400 transition-colors">Pricing</a>
            </nav>
            {user.email !== 'guest' && (
                <button onClick={handleShareApp} className="p-2 rounded-full text-gray-400 hover:text-white hover:bg-gray-800 transition-colors hidden md:block" aria-label="Invite & Earn Credits">
                  <ShareIcon className="h-5 w-5" />
                </button>
            )}
            {user.email !== 'guest' && user.plan !== 'free' && (
              <span className="hidden sm:inline-block bg-fuchsia-500/20 text-fuchsia-400 text-xs font-bold px-2 py-1 rounded-full capitalize">
                  {user.plan} Plan
              </span>
            )}
             {user.email !== 'guest' && user.plan !== 'free' && user.stripeCustomerId && (
                 <Button onClick={onManageSubscription} variant="secondary" className="px-3 py-1.5 text-sm !bg-gray-700 hover:!bg-gray-600 focus:ring-gray-500 hidden sm:block">
                    Manage Subscription
                </Button>
            )}
            <div className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-1.5 text-sm">
              <span className="font-semibold text-white">{user.credits}</span>
              <span className="text-gray-400"> Credits</span>
            </div>
            {user.email !== 'guest' ? (
                <Button onClick={onLogout} variant="secondary" className="px-4 py-1.5 text-sm">Sign Out</Button>
            ) : (
                <Button onClick={onSignIn} variant="primary" className="px-4 py-1.5 text-sm">Sign In</Button>
            )}
          </div>
        ) : (
           <div className="h-9 w-24 animate-pulse bg-gray-800 rounded-lg"></div>
        )}
      </div>
    </header>
  );
};

export const Header = React.memo(HeaderComponent);