import { useState, useCallback } from 'react';
import { CartItem, MenuItem } from '../types';

export function useCart() {
  const [items, setItems] = useState<CartItem[]>([]);

  const addItem = useCallback((menuItem: MenuItem) => {
    setItems(prev => {
      const existingItem = prev.find(item => item.menuItem.id === menuItem.id);
      
      if (existingItem) {
        return prev.map(item =>
          item.menuItem.id === menuItem.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      
      return [...prev, { menuItem, quantity: 1 }];
    });
  }, []);

  const removeItem = useCallback((menuItemId: number) => {
    setItems(prev => {
      const existingItem = prev.find(item => item.menuItem.id === menuItemId);
      
      if (!existingItem) return prev;
      
      if (existingItem.quantity === 1) {
        return prev.filter(item => item.menuItem.id !== menuItemId);
      }
      
      return prev.map(item =>
        item.menuItem.id === menuItemId
          ? { ...item, quantity: item.quantity - 1 }
          : item
      );
    });
  }, []);

  const updateQuantity = useCallback((menuItemId: number, quantity: number) => {
    if (quantity <= 0) {
      setItems(prev => prev.filter(item => item.menuItem.id !== menuItemId));
      return;
    }
    
    setItems(prev =>
      prev.map(item =>
        item.menuItem.id === menuItemId
          ? { ...item, quantity }
          : item
      )
    );
  }, []);

  const removeFromCart = useCallback((menuItemId: number) => {
    setItems(prev => prev.filter(item => item.menuItem.id !== menuItemId));
  }, []);

  const clearCart = useCallback(() => {
    setItems([]);
  }, []);

  const getItemQuantity = useCallback((menuItemId: number) => {
    const item = items.find(item => item.menuItem.id === menuItemId);
    return item ? item.quantity : 0;
  }, [items]);

  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
  const totalAmount = items.reduce((sum, item) => sum + (item.menuItem.price * item.quantity), 0);

  return {
    items,
    addItem,
    removeItem,
    updateQuantity,
    removeFromCart,
    clearCart,
    getItemQuantity,
    totalItems,
    totalAmount
  };
}