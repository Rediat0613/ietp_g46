# 🔬 Smart Lab Monitoring System

Full-stack IoT monitoring system with Next.js frontend, Node.js backend, MongoDB database, and Arduino hardware integration.

## 📋 Project Structure

```
project/
├── src/                        # Next.js 15 Frontend
│   ├── app/                    # Next.js App Router pages
│   │   ├── page.tsx           # Dashboard
│   │   ├── history/           # History page
│   │   ├── settings/          # Settings page (Admin only)
│   │   ├── login/             # Login page
│   │   └── register/          # Registration page
│   ├── components/            # React components
│   ├── contexts/              # React contexts (Auth, WebSerial)
│   └── lib/                   # Utilities
│
├── backend/                    # Node.js + Express Backend
│   ├── src/
│   │   ├── controllers/       # Request handlers
│   │   ├── models/            # MongoDB schemas
│   │   ├── routes/            # API routes
│   │   ├── middleware/        # Auth middleware
│   │   ├── config/            # Database config
│   │   └── server.js          # Main server file
│   ├── .env                   # Backend environment variables
│   └── package.json
│
├── .env                      # Frontend environment variables (Next.js root)
├── ARDUINO_SETUP.md          # Arduino hardware guide
└── README.md                  # This file
```

## 🚀 Features

### Frontend (Next.js 15)
- ✅ Real-time sensor data visualization
- ✅ WebSerial API integration for Arduino
- ✅ Demo mode for testing without hardware
- ✅ Interactive charts and graphs
- ✅ Alert system with notifications
- ✅ User authentication (Login/Register)
- ✅ Role-based access control UI
- ✅ Responsive design (mobile-friendly)
- ✅ Dark mode support

### Backend (Node.js + Express)
- ✅ RESTful API architecture
- ✅ JWT-based authentication
- ✅ Role-based authorization (Viewer, Technician, Admin)
- ✅ MongoDB database integration
- ✅ Sensor history storage
- ✅ User settings management
- ✅ Alert tracking
- ✅ CORS enabled for frontend

### Hardware (Arduino)
- ✅ MQ-2 Gas sensor integration
- ✅ DHT22 Temperature & Humidity sensor
- ✅ Fan control (LED indicator)
- ✅ Buzzer alarm system
- ✅ Serial communication via WebSerial API
- ✅ Wokwi simulation support

## 🔐 Role-Based Access Control

### 👁 Viewer (Read-Only)
- ✅ View dashboard and real-time sensor data
- ✅ View historical data and charts
- ✅ View alerts
- ❌ **CANNOT** control devices (fan, alarm, ventilation)
- ❌ **CANNOT** access settings

### 🔧 Technician (Operator)
- ✅ View dashboard and real-time sensor data
- ✅ View historical data and charts
- ✅ View alerts
- ✅ **CAN** control devices (turn fan/alarm/ventilation on/off)
- ❌ **CANNOT** access settings (cannot change thresholds)

### 👑 Admin (Full Access)
- ✅ View dashboard and real-time sensor data
- ✅ View historical data and charts
- ✅ View alerts
- ✅ **CAN** control devices (turn fan/alarm/ventilation on/off)
- ✅ **CAN** access settings (configure all system thresholds)

## 📦 Installation

### Prerequisites
- Node.js (v18 or higher)
- npm or yarn
- MongoDB Atlas account (provided)
- Arduino + sensors (optional - demo mode available)
- Chrome/Edge browser (for WebSerial)

### 1. Backend Setup

```bash
# Navigate to backend directory
cd backend

# Install dependencies
npm install

# Environment variables are already configured in backend/.env
# MongoDB URI: mongodb+srv://yaredabebe0101_db_user:PbcHcZCCud2Ek0z2@cluster0.4xuikk3.mongodb.net/smart-lab-monitoring
# JWT Secret: your-super-secret-jwt-key-change-this-in-production-2024

# Start backend server
npm run dev
```

Backend will run on `http://localhost:5000`

### 2. Frontend Setup

```bash
# Return to project root
cd ..

# Install dependencies
npm install

# Environment variables are in `.env` (Next.js root)
# Backend API URL: http://localhost:5000

# Start frontend development server
npm run dev
```

Frontend will run on `http://localhost:3000`

## 🎯 Quick Start Guide

### Option 1: Demo Mode (No Hardware Required)

1. Start backend server: `cd backend && npm run dev`
2. Start frontend: `npm run dev` (from project root)
3. Open browser: `http://localhost:3000`
4. Click **"Register"** and create an account
5. Select role: **Admin** (for full access)
6. Login with your credentials
7. Click **"Demo Mode"** button on dashboard
8. Watch real-time simulated sensor data!

### Option 2: Real Arduino Hardware

1. Follow setup in `ARDUINO_SETUP.md`
2. Upload Arduino code to your board
3. Start backend and frontend servers
4. Register/Login to the dashboard
5. Click **"Connect Device"** button
6. Select Arduino port from browser popup
7. Real sensor data streams automatically!

## 📡 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user (protected)
- `POST /api/auth/logout` - Logout user (protected)

### Sensor History
- `GET /api/history` - Get sensor history (protected)
- `POST /api/history` - Save sensor data (protected)
- `POST /api/history/bulk` - Bulk save data (protected)
- `DELETE /api/history` - Delete history (protected)

### Settings
- `GET /api/settings` - Get user settings (protected)
- `PUT /api/settings` - Update settings (admin only)
- `POST /api/settings/reset` - Reset to defaults (admin only)

### Alerts
- `GET /api/alerts` - Get alerts (protected)
- `POST /api/alerts` - Create alert (protected)
- `PUT /api/alerts/:id/resolve` - Resolve alert (protected)
- `DELETE /api/alerts/:id` - Delete alert (protected)

## 🧪 Testing

### Test Backend API

```bash
# Register a user
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Admin User","email":"admin@test.com","password":"password123","role":"admin"}'

# Login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@test.com","password":"password123"}'

# Save sensor data (use token from login response)
curl -X POST http://localhost:5000/api/history \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d '{"gas":250,"temp":28.4,"humidity":61,"fanStatus":false,"buzzerStatus":false}'
```

## 🔧 Configuration

### Backend Environment Variables (`backend/.env`)
```env
MONGODB_URI=mongodb+srv://yaredabebe0101_db_user:PbcHcZCCud2Ek0z2@cluster0.4xuikk3.mongodb.net/smart-lab-monitoring
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production-2024
PORT=5000
NODE_ENV=development
FRONTEND_URL=http://localhost:3000
```

### Frontend Environment Variables (`.env`)
```env
NEXT_PUBLIC_API_URL=http://localhost:5000
NEXT_PUBLIC_APP_NAME=Smart Lab Monitoring
NEXT_PUBLIC_ENABLE_DEMO_MODE=true
NEXT_PUBLIC_ENABLE_WEBSERIAL=true
```

## 🛠 Development

### Frontend Development
```bash
npm run dev          # Start dev server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
```

### Backend Development
```bash
cd backend
npm run dev          # Start with nodemon (auto-reload)
npm start            # Start production server
```

## 📊 Database Schema

### Users Collection
- name, email, password (hashed)
- role: viewer | technician | admin
- createdAt, lastLogin

### SensorHistory Collection
- userId, gas, temp, humidity
- fanStatus, buzzerStatus
- timestamp, deviceId

### Settings Collection
- userId, thresholds (gas, temp, humidity)
- alertDuration, fanMinOnTime

### Alerts Collection
- userId, type, severity, message
- value, threshold, resolved

## 🔒 Security Features

- ✅ Password hashing with bcryptjs
- ✅ JWT token authentication
- ✅ Role-based authorization
- ✅ CORS protection
- ✅ Request validation
- ✅ Protected routes
- ✅ MongoDB injection prevention

## 📱 Browser Support

- Chrome 89+ (WebSerial API)
- Edge 89+ (WebSerial API)
- Safari/Firefox: Demo mode only (no WebSerial)

## 🎨 Tech Stack

### Frontend
- Next.js 15 (App Router)
- React 18
- TypeScript
- Tailwind CSS
- Shadcn/UI Components
- Recharts (data visualization)
- WebSerial API

### Backend
- Node.js
- Express.js
- MongoDB + Mongoose
- JWT (jsonwebtoken)
- bcryptjs
- CORS

### Hardware
- Arduino Uno/Nano
- MQ-2 Gas Sensor
- DHT22 Temp/Humidity Sensor
- LED (Fan indicator)
- Buzzer (Alarm)

## 📚 Additional Documentation

- [Arduino Setup Guide](./ARDUINO_SETUP.md) - Complete hardware wiring and code
- [Backend API Docs](./backend/README.md) - Detailed API documentation

## 🐛 Troubleshooting

### Backend won't start
- Check MongoDB connection string
- Ensure port 5000 is available
- Run `npm install` in backend directory

### Frontend can't connect to backend
- Verify backend is running on port 5000
- Check `NEXT_PUBLIC_API_URL` in `.env` (Next.js root)
- Check CORS settings in backend

### WebSerial not working
- Use Chrome/Edge browser
- Open in new tab (not in iframe)
- Grant USB permission when prompted
- Close Arduino IDE Serial Monitor

### Authentication errors
- Clear browser localStorage
- Check JWT_SECRET in backend/.env
- Verify token is sent in Authorization header

## 🎯 Future Enhancements

- [ ] Email notifications for critical alerts
- [ ] SMS alerts via Twilio
- [ ] Multi-device support
- [ ] Advanced analytics and reporting
- [ ] Mobile app (React Native)
- [ ] Desktop app (Electron)
- [ ] Real-time collaboration
- [ ] Data export (PDF reports)
- [ ] Sensor calibration tools
- [ ] Custom alert rules

## 📄 License

MIT License - Feel free to use this project for learning and development.

---

**Built with ❤️ for IoT monitoring and laboratory safety**

🌟 **Star this repo if you find it helpful!**