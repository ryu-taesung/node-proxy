const net = require('node:net');
const fs = require('fs');

// Parse "80" and "localhost:80" or even "42mEANINg-life.com:80"
const addrRegex = /^(([a-zA-Z\-\.0-9]+):)?(\d+)$/;

const addr = {
    from: addrRegex.exec(process.argv[2]),
    to: addrRegex.exec(process.argv[3])
};

if (!addr.from || !addr.to) {
    console.log('Usage: <from> <to>');
    return;
}

// Specify IP addresses to allow and time range for filtering
let allowedIPs = ['127.0.0.1', '192.168.1.100'];
let denyIPs = [];
const startTime = '08:00';
const endTime = '23:59';

// Function to check if current time is within the allowed range
const isTimeAllowed = () => {
    return true; // for now
    const now = new Date();
    const [startHour, startMinute] = startTime.split(':').map(Number);
    const [endHour, endMinute] = endTime.split(':').map(Number);

    const start = new Date(now);
    start.setHours(startHour, startMinute, 0);

    const end = new Date(now);
    end.setHours(endHour, endMinute, 0);

    return now >= start && now <= end;
};

// Function to log connections
const logConnection = (info) => {
    const logLine = `${new Date().toISOString()} - ${info}`;
    console.log(logLine);
//    fs.appendFileSync('connections.log', logLine);
};

net.createServer(function (from) {
    const clientAddress = from.remoteAddress;
    logConnection(`Connection attempt from ${clientAddress}`);

    // Check if IP is allowed
    if (denyIPs.includes(clientAddress)) {
        logConnection(`Blocked connection from ${clientAddress}: IP not allowed`);
        from.destroy();
        return;
    }

    // Check if current time is within allowed range
    if (!isTimeAllowed()) {
        logConnection(`Blocked connection from ${clientAddress}: Outside allowed time range`);
        from.destroy();
        return;
    }

    const to = net.createConnection({
        host: addr.to[2],
        port: addr.to[3]
    });

    from.pipe(to).on('error', (err) => {
        logConnection(`Error on piping to destination: ${err.message}`);
        console.log(err);
    });

    to.pipe(from).on('error', (err) => {
        logConnection(`Error on piping from destination: ${err.message}`);
        console.log(err);
    });

    from.on('close', () => {
        logConnection(`Connection from ${clientAddress} closed`);
    });

    to.on('close', () => {
        logConnection(`Connection to destination ${addr.to[2]}:${addr.to[3]} closed`);
    });

}).on('error', (err) => {
    logConnection(`Server error: ${err.message}`);
    console.log(err);
}).listen(addr.from[3], addr.from[2], () => {
    logConnection(`Server listening on ${addr.from[2]}:${addr.from[3]}`);
});
