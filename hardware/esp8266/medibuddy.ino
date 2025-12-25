// hardware/esp8266/medibuddy.ino
#include <ESP8266WiFi.h>
#include <ESP8266HTTPClient.h>
#include <WiFiClientSecureBearSSL.h>
#include <ArduinoJson.h>
#include <NTPClient.h>
#include <WiFiUdp.h>

const char* ssid = "YOUR_SSID";
const char* password = "YOUR_PASS";

const char* host = "us-central1-YOUR-PROJECT.cloudfunctions.net";
const char* functionPath = "/iotUpdate";
const char* secret = "MY_SECRET_TOKEN";

const int reedPin = D1; // Example pin for reed switch
bool lastReedState = HIGH;

String deviceId = "ESP01";
String userId = "user1"; // Set to actual user ID

WiFiUDP ntpUDP;
NTPClient timeClient(ntpUDP, "pool.ntp.org", 19800, 60000); // UTC+5:30 offset

// Function to post JSON
void postEvent(String cellId, String eventType) {
  if (WiFi.status() != WL_CONNECTED) return;

  // Create JSON
  StaticJsonDocument<200> doc;
  doc["cellId"] = cellId;
  doc["event"] = eventType; // "taken" or "missed"
  doc["timestamp"] = timeClient.getFormattedTime() + "Z"; // ISO-like
  doc["deviceId"] = deviceId;
  doc["userId"] = userId;

  char buf[256];
  serializeJson(doc, buf);

  // HTTPS request
  WiFiClientSecure client;
  client.setInsecure(); // NOTE: For production, validate certs
  HTTPClient https;
  String url = String("https://") + host + functionPath;
  https.begin(client, url);
  https.addHeader("Content-Type", "application/json");
  https.addHeader("x-medi-secret", secret);
  int code = https.POST((uint8_t*)buf, strlen(buf));
  if (code > 0) {
    String payload = https.getString();
    Serial.println("POST response: " + payload);
  } else {
    Serial.printf("POST failed, error: %s\n", https.errorToString(code).c_str());
  }
  https.end();
}

void setup() {
  Serial.begin(115200);
  pinMode(reedPin, INPUT_PULLUP);
  WiFi.begin(ssid, password);
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  Serial.println("WiFi connected");

  timeClient.begin();
  timeClient.update();
}

void loop() {
  timeClient.update();

  bool reed = digitalRead(reedPin);
  if (reed != lastReedState) {
    if (reed == LOW) { // Lid opened
      // For demo, assume cell1; in real, determine based on schedule or input
      String cellId = "cell1";
      postEvent(cellId, "taken");
    }
    lastReedState = reed;
  }
  delay(200);
}