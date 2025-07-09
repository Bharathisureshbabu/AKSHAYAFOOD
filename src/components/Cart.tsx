import React from 'react';
import { X, ShoppingBag, Minus, Plus, Trash2 } from 'lucide-react';
import { CartItem, OrderMode } from '../types';

interface CartProps {
  isOpen: boolean;
  onClose: () => void;
  items: CartItem[];
  onUpdateQuantity: (itemId: number, quantity: number) => void;
  onRemoveItem: (itemId: number) => void;
  onCheckout: (mode: OrderMode) => void;
}

export default function Cart({ 
  isOpen, 
  onClose, 
  items, 
  onUpdateQuantity, 
  onRemoveItem, 
  onCheckout 
}: CartProps) {
  const total = items.reduce((sum, item) => sum + (item.menuItem.price * item.quantity), 0);
  
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-end">
      <div className="bg-white w-full max-w-md h-full overflow-y-auto">
        <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between shadow-sm">
          <h2 className="text-xl font-bold flex items-center space-x-2">
            <ShoppingBag className="w-6 h-6 text-orange-500" />
            <span>Your Order</span>
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6">
          {items.length === 0 ? (
            <div className="text-center py-16">
              <ShoppingBag className="w-20 h-20 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 text-lg font-medium">Your cart is empty</p>
              <p className="text-sm text-gray-400 mt-2">Add some delicious items to get started</p>
            </div>
          ) : (
            <>
              <div className="space-y-4 mb-6">
                {items.map((item) => (
                  <div key={item.menuItem.id} className="flex items-center space-x-4 bg-gray-50 rounded-xl p-4">
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900">{item.menuItem.name}</h3>
                      <p className="text-sm text-gray-600">₹{item.menuItem.price} each</p>
                      <p className="text-sm font-medium text-orange-600">
                        Subtotal: ₹{(item.menuItem.price * item.quantity).toFixed(2)}
                      </p>
                    </div>
                    
                    <div className="flex items-center space-x-3">
                      <button
                        onClick={() => onUpdateQuantity(item.menuItem.id, item.quantity - 1)}
                        className="w-8 h-8 bg-gray-200 hover:bg-gray-300 rounded-full flex items-center justify-center transition-colors"
                      >
                        <Minus className="w-4 h-4" />
                      </button>
                      
                      <span className="font-bold text-lg min-w-[2rem] text-center">{item.quantity}</span>
                      
                      <button
                        onClick={() => onUpdateQuantity(item.menuItem.id, item.quantity + 1)}
                        className="w-8 h-8 bg-orange-500 hover:bg-orange-600 text-white rounded-full flex items-center justify-center transition-colors"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                    
                    <button
                      onClick={() => onRemoveItem(item.menuItem.id)}
                      className="text-red-500 hover:text-red-700 p-1 hover:bg-red-50 rounded-full transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>

              <div className="border-t pt-6 mb-6">
                <div className="flex justify-between items-center text-xl font-bold">
                  <span>Total Amount</span>
                  <span className="text-orange-600">₹{total.toFixed(2)}</span>
                </div>
                <p className="text-sm text-gray-500 mt-1">
                  {items.reduce((sum, item) => sum + item.quantity, 0)} items in cart
                </p>
              </div>

              <div className="space-y-3">
                <button
                  onClick={() => onCheckout(OrderMode.TAKEAWAY)}
                  className="w-full bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white py-4 rounded-xl font-semibold transition-all duration-200 shadow-lg hover:shadow-xl"
                >
                  Order for Takeaway
                </button>
                
                <button
                  onClick={() => onCheckout(OrderMode.DELIVERY)}
                  className="w-full bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white py-4 rounded-xl font-semibold transition-all duration-200 shadow-lg hover:shadow-xl"
                >
                  Order for Delivery
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}