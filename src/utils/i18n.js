import { usePlayer } from '../context/PlayerContext';

const translations = {
  en: {
    home: "Home",
    search: "Search",
    albums: "Albums",
    favorites: "Favorites",
    favs: "Favs",
    nowPlaying: "Now Playing",
    now: "Now",
    settings: "Settings",
    library: "Library",
    languageOptions: "Language Options",
    contentDisplay: "Content & Display",
    reduceAnimation: "Reduce Animation",
    appLanguage: "App Language",
    signIn: "Sign In",
    adminPanel: "Admin Panel",
    yourPlaylists: "Your Playlists",
    enterPlaylistName: "Enter playlist name:",
    createPlaylist: "Create Playlist",
    viewProfile: "View profile",
    loginToViewProfile: "Log in to view profile",
    addAccount: "Add account",
    recents: "Recents",
    yourUpdates: "Your updates",
    settingsAndPrivacy: "Settings and privacy",
    logOut: "Log out"
  },
  ta: {
    home: "முகப்பு",
    search: "தேடல்",
    albums: "ஆல்பங்கள்",
    favorites: "விருப்பங்கள்",
    favs: "விருப்பம்",
    nowPlaying: "தற்போது ஒலிக்கிறது",
    now: "தற்போது",
    settings: "அமைப்புகள்",
    library: "நூலகம்",
    languageOptions: "மொழி தேர்வுகள்",
    contentDisplay: "உள்ளடக்கம் & காட்சி",
    reduceAnimation: "அசைவுகளை குறை",
    appLanguage: "செயலி மொழி",
    signIn: "உள்நுழைக",
    adminPanel: "நிர்வாக குழு",
    yourPlaylists: "உங்கள் பிளேலிஸ்ட்கள்",
    enterPlaylistName: "பிளேலிஸ்ட் பெயரை உள்ளிடுக:",
    createPlaylist: "பிளேலிஸ்ட்டை உருவாக்கு",
    viewProfile: "சுயவிவரத்தைக் காண்க",
    loginToViewProfile: "சுயவிவரத்தைக் காண உள்நுழைக",
    addAccount: "கணக்கைச் சேர்",
    recents: "சமீபத்தியவை",
    yourUpdates: "உங்கள் புதுப்பிப்புகள்",
    settingsAndPrivacy: "அமைப்புகள் மற்றும் தனியுரிமை",
    logOut: "வெளியேறு"
  },
  hi: {
    home: "मुख्य पृष्ठ",
    search: "खोजें",
    albums: "एल्बम",
    favorites: "पसंदीदा",
    favs: "पसंदीदा",
    nowPlaying: "अभी बज रहा है",
    now: "अभी",
    settings: "सेटिंग्स",
    library: "लाइब्रेरी",
    languageOptions: "भाषा विकल्प",
    contentDisplay: "सामग्री और प्रदर्शन",
    reduceAnimation: "एनिमेशन कम करें",
    appLanguage: "ऐप की भाषा",
    signIn: "साइन इन करें",
    adminPanel: "एडमिन पैनल",
    yourPlaylists: "आपकी प्लेलिस्ट",
    enterPlaylistName: "प्लेलिस्ट का नाम दर्ज करें:",
    createPlaylist: "प्लेलिस्ट बनाएं",
    viewProfile: "प्रोफ़ाइल देखें",
    loginToViewProfile: "प्रोफ़ाइल देखने के लिए लॉग इन करें",
    addAccount: "खाता जोड़ें",
    recents: "हाल ही के",
    yourUpdates: "आपके अपडेट",
    settingsAndPrivacy: "सेटिंग्स और गोपनीयता",
    logOut: "लॉग आउट"
  },
  es: {
    home: "Inicio",
    search: "Buscar",
    albums: "Álbumes",
    favorites: "Favoritos",
    favs: "Favs",
    nowPlaying: "Reproduciendo",
    now: "Ahora",
    settings: "Ajustes",
    library: "Biblioteca",
    languageOptions: "Opciones de idioma",
    contentDisplay: "Contenido y pantalla",
    reduceAnimation: "Reducir animaciones",
    appLanguage: "Idioma de la app",
    signIn: "Iniciar sesión",
    adminPanel: "Panel de administración",
    yourPlaylists: "Tus listas de reproducción",
    enterPlaylistName: "Introduce el nombre de la lista:",
    createPlaylist: "Crear lista",
    viewProfile: "Ver perfil",
    loginToViewProfile: "Inicia sesión para ver el perfil",
    addAccount: "Añadir cuenta",
    recents: "Recientes",
    yourUpdates: "Tus actualizaciones",
    settingsAndPrivacy: "Configuración y privacidad",
    logOut: "Cerrar sesión"
  }
};

export const SUPPORTED_UI_LANGUAGES = [
  { code: 'en', name: 'English' },
  { code: 'ta', name: 'Tamil' },
  { code: 'hi', name: 'Hindi' },
  { code: 'es', name: 'Spanish' }
];

export function useTranslation() {
  const context = usePlayer();
  const appLanguage = context?.appLanguage || 'en';
  
  const t = (key) => {
    const langDict = translations[appLanguage] || translations['en'];
    return langDict[key] || translations['en'][key] || key;
  };
  
  return { t, appLanguage };
}
