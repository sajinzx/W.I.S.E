'use client';

import { useState, useEffect, useRef } from 'react';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine
} from 'recharts';

// --- Data Generation Helpers ---

// A simple psuedo-random number generator to keep deterministic data for a given date
function lcg(seed) {
  return function() {
    seed = (seed * 1664525 + 1013904223) % 4294967296;
    return seed / 4294967296;
  };
}

// Generate an entire day's worth of mocked 1-minute ticks based on asset string and date
function generateDayData(assetStr, dateStr) {
  const seed = assetStr.length + new Date(dateStr).getTime() || 42;
  const rng = lcg(seed);

  // Set plausible starting prices for known assets, or fallback to 1000
  let basePrice = 1000;
  if (assetStr.toLowerCase().includes('nifty')) basePrice = 22000;
  else if (assetStr.toLowerCase().includes('reliance')) basePrice = 2950;
  else if (assetStr.toLowerCase().includes('hdfc')) basePrice = 1450;
  else if (assetStr.toLowerCase().includes('tcs')) basePrice = 3800;

  // Initial gap up or down
  const gap = (rng() - 0.5) * (basePrice * 0.015);
  let currentPrice = basePrice + gap;
  
  const ticks = [];
  // Indian market runs 9:15 to 15:30 (approx 375 minutes)
  let time = new Date(`${dateStr}T09:15:00`);
  
  for (let i = 0; i < 375; i++) {
    // Generate tick price using random walk with momentum
    const volatility = basePrice * 0.0005; // 0.05% per minute roughly
    const trendPhase = Math.sin(i / 60) * (rng() > 0.5 ? 1 : -1); // slow trend pattern
    
    // update price
    const change = ((rng() - 0.48) + trendPhase * 0.2) * volatility;
    currentPrice += change;

    // formatted time string
    const timeStr = time.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false });
    
    ticks.push({
      time: timeStr,
      price: Number(currentPrice.toFixed(2)),
      tickIndex: i
    });

    // Advance 1 minute
    time.setMinutes(time.getMinutes() + 1);
  }

  return ticks;
}


// --- Main Simulator Component ---

export default function PaperTradingSimulator() {
  // Config state
  const [asset, setAsset] = useState('Nifty 50');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  
  // App state
  const [isSimulating, setIsSimulating] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [speedMs, setSpeedMs] = useState(250); // ms per tick

  // Data state
  const [fullDayData, setFullDayData] = useState([]);
  const [visibleData, setVisibleData] = useState([]);
  const [currentTickIndex, setCurrentTickIndex] = useState(0);

  // Portfolio state
  const INITIAL_BALANCE = 1000000; // 10 Lakhs mock balance
  const [balance, setBalance] = useState(INITIAL_BALANCE);
  const [position, setPosition] = useState(null); // { type: 'BUY'|'SELL', entryPrice: number, qty: number }
  const [tradeHistory, setTradeHistory] = useState([]);

  // Ref to hold current state for the interval closure
  const stateRef = useRef({ currentTickIndex, isSimulating, isPaused, fullDayData });

  // Update ref when state changes
  useEffect(() => {
    stateRef.current = { currentTickIndex, isSimulating, isPaused, fullDayData };
  }, [currentTickIndex, isSimulating, isPaused, fullDayData]);

  // Simulation Loop
  useEffect(() => {
    let interval;
    if (isSimulating && !isPaused) {
      interval = setInterval(() => {
        const { currentTickIndex: idx, fullDayData: data } = stateRef.current;
        
        if (idx < data.length - 1) {
          const nextIdx = idx + 1;
          setCurrentTickIndex(nextIdx);
          setVisibleData(data.slice(0, nextIdx + 1));
        } else {
          // End of day
          setIsSimulating(false);
          setIsPaused(false);
          closePosition({ price: data[data.length - 1].price, reason: 'EOD Auto Close' });
        }
      }, speedMs);
    }
    return () => clearInterval(interval);
  }, [isSimulating, isPaused, speedMs]);


  // Actions
  const handleStartSimulation = () => {
    if (fullDayData.length === 0 || stateRef.current.currentTickIndex === 0) {
       const data = generateDayData(asset, date);
       setFullDayData(data);
       setCurrentTickIndex(1);
       setVisibleData(data.slice(0, 2));
    }
    setIsSimulating(true);
    setIsPaused(false);
  };

  const handleStopSimulation = () => {
    setIsSimulating(false);
    setIsPaused(false);
    setCurrentTickIndex(0);
    setVisibleData([]);
    setFullDayData([]);
    setBalance(INITIAL_BALANCE);
    setPosition(null);
    setTradeHistory([]);
  };

  const handlePauseToggle = () => {
    setIsPaused(!isPaused);
  };

  // Trading Actions
  const currentPrice = visibleData.length > 0 ? visibleData[visibleData.length - 1].price : 0;
  
  // Derived Portfolio Values
  let unrealizedPL = 0;
  if (position && currentPrice > 0) {
    if (position.type === 'BUY') {
      unrealizedPL = (currentPrice - position.entryPrice) * position.qty;
    } else {
      unrealizedPL = (position.entryPrice - currentPrice) * position.qty;
    }
  }
  const totalEquity = balance + unrealizedPL;

  const executeTrade = (type) => {
    if (!currentPrice || currentPrice === 0) return;

    if (position) {
      if (position.type === type) {
          // adding to existing is not supported in this MVP, simplify.
          alert("Position already exists in this direction.");
          return;
      } else {
          // Reverse position -> close exact existing
          closePosition({ price: currentPrice, reason: 'Reversed Trade' });
          return;
      }
    }

    // Default lot size/qty for simplicity. Real app would let user choose.
    const qty = Math.floor(balance / currentPrice); 
    if (qty === 0) return;

    const entryCost = currentPrice * qty;
    
    // (In a real app, short selling requires margin, we simulate basic balance check for both)
    if (balance < entryCost) {
      alert("Insufficient Balance");
      return;
    }

    setPosition({ type, entryPrice: currentPrice, qty });
    setTradeHistory(prev => [{ time: visibleData[visibleData.length - 1].time, action: `Opened ${type}`, price: currentPrice, qty }, ...prev]);
  };

  const closePosition = (ctx = {}) => {
    if (!position) return;
    const priceToUse = ctx.price || currentPrice;
    
    let pl = 0;
    if (position.type === 'BUY') {
      pl = (priceToUse - position.entryPrice) * position.qty;
    } else {
      pl = (position.entryPrice - priceToUse) * position.qty;
    }

    setBalance(prev => prev + pl);
    setTradeHistory(prev => [{ 
      time: visibleData[visibleData.length - 1].time, 
      action: `Closed ${position.type}`, 
      price: priceToUse, 
      qty: position.qty,
      pl: Number(pl.toFixed(2)),
      reason: ctx.reason 
    }, ...prev]);
    
    setPosition(null);
  };


  return (
    <div className="flex flex-col lg:flex-row gap-6">
      
      {/* Left Column: Config and Chart */}
      <div className="flex-1 space-y-6">
        
        {/* Controls Card */}
        <div className="glass-card p-6 border-slate-800/60 shadow-xl">
          <div className="flex flex-col md:flex-row gap-4 items-end">
            <div className="flex-1 w-full">
              <label className="block text-xs font-medium text-slate-400 mb-2 uppercase tracking-wider">Asset / Symbol</label>
              <input 
                type="text" 
                value={asset}
                onChange={(e) => setAsset(e.target.value)}
                disabled={isSimulating}
                className="w-full bg-slate-900/80 border border-slate-700/50 rounded-xl px-4 py-2.5 text-slate-200 focus:outline-none focus:border-cyan-500/50 disabled:opacity-50"
                placeholder="e.g. Nifty 50, Reliance"
              />
            </div>
            
            <div className="flex-1 w-full">
              <label className="block text-xs font-medium text-slate-400 mb-2 uppercase tracking-wider">Historical Date</label>
              <input 
                type="date" 
                value={date}
                max={new Date().toISOString().split('T')[0]}
                onChange={(e) => setDate(e.target.value)}
                disabled={isSimulating}
                className="w-full bg-slate-900/80 border border-slate-700/50 rounded-xl px-4 py-2.5 text-slate-200 focus:outline-none focus:border-cyan-500/50 disabled:opacity-50"
              />
            </div>

            <div className="flex gap-2 w-full md:w-auto mt-4 md:mt-0">
              {!isSimulating ? (
                <button 
                  onClick={handleStartSimulation}
                  className="w-full md:w-auto px-6 py-2.5 bg-gradient-to-r from-emerald-500 to-cyan-500 text-white font-medium rounded-xl hover:shadow-lg hover:shadow-cyan-500/25 transition-all text-sm shrink-0"
                >
                   Start Simulation
                </button>
              ) : (
                <>
                  <button 
                    onClick={handlePauseToggle}
                    className="flex-1 md:flex-none px-6 py-2.5 bg-slate-700/50 hover:bg-slate-600/50 text-white font-medium rounded-xl transition-all text-sm border border-slate-600/50 shrink-0"
                  >
                     {isPaused ? '▶ Resume' : '⏸ Pause'}
                  </button>
                  <button 
                    onClick={handleStopSimulation}
                    className="flex-1 md:flex-none px-6 py-2.5 bg-red-500/10 hover:bg-red-500/20 text-red-500 font-medium rounded-xl transition-all text-sm border border-red-500/20 shrink-0"
                  >
                     Stop
                  </button>
                </>
              )}
            </div>
          </div>

          {isSimulating && (
            <div className="mt-6 flex items-center gap-4 border-t border-slate-800 pt-4">
              <span className="text-xs text-slate-400 font-medium uppercase tracking-wider shrink-0">Playback Speed:</span>
              <input 
                type="range" 
                min="50" max="1000" step="50"
                value={1050 - speedMs} // invert so right=fast
                onChange={(e) => setSpeedMs(1050 - Number(e.target.value))}
                className="w-full max-w-[200px] accent-cyan-500 h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer"
              />
              <span className="text-xs text-slate-500 shrink-0">{speedMs}ms / tick</span>
            </div>
          )}
        </div>

        {/* Chart Card */}
        <div className="glass-card p-6 border-slate-800/60 shadow-xl overflow-hidden relative">
          <div className="flex justify-between items-center mb-6">
             <div>
                <h3 className="text-lg font-bold text-white">{asset} <span className="text-slate-500 font-normal text-sm ml-2">Intraday (1m) • {date}</span></h3>
                <div className="flex items-baseline gap-2 mt-1">
                  <span className="text-3xl font-bold font-mono tracking-tight text-white">
                    ₹{currentPrice.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </span>
                  {visibleData.length > 1 && (
                     <span className={`text-sm font-medium ${currentPrice >= visibleData[0].price ? 'text-emerald-400' : 'text-red-400'}`}>
                        {currentPrice >= visibleData[0].price ? '+' : ''}
                        {(currentPrice - visibleData[0].price).toFixed(2)} 
                        ({((currentPrice - visibleData[0].price) / visibleData[0].price * 100).toFixed(2)}%)
                     </span>
                  )}
                </div>
             </div>
             
             {isSimulating && !isPaused && (
                <div className="flex items-center gap-2">
                  <span className="relative flex h-3 w-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
                  </span>
                  <span className="text-xs text-emerald-400 font-medium tracking-wider uppercase">Live</span>
                </div>
             )}
          </div>

          <div className="h-[400px] w-full mt-4 -ml-4">
            {visibleData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={visibleData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.5} vertical={false}/>
                  <XAxis 
                    dataKey="time" 
                    stroke="#64748b" 
                    fontSize={12} 
                    tickMargin={10} 
                    minTickGap={30}
                  />
                  <YAxis 
                    domain={['auto', 'auto']} 
                    stroke="#64748b" 
                    fontSize={12} 
                    tickFormatter={(val) => val.toLocaleString('en-IN')}
                    width={80}
                    orientation="right"
                  />
                  <Tooltip 
                     contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', borderRadius: '12px', color: '#f8fafc' }}
                     itemStyle={{ color: '#38bdf8' }}
                     labelStyle={{ color: '#94a3b8', marginBottom: '4px' }}
                     formatter={(value) => [`₹${value.toFixed(2)}`, 'Price']}
                  />
                  
                  {/* Open Line */}
                  {visibleData.length > 0 && (
                     <ReferenceLine y={visibleData[0].price} stroke="#475569" strokeDasharray="3 3" opacity={0.5} />
                  )}

                  {/* Order Entry Line */}
                  {position && (
                     <ReferenceLine 
                        y={position.entryPrice} 
                        stroke={position.type === 'BUY' ? '#10b981' : '#ef4444'} 
                        strokeDasharray="4 4" 
                        label={{ position: 'insideLeft', value: `${position.type} @ ${position.entryPrice.toFixed(2)}`, fill: position.type === 'BUY' ? '#10b981' : '#ef4444', fontSize: 12, className: 'font-mono' }}
                     />
                  )}

                  <Line 
                    type="stepAfter" 
                    dataKey="price" 
                    stroke={currentPrice >= (visibleData[0]?.price || 0) ? '#10b981' : '#ef4444'} 
                    strokeWidth={2} 
                    dot={false}
                    activeDot={{ r: 4, strokeWidth: 0, fill: '#38bdf8' }}
                    isAnimationActive={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center text-slate-500 border-2 border-dashed border-slate-800 rounded-2xl mx-4">
                 <div className="text-4xl mb-4 opacity-50">📈</div>
                 <p>Start simulation to begin charting data</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Right Column: Portfolio & Order Entry */}
      <div className="w-full lg:w-[400px] space-y-6">
        
        {/* Portfolio Summary */}
        <div className="glass-card p-6 border-slate-800/60 shadow-xl">
           <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
             <span className="w-8 h-8 rounded-lg bg-indigo-500/20 text-indigo-400 flex items-center justify-center text-sm">💼</span>
             Mock Portfolio
           </h3>
           
           <div className="space-y-4">
             <div className="bg-slate-900/50 rounded-xl p-4 border border-slate-800">
                <p className="text-xs text-slate-500 font-medium uppercase tracking-wider mb-1">Total Equity</p>
                <div className="flex justify-between items-baseline">
                   <p className="text-2xl font-mono text-white font-bold">₹{totalEquity.toLocaleString('en-IN', {minimumFractionDigits: 2, maximumFractionDigits:2})}</p>
                   <p className={`text-sm font-medium ${unrealizedPL >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                      {unrealizedPL >= 0 ? '+' : ''}{unrealizedPL.toLocaleString('en-IN', {minimumFractionDigits: 2, maximumFractionDigits:2})}
                   </p>
                </div>
             </div>
             
             <div className="grid grid-cols-2 gap-4">
                <div className="bg-slate-900/50 rounded-xl p-4 border border-slate-800">
                  <p className="text-[10px] text-slate-500 font-medium uppercase tracking-wider mb-1">Available Margin</p>
                  <p className="text-lg font-mono text-slate-300 font-semibold">₹{balance.toLocaleString('en-IN', {minimumFractionDigits: 2, maximumFractionDigits:2})}</p>
                </div>
                <div className="bg-slate-900/50 rounded-xl p-4 border border-slate-800">
                  <p className="text-[10px] text-slate-500 font-medium uppercase tracking-wider mb-1">Current Position</p>
                  {position ? (
                    <div>
                      <span className={`text-xs font-bold px-1.5 py-0.5 rounded ${position.type === 'BUY' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'}`}>
                         {position.type}
                      </span>
                      <span className="text-sm font-mono text-slate-300 ml-2">{position.qty} Qty</span>
                    </div>
                  ) : (
                     <p className="text-sm font-mono text-slate-500">None</p>
                  )}
                </div>
             </div>
           </div>
        </div>

        {/* Order Entry */}
        <div className="glass-card p-6 border-slate-800/60 shadow-xl">
           <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
             <span className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center text-sm">⚡</span>
             Order Entry
           </h3>

           {!isSimulating ? (
              <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-6 text-center">
                 <p className="text-sm text-slate-400">Start the simulation to place orders.</p>
              </div>
           ) : (
             <div className="space-y-4">
                
                {position && (
                  <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 mb-4">
                    <div className="flex justify-between items-center mb-4">
                       <span className="text-sm text-slate-300">Open <span className={`font-bold ${position.type === 'BUY' ? 'text-emerald-400' : 'text-red-400'}`}>{position.type}</span> Position</span>
                       <span className={`text-sm font-bold font-mono ${unrealizedPL >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                          {unrealizedPL >= 0 ? '+' : ''}₹{unrealizedPL.toLocaleString('en-IN', {minimumFractionDigits: 2, maximumFractionDigits:2})}
                       </span>
                    </div>
                    <button 
                       onClick={() => closePosition()}
                       className="w-full py-2.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-white text-sm font-medium border border-slate-600 transition-colors"
                    >
                       Close Position
                    </button>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4">
                   <button 
                     onClick={() => executeTrade('BUY')}
                     disabled={position !== null && position.type === 'BUY'}
                     className={`py-4 rounded-xl font-bold text-lg flex flex-col items-center justify-center transition-all ${
                       position !== null && position.type === 'BUY' 
                          ? 'bg-emerald-500/10 text-emerald-500/50 border border-emerald-500/10 cursor-not-allowed'
                          : 'bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30 border border-emerald-500/30 hover:shadow-lg hover:shadow-emerald-500/20'
                     }`}
                   >
                     <span>BUY</span>
                     <span className="text-xs font-normal opacity-75 mt-1">Market Order</span>
                   </button>

                   <button 
                     onClick={() => executeTrade('SELL')}
                     disabled={position !== null && position.type === 'SELL'}
                     className={`py-4 rounded-xl font-bold text-lg flex flex-col items-center justify-center transition-all ${
                       position !== null && position.type === 'SELL' 
                          ? 'bg-red-500/10 text-red-500/50 border border-red-500/10 cursor-not-allowed'
                          : 'bg-red-500/20 text-red-400 hover:bg-red-500/30 border border-red-500/30 hover:shadow-lg hover:shadow-red-500/20'
                     }`}
                   >
                     <span>SELL</span>
                     <span className="text-xs font-normal opacity-75 mt-1">Market Order</span>
                   </button>
                </div>
                <p className="text-center text-[10px] text-slate-500 italic mt-2">Maximum affordable quantity will be bought/sold based on available balance. No margin leverage provided.</p>
             </div>
           )}
        </div>

        {/* Trade Ledger mini */}
        {tradeHistory.length > 0 && (
           <div className="glass-card p-6 border-slate-800/60 shadow-xl">
             <h3 className="text-sm font-bold text-white mb-4 uppercase tracking-wider text-slate-400">Recent Activity</h3>
             <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                {tradeHistory.map((trade, idx) => (
                   <div key={idx} className="flex justify-between items-start border-b border-slate-800 pb-3 last:border-0 last:pb-0">
                      <div>
                         <p className="text-xs text-slate-500 font-mono mb-1">{trade.time}</p>
                         <p className={`text-sm font-bold ${trade.action.includes('Open') ? 'text-slate-200' : 'text-slate-400'}`}>
                           {trade.action} <span className="text-slate-500 font-normal">({trade.qty} Qty)</span>
                         </p>
                         {trade.reason && <p className="text-[10px] text-slate-500 mt-1">{trade.reason}</p>}
                      </div>
                      <div className="text-right">
                         <p className="text-sm font-mono text-slate-300">₹{trade.price.toLocaleString('en-IN', {minimumFractionDigits: 2, maximumFractionDigits:2})}</p>
                         {trade.pl !== undefined && (
                            <p className={`text-xs font-mono mt-1 ${trade.pl >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                               {trade.pl >= 0 ? '+' : ''}₹{trade.pl.toLocaleString('en-IN', {minimumFractionDigits: 2, maximumFractionDigits:2})}
                            </p>
                         )}
                      </div>
                   </div>
                ))}
             </div>
           </div>
        )}

      </div>
    </div>
  );
}
