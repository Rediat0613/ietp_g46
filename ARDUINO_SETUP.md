# 🔌 Arduino Hardware Setup Guide

Complete guide for connecting real Arduino hardware to the Smart Lab Monitoring System.

## 📦 Required Components

### Hardware
- **Arduino Uno** or **Arduino Nano**
- **MQ-2 Gas Sensor** (for detecting LPG, smoke, alcohol, propane, hydrogen, methane, CO)
- **DHT22 Temperature & Humidity Sensor**
- **LED** (represents Fan)
- **Buzzer** (for alarm)
- **Resistors** (220Ω for LED, 10kΩ pull-up for DHT22 if needed)
- **Breadboard and Jumper Wires**
- **USB Cable** (for Arduino connection)

### Software
- **Arduino IDE** (version 1.8.x or 2.x)
- **Chrome/Edge Browser** (for WebSerial API support)

---

## 🔧 Hardware Wiring Diagram

```
Arduino Pin Connections:
┌─────────────────────────────────────┐
│ MQ-2 Gas Sensor                     │
│   VCC  → 5V                         │
│   GND  → GND                        │
│   A0   → A0 (Analog Pin)            │
└─────────────────────────────────────┘

┌─────────────────────────────────────┐
│ DHT22 Temp/Humidity Sensor          │
│   VCC  → 5V                         │
│   GND  → GND                        │
│   DATA → Digital Pin 2              │
│   (Use 10kΩ pull-up resistor)       │
└─────────────────────────────────────┘

┌─────────────────────────────────────┐
│ Fan LED (Status Indicator)          │
│   Anode (+)  → Digital Pin 9        │
│   Cathode (-) → 220Ω Resistor → GND│
└─────────────────────────────────────┘

┌─────────────────────────────────────┐
│ Buzzer/Alarm                        │
│   Positive → Digital Pin 8          │
│   Negative → GND                    │
└─────────────────────────────────────┘
```

### Visual Wiring Diagram
```
        ┌─────────────────────┐
        │   ARDUINO UNO       │
        │                     │
5V   ───┤ 5V            A0 ├──── MQ-2 Gas Sensor
GND  ───┤ GND           A1 │
        │               A2 │
        │               A3 │
        │               D2 ├──── DHT22 Data Pin
        │               D3 │
        │               D4 │
        │               D5 │
        │               D6 │
        │               D7 │
        │               D8 ├──── Buzzer (+)
        │               D9 ├──── LED Anode (Fan)
        │              D10 │
USB  ───┤ USB          D11 │
        │              D12 │
        │              D13 │
        └─────────────────────┘
```

---

## 💻 Arduino Code

### Step 1: Install Required Libraries

Open Arduino IDE → Tools → Manage Libraries, then install:
1. **DHT sensor library** by Adafruit
2. **Adafruit Unified Sensor** (dependency)

### Step 2: Upload This Code

```cpp
// Smart Lab Monitoring System - Arduino Code
// Compatible with WebSerial API

#include <DHT.h>

// Pin Definitions
#define MQ2_PIN A0        // Gas sensor analog pin
#define DHT_PIN 2         // DHT22 data pin
#define FAN_PIN 9         // Fan LED pin
#define BUZZER_PIN 8      // Buzzer pin

// Sensor Configuration
#define DHT_TYPE DHT22
DHT dht(DHT_PIN, DHT_TYPE);

// Thresholds (can be adjusted via web dashboard settings)
int gasThreshold = 300;
int tempThreshold = 30;

// State Variables
bool fanState = false;
bool buzzerState = false;
unsigned long lastReadTime = 0;
const unsigned long READ_INTERVAL = 500; // Read every 500ms

void setup() {
  // Initialize Serial Communication
  Serial.begin(9600);
  
  // Initialize DHT Sensor
  dht.begin();
  
  // Configure Pins
  pinMode(FAN_PIN, OUTPUT);
  pinMode(BUZZER_PIN, OUTPUT);
  pinMode(MQ2_PIN, INPUT);
  
  // Initial State
  digitalWrite(FAN_PIN, LOW);
  digitalWrite(BUZZER_PIN, LOW);
  
  // Startup Message
  Serial.println("Smart Lab Monitoring System Started");
  Serial.println("Warming up sensors...");
  delay(2000); // Sensor warm-up time
  Serial.println("System Ready!");
}

void loop() {
  unsigned long currentTime = millis();
  
  // Read sensors at specified interval
  if (currentTime - lastReadTime >= READ_INTERVAL) {
    lastReadTime = currentTime;
    
    // Read Gas Sensor (MQ-2)
    int gasValue = analogRead(MQ2_PIN);
    
    // Read Temperature and Humidity (DHT22)
    float temperature = dht.readTemperature();
    float humidity = dht.readHumidity();
    
    // Check for sensor errors
    if (isnan(temperature) || isnan(humidity)) {
      Serial.println("Error: DHT22 sensor read failed!");
      return;
    }
    
    // Control Fan based on temperature
    if (temperature > tempThreshold) {
      fanState = true;
      digitalWrite(FAN_PIN, HIGH);
    } else {
      fanState = false;
      digitalWrite(FAN_PIN, LOW);
    }
    
    // Control Buzzer based on gas level
    if (gasValue > gasThreshold) {
      buzzerState = true;
      digitalWrite(BUZZER_PIN, HIGH);
    } else {
      buzzerState = false;
      digitalWrite(BUZZER_PIN, LOW);
    }
    
    // Send data to Serial in format: "Gas: X | Temp: Y | Humidity: Z"
    // This format is parsed by the web application
    Serial.print("Gas: ");
    Serial.print(gasValue);
    Serial.print(" | Temp: ");
    Serial.print(temperature, 1);
    Serial.print(" | Humidity: ");
    Serial.println(humidity, 1);
  }
  
  // Listen for commands from web dashboard (optional)
  if (Serial.available() > 0) {
    String command = Serial.readStringUntil('\n');
    command.trim();
    processCommand(command);
  }
}

// Process commands from web dashboard
void processCommand(String cmd) {
  if (cmd.startsWith("SET_GAS_THRESHOLD:")) {
    gasThreshold = cmd.substring(18).toInt();
    Serial.print("Gas threshold set to: ");
    Serial.println(gasThreshold);
  }
  else if (cmd.startsWith("SET_TEMP_THRESHOLD:")) {
    tempThreshold = cmd.substring(19).toInt();
    Serial.print("Temperature threshold set to: ");
    Serial.println(tempThreshold);
  }
  else if (cmd == "FAN_ON") {
    digitalWrite(FAN_PIN, HIGH);
    Serial.println("Fan manually turned ON");
  }
  else if (cmd == "FAN_OFF") {
    digitalWrite(FAN_PIN, LOW);
    Serial.println("Fan manually turned OFF");
  }
  else if (cmd == "BUZZER_ON") {
    digitalWrite(BUZZER_PIN, HIGH);
    Serial.println("Buzzer manually turned ON");
  }
  else if (cmd == "BUZZER_OFF") {
    digitalWrite(BUZZER_PIN, LOW);
    Serial.println("Buzzer manually turned OFF");
  }
  else if (cmd == "STATUS") {
    Serial.println("=== System Status ===");
    Serial.print("Gas Threshold: ");
    Serial.println(gasThreshold);
    Serial.print("Temp Threshold: ");
    Serial.println(tempThreshold);
    Serial.print("Fan: ");
    Serial.println(fanState ? "ON" : "OFF");
    Serial.print("Buzzer: ");
    Serial.println(buzzerState ? "ON" : "OFF");
  }
}
```

---

## 🚀 Usage Instructions

### Step 1: Hardware Assembly
1. Connect all components according to the wiring diagram above
2. Double-check all connections (especially power and ground)
3. Ensure MQ-2 sensor has proper ventilation

### Step 2: Upload Arduino Code
1. Open Arduino IDE
2. Copy the code above and paste it
3. Select correct board: **Tools → Board → Arduino Uno/Nano**
4. Select correct port: **Tools → Port → COM3 (or your Arduino port)**
5. Click **Upload** button (→)
6. Wait for "Done uploading" message

### Step 3: Connect to Web Dashboard

#### Option A: Direct USB Connection (Recommended)
1. Keep Arduino connected via USB
2. Open the web dashboard in **Chrome** or **Edge** browser
3. Click **"Connect Device"** button
4. Select your Arduino port from the popup
5. Data will start streaming automatically

#### Option B: Demo Mode (No Hardware Required)
1. Click **"Demo Mode"** button on dashboard
2. Simulated data will be displayed
3. Perfect for testing without hardware

### Step 4: Verify Connection
You should see:
- ✅ Green "Connected" indicator
- 📊 Real-time sensor values updating
- 📈 Live charts plotting data
- 🚨 Alerts if thresholds are exceeded

---

## 🔍 Troubleshooting

### Problem: Arduino Not Detected
**Solutions:**
- Install [CH340/CH341 USB driver](https://www.wch.cn/download/CH341SER_ZIP.html) for clones
- Try different USB cable (some cables are power-only)
- Check Device Manager (Windows) or `ls /dev/tty*` (Linux/Mac)
- Restart Arduino IDE and browser

### Problem: DHT22 Reads NaN
**Solutions:**
- Check wiring (especially DATA pin)
- Add 10kΩ pull-up resistor between DATA and VCC
- Wait 2 seconds after power-on (warm-up time)
- Try different DHT22 sensor (may be defective)

### Problem: MQ-2 Always Shows High Values
**Solutions:**
- MQ-2 needs 24-48 hour burn-in period for accurate readings
- Keep sensor in clean air for calibration
- Check if sensor is getting 5V power
- Normal clean air reading: 100-300 range

### Problem: WebSerial Permission Denied
**Solutions:**
- Use Chrome/Edge browser (Firefox doesn't support WebSerial)
- Enable WebSerial: `chrome://flags/#enable-web-serial`
- Check if another program is using the port (close Arduino IDE Serial Monitor)
- Grant USB permission when browser prompts

### Problem: Data Format Error
**Solutions:**
- Verify Serial.println() outputs match format: `Gas: X | Temp: Y | Humidity: Z`
- Check baud rate is 9600 in both Arduino and web app
- Look for extra spaces or special characters
- Test with Arduino IDE Serial Monitor first

---

## 📊 Expected Serial Output

```
Gas: 245 | Temp: 24.3 | Humidity: 58.2
Gas: 248 | Temp: 24.4 | Humidity: 58.1
Gas: 251 | Temp: 24.3 | Humidity: 58.3
Gas: 312 | Temp: 31.2 | Humidity: 59.1  ← Gas alert triggered!
Gas: 315 | Temp: 31.5 | Humidity: 59.0  ← Fan turned ON!
```

---

## 🎯 Testing Sensors

### MQ-2 Gas Sensor Test
1. Normal air: 100-300 range
2. Wave hand near sensor: slight increase
3. Use lighter gas (don't ignite): 400-800 range
4. **Safety**: Test in ventilated area only!

### DHT22 Sensor Test
1. Normal room: 20-28°C, 40-70% humidity
2. Breathe on sensor: humidity increases
3. Heat with hand: temperature increases slightly
4. Use hair dryer (low heat, safe distance): temperature >30°C → Fan turns ON

### LED & Buzzer Test
1. Heat DHT22 above 30°C → Fan LED should turn ON
2. Expose MQ-2 to gas → Buzzer should activate
3. Manual control via Serial Monitor:
   - Send `FAN_ON` → LED turns on
   - Send `BUZZER_OFF` → Buzzer turns off

---

## 🔐 Security Notes

- 🚫 **Never expose flammable gas to open flames**
- ⚠️ MQ-2 sensor gets hot during operation (normal)
- ✅ Always test in well-ventilated area
- 🔌 Use proper 5V USB power supply (≥500mA)
- 📍 Keep sensors away from water/moisture

---

## 📞 Support

### Wokwi Simulation (No Hardware)
Test online first: [https://wokwi.com/projects/449120603472757761](https://wokwi.com/projects/449120603472757761)

### Additional Resources
- Arduino Official: [https://www.arduino.cc](https://www.arduino.cc)
- DHT Library: [https://github.com/adafruit/DHT-sensor-library](https://github.com/adafruit/DHT-sensor-library)
- WebSerial API: [https://web.dev/serial/](https://web.dev/serial/)

---

## ✅ Quick Checklist

Before connecting to web dashboard:

- [ ] All components wired correctly
- [ ] Arduino code uploaded successfully
- [ ] Serial Monitor shows data (baud: 9600)
- [ ] Output format matches: `Gas: X | Temp: Y | Humidity: Z`
- [ ] Chrome/Edge browser ready
- [ ] Arduino IDE Serial Monitor closed
- [ ] USB cable connected

Now click **"Connect Device"** and enjoy real-time monitoring! 🎉
