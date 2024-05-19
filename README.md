# A Simple Node.js TCP Proxy
```
npm install
node app.js
```

## POST to start a new proxy:
`curl -X POST http://localhost:3000/spawn -H "Content-Type: application/json" -d '{"from":"localhost:8000", "to":"localhost:9000"}'`

## POST to kill a proxy:
`curl -X POST http://localhost:3000/kill -H "Content-Type: application/json" -d '{"pid":1234}'`

## GET list of processes
`curl http://localhost:3000/processes`
