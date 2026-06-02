import { useState, useCallback, useEffect } from 'react';
import { usePlayer } from '../context/PlayerContext';
import { Upload, Music, Image, CheckCircle, AlertCircle, X, Plus, Loader2, TrendingUp, Star, Download } from 'lucide-react';

const CLOUDINARY_URL = 'https://api.cloudinary.com/v1_1/cloudinary/auto/upload';
const CLOUDINARY_PRESET = 'j4mjnnll';
const API_BASE = '/api'; // Handled by Vite proxy

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
    trending: false, recommended: false
  });
  const [status, setStatus] = useState('idle'); // idle, uploading, syncing, success, error
  const [errorMsg, setErrorMsg] = useState('');
  const [stats, setStats] = useState({ downloads: 0 });

  useEffect(() => {
    fetch('http://localhost:3001/api/stats')
      .then(res => res.json())
      .then(data => setStats(data))
      .catch(err => console.error('Failed to load stats:', err));
  }, []);

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

  const uploadToCloudinary = async (file, type) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', CLOUDINARY_PRESET);
    formData.append('resource_type', type === 'audio' ? 'video' : 'image');

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
      // 1. Upload Audio to Cloudinary
      const audioUrl = await uploadToCloudinary(audioFile, 'audio');
      
      // 2. Upload Cover to Cloudinary (if exists)
      let coverUrl = '/favicon.svg';
      if (coverFile) {
        coverUrl = await uploadToCloudinary(coverFile, 'image');
      }

      // 3. Sync metadata to local songs.json via our backend
      setStatus('syncing');
      const syncRes = await fetch(`${API_BASE}/songs`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          src: audioUrl,
          cover: coverUrl,
          duration: 0 // Cloudinary can provide this but 0 is safe for now
        })
      });

      if (!syncRes.ok) throw new Error('Failed to update songs.json');

      setStatus('success');
      setAudioFile(null);
      setCoverFile(null);
      setForm({ title: '', artist: '', album: '', genre: 'Tamil', trending: false, recommended: false });
      
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
      <div>
        <h1 className="text-white text-3xl font-bold mb-2">Admin Dashboard</h1>
        <p className="text-white/50 text-sm">Upload songs directly to your cloud and view app statistics.</p>
      </div>

      <div className="bg-gradient-to-br from-cyan-900/40 to-violet-900/40 border border-cyan-500/20 rounded-3xl p-6 shadow-lg shadow-cyan-500/10 flex items-center justify-between">
        <div>
          <h2 className="text-white/60 text-sm font-semibold uppercase tracking-wider mb-1">Total App Downloads</h2>
          <p className="text-white text-4xl font-black">{stats.downloads}</p>
        </div>
        <div className="w-16 h-16 rounded-2xl bg-cyan-500/20 flex items-center justify-center">
          <Download size={32} className="text-cyan-400" />
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
