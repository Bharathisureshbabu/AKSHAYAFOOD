import React from 'react';
import { ShoppingCart, Phone, User } from 'lucide-react';

interface HeaderProps {
  cartItemCount: number;
  onCartClick: () => void;
  customer?: { name: string; phone: string };
}

export default function Header({ cartItemCount, onCartClick, customer }: HeaderProps) {
  return (
    <header className="bg-white shadow-sm border-b sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-red-500 rounded-full flex items-center justify-center shadow-lg">
              <span className="text-white font-bold text-xl">A</span>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Akshaya Foods</h1>
              <p className="text-sm text-gray-600">Fresh & Delicious Indian Cuisine</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-6">
            {customer && (
              <div className="hidden sm:flex items-center space-x-3 bg-gray-50 px-4 py-2 rounded-full">
                <User className="w-4 h-4 text-gray-600" />
                <div className="text-sm">
                  <p className="font-medium text-gray-900">{customer.name}</p>
                  <p className="text-gray-600">{customer.phone}</p>
                </div>
              </div>
            )}
            
            <button
              onClick={onCartClick}
              className="relative p-3 bg-orange-500 hover:bg-orange-600 text-white rounded-full shadow-lg transition-all duration-200 transform hover:scale-105"
            >
              <ShoppingCart className="w-6 h-6" />
              {cartItemCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-6 h-6 flex items-center justify-center font-bold animate-pulse">
                  {cartItemCount}
                </span>
              )}
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}