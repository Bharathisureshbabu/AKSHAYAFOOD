import React, { useState } from 'react';
import { CheckCircle, Clock, MapPin, Phone, CreditCard, QrCode, Copy, ExternalLink } from 'lucide-react';
import { Order, OrderMode } from '../types';

interface OrderConfirmationProps {
  order: Order;
  onBackToMenu: () => void;
}

export default function OrderConfirmation({ order, onBackToMenu }: OrderConfirmationProps) {
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'upi'>('cash');
  const [showUpiQr, setShowUpiQr] = useState(false);
  const [copied, setCopied] = useState(false);

  const estimatedTime = new Date(Date.now() + 45 * 60 * 1000);
  const upiId = "akshayafoods@ybl";

  const handleCopyUPI = () => {
    navigator.clipboard.writeText(upiId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 py-8">
      <div className="max-w-2xl mx-auto px-4">
        <div className="bg-white rounded-3xl shadow-2xl overflow-hidden">
          {/* Success Header */}
          <div className="bg-gradient-to-r from-green-500 to-emerald-500 text-white p-8 text-center">
            <CheckCircle className="w-20 h-20 mx-auto mb-4" />
            <h1 className="text-3xl font-bold mb-2">Order Placed Successfully!</h1>
            <p className="text-green-100 text-lg">
              Order Code: <span className="font-mono font-bold bg-green-600 px-3 py-1 rounded-full">{order.orderCode || 'AKF-20250108-0001'}</span>
            </p>
          </div>

          {/* Order Details */}
          <div className="p-8">
            <div className="grid md:grid-cols-2 gap-6 mb-8">
              <div className="flex items-center space-x-4 p-4 bg-blue-50 rounded-xl">
                <Clock className="w-6 h-6 text-blue-500" />
                <div>
                  <p className="text-sm text-gray-600 font-medium">Estimated Ready Time</p>
                  <p className="font-bold text-lg text-gray-900">{estimatedTime.toLocaleTimeString()}</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-4 p-4 bg-orange-50 rounded-xl">
                {order.mode === OrderMode.DELIVERY ? (
                  <MapPin className="w-6 h-6 text-orange-500" />
                ) : (
                  <Phone className="w-6 h-6 text-orange-500" />
                )}
                <div>
                  <p className="text-sm text-gray-600 font-medium">
                    {order.mode === OrderMode.DELIVERY ? 'Delivery' : 'Takeaway'}
                  </p>
                  <p className="font-bold text-lg text-gray-900">
                    {order.mode === OrderMode.DELIVERY ? 'To your address' : 'Pickup at store'}
                  </p>
                </div>
              </div>
            </div>

            {/* Order Items */}
            <div className="border-t pt-8 mb-8">
              <h3 className="font-bold text-xl mb-6 text-gray-900">Order Summary</h3>
              <div className="space-y-4">
                {order.items.map((item, index) => (
                  <div key={index} className="flex justify-between items-center p-4 bg-gray-50 rounded-xl">
                    <div>
                      <span className="font-semibold text-gray-900">{item.menuItem.name}</span>
                      <span className="text-orange-600 font-medium ml-2">× {item.qty}</span>
                    </div>
                    <span className="font-bold text-lg text-gray-900">₹{(item.menuItem.price * item.qty).toFixed(2)}</span>
                  </div>
                ))}
              </div>
              
              <div className="border-t mt-6 pt-4 flex justify-between items-center text-xl font-bold bg-orange-50 p-4 rounded-xl">
                <span>Total Amount</span>
                <span className="text-orange-600">₹{order.totalAmount.toFixed(2)}</span>
              </div>
            </div>

            {/* Payment Section */}
            <div className="border-t pt-8 mb-8">
              <h3 className="font-bold text-xl mb-6 text-gray-900">Payment Method</h3>
              
              <div className="space-y-4 mb-6">
                <label className="flex items-center space-x-4 p-4 border-2 rounded-xl cursor-pointer hover:bg-gray-50 transition-colors">
                  <input
                    type="radio"
                    name="payment"
                    value="cash"
                    checked={paymentMethod === 'cash'}
                    onChange={(e) => setPaymentMethod(e.target.value as 'cash')}
                    className="text-orange-500 w-5 h-5"
                  />
                  <CreditCard className="w-6 h-6 text-gray-500" />
                  <span className="font-medium">Cash on {order.mode === OrderMode.DELIVERY ? 'Delivery' : 'Pickup'}</span>
                </label>
                
                <label className="flex items-center space-x-4 p-4 border-2 rounded-xl cursor-pointer hover:bg-gray-50 transition-colors">
                  <input
                    type="radio"
                    name="payment"
                    value="upi"
                    checked={paymentMethod === 'upi'}
                    onChange={(e) => setPaymentMethod(e.target.value as 'upi')}
                    className="text-orange-500 w-5 h-5"
                  />
                  <QrCode className="w-6 h-6 text-gray-500" />
                  <span className="font-medium">UPI Payment</span>
                </label>
              </div>

              {paymentMethod === 'upi' && (
                <div className="bg-blue-50 p-6 rounded-xl">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-2">
                      <span className="text-sm font-medium text-gray-700">UPI ID:</span>
                      <span className="font-mono font-bold text-blue-600">{upiId}</span>
                    </div>
                    <button
                      onClick={handleCopyUPI}
                      className="flex items-center space-x-1 text-blue-600 hover:text-blue-800 text-sm font-medium"
                    >
                      <Copy className="w-4 h-4" />
                      <span>{copied ? 'Copied!' : 'Copy'}</span>
                    </button>
                  </div>
                  
                  {!showUpiQr ? (
                    <button
                      onClick={() => setShowUpiQr(true)}
                      className="w-full bg-blue-500 hover:bg-blue-600 text-white py-3 rounded-xl font-semibold transition-colors"
                    >
                      Generate UPI QR Code
                    </button>
                  ) : (
                    <div className="text-center">
                      <div className="w-48 h-48 bg-white border-4 border-blue-200 rounded-xl mx-auto mb-4 flex items-center justify-center">
                        <QrCode className="w-24 h-24 text-blue-400" />
                      </div>
                      <p className="text-sm text-gray-600 mb-4">
                        Scan this QR code with any UPI app to pay <strong>₹{order.totalAmount.toFixed(2)}</strong>
                      </p>
                      <button className="flex items-center space-x-2 mx-auto text-blue-600 hover:text-blue-800 text-sm font-medium">
                        <ExternalLink className="w-4 h-4" />
                        <span>Open in UPI App</span>
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Status Updates */}
            <div className="bg-gradient-to-r from-orange-50 to-red-50 p-6 rounded-xl mb-8">
              <h4 className="font-bold text-orange-800 mb-4">What's Next?</h4>
              <ul className="text-sm text-orange-700 space-y-2">
                <li className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                  <span>We'll send you SMS updates as your order progresses</span>
                </li>
                <li className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                  <span>You'll receive a notification when your order is ready</span>
                </li>
                {order.mode === OrderMode.DELIVERY && (
                  <li className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                    <span>Our delivery partner will share an OTP for secure handoff</span>
                  </li>
                )}
              </ul>
            </div>

            {/* Action Buttons */}
            <div className="flex space-x-4">
              <button
                onClick={onBackToMenu}
                className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-800 py-4 rounded-xl font-semibold transition-colors"
              >
                Order More Items
              </button>
              
              <button className="flex-1 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white py-4 rounded-xl font-semibold transition-colors">
                Track Order Status
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}