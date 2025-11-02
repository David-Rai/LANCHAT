import React, { useState, useRef, useEffect } from "react";
import axios from "axios";
import { io } from "socket.io-client";
import { IP, PORT } from "../../config.js";

const App = () => {
  const [client] = useState(() => io(`${IP}:${PORT}`));
  const nameRef = useRef(null);
  const [username, setUsername] = useState(null);
  const [isFileSelected, setIsFileSelected] = useState(false);
  const [created, setCreated] = useState(false);
  const [messages, setMessages] = useState([]);
  const messageRef = useRef(null);
  const messagesEndRef = useRef(null);
  const [file, setFile] = useState("");
  const [files, setFiles] = useState([]);

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
    client.on("join-message", (newUser) => {
      setMessages((prevMessages) => [
        ...prevMessages,
        { system: true, message: `${newUser} joined the chat` },
      ]);
    });

    client.on("message", (message) => {
      setMessages((prevMessages) => [...prevMessages, message]);
    });

    client.on("leave-message", (user) => {
      setMessages((prevMessages) => [
        ...prevMessages,
        { system: true, message: `${user} left the chat` },
      ]);
    });

    client.on("new-file-upload", () => {
      getFiles();
    });

    return () => {
      client.off("join-message");
      client.off("message");
      client.off("new-file-upload");
      client.off("leave-message");
    };
  }, [client]);

  const handleJoin = () => {
    if (nameRef.current.value.trim()) {
      client.emit("name", nameRef.current.value);
      setCreated(true);
      setUsername(nameRef.current.value);
    } else {
      alert("Please enter your name");
    }
  };

  const sendFile = async () => {
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await axios.post(`http://${IP}:${PORT}/upload`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setFile(null);
      setIsFileSelected(false);
      getFiles();
    } catch (err) {
      console.error(err);
    }
  };

  const handleSend = () => {
    if (isFileSelected) {
      sendFile();
      return;
    }
    if (messageRef.current.value.trim()) {
      client.emit("send-message", {
        message: messageRef.current.value,
        name: username,
      });
      messageRef.current.value = "";
    } else {
      alert("Enter a message");
    }
  };

  const handleKeyPress = (e, action) => {
    if (e.key === "Enter") action();
  };

  const handleFileChange = (e) => {
    if (isFileSelected) return;
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      setIsFileSelected(true);
    }
  };

  const getFiles = async () => {
    try {
      const res = await fetch(`http://${IP}:${PORT}/files`);
      const data = await res.json();
      setFiles(data);
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    getFiles();
  }, []);

  const handleDownload = async (fileUrl, fileName) => {
    const link = document.createElement("a");
    const SERVER_URL = `http://${IP}:${PORT}${fileUrl}`;
    const response = await fetch(SERVER_URL);
    const blob =await response.blob();
    link.href = URL.createObjectURL(blob);
    document.body.appendChild(link);
    link.download = fileName;
    link.click();
    URL.revokeObjectURL(link.href);
    link.remove();
  };

  return (
    <main className="h-screen w-full flex items-center justify-center bg-[#1e1f22]">
      {created ? (
        <div className="h-full w-full max-w-6xl flex bg-[#313338] sm:rounded-lg sm:h-[95vh] sm:my-auto">
          <aside className="w-64 bg-[#2b2d31] p-4 overflow-y-auto border-r border-[#202225]">
            <h2 className="text-white text-lg mb-4 font-semibold">
              Files on Chat
            </h2>
            <ul className="space-y-2">
              {files.map((file) => (
                <li key={file.name}>
                  <a
                    href={`http://${IP}:${PORT}${file.url}`}
                    target="_blank"
                    rel="noreferrer"
                    className="text-[#b5bac1] hover:text-white text-sm"
                  >
                    {file.name}
                  </a>
                  <p onClick={() => handleDownload(file.url, file.name)}>
                    download
                  </p>
                </li>
              ))}
            </ul>
          </aside>

          <div className="flex-1 flex flex-col">
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-[#313338]">
              {messages.map((m, index) =>
                m.system ? (
                  <div
                    key={index}
                    className="text-center text-[#949ba4] text-sm italic my-2"
                  >
                    {m.message}
                  </div>
                ) : (
                  <div
                    key={index}
                    className={`flex w-full ${
                      m.sender_id === client.id
                        ? "justify-end"
                        : "justify-start"
                    }`}
                  >
                    <div className="flex items-start gap-3 max-w-[80%]">
                      {m.sender_id !== client.id && (
                        <div className="w-10 h-10 rounded-full bg-[#5865f2] flex items-center justify-center font-semibold text-white">
                          {m.sender_name.charAt(0).toUpperCase()}
                        </div>
                      )}
                      <div
                        className={`flex flex-col ${
                          m.sender_id === client.id
                            ? "items-end"
                            : "items-start"
                        }`}
                      >
                        <div className="flex items-baseline gap-2 mb-1">
                          <span className="text-sm font-semibold text-white">
                            {m.sender_name}
                          </span>
                          <span className="text-xs text-[#949ba4]">
                            {new Date().toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </span>
                        </div>
                        <div
                          className={`px-4 py-2 rounded-lg ${
                            m.sender_id === client.id
                              ? "bg-[#5865f2] text-white"
                              : "bg-[#2b2d31] text-[#dbdee1]"
                          }`}
                        >
                          <p className="break-words">{m.message}</p>
                        </div>
                      </div>
                      {m.sender_id === client.id && (
                        <div className="w-10 h-10 rounded-full bg-[#5865f2] flex items-center justify-center font-semibold text-white">
                          {m.sender_name.charAt(0).toUpperCase()}
                        </div>
                      )}
                    </div>
                  </div>
                )
              )}
              <div ref={messagesEndRef} />
            </div>

            <div className="bg-[#313338] p-4 border-t border-[#202225]">
              <div className="flex gap-2 items-center bg-[#383a40] rounded-lg px-4 py-1">
                <button className="text-white text-[30px]">
                  <label className="cursor-pointer" htmlFor="fileInput">
                    +
                  </label>
                  <input
                    type="file"
                    className="hidden"
                    id="fileInput"
                    onChange={handleFileChange}
                  />
                </button>
                {isFileSelected && <p>{file.name}</p>}
                <input
                  type="text"
                  placeholder="Message..."
                  ref={messageRef}
                  onKeyPress={(e) => handleKeyPress(e, handleSend)}
                  className="flex-1 bg-transparent text-[#dbdee1] placeholder-[#6d7178] py-3 focus:outline-none"
                />
                <button
                  onClick={handleSend}
                  className="px-4 py-2 bg-[#5865f2] hover:bg-[#4752c4] text-white rounded-md font-medium transition-colors duration-200"
                >
                  Send
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-[#313338] shadow-2xl w-[90%] max-w-md p-8 flex flex-col gap-6 rounded-lg">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-white mb-2">
              Welcome back!
            </h2>
            <p className="text-[#b5bac1] text-sm">
              We're so excited to see you again!
            </p>
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-xs font-semibold text-[#b5bac1] uppercase">
              Username
            </label>
            <input
              type="text"
              placeholder="Enter your name"
              ref={nameRef}
              onKeyPress={(e) => handleKeyPress(e, handleJoin)}
              className="px-4 py-3 w-full rounded bg-[#1e1f22] border border-[#1e1f22] text-[#dbdee1] placeholder-[#6d7178] focus:outline-none focus:border-[#5865f2]"
            />
          </div>
          <button
            onClick={handleJoin}
            className="w-full py-3 rounded bg-[#5865f2] hover:bg-[#4752c4] text-white font-medium transition-colors duration-200"
          >
            Join Room
          </button>
        </div>
      )}
    </main>
  );
};

export default App;
