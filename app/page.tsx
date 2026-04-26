'use client';

import { useState, useEffect } from 'react';

export default function TekJeepAI() {
  const [currentVehicle, setCurrentVehicle] = useState<any>(null);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [chatMessages, setChatMessages] = useState<any[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isThinking, setIsThinking] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userEmail, setUserEmail] = useState('');

  // Load saved vehicle on mount
  useEffect(() => {
    const saved = localStorage.getItem('tekjeep_vehicle');
    if (saved) {
      const vehicle = JSON.parse(saved);
      setCurrentVehicle(vehicle);
    }
  }, []);

  const saveVehicle = () => {
    const year = (document.getElementById('year') as HTMLSelectElement).value;
    const make = (document.getElementById('make') as HTMLSelectElement).value;
    const model = (document.getElementById('model') as HTMLSelectElement).value;

    if (!year || !model) {
      alert("Please select Year and Model");
      return;
    }

    const vehicle = {
      year,
      make,
      model,
      transmission: (document.getElementById('transmission') as HTMLSelectElement).value || '',
      engine: (document.getElementById('engine') as HTMLSelectElement).value || '',
      liftHeight: (document.getElementById('liftHeight') as HTMLSelectElement).value || '',
      tireSize: (document.getElementById('tireSize') as HTMLInputElement).value.trim() || '',
      wheelSize: (document.getElementById('wheelSize') as HTMLInputElement).value.trim() || '',
      mileage: (document.getElementById('mileage') as HTMLInputElement).value || '',
      mods: (document.getElementById('mods') as HTMLTextAreaElement).value.trim() || ''
    };

    localStorage.setItem('tekjeep_vehicle', JSON.stringify(vehicle));
    setCurrentVehicle(vehicle);
  };

  const changeVehicle = () => {
    localStorage.removeItem('tekjeep_vehicle');
    setCurrentVehicle(null);
  };

  const sendMessage = async () => {
    if (!inputMessage.trim()) return;

    const userMsg = { text: inputMessage, isUser: true };
    setChatMessages(prev => [...prev, userMsg]);
    setInputMessage('');
    setIsThinking(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: inputMessage,
          vehicle: currentVehicle
        })
      });

      const data = await response.json();
      let reply = data.reply || "Sorry, something went wrong.";

      // Convert SEARCH lines to buttons
      reply = reply.replace(/Best Deal on eBay: SEARCH:(.+)/g, 
        '<a href="https://www.ebay.com/sch/i.html?_nkw=$1" target="_blank" class="deal-btn">🛒 Best Deal on eBay</a>');
      
      reply = reply.replace(/Best Deal on Amazon: SEARCH:(.+)/g, 
        '<a href="https://www.amazon.com/s?k=$1&tag=tekjeep-20" target="_blank" class="deal-btn">🛒 Best Deal on Amazon</a>');

      const botMsg = { text: reply, isUser: false };
      setChatMessages(prev => [...prev, botMsg]);
    } catch (error) {
      const errorMsg = { text: "Sorry, something went wrong. Try again.", isUser: false };
      setChatMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsThinking(false);
    }
  };

  return (
    <div className="bg-zinc-950 text-white min-h-screen">
      {/* Header */}
      <div className="border-b border-zinc-800 bg-black/95 py-4">
        <div className="max-w-4xl mx-auto px-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl flex items-center justify-center">
              <span className="text-3xl">🛠️</span>
            </div>
            <div>
              <h1 className="text-3xl font-bold tracking-tight">TekJeep AI</h1>
              <p className="text-xs text-zinc-400 -mt-0.5">Real Jeep Tech Answers</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <button onClick={() => setShowHistory(true)} className="text-sm px-3 py-1.5 rounded-2xl border border-zinc-700 hover:bg-zinc-900">History</button>
            <button onClick={() => setShowLogin(true)} className="text-sm px-4 py-1.5 rounded-2xl bg-zinc-800 hover:bg-zinc-700">
              {isLoggedIn ? userEmail.split('@')[0] : 'Login / Sign Up'}
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8">
        
        {/* Vehicle Selector */}
        {!currentVehicle && (
          <div className="max-w-md mx-auto">
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-orange-600 rounded-3xl flex items-center justify-center mx-auto mb-6">
                <span className="text-5xl">🛠️</span>
              </div>
              <h2 className="text-3xl font-bold mb-2">Welcome to TekJeep AI</h2>
              <p className="text-zinc-400">Tell me about your Jeep so I can give you accurate answers.</p>
            </div>

            <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-zinc-400 mb-1">Year</label>
                <select id="year" className="w-full bg-zinc-800 border border-zinc-700 rounded-2xl px-4 py-3 text-white">
                  <option value="">Select Year</option>
                  {/* ... all years from 1997 to 2026 ... */}
                </select>
              </div>
              {/* Add the rest of the vehicle selector fields here (same as before) */}
              <button onClick={saveVehicle} className="w-full bg-orange-600 hover:bg-orange-700 py-4 rounded-3xl font-semibold text-lg mt-4">Save My Jeep</button>
            </div>
          </div>
        )}

        {/* Main Chat Interface */}
        {currentVehicle && (
          <div>
            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl px-4 py-3 mb-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-orange-500">🛠️</span>
                <span className="font-medium">{currentVehicle.year} {currentVehicle.make} {currentVehicle.model}</span>
              </div>
              <button onClick={changeVehicle} className="text-xs text-zinc-400 hover:text-white">Change</button>
            </div>

            {/* Chat Area */}
            <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-5 h-[500px] overflow-y-auto space-y-6 mb-4" id="chat">
              {chatMessages.map((msg, index) => (
                <div key={index} className={`flex ${msg.isUser ? 'justify-end' : 'justify-start'}`}>
                  <div className={`chat-bubble ${msg.isUser ? 'user-bubble' : 'bot-bubble'}`} dangerouslySetInnerHTML={{ __html: msg.text }} />
                </div>
              ))}
              {isThinking && (
                <div className="flex justify-start">
                  <div className="chat-bubble bot-bubble">TekJeep AI is thinking...</div>
                </div>
              )}
            </div>

            {/* Input */}
            <div className="flex gap-3">
              <input 
                type="text" 
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                className="flex-1 bg-zinc-900 border border-zinc-700 focus:border-orange-500 rounded-3xl px-6 py-4 text-lg outline-none"
                placeholder="Ask about lift kits, LEDs, CarPlay..."
              />
              <button onClick={sendMessage} className="bg-orange-600 hover:bg-orange-700 px-8 py-4 rounded-3xl font-semibold">Send</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
