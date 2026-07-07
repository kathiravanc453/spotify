import { useState, useCallback, useEffect } from 'react';
import { usePlayer } from '../context/PlayerContext';
import { 
  Upload, Music, Image, CheckCircle, AlertCircle, X, Plus, Loader2, TrendingUp, Star, Download, 
  LogOut, ShieldAlert, Key, Trash2, FolderPlus, FolderHeart, Flame, Waves, Compass, Sparkles, Disc3, Heart, Zap, Coffee
} from 'lucide-react';
import { db } from '../firebase';
import { collection, addDoc, getDocs, deleteDoc, doc, query, orderBy } from 'firebase/firestore';

const ICON_MAP = {
  Flame, Sparkles, Disc3, Music, Waves, Compass, TrendingUp, Star, Heart, Zap, Coffee, FolderHeart
};

const API_BASE = '/api';

function DropZone({ label, accept, icon: Icon, file, onFile, color, type }) {
  const [dragging, setDragging] = useState(false);

  const handleDrop = (e) => {
    e.preventDefault();
    setDragging(false);
    const f = e.dataTransfer.files[0];
    if (f) onFile(f);
  };

  return (
    <label
      className={`relative flex flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed
        cursor-pointer transition-all duration-300 p-6 min-h-[140px]
        ${dragging ? `border-${color} bg-${color}/10 scale-[1.02]` : 'border-white/20 hover:border-white/40 bg-white/5 hover:bg-white/8'}`}
      onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
      onDragLeave={() => setDragging(false)}
      onDrop={handleDrop}
    >
      <input
        type="file"
        accept={accept}
        className="absolute inset-0 opacity-0 cursor-pointer"
        onChange={(e) => e.target.files[0] && onFile(e.target.files[0])}
      />
      {file ? (
        <div className="flex flex-col items-center gap-2 text-center">
          <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${color === 'spotify-green' ? 'bg-spotify-green/20' : 'bg-purple-500/20'}`}>
            <CheckCircle size={24} className={color === 'spotify-green' ? 'text-spotify-green' : 'text-purple-400'} />
          </div>
          <p className="text-white text-sm font-medium truncate max-w-[180px]">{file.name}</p>
          <p className="text-white/40 text-xs">Ready to upload</p>
        </div>
      ) : (
        <div className="flex flex-col items-center gap-2 text-center">
          <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center">
            <Icon size={24} className="text-white/50" />
          </div>
          <p className="text-white/70 text-sm font-medium">{label}</p>
          <p className="text-white/30 text-xs">Click or drag & drop</p>
        </div>
      )}
    </label>
  );
}

export default function AdminUpload() {
  const { allSongs, refreshSongs } = usePlayer();

  const [audioFile, setAudioFile] = useState(null);
  const [coverFile, setCoverFile] = useState(null);
  const [form, setForm] = useState({
    title: '', artist: '', album: '', genre: 'Tamil',
    trending: false, recommended: false, coverUrl: ''
  });
  const [status, setStatus] = useState('idle'); // idle, uploading, syncing, success, error
  const [errorMsg, setErrorMsg] = useState('');

  // ── Password Reset State ──
  const [resetEmail, setResetEmail] = useState('');
  const [resetPassword, setResetPassword] = useState('');
  const [resetStatus, setResetStatus] = useState('idle');
  const [resetMsg, setResetMsg] = useState('');

  // ── Custom Folder Management State ──
  const [folders, setFolders] = useState([]);
  const [folderForm, setFolderForm] = useState({
    title: '', subtitle: '', query: '', color: 'from-orange-500 to-rose-600', icon: 'Flame', cover: ''
  });
  const [folderStatus, setFolderStatus] = useState('idle');
  const [folderError, setFolderError] = useState('');

  const fetchFolders = async () => {
    if (!db) return;
    try {
      const q = query(collection(db, 'folders'), orderBy('createdAt', 'asc'));
      const snapshot = await getDocs(q);
      const list = [];
      snapshot.forEach(doc => list.push({ id: doc.id, ...doc.data() }));
      setFolders(list);
    } catch (err) {
      console.error("Failed to load custom folders:", err);
    }
  };

  useEffect(() => {
    fetchFolders();
  }, []);

  const handleAddFolder = async (e) => {
    e.preventDefault();
    if (!folderForm.title || !folderForm.query) return alert("Title and Query are required.");
    setFolderStatus('loading');
    setFolderError('');
    try {
      await addDoc(collection(db, 'folders'), {
        ...folderForm,
        createdAt: new Date().toISOString()
      });
      setFolderForm({ title: '', subtitle: '', query: '', color: 'from-orange-500 to-rose-600', icon: 'Flame', cover: '' });
      setFolderStatus('success');
      fetchFolders();
      setTimeout(() => setFolderStatus('idle'), 3000);
    } catch (err) {
      setFolderStatus('error');
      setFolderError(err.message);
    }
  };

  const handleDeleteFolder = async (id) => {
    if (!window.confirm("Are you sure you want to delete this folder?")) return;
    try {
      await deleteDoc(doc(db, 'folders', id));
      fetchFolders();
    } catch (err) {
      alert("Failed to delete folder: " + err.message);
    }
  };

  // ── Email Auth gate — reads from main rhythmix_session ──────────────────
  const adminSession = (() => {
    try { return JSON.parse(localStorage.getItem('rhythmix_session') || 'null'); } catch { return null; }
  })();

  const handleAdminLogout = () => {
    localStorage.removeItem('rhythmix_session');
    window.location.reload();
  };

  const handleGlobalLogout = async () => {
    if (window.confirm("Are you sure you want to force logout EVERY active user from the app?")) {
      try {
        await fetch('/api/admin/logout-all', { method: 'POST' });
        alert("All users have been successfully logged out globally!");
      } catch (err) {
        alert("Failed to execute global logout.");
      }
    }
  };

  // Show Access Denied if not logged in OR not an admin
  if (!adminSession || adminSession.role !== 'admin') {
    return (
      <div className="flex flex-col items-center justify-center h-[70vh] text-center px-4 animate-in fade-in zoom-in duration-500">
        <div className="w-20 h-20 bg-rose-500/10 rounded-full flex items-center justify-center border border-rose-500/20 shadow-lg shadow-rose-500/10 mb-6">
          <ShieldAlert size={40} className="text-rose-500" />
        </div>
        <h1 className="text-white text-3xl font-extrabold tracking-tight mb-2">Access Denied</h1>
        <p className="text-white/50 text-sm max-w-md">
          You need to be logged in as the Admin to upload songs. Please log out and sign in with your admin email.
        </p>
      </div>
    );
  }
  // ──────────────────────────────────────────────────────────────────────────


  const handlePasswordReset = async (e) => {
    e.preventDefault();
    if (!resetEmail || !resetPassword) return;
    setResetStatus('loading');
    try {
      const res = await fetch('/api/admin/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: resetEmail, newPassword: resetPassword })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to reset password');
      setResetStatus('success');
      setResetMsg(data.message);
      setResetEmail('');
      setResetPassword('');
      setTimeout(() => setResetStatus('idle'), 5000);
    } catch (err) {
      setResetStatus('error');
      setResetMsg(err.message);
    }
  };

  const handleAudioSelect = (file) => {
    setAudioFile(file);
    setErrorMsg('');
    setStatus('idle');

    if (!file) return;

    // Suggest a song title from the filename (clean extension and special characters)
    const cleanFilename = file.name.replace(/\.[^/.]+$/, "").replace(/[_-]/g, " ");
    
    // Auto-populate the title form field if it is currently empty
    setForm(prev => ({
      ...prev,
      title: prev.title || cleanFilename.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')
    }));

    // Quick duplicate check on selection
    const duplicate = (allSongs || []).some(
      song => song.title.toLowerCase().trim() === cleanFilename.toLowerCase().trim()
    );

    if (duplicate) {
      setErrorMsg(`Warning: A song named "${cleanFilename}" already exists in the library.`);
      setStatus('error');
    }
  };

  const uploadToLocalServer = async (file) => {
    const formData = new FormData();
    formData.append('file', file);

    const res = await fetch(`${API_BASE}/upload`, {
      method: 'POST',
      body: formData
    });
    
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error?.message || 'Local upload failed');
    }
    
    const data = await res.json();
    return data.url;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!audioFile) return alert('Please select an audio file');
    
    setErrorMsg('');

    // Strict validation to check if the song exists by title+artist or by clean filename
    const cleanFilename = audioFile.name.replace(/\.[^/.]+$/, "").replace(/[_-]/g, " ").toLowerCase().trim();
    const duplicateByTitleArtist = (allSongs || []).some(
      song => 
        song.title.toLowerCase().trim() === form.title.toLowerCase().trim() &&
        song.artist.toLowerCase().trim() === form.artist.toLowerCase().trim()
    );
    const duplicateByFilename = (allSongs || []).some(
      song => song.title.toLowerCase().trim() === cleanFilename
    );

    if (duplicateByTitleArtist || duplicateByFilename) {
      setErrorMsg('This song has already been uploaded previously. Upload blocked to prevent duplicates.');
      setStatus('error');
      return;
    }

    setStatus('uploading');

    try {
      // 1. Upload Cover to local server (if exists), else use URL, else use generic music fallback
      let finalCoverUrl = form.coverUrl || 'https://images.unsplash.com/photo-1493225457124-a1a2a5d5facf?w=500';
      if (coverFile) {
        finalCoverUrl = await uploadToLocalServer(coverFile);
      }

      // 2. Upload Audio to local server
      const audioUrl = await uploadToLocalServer(audioFile);

      // 3. Sync metadata to local songs.json via our backend
      setStatus('syncing');
      const syncRes = await fetch(`${API_BASE}/songs`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          src: audioUrl,
          cover: finalCoverUrl,
          duration: 0 // Cloudinary can provide this but 0 is safe for now
        })
      });

      if (!syncRes.ok) throw new Error('Failed to update songs.json');

      setStatus('success');
      setAudioFile(null);
      setCoverFile(null);
      setForm({ title: '', artist: '', album: '', genre: 'Tamil', trending: false, recommended: false, coverUrl: '' });
      
      if (refreshSongs) refreshSongs();
      setTimeout(() => setStatus('idle'), 5000);

    } catch (err) {
      console.error(err);
      setErrorMsg(err.message);
      setStatus('error');
    }
  };

  return (
    <div className="p-4 md:p-8 max-w-4xl mx-auto space-y-8">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-white text-3xl font-bold mb-1">Admin Dashboard</h1>
          <p className="text-white/50 text-sm">Upload songs directly to your cloud and view app statistics.</p>
          <div className="flex items-center gap-2 mt-2">
            <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
            <span className="text-green-400 text-xs font-semibold">Admin · {adminSession?.email}</span>
          </div>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleGlobalLogout}
            className="flex items-center gap-2 bg-rose-500/10 border border-rose-500/20 hover:bg-rose-500 hover:border-rose-500 text-rose-400 hover:text-white text-xs font-bold px-4 py-2.5 rounded-xl transition-all duration-300 cursor-pointer flex-shrink-0"
            title="Kick every user off the app immediately"
          >
            <ShieldAlert size={14} /> Global Logout
          </button>
          <button
            onClick={handleAdminLogout}
            className="flex items-center gap-2 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 text-white/50 hover:text-white text-xs font-bold px-4 py-2.5 rounded-xl transition-all duration-300 cursor-pointer flex-shrink-0"
          >
            <LogOut size={14} /> Exit Admin
          </button>
        </div>
      </div>


      <div className="bg-white/5 rounded-3xl border border-white/10 p-6 md:p-8 space-y-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <DropZone label="Audio (MP3)" accept="audio/*" icon={Music}
              file={audioFile} onFile={handleAudioSelect} color="spotify-green" type="audio" />
            <DropZone label="Cover Image" accept="image/*" icon={Image}
              file={coverFile} onFile={setCoverFile} color="purple-500" type="image" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-white/60 text-sm">Song Title</label>
              <input required value={form.title} onChange={e => setForm({...form, title: e.target.value})}
                placeholder="Song Title" className="w-full bg-white/10 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-spotify-green transition-all" />
            </div>
            <div className="space-y-2">
              <label className="text-white/60 text-sm">Artist</label>
              <input required value={form.artist} onChange={e => setForm({...form, artist: e.target.value})}
                placeholder="Artist Name" className="w-full bg-white/10 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-spotify-green transition-all" />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-white/60 text-sm">Album</label>
              <input value={form.album} onChange={e => setForm({...form, album: e.target.value})}
                placeholder="Album Name" className="w-full bg-white/10 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-spotify-green transition-all" />
            </div>
            <div className="space-y-2">
              <label className="text-white/60 text-sm">Genre</label>
              <select value={form.genre} onChange={e => setForm({...form, genre: e.target.value})}
                className="w-full bg-white/10 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-spotify-green transition-all appearance-none">
                <option value="Tamil" className="bg-spotify-black">Tamil</option>
                <option value="English" className="bg-spotify-black">English</option>
                <option value="Hindi" className="bg-spotify-black">Hindi</option>
              </select>
            </div>
            <div className="space-y-2 md:col-span-2">
              <label className="text-white/60 text-sm">Or paste a Cover Image URL (optional)</label>
              <input value={form.coverUrl} onChange={e => setForm({...form, coverUrl: e.target.value})}
                placeholder="https://example.com/album-art.jpg" className="w-full bg-white/10 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-spotify-green transition-all" />
              <p className="text-white/30 text-[10px]">If you drag and drop an image above, it will override this link.</p>
            </div>
          </div>

          <div className="flex gap-4">
            <label className="flex items-center gap-2 cursor-pointer group">
              <div className={`w-5 h-5 rounded border flex items-center justify-center transition-all ${form.trending ? 'bg-spotify-green border-spotify-green' : 'border-white/20'}`}>
                {form.trending && <CheckCircle size={14} color="#000" />}
              </div>
              <input type="checkbox" className="hidden" checked={form.trending} onChange={e => setForm({...form, trending: e.target.checked})} />
              <span className="text-white/70 text-sm group-hover:text-white transition-all">Trending</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer group">
              <div className={`w-5 h-5 rounded border flex items-center justify-center transition-all ${form.recommended ? 'bg-spotify-green border-spotify-green' : 'border-white/20'}`}>
                {form.recommended && <CheckCircle size={14} color="#000" />}
              </div>
              <input type="checkbox" className="hidden" checked={form.recommended} onChange={e => setForm({...form, recommended: e.target.checked})} />
              <span className="text-white/70 text-sm group-hover:text-white transition-all">Recommended</span>
            </label>
          </div>

          <button
            type="submit"
            disabled={status !== 'idle' && status !== 'success' && status !== 'error'}
            className={`w-full py-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-all
              ${status === 'success' ? 'bg-spotify-green text-black' : 'bg-spotify-green hover:scale-[1.02] text-black active:scale-95 disabled:opacity-50'}`}
          >
            {status === 'uploading' && <><Loader2 className="animate-spin" /> Uploading...</>}
            {status === 'syncing' && <><Loader2 className="animate-spin" /> Updating songs.json...</>}
            {status === 'success' && <><CheckCircle /> Song Published!</>}
            {status === 'error' && <><AlertCircle /> Failed: {errorMsg}</>}
            {(status === 'idle') && <><Upload size={20} /> Upload Song</>}
          </button>
        </form>
      </div>

      {/* ── USER PASSWORD RESET MODULE ── */}
      <div className="bg-white/5 rounded-3xl border border-white/10 p-6 md:p-8 space-y-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-orange-500/20 flex items-center justify-center">
            <Key size={20} className="text-orange-400" />
          </div>
          <div>
            <h2 className="text-white text-xl font-bold">Force Reset User Password</h2>
            <p className="text-white/40 text-xs">Reset a user's password if they forgot it and cannot log in.</p>
          </div>
        </div>

        <form onSubmit={handlePasswordReset} className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <input
            type="email"
            required
            placeholder="User's Email Address"
            className="w-full bg-white/[0.03] border border-white/10 text-white placeholder-white/30 text-sm rounded-xl px-4 py-3 focus:outline-none focus:border-orange-500/50"
            value={resetEmail}
            onChange={e => setResetEmail(e.target.value)}
          />
          <input
            type="text"
            required
            placeholder="New Temporary Password"
            className="w-full bg-white/[0.03] border border-white/10 text-white placeholder-white/30 text-sm rounded-xl px-4 py-3 focus:outline-none focus:border-orange-500/50"
            value={resetPassword}
            onChange={e => setResetPassword(e.target.value)}
          />
          <button
            type="submit"
            disabled={resetStatus === 'loading'}
            className="w-full bg-orange-500 hover:bg-orange-400 text-black font-bold text-sm rounded-xl px-4 py-3 transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {resetStatus === 'loading' ? <Loader2 size={16} className="animate-spin" /> : <Key size={16} />}
            Reset Password
          </button>
        </form>

        {resetStatus === 'success' && (
          <div className="p-3 bg-green-500/10 border border-green-500/20 rounded-xl flex items-center gap-2 text-green-400 text-sm font-semibold">
            <CheckCircle size={16} /> {resetMsg}
          </div>
        )}
        {resetStatus === 'error' && (
          <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center gap-2 text-red-400 text-sm font-semibold">
            <AlertCircle size={16} /> {resetMsg}
          </div>
        )}
      </div>

      {/* ── CUSTOM DYNAMIC FOLDERS MANAGEMENT ── */}
      <div className="bg-white/5 rounded-3xl border border-white/10 p-6 md:p-8 space-y-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-cyan-500/20 flex items-center justify-center border border-cyan-500/30">
            <FolderPlus size={20} className="text-cyan-400" />
          </div>
          <div>
            <h2 className="text-white text-xl font-bold">Manage Discover Music Folders</h2>
            <p className="text-white/40 text-xs font-medium">Create and manage custom music folders that display dynamically on the Home screen.</p>
          </div>
        </div>

        <form onSubmit={handleAddFolder} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-white/60 text-sm font-semibold">Folder Title</label>
              <input 
                required 
                value={folderForm.title} 
                onChange={e => setFolderForm({...folderForm, title: e.target.value})}
                placeholder="e.g. Vintage Hits" 
                className="w-full bg-white/10 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-cyan-500 transition-all text-sm" 
              />
            </div>
            <div className="space-y-2">
              <label className="text-white/60 text-sm font-semibold">Subtitle / Description</label>
              <input 
                required 
                value={folderForm.subtitle} 
                onChange={e => setFolderForm({...folderForm, subtitle: e.target.value})}
                placeholder="e.g. Classic retro songs from 70s & 80s" 
                className="w-full bg-white/10 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-cyan-500 transition-all text-sm" 
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <label className="text-white/60 text-sm font-semibold">Search Query (Loads songs in Search)</label>
              <input 
                required 
                value={folderForm.query} 
                onChange={e => setFolderForm({...folderForm, query: e.target.value})}
                placeholder="e.g. SPB Ilaiyaraaja Hits" 
                className="w-full bg-white/10 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-cyan-500 transition-all text-sm" 
              />
            </div>

            <div className="space-y-2">
              <label className="text-white/60 text-sm font-semibold">Icon</label>
              <select 
                value={folderForm.icon} 
                onChange={e => setFolderForm({...folderForm, icon: e.target.value})}
                className="w-full bg-white/10 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-cyan-500 transition-all text-sm appearance-none"
              >
                <option value="Flame" className="bg-spotify-black">Flame 🔥</option>
                <option value="Sparkles" className="bg-spotify-black">Sparkles ✨</option>
                <option value="Disc3" className="bg-spotify-black">Vinyl Disc 💿</option>
                <option value="Music" className="bg-spotify-black">Music Notes 🎵</option>
                <option value="Waves" className="bg-spotify-black">Waves 🌊</option>
                <option value="Compass" className="bg-spotify-black">Compass 🧭</option>
                <option value="TrendingUp" className="bg-spotify-black">Trending Up 📈</option>
                <option value="Star" className="bg-spotify-black">Star ⭐</option>
                <option value="Heart" className="bg-spotify-black">Heart ❤️</option>
                <option value="Zap" className="bg-spotify-black">Lightning ⚡</option>
                <option value="Coffee" className="bg-spotify-black">Coffee ☕</option>
                <option value="FolderHeart" className="bg-spotify-black">Folder Heart 📁</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-white/60 text-sm font-semibold">Color Gradient</label>
              <select 
                value={folderForm.color} 
                onChange={e => setFolderForm({...folderForm, color: e.target.value})}
                className="w-full bg-white/10 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-cyan-500 transition-all text-sm appearance-none"
              >
                <option value="from-orange-500 to-rose-600" className="bg-spotify-black">Orange to Rose</option>
                <option value="from-amber-400 to-orange-600" className="bg-spotify-black">Amber to Orange</option>
                <option value="from-blue-600 to-cyan-500" className="bg-spotify-black">Blue to Cyan</option>
                <option value="from-rose-500 to-indigo-600" className="bg-spotify-black">Rose to Indigo</option>
                <option value="from-indigo-500 to-purple-600" className="bg-spotify-black">Indigo to Purple</option>
                <option value="from-teal-500 to-emerald-600" className="bg-spotify-black">Teal to Emerald</option>
                <option value="from-pink-500 to-rose-500" className="bg-spotify-black">Pink to Rose</option>
                <option value="from-violet-600 to-indigo-500" className="bg-spotify-black">Violet to Indigo</option>
                <option value="from-slate-600 to-gray-500" className="bg-spotify-black">Slate to Gray</option>
              </select>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-white/60 text-sm font-semibold">Cover Image URL (optional)</label>
            <input 
              value={folderForm.cover} 
              onChange={e => setFolderForm({...folderForm, cover: e.target.value})}
              placeholder="e.g. https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=500" 
              className="w-full bg-white/10 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-cyan-500 transition-all text-sm" 
            />
          </div>

          <button
            type="submit"
            disabled={folderStatus === 'loading'}
            className="w-full bg-cyan-500 hover:bg-cyan-400 hover:scale-[1.01] text-black font-bold text-sm rounded-xl py-3.5 transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
          >
            {folderStatus === 'loading' ? <Loader2 size={18} className="animate-spin" /> : <Plus size={18} />}
            Create Folder
          </button>
        </form>

        {folderStatus === 'success' && (
          <div className="p-3 bg-green-500/10 border border-green-500/20 rounded-xl flex items-center gap-2 text-green-400 text-sm font-semibold">
            <CheckCircle size={16} /> Folder created successfully!
          </div>
        )}
        {folderStatus === 'error' && (
          <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center gap-2 text-red-400 text-sm font-semibold">
            <AlertCircle size={16} /> Error: {folderError}
          </div>
        )}

        {/* Existing Custom Folders List */}
        <div className="mt-8 pt-6 border-t border-white/10 space-y-4">
          <h3 className="text-white font-bold text-lg">Current Custom Folders ({folders.length})</h3>
          
          {folders.length === 0 ? (
            <p className="text-white/40 text-sm">No custom folders created yet. They will appear here once added.</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {folders.map((folder) => {
                const FolderIcon = ICON_MAP[folder.icon] || FolderHeart;
                return (
                  <div 
                    key={folder.id} 
                    className="relative overflow-hidden rounded-2xl p-4 bg-white/[0.02] border border-white/5 flex flex-col justify-between gap-4 group hover:border-white/10 transition-all duration-300 min-h-[140px]"
                  >
                    <div 
                      className="absolute inset-0 bg-cover bg-center opacity-25 group-hover:opacity-40 transition-opacity duration-300"
                      style={{ backgroundImage: `url(${folder.cover || 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=500'})` }}
                    />
                    <div className="absolute inset-0 bg-black/40" />
                    <div className={`absolute -right-6 -bottom-6 w-20 h-20 rounded-full bg-gradient-to-tr ${folder.color} opacity-10 blur-xl z-0`} />
                    
                    <div className="flex items-start justify-between gap-2 z-10">
                      <div className={`w-10 h-10 rounded-xl bg-gradient-to-tr ${folder.color} flex items-center justify-center shadow-md`}>
                        <FolderIcon size={18} className="text-white" />
                      </div>
                      <button 
                        onClick={() => handleDeleteFolder(folder.id)}
                        className="p-2 rounded-lg bg-rose-500/10 hover:bg-rose-500 hover:text-white text-rose-400 transition-all cursor-pointer"
                        title="Delete folder"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>

                    <div className="z-10">
                      <h4 className="text-white font-bold text-sm truncate">{folder.title}</h4>
                      <p className="text-white/40 text-xs truncate mt-0.5">{folder.subtitle}</p>
                      <div className="mt-2 inline-flex items-center px-2 py-0.5 rounded bg-white/5 border border-white/10 text-[10px] text-cyan-400 font-semibold max-w-full truncate">
                        Query: {folder.query}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

    </div>
  );
}
