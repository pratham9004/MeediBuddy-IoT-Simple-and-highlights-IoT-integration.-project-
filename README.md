# MediBuddy-IoT

## Description
**MediBuddy-IoT** is an Android-based health monitoring and medication management application that leverages IoT technology to help users stay on track with their medication schedule. The system integrates ESP8266/ESP32 IoT devices and sensors to detect when a medicine has been taken, while Firebase ensures real-time data storage and notifications. 

This project aims to improve medication adherence by providing timely reminders, real-time tracking, and behavioral analytics to users and caregivers.

---

## Features
- **Medication Scheduling:** Set customizable reminders for different medicines and dosages.
- **Real-Time Notifications:** Receive push notifications when it’s time to take medicine.
- **IoT Integration:** ESP8266/ESP32 sensors detect whether medication has been taken.
- **Automatic Alerts:** If medicine is not taken on time, the system sends notifications.
- **Firebase Real-Time Tracking:** Logs medicine intake status and history.
- **User Authentication:** Secure login for users to manage their personal medication data.
- **Cross-Platform Support:** Developed using React Native and Expo for Android devices.

---

## Technology Stack
- **Frontend:** Android (Java), React Native, Expo
- **Backend:** Firebase (Authentication, Firestore Database)
- **IoT Devices:** ESP8266 / ESP32 microcontrollers
- **Sensors:** Magnetic Reed Switch Sensor, LED, Buzzer, Push Button
- **Build Tools:** Gradle

---

## How it Works
1. Users set up medication schedules in the MediBuddy app.
2. At the scheduled time, the app triggers an alert with LED and buzzer via the connected IoT device.
3. The user takes the medicine; the sensor detects this action.
4. The IoT device updates the status to Firebase in real-time.
5. If medicine is not taken within the alert period, the system sends a notification to the user or caregiver.
6. The app maintains a history of medication intake for analysis.

---

## Installation / Setup Instructions
1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/MediBuddy-IoT.git
Open in VS Code
Navigate to the project folder and open it in VS Code.

Install dependencies
For React Native/Expo:

bash
Copy code
npm install
Connect Firebase

Create a Firebase project.

Add google-services.json to the Android app folder.

Update Firestore rules if needed.

Configure IoT Device

Flash ESP8266/ESP32 with provided Arduino code.

Connect sensors (reed switch, buzzer, LED, push button) according to wiring diagram.

Run the App

bash
Copy code
expo start
Use Android Emulator or real device to test.

Usage
Open the MediBuddy app and sign in.

Add medication schedules with time, dosage, and reminder settings.

Wait for notifications at the scheduled times.

Take the medicine; the system will automatically track intake via the IoT device.

Check medication history and analytics in the app.

Screenshots
<img width="720" height="1600" alt="image" src="https://github.com/user-attachments/assets/b90ba6da-34b7-42f0-812f-a89305f85e7e" />
<img width="720" height="1600" alt="image" src="https://github.com/user-attachments/assets/cf2a2e78-c6ee-4155-bf91-37d8e441c68a" />
<img width="720" height="1600" alt="image" src="https://github.com/user-attachments/assets/3b016ee9-9b38-4d09-b9b8-95b42cf8dfca" />
<img width="720" height="1600" alt="image" src="https://github.com/user-attachments/assets/70886e0b-b892-453a-a73c-4e4a65be7345" />
blob:https://web.whatsapp.com/ce5d0c74-fa88-41e7-a07c-b4a64cd2c544
<img width="720" height="1600" alt="image" src="https://github.com/user-attachments/assets/24d57399-f491-4385-bb49-7d07ff9cefe0" />

