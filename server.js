const express = require('express');
const cors = require('cors');
const { SerialPort } = require('serialport');
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

    if (buffer.includes('\r') || buffer.includes('\n')) {
        const receivedData = buffer.trim(); // Remove any extra spaces
        log(`📩 Data received from Nexmosphere: ${receivedData}`);
        
        io.emit('nexmosphereData', receivedData); // Send to frontend
        buffer = ''; // Clear buffer after processing
    }
});

app.post('/send-command', (req, res) => {
    const { command } = req.body;

    if (!command) {
        log('⚠️ Invalid request: Command required');
        return res.status(400).json({ error: 'Command is required' });
    }

    serialPort.write(command, (err) => {
        if (err) {
            log(`❌ Error sending command: ${err.message}`);
            return res.status(500).json({ error: 'Failed to send command' });
        }

        log(`✅ Command sent: ${command}`);
        res.json({ success: true, message: `Command sent: ${command}` });
    });
});
