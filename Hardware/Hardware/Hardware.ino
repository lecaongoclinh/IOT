#include <WiFi.h>
#include <PubSubClient.h>
#include <ArduinoJson.h>
#include <DHT.h>

// ================= WiFi + MQTT =================
const char* ssid = "LCNL";
const char* password = "mothaiba";
const char* mqtt_server = "172.20.10.3";   // IP Mosquitto broker

WiFiClient espClient;
PubSubClient client(espClient);

// ================= DHT11 =================
#define DHTPIN 21
#define DHTTYPE DHT11
DHT dht(DHTPIN, DHTTYPE);

// ================= LDR =================
#define LDR_PIN 36

// ================= LED =================
#define LED1_PIN 4
#define LED2_PIN 5
#define LED3_PIN 18

enum LedMode {OFF, ON, BLINK};
LedMode led1Mode = OFF;
LedMode led2Mode = OFF;
LedMode led3Mode = OFF;

unsigned long prevMillis = 0;
const long blinkInterval = 500; // 500ms nhấp nháy
bool led1State = false;
bool led2State = false;
bool led3State = false;


// ================= Cờ ack pending =================
bool ackLed1 = false;
bool ackLed2 = false;
bool ackLed3 = false;
String lastCmdLed1 = "";
String lastCmdLed2 = "";
String lastCmdLed3 = "";

void callback(char* topic, byte* payload, unsigned int length) {
  String message;
  for (int i = 0; i < length; i++) {
    message += (char)payload[i];
  }
  message.trim();

  Serial.print("Tin nhắn từ topic [");
  Serial.print(topic);
  Serial.print("]: ");
  Serial.println(message);

  StaticJsonDocument<200> doc;
  if (deserializeJson(doc, message)) {
    Serial.println("Lỗi parse JSON!");
    return;
  }

  if (doc.containsKey("led1")) {
    lastCmdLed1 = (const char*)doc["led1"];
    if (lastCmdLed1 == "on") led1Mode = ON;
    else if (lastCmdLed1 == "off") led1Mode = OFF;
    else if (lastCmdLed1 == "blink") led1Mode = BLINK;
    ackLed1 = true;  // đánh dấu cần gửi ack sau khi bật
  }

  if (doc.containsKey("led2")) {
    lastCmdLed2 = (const char*)doc["led2"];
    if (lastCmdLed2 == "on") led2Mode = ON;
    else if (lastCmdLed2 == "off") led2Mode = OFF;
    else if (lastCmdLed2 == "blink") led2Mode = BLINK;
    ackLed2 = true;
  }

  if (doc.containsKey("led3")) {
    lastCmdLed3 = (const char*)doc["led3"];
    if (lastCmdLed3 == "on") led3Mode = ON;
    else if (lastCmdLed3 == "off") led3Mode = OFF;
    else if (lastCmdLed3 == "blink") led3Mode = BLINK;
    ackLed3 = true;
  }
}


// ================= Kết nối MQTT =================
const char* mqtt_user = "NgocLinh";       // username Mosquitto
const char* mqtt_pass = "123456789";         // password tương ứng

void reconnect() {
  while (!client.connected()) {
    Serial.print("Kết nối MQTT...");
    // Thêm username/password vào connect
    if (client.connect("ESP32Client", mqtt_user, mqtt_pass)) {
      Serial.println("Thành công!");
      client.subscribe("esp32/control");  
    } else {
      Serial.print("Thất bại, rc=");
      Serial.println(client.state());
      delay(2000);
    }
  }
}


// ================= Setup =================
void setup() {
  Serial.begin(115200);
  pinMode(LED1_PIN, OUTPUT);
  pinMode(LED2_PIN, OUTPUT);
  pinMode(LED3_PIN, OUTPUT);

  WiFi.begin(ssid, password);
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  Serial.println("\nWiFi connected");

  client.setServer(mqtt_server, 1883);
  client.setCallback(callback);

  dht.begin();
}

// ================= Xử lý LED =================
void handleLedModes() {
  unsigned long currentMillis = millis();

  // LED1
  if (led1Mode == ON) {
    digitalWrite(LED1_PIN, HIGH);
    if (ackLed1) {
      sendAck("led1", lastCmdLed1);
      ackLed1 = false;
    }
  } else if (led1Mode == OFF) {
    digitalWrite(LED1_PIN, LOW);
    if (ackLed1) {
      sendAck("led1", lastCmdLed1);
      ackLed1 = false;
    }
  } else if (led1Mode == BLINK) {
    if (currentMillis - prevMillis >= blinkInterval) {
      led1State = !led1State;
      digitalWrite(LED1_PIN, led1State);
      prevMillis = currentMillis;
      if (ackLed1) {
        sendAck("led1", lastCmdLed1);
        ackLed1 = false;
      }
    }
  }

  // LED2
  if (led2Mode == ON) {
    digitalWrite(LED2_PIN, HIGH);
    if (ackLed2) {
      sendAck("led2", lastCmdLed2);
      ackLed2 = false;
    }
  } else if (led2Mode == OFF) {
    digitalWrite(LED2_PIN, LOW);
    if (ackLed2) {
      sendAck("led2", lastCmdLed2);
      ackLed2 = false;
    }
  } else if (led2Mode == BLINK) {
    if (currentMillis - prevMillis >= blinkInterval) {
      led2State = !led2State;
      digitalWrite(LED2_PIN, led2State);
      prevMillis = currentMillis;
      if (ackLed2) {
        sendAck("led2", lastCmdLed2);
        ackLed2 = false;
      }
    }
  }

  // LED3
  if (led3Mode == ON) {
    digitalWrite(LED3_PIN, HIGH);
    if (ackLed3) {
      sendAck("led3", lastCmdLed3);
      ackLed3 = false;
    }
  } else if (led3Mode == OFF) {
    digitalWrite(LED3_PIN, LOW);
    if (ackLed3) {
      sendAck("led3", lastCmdLed3);
      ackLed3 = false;
    }
  } else if (led3Mode == BLINK) {
    if (currentMillis - prevMillis >= blinkInterval) {
      led3State = !led3State;
      digitalWrite(LED3_PIN, led3State);
      prevMillis = currentMillis;
      if (ackLed3) {
        sendAck("led3", lastCmdLed3);
        ackLed3 = false;
      }
    }
  }
}
// ================= Hàm gửi ack =================
void sendAck(const char* led, String cmd) {
  StaticJsonDocument<128> ackDoc;
  ackDoc[led] = cmd;
  ackDoc["status"] = "ok";
  ackDoc["time"] = millis();  // thêm timestamp

  char buffer[128];
  size_t n = serializeJson(ackDoc, buffer);
  client.publish("esp32/ack", buffer, n);

  Serial.print("📤 Ack sent: ");
  Serial.println(buffer);
}

// ================= Loop =================
void loop() {
  if (!client.connected()) {
    reconnect();
  }
  client.loop();

  handleLedModes();  // xử lý bật/tắt/nhấp nháy LED

  
  static unsigned long lastSend = 0;
  if (millis() - lastSend >5000) {
    float h = dht.readHumidity();
    float t = dht.readTemperature();
    int ldrValue = analogRead(LDR_PIN);
    Serial.print("Humidity: "); Serial.println(h);
    Serial.print("Temperature: "); Serial.println(t);
    Serial.print("Light: "); Serial.println(ldrValue);

    if (!isnan(h) && !isnan(t)) {
        StaticJsonDocument<256> doc;
        doc["temperature"] = t;
        doc["humidity"] = h;
        doc["light"] = ldrValue;

        char buffer[256];
        size_t n = serializeJson(doc, buffer);
        client.publish("esp32/data", buffer, n);
        Serial.println("Đã gửi dữ liệu cảm biến:");
        Serial.println(buffer);
    }
    lastSend = millis();
  }
}
