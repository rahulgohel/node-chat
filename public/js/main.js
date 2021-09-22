const socket = io();
const chatForm = document.getElementById('chat-form');
const chatMessages = document.querySelector('.chat-messages');
const roomName = document.getElementById('room-name');
const userList = document.getElementById('users');

//Get username and room form url
const {username, room} = Qs.parse(location.search, {
    ignoreQueryPrefix: true
});
console.log(username, room);

//message from server
socket.on('message', message => {
    console.log(message);
    outputMessage(message);
    //Scroll down
    chatMessages.scrollTop = chatMessages.scrollHeight;
});


//join chat room

socket.emit('joinRoom', {username, room});

//Get room users
socket.on('roomUsers', ({room, users}) => {
    outputRoomName(room);
    outputUsers(users)
});

//message submit
chatForm.addEventListener('submit', (e) => {
    e.preventDefault();
    //get message from input

    const msg = e.target.elements.msg.value;

    //Emit message to server
    socket.emit('chatMessage', msg);

    /*CLEAR INPUT*/
    e.target.elements.msg.value = '';
    e.target.elements.msg.focus();
});

//output message to dom

function outputMessage(message) {
    const div = document.createElement('div');
    div.classList.add('message');
    div.innerHTML = `<div class="message">
                <p class="meta">${message.username} <span>${message.time}</span></p>
                <p class="text">
                    ${message.text}
                </p>
            </div>`;
    document.querySelector('.chat-messages').appendChild(div)
}

//add room name to dom
function outputRoomName(room) {
    roomName.innerText = room;
}

//add users name to dom
function outputUsers(users) {
    console.log({users});
    userList.innerHTML = `
        ${users.map(user => `<li>${user.username}</li>`).join('')}
    `;
}