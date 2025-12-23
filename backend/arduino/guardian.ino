#include <WiFi.h>
#include <HTTPClient.h>
#include <ArduinoJson.h>
#include <DHT.h>
#include <LiquidCrystal_I2C.h>

// -------------------- Your Configuration --------------------
#define MQ2_PIN 34
#define DHT_PIN 4
#define DHT_TYPE DHT11
#define BUZZER_PIN 14
#define FAN_PIN 15

// WiFi credentials
const char* ssid = "Yo";
const char* password = "77777777";

// Backend API configuration - UPDATE THESE!
const char* backendURL = "https://ietp-g46-guardian-lab-smart-dashboard-3.onrender.com";
const char* apiEndpoint = "/api/devices/ingest";  // POST to device ingest endpoint
const char* deviceSecret = "60be1e0138ff89a8168bb05bdb4ea8364eccd8a79406e1d9"
const char* deviceId = "63e5f91b7559";         // Unique ID for this ESP32

// Thresholds
const int GAS_SAFE = 300;
const int GAS_WARNING = 600;
const float TEMP_THRESHOLD = 25.0;
const int HUM_SAFE = 35;
const int HUM_WARNING = 50;

// Objects
DHT dht(DHT_PIN, DHT_TYPE);
LiquidCrystal_I2C lcd(0x27, 16, 2);

// Timing
unsigned long lastSendTime = 0;
const long sendInterval = 5000;  // Send every 5 seconds

void setup() {
  Serial.begin(115200);
  
  // Initialize hardware
  pinMode(FAN_PIN, OUTPUT);
  digitalWrite(FAN_PIN, LOW);
  pinMode(BUZZER_PIN, OUTPUT);
  digitalWrite(BUZZER_PIN, LOW);
  dht.begin();
  
  lcd.init();
  lcd.backlight();
  lcd.setCursor(0,0);
  lcd.print("Connecting WiFi");
  
  // Connect to WiFi
  connectToWiFi();
  
  lcd.clear();
  lcd.setCursor(0,0);
  lcd.print("System Ready");
  lcd.setCursor(0,1);
  lcd.print("IP: ");
  lcd.print(WiFi.localIP().toString());
  
  Serial.println("System initialized");
}

void loop() {
  // Read sensors
  int gasRaw = analogRead(MQ2_PIN);
  int gasValue = normalizedGas(gasRaw);
  float temp = dht.readTemperature();
  float hum = dht.readHumidity();
  
  // Determine statuses
  String gasStatus = getGasStatus(gasValue);
  String tempStatus = getTempStatus(temp);
  String humStatus = getHumStatus(hum);
  
  // Control fan and buzzer based on readings
  controlDevices(temp, gasValue, humStatus);
  
  // Update LCD
  updateLCD(temp, hum, gasValue, gasStatus, humStatus);
  
  // Send data to backend every interval
  if (millis() - lastSendTime >= sendInterval) {
    sendToBackend(temp, hum, gasValue, gasStatus, tempStatus, humStatus);
    lastSendTime = millis();
  }
  
  delay(1000);  // Main loop delay
}

// -------------------- Backend Communication --------------------
void sendToBackend(float temp, float humidity, int gas, 
                   String gasStat, String tempStat, String humStat) {
  
  if (WiFi.status() != WL_CONNECTED) {
    Serial.println("WiFi disconnected. Reconnecting...");
    connectToWiFi();
    return;
  }
  
  HTTPClient http;
  
  // Construct full URL
  String fullURL = String(backendURL) + String(apiEndpoint);
  
  Serial.print("Sending to: ");
  Serial.println(fullURL);
  
  http.begin(fullURL);
  
  // Set headers — backend expects x-device-key: "<deviceId>:<secret>"
  http.addHeader("Content-Type", "application/json");
  http.addHeader("x-device-key", String(deviceId) + ":" + String(deviceSecret));
  
  // Create JSON payload expected by backend ingest endpoint
  DynamicJsonDocument doc(512);
  doc["deviceId"] = deviceId;
  // Always include temp/humidity to satisfy backend validation; send JSON null when invalid
  doc["temp"] = isnan(temp) ? nullptr : temp;
  doc["humidity"] = isnan(humidity) ? nullptr : humidity;
  doc["gas"] = gas;
  doc["fanStatus"] = digitalRead(FAN_PIN) == HIGH;
  doc["buzzerStatus"] = digitalRead(BUZZER_PIN) == HIGH;
  // Omit timestamp to allow server to use its own time
  
  // Serialize JSON to string
  String payload;
  serializeJson(doc, payload);
  
  Serial.print("Payload: ");
  Serial.println(payload);
  
  // Send POST request
  int httpCode = http.POST(payload);
  
  // Check response
  if (httpCode > 0) {
    Serial.printf("HTTP Response code: %d\n", httpCode);
    
    if (httpCode == HTTP_CODE_CREATED) { // 201 Created
      String response = http.getString();
      Serial.println("Response: " + response);
      lcd.setCursor(13, 1);
      lcd.print("OK");
    } else if (httpCode == 401) {
      Serial.println("Error: Unauthorized - Check device key");
      lcd.setCursor(13, 1);
      lcd.print("AUTH");
    } else if (httpCode == 403) {
      Serial.println("Error: Forbidden");
      lcd.setCursor(13, 1);
      lcd.print("403");
    } else if (httpCode == 400) {
      String response = http.getString();
      Serial.println("Bad Request: " + response);
      lcd.setCursor(13, 1);
      lcd.print("400");
    } else {
      String response = http.getString();
      Serial.println("Unexpected response: " + response);
      lcd.setCursor(13, 1);
      lcd.print("ERR");
    }
  } else {
    Serial.printf("HTTP Error: %s\n", http.errorToString(httpCode).c_str());
    lcd.setCursor(13, 1);
    lcd.print("ERR");
  }
  
  http.end();
}

// -------------------- Helper Functions --------------------
void connectToWiFi() {
  WiFi.begin(ssid, password);
  Serial.print("Connecting to WiFi");
  
  int attempts = 0;
  while (WiFi.status() != WL_CONNECTED && attempts < 20) {
    delay(500);
    Serial.print(".");
    attempts++;
  }
  
  if (WiFi.status() == WL_CONNECTED) {
    Serial.println("\nConnected! IP: " + WiFi.localIP().toString());
  } else {
    Serial.println("\nFailed to connect to WiFi");
  }
}

String getGasStatus(int value) {
  if (value <= GAS_SAFE) return "Normal";
  else if (value <= GAS_WARNING) return "Warning";
  else return "Danger";
}

String getTempStatus(float temp) {
  if (isnan(temp)) return "Error";
  if (temp <= TEMP_THRESHOLD) return "Normal";
  else return "Warning";
}

String getHumStatus(float hum) {
  if (isnan(hum)) return "Error";
  if (hum <= HUM_SAFE) return "Normal";
  else if (hum <= HUM_WARNING) return "Warning";
  else return "Danger";
}

void controlDevices(float temp, int gas, String humStat) {
  // Fan control
  bool fanOn = (!isnan(temp) && temp > TEMP_THRESHOLD);
  digitalWrite(FAN_PIN, fanOn ? HIGH : LOW);
  
  // Buzzer control
  bool buzzerOn = (gas > GAS_SAFE)  (humStat == "Warning")  (humStat == "Danger");
  digitalWrite(BUZZER_PIN, buzzerOn ? HIGH : LOW);
}

void updateLCD(float temp, float hum, int gas, String gasStat, String humStat) {
  lcd.clear();
  
  // Line 1: Temperature and Humidity
  lcd.setCursor(0, 0);
  lcd.print("T:");
  if (!isnan(temp)) {
    lcd.print(temp, 1);
    lcd.print("C");
  } else {
    lcd.print("ERR");
  }
  
  lcd.setCursor(9, 0);
  lcd.print("H:");
  if (!isnan(hum)) {
    lcd.print(hum, 0);
    lcd.print("%");
  } else {
    lcd.print("ERR");
  }
  
  // Line 2: Gas and Status
  lcd.setCursor(0, 1);
  lcd.print("G:");
  lcd.print(gas);
  
  lcd.setCursor(9, 1);
  lcd.print(gasStat.substring(0, 4));  // Show first 4 chars
}

int normalizedGas(int raw) {
  return map(raw, 843, 3500, 300, 1023);
}