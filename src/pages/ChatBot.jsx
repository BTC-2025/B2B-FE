import React, { useEffect, useState, useRef } from "react";
import { io } from "socket.io-client";
import NavBar from "../components/NavBar";
import { fetchChatMessages, fetchChatContacts } from "../services/api";

export default function ChatBot() {
  const [messages, setMessages] = useState([]);
  const [contacts, setContacts] = useState([]);
  const [selectedContact, setSelectedContact] = useState(null);
  const [input, setInput] = useState("");
  const [typingStatus, setTypingStatus] = useState("");
  const socketRef = useRef(null);
  const messagesEndRef = useRef(null);

  const userJson = localStorage.getItem("user");
  const currentUser = userJson ? JSON.parse(userJson) : null;

  // Initialize Socket Connection
  useEffect(() => {
    if (!currentUser) return;

    socketRef.current = io();

    // Register user to websocket
    socketRef.current.emit("register", currentUser._id);

    // Listen for new messages
    socketRef.current.on("new_message", (msg) => {
      if (selectedContact && (msg.sender === selectedContact._id || msg.recipient === selectedContact._id)) {
        setMessages((prev) => [...prev, msg]);
      }
    });

    // Listen for sender typing
    socketRef.current.on("typing_status", (data) => {
      if (selectedContact && data.senderId === selectedContact._id) {
        setTypingStatus(data.isTyping ? "Typing..." : "");
      }
    });

    // Clean up
    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, [currentUser, selectedContact]);

  // Load Contacts
  useEffect(() => {
    if (!currentUser) return;
    const getContacts = async () => {
      try {
        const data = await fetchChatContacts();
        setContacts(data);
        if (data.length > 0) {
          setSelectedContact(data[0]);
        }
      } catch (err) {
        console.error("Error loading chat contacts:", err);
      }
    };
    getContacts();
  }, [currentUser]);

  // Load Messages for Active Contact
  useEffect(() => {
    if (!selectedContact) return;
    const getMessages = async () => {
      try {
        const data = await fetchChatMessages(selectedContact._id);
        setMessages(data);
      } catch (err) {
        console.error("Error loading messages:", err);
      }
    };
    getMessages();
  }, [selectedContact]);

  // Auto scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = () => {
    if (!input.trim() || !selectedContact || !socketRef.current) return;

    const messageData = {
      senderId: currentUser._id,
      recipientId: selectedContact._id,
      text: input,
    };

    // Emit message to Socket server
    socketRef.current.emit("send_message", messageData);

    // Optimistically update message log locally
    const localMsg = {
      _id: Date.now().toString(),
      sender: currentUser._id,
      recipient: selectedContact._id,
      text: input,
      createdAt: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, localMsg]);
    setInput("");

    // Emit stop typing
    socketRef.current.emit("typing", {
      senderId: currentUser._id,
      recipientId: selectedContact._id,
      isTyping: false,
    });
  };

  const handleInputChange = (e) => {
    setInput(e.target.value);

    if (!selectedContact || !socketRef.current) return;

    // Emit typing status
    socketRef.current.emit("typing", {
      senderId: currentUser._id,
      recipientId: selectedContact._id,
      isTyping: e.target.value.length > 0,
    });
  };

  if (!currentUser) {
    return (
      <div className="bg-background h-screen flex flex-col">
        <NavBar />
        <main className="flex-1 flex flex-col items-center justify-center p-8">
          <div className="bg-white p-8 rounded-lg shadow-md text-center max-w-sm">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Please Log In</h2>
            <p className="text-gray-500 mb-6">You must be logged in to view message boards.</p>
            <a href="/seller-login" className="bg-primary text-white px-6 py-2 rounded-lg font-bold">
              Go to Login
            </a>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="bg-background h-screen flex flex-col">
      <NavBar />
      <main className="flex-1 p-4 md:p-8 flex max-w-7xl mx-auto w-full gap-6 overflow-hidden">
        {/* Contact List SideBar */}
        <div className="w-1/3 bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden flex flex-col">
          <div className="p-4 border-b border-gray-100 bg-gray-50/50">
            <h2 className="text-lg font-bold text-gray-800">Messages Contacts</h2>
          </div>
          <div className="flex-1 overflow-y-auto custom-scrollbar p-2 space-y-1">
            {contacts.length === 0 ? (
              <div className="text-center text-gray-400 py-12 text-sm">
                No conversations found.
              </div>
            ) : (
              contacts.map((contact) => (
                <div
                  key={contact._id}
                  onClick={() => setSelectedContact(contact)}
                  className={`p-3 rounded-lg cursor-pointer transition-colors flex items-center justify-between ${
                    selectedContact?._id === contact._id
                      ? "bg-primary/10 text-primary"
                      : "hover:bg-gray-50 text-gray-700"
                  }`}
                >
                  <div>
                    <h4 className="font-semibold text-sm">{contact.name}</h4>
                    <span className="text-xs text-gray-400 font-medium">
                      {contact.role}
                    </span>
                  </div>
                  <span className="w-2.5 h-2.5 rounded-full bg-green-500"></span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Messaging Box */}
        <div className="flex-1 bg-white rounded-xl shadow-md border border-gray-200 flex flex-col overflow-hidden">
          {selectedContact ? (
            <>
              {/* Header */}
              <div className="p-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
                <div>
                  <h3 className="font-bold text-gray-800">{selectedContact.name}</h3>
                  <span className="text-xs text-gray-400 font-semibold">{typingStatus || "Active"}</span>
                </div>
              </div>

              {/* Message log */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar bg-slate-50/30">
                {messages.map((msg) => (
                  <div
                    key={msg._id}
                    className={`flex ${
                      msg.sender === currentUser._id ? "justify-end" : "justify-start"
                    }`}
                  >
                    <div
                      className={`max-w-xs px-4 py-2.5 rounded-2xl shadow-sm text-sm leading-relaxed ${
                        msg.sender === currentUser._id
                          ? "bg-primary text-white rounded-tr-none"
                          : "bg-white border border-gray-100 text-gray-800 rounded-tl-none"
                      }`}
                    >
                      {msg.text}
                      <span className="block text-[9px] opacity-70 mt-1 text-right">
                        {new Date(msg.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                      </span>
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>

              {/* Footer Input */}
              <div className="p-4 border-t border-gray-100 flex gap-3">
                <input
                  type="text"
                  value={input}
                  onChange={handleInputChange}
                  onKeyDown={(e) => e.key === "Enter" && handleSend()}
                  className="flex-1 border border-gray-200 rounded-lg px-4 py-2 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                  placeholder={`Write a message to ${selectedContact.name}...`}
                />
                <button
                  onClick={handleSend}
                  className="bg-primary text-white px-6 py-2 rounded-lg text-sm font-bold shadow-md hover:bg-blue-700 transition-colors"
                >
                  Send
                </button>
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-gray-400">
              <span className="material-symbols-outlined text-5xl mb-2">forum</span>
              <p>Select a contact to start chatting</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
