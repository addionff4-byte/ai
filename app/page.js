"use client";
import { useState, useEffect } from "react";
import { mockPlayers } from "./data/matches"; 
import { Search, MessageSquare, ShieldAlert, Activity, RefreshCw } from "lucide-react";

export default function CricketDashboard() {
  const [selectedFormat, setSelectedFormat] = useState("All");
  const [playerSearch, setPlayerSearch] = useState("");
  const [liveMatches, setLiveMatches] = useState([]);
  const [isPolling, setIsPolling] = useState(false);
  
  const [chatInput, setChatInput] = useState("");
  const [chatHistory, setChatHistory] = useState([
    { role: "assistant", content: "Ask me anything about cricket rules, match history, or players!" }
  ]);
  const [loading, setLoading] = useState(false);

  const fetchLiveScores = async () => {
    setIsPolling(true);
    try {
      const res = await fetch("/api/live-scores");
      const data = await res.json();
      if (Array.isArray(data)) {
        setLiveMatches(data);
      }
    } catch (err) {
      console.error("Error fetching live data:", err);
    } finally {
      setIsPolling(false);
    }
  };

  useEffect(() => {
    fetchLiveScores(); 
    const interval = setInterval(() => {
      fetchLiveScores();
    }, 15000); 
    return () => clearInterval(interval); 
  }, []);

  const filteredMatches = selectedFormat === "All" 
    ? liveMatches 
    : liveMatches.filter(m => m.format === selectedFormat);

  const filteredPlayers = mockPlayers.filter(p => 
    p.name.toLowerCase().includes(playerSearch.toLowerCase()) ||
    p.country.toLowerCase().includes(playerSearch.toLowerCase())
  );

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!chatInput.trim()) return;
    const userMsg = { role: "user", content: chatInput };
    setChatHistory(prev => [...prev, userMsg]);
    setChatInput("");
    setLoading(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: [...chatHistory, userMsg] }),
      });
      const data = await response.json();
      setChatHistory(prev => [...prev, { role: "assistant", content: data.text || data.error }]);
    } catch {
      setChatHistory(prev => [...prev, { role: "assistant", content: "Error connecting to AI server." }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans p-4 md:p-8">
      {/* Styles Injection for Tailwind integration */}
      <style dangerouslySetInnerHTML={{__html: `
        @import url('https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css');
        body { background-color: #020617; }
      `}} />

      <header className="mb-8 border-b border-slate-800 pb-4 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-extrabold text-emerald-400 tracking-tight flex items-center gap-2">
            <Activity /> CREX.AI
          </h1>
          <p className="text-slate-400 text-sm">Next-Gen Intelligent Cricket Hub</p>
        </div>
        <div className="flex items-center gap-2 bg-slate-900 border border-slate-800 px-3 py-1 rounded-full text-xs text-emerald-400 font-mono">
          <RefreshCw size={12} className={isPolling ? "animate-spin" : ""} />
          {isPolling ? "POLLING LIVE DATA" : "LIVE FEED ACTIVE"}
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <section className="bg-slate-900 border border-slate-800 rounded-xl p-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
              <h2 className="text-xl font-bold text-slate-200">Live Fixtures</h2>
              <div className="flex bg-slate-950 p-1 rounded-lg border border-slate-800">
                {["All", "Test", "ODI", "T20"].map(format => (
                  <button
                    key={format}
                    onClick={() => setSelectedFormat(format)}
                    className={`px-3 py-1 rounded-md text-xs font-semibold transition ${
                      selectedFormat === format ? "bg-emerald-500 text-slate-950" : "text-slate-400"
                    }`}
                  >
                    {format}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredMatches.length === 0 ? (
                <div className="col-span-2 text-center p-8 text-slate-500 text-sm border border-dashed border-slate-800 rounded-lg">
                  No active live matches found. Standing by for API updates.
                </div>
              ) : (
                filteredMatches.map(match => (
                  <div key={match.id} className="bg-slate-950 border border-slate-800 rounded-lg p-4 flex flex-col justify-between">
                    <div>
                      <div className="flex justify-between items-center text-xs mb-2">
                        <span className="text-slate-500 uppercase font-mono">{match.tournament}</span>
                        <span className="px-2 py-0.5 rounded-full font-bold uppercase text-[10px] bg-red-500/10 text-red-400 border border-red-500/20">
                          {match.status}
                        </span>
                      </div>
                      <div className="space-y-2 my-3">
                        <div className="flex justify-between font-medium">
                          <span>{match.teamHome}</span>
                          <span className="text-emerald-400">{match.scoreHome}</span>
                        </div>
                        <div className="flex justify-between font-medium">
                          <span>{match.teamAway}</span>
                          <span className="text-slate-400">{match.scoreAway}</span>
                        </div>
                      </div>
                    </div>
                    <p className="text-xs text-slate-400 border-t border-slate-900 pt-2 italic mt-2">{match.summary}</p>
                  </div>
                ))
              )}
            </div>
          </section>

          <section className="bg-slate-900 border border-slate-800 rounded-xl p-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
              <h2 className="text-xl font-bold text-slate-200">Global Player Records</h2>
              <div className="relative flex items-center">
                <input
                  type="text"
                  placeholder="Search player..."
                  value={playerSearch}
                  onChange={(e) => setPlayerSearch(e.target.value)}
                  className="bg-slate-950 border border-slate-800 text-slate-100 pl-4 pr-4 py-2 rounded-lg text-sm w-full sm:w-64 focus:outline-none"
                />
              </div>
            </div>

            <div className="space-y-3">
              {filteredPlayers.map((player, idx) => (
                <div key={idx} className="bg-slate-950 border border-slate-800 rounded-lg p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h3 className="font-bold text-slate-200">{player.name}</h3>
                    <p className="text-xs text-slate-400">{player.role} — <span className="text-slate-500">{player.country}</span></p>
                  </div>
                  <div className="flex gap-4 text-xs font-mono bg-slate-900/50 p-2 rounded border border-slate-800">
                    <div><span className="text-slate-500">TEST:</span> <span className="text-emerald-400">{player.stats.Test}</span></div>
                    <div><span className="text-slate-500">ODI:</span> <span className="text-emerald-400">{player.stats.ODI}</span></div>
                    <div><span className="text-slate-500">T20:</span> <span className="text-emerald-400">{player.stats.T20}</span></div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>

        <div className="lg:col-span-1">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 flex flex-col h-[580px]">
            <div className="border-b border-slate-800 pb-3 mb-4">
              <h2 className="text-lg font-bold text-slate-200 flex items-center gap-2">
                <MessageSquare className="text-emerald-400" /> Cricket Guardrail AI
              </h2>
              <p className="text-slate-500 text-xs mt-1 flex items-center gap-1">
                <ShieldAlert size={12} /> Strict Mode: Only answers cricket topics.
              </p>
            </div>

            <div className="flex-1 overflow-y-auto space-y-4 pr-1 text-sm">
              {chatHistory.map((msg, index) => (
                <div
                  key={index}
                  className={`p-3 rounded-lg max-w-[85%] ${
                    msg.role === "user" ? "bg-emerald-600 text-slate-950 ml-auto" : "bg-slate-950 border border-slate-800 text-slate-300"
                  }`}
                >
                  {msg.content}
                </div>
              ))}
              {loading && <div className="text-slate-500 text-xs animate-pulse">Analyzing umpire rules...</div>}
            </div>

            <form onSubmit={handleSendMessage} className="mt-4 pt-3 border-t border-slate-800 flex gap-2">
              <input
                type="text"
                placeholder="Ask an umpire question..."
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                className="flex-1 bg-slate-950 border border-slate-800 text-slate-100 px-3 py-2 rounded-lg text-sm focus:outline-none"
              />
              <button type="submit" disabled={loading} className="bg-emerald-500 text-slate-950 px-4 py-2 rounded-lg text-sm font-bold">
                Send
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
