import {Socket, Presence} from "phoenix"

let socket = null;
let nameInput = document.querySelector("#name-input");
let messageInput = document.querySelector("#message-input");
let messages = document.querySelector("#messages");
let members = document.querySelector("#members");

function connectSocket(userId)
{
  socket = new Socket("/socket", { params: { user_id: userId } });
  socket.connect();
}

function joinChannel(room)
{
  let channel = socket.channel(room, {});
  let presences = {};
  
  messageInput.addEventListener("keypress", event => {
    if (event.keyCode === 13)
    {
      channel.push("message", {body: messageInput.value});
      messageInput.value = "";
    }
  });
  
  channel.on("message", payload => {
    addMessage(`[${new Date().toLocaleTimeString()}] ${payload.user_id}: ${payload.body}`);
  });

  let onJoin = (id, current, newPres) => {
    addMessage(`${id} has joined.`);
  }
  let onLeave = (id, current, leftPres) => {
    addMessage(`${id} has left.`);
  }
  
  channel.on("presence_state", state => {
    presences = Presence.syncState(presences, state);
    setMembers(presences);
  });
  
  channel.on("presence_diff", diff => {
    console.log("diff: " + JSON.stringify(diff));
    presences = Presence.syncDiff(presences, diff, onJoin, onLeave);
    setMembers(presences);
  });
  
  channel.join();
}

function addMessage(message)
{
  let messageItem = document.createElement("li");
  messageItem.innerText = message;
  messages.appendChild(messageItem);
}

function setMembers(presences) {
  members.innerHTML = "";

  Presence.list(presences, (id, {metas: [first, ...rest]}) => {
    for (let i = 0; i <= rest.length; i++)
    {
      let memberItem = document.createElement("li");
      memberItem.innerText = `${id}`;
      members.appendChild(memberItem);
    }
  });
}

function connectAndJoin()
{
  if (nameInput.value == "")
    return;
  connectSocket(nameInput.value);
  joinChannel("room:general");
  $("#name-dialog").dialog("close");
}

document.querySelector("#name-input").addEventListener("keypress", event => {
  if (event.keyCode === 13)
    connectAndJoin();
})

$("#name-dialog").dialog({
  dialogClass: "no-close",
  autoOpen : false,
  modal : true,
  buttons: [
    {
      text: "Join",
      click: connectAndJoin
    }
  ]
});
$("#name-dialog").dialog('open');

export default socket;
