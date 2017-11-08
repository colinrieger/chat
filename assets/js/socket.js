import {Socket, Presence} from "phoenix"

var socket = null;

function connectSocket(userId)
{
  socket = new Socket("/socket", {
    params: { user_id: userId }
  })
  socket.connect();
}

function joinChannel(room)
{
  let channel       = socket.channel(room, {});
  let messageInput  = document.querySelector("#message-input");
  let messages      = document.querySelector("#messages");
  let presences     = {};
  
  messageInput.addEventListener("keypress", event => {
    if (event.keyCode === 13)
    {
      channel.push("message", {body: messageInput.value});
      messageInput.value = "";
    }
  })
  
  channel.on("message", payload => {
    let messageItem = document.createElement("li");
    messageItem.innerText = `[${new Date().toLocaleTimeString()}] ${payload.user_id}: ${payload.body}`;
    messages.appendChild(messageItem);
  })
  
  channel.on("presence_state", state => {
    presences = Presence.syncState(presences, state);
    setMembers(presences);
  })
  
  channel.on("presence_diff", diff => {
    presences = Presence.syncDiff(presences, diff);
    setMembers(presences);
  })
  
  channel.join()
    .receive("ok", resp => { console.log("Joined " + room + " successfully", resp) })
    .receive("error", resp => { console.log("Unable to join " + room, resp) });
}

function setMembers(presences) {
  let members = document.querySelector("#members");
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

$("#name-dialog").dialog({
  dialogClass: "no-close",
  autoOpen : false,
  modal : true,
  buttons: [
    {
      text: "Join",
      click: function() {
        let nameInput = document.querySelector("#name-input");
        connectSocket(nameInput.value);
        joinChannel("room:general");
        $(this).dialog("close");
      }
    }
  ]
});
$("#name-dialog").dialog('open');

export default socket;
