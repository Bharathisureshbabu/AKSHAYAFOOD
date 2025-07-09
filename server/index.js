const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const { PrismaClient } = require('@prisma/client');
const QRCode = require('qrcode');
const { v4: uuidv4 } = require('uuid');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST"]
  }
});

const prisma = new PrismaClient();

// Middleware
app.use(cors());
app.use(express.json());

// Store connected admin clients
const adminClients = new Set();

// Socket.IO connection handling
io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);

  // Admin authentication
  socket.on('admin-login', () => {
    adminClients.add(socket.id);
    console.log('Admin connected:', socket.id);
  });

  // Handle order acceptance
  socket.on('accept-order', async (orderId) => {
    try {
      const order = await prisma.order.update({
        where: { id: parseInt(orderId) },
        data: { 
          status: 'ACCEPTED',
          estimatedAt: new Date(Date.now() + 45 * 60 * 1000) // 45 minutes from now
        },
        include: {
          customer: true,
          items: {
            include: {
              menuItem: true
            }
          }
        }
      });

      // Notify all admin clients
      io.emit('order-accepted', order);
      console.log(`Order ${orderId} accepted`);
    } catch (error) {
      console.error('Error accepting order:', error);
    }
  });

  socket.on('disconnect', () => {
    adminClients.delete(socket.id);
    console.log('Client disconnected:', socket.id);
  });
});

// Auth endpoints
app.post('/api/auth/request-otp', async (req, res) => {
  const { phone } = req.body;
  
  // Simulate OTP generation (in production, use Twilio)
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  
  // Store OTP in memory (in production, use Redis)
  global.otpStore = global.otpStore || {};
  global.otpStore[phone] = otp;
  
  console.log(`OTP for ${phone}: ${otp}`);
  
  res.json({ success: true, message: 'OTP sent successfully' });
});

app.post('/api/auth/verify-otp', async (req, res) => {
  const { phone, otp } = req.body;
  
  const storedOtp = global.otpStore?.[phone];
  
  if (storedOtp === otp) {
    delete global.otpStore[phone];
    res.json({ success: true, message: 'OTP verified successfully' });
  } else {
    res.status(400).json({ success: false, message: 'Invalid OTP' });
  }
});

app.post('/api/auth/complete-profile', async (req, res) => {
  const { phone, name, address } = req.body;
  
  try {
    const customer = await prisma.customer.upsert({
      where: { phone },
      update: { name, address, phoneVerified: true },
      create: { phone, name, address, phoneVerified: true }
    });
    
    res.json({ success: true, customer });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error creating customer profile' });
  }
});

// Menu endpoints
app.get('/api/menu', async (req, res) => {
  try {
    const menuItems = await prisma.menuItem.findMany({
      where: { visible: true }
    });
    res.json(menuItems);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch menu items' });
  }
});

// Order endpoints
app.post('/api/orders', async (req, res) => {
  const { customerId, mode, items, totalAmount } = req.body;
  
  try {
    // Generate order code
    const orderCode = `AKF-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${String(Math.floor(Math.random() * 9999) + 1).padStart(4, '0')}`;
    
    const order = await prisma.order.create({
      data: {
        orderCode,
        customerId: parseInt(customerId),
        mode,
        status: 'PLACED',
        totalAmount: parseFloat(totalAmount),
        items: {
          create: items.map(item => ({
            menuItemId: item.menuItemId,
            qty: item.qty
          }))
        }
      },
      include: {
        customer: true,
        items: {
          include: {
            menuItem: true
          }
        }
      }
    });

    // Emit new order to all admin clients with beep
    io.emit('new-order', order);
    
    res.json({ success: true, order });
  } catch (error) {
    console.error('Error creating order:', error);
    res.status(500).json({ success: false, message: 'Failed to create order' });
  }
});

app.get('/api/orders', async (req, res) => {
  try {
    const orders = await prisma.order.findMany({
      include: {
        customer: true,
        items: {
          include: {
            menuItem: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch orders' });
  }
});

app.patch('/api/orders/:id/status', async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  
  try {
    const order = await prisma.order.update({
      where: { id: parseInt(id) },
      data: { status },
      include: {
        customer: true,
        items: {
          include: {
            menuItem: true
          }
        }
      }
    });
    
    // Emit status update to all clients
    io.emit('order-status-updated', order);
    
    res.json({ success: true, order });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to update order status' });
  }
});

// UPI QR Code generation
app.get('/api/orders/:id/upi-qr', async (req, res) => {
  const { id } = req.params;
  
  try {
    const order = await prisma.order.findUnique({
      where: { id: parseInt(id) }
    });
    
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }
    
    const upiUrl = `upi://pay?pa=akshayafoods@ybl&pn=Akshaya%20Foods&am=${order.totalAmount}&cu=INR&tn=Order%20${order.orderCode}`;
    const qrDataUrl = await QRCode.toDataURL(upiUrl);
    
    res.json({ dataUrl: qrDataUrl, upiUrl });
  } catch (error) {
    res.status(500).json({ error: 'Failed to generate UPI QR code' });
  }
});

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});