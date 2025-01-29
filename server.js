const express = require('express');
const cors = require('cors');
const { SerialPort, Binding } = require('serialport');
const { Server } = require('socket.io');
const fs = require('fs');

const app = express();
const port = 3000;

app.use(cors());
app.use(express.json());

const log = (message) => {
    const timestamp = new Date().toISOString();
    const logMessage = `[${timestamp}] ${message}\n`;
    console.log(logMessage);
    fs.appendFileSync('server.log', logMessage);
};

// const serialPortPath = '/dev/ttyUSB0'; // Voor Linux
const serialPortPath = 'COM5'; // Voor Windows kan ook com4 of 3 zijn

const serialPort = new SerialPort({
    path: serialPortPath,
    baudRate: 115200,
    dataBits: 8,
    parity: 'none',
    stopBits: 1,
    flowControl: false
});


serialPort.on('error', (err) => {
    log(`❌ Serial port error: ${err.message}`);
});

const server = app.listen(port, () => {
    log(`🚀 Server running at http://localhost:${port}`);
});
const io = new Server(server, {
    cors: {
        origin: '*',
    }
});

io.on('connection', (socket) => {
    log(`🔗 New WebSocket connection: ${socket.id}`);

    socket.on('disconnect', () => {
        log(`❌ WebSocket disconnected: ${socket.id}`);
    });
});

let buffer = '';




serialPort.on('data', (data) => {
    const chunk = data.toString('ascii'); 
    buffer += chunk; 
    const datatobian = buffer.trim();

    if (buffer.includes('\r') || buffer.includes('\n')) {
        const receivedData = buffer.trim(); // Remove any extra spaces
        log(`📩 Data received from Nexmosphere: ${receivedData}`);
        
        io.emit('nexmosphereData', receivedData); // Send to frontend
        buffer = ''; // Clear buffer after processing
    }
});

Binding.list().then(ports => {
    console.log("Available Ports:", ports);
}).catch(err => console.error(err));


app.post('/send-command', (req, res) => {
    const { command } = req.body;

    if (!command) {
        log('⚠️ Invalid request: Command required');
        return res.status(400).json({ error: 'Command is required' });
    }

    // Convert the command to ASCII buffer
    const asciiCommand = Buffer.from(command, 'ascii');

    serialPort.write(asciiCommand, (err) => {
        if (err) {
            log(`❌ Error sending command: ${err.message}`);
            return res.status(500).json({ error: 'Failed to send command' });
        }

        log(`✅ Command sent in ASCII: ${command}`);
        res.json({ success: true, message: `Command sent: ${command}` });
    });
});



// Device Detection  - For auto

const deviceTypes = {
    'XRDR': 'RFID Reader',
    'XBTN': 'XT-Buttons',
    'XSNS': 'Sensor Module',
    'XLEDR': 'LED Controller',
    'XSLD': 'Slider Module',
    'X-EYE': 'Presence Sensor',
    'XT-EF': 'Air Gesture Sensor',
    'XZ-W21': 'Weight Sensor',
    'X-Light': 'LED Control Module',
    'X-Audio': 'Audio Module',
    'XE-ALS': 'Ambient Light Sensor',
    'XE-TEMP': 'Temperature Sensor',
    'XS-Snapper': 'Magnetic Pick-Up Sensor',
    'XV-Gesture': 'Hand Gesture Sensor',
    'XQ-Lidar': 'Lidar Sensor'
};

let detectedDevice = 'Unknown Device';

serialPort.open((err) => {
    if (err) {
        log(`❌ Failed to open serial port: ${err.message}`);
    } else {
        log(`✅ Serial port ${serialPortPath} opened successfully`);
        detectDeviceType();
    }
});


// Send identification request
function detectDeviceType() {
    const command = 'XKF\r'; // XKF command to request device info
    serialPort.write(Buffer.from(command, 'ascii'), (err) => {
        if (err) {
            log(`❌ Error sending identification command: ${err.message}`);
        } else {
            log(`🔍 Sent device identification request`);
        }
    });
}

// Parse device response
function detectDeviceFromResponse(response) {
    for (const [key, device] of Object.entries(deviceTypes)) {
        if (response.includes(key)) {
            detectedDevice = device;
            log(`✅ Detected Device: ${device}`);
            io.emit('deviceDetected', device); // Send to frontend
            break;
        }
    }
}