# 🚀 Quick Start Guide

Get your Smart Lab Monitoring System up and running in 5 minutes!

## ⚡ Prerequisites

- Node.js 18+ installed
- npm or yarn installed
- Chrome or Edge browser

## 📝 Step-by-Step Setup

### 1️⃣ Install Backend Dependencies

```bash
cd backend
npm install
```

**Expected output:** ✅ Dependencies installed successfully

### 2️⃣ Start Backend Server

```bash
npm run dev
```

**Expected output:**
```
✅ MongoDB Connected: cluster0.4xuikk3.mongodb.net
📊 Database: smart-lab-monitoring
🚀 Server running on port 5000
```

Keep this terminal running!

### 3️⃣ Install Frontend Dependencies

Open a **new terminal** and run:

```bash
# Go back to project root
cd ..

# Install frontend dependencies
npm install
```

### 4️⃣ Start Frontend Server

```bash
npm run dev
```

**Expected output:**
```
✓ Ready in 2s
○ Local: http://localhost:3000
```

### 5️⃣ Open Browser

Navigate to: **http://localhost:3000**

---

## 👤 First Time User Setup

### Create Your Account

1. Click **"Register"** button
2. Fill in details:
   - **Name:** Your Name
   - **Email:** your.email@example.com
   - **Role:** Choose one:
     - 👁 **Viewer** - Read-only access
     - 🔧 **Technician** - Can control devices
     - 👑 **Admin** - Full access (recommended for first user)
   - **Password:** Your secure password (min 6 characters)
   - **Confirm Password:** Same password
3. Click **"Create Account"**

✅ You'll be automatically logged in!

---

## 🎮 Try Demo Mode (No Hardware)

1. On the dashboard, click **"Demo Mode"** button
2. Watch real-time simulated sensor data appear
3. See live charts updating
4. View alerts when thresholds are exceeded

### Test Role-Based Features

**As Viewer 👁:**
- ✅ View dashboard and charts
- ❌ Cannot access Settings page

**As Technician 🔧:**
- ✅ View dashboard and charts
- ✅ Can control devices (future feature)
- ❌ Cannot access Settings page

**As Admin 👑:**
- ✅ View everything
- ✅ Can control devices
- ✅ **Can access Settings page** (click Settings in navbar)

---

## 🔌 Connect Real Arduino (Optional)

### Prerequisites
- Arduino with sensors (see ARDUINO_SETUP.md)
- Arduino code uploaded
- Chrome/Edge browser

### Steps
1. Connect Arduino via USB
2. On dashboard, click **"Connect Device"**
3. Select Arduino port from popup
4. Grant permission when prompted
5. Real sensor data starts streaming!

---

## 🧪 Test Backend APIs

### Register a Test User

```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Test User","email":"test@example.com","password":"test123","role":"admin"}'
```

### Login

```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"test123"}'
```

Copy the `token` from the response!

### Save Sensor Data

```bash
curl -X POST http://localhost:5000/api/history \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d '{"gas":250,"temp":28.4,"humidity":61,"fanStatus":false,"buzzerStatus":false}'
```

### Get Settings (Admin Only)

```bash
curl -X GET http://localhost:5000/api/settings \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

---

## 📊 Explore Features

### Dashboard Page (/)
- Real-time sensor cards
- Live updating charts
- System status indicators
- Recent alerts
- Connection controls

### History Page (/history)
- Event timeline
- Statistics cards
- Export to CSV
- Persistent storage in MongoDB

### Settings Page (/settings) - Admin Only
- Configure sensor thresholds
- Alert settings
- General preferences
- Save/Reset buttons

---

## 🔑 Default Credentials Template

For testing, you can create users with these templates:

**Admin User:**
```
Email: admin@lab.com
Password: admin123
Role: admin
```

**Technician User:**
```
Email: tech@lab.com
Password: tech123
Role: technician
```

**Viewer User:**
```
Email: viewer@lab.com
Password: viewer123
Role: viewer
```

---

## ⚠️ Troubleshooting

### Backend not starting?
```bash
# Check if port 5000 is available
lsof -i :5000  # Mac/Linux
netstat -ano | findstr :5000  # Windows

# Kill any process using port 5000, then restart
```

### Frontend not starting?
```bash
# Check if port 3000 is available
lsof -i :3000  # Mac/Linux
netstat -ano | findstr :3000  # Windows

# Or start on different port
npm run dev -- -p 3001
```

### MongoDB connection error?
- Check internet connection
- Verify MongoDB URI in `backend/.env`
- The credentials are already configured!

### Can't login?
- Clear browser localStorage: Open DevTools → Application → Local Storage → Clear
- Make sure backend is running
- Check credentials are correct

### WebSerial not working?
- Use Chrome or Edge browser (not Firefox/Safari)
- If in iframe: Click "Open in New Tab" button
- Grant USB permissions when prompted
- Close Arduino IDE Serial Monitor before connecting

---

## 🎯 Next Steps

1. ✅ Explore all three role types (create multiple accounts)
2. ✅ Test Settings page (admin only)
3. ✅ Try exporting history to CSV
4. ✅ Review Arduino setup guide: `ARDUINO_SETUP.md`
5. ✅ Connect real hardware (optional)
6. ✅ Customize sensor thresholds in Settings

---

## 📚 Documentation

- **Full Documentation:** `README.md`
- **Arduino Hardware Guide:** `ARDUINO_SETUP.md`
- **Backend API Reference:** `backend/README.md`

---

## 💡 Quick Tips

- **Switch Roles:** Create multiple accounts with different roles to test permissions
- **Demo Mode:** Perfect for presentations and testing without hardware
- **History Auto-Save:** When logged in, sensor data automatically saves to MongoDB every 10 seconds
- **Settings Sync:** Admin settings changes apply immediately
- **Export Data:** Use "Export CSV" button on History page for data analysis

---

## 🆘 Need Help?

1. Check `README.md` for detailed documentation
2. Review `ARDUINO_SETUP.md` for hardware setup
3. Check browser console for errors (F12)
4. Check backend terminal for API errors

---

**🎉 You're all set! Enjoy monitoring your lab environment!**
