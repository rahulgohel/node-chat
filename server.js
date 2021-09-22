const path = require('path');
const express = require('express');
const http = require('http');
const socketio = require('socket.io');
const formatMessage = require('./utils/messages');
const {userJoin, getCurrentUser, getRoomUsers, userLeave} = require('./utils/users');


const app = express();
const server = http.createServer(app);
const io = socketio(server);

//set static folder
app.use(express.static(path.join(__dirname, 'public')));

const boatName = 'ChatApp bot';

//run when client connect
io.on('connection', socket => {
    console.log('new ws connected');


    socket.on('joinRoom', ({username, room}) => {

        const user = userJoin(socket.id, username, room);

        socket.join(user.room);


        //Welcome message
        socket.emit('message', formatMessage(boatName, 'Welcome to chatAPP!'));

        //Broadcast When user connect
        socket.broadcast.to(user.room)
            .emit(
                'message',
                formatMessage(boatName, `${user.username} has join the chat`));


        //send users and room info
        io.to(user.room).emit('roomUsers', {
            room: user.room,
            users: getRoomUsers(user.room)
        });

    });


    //Run when user Disconnect
    socket.on('disconnect', () => {
        const user = userLeave(socket.id);

        if (user) {
            io.to(user.room).emit('message', formatMessage(boatName, `${user.username} has left chat App`));
        }
        //send users and room
        user && io.to(user.room).emit('roomUsers', {
            room: user.room,
            users: user.room && getRoomUsers(user.room)
        });

    });

    //listen for chatMessage
    socket.on('chatMessage', msg => {
        const user = getCurrentUser(socket.id);

        io.to(user.room).emit('message', formatMessage(user.username, msg))
    });

});


const PORT = 4000 || process.env.PORT;

server.listen(PORT, () => console.log(`Chat App running on port${PORT}`));