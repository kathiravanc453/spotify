import React, { useState, useRef } from 'react';
import ReactDOM from 'react-dom';
import { Settings, MoreVertical, Pencil, Music2, X, Share, Eye, QrCode } from 'lucide-react';
import { usePlayer } from '../context/PlayerContext';

// Portal helper
function Portal({ children }) {
  return ReactDOM.createPortal(children, document.body);
}

export default function Profile() {
  const { user, playlists, setActiveSection } = usePlayer();
  const [isEditing, setIsEditing]   = useState(false);
  const [editName, setEditName]     = useState('');
  const [editAvatar, setEditAvatar] = useState('');
  const [showMenu, setShowMenu]     = useState(false);
  const [menuPos, setMenuPos]       = useState({ top: 0, right: 0 });
  const [isPreviewing, setIsPreviewing] = useState(false);
  const [showQRCode, setShowQRCode] = useState(false);
  const dotBtnRef                   = useRef(null);
  const fileInputRef                = useRef(null);

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen text-white bg-[#121212]">
        <p className="text-white/60 mb-4">Please log in to view profile.</p>
        <button
          onClick={() => setActiveSection('login')}
          className="px-6 py-2 bg-cyan-500 rounded-full text-black font-bold"
        >
          Log In
        </button>
      </div>
    );
  }

  const handleEditClick = () => {
    setEditName(user.name || '');
    setEditAvatar(user.avatar || '');
    setIsEditing(true);
  };

  const handleSave = () => {
    if (editName.trim() === '') return;
    const updatedUser = { ...user, name: editName.trim(), avatar: editAvatar };
    localStorage.setItem('rhythmix_session', JSON.stringify(updatedUser));
    window.dispatchEvent(new Event('userUpdated'));
    setIsEditing(false);
  };

  const handlePhotoChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setEditAvatar(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDotClick = () => {
    if (dotBtnRef.current) {
      const rect = dotBtnRef.current.getBoundingClientRect();
      setMenuPos({
        top: rect.bottom + 8,
        right: window.innerWidth - rect.right,
      });
    }
    setShowMenu(v => !v);
  };

  const initial = user.name ? user.name.charAt(0).toUpperCase() : '?';
  const displayAvatar = user.avatar || null;

  return (
    <>
      {/* ── Edit Profile Full-Screen (Portal) ──────────────────────── */}
      {isEditing && (
        <Portal>
          <div className="fixed inset-0 z-[300] bg-[#121212] flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-4 border-b border-white/[0.06]">
              <button
                onClick={() => setIsEditing(false)}
                className="text-white p-1"
              >
                <X size={24} />
              </button>
              <h1 className="text-white font-bold text-lg">Edit profile</h1>
              <button
                onClick={handleSave}
                className="text-white font-bold text-base px-2 py-1"
              >
                Save
              </button>
            </div>

            {/* Avatar */}
            <div className="flex flex-col items-center mt-10 px-6">
              <div className="relative">
                <div className="w-32 h-32 rounded-full bg-[#d28b61] flex items-center justify-center shadow-2xl overflow-hidden border-2 border-transparent">
                  {editAvatar ? (
                     <img src={editAvatar} alt="Edit Avatar" className="w-full h-full object-cover" />
                  ) : (
                     <span className="text-black text-6xl font-bold">{initial}</span>
                  )}
                </div>
                <input
                  type="file"
                  accept="image/*"
                  ref={fileInputRef}
                  className="hidden"
                  onChange={handlePhotoChange}
                />
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="absolute bottom-0 right-0 w-9 h-9 bg-white rounded-lg flex items-center justify-center shadow-lg hover:bg-gray-200 transition-colors"
                >
                  <Pencil size={16} className="text-black" />
                </button>
              </div>

              {/* Name Field */}
              <div className="w-full mt-12">
                <div className="flex items-center gap-4">
                  <label className="text-white font-bold text-sm w-16 flex-shrink-0">Name</label>
                  <input
                    type="text"
                    value={editName}
                    onChange={e => setEditName(e.target.value)}
                    className="flex-1 bg-transparent text-white text-sm font-medium outline-none border-none caret-white"
                    autoFocus
                  />
                </div>
                <hr className="border-white/10 mt-3" />
              </div>
            </div>
          </div>
        </Portal>
      )}

      {/* ── 3-Dot Dropdown (Portal) ─────────────────────────────────── */}
      {showMenu && (
        <Portal>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-[200]"
            onClick={() => setShowMenu(false)}
          />
          {/* Menu */}
          <div
            className="fixed z-[201] w-56 bg-[#282828] rounded-lg shadow-2xl py-1 overflow-hidden"
            style={{ top: menuPos.top, right: menuPos.right }}
          >
            <button
              className="w-full flex items-center gap-3 px-4 py-3 text-white hover:bg-white/10 transition-colors text-sm font-medium"
              onClick={() => {
                setShowMenu(false);
                if (navigator.share) {
                  navigator.share({ title: 'Rhythmix Profile', url: window.location.href }).catch(() => {});
                } else {
                  navigator.clipboard.writeText(window.location.href);
                  alert('Profile link copied to clipboard!');
                }
              }}
            >
              <Share size={18} />
              Share
            </button>
            <button
              className="w-full flex items-center gap-3 px-4 py-3 text-white hover:bg-white/10 transition-colors text-sm font-medium"
              onClick={() => {
                setShowMenu(false);
                setIsPreviewing(true);
              }}
            >
              <Eye size={18} />
              Preview profile
            </button>
            <button
              className="w-full flex items-center gap-3 px-4 py-3 text-white hover:bg-white/10 transition-colors text-sm font-medium"
              onClick={() => {
                setShowMenu(false);
                setShowQRCode(true);
              }}
            >
              <QrCode size={18} />
              Show Rhythmix code
            </button>
          </div>
        </Portal>
      )}

      {/* ── QR Code Modal (Portal) ──────────────────────────────────── */}
      {showQRCode && (
        <Portal>
          <div className="fixed inset-0 z-[400] bg-black/80 flex items-center justify-center p-4">
            <div className="bg-[#121212] p-8 rounded-2xl flex flex-col items-center max-w-sm w-full animate-in fade-in zoom-in-95 duration-200">
              <h2 className="text-white text-xl font-bold mb-6">Rhythmix Code</h2>
              <div className="bg-white p-4 rounded-xl mb-6 shadow-xl">
                <QrCode size={180} className="text-black" />
              </div>
              <p className="text-white/60 text-center text-sm mb-8">
                Scan this code to view {user.name}'s profile on Rhythmix.
              </p>
              <button
                onClick={() => setShowQRCode(false)}
                className="w-full py-3 bg-white text-black font-bold rounded-full hover:bg-gray-200 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </Portal>
      )}

      {/* ── Main Profile View ───────────────────────────────────────── */}
      <div className="flex flex-col h-full bg-[#121212] overflow-y-auto w-full pb-8 relative">
        
        {/* Preview Mode Exit Button */}
        {isPreviewing && (
          <div className="absolute top-4 left-4 z-50">
            <button
              onClick={() => setIsPreviewing(false)}
              className="bg-black/50 text-white px-4 py-2 rounded-full text-xs font-bold backdrop-blur-md hover:bg-black/70 transition-colors border border-white/10"
            >
              Exit Preview
            </button>
          </div>
        )}

        {/* Gradient Header */}
        <div className="relative pt-8 pb-6 px-4 bg-gradient-to-b from-[#b3704b] to-[#121212]">
          <div className={`flex flex-col items-start ${isPreviewing ? 'mt-10' : 'mt-2'}`}>

            {/* Avatar + Name */}
            <div className="flex items-center gap-5">
              <div className="w-24 h-24 rounded-full bg-[#d28b61] flex items-center justify-center shadow-2xl flex-shrink-0 overflow-hidden">
                {displayAvatar ? (
                   <img src={displayAvatar} alt={user.name} className="w-full h-full object-cover" />
                ) : (
                   <span className="text-black text-5xl font-bold">{initial}</span>
                )}
              </div>
              <div className="flex flex-col">
                <h1 className="text-white text-3xl font-bold tracking-tight">{user.name}</h1>
                <p className="text-white/60 text-[11px] font-semibold mt-1">0 followers • 0 following</p>
              </div>
            </div>

            {/* Action Row */}
            {!isPreviewing && (
              <div className="flex items-center gap-4 mt-6 w-full">
                <button
                  onClick={handleEditClick}
                  className="px-5 py-1.5 rounded-full border border-white/40 text-white font-bold text-xs hover:border-white transition"
                >
                  Edit
                </button>
                <button className="text-white/70 hover:text-white transition p-1 ml-auto">
                  <Settings size={20} />
                </button>
                <button
                  ref={dotBtnRef}
                  onClick={handleDotClick}
                  className="text-white/70 hover:text-white transition p-1"
                >
                  <MoreVertical size={20} />
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Playlists Section */}
        <div className="px-4 py-2 mt-2">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-white text-lg font-bold">Playlists</h2>
            {!isPreviewing && (
              <button className="flex items-center gap-1.5 text-white/60 hover:text-white transition text-xs font-bold">
                <Pencil size={13} />
                Manage
              </button>
            )}
          </div>

          <div className="flex flex-col gap-1">
            {playlists && playlists.length > 0 ? (
              playlists.map(pl => (
                <div
                  key={pl.id}
                  className="flex items-center gap-3 cursor-pointer group hover:bg-white/[0.05] px-2 py-2 rounded-lg transition-colors"
                  onClick={() => setActiveSection(`playlist_${pl.id}`)}
                >
                  <div className="w-12 h-12 bg-white/5 rounded-md overflow-hidden border border-white/5 flex items-center justify-center flex-shrink-0">
                    <Music2 size={18} className="text-white/30" />
                  </div>
                  <div className="flex flex-col flex-1 min-w-0">
                    <span className="text-white text-sm font-medium truncate group-hover:text-cyan-400 transition">{pl.name}</span>
                    <span className="text-white/50 text-xs">{pl.songs?.length || 0} songs</span>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-white/40 text-sm py-4 text-center">No playlists yet.</div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
