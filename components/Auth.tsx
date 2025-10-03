

import React, { useState, useEffect, useRef } from 'react';
import { UserState } from '../types';
import { Button } from './common/Button';

// This is required for TypeScript to recognize the `google` object from the script tag
declare const google: any;

// Define the interface for the decoded JWT from Google
interface GoogleJwtPayload {
  email: string;
  email_verified: boolean;
  name: string;
  picture: string;
  sub: string;
}

// A simple function to decode the JWT payload from Google Sign-In
const decodeJwt = (token: string): GoogleJwtPayload => {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));
    return JSON.parse(jsonPayload);
  } catch (e) {
    console.error("Error decoding JWT", e);
    throw new Error("Invalid Google token");
  }
};

interface AuthProps {
  onLogin: (user: UserState) => void;
}

const Auth: React.FC<AuthProps> = ({ onLogin }) => {
  const [error, setError] = useState('');
  const googleButtonRef = useRef<HTMLDivElement>(null);

  const handleGoogleCredentialResponse = (response: any) => {
    try {
      const payload = decodeJwt(response.credential);
      if (!payload.email_verified) {
          setError("Your Google account email is not verified. Please use a verified account.");
          return;
      }

      const userEmail = payload.email;
      const existingUserJSON = localStorage.getItem(`yourImageProUser_${userEmail}`);

      // If the user already exists, let them log in without checks.
      if (existingUserJSON) {
          const existingUser = JSON.parse(existingUserJSON);
          onLogin(existingUser);
          return;
      }
      
      // New User Logic: Check device account limit before creating a new user.
      const usedAccountsJSON = localStorage.getItem('yourImageProUsedAccounts');
      const usedAccounts: string[] = usedAccountsJSON ? JSON.parse(usedAccountsJSON) : [];

      if (usedAccounts.length >= 3 && !usedAccounts.includes(userEmail)) {
        setError("This device has reached the maximum of 3 new accounts. To prevent abuse of the free credit system, you cannot create another account on this device. Please sign in using one of the existing accounts.");
        return;
      }

      let startingCredits = 20;
      let wasReferred = false;
      const referrerEmail = sessionStorage.getItem('referralCode');

      if (referrerEmail && referrerEmail !== userEmail) {
          const referrerUserJSON = localStorage.getItem(`yourImageProUser_${referrerEmail}`);
          if (referrerUserJSON) {
              const referrerUser: UserState = JSON.parse(referrerUserJSON);
              referrerUser.credits += 2;
              localStorage.setItem(`yourImageProUser_${referrerUser.email}`, JSON.stringify(referrerUser));
              startingCredits += 2;
              wasReferred = true;
              sessionStorage.removeItem('referralCode');
          }
      }

      const newUser: UserState = { 
          email: userEmail, 
          name: payload.name,
          picture: payload.picture,
          credits: startingCredits, 
          plan: 'free', 
          justReferred: wasReferred, 
          adsWatchedToday: 0,
          lastAdWatchDate: new Date().toISOString().split('T')[0]
      };
      
      // Add the new user to the device's used accounts list
      if (!usedAccounts.includes(userEmail)) {
        usedAccounts.push(userEmail);
        localStorage.setItem('yourImageProUsedAccounts', JSON.stringify(usedAccounts));
      }
      
      onLogin(newUser);

    } catch(e) {
      console.error("Google Sign-In failed", e);
      setError("Could not sign in with Google. Please try again.");
    }
  };

  useEffect(() => {
    if (typeof google === 'undefined' || !google.accounts) {
      setError("Google Sign-In is unavailable. Please try refreshing the page.");
      return;
    }

    google.accounts.id.initialize({
      client_id: process.env.GOOGLE_CLIENT_ID!,
      callback: handleGoogleCredentialResponse,
    });
    
    if (googleButtonRef.current) {
        google.accounts.id.renderButton(
          googleButtonRef.current,
          { theme: "outline", size: "large", type: "standard", shape: "rectangular", width: "350" }
        );
    }
  }, []);

  const handleTestLogin = () => {
    const testUser: UserState = {
      email: 'test.user@example.com',
      name: 'Test User',
      credits: 9999,
      plan: 'agency',
      adsWatchedToday: 0,
      lastAdWatchDate: new Date().toISOString().split('T')[0],
      picture: 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"%3E%3Crect width="100" height="100" fill="%232d3748"/%3E%3Ctext x="50" y="55" font-family="Arial" font-size="40" fill="white" text-anchor="middle" dominant-baseline="middle"%3ETU%3C/text%3E%3C/svg%3E',
    };
    onLogin(testUser);
  };

  return (
    <div className="container mx-auto px-6 py-20 flex flex-col items-center justify-center min-h-[60vh]">
      <div className="max-w-md w-full text-center bg-gray-900/50 p-8 rounded-2xl border border-gray-800">
        <h2 className="text-2xl font-bold text-white mb-2">Create Your Account & Get Free Credits</h2>
        <p className="text-gray-400 mb-6 text-sm">Sign up or sign in instantly with Google to get 20 free credits. This is the only way to sign in, ensuring every user is real and verified.</p>
        {error && <p className="text-red-400 text-sm mb-4 bg-red-900/20 p-3 rounded-lg">{error}</p>}
        <div ref={googleButtonRef} className="flex justify-center my-4"></div>
        <p className="text-xs text-gray-500 mt-4">We use Google to prevent abuse and ensure a high-quality experience for everyone.</p>

        <p className="text-xs text-gray-500 mt-6">By continuing, you agree to our <a href="#" className="underline hover:text-white transition-colors">Terms of Service</a> and <a href="#" className="underline hover:text-white transition-colors">Privacy Policy</a>.</p>

        <div className="mt-6 border-t border-gray-700 pt-4">
            <Button 
                onClick={handleTestLogin} 
                variant="custom" 
                className="w-full bg-yellow-500 hover:bg-yellow-600 focus:ring-yellow-500 text-black font-bold"
            >
                Sign in as Test User
            </Button>
            <p className="text-xs text-gray-500 mt-2">For development and testing purposes.</p>
        </div>
      </div>
    </div>
  );
};

export default Auth;