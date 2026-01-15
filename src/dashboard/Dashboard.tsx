import React, { useState, useEffect } from 'react';
import { 
  Menu, 
  Plus, 
  Calendar, 
  Archive, 
  Trash2, 
  MoreHorizontal, 
  Edit3, 
  Clock, 
  Folder,
  FileText,
  ChevronLeft,
  Loader,
  X
} from 'lucide-react';
import { clsx } from 'clsx';
import { useAuth } from '../lib/auth';
import { getFolders, createFolder, getNotes, createNote } from '../lib/appwrite';

// --- Constants ---

const FOLDER_PALETTE = [
  { bg: 'bg-blue-100', icon: 'text-blue-500' },
  { bg: 'bg-red-100', icon: 'text-red-500' },
  { bg: 'bg-yellow-100', icon: 'text-yellow-500' },
  { bg: 'bg-green-100', icon: 'text-green-500' },
  { bg: 'bg-purple-100', icon: 'text-purple-500' },
];

const NOTE_PALETTE = [
  'bg-[#EFE9AE]', 
  'bg-[#F4ACAC]', 
  'bg-[#6FB8DF]', 
  'bg-[#C4F4C4]',
  'bg-[#E0E0E0]'
];

// --- Sub-Components ---

const SidebarItem = ({ icon: Icon, label, active }: { icon: any, label: string, active?: boolean }) => (
  <button className={clsx(
    "flex items-center space-x-4 w-full px-4 py-3 rounded-xl transition-all font-medium text-sm group",
    active ? "text-slate-900 font-bold" : "text-slate-400 hover:text-slate-600 hover:bg-slate-100"
  )}>
    <Icon size={20} className={active ? "text-slate-900" : "text-slate-400 group-hover:text-slate-600"} />
    <span>{label}</span>
  </button>
);

const FolderCard = ({ data, onClick }: { data: any, onClick: () => void }) => {
    const bgClass = data.color || 'bg-slate-100';
    const iconColor = bgClass.replace('bg-', 'text-').replace('-100', '-500'); 
    
    return (
      <div onClick={onClick} className={clsx("p-6 rounded-[2rem] min-w-[240px] h-[180px] flex flex-col justify-between relative group cursor-pointer transition-transform hover:-translate-y-1", bgClass)}>
        <div className="flex justify-between items-start">
          <div className={clsx("w-10 h-10 rounded-xl flex items-center justify-center bg-white/50 backdrop-blur-sm", iconColor)}>
             <Folder size={20} fill="currentColor" />
          </div>
          <button className="p-2 hover:bg-black/5 rounded-full text-slate-700">
            <MoreHorizontal size={20} />
          </button>
        </div>
        
        <div>
          <h3 className="font-bold text-lg text-slate-800 truncate">{data.name}</h3>
          <span className="text-xs text-slate-500 font-medium mt-1 block">
             {new Date(data.$createdAt || Date.now()).toLocaleDateString()}
          </span>
        </div>
      </div>
    );
};

const AddNewCard = ({ label, vertical = false, onClick }: { label: string, vertical?: boolean, onClick?: () => void }) => (
  <button 
    onClick={onClick}
    className={clsx(
    "rounded-[2rem] border-2 border-dashed border-slate-300 flex flex-col items-center justify-center cursor-pointer hover:bg-slate-50 hover:border-slate-400 transition-all group",
    vertical ? "w-full min-h-[320px]" : "min-w-[200px] h-[180px]"
  )}>
    <div className="w-10 h-10 bg-slate-900 rounded-xl flex items-center justify-center text-white mb-3 group-hover:scale-110 transition-transform">
      <Plus size={20} />
    </div>
    <span className="font-semibold text-slate-600 text-sm">{label}</span>
  </button>
);

const NoteCard = ({ data }: { data: any }) => (
  <div className={clsx("p-8 rounded-[2rem] w-full min-h-[320px] flex flex-col relative group cursor-pointer transition-transform hover:-translate-y-1 shadow-sm hover:shadow-md", data.color || 'bg-white border border-slate-200')}>
    {/* Header */}
    <div className="flex justify-between items-start mb-6">
      <div>
        <span className="text-xs font-medium opacity-60 uppercase tracking-wide">
             {new Date(data.$createdAt || Date.now()).toLocaleDateString()}
        </span>
        <h3 className="text-xl font-bold text-slate-900 mt-1 line-clamp-2">{data.title}</h3>
      </div>
      <button className="w-8 h-8 bg-black text-white rounded-lg flex items-center justify-center hover:scale-105 transition-transform">
        <Edit3 size={14} />
      </button>
    </div>

    {/* Body */}
    <p className="text-sm leading-relaxed text-slate-800/80 font-medium mb-auto line-clamp-6">
      {data.excerpt || "No content preview available."}
    </p>

    {/* Footer */}
    <div className="mt-8 flex items-center space-x-2 text-xs font-semibold opacity-60">
      <Clock size={14} />
      <span>{new Date(data.$updatedAt || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
    </div>
  </div>
);

// --- Modal Component ---

const Modal = ({ isOpen, onClose, title, children }: { isOpen: boolean; onClose: () => void; title: string; children: React.ReactNode }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-slate-900/20 backdrop-blur-sm transition-opacity" onClick={onClose}></div>
            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md p-8 relative z-10 animate-in fade-in zoom-in-95 duration-200">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-xl font-bold text-slate-900">{title}</h3>
                    <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full text-slate-400 hover:text-slate-600 transition-colors">
                        <X size={20} />
                    </button>
                </div>
                {children}
            </div>
        </div>
    );
};

// --- Main Component ---

const Dashboard = () => {
  const { user, loading: authLoading, login, loginAnonymous } = useAuth();
  const [folders, setFolders] = useState<any[]>([]);
  const [notes, setNotes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Navigation State
  const [activeFolder, setActiveFolder] = useState<any | null>(null);

  // Mock Mode State
  const [isMockMode, setIsMockMode] = useState(false);

  // Helper to activate Mock Mode with Data
  const activateMockMode = () => {
      console.warn("Activating Mock Mode with Demo Data.");
      setIsMockMode(true);
      setLoading(false);
      
      // Load Mock Data
      setFolders([
          { $id: 'demo-1', name: 'Project Ideas', color: 'bg-blue-100', $createdAt: new Date().toISOString() },
          { $id: 'demo-2', name: 'Meeting Notes', color: 'bg-green-100', $createdAt: new Date().toISOString() },
          { $id: 'demo-3', name: 'Personal', color: 'bg-purple-100', $createdAt: new Date().toISOString() }
      ]);
      setNotes([
          { $id: 'note-1', title: 'Welcome to SkribbleFlo', excerpt: 'This is a demo note showing how the dashboard looks.', color: 'bg-[#EFE9AE]', $createdAt: new Date().toISOString(), $updatedAt: new Date().toISOString() },
          { $id: 'note-2', title: 'Design Concepts', excerpt: 'Glassmorphism and pastel colors are the trend.', color: 'bg-[#F4ACAC]', $createdAt: new Date().toISOString(), $updatedAt: new Date().toISOString() }
      ]);
  };

  // SAFETY TIMEOUT: Force load dashboard if auth hangs (for video reliability)
  useEffect(() => {
      const timer = setTimeout(() => {
          if (loading) {
              console.warn("Loading timed out. Forcing Dashboard rendering.");
              if (!user) {
                  activateMockMode();
              } else {
                  setLoading(false);
              }
          }
      }, 2000);
      return () => clearTimeout(timer);
  }, [loading, user]);

  // Modal States
  const [isFolderModalOpen, setIsFolderModalOpen] = useState(false);
  const [isNoteModalOpen, setIsNoteModalOpen] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const [newNoteTitle, setNewNoteTitle] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Auto-Login as Guest or Fallback to Mock Mode
  useEffect(() => {
      if (authLoading) return;
      if (user) return; // Already logged in

      const initGuest = async () => {
          try {
              console.log("Attempting guest login...");
              await loginAnonymous();
          } catch (e) {
              console.warn("Guest login blocked. Using Mock Mode.", e);
              activateMockMode();
          }
      };
      
      initGuest();
  }, [authLoading, user]);


  // Initial Fetch
  useEffect(() => {
      if (authLoading) return; // Wait for auth to be ready
      if (isMockMode) return; // Don't fetch if mock mode

      const fetchData = async () => {
          if (!user) {
              setLoading(false);
              return;
          }
          try {
              const [foldersData, notesData] = await Promise.all([
                  getFolders(user.$id),
                  getNotes(user.$id)
              ]);
              setFolders(foldersData);
              setNotes(notesData);
          } catch (e) {
              console.error("Error loading dashboard data", e);
          } finally {
              setLoading(false);
          }
      };
      
      fetchData();
  }, [user, authLoading, isMockMode]);

  // Actions
  const handleCreateFolder = async (e: React.FormEvent) => {
      e.preventDefault();
      
      let effectiveMockMode = isMockMode;
      if (!user && !isMockMode) {
          console.warn("User not logged in. Forcing Mock Mode activation.");
          activateMockMode();
          effectiveMockMode = true; 
      }

      if (!newFolderName.trim()) return;

      setIsSubmitting(true);
      
      // MOCK MODE HANDLER
      if (effectiveMockMode) {
          const randomColor = FOLDER_PALETTE[Math.floor(Math.random() * FOLDER_PALETTE.length)].bg;
          const mockFolder = { 
              $id: Date.now().toString(), 
              name: newFolderName, 
              color: randomColor, 
              $createdAt: new Date().toISOString() 
          };
          setFolders(prev => [mockFolder, ...prev]);
          setIsFolderModalOpen(false);
          setNewFolderName('');
          setIsSubmitting(false);
          return;
      }

      // REAL BACKEND
      const randomColor = FOLDER_PALETTE[Math.floor(Math.random() * FOLDER_PALETTE.length)].bg;
      try {
          const newFolder = await createFolder(newFolderName, randomColor, user!.$id);
          setFolders(prev => [newFolder, ...prev]);
          setIsFolderModalOpen(false);
          setNewFolderName('');
      } catch (e: any) {
          console.error(e);
          // If real backend fails (e.g. auth lost), fallback to mock? No, alert for now.
          alert("Failed to create folder: " + e.message);
      } finally {
          setIsSubmitting(false);
      }
  };

  const handleCreateNote = async (e: React.FormEvent) => {
      e.preventDefault();
      
      let effectiveMockMode = isMockMode;
      if (!user && !isMockMode) {
          console.warn("User not logged in. Forcing Mock Mode activation.");
          activateMockMode();
          effectiveMockMode = true;
      }

      if (!newNoteTitle.trim()) return;

      setIsSubmitting(true);

      // MOCK MODE HANDLER
      if (effectiveMockMode) {
          const randomColor = NOTE_PALETTE[Math.floor(Math.random() * NOTE_PALETTE.length)];
          const mockNote = { 
              $id: Date.now().toString(), 
              title: newNoteTitle, 
              excerpt: "Start typing your thoughts here...", 
              color: randomColor, 
              folderId: activeFolder?.$id, 
              $createdAt: new Date().toISOString(),
              $updatedAt: new Date().toISOString()
          };
          setNotes(prev => [mockNote, ...prev]);
          setIsNoteModalOpen(false);
          setNewNoteTitle('');
          setIsSubmitting(false);
          return;
      }

      // REAL BACKEND
      const randomColor = NOTE_PALETTE[Math.floor(Math.random() * NOTE_PALETTE.length)];
      try {
          const newNote = await createNote(newNoteTitle, "Start typing your thoughts here...", randomColor, user!.$id);
          setNotes(prev => [newNote, ...prev]);
          setIsNoteModalOpen(false);
          setNewNoteTitle('');
      } catch (e) {
          console.error(e);
          alert("Failed to create note");
      } finally {
          setIsSubmitting(false);
      }
  };

  // Filter Notes based on Active Folder
  const filteredNotes = activeFolder 
    ? notes.filter(n => n.folderId === activeFolder.$id) 
    : notes;

  return (
    <div className="flex h-screen w-full bg-[#F8FAFC]">
      
      {/* Create Folder Modal */}
      <Modal isOpen={isFolderModalOpen} onClose={() => setIsFolderModalOpen(false)} title="Create New Folder">
          <form onSubmit={handleCreateFolder}>
              <div className="space-y-4">
                  <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-2">Folder Name</label>
                      <input 
                          autoFocus
                          type="text" 
                          value={newFolderName}
                          onChange={(e) => setNewFolderName(e.target.value)}
                          placeholder="e.g., Project Ideas"
                          className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-medium text-slate-800 placeholder:text-slate-400"
                      />
                  </div>
                  <div className="flex justify-end space-x-3 pt-2">
                      <button 
                          type="button"
                          onClick={() => setIsFolderModalOpen(false)}
                          className="px-5 py-2.5 rounded-xl font-bold text-slate-500 hover:bg-slate-50 transition-colors"
                      >
                          Cancel
                      </button>
                      <button 
                          type="submit"
                          disabled={isSubmitting || !newFolderName.trim()}
                          className="px-6 py-2.5 rounded-xl bg-slate-900 text-white font-bold hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-slate-900/20"
                      >
                          {isSubmitting ? 'Creating...' : 'Create Folder'}
                      </button>
                  </div>
              </div>
          </form>
      </Modal>

      {/* Create Note Modal */}
      <Modal isOpen={isNoteModalOpen} onClose={() => setIsNoteModalOpen(false)} title="Create New Note">
          <form onSubmit={handleCreateNote}>
              <div className="space-y-4">
                  <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-2">Note Title</label>
                      <input 
                          autoFocus
                          type="text" 
                          value={newNoteTitle}
                          onChange={(e) => setNewNoteTitle(e.target.value)}
                          placeholder="e.g., Meeting Notes"
                          className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-medium text-slate-800 placeholder:text-slate-400"
                      />
                  </div>
                  <div className="flex justify-end space-x-3 pt-2">
                      <button 
                          type="button"
                          onClick={() => setIsNoteModalOpen(false)}
                          className="px-5 py-2.5 rounded-xl font-bold text-slate-500 hover:bg-slate-50 transition-colors"
                      >
                          Cancel
                      </button>
                      <button 
                          type="submit"
                          disabled={isSubmitting || !newNoteTitle.trim()}
                          className="px-6 py-2.5 rounded-xl bg-slate-900 text-white font-bold hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-slate-900/20"
                      >
                          {isSubmitting ? 'Creating...' : 'Create Note'}
                      </button>
                  </div>
              </div>
          </form>
      </Modal>

      {/* Sidebar */}
      <aside className="w-[280px] bg-white h-full flex flex-col p-8 border-r border-slate-100 hidden lg:flex">
        {/* Logo */}
        <div className="flex items-center space-x-3 mb-12">
            <img src="/icons/icon-48.png" alt="Logo" className="w-8 h-8" />
            <span className="font-bold text-xl tracking-tight text-slate-800">SkribbleFlo</span>
        </div>

        {/* Add New Button */}
        <button onClick={() => setIsNoteModalOpen(true)} className="flex items-center space-x-3 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 shadow-sm mb-10 transition-colors w-max">
           <div className="bg-black text-white rounded-lg p-1">
             <Plus size={14} />
           </div>
           <span className="font-bold text-sm text-slate-800">New Note</span>
        </button>

        {/* Navigation */}
        <nav className="space-y-2 flex-1">
          <SidebarItem icon={Calendar} label="Calendar" />
          <SidebarItem icon={Archive} label="Archive" />
          <SidebarItem icon={Trash2} label="Trash" />
        </nav>

        {/* Upgrade Pro Illustration */}
        <div className="mt-auto">
            <div className="bg-slate-50 p-6 rounded-3xl text-center relative overflow-hidden group">
               <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400"></div>
               <p className="text-xs text-slate-500 mb-4 leading-relaxed">
                   Want to access unlimited notes taking experience & lot's of features?
               </p>
               <button className="w-full py-3 bg-slate-900 text-white rounded-xl font-bold text-sm shadow-lg shadow-slate-900/20 hover:scale-[1.02] transition-transform">
                   Upgrade pro
               </button>
               {/* Decorative doodle */}
               <div className="absolute -bottom-6 -right-6 text-slate-200 opacity-50">
                   <FileText size={80} strokeWidth={1} />
               </div>
            </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 h-full overflow-y-auto custom-scrollbar">
        <div className="max-w-7xl mx-auto p-8 lg:p-12">
            {/* Top Bar */}
            <header className="flex items-center justify-between mb-16">
                <div className="flex items-center space-x-4">
                     {activeFolder && (
                         <button onClick={() => setActiveFolder(null)} className="p-2 hover:bg-white rounded-xl transition-colors">
                             <ChevronLeft size={24} className="text-slate-700" />
                         </button>
                     )}
                     <div className="flex flex-col">
                        <h1 className="text-4xl font-bold text-slate-900 tracking-tight">
                            {activeFolder ? activeFolder.name : 'My Notes'}
                        </h1>
                        {activeFolder && <span className="text-slate-500 font-medium">Viewing Folder</span>}
                     </div>
                </div>
                
                <div className="flex items-center space-x-6">
                    {/* User Profile */}
                    <div className="flex items-center space-x-4">
                        {!user ? (
                            <button 
                                onClick={() => login('google')}
                                className="px-4 py-2 bg-slate-900 text-white text-sm font-bold rounded-xl hover:bg-slate-800 transition-colors"
                            >
                                Login with Google
                            </button>
                        ) : (
                            <>
                                <div className="text-right hidden md:block">
                                    <h4 className="font-bold text-sm text-slate-900">{user.name}</h4>
                                </div>
                                <div className="w-10 h-10 rounded-xl bg-slate-200 overflow-hidden border-2 border-white shadow-sm flex items-center justify-center font-bold text-slate-500">
                                     {user.name?.charAt(0) || 'U'}
                                </div>
                            </>
                        )}
                        <button className="p-2 hover:bg-white rounded-xl">
                            <Menu size={24} className="text-slate-700" />
                        </button>
                    </div>
                </div>
            </header>
            
             {loading ? (
                <div className="flex items-center justify-center h-64">
                    <div className="flex flex-col items-center space-y-4 text-slate-400">
                        <Loader className="animate-spin text-indigo-500" size={32} />
                        <span>Loading your workspace...</span>
                    </div>
                </div>
             ) : (
                <div className="space-y-16">
                    {/* Recent Folders (Only show on Dashboard home) */}
                    {!activeFolder && (
                        <section>
                            <div className="flex items-center justify-between mb-8">
                                <h2 className="text-2xl font-bold text-slate-800">Recent Folders</h2>
                                <div className="flex space-x-6 text-sm font-bold text-slate-400">
                                <button className="text-slate-900 border-b-2 border-slate-900 pb-1">All Folders</button>
                                </div>
                            </div>
                            
                            <div className="flex space-x-6 overflow-x-auto pb-4 hide-scrollbar">
                                {folders.map((folder) => (
                                    <FolderCard key={folder.$id} data={folder} onClick={() => setActiveFolder(folder)} />
                                ))}
                                <AddNewCard label="New folder" onClick={() => setIsFolderModalOpen(true)} />
                            </div>
                        </section>
                    )}

                    {/* My Notes */}
                    <section>
                        <div className="flex items-center justify-between mb-8">
                            <h2 className="text-2xl font-bold text-slate-800">
                                {activeFolder ? `Notes in ${activeFolder.name}` : 'My Notes'}
                            </h2>
                            <div className="flex items-center space-x-4">
                                <div className="flex space-x-6 text-sm font-bold text-slate-400 mr-8 hidden md:flex">
                                    <button className="text-slate-900 border-b-2 border-slate-900 pb-1">Recent</button>
                                </div>
                            </div>
                        </div>

                        {filteredNotes.length === 0 ? (
                             <div className="flex flex-col items-center justify-center py-20 border-2 border-dashed border-slate-200 rounded-3xl bg-slate-50/50">
                                <FileText className="text-slate-300 w-16 h-16 mb-4" />
                                <h3 className="text-lg font-semibold text-slate-600">No notes yet</h3>
                                <p className="text-slate-400 text-sm mb-6">
                                    {activeFolder ? 'This folder is empty.' : 'Create your first note to get started'}
                                </p>
                                <button onClick={() => setIsNoteModalOpen(true)} className="px-6 py-2 bg-slate-900 text-white rounded-xl font-bold text-sm hover:scale-105 transition-transform">
                                    Create Note
                                </button>
                             </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                                {filteredNotes.map((note) => (
                                    <NoteCard key={note.$id} data={note} />
                                ))}
                                <AddNewCard label="New Note" vertical onClick={() => setIsNoteModalOpen(true)} />
                            </div>
                        )}
                    </section>
                </div>
             )}

        </div>
      </main>
    </div>
  );
};

export default Dashboard;
