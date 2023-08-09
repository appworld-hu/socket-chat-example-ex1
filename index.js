const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app);
const {Server} = require('socket.io');
const io = new Server(server)


app.get('/', (req, res)=>{
    res.sendFile(__dirname+'/index.html')
})

io.on('connection', (socket)=>{
    console.log('User connected')
    
    socket.on('disconnect', (reason)=>{
        console.log('user disconnected', reason)
    })

    socket.on('chat message', (message)=>{
        io.emit('chat message', message)
    })
})

server.listen(3000)