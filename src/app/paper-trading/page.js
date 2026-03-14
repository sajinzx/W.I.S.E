'use client';

import { useState } from 'react';
import Link from 'next/link';
import PaperTradingSimulator from '@/components/PaperTradingSimulator';

export default function PaperTradingPage() {
  return (
    <main className="min-h-screen relative overflow-hidden flex flex-col">
      {/* Animated background orbs */}
      <div className="fixed inset-0 -z-10 pointer-events-none">
        <div className="absolute top-[-20%] right-[-10%] w-[600px] h-[600px] rounded-full bg-gradient-to-br from-blue-600/20 to-indigo-600/10 blur-[120px] animate-float" />
        <div className="absolute bottom-[-20%] left-[-10%] w-[500px] h-[500px] rounded-full bg-gradient-to-br from-emerald-600/15 to-cyan-600/10 blur-[120px] animate-float-delayed" />
      </div>

      {/* Header */}
      <header className="w-full py-4 px-4 sticky top-0 z-50 bg-slate-950/80 backdrop-blur-md border-b border-slate-800/50">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/" className="w-10 h-10 rounded-xl overflow-hidden flex items-center justify-center shadow-lg shadow-emerald-500/25 hover:scale-105 transition-transform">
              <img src="/logo.png" alt="W.I.S.E Logo" className="w-full h-full object-cover" />
            </Link>
            <div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent hidden sm:block">
                W.I.S.E <span className="text-slate-400 font-medium">| Paper Trading</span>
              </h1>
            </div>
          </div>
          <nav>
            <Link href="/" className="px-4 py-2 rounded-lg bg-slate-800/50 text-slate-300 hover:bg-slate-700/50 hover:text-white transition-all text-sm font-medium border border-slate-700/50">
              ← Back to Planner
            </Link>
          </nav>
        </div>
      </header>

      {/* Content */}
      <div className="flex-1 w-full max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-white mb-2">Paper Trading Simulator</h2>
          <p className="text-slate-400 text-sm max-w-2xl">
            Select an Indian stock or index and pick a historical date. We'll simulate its intraday price action so you can practice your trading strategies without risking real capital.
          </p>
        </div>

        <PaperTradingSimulator />
      </div>
    </main>
  );
}
