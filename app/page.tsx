'use client';

import { useState, useEffect } from 'react';

interface Vehicle {
  year: string;
  make: string;
  model: string;
  transmission: string;
  engine: string;
  liftHeight: string;
  tireSize: string;
  wheelSize: string;
  mileage: string;
  mods: string;
}

interface Conversation {
  title: string;
  date: string;
  messages: Array<{ text: string; isUser: boolean }>;
}

export default function TekJeepAI() {
  const [currentVehicle, setCurrentVehicle] = useState<Vehicle | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userEmail, setUserEmail] = useState('');
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [showAccountModal, setShowAccountModal] = useState(false);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [loginForm, setLoginForm] = useState({ email: '', password: '' });
  const [signupForm, setSignupForm] = useState({ email: '', password: '' });
  const [isLoginMode, setIsLoginMode] = useState(true);
  const [chatMessages, setChatMessages] = useState<Array<{ text: string; isUser: boolean }>>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isThinking, setIsThinking] = useState(false);

  // Load saved data on mount
  useEffect(() => {
    const savedVehicle = localStorage.getItem('tekjeep_vehicle');
    if (savedVehicle) {
      const vehicle = JSON.parse(savedVehicle);
      setCurrentVehicle(vehicle);
    }

    const savedUser = localStorage.getItem('tekjeep_user');
    if (savedUser) {
      const user = JSON.parse(savedUser);
      setIsLoggedIn(true);
      setUserEmail(user.email);
    }

    const savedConversations = localStorage.getItem('tekjeep_conversations');
    if (savedConversations) {
      setConversations(JSON.parse(savedConversations));
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

    const vehicle: Vehicle = {
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
    window.location.reload();
  };

  const toggleAdvanced = () => {
    setShowAdvanced(!showAdvanced);
  };

  const sendMessage = async () => {
    if (!inputMessage.trim()) return;

    const userMessage = inputMessage.trim();
    setChatMessages(prev => [...prev, { text: userMessage, isUser: true }]);
    setInputMessage('');
    setIsThinking(true);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userMessage,
          vehicle: currentVehicle
        })
      });

      const data = await res.json();
      let reply = data.reply || "Sorry, something went wrong.";

      // Convert SEARCH lines to buttons
      reply = reply.replace(/Best Deal on eBay: SEARCH:(.+)/g, 
        '<a href="https://www.ebay.com/sch/i.html?_nkw=$1" target="_blank" class="deal-btn">🛒 Best Deal on eBay</a>');
      
      reply = reply.replace(/Best Deal on Amazon: SEARCH:(.+)/g, 
        '<a href="https://www.amazon.com/s?k=$1&tag=tekjeep-20" target="_blank" class="deal-btn">🛒 Best Deal on Amazon</a>');

      setChatMessages(prev => [...prev, { text: reply, isUser: false }]);

      // Save to history
      saveToHistory(userMessage, reply);

    } catch (err) {
      setChatMessages(prev => [...prev, { text: "Sorry, something went wrong. Try again.", isUser: false }]);
    } finally {
      setIsThinking(false);
    }
  };

  const saveToHistory = (userMessage: string, botReply: string) => {
    const title = userMessage.length > 40 ? userMessage.substring(0, 40) + "..." : userMessage;
    
    const newConv: Conversation = {
      title,
      date: new Date().toISOString(),
      messages: [
        { text: userMessage, isUser: true },
        { text: botReply, isUser: false }
      ]
    };

    const updated = [newConv, ...conversations].slice(0, 20);
    setConversations(updated);
    localStorage.setItem('tekjeep_conversations', JSON.stringify(updated));
  };

  const showHistory = () => {
    setShowHistoryModal(true);
  };

  const loadConversation = (index: number) => {
    const conv = conversations[index];
    setChatMessages(conv.messages);
    setShowHistoryModal(false);
  };

  // Account functions
  const signup = () => {
    const email = signupForm.email.trim();
    const password = signupForm.password;

    if (!email || !password) {
      alert("Please enter email and password");
      return;
    }

    const user = { email, password };
    localStorage.setItem('tekjeep_user', JSON.stringify(user));
    
    setIsLoggedIn(true);
    setUserEmail(email);
    setShowAccountModal(false);
    alert("Account created! You now have unlimited prompts.");
  };

  const login = () => {
    const email = loginForm.email.trim();
    const password = loginForm.password;

    const savedUser = localStorage.getItem('tekjeep_user');
    if (!savedUser) {
      alert("No account found. Please sign up first.");
      return;
    }

    const user = JSON.parse(savedUser);
    if (user.email === email && user.password === password) {
      setIsLoggedIn(true);
      setUserEmail(email);
      setShowAccountModal(false);
      alert("Logged in successfully!");
    } else {
      alert("Invalid email or password");
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      sendMessage();
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-white flex flex-col">
      {/* Header */}
      <div className="border-b border-zinc-800 bg-black/95 backdrop-blur-md py-4 flex-shrink-0">
        <div className="max-w-4xl mx-auto px-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl flex items-center justify-center flex-shrink-0">
              <span className="text-3xl">🛠️</span>
            </div>
            <div>
              <h1 className="text-3xl font-bold tracking-tight">TekJeep AI</h1>
              <p className="text-xs text-zinc-400 -mt-0.5">Real Jeep Tech Answers</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <button 
              onClick={showHistory}
              className="text-sm px-3 py-1.5 rounded-2xl border border-zinc-700 hover:bg-zinc-900"
            >
              History
            </button>
            <button 
              onClick={() => setShowAccountModal(true)}
              className="text-sm px-4 py-1.5 rounded-2xl bg-zinc-800 hover:bg-zinc-700"
            >
              {isLoggedIn ? userEmail.split('@')[0] : 'Login / Sign Up'}
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 max-w-4xl mx-auto w-full px-4 flex flex-col">
        
        {/* Vehicle Selector */}
        {!currentVehicle && (
          <div className="flex-1 flex flex-col items-center justify-center py-8">
            <div className="w-full max-w-md">
              <div className="text-center mb-8">
                <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-orange-600 rounded-3xl flex items-center justify-center mx-auto mb-6">
                  <span className="text-5xl">🛠️</span>
                </div>
                <h2 className="text-3xl font-bold mb-2">Welcome to TekJeep AI</h2>
                <p className="text-zinc-400">Tell me about your Jeep so I can give you accurate answers.</p>
              </div>

              <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6 space-y-4">
                {/* Basic Info */}
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

                {/* Optional Advanced Details */}
                <button 
                  onClick={toggleAdvanced}
                  className="mt-2 text-sm text-orange-500 hover:underline flex items-center gap-1"
                >
                  + Add More Details (Optional)
                </button>

                {showAdvanced && (
                  <div className="mt-4 bg-zinc-800 border border-zinc-700 rounded-2xl p-5 space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-zinc-400 mb-1">Transmission</label>
                        <select id="transmission" className="w-full bg-zinc-900 border border-zinc-700 rounded-2xl px-4 py-3 text-white">
                          <option value="">Select</option>
                          <option value="Auto">Auto</option>
                          <option value="Manual">Manual</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-zinc-400 mb-1">Engine</label>
                        <select id="engine" className="w-full bg-zinc-900 border border-zinc-700 rounded-2xl px-4 py-3 text-white">
                          <option value="">Select</option>
                          <option value="3.6L Pentastar">3.6L Pentastar (JK/JL)</option>
                          <option value="3.8L">3.8L (2007-2011 JK)</option>
                          <option value="4.0L">4.0L (TJ)</option>
                          <option value="2.0L Turbo">2.0L Turbo (JL)</option>
                          <option value="Other">Other</option>
                        </select>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-zinc-400 mb-1">Lift Height</label>
                        <select id="liftHeight" className="w-full bg-zinc-900 border border-zinc-700 rounded-2xl px-4 py-3 text-white">
                          <option value="">Stock / No Lift</option>
                          <option value="2.5 Inch">2.5 Inch</option>
                          <option value="3.5 Inch">3.5 Inch</option>
                          <option value="4 Inch">4 Inch</option>
                          <option value="6 Inch or more">6 Inch or more</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-zinc-400 mb-1">Tire Size</label>
                        <input id="tireSize" type="text" className="w-full bg-zinc-900 border border-zinc-700 rounded-2xl px-4 py-3 text-white" placeholder="35x12.50R17" />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-zinc-400 mb-1">Wheel Size</label>
                        <input id="wheelSize" type="text" className="w-full bg-zinc-900 border border-zinc-700 rounded-2xl px-4 py-3 text-white" placeholder="17x9" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-zinc-400 mb-1">Mileage</label>
                        <input id="mileage" type="number" className="w-full bg-zinc-900 border border-zinc-700 rounded-2xl px-4 py-3 text-white" placeholder="87000" />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-zinc-400 mb-1">Mods Installed</label>
                      <textarea id="mods" rows={3} className="w-full bg-zinc-900 border border-zinc-700 rounded-2xl px-4 py-3 text-white" placeholder="2.5&quot; lift, LED headlights, winch, bumper, etc."></textarea>
                    </div>
                  </div>
                )}

                <button 
                  onClick={saveVehicle}
                  className="w-full bg-orange-600 hover:bg-orange-700 py-4 rounded-3xl font-semibold text-lg mt-4"
                >
                  Save My Jeep
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Main Chat Interface */}
        {currentVehicle && (
          <div className="flex-1 flex flex-col pt-4">
            {/* Vehicle Banner */}
            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl px-4 py-3 mb-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-orange-500">🛠️</span>
                <span className="font-medium">
                  {currentVehicle.year} {currentVehicle.make} {currentVehicle.model}
                  {currentVehicle.liftHeight && currentVehicle.liftHeight !== "Stock / No Lift" && ` • ${currentVehicle.liftHeight} lift`}
                  {currentVehicle.tireSize && ` • ${currentVehicle.tireSize} tires`}
                  {currentVehicle.mileage && ` • ${currentVehicle.mileage} miles`}
                </span>
              </div>
              <button onClick={changeVehicle} className="text-xs text-zinc-400 hover:text-white">Change</button>
            </div>

            {/* Chat Area */}
            <div className="flex-1 bg-zinc-900 border border-zinc-800 rounded-3xl overflow-y-auto p-5 space-y-6 mb-4" id="chat">
              {chatMessages.length === 0 && (
                <div className="flex justify-center items-center h-full text-zinc-500 text-center">
                  <div>
                    <p className="text-lg mb-2">Hey! I'm TekJeep AI</p>
                    <p className="text-sm">Ask me anything about your {currentVehicle.year} {currentVehicle.make} {currentVehicle.model}</p>
                  </div>
                </div>
              )}
              
              {chatMessages.map((msg, index) => (
                <div key={index} className={`flex ${msg.isUser ? 'justify-end' : 'justify-start'}`}>
                  <div className={`chat-bubble ${msg.isUser ? 'user-bubble' : 'bot-bubble'}`} 
                       dangerouslySetInnerHTML={{ __html: msg.text }} />
                </div>
              ))}
              
              {isThinking && (
                <div className="flex justify-start">
                  <div className="chat-bubble bot-bubble flex items-center gap-2">
                    <span>TekJeep AI is thinking</span>
                    <div className="thinking-dots"><span></span><span></span><span></span></div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Input Area */}
      {currentVehicle && (
        <div className="max-w-4xl mx-auto w-full px-4 pb-4 pt-3 flex-shrink-0">
          <div className="flex gap-3 items-center">
            <input 
              type="text" 
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              className="flex-1 bg-zinc-900 border border-zinc-700 focus:border-orange-500 rounded-3xl px-6 py-4 text-lg outline-none placeholder:text-zinc-500" 
              placeholder="Ask about lift kits, LEDs, CarPlay..." 
            />
            <button 
              onClick={sendMessage}
              className="bg-orange-600 hover:bg-orange-700 active:bg-orange-800 px-8 py-4 rounded-3xl font-semibold text-lg"
            >
              Send
            </button>
          </div>
          <p className="text-center text-[10px] text-zinc-500 mt-3">TekJeep AI • Created by Nicholas Duncan 2026</p>
        </div>
      )}

      {/* Account Modal */}
      {showAccountModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
          <div className="bg-zinc-900 border border-zinc-700 rounded-3xl p-8 w-full max-w-md">
            <h3 className="text-2xl font-bold mb-6">Account</h3>
            
            {isLoginMode ? (
              <div id="login-form">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm text-zinc-400 mb-1">Email</label>
                    <input 
                      type="email" 
                      value={loginForm.email}
                      onChange={(e) => setLoginForm({...loginForm, email: e.target.value})}
                      className="w-full bg-zinc-800 border border-zinc-700 rounded-2xl px-4 py-3" 
                      placeholder="you@email.com" 
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-zinc-400 mb-1">Password</label>
                    <input 
                      type="password" 
                      value={loginForm.password}
                      onChange={(e) => setLoginForm({...loginForm, password: e.target.value})}
                      className="w-full bg-zinc-800 border border-zinc-700 rounded-2xl px-4 py-3" 
                      placeholder="••••••••" 
                    />
                  </div>
                  <button onClick={login} className="w-full bg-orange-600 hover:bg-orange-700 py-3 rounded-3xl font-semibold">Login</button>
                </div>
                <div className="text-center mt-4">
                  <button onClick={() => setIsLoginMode(false)} className="text-sm text-orange-500 hover:underline">Don't have an account? Sign up (Free)</button>
                </div>
              </div>
            ) : (
              <div id="signup-form">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm text-zinc-400 mb-1">Email</label>
                    <input 
                      type="email" 
                      value={signupForm.email}
                      onChange={(e) => setSignupForm({...signupForm, email: e.target.value})}
                      className="w-full bg-zinc-800 border border-zinc-700 rounded-2xl px-4 py-3" 
                      placeholder="you@email.com" 
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-zinc-400 mb-1">Password</label>
                    <input 
                      type="password" 
                      value={signupForm.password}
                      onChange={(e) => setSignupForm({...signupForm, password: e.target.value})}
                      className="w-full bg-zinc-800 border border-zinc-700 rounded-2xl px-4 py-3" 
                      placeholder="••••••••" 
                    />
                  </div>
                  <button onClick={signup} className="w-full bg-orange-600 hover:bg-orange-700 py-3 rounded-3xl font-semibold">Create Free Account</button>
                </div>
                <div className="text-center mt-4">
                  <button onClick={() => setIsLoginMode(true)} className="text-sm text-orange-500 hover:underline">Already have an account? Login</button>
                </div>
              </div>
            )}
            
            <button 
              onClick={() => setShowAccountModal(false)}
              className="mt-4 w-full text-sm text-zinc-400 hover:text-white"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* History Modal */}
      {showHistoryModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
          <div className="bg-zinc-900 border border-zinc-700 rounded-3xl p-6 w-full max-w-md max-h-[80vh] overflow-hidden flex flex-col">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold">Conversation History</h3>
              <button onClick={() => setShowHistoryModal(false)} className="text-zinc-400 hover:text-white">✕</button>
            </div>
            <div className="flex-1 overflow-y-auto space-y-2 text-sm">
              {conversations.length === 0 ? (
                <p className="text-zinc-400 text-center py-8">No conversations yet</p>
              ) : (
                conversations.map((conv, index) => (
                  <div 
                    key={index} 
                    onClick={() => loadConversation(index)}
                    className="bg-zinc-800 hover:bg-zinc-700 rounded-2xl p-3 cursor-pointer"
                  >
                    <div className="font-medium text-sm">{conv.title}</div>
                    <div className="text-xs text-zinc-500">{new Date(conv.date).toLocaleDateString()}</div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
