import React, { useState, useRef, useEffect } from "react";
import { io } from "socket.io-client";
import {IP,PORT} from '../../config.js'

const App = () => {
  const [client] = useState(() => io(`${IP}:${PORT}`));
  const nameRef = useRef(null);
  const [created, setCreated] = useState(false);
  const [messages, setMessages] = useState([]);
  const messageRef = useRef(null);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (created && messageRef.current) {
      messageRef.current.focus();
    } else if (!created && nameRef.current) {
      nameRef.current.focus();
    }
  }, [created]);

  useEffect(() => {
    client.on("join-message", (message) => {
      alert(message);
    });

    client.on("message", (message) => {
      setMessages((prevMessages) => [...prevMessages, message]);
    });

    client.on('leave-message', message => {
      alert(`${message} leaved`);
    });

    return () => {
      client.off("join-message");
      client.off("message");
      client.off("leave-message");
    };
  }, [client]);

//Joining the room with username
  const handleJoin = () => {
    if (nameRef.current.value.trim()) {
      client.emit("name", nameRef.current.value);
      setCreated(true);
    } else {
      alert("k ko timro nam ?");
    }
  };

  const handleSend = () => {
    if (messageRef.current.value.trim()) {
      client.emit("send-message", messageRef.current.value);
      messageRef.current.value = "";
    } else {
      alert("Message at lekha yrr");
    }
  };

  const handleKeyPress = (e, action) => {
    if (e.key === "Enter") {
      action();
    }
  };

  return (
    <main className="h-screen w-full flex items-center justify-center bg-gradient-to-br from-slate-100 to-slate-200">
      {created ? (
        <div className="h-full w-full max-w-4xl flex flex-col bg-white shadow-2xl sm:rounded-lg sm:h-[95vh] sm:my-auto">
          <div className="flex-1 overflow-y-auto p-4 space-y-2">
            {messages.map((m, index) => (
              <div
                key={index}
                className={`flex w-full ${
                  m.sender_id === client.id ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  className={`max-w-[75%] sm:max-w-[60%] px-4 py-2 rounded-2xl shadow-sm ${
                    m.sender_id === client.id
                      ? "bg-blue-600 text-white rounded-br-sm"
                      : "bg-gray-200 text-gray-800 rounded-bl-sm"
                  }`}
                >
                  <p className="break-words">{m.message}</p>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          <div className="border-t bg-white p-4 flex gap-2 items-center">
            <input
              type="text"
              placeholder="Type a message..."
              ref={messageRef}
              onKeyPress={(e) => handleKeyPress(e, handleSend)}
              className="flex-1 px-4 py-3 rounded-full border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <button
              onClick={handleSend}
              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-full font-medium transition-colors duration-200 whitespace-nowrap"
            >
              Send
            </button>
          </div>
        </div>
      ) : (
        <div className="bg-white shadow-2xl w-[90%] max-w-md p-8 flex flex-col gap-4 rounded-2xl">
          <h2 className="text-2xl font-bold text-gray-800 text-center mb-2">Join Chat Room</h2>
          <input
            type="text"
            placeholder="Enter your name"
            ref={nameRef}
            onKeyPress={(e) => handleKeyPress(e, handleJoin)}
            className="px-4 py-3 w-full rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <button
            onClick={handleJoin}
            className="w-full py-3 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-medium transition-colors duration-200"
          >
            Join Room
          </button>
        </div>
      )}
    </main>
  );
};

export default App;