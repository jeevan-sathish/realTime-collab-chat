import { useState, useRef, useEffect } from "react";

function App() {
  const [room, setRoom] = useState("");
  const [socket, setSocket] = useState(null);
  const [msg, setMsg] = useState("");
  const [messages, setMessages] = useState([]);
  const bottomRef = useRef(null);

  // 🔽 Auto scroll
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // ✅ Create Room
  const createRoom = async () => {
    const res = await fetch("http://localhost:8000/create-room");
    const data = await res.json();
    setRoom(data.room_id);
    alert("Room ID: " + data.room_id);
  };

  // ✅ Join Room
  const joinRoom = () => {
    if (!room) return alert("Enter Room ID");

    // close old socket if exists
    if (socket) socket.close();

    const ws = new WebSocket(`ws://127.0.0.1:8000/ws/${room}`);

    ws.onopen = () => {
      console.log("Connected ✅");
    };

    ws.onmessage = (event) => {
      setMessages((prev) => [...prev, "Friend: " + event.data]);
    };

    ws.onerror = () => {
      alert("Connection error ❌");
    };

    ws.onclose = () => {
      console.log("Disconnected ❌");
    };

    setSocket(ws);
  };

  // ✅ Send Message
  const sendMessage = () => {
    if (!socket || socket.readyState !== WebSocket.OPEN) {
      return alert("Not connected ❌");
    }

    socket.send(msg);
    setMessages((prev) => [...prev, "You: " + msg]);
    setMsg("");
  };

  // cleanup
  useEffect(() => {
    return () => socket?.close();
  }, [socket]);

  return (
    <div style={{ padding: 20 }}>
      <h2>2 User Chat 💬</h2>

      <button onClick={createRoom}>Create Room</button>

      <br />
      <br />

      <input
        placeholder="Enter Room ID"
        value={room}
        onChange={(e) => setRoom(e.target.value)}
      />
      <button onClick={joinRoom}>Join Room</button>

      <br />
      <br />

      <input
        placeholder="Message"
        value={msg}
        onChange={(e) => setMsg(e.target.value)}
      />
      <button onClick={sendMessage}>Send</button>

      <ul style={{ height: 200, overflowY: "auto" }}>
        {messages.map((m, i) => (
          <li key={i}>{m}</li>
        ))}
        <div ref={bottomRef} />
      </ul>
    </div>
  );
}

export default App;
