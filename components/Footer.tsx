
import React from 'react';
import { subscribeEmail } from '../services/apiService';

const FooterComponent: React.FC = () => {
  return (
    <footer className="bg-gray-900/50 border-t border-gray-800">
      <div className="container mx-auto px-6 py-8">
        <div className="flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="text-center md:text-left">
            <p className="text-sm text-gray-400">
              &copy; {new Date().getFullYear()} Your Image Pro. All Rights Reserved.
            </p>
            <div className="mt-2 text-sm text-gray-500 space-x-4">
              <a href="#" className="hover:text-gray-300 transition-colors">Terms of Service</a>
              <a href="#" className="hover:text-gray-300 transition-colors">Privacy Policy</a>
            </div>
          </div>
          <div className="w-full max-w-sm">
              <p className="font-semibold text-white mb-2 text-center md:text-left">Stay Updated</p>
              <form onSubmit={async (e) => { 
                  e.preventDefault(); 
                  const form = e.target as HTMLFormElement;
                  const input = form.elements[0] as HTMLInputElement;
                  const email = input.value;
                  try {
                    await subscribeEmail(email);
                    alert(`Thank you for subscribing, ${email}! You're on the list for updates.`);
                    form.reset();
                  } catch (error) {
                    alert(`Could not subscribe: ${(error as Error).message}`);
                  }
              }}>
                  <div className="flex">
                      <input type="email" placeholder="you@example.com" className="bg-gray-800 border border-gray-700 rounded-l-lg px-3 py-2 w-full text-sm focus:outline-none focus:ring-2 focus:ring-fuchsia-500" required />
                      <button type="submit" className="bg-fuchsia-500 text-white px-4 rounded-r-lg font-semibold text-sm hover:bg-fuchsia-600 transition-colors">Subscribe</button>
                  </div>
                  <p className="text-xs text-gray-500 mt-2 text-center md:text-left">Get news about new styles and features.</p>
              </form>
          </div>
        </div>
      </div>
    </footer>
  );
};

export const Footer = React.memo(FooterComponent);