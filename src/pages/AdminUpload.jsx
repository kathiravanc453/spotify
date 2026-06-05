import { useState, useCallback, useEffect } from 'react';
import { usePlayer } from '../context/PlayerContext';
import { Upload, Music, Image, CheckCircle, AlertCircle, X, Plus, Loader2, TrendingUp, Star, Download, LogOut, ShieldAlert } from 'lucide-react';

const CLOUDINARY_URL = 'https://api.cloudinary.com/v1_1/dm1cwbbfg/auto/upload';
const CLOUDINARY_PRESET = 'j4mjnnll';
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

  // ── Email Auth gate — reads from main rhythmix_session ──────────────────
  const adminSession = (() => {
    try { return JSON.parse(localStorage.getItem('rhythmix_session') || 'null'); } catch { return null; }
  })();

  const handleAdminLogout = () => {
    localStorage.removeItem('rhythmix_session');
    window.location.reload();
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

  const [audioFile, setAudioFile] = useState(null);
  const [coverFile, setCoverFile] = useState(null);
  const [form, setForm] = useState({
    title: '', artist: '', album: '', genre: 'Tamil',
    trending: false, recommended: false, coverUrl: ''
  });
  const [status, setStatus] = useState('idle'); // idle, uploading, syncing, success, error
  const [errorMsg, setErrorMsg] = useState('');

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

  const uploadToCloudinary = async (file, type, contextString = '') => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', CLOUDINARY_PRESET);
    formData.append('resource_type', type === 'audio' ? 'video' : 'image');
    if (contextString) {
      formData.append('context', contextString);
    }

    const res = await fetch(CLOUDINARY_URL, {
      method: 'POST',
      body: formData
    });
    
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error?.message || 'Cloudinary upload failed');
    }
    
    const data = await res.json();
    return data.secure_url;
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
      // 1. Upload Cover to Cloudinary (if exists), else use URL, else use generic music fallback
      let finalCoverUrl = form.coverUrl || 'https://images.unsplash.com/photo-1493225457124-a1a2a5d5facf?w=500';
      if (coverFile) {
        finalCoverUrl = await uploadToCloudinary(coverFile, 'image');
      }

      // 2. Upload Audio to Cloudinary WITH metadata context attached so it remembers the cover!
      const contextString = `cover=${finalCoverUrl}|artist=${form.artist}|title=${form.title}|album=${form.album}`;
      const audioUrl = await uploadToCloudinary(audioFile, 'audio', contextString);

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
        <button
          onClick={handleAdminLogout}
          className="flex items-center gap-2 bg-white/5 hover:bg-rose-500/10 border border-white/10 hover:border-rose-500/30 text-white/50 hover:text-rose-400 text-xs font-bold px-4 py-2.5 rounded-xl transition-all duration-300 cursor-pointer flex-shrink-0"
        >
          <LogOut size={14} /> Logout
        </button>
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
            {status === 'uploading' && <><Loader2 className="animate-spin" /> Uploading to Cloudinary...</>}
            {status === 'syncing' && <><Loader2 className="animate-spin" /> Updating songs.json...</>}
            {status === 'success' && <><CheckCircle /> Song Published!</>}
            {status === 'error' && <><AlertCircle /> Failed: {errorMsg}</>}
            {(status === 'idle') && <><Upload size={20} /> Upload Song</>}
          </button>
        </form>
      </div>
    </div>
  );
}
