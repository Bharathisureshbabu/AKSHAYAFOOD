import React, { useState, useEffect, useRef } from 'react';
import { 
  Bell, 
  CheckCircle, 
  Clock, 
  MapPin, 
  Phone, 
  User, 
  Package,
  Truck,
  X,
  RefreshCw,
  AlertCircle,
  DollarSign
} from 'lucide-react';
import { Order, OrderStatus, OrderMode } from '../types';
import { io, Socket } from 'socket.io-client';

interface AdminDashboardProps {}

export default function AdminDashboard({}: AdminDashboardProps) {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [socket, setSocket] = useState<Socket | null>(null);
  const [stats, setStats] = useState({
    pending: 0,
    accepted: 0,
    ready: 0,
    delivered: 0,
    totalRevenue: 0
  });
  
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Initialize socket connection and audio
  useEffect(() => {
    const socketConnection = io('http://localhost:3001');
    setSocket(socketConnection);

    // Create audio element for beep sound
    audioRef.current = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBSuBzvLZiTYIG2m98OScTgwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWT');
    
    // Admin login
    socketConnection.emit('admin-login');

    // Listen for new orders
    socketConnection.on('new-order', (order: Order) => {
      setOrders(prev => [order, ...prev]);
      // Play beep sound for new orders
      if (audioRef.current) {
        audioRef.current.play().catch(console.error);
      }
      // Show browser notification
      if (Notification.permission === 'granted') {
        new Notification('New Order Received!', {
          body: `Order ${order.orderCode} - ₹${order.totalAmount}`,
          icon: '/favicon.ico'
        });
      }
    });

    // Listen for order status updates
    socketConnection.on('order-status-updated', (updatedOrder: Order) => {
      setOrders(prev => prev.map(order => 
        order.id === updatedOrder.id ? updatedOrder : order
      ));
    });

    // Request notification permission
    if (Notification.permission === 'default') {
      Notification.requestPermission();
    }

    return () => {
      socketConnection.disconnect();
    };
  }, []);

  // Fetch orders on component mount
  useEffect(() => {
    fetchOrders();
  }, []);

  // Calculate stats whenever orders change
  useEffect(() => {
    const newStats = orders.reduce((acc, order) => {
      switch (order.status) {
        case OrderStatus.PLACED:
          acc.pending++;
          break;
        case OrderStatus.ACCEPTED:
        case OrderStatus.COOKED:
        case OrderStatus.PACKED:
          acc.accepted++;
          break;
        case OrderStatus.READY:
        case OrderStatus.OUT_FOR_DELIVERY:
          acc.ready++;
          break;
        case OrderStatus.DELIVERED:
          acc.delivered++;
          acc.totalRevenue += order.totalAmount;
          break;
      }
      return acc;
    }, { pending: 0, accepted: 0, ready: 0, delivered: 0, totalRevenue: 0 });
    
    setStats(newStats);
  }, [orders]);

  const fetchOrders = async () => {
    try {
      const response = await fetch('http://localhost:3001/api/orders');
      const data = await response.json();
      setOrders(data);
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateOrderStatus = async (orderId: number, status: OrderStatus) => {
    try {
      const response = await fetch(`http://localhost:3001/api/orders/${orderId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status }),
      });

      if (response.ok) {
        const updatedOrder = await response.json();
        setOrders(prev => prev.map(order => 
          order.id === orderId ? updatedOrder.order : order
        ));
      }
    } catch (error) {
      console.error('Error updating order status:', error);
    }
  };

  const acceptOrder = (orderId: number) => {
    if (socket) {
      socket.emit('accept-order', orderId);
    }
    updateOrderStatus(orderId, OrderStatus.ACCEPTED);
  };

  const getStatusColor = (status: OrderStatus) => {
    switch (status) {
      case OrderStatus.PLACED: return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case OrderStatus.ACCEPTED: return 'bg-blue-100 text-blue-800 border-blue-200';
      case OrderStatus.COOKED: return 'bg-purple-100 text-purple-800 border-purple-200';
      case OrderStatus.PACKED: return 'bg-indigo-100 text-indigo-800 border-indigo-200';
      case OrderStatus.READY: return 'bg-green-100 text-green-800 border-green-200';
      case OrderStatus.OUT_FOR_DELIVERY: return 'bg-orange-100 text-orange-800 border-orange-200';
      case OrderStatus.DELIVERED: return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case OrderStatus.CANCELLED: return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getNextStatus = (currentStatus: OrderStatus): OrderStatus | null => {
    switch (currentStatus) {
      case OrderStatus.PLACED: return OrderStatus.ACCEPTED;
      case OrderStatus.ACCEPTED: return OrderStatus.COOKED;
      case OrderStatus.COOKED: return OrderStatus.PACKED;
      case OrderStatus.PACKED: return OrderStatus.READY;
      case OrderStatus.READY: return OrderStatus.OUT_FOR_DELIVERY;
      case OrderStatus.OUT_FOR_DELIVERY: return OrderStatus.DELIVERED;
      default: return null;
    }
  };

  const getStatusIcon = (status: OrderStatus) => {
    switch (status) {
      case OrderStatus.PLACED: return <AlertCircle className="w-4 h-4" />;
      case OrderStatus.ACCEPTED: return <CheckCircle className="w-4 h-4" />;
      case OrderStatus.COOKED: return <Package className="w-4 h-4" />;
      case OrderStatus.PACKED: return <Package className="w-4 h-4" />;
      case OrderStatus.READY: return <Bell className="w-4 h-4" />;
      case OrderStatus.OUT_FOR_DELIVERY: return <Truck className="w-4 h-4" />;
      case OrderStatus.DELIVERED: return <CheckCircle className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex items-center space-x-2">
          <RefreshCw className="w-6 h-6 animate-spin text-orange-500" />
          <span className="text-lg font-medium text-gray-700">Loading orders...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-red-500 rounded-full flex items-center justify-center shadow-lg">
                <span className="text-white font-bold text-xl">A</span>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Akshaya Foods</h1>
                <p className="text-sm text-gray-600">Admin Dashboard</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <button
                onClick={fetchOrders}
                className="flex items-center space-x-2 px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg font-medium transition-colors"
              >
                <RefreshCw className="w-4 h-4" />
                <span>Refresh</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Stats Cards */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm p-6 border-l-4 border-yellow-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Pending Orders</p>
                <p className="text-2xl font-bold text-gray-900">{stats.pending}</p>
              </div>
              <AlertCircle className="w-8 h-8 text-yellow-500" />
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-sm p-6 border-l-4 border-blue-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">In Progress</p>
                <p className="text-2xl font-bold text-gray-900">{stats.accepted}</p>
              </div>
              <Clock className="w-8 h-8 text-blue-500" />
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-sm p-6 border-l-4 border-green-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Ready/Out</p>
                <p className="text-2xl font-bold text-gray-900">{stats.ready}</p>
              </div>
              <Package className="w-8 h-8 text-green-500" />
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-sm p-6 border-l-4 border-emerald-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Completed</p>
                <p className="text-2xl font-bold text-gray-900">{stats.delivered}</p>
              </div>
              <CheckCircle className="w-8 h-8 text-emerald-500" />
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-sm p-6 border-l-4 border-purple-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Revenue</p>
                <p className="text-2xl font-bold text-gray-900">₹{stats.totalRevenue}</p>
              </div>
              <DollarSign className="w-8 h-8 text-purple-500" />
            </div>
          </div>
        </div>

        {/* Orders List */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-xl font-bold text-gray-900">Recent Orders</h2>
          </div>
          
          <div className="divide-y divide-gray-200">
            {orders.length === 0 ? (
              <div className="p-12 text-center">
                <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500 text-lg font-medium">No orders yet</p>
                <p className="text-gray-400 text-sm mt-1">Orders will appear here when customers place them</p>
              </div>
            ) : (
              orders.map((order) => (
                <div key={order.id} className="p-6 hover:bg-gray-50 transition-colors">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-4 mb-4">
                        <div className="flex items-center space-x-2">
                          <span className="font-mono font-bold text-lg text-gray-900">
                            {order.orderCode}
                          </span>
                          <span className={`inline-flex items-center space-x-1 px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(order.status)}`}>
                            {getStatusIcon(order.status)}
                            <span>{order.status.replace('_', ' ')}</span>
                          </span>
                        </div>
                        
                        <div className="flex items-center space-x-4 text-sm text-gray-600">
                          <div className="flex items-center space-x-1">
                            {order.mode === OrderMode.DELIVERY ? (
                              <MapPin className="w-4 h-4" />
                            ) : (
                              <Phone className="w-4 h-4" />
                            )}
                            <span>{order.mode}</span>
                          </div>
                          
                          <div className="flex items-center space-x-1">
                            <Clock className="w-4 h-4" />
                            <span>{new Date(order.createdAt || '').toLocaleTimeString()}</span>
                          </div>
                        </div>
                      </div>

                      {/* Customer Info */}
                      <div className="flex items-center space-x-2 mb-4">
                        <User className="w-4 h-4 text-gray-400" />
                        <span className="text-sm text-gray-600">
                          {order.customer?.name} - {order.customer?.phone}
                        </span>
                      </div>

                      {/* Order Items */}
                      <div className="mb-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                          {order.items.map((item, index) => (
                            <div key={index} className="flex justify-between items-center text-sm bg-gray-50 rounded-lg p-3">
                              <span className="font-medium">{item.menuItem.name}</span>
                              <span className="text-gray-600">
                                {item.qty} × ₹{item.menuItem.price} = ₹{(item.qty * item.menuItem.price).toFixed(2)}
                              </span>
                            </div>
                          ))}
                        </div>
                        
                        <div className="mt-3 pt-3 border-t border-gray-200 flex justify-between items-center">
                          <span className="font-bold text-lg">Total Amount</span>
                          <span className="font-bold text-xl text-orange-600">₹{order.totalAmount.toFixed(2)}</span>
                        </div>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="ml-6 flex flex-col space-y-2">
                      {order.status === OrderStatus.PLACED && (
                        <>
                          <button
                            onClick={() => acceptOrder(order.id!)}
                            className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg font-medium transition-colors flex items-center space-x-2"
                          >
                            <CheckCircle className="w-4 h-4" />
                            <span>Accept Order</span>
                          </button>
                          <button
                            onClick={() => updateOrderStatus(order.id!, OrderStatus.CANCELLED)}
                            className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg font-medium transition-colors flex items-center space-x-2"
                          >
                            <X className="w-4 h-4" />
                            <span>Cancel</span>
                          </button>
                        </>
                      )}
                      
                      {order.status !== OrderStatus.PLACED && 
                       order.status !== OrderStatus.DELIVERED && 
                       order.status !== OrderStatus.CANCELLED && (
                        <button
                          onClick={() => {
                            const nextStatus = getNextStatus(order.status);
                            if (nextStatus) {
                              updateOrderStatus(order.id!, nextStatus);
                            }
                          }}
                          className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-medium transition-colors flex items-center space-x-2"
                        >
                          <RefreshCw className="w-4 h-4" />
                          <span>Next Stage</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}