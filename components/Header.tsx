
import React from 'react';
import { LeafIcon } from './icons';

const Header: React.FC = () => {
  return (
    <header className="bg-white shadow-sm">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-center h-20">
            <div className="flex items-center space-x-3">
                <LeafIcon className="h-8 w-8 text-green-600" />
                <span className="text-3xl font-bold text-gray-800 tracking-tight">FoodSnap</span>
            </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
