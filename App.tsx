import React, { useState } from 'react';
import TrainingStudio from './views/TrainingStudio';
import AdminMode from './views/AdminMode';
import { Mic2, LayoutDashboard, Users, BookOpen, Settings, LogOut } from 'lucide-react';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'training' | 'admin'>('training');

  return (
    <div className="flex min-h-screen bg-slate-50 font-sans text-slate-900">

      {/* Sidebar */}
      <aside className="w-64 bg-slate-900 text-white fixed h-full hidden md:flex flex-col z-20">
        <div className="p-6 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-emerald-500 rounded-lg flex items-center justify-center shadow-lg shadow-emerald-500/20">
              <Mic2 className="text-white" size={24} />
            </div>
            <div>
              <h1 className="font-bold text-lg tracking-tight">Tarannum</h1>
              <p className="text-xs text-slate-400">AI Trainer System</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          <button
            onClick={() => setActiveTab('training')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeTab === 'training' ? 'bg-emerald-600 text-white shadow-lg' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}
          >
            <Mic2 size={20} />
            <span className="font-medium">Training Studio</span>
          </button>

          <button
             onClick={() => setActiveTab('dashboard')}
             className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeTab === 'dashboard' ? 'bg-emerald-600 text-white shadow-lg' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}
          >
            <LayoutDashboard size={20} />
            <span className="font-medium">Dashboard</span>
          </button>

          <div className="pt-8 pb-2 px-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Admin
          </div>

          <button
            onClick={() => setActiveTab('admin')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeTab === 'admin' ? 'bg-emerald-600 text-white shadow-lg' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}
          >
            <Settings size={20} />
            <span className="font-medium">Preset Manager</span>
          </button>
        </nav>

        <div className="p-4 border-t border-slate-800">
          <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-slate-400 hover:bg-red-500/10 hover:text-red-400 transition-all">
            <LogOut size={20} />
            <span className="font-medium">Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 md:ml-64 relative">
        <header className="sticky top-0 z-10 bg-white/80 backdrop-blur-md border-b border-slate-200 px-6 py-4 flex items-center justify-between md:hidden">
            <div className="flex items-center gap-2">
                 <div className="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center">
                    <Mic2 className="text-white" size={16} />
                </div>
                <span className="font-bold text-slate-800">Tarannum AI</span>
            </div>
            <button className="text-slate-600">
                <Settings size={24} />
            </button>
        </header>

        <div className="min-h-[calc(100vh-64px)]">
           {activeTab === 'training' ? (
             <TrainingStudio />
           ) : activeTab === 'admin' ? (
             <AdminMode />
           ) : (
             <div className="p-8 text-center text-slate-500">
                <h2 className="text-2xl font-bold text-slate-800 mb-2">Dashboard</h2>
                <p>Select "Training Studio" to access the core requirements.</p>
                {/* Dashboard content placeholder */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
                     <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
                         <h3 className="text-sm text-slate-500 uppercase">Total Sessions</h3>
                         <p className="text-3xl font-bold text-slate-800">24</p>
                     </div>
                     <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
                         <h3 className="text-sm text-slate-500 uppercase">Avg Score</h3>
                         <p className="text-3xl font-bold text-emerald-600">78%</p>
                     </div>
                     <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
                         <h3 className="text-sm text-slate-500 uppercase">Hours Practiced</h3>
                         <p className="text-3xl font-bold text-blue-600">12.5h</p>
                     </div>
                </div>
             </div>
           )}
        </div>
      </main>
    </div>
  );
};

export default App;