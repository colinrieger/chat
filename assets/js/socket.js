import {Socket, Presence} from "phoenix"

let socket = null;
let nameInput = $("#name-input");
let roomInput = $("#room-input");
let messageInputs = $("#message-inputs");
let messages = $("#messages");
let rooms = $("#rooms");
let members = $("#members");

function connectSocket(userId)
{
  socket = new Socket("/socket", { params: { user_id: userId } });
  socket.connect();
}

function joinChannel(room)
{
  let channel = socket.channel(room, {});
  let presences = {};
  let roomId = room.slice(room.indexOf(":") + 1);
  
  channel.on("message", payload => {
    addMessage(roomId, `${payload.user_id}: ${payload.body}`);
  });

  let onJoin = (id, current, newPres) => {
    addMessage(roomId, `${id} joined ${roomId}.`, "Gray");
  }
  let onLeave = (id, current, leftPres) => {
    addMessage(roomId, `${id} left ${roomId}.`, "Gray");
  }
  
  channel.on("presence_state", state => {
    presences = Presence.syncState(presences, state);
    setMembers(roomId, presences);
  });
  
  channel.on("presence_diff", diff => {
    presences = Presence.syncDiff(presences, diff, onJoin, onLeave);
    setMembers(roomId, presences);
  });
  
  channel.join()
    .receive("error", resp => { alert("Failed to join " + roomId); })
    .receive("ok", resp => {
        let roomItem = document.createElement("li");
        roomItem.innerHTML = `<a href='#${roomId}'>${roomId}</a>`;
        roomItem.onclick = function (event) {
          event.preventDefault();
          setRoomActive(this);
        };
      
        rooms.append(roomItem);

        messages.append("<div id='" + roomId + "-messages' class='room-display'></div>");
        members.append("<div id='" + roomId + "-members' class='room-display'></div>");
        messageInputs.append("<div>" +
          "<input id='" + roomId + "-message-input' type='text' class='room-display text-input' placeholder='Type here to chat!'></input>" +
          "<input id='" + roomId + "-send-button' type='button' class='room-display button-input' value='Send'>" +
          "</div>"
        );
        
        $(`#${roomId}-message-input`).keypress(function(event) {
          if (event.keyCode === 13)
            sendMessage(channel, roomId);
        });

        $(`#${roomId}-send-button`).click(function() {
          sendMessage(channel, roomId);
        });

        setRoomActive(roomItem);
    });
}

function sendMessage(channel, roomId)
{
  let messageInput = $(`#${roomId}-message-input`);
  if (messageInput.val() != "")
  {
    channel.push("message", {body: messageInput.val()});
    messageInput.val("");
  }
}

function setRoomActive(roomItem)
{
  //$(this).parent().addClass("current");
  //$(this).parent().siblings().removeClass("current");
  var active = $(roomItem).find('a').attr("href");
  $(".room-display").css("display", "none");
  $(`${active}-messages`).show();
  $(`${active}-members`).show();
  $(`${active}-message-input`).show();
  $(`${active}-send-button`).show();
}

function addMessage(roomId, message, color = "Black")
{
  let messageItem = document.createElement("li");
  messageItem.innerText = `[${new Date().toLocaleTimeString()}] ${message}`;
  messageItem.style.color = color;
  $(`#${roomId}-messages`).append(messageItem);
}

function setMembers(roomId, presences) {
  $(`#${roomId}-members`).empty();

  Presence.list(presences, (id, {metas: [first, ...rest]}) => {
    for (let i = 0; i <= rest.length; i++)
    {
      let memberItem = document.createElement("li");
      memberItem.innerText = `${id}`;
      $(`#${roomId}-members`).append(memberItem);
    }
  });
}

function connectAndJoin()
{
  if (nameInput.val() == "")
    return;
  connectSocket(nameInput.val());
  joinChannel("room:general");
  $("#name-dialog").dialog("close");
}

nameInput.keypress(function(event) {
  if (event.keyCode === 13)
    connectAndJoin();
});

$("#name-dialog").dialog({
  dialogClass: "no-close",
  modal : true,
  buttons: [
    {
      text: "Join",
      click: connectAndJoin
    }
  ]
});


        
roomInput.keypress(function(event) {
  if (event.keyCode === 13 && roomInput.val() != "")
  {
    joinChannel("room:" + roomInput.val());
    roomInput.val("");
  }
});

$(`#join-button`).click(function() {
  if (roomInput.val() != "")
  {
    joinChannel("room:" + roomInput.val());
    roomInput.val("");
  }
});

export default socket;
