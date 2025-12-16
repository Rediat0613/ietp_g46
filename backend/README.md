# Smart Lab Monitoring - Backend API

Backend API for Smart Environment Monitoring System with role-based authentication.

## 🚀 Quick Start

### 1. Install Dependencies
```bash
cd backend
npm install
```

### 2. Environment Setup
The `.env` file is already configured with MongoDB credentials:
```env
MONGODB_URI=your-mongo-url
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production-2024
PORT=5000
NODE_ENV=development
FRONTEND_URL=http://localhost:3000
```

### 3. Start Server
```bash
# Development mode with auto-reload
npm run dev

# Production mode
npm start
```

Server will start on `http://localhost:5000`

## 📋 API Endpoints

### Authentication (`/api/auth`)
- `POST /register` - Register new user
- `POST /login` - Login user
- `GET /me` - Get current user (protected)
- `POST /logout` - Logout user (protected)

### History (`/api/history`)
- `GET /` - Get sensor history (protected)
- `POST /` - Save sensor data (protected)
- `POST /bulk` - Bulk save sensor data (protected)
- `DELETE /` - Delete sensor history (protected)

### Settings (`/api/settings`)
- `GET /` - Get user settings (protected)
- `PUT /` - Update settings (admin only)
- `POST /reset` - Reset to defaults (admin only)

### Alerts (`/api/alerts`)
- `GET /` - Get alerts (protected)
- `POST /` - Create alert (protected)
- `PUT /:id/resolve` - Resolve alert (protected)
- `DELETE /:id` - Delete alert (protected)

### Devices (`/api/devices`)

- `POST /api/devices/register` - Register a new device (admin only). Returns `deviceId` and `secret` (secret shown once).
- `GET /api/devices` - List devices (admin only).
- `DELETE /api/devices/:id` - Delete a device (admin only).
- `POST /api/devices/ingest` - Public ingest endpoint for devices. Devices must send header `x-device-key: <deviceId>:<secret>` and post the same body as `/api/history`.

Device flow notes:
- Use `POST /api/devices/register` as an admin to create a device and obtain the secret. Store the secret securely on the device.
- Device should call `POST /api/devices/ingest` with header `x-device-key` in format `deviceId:secret`.
- Optional: include `userId` in the body to associate the reading with a user; otherwise the device owner's user will be used if available.

## 🔐 Role-Based Access Control

### Roles
- **Viewer** - Read-only access (view dashboard, history, alerts)
- **Technician** - Read + Control devices (cannot access settings)
- **Admin** - Full access (all features + settings)

### Authentication Flow
1. Register/Login → Receive JWT token
2. Include token in requests: `Authorization: Bearer <token>`
3. Token expires in 30 days

## 📊 MongoDB Collections

### Users
```javascript
{
  name: String,
  email: String (unique),
  password: String (hashed),
  role: 'viewer' | 'technician' | 'admin',
  createdAt: Date,
  lastLogin: Date
}
```

### SensorHistory
```javascript
{
  userId: ObjectId,
  gas: Number,
  temp: Number,
  humidity: Number,
  fanStatus: Boolean,
  buzzerStatus: Boolean,
  timestamp: Date,
  deviceId: String
}
```

### Settings
```javascript
{
  userId: ObjectId,
  thresholds: {
    gas: Number (default: 300),
    temperature: Number (default: 30),
    humidityMin: Number (default: 40),
    humidityMax: Number (default: 70)
  },
  alertDuration: Number (default: 5),
  fanMinOnTime: Number (default: 1)
}
```

### Alerts
```javascript
{
  userId: ObjectId,
  type: 'gas' | 'temperature' | 'humidity',
  severity: 'low' | 'medium' | 'high' | 'critical',
  message: String,
  value: Number,
  threshold: Number,
  resolved: Boolean,
  timestamp: Date
}
```

## 🧪 Testing API

### Register User
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Admin User","email":"admin@test.com","password":"password123","role":"admin"}'
```

### Login
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@test.com","password":"password123"}'
```

### Save Sensor Data
```bash
curl -X POST http://localhost:5000/api/history \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{"gas":250,"temp":28.4,"humidity":61,"fanStatus":false,"buzzerStatus":false}'
```

## 🛠 Development

### Project Structure
```
backend/
├── src/
│   ├── config/
│   │   └── database.js       # MongoDB connection
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── historyController.js
│   │   ├── settingsController.js
│   │   └── alertController.js
│   ├── middleware/
│   │   └── auth.js           # JWT & role authorization
│   ├── models/
│   │   ├── User.js
│   │   ├── SensorHistory.js
│   │   ├── Settings.js
│   │   └── Alert.js
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── historyRoutes.js
│   │   ├── settingsRoutes.js
│   │   └── alertRoutes.js
│   └── server.js             # Main server file
├── .env
├── package.json
└── README.md
```

## 🔒 Security Features

- ✅ Password hashing with bcryptjs
- ✅ JWT token authentication
- ✅ Role-based authorization
- ✅ CORS protection
- ✅ Request validation
- ✅ Error handling

## 📝 Notes

- Default role for new users: `viewer`
- JWT tokens expire in 30 days
- MongoDB connection includes retry logic
- All passwords are hashed before storage
- Settings are auto-created on user registration
