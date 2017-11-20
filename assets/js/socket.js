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

  let existingRoom = $(`a[href="#${roomId}"]`).parent('li');
  if (existingRoom.length > 0)
  {
    setRoomActive(existingRoom);
    return;
  }
  
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
        roomItem.innerHTML = `<a href='#${roomId}'>${roomId}</a><input id='${roomId}-leave-button' type='button' class='leave-button' value='X'>`;
        roomItem.onclick = function (event) {
          event.preventDefault();
          setRoomActive(this);
        };
      
        rooms.append(roomItem);

        messages.append("<div id='" + roomId + "-messages' class='room-display'></div>");
        members.append("<div id='" + roomId + "-members' class='room-display'></div>");
        messageInputs.append("<div>" +
          "<input id='" + roomId + "-message-input' type='text' class='room-display text-input' placeholder='Type here to chat!'>" +
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
        
        $(`#${roomId}-leave-button`).click(function(event) {
          event.stopPropagation();
          channel.leave()
            .receive("ok", resp => {
              roomItem.remove();
              $(`#${roomId}-messages`).remove();
              $(`#${roomId}-members`).remove();
              $(`#${roomId}-message-input`).remove();
              $(`#${roomId}-send-button`).remove();
              let existingRooms = rooms.find("li");
              if (existingRooms.length > 0)
                setRoomActive(existingRooms[existingRooms.length - 1]);
            });
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
  $(roomItem).addClass("current");
  $(roomItem).siblings().removeClass("current");
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
  if (event.keyCode == 13)
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

roomInput.keydown(function(event) {
  let key = event.keyCode;

  if ((key >= 48 && key <= 90) || // a-z, 0-9
      (key >= 96 && key <= 105) || // num 0-9
      (key == 8)) // backspace
    return true;

  if (key == 13 && // enter
      roomInput.val() != "")
  {
    joinChannel("room:" + roomInput.val());
    roomInput.val("");
  }

  return false;
});

$(`#join-button`).click(function() {
  if (roomInput.val() != "")
  {
    joinChannel("room:" + roomInput.val());
    roomInput.val("");
  }
});

export default socket;
