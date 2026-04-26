'use client';

import { useState, useEffect } from 'react';

export default function TekJeepAI() {
  const [currentVehicle, setCurrentVehicle] = useState<any>(null);
  const [chatMessages, setChatMessages] = useState<any[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isThinking, setIsThinking] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('tekjeep_vehicle');
    if (saved) {
      setCurrentVehicle(JSON.parse(saved));
    }
  }, []);

  const saveVehicle = () => {
    const year = (document.getElementById('year') as HTMLSelectElement)?.value;
    const make = (document.getElementById('make') as HTMLSelectElement)?.value;
    const model = (document.getElementById('model') as HTMLSelectElement)?.value;

    if (!year || !model) {
      alert("Please select Year and Model");
      return;
    }

    const vehicle = {
      year,
      make,
      model,
      transmission: (document.getElementById('transmission') as HTMLSelectElement)?.value || '',
      engine: (document.getElementById('engine') as HTMLSelectElement)?.value || '',
      liftHeight: (document.getElementById('liftHeight') as HTMLSelectElement)?.value || '',
      tireSize: (document.getElementById('tireSize') as HTMLInputElement)?.value.trim() || '',
      wheelSize: (document.getElementById('wheelSize') as HTMLInputElement)?.value.trim() || '',
      mileage: (document.getElementById('mileage') as HTMLInputElement)?.value || '',
      mods: (document.getElementById('mods') as HTMLTextAreaElement)?.value.trim() || ''
    };

    localStorage.setItem('tekjeep_vehicle', JSON.stringify(vehicle));
    setCurrentVehicle(vehicle);
  };

  const changeVehicle = () => {
    localStorage.removeItem('tekjeep_vehicle');
    setCurrentVehicle(null);
    window.location.reload();
  };

  const sendMessage = async () => {
    if (!inputMessage.trim()) return;

    setChatMessages(prev => [...prev, { text: inputMessage, isUser: true }]);
    setInputMessage('');
    setIsThinking(true);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: inputMessage, vehicle: currentVehicle })
      });

      const data = await res.json();
      let reply = data.reply || "Sorry, something went wrong.";

      reply = reply.replace(/Best Deal on eBay: SEARCH:(.+)/g, 
        '<a href="https://www.ebay.com/sch/i.html?_nkw=$1" target="_blank" class="deal-btn">🛒 Best Deal on eBay</a>');
      
      reply = reply.replace(/Best Deal on Amazon: SEARCH:(.+)/g, 
        '<a href="https://www.amazon.com/s?k=$1&tag=tekjeep-20" target="_blank" class="deal-btn">🛒 Best Deal on Amazon</a>');

      setChatMessages(prev => [...prev, { text: reply, isUser: false }]);
    } catch (err) {
      setChatMessages(prev => [...prev, { text: "Sorry, something went wrong. Try again.", isUser: false }]);
    } finally {
      setIsThinking(false);
    }
  };

  return (
    <div className="bg-zinc-950 text-white min-h-screen">
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
            <button className="text-sm px-3 py-1.5 rounded-2xl border border-zinc-700 hover:bg-zinc-900">History</button>
            <button className="text-sm px-4 py-1.5 rounded-2xl bg-zinc-800 hover:bg-zinc-700">Login / Sign Up</button>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8">
        {!currentVehicle ? (
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
                  <option value="1997">1997</option>
                  <option value="1998">1998</option>
                  <option value="1999">1999</option>
                  <option value="2000">2000</option>
                  <option value="2001">2001</option>
                  <option value="2002">2002</option>
                  <option value="2003">2003</option>
                  <option value="2004">2004</option>
                  <option value="2005">2005</option>
                  <option value="2006">2006</option>
                  <option value="2007">2007</option>
                  <option value="2008">2008</option>
                  <option value="2009">2009</option>
                  <option value="2010">2010</option>
                  <option value="2011">2011</option>
                  <option value="2012">2012</option>
                  <option value="2013">2013</option>
                  <option value="2014">2014</option>
                  <option value="2015">2015</option>
                  <option value="2016">2016</option>
                  <option value="2017">2017</option>
                  <option value="2018">2018</option>
                  <option value="2019">2019</option>
                  <option value="2020">2020</option>
                  <option value="2021">2021</option>
                  <option value="2022">2022</option>
                  <option value="2023">2023</option>
                  <option value="2024">2024</option>
                  <option value="2025">2025</option>
                  <option value="2026">2026</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-400 mb-1">Make</label>
                <select id="make" className="w-full bg-zinc-800 border border-zinc-700 rounded-2xl px-4 py-3 text-white">
                  <option value="Jeep">Jeep</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-400 mb-1">Model</label>
                <select id="model" className="w-full bg-zinc-800 border border-zinc-700 rounded-2xl px-4 py-3 text-white">
                  <option value="">Select Model</option>
                  <option value="Wrangler TJ">Wrangler TJ (1997-2006)</option>
                  <option value="Wrangler JK">Wrangler JK (2007-2018)</option>
                  <option value="Wrangler JL">Wrangler JL (2018+)</option>
                  <option value="Gladiator JT">Gladiator JT</option>
                </select>
              </div>

              <button onClick={saveVehicle} className="w-full bg-orange-600 hover:bg-orange-700 py-4 rounded-3xl font-semibold text-lg mt-4">Save My Jeep</button>
            </div>
          </div>
        ) : (
          <div>
            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl px-4 py-3 mb-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-orange-500">🛠️</span>
                <span className="font-medium">{currentVehicle.year} {currentVehicle.make} {currentVehicle.model}</span>
              </div>
              <button onClick={changeVehicle} className="text-xs text-zinc-400 hover:text-white">Change</button>
            </div>

            <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-5 h-[500px] overflow-y-auto space-y-6 mb-4">
              {chatMessages.map((msg, i) => (
                <div key={i} className={`flex ${msg.isUser ? 'justify-end' : 'justify-start'}`}>
                  <div className={`chat-bubble ${msg.isUser ? 'user-bubble' : 'bot-bubble'}`} dangerouslySetInnerHTML={{ __html: msg.text }} />
                </div>
              ))}
              {isThinking && (
                <div className="flex justify-start">
                  <div className="chat-bubble bot-bubble">TekJeep AI is thinking...</div>
                </div>
              )}
            </div>

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
