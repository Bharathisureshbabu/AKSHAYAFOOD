import React, { useState } from 'react';
import Header from './components/Header';
import MenuCard from './components/MenuCard';
import Cart from './components/Cart';
import PhoneAuth from './components/PhoneAuth';
import OrderConfirmation from './components/OrderConfirmation';
import AdminDashboard from './components/AdminDashboard';
import { useCart } from './hooks/useCart';
import { mockMenuItems } from './data/mockData';
import { OrderMode, Order, OrderItem } from './types';

type AppState = 'auth' | 'menu' | 'confirmation' | 'admin';

interface Customer {
  name: string;
  phone: string;
  address: string;
}

function App() {
  const [appState, setAppState] = useState<AppState>('auth');
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [currentOrder, setCurrentOrder] = useState<Order | null>(null);
  
  const {
    items,
    addItem,
    removeItem,
    updateQuantity,
    removeFromCart,
    clearCart,
    getItemQuantity,
    totalItems,
    totalAmount
  } = useCart();

  const handleAuthSuccess = (customerData: Customer) => {
    setCustomer(customerData);
    setAppState('menu');
  };

  const handleCheckout = async (mode: OrderMode) => {
    if (!customer || items.length === 0) return;

    const orderItems: OrderItem[] = items.map(item => ({
      menuItem: item.menuItem,
      menuItemId: item.menuItem.id,
      qty: item.quantity
    }));

    // Create customer first
    try {
      const customerResponse = await fetch('http://localhost:3001/api/auth/complete-profile', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          phone: customer.phone,
          name: customer.name,
          address: customer.address
        }),
      });

      const customerData = await customerResponse.json();
      
      if (customerData.success) {
        // Create order
        const orderResponse = await fetch('http://localhost:3001/api/orders', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            customerId: customerData.customer.id,
            mode,
            items: orderItems,
            totalAmount
          }),
        });

        const orderData = await orderResponse.json();
        
        if (orderData.success) {
          setCurrentOrder(orderData.order);
          setIsCartOpen(false);
          clearCart();
          setAppState('confirmation');
        }
      }
    } catch (error) {
      console.error('Error creating order:', error);
    }
  };

  const handleBackToMenu = () => {
    setAppState('menu');
    setCurrentOrder(null);
  };

  // Check if admin mode is requested
  if (window.location.pathname === '/admin' || appState === 'admin') {
    return <AdminDashboard />;
  }

  if (appState === 'auth') {
    return <PhoneAuth onAuthSuccess={handleAuthSuccess} />;
  }

  if (appState === 'confirmation' && currentOrder) {
    return <OrderConfirmation order={currentOrder} onBackToMenu={handleBackToMenu} />;
  }

  // Group menu items by category
  const categories = mockMenuItems.reduce((acc, item) => {
    const category = item.category || 'Other';
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(item);
    return acc;
  }, {} as Record<string, typeof mockMenuItems>);

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50">
      <Header 
        cartItemCount={totalItems}
        onCartClick={() => setIsCartOpen(true)}
        customer={customer || undefined}
      />

      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-12 text-center">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">Our Delicious Menu</h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Discover our authentic Indian cuisine, made with love and traditional recipes
          </p>
        </div>

        {Object.entries(categories).map(([category, categoryItems]) => (
          <div key={category} className="mb-16">
            <div className="flex items-center mb-8">
              <h3 className="text-3xl font-bold text-gray-800 mr-4">{category}</h3>
              <div className="flex-1 h-px bg-gradient-to-r from-orange-300 to-transparent"></div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
              {categoryItems.map((item) => (
                <MenuCard
                  key={item.id}
                  item={item}
                  quantity={getItemQuantity(item.id)}
                  onAdd={addItem}
                  onRemove={removeItem}
                />
              ))}
            </div>
          </div>
        ))}
      </main>

      <Cart
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        items={items}
        onUpdateQuantity={updateQuantity}
        onRemoveItem={removeFromCart}
        onCheckout={handleCheckout}
      />
    </div>
  );
}

export default App;