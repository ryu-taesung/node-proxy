//from: https://stackoverflow.com/a/19637388

var net = require('node:net');

// parse "80" and "localhost:80" or even "42mEANINg-life.com:80"
const addrRegex = /^(([a-zA-Z\-\.0-9]+):)?(\d+)$/;

const addr = {
    from: addrRegex.exec(process.argv[2]),
    to: addrRegex.exec(process.argv[3])
};

if (!addr.from || !addr.to) {
    console.log('Usage: <from> <to>');
    return;
}

net.createServer(function(from) {
    const to = net.createConnection({
        host: addr.to[2],
        port: addr.to[3]
    });
    from.pipe(to).on('error', (err)=>{console.log(err)});
    to.pipe(from).on('error', (err)=>{console.log(err)});
}).on('error',(err)=>{console.log(err);}).listen(addr.from[3], addr.from[2]);
