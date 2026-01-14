import React from 'react';
import { createRoot } from 'react-dom/client';
import { AuthProvider, useAuth } from '../lib/auth';
import { LogOut, PenTool } from 'lucide-react';
import '../index.css';

import '@fontsource/inter/400.css';
import '@fontsource/inter/500.css';
import '@fontsource/inter/600.css';
import '@fontsource/inter/700.css';
import '@fontsource/plus-jakarta-sans/400.css';
import '@fontsource/plus-jakarta-sans/500.css';
import '@fontsource/plus-jakarta-sans/600.css';
import '@fontsource/plus-jakarta-sans/700.css';


const PopupContent = () => {
  const { user, login, loginAnonymous, logout, loading, error } = useAuth();

  if (loading) {
    return (
      <div className="w-[360px] h-[500px] flex items-center justify-center bg-slate-50">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="w-[360px] h-[500px] bg-slate-50 flex flex-col font-sans relative overflow-hidden">
        {/* Background Decorative Orbs */}
        <div className="absolute top-[-20%] left-[-20%] w-[300px] h-[300px] bg-purple-500/20 rounded-full blur-3xl"></div>
        <div className="absolute bottom-[-20%] right-[-20%] w-[300px] h-[300px] bg-indigo-500/20 rounded-full blur-3xl"></div>

        <header className="p-8 relative z-10 flex flex-col items-center mt-12">
          {error && (
             <div className="mb-4 p-3 bg-red-50 text-red-600 text-xs rounded-lg border border-red-100 w-full text-center">
                {error}
             </div>
          )}
          <div className="w-16 h-16 bg-white rounded-2xl shadow-xl flex items-center justify-center mb-6">
            <PenTool className="w-8 h-8 text-indigo-600" />
          </div>
          <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-premium-gradient">
            ScribbleFlow
          </h1>
          <p className="text-slate-500 text-sm mt-2 text-center px-4">
            Your creative layer for the web. <br/> Sign in to sync your boards.
          </p>
        </header>

        <main className="flex-1 px-8 pb-12 flex flex-col items-center justify-end space-y-4 relative z-10">
          <button 
            onClick={() => login('google')}
            className="w-full py-3 rounded-xl bg-white border border-slate-200 shadow-sm text-slate-700 font-medium flex items-center justify-center space-x-2 hover:bg-slate-50 transition-colors"
          >
            <img src="https://www.svgrepo.com/show/475656/google-color.svg" className="w-5 h-5" alt="Google" />
            <span>Continue with Google</span>
          </button>
          
          <button 
            onClick={() => login('github')}
            className="w-full py-3 rounded-xl bg-[#24292e] text-white font-medium flex items-center justify-center space-x-2 shadow-lg shadow-slate-900/20 hover:bg-[#2f363d] transition-colors"
          >
            <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/></svg>
            <span>Continue with GitHub</span>
          </button>

          <div className="w-full flex items-center justify-between text-slate-400 text-xs py-2">
            <div className="h-[1px] bg-slate-200 flex-1"></div>
            <span className="px-2">OR</span>
            <div className="h-[1px] bg-slate-200 flex-1"></div>
          </div>

          <button 
             onClick={() => loginAnonymous()}
             className="w-full py-2.5 rounded-xl bg-slate-100/50 text-slate-500 font-medium hover:bg-slate-100 hover:text-slate-700 transition-colors text-sm"
          >
             Continue as Guest
          </button>
        </main>
      </div>
    );
  }

  return (
    <div className="w-[360px] h-[500px] bg-slate-50 flex flex-col font-sans">
      <header className="p-4 glass sticky top-0 z-10 flex items-center justify-between">
        <h1 className="text-lg font-bold bg-clip-text text-transparent bg-premium-gradient">
          ScribbleFlow
        </h1>
        <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 text-white flex items-center justify-center text-xs font-bold">
                {user.name.charAt(0)}
            </div>
            <button onClick={() => logout()} className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-500">
                <LogOut size={16} />
            </button>
        </div>
      </header>

      <main className="flex-1 p-4 overflow-y-auto">
        <h2 className="text-sm font-semibold text-slate-700 uppercase tracking-wider mb-3">Recent Boards</h2>
        
        {/* Empty State */}
        <div className="flex flex-col items-center justify-center py-12 text-center space-y-3">
            <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center">
                <PenTool className="w-6 h-6 text-slate-400" />
            </div>
            <p className="text-slate-500 text-sm">No boards yet.</p>
            <p className="text-xs text-slate-400 max-w-[200px]">Visit any webpage and activate ScribbleFlow to start drawing.</p>
        </div>
      </main>
    </div>
  );
};

const root = createRoot(document.getElementById('root')!);
root.render(
  <React.StrictMode>
    <AuthProvider>
      <PopupContent />
    </AuthProvider>
  </React.StrictMode>
);
