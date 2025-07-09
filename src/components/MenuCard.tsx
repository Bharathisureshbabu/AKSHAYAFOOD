import React from 'react';
import { Plus, Minus, Star } from 'lucide-react';
import { MenuItem } from '../types';

interface MenuCardProps {
  item: MenuItem;
  quantity: number;
  onAdd: (item: MenuItem) => void;
  onRemove: (item: MenuItem) => void;
}

export default function MenuCard({ item, quantity, onAdd, onRemove }: MenuCardProps) {
  return (
    <div className="bg-white rounded-xl shadow-sm border hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 overflow-hidden">
      <div className="aspect-video bg-gradient-to-br from-orange-100 to-orange-200 relative overflow-hidden">
        {item.image ? (
          <img 
            src={item.image} 
            alt={item.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <div className="text-5xl">🍽️</div>
          </div>
        )}
        <div className="absolute top-2 right-2 bg-white bg-opacity-90 px-2 py-1 rounded-full flex items-center space-x-1">
          <Star className="w-3 h-3 text-yellow-500 fill-current" />
          <span className="text-xs font-medium">4.5</span>
        </div>
      </div>
      
      <div className="p-4">
        <div className="flex justify-between items-start mb-2">
          <h3 className="font-bold text-gray-900 text-lg leading-tight">{item.name}</h3>
          <span className="text-xl font-bold text-orange-600 bg-orange-50 px-3 py-1 rounded-full">
            ₹{item.price}
          </span>
        </div>
        
        {item.description && (
          <p className="text-gray-600 text-sm mb-4 line-clamp-2 leading-relaxed">
            {item.description}
          </p>
        )}
        
        <div className="flex items-center justify-between">
          {quantity === 0 ? (
            <button
              onClick={() => onAdd(item)}
              className="flex-1 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white px-4 py-3 rounded-lg font-medium transition-all duration-200 flex items-center justify-center space-x-2 shadow-md hover:shadow-lg"
            >
              <Plus className="w-4 h-4" />
              <span>Add to Cart</span>
            </button>
          ) : (
            <div className="flex items-center space-x-3 flex-1">
              <button
                onClick={() => onRemove(item)}
                className="w-10 h-10 bg-gray-200 hover:bg-gray-300 rounded-full flex items-center justify-center transition-colors shadow-sm"
              >
                <Minus className="w-4 h-4" />
              </button>
              
              <div className="flex-1 text-center">
                <span className="font-bold text-lg text-gray-900">{quantity}</span>
                <p className="text-xs text-gray-600">in cart</p>
              </div>
              
              <button
                onClick={() => onAdd(item)}
                className="w-10 h-10 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white rounded-full flex items-center justify-center transition-all duration-200 shadow-md hover:shadow-lg"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}