import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { redirect } from "next/navigation";
import AuthNav from "@/components/AuthNav";

export const metadata = {
  title: "Dashboard - W.I.S.E",
};

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/api/auth/signin");
  }

  // Fetch past iterations from DB
  const iterations = await prisma.iteration.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" }
  });

  return (
    <main className="min-h-screen relative overflow-hidden flex flex-col pt-20">
      {/* Background */}
      <div className="fixed inset-0 -z-10 bg-slate-950" />

      {/* Header */}
      <header className="fixed top-0 w-full py-4 px-4 z-50 bg-slate-950/80 backdrop-blur-md border-b border-slate-800/50">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
             <Link href="/" className="font-bold text-xl bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
                W.I.S.E <span className="text-slate-400 ml-2">| Dashboard</span>
             </Link>
          </div>
          <AuthNav />
        </div>
      </header>

      {/* Content */}
      <div className="flex-1 w-full max-w-7xl mx-auto px-4">
        <div className="mb-10">
          <h1 className="text-3xl font-bold text-white mb-2">Welcome Back, {session.user.name || 'Investor'}</h1>
          <p className="text-slate-400">View your saved investment plans and paper trading simulated strategies below.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {iterations.length === 0 ? (
            <div className="col-span-full py-20 text-center glass-card p-8 border-slate-800/60 shadow-xl">
               <div className="text-4xl mb-4 opacity-50">📂</div>
               <h3 className="text-lg font-medium text-slate-300 mb-2">No Saved Activity Yet</h3>
               <p className="text-slate-500 mb-6 text-sm">You haven't saved any AI plans or paper trading sessions yet.</p>
               <div className="flex gap-4 justify-center">
                 <Link href="/" className="px-6 py-2.5 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 hover:bg-cyan-500/20 transition-all font-medium text-sm">
                    Create Wealth Plan
                 </Link>
                 <Link href="/paper-trading" className="px-6 py-2.5 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/20 transition-all font-medium text-sm">
                    Try Paper Trading
                 </Link>
               </div>
            </div>
          ) : (
             iterations.map((iter) => {
               // Parse data to see minimal preview
               const preview = JSON.parse(iter.data);
               const isPlan = iter.type === 'PLAN';
               
               return (
                 <div key={iter.id} className="glass-card p-6 border-slate-800/60 shadow-xl flex flex-col hover:border-cyan-500/30 transition-colors">
                    <div className="flex items-start justify-between mb-4">
                       <div>
                          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border mb-3 ${isPlan ? 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30' : 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'}`}>
                             {isPlan ? '⚡ Investment Plan' : '📈 Paper Trace'}
                          </span>
                          <h3 className="text-lg font-bold text-white leading-tight">{iter.title}</h3>
                       </div>
                    </div>
                    
                    <div className="flex-1 text-sm text-slate-400 mb-6 line-clamp-3">
                       {/* Show a very basic preview based on type */}
                       {isPlan 
                         ? `Projected wealth of ${(preview.summary?.projectedAmount || 0).toLocaleString('en-IN', {style:'currency', currency:'INR', maximumFractionDigits:0})}...`
                         : `Asset: ${preview.asset}. End Balance: ${(preview.finalBalance || 0).toLocaleString('en-IN', {style:'currency', currency:'INR'})}`
                       }
                    </div>

                    <div className="flex items-center justify-between mt-auto pt-4 border-t border-slate-800">
                       <span className="text-xs text-slate-500 font-mono">
                         {new Date(iter.createdAt).toLocaleDateString()}
                       </span>
                       <button className="text-xs font-medium text-indigo-400 hover:text-indigo-300">
                         View Details &rarr;
                       </button>
                    </div>
                 </div>
               );
             })
          )}
        </div>
      </div>
    </main>
  );
}
