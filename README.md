# Nexmosphere Serial Communication

This project enables communication between a **Nexmosphere controller** and a **web-based frontend** using **Node.js**, **Express**, **WebSockets**, and **SerialPort**. The server listens for incoming serial data and displays it in the frontend while allowing users to send commands to the Nexmosphere controller.

## 📌 Features
- **Send commands** to the Nexmosphere controller via a web interface
- **Receive real-time responses** from the Nexmosphere device
- **WebSocket integration** for instant data updates
- **Logging system** to track server events and received data

---

## 🚀 Setup Instructions

### **1️⃣ Install Dependencies**
Ensure you have [Node.js](https://nodejs.org/) installed, then install the required packages:

```sh
npm install express cors socket.io serialport fs
```

### **2️⃣ Configure Serial Port**
Modify the `server.js` file to match your Nexmosphere **COM port** and **baud rate**:

```javascript
const serialPortPath = 'COM3'; // Replace with correct COM port
const baudRate = 115200; // Adjust if needed
```

To find your COM port on **Windows**, run:
```sh
mode
```

### **3️⃣ Run the Server**
Start the server:
```sh
node server.js
```
Expected output:
```
🚀 Server running at http://localhost:3000
✅ Serial port COM3 opened successfully
```

### **4️⃣ Open the Frontend**
- Open `index.html` in a browser.
- Enter the **device code** (e.g., `X001A`) and **address** (e.g., `3`).
- Click **"Send Command"** to communicate with Nexmosphere.
- Received messages will appear under "Received Data".

---

## 📜 API Endpoints

### **POST /send-command**
Send a command to the Nexmosphere controller.

**Request Body:**
```json
{
  "command": "X001A[003]"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Command sent: X001A[003]"
}
```

---

## 🛠 Debugging & Troubleshooting
### **1️⃣ Check Serial Connection**
- Ensure the Nexmosphere controller is properly connected via USB.
- Run `mode COM3` (Windows) to confirm the port is active.

### **2️⃣ Fix Corrupt Data (� Characters in Logs)**
- Ensure **ASCII encoding** is used:
  ```javascript
  serialPort.on('data', (data) => {
      const receivedData = data.toString('ascii').trim();
  });
  ```
- Use **115200 baud rate** (default for Nexmosphere).

### **3️⃣ WebSocket Not Updating?**
- Check browser **console logs (F12 > Console)**.
- Restart the server and try again.

### **4️⃣ Port Already in Use?**
If you see `Error: Port is already open`, restart your PC or run:
```sh
taskkill /F /IM node.exe
```

---

## 📝 Logs
The server logs events in `server.log`, including:
```
[2025-01-29T09:16:22.051Z] 🚀 Server running at http://localhost:3000
[2025-01-29T09:16:25.285Z] 🔗 New WebSocket connection: 9SLxWPr_lVZ9X2Q1AAAB
[2025-01-29T09:16:30.605Z] 📩 Data received from Nexmosphere: X001A[003]
```

---

## 📌 Future Enhancements
- Implement **command history tracking**
- Support **multiple Nexmosphere controllers**
- Improve **error handling & retry mechanisms**

---

## 💡 Credits
Developed by **Tobian van Dijk** for interfacing with **Nexmosphere controllers** using Node.js.

---

## ⚖️ License
This project is licensed under the **MIT License**.

