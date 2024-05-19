const express = require('express');
const { spawn, ChildProcess } = require('child_process');
const app = express();
const port = 3000;

app.use(express.json());
app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});

let processCounter = 0;
const maxProcesses = 3;
const processes = {};

function spawnProcess(from, to) {
    if (processCounter >= maxProcesses) {
        return { error: 'Maximum process limit reached' };
    }

    const child = spawn('node', ['proxy_filter.js', from, to], {
        detached: true
    });

    console.log(`pid: ${child.pid}, from: ${from}, to: ${to}`);

    child.on('error', (err) => {
        console.log('Failed to start subprocess.');
    });

    child.on('exit', (code, signal) => {
        if (code === 0) {
            console.log(`Process ${child.pid} exited normally.`);
        } else if (code !== null) {
            console.log(`Process ${child.pid} exited with code ${code}`);
        } else if (signal !== null) {
            console.log(`Process ${child.pid} was killed by signal ${signal}`);
        } else {
            console.log(`Process ${child.pid} exited for unknown reasons`);
        }

        // Clean up the process reference
        delete processes[child.pid];
        processCounter--;
    });
    child.from_addr = from;
    child.to_addr = to;

    processes[child.pid] = child;
    processCounter++;

    return { pid: child.pid };
}

function killProcess(pid) {
    if (processes[pid]) {
        processes[pid].kill('SIGTERM');
        return { status: 'Terminated', pid };
    } else {
        return { error: 'Process not found' };
    }
}

// Endpoint to spawn a new process
app.post('/spawn', (req, res) => {
    const { from, to } = req.body;
    const result = spawnProcess(from, to);
    res.send(result);
});

app.get('/spawn/:from/:to', (req, res) => {
    const { from, to } = req.params;

    // Check and spawn process
    const result = spawnProcess(from, to);
    res.send(result);
});

// Endpoint to kill a process
app.post('/kill', (req, res) => {
    const { pid } = req.body;
    const result = killProcess(pid);
    res.send(result);
});

app.get('/killall', (req, res) => {
    for(const pid in processes){
        const result = killProcess(pid);
    }
    res.send('ok');
});

// Endpoint to list all processes
app.get('/processes', (req, res) => {
    const activeProcesses = Object.keys(processes).map(pid => ({
        pid: pid,
        from: processes[pid].from_addr,
        to: processes[pid].to_addr,
        status: 'Running'
    }));
    res.send(activeProcesses);
});

