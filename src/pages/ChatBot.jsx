import NavBar from "../components/NavBar";
import { useState } from "react";

export default function ChatBot() {
  const [messages, setMessages] = useState([
    { id: 1, sender: "bot", text: "Hello! How can I assist you today?" },
  ]);
  const [input, setInput] = useState("");

  const handleSend = () => {
    if (!input.trim()) return;
    setMessages([...messages, { id: Date.now(), sender: "user", text: input }]);
    setInput("");

    // Simulate bot response
    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        { id: Date.now(), sender: "bot", text: "I'm just a demo bot for now." },
      ]);
    }, 1000);
  };

  return (
    <div className="bg-background h-screen flex flex-col">
      <NavBar />
      <main className="flex-1 p-8 flex flex-col custom-scrollbar max-w-5xl mx-auto w-full">
        <div className="mb-4">
          <button
            onClick={() => window.history.back()}
            className="text-primary hover:underline font-medium"
          >
            ← Back
          </button>
        </div>
        <h1 className="text-2xl font-bold mb-4">Help Desk Chat</h1>

        <div className="flex-1 bg-white rounded-lg shadow p-4 flex flex-col overflow-hidden">
          <div className="flex-1 overflow-y-auto mb-4 space-y-4 custom-scrollbar p-2">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex ${
                  msg.sender === "user" ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  className={`max-w-xs px-4 py-2 rounded-lg ${
                    msg.sender === "user"
                      ? "bg-primary text-white"
                      : "bg-gray-200 text-gray-800"
                  }`}
                >
                  {msg.text}
                </div>
              </div>
            ))}
          </div>

          <div className="flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSend()}
              className="flex-1 border rounded-lg px-4 py-2"
              placeholder="Type a message..."
            />
            <button
              onClick={handleSend}
              className="bg-primary text-white px-6 py-2 rounded-lg"
            >
              Send
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
