defmodule ChatWeb.RoomChannel do
  use Phoenix.Channel
  alias ChatWeb.Presence

  def join("room:general", _message, socket) do
    send(self(), :after_join)
    {:ok, socket}
  end

  def join("room:" <> _private_room_id, _params, socket) do
    send(self(), :after_join)
    {:ok, socket}
  end
  
  def terminate(_reason, socket) do
    {:ok, socket}
  end

  def handle_info(:after_join, socket) do
    push socket, "presence_state", Presence.list(socket)
    {:ok, _} = Presence.track(socket, socket.assigns.user_id, %{
      online_at: inspect(System.system_time(:seconds))
    })
    {:noreply, socket}
  end
  
  def handle_in("message", %{"body" => body}, socket) do
    broadcast! socket, "message", %{user_id: socket.assigns.user_id, body: body}
    {:noreply, socket}
  end
end