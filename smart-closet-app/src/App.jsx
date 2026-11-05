import React, { useState, useEffect, useRef } from 'react';
import { 
  Shirt, 
  Sparkles, 
  WashingMachine, 
  Plus, 
  Upload, 
  Check, 
  RefreshCw, 
  MapPin, 
  Droplets, 
  Thermometer,
  Trash2,
  SlidersHorizontal,
  Camera,
  X,
  LogOut,
  User,
  Lock,
  SwitchCamera,
  Image as ImageIcon
} from 'lucide-react';

// Datos iniciales de ejemplo para nuevos usuarios (opcional)
const INITIAL_GARMENTS = [
  {
    id: '1',
    name: 'Blazer Entallada Negra',
    category: 'Outerwear',
    occasion: ['Work', 'Going Out'],
    warmth: 3,
    comfort: 3,
    color: 'Negro',
    inLaundry: false,
    image: 'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=400&auto=format&fit=crop&q=80'
  },
  {
    id: '2',
    name: 'Camiseta Algodón Blanca',
    category: 'Top',
    occasion: ['Work', 'Going Out', 'Sport'],
    warmth: 1,
    comfort: 5,
    color: 'Blanco',
    inLaundry: false,
    image: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=400&auto=format&fit=crop&q=80'
  },
  {
    id: '3',
    name: 'Pantalón Chino Beige',
    category: 'Bottom',
    occasion: ['Work', 'Going Out'],
    warmth: 2,
    comfort: 4,
    color: 'Beige',
    inLaundry: false,
    image: 'https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?w=400&auto=format&fit=crop&q=80'
  },
  {
    id: '4',
    name: 'Zapatillas Blancas Cuero',
    category: 'Footwear',
    occasion: ['Work', 'Going Out', 'Sport'],
    warmth: 2,
    comfort: 5,
    color: 'Blanco',
    inLaundry: false,
    image: 'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=400&auto=format&fit=crop&q=80'
  },
  {
    id: '5',
    name: 'Chubasquero Técnico Azul',
    category: 'Outerwear',
    occasion: ['Work', 'Going Out', 'Sport'],
    warmth: 4,
    comfort: 4,
    color: 'Azul Marino',
    inLaundry: false,
    image: 'https://images.unsplash.com/photo-1544441893-675973e31985?w=400&auto=format&fit=crop&q=80'
  }
];

const CATEGORY_LABELS = {
  Top: 'Parte Superior',
  Bottom: 'Parte Inferior',
  Footwear: 'Calzado',
  Outerwear: 'Abrigo / Exterior'
};

const OCCASION_LABELS = {
  Work: 'Trabajo',
  'Going Out': 'Salir',
  Sport: 'Deporte'
};

export default function App() {
  // --- Estado de Autenticación y Usuarios ---
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const saved = localStorage.getItem('smart_closet_current_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });
  const [authMode, setAuthMode] = useState('login'); // 'login' | 'register'
  const [authUsername, setAuthUsername] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [authName, setAuthName] = useState('');
  const [includeSampleCloset, setIncludeSampleCloset] = useState(true);
  const [authError, setAuthError] = useState('');

  // --- Navegación y Armario del Usuario ---
  const [activeTab, setActiveTab] = useState('generator');
  const [garments, setGarments] = useState([]);

  // Cargar el armario específico del usuario cuando inicia sesión
  useEffect(() => {
    if (!currentUser) {
      setGarments([]);
      return;
    }
    const key = `smart_closet_garments_${currentUser.username}`;
    try {
      const savedGarments = localStorage.getItem(key);
      if (savedGarments) {
        setGarments(JSON.parse(savedGarments));
      } else {
        setGarments(INITIAL_GARMENTS);
        localStorage.setItem(key, JSON.stringify(INITIAL_GARMENTS));
      }
    } catch (e) {
      console.error('Error al cargar armario:', e);
      setGarments(INITIAL_GARMENTS);
    }
  }, [currentUser]);

  // Guardar cambios en el armario del usuario actual
  const updateUserGarments = (newGarmentsList) => {
    setGarments(newGarmentsList);
    if (currentUser) {
      try {
        localStorage.setItem(
          `smart_closet_garments_${currentUser.username}`,
          JSON.stringify(newGarmentsList)
        );
      } catch (e) {
        console.error('Error al guardar en localStorage:', e);
        alert('Espacio de almacenamiento local lleno. Intenta eliminar alguna prenda antigua.');
      }
    }
  };

  // --- Clima y Geolocalización ---
  const [locationName, setLocationName] = useState('A Coruña');
  const [temp, setTemp] = useState(16);
  const [isRaining, setIsRaining] = useState(false);
  const [loadingWeather, setLoadingWeather] = useState(false);

  // --- Parámetros de Generación ---
  const [selectedOccasion, setSelectedOccasion] = useState('Work');
  const [desiredWarmth, setDesiredWarmth] = useState(3);
  const [desiredComfort, setDesiredComfort] = useState(4);
  const [currentOutfit, setCurrentOutfit] = useState(null);
  const [aiNote, setAiNote] = useState('');
  const [generating, setGenerating] = useState(false);

  // --- Modal y Cámara para Añadir Prenda ---
  const [showAddModal, setShowAddModal] = useState(false);
  const [cameraActive, setCameraActive] = useState(false);
  const [facingMode, setFacingMode] = useState('environment');
  const [cameraError, setCameraError] = useState('');
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const fileInputRef = useRef(null);
  const nativeCameraInputRef = useRef(null);

  const [newGarment, setNewGarment] = useState({
    name: '',
    category: 'Top',
    occasion: ['Work'],
    warmth: 3,
    comfort: 4,
    color: '',
    image: ''
  });

  // Cargar Clima mediante Open-Meteo API (A Coruña por defecto)
  const fetchWeather = async (lat = 43.3623, lon = -8.4115, name = 'A Coruña') => {
    setLoadingWeather(true);
    try {
      const res = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true`);
      const data = await res.json();
      if (data.current_weather) {
        setTemp(Math.round(data.current_weather.temperature));
        setIsRaining([51, 53, 55, 61, 63, 65, 80, 81, 82].includes(data.current_weather.weathercode));
        setLocationName(name);
        
        const t = data.current_weather.temperature;
        if (t < 10) setDesiredWarmth(5);
        else if (t < 15) setDesiredWarmth(4);
        else if (t < 20) setDesiredWarmth(3);
        else if (t < 25) setDesiredWarmth(2);
        else setDesiredWarmth(1);
      }
    } catch (e) {
      console.error("Error al obtener clima:", e);
    } finally {
      setLoadingWeather(false);
    }
  };

  useEffect(() => {
    fetchWeather();
  }, []);

  // Limpiar stream de cámara al cerrar modal o desmontar
  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  // --- Funciones de Autenticación ---
  const getUsers = () => {
    try {
      const raw = localStorage.getItem('smart_closet_users');
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  };

  const handleAuthSubmit = (e) => {
    e.preventDefault();
    setAuthError('');
    const usernameClean = authUsername.trim().toLowerCase();

    if (!usernameClean || !authPassword.trim()) {
      setAuthError('Por favor, introduce tu usuario y contraseña.');
      return;
    }

    const users = getUsers();

    if (authMode === 'register') {
      if (users.some(u => u.username === usernameClean)) {
        setAuthError('Ese nombre de usuario ya está registrado.');
        return;
      }
      const newUser = {
        username: usernameClean,
        name: authName.trim() || usernameClean,
        password: authPassword
      };
      const updatedUsers = [...users, newUser];
      localStorage.setItem('smart_closet_users', JSON.stringify(updatedUsers));
      
      // Inicializar su armario propio
      const initialCloset = includeSampleCloset ? INITIAL_GARMENTS : [];
      localStorage.setItem(`smart_closet_garments_${usernameClean}`, JSON.stringify(initialCloset));
      
      const sessionUser = { username: newUser.username, name: newUser.name };
      localStorage.setItem('smart_closet_current_user', JSON.stringify(sessionUser));
      setCurrentUser(sessionUser);
      setCurrentOutfit(null);
      setAuthPassword('');
    } else {
      const found = users.find(u => u.username === usernameClean && u.password === authPassword);
      if (!found) {
        setAuthError('Usuario o contraseña incorrectos. Si no tienes cuenta, regístrate.');
        return;
      }
      const sessionUser = { username: found.username, name: found.name };
      localStorage.setItem('smart_closet_current_user', JSON.stringify(sessionUser));
      setCurrentUser(sessionUser);
      setCurrentOutfit(null);
      setAuthPassword('');
    }
  };

  const handleLogout = () => {
    stopCamera();
    localStorage.removeItem('smart_closet_current_user');
    setCurrentUser(null);
    setCurrentOutfit(null);
    setAuthUsername('');
    setAuthPassword('');
    setAuthError('');
  };

  // --- Funciones de Cámara y Fotografía ---
  const startCamera = async (mode = facingMode) => {
    setCameraError('');
    stopCamera();

    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setCameraError('Tu navegador no permite acceso directo a la cámara en vivo. Usa el botón "Abrir Cámara / Foto" inferior.');
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: mode, width: { ideal: 720 }, height: { ideal: 720 } },
        audio: false
      });
      streamRef.current = stream;
      setCameraActive(true);
      setTimeout(() => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.play().catch(() => {});
        }
      }, 50);
    } catch (err) {
      console.error('Error al acceder a la cámara:', err);
      setCameraError('No se pudo acceder a la cámara en vivo (verifica los permisos o usa el botón de cámara nativa / galería).');
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setCameraActive(false);
  };

  const toggleCameraFacing = () => {
    const nextMode = facingMode === 'environment' ? 'user' : 'environment';
    setFacingMode(nextMode);
    if (cameraActive) {
      startCamera(nextMode);
    }
  };

  const capturePhotoFromVideo = () => {
    if (!videoRef.current) return;
    const video = videoRef.current;
    const canvas = document.createElement('canvas');
    const maxDim = 600;
    let width = video.videoWidth || 600;
    let height = video.videoHeight || 600;

    if (width > height && width > maxDim) {
      height = Math.round((height * maxDim) / width);
      width = maxDim;
    } else if (height > maxDim) {
      width = Math.round((width * maxDim) / height);
      height = maxDim;
    }

    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(video, 0, 0, width, height);
    const dataUrl = canvas.toDataURL('image/jpeg', 0.8);
    setNewGarment(prev => ({ ...prev, image: dataUrl }));
    stopCamera();
  };

  // Procesar y comprimir imagen desde cámara móvil nativa o galería
  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const maxDim = 600;
        let width = img.width;
        let height = img.height;

        if (width > height && width > maxDim) {
          height = Math.round((height * maxDim) / width);
          width = maxDim;
        } else if (height > maxDim) {
          width = Math.round((width * maxDim) / height);
          height = maxDim;
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);
        const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.8);
        setNewGarment(prev => ({ ...prev, image: compressedDataUrl }));
        stopCamera();
      };
      img.src = event.target.result;
    };
    reader.readAsDataURL(file);
  };

  const toggleNewGarmentOccasion = (occ) => {
    setNewGarment(prev => {
      const exists = prev.occasion.includes(occ);
      if (exists && prev.occasion.length === 1) return prev; // Al menos 1 ocasión
      return {
        ...prev,
        occasion: exists ? prev.occasion.filter(o => o !== occ) : [...prev.occasion, occ]
      };
    });
  };

  const handleSaveGarment = (e) => {
    e.preventDefault();
    if (!newGarment.name.trim()) {
      alert('Por favor, ponle un nombre a la prenda.');
      return;
    }
    if (!newGarment.image) {
      alert('Por favor, haz una foto con la cámara o selecciona una imagen de tu prenda.');
      return;
    }

    const created = {
      id: Date.now().toString(),
      name: newGarment.name.trim(),
      category: newGarment.category,
      occasion: newGarment.occasion,
      warmth: Number(newGarment.warmth),
      comfort: Number(newGarment.comfort),
      color: newGarment.color.trim() || 'Multicolor',
      inLaundry: false,
      image: newGarment.image
    };

    updateUserGarments([created, ...garments]);
    stopCamera();
    setShowAddModal(false);
    setNewGarment({
      name: '',
      category: 'Top',
      occasion: ['Work'],
      warmth: 3,
      comfort: 4,
      color: '',
      image: ''
    });
  };

  const deleteGarment = (id) => {
    updateUserGarments(garments.filter(g => g.id !== id));
    if (currentOutfit && currentOutfit.some(g => g.id === id)) {
      setCurrentOutfit(null);
    }
  };

  // --- Generador Inteligente de Outfits ---
  const generateOutfit = () => {
    setGenerating(true);

    setTimeout(() => {
      const available = garments.filter(g => !g.inLaundry && g.occasion.includes(selectedOccasion));

      const tops = available.filter(g => g.category === 'Top');
      const bottoms = available.filter(g => g.category === 'Bottom');
      const footwears = available.filter(g => g.category === 'Footwear');
      const outerwears = available.filter(g => g.category === 'Outerwear');

      if (tops.length === 0 || bottoms.length === 0 || footwears.length === 0) {
        alert("Necesitas al menos 1 Parte Superior, 1 Parte Inferior y 1 Calzado limpios para la ocasión seleccionada.");
        setGenerating(false);
        return;
      }

      const selectedTop = tops[Math.floor(Math.random() * tops.length)];
      const selectedBottom = bottoms[Math.floor(Math.random() * bottoms.length)];
      const selectedFootwear = footwears[Math.floor(Math.random() * footwears.length)];
      
      let selectedOuterwear = null;
      if (desiredWarmth >= 3 || isRaining) {
        if (outerwears.length > 0) {
          selectedOuterwear = outerwears[Math.floor(Math.random() * outerwears.length)];
        }
      }

      const outfit = [selectedTop, selectedBottom, selectedFootwear];
      if (selectedOuterwear) outfit.push(selectedOuterwear);

      setCurrentOutfit(outfit);
      setAiNote(`Combinación de ${selectedTop.color} con ${selectedBottom.color}. Selección ${isRaining ? 'resistente a la lluvia' : 'equilibrada'} con nivel de abrigo ${desiredWarmth}/5 y alta comodidad.`);
      setGenerating(false);
    }, 400);
  };

  const toggleLaundry = (id) => {
    updateUserGarments(garments.map(g => g.id === id ? { ...g, inLaundry: !g.inLaundry } : g));
  };

  const markOutfitAsWorn = () => {
    if (!currentOutfit) return;
    const outfitIds = currentOutfit.map(g => g.id);
    updateUserGarments(garments.map(g => outfitIds.includes(g.id) ? { ...g, inLaundry: true } : g));
    setCurrentOutfit(null);
    alert("¡Outfit marcado como usado! Las prendas se han enviado a la colada.");
  };

  // --- Pantalla de Login / Registro si no hay usuario activo ---
  if (!currentUser) {
    return (
      <div className="max-w-md mx-auto min-h-screen bg-slate-900 text-slate-100 flex flex-col justify-center p-6 font-sans border-x border-slate-800 shadow-2xl">
        <div className="bg-slate-800/70 border border-slate-700/70 rounded-2xl p-6 space-y-6 shadow-xl">
          <div className="text-center space-y-2">
            <div className="w-12 h-12 rounded-2xl bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center mx-auto">
              <Sparkles className="w-6 h-6 text-indigo-400" />
            </div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-indigo-400 to-pink-400 bg-clip-text text-transparent">
              Smart Closet
            </h1>
            <p className="text-xs text-slate-400">
              Inicia sesión para gestionar tu armario personal y fotografiar tus prendas
            </p>
          </div>

          {/* Selector Login / Registro */}
          <div className="grid grid-cols-2 gap-2 bg-slate-900/70 p-1 rounded-xl border border-slate-700/60">
            <button
              type="button"
              onClick={() => { setAuthMode('login'); setAuthError(''); }}
              className={`py-2 text-xs font-semibold rounded-lg transition-all ${
                authMode === 'login'
                  ? 'bg-indigo-600 text-white shadow'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Iniciar Sesión
            </button>
            <button
              type="button"
              onClick={() => { setAuthMode('register'); setAuthError(''); }}
              className={`py-2 text-xs font-semibold rounded-lg transition-all ${
                authMode === 'register'
                  ? 'bg-indigo-600 text-white shadow'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Crear Cuenta
            </button>
          </div>

          <form onSubmit={handleAuthSubmit} className="space-y-4">
            {authMode === 'register' && (
              <div className="space-y-1">
                <label className="text-xs text-slate-300 font-medium">Tu Nombre</label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    placeholder="Ej. María"
                    value={authName}
                    onChange={(e) => setAuthName(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl pl-9 pr-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>
            )}

            <div className="space-y-1">
              <label className="text-xs text-slate-300 font-medium">Usuario</label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder="nombre_usuario"
                  value={authUsername}
                  onChange={(e) => setAuthUsername(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl pl-9 pr-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-indigo-500"
                  required
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs text-slate-300 font-medium">Contraseña</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
                <input
                  type="password"
                  placeholder="••••••••"
                  value={authPassword}
                  onChange={(e) => setAuthPassword(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl pl-9 pr-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-indigo-500"
                  required
                />
              </div>
            </div>

            {authMode === 'register' && (
              <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer pt-1">
                <input
                  type="checkbox"
                  checked={includeSampleCloset}
                  onChange={(e) => setIncludeSampleCloset(e.target.checked)}
                  className="rounded accent-indigo-500"
                />
                Incluir prendas de ejemplo iniciales en mi armario
              </label>
            )}

            {authError && (
              <p className="text-xs text-rose-400 bg-rose-950/40 border border-rose-800/50 p-2.5 rounded-xl">
                {authError}
              </p>
            )}

            <button
              type="submit"
              className="w-full py-3 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 font-semibold rounded-xl text-sm text-white shadow-lg shadow-indigo-500/25 transition-all"
            >
              {authMode === 'login' ? 'Entrar a mi Armario' : 'Registrarme y Crear Armario'}
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto min-h-screen bg-slate-900 text-slate-100 flex flex-col pb-20 font-sans border-x border-slate-800 shadow-2xl">
      {/* Header */}
      <header className="p-4 border-b border-slate-800 bg-slate-900/80 backdrop-blur sticky top-0 z-10 space-y-2">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-indigo-400" />
            <h1 className="text-xl font-bold bg-gradient-to-r from-indigo-400 to-pink-400 bg-clip-text text-transparent">
              Smart Closet
            </h1>
          </div>
          <div className="flex items-center gap-2 text-xs bg-slate-800 px-3 py-1.5 rounded-full border border-slate-700">
            <MapPin className="w-3.5 h-3.5 text-indigo-400" />
            <span>{locationName}</span>
            <span className="text-slate-500">|</span>
            <Thermometer className="w-3.5 h-3.5 text-amber-400" />
            <span>{temp}°C</span>
            {isRaining && <Droplets className="w-3.5 h-3.5 text-blue-400" />}
          </div>
        </div>

        {/* Barra de Usuario Activo */}
        <div className="flex justify-between items-center pt-1 text-xs text-slate-400">
          <div className="flex items-center gap-1.5">
            <User className="w-3.5 h-3.5 text-indigo-400" />
            <span>Armario de <strong className="text-slate-200">{currentUser.name}</strong></span>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-1 text-[11px] text-slate-400 hover:text-rose-400 bg-slate-800/80 px-2.5 py-1 rounded-lg border border-slate-700 transition-colors"
          >
            <LogOut className="w-3 h-3" /> Cerrar sesión
          </button>
        </div>
      </header>

      {/* Vista: Generador */}
      {activeTab === 'generator' && (
        <main className="p-4 flex-1 space-y-6">
          {/* Controles de filtro */}
          <section className="bg-slate-800/50 p-4 rounded-2xl border border-slate-700/50 space-y-4">
            <h2 className="text-sm font-semibold text-slate-400 flex items-center gap-2">
              <SlidersHorizontal className="w-4 h-4" /> ¿Qué necesitas hoy?
            </h2>
            
            {/* Ocasión */}
            <div className="grid grid-cols-3 gap-2">
              {['Work', 'Going Out', 'Sport'].map((occ) => (
                <button
                  key={occ}
                  onClick={() => setSelectedOccasion(occ)}
                  className={`py-2 text-xs rounded-xl font-medium transition-all ${
                    selectedOccasion === occ 
                      ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/30' 
                      : 'bg-slate-800 text-slate-400 border border-slate-700 hover:bg-slate-700'
                  }`}
                >
                  {OCCASION_LABELS[occ]}
                </button>
              ))}
            </div>

            {/* Abrigo slider */}
            <div className="space-y-1">
              <div className="flex justify-between text-xs text-slate-300">
                <span>Nivel de Abrigo</span>
                <span className="font-bold text-indigo-400">{desiredWarmth} / 5</span>
              </div>
              <input 
                type="range" min="1" max="5" value={desiredWarmth} 
                onChange={(e) => setDesiredWarmth(Number(e.target.value))}
                className="w-full accent-indigo-500 h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer"
              />
            </div>

            <button
              onClick={generateOutfit}
              disabled={generating}
              className="w-full py-3 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 font-semibold rounded-xl text-sm flex justify-center items-center gap-2 shadow-lg shadow-indigo-500/25 transition-all"
            >
              {generating ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
              {generating ? 'Diseñando Outfit...' : 'Generar Outfit con IA'}
            </button>
          </section>

          {/* Resultado del Outfit */}
          {currentOutfit ? (
            <section className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-base font-bold text-slate-200">Tu Look Sugerido</h3>
                <span className="text-xs bg-indigo-500/10 text-indigo-400 px-2.5 py-1 rounded-full border border-indigo-500/20">Recomendado</span>
              </div>

              <div className="grid grid-cols-2 gap-3">
                {currentOutfit.map((item) => (
                  <div key={item.id} className="bg-slate-800 rounded-xl overflow-hidden border border-slate-700/60 relative group">
                    <img src={item.image} alt={item.name} className="w-full h-32 object-cover" />
                    <div className="p-2.5">
                      <p className="text-xs font-semibold text-slate-200 truncate">{item.name}</p>
                      <p className="text-[10px] text-slate-400 capitalize">{CATEGORY_LABELS[item.category] || item.category} • {item.color}</p>
                    </div>
                  </div>
                ))}
              </div>

              {aiNote && (
                <div className="p-3 bg-indigo-950/40 border border-indigo-800/50 rounded-xl text-xs text-indigo-200 space-y-1">
                  <p className="font-semibold flex items-center gap-1.5 text-indigo-400">
                    <Sparkles className="w-3.5 h-3.5" /> Nota del Estilista:
                  </p>
                  <p>{aiNote}</p>
                </div>
              )}

              <button
                onClick={markOutfitAsWorn}
                className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-xl text-xs font-medium text-slate-300 flex items-center justify-center gap-2 transition-all"
              >
                <WashingMachine className="w-4 h-4 text-pink-400" /> Usar hoy y enviar prendas a la colada
              </button>
            </section>
          ) : (
            <div className="text-center py-12 text-slate-500 space-y-2">
              <Shirt className="w-12 h-12 mx-auto stroke-1 text-slate-600" />
              <p className="text-xs">Pulsa el botón superior para crear tu combinación del día.</p>
            </div>
          )}
        </main>
      )}

      {/* Vista: Armario */}
      {activeTab === 'closet' && (
        <main className="p-4 flex-1 space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-base font-bold text-slate-200">Mi Armario ({garments.length})</h2>
            <button
              onClick={() => setShowAddModal(true)}
              className="flex items-center gap-1.5 px-3 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold shadow-lg shadow-indigo-500/25 transition-all"
            >
              <Camera className="w-4 h-4" /> Añadir con Cámara
            </button>
          </div>

          {garments.length === 0 ? (
            <div className="text-center py-12 bg-slate-800/40 rounded-2xl border border-slate-800 p-6 space-y-3">
              <Camera className="w-10 h-10 mx-auto text-indigo-400 stroke-1" />
              <p className="text-xs text-slate-400">Tu armario está vacío. ¡Añade tu primera prenda haciendo una foto!</p>
              <button
                onClick={() => setShowAddModal(true)}
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold"
              >
                <Plus className="w-4 h-4" /> Fotografiar Prenda
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              {garments.map((g) => (
                <div key={g.id} className={`bg-slate-800 rounded-xl overflow-hidden border ${g.inLaundry ? 'border-amber-500/40 opacity-60' : 'border-slate-700'} relative`}>
                  <button
                    onClick={() => deleteGarment(g.id)}
                    title="Eliminar prenda"
                    className="absolute top-2 right-2 p-1.5 bg-slate-900/80 hover:bg-rose-600 text-slate-300 hover:text-white rounded-lg transition-colors z-10"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                  <img src={g.image} alt={g.name} className="w-full h-32 object-cover" />
                  <div className="p-2.5 space-y-2">
                    <div>
                      <p className="text-xs font-semibold text-slate-200 truncate">{g.name}</p>
                      <p className="text-[10px] text-slate-400">{CATEGORY_LABELS[g.category] || g.category} • Abrigo: {g.warmth}/5</p>
                    </div>

                    <button
                      onClick={() => toggleLaundry(g.id)}
                      className={`w-full py-1 text-[11px] rounded-lg font-medium transition-all flex items-center justify-center gap-1 ${
                        g.inLaundry 
                          ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' 
                          : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                      }`}
                    >
                      <WashingMachine className="w-3 h-3" />
                      {g.inLaundry ? 'En Colada' : 'Marcar Colada'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </main>
      )}

      {/* Vista: Lavandería */}
      {activeTab === 'laundry' && (
        <main className="p-4 flex-1 space-y-4">
          <h2 className="text-base font-bold text-slate-200">Cesta de Lavandería</h2>
          
          {garments.filter(g => g.inLaundry).length === 0 ? (
            <div className="text-center py-12 text-slate-500 space-y-2">
              <Check className="w-12 h-12 mx-auto stroke-1 text-emerald-500" />
              <p className="text-xs">¡No tienes prendas en la colada! Todo está listo para usar.</p>
            </div>
          ) : (
            <div className="space-y-2">
              {garments.filter(g => g.inLaundry).map((g) => (
                <div key={g.id} className="p-3 bg-slate-800 rounded-xl border border-slate-700 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <img src={g.image} alt={g.name} className="w-10 h-10 rounded-lg object-cover" />
                    <div>
                      <p className="text-xs font-semibold text-slate-200">{g.name}</p>
                      <p className="text-[10px] text-slate-400">{CATEGORY_LABELS[g.category] || g.category}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => toggleLaundry(g.id)}
                    className="px-3 py-1 bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 rounded-lg text-xs font-medium hover:bg-emerald-500/30"
                  >
                    Lavada
                  </button>
                </div>
              ))}
            </div>
          )}
        </main>
      )}

      {/* Modal para Añadir Prenda con Cámara / Galería */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-md w-full p-4 space-y-4 shadow-2xl max-h-[92vh] overflow-y-auto">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                <Camera className="w-4 h-4 text-indigo-400" /> Añadir Prenda al Armario
              </h3>
              <button
                onClick={() => {
                  stopCamera();
                  setShowAddModal(false);
                }}
                className="p-1 text-slate-400 hover:text-slate-200 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveGarment} className="space-y-4">
              {/* Sección de Cámara / Previsualización de Foto */}
              <div className="space-y-2">
                <label className="text-xs font-medium text-slate-300 block">Fotografía de la Prenda</label>

                {cameraActive ? (
                  <div className="relative rounded-xl overflow-hidden bg-black border border-slate-700">
                    <video
                      ref={videoRef}
                      autoPlay
                      playsInline
                      muted
                      className="w-full h-56 object-cover"
                    />
                    <div className="absolute bottom-3 inset-x-0 flex justify-center items-center gap-3 px-4">
                      <button
                        type="button"
                        onClick={toggleCameraFacing}
                        className="p-2.5 bg-slate-900/80 text-slate-200 rounded-full border border-slate-700 hover:bg-slate-800"
                        title="Cambiar cámara frontal/trasera"
                      >
                        <SwitchCamera className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={capturePhotoFromVideo}
                        className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs rounded-full shadow-lg flex items-center gap-1.5"
                      >
                        <Camera className="w-4 h-4" /> Capturar Foto
                      </button>
                      <button
                        type="button"
                        onClick={stopCamera}
                        className="p-2.5 bg-slate-900/80 text-rose-400 rounded-full border border-slate-700 hover:bg-slate-800"
                        title="Cancelar cámara"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ) : newGarment.image ? (
                  <div className="relative rounded-xl overflow-hidden border border-slate-700">
                    <img
                      src={newGarment.image}
                      alt="Vista previa"
                      className="w-full h-48 object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => setNewGarment(prev => ({ ...prev, image: '' }))}
                      className="absolute top-2 right-2 px-2.5 py-1 bg-slate-900/85 text-xs text-rose-300 rounded-lg border border-slate-700 hover:bg-slate-900"
                    >
                      Cambiar foto
                    </button>
                  </div>
                ) : (
                  <div className="border-2 border-dashed border-slate-700 rounded-xl p-4 text-center space-y-3 bg-slate-800/40">
                    <Camera className="w-8 h-8 text-indigo-400 mx-auto stroke-1" />
                    <p className="text-xs text-slate-400">
                      Usa la cámara para fotografiar tu prenda o súbela desde tu galería
                    </p>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => startCamera()}
                        className="py-2.5 px-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 shadow"
                      >
                        <Camera className="w-4 h-4" /> Usar Cámara
                      </button>
                      <button
                        type="button"
                        onClick={() => nativeCameraInputRef.current?.click()}
                        className="py-2.5 px-3 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-600 rounded-xl text-xs font-medium flex items-center justify-center gap-1.5"
                      >
                        <ImageIcon className="w-4 h-4 text-indigo-400" /> Cámara / Galería
                      </button>
                    </div>
                  </div>
                )}

                {cameraError && (
                  <div className="text-[11px] text-amber-300 bg-amber-950/40 border border-amber-800/50 p-2 rounded-lg">
                    {cameraError}
                  </div>
                )}

                {/* Inputs ocultos para captura nativa móvil y subida de archivo */}
                <input
                  ref={nativeCameraInputRef}
                  type="file"
                  accept="image/*"
                  capture="environment"
                  onChange={handleFileChange}
                  className="hidden"
                />
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </div>

              {/* Nombre de la Prenda */}
              <div className="space-y-1">
                <label className="text-xs font-medium text-slate-300">Nombre de la prenda</label>
                <input
                  type="text"
                  placeholder="Ej. Cazadora Vaquera Azul"
                  value={newGarment.name}
                  onChange={(e) => setNewGarment(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-indigo-500"
                  required
                />
              </div>

              {/* Categoría y Color */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-medium text-slate-300">Categoría</label>
                  <select
                    value={newGarment.category}
                    onChange={(e) => setNewGarment(prev => ({ ...prev, category: e.target.value }))}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-2.5 py-2 text-xs text-slate-100 focus:outline-none focus:border-indigo-500"
                  >
                    <option value="Top">Parte Superior</option>
                    <option value="Bottom">Parte Inferior</option>
                    <option value="Footwear">Calzado</option>
                    <option value="Outerwear">Abrigo / Exterior</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-medium text-slate-300">Color principal</label>
                  <input
                    type="text"
                    placeholder="Ej. Azul, Negro..."
                    value={newGarment.color}
                    onChange={(e) => setNewGarment(prev => ({ ...prev, color: e.target.value }))}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              {/* Ocasiones */}
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-slate-300">Ocasiones de uso</label>
                <div className="grid grid-cols-3 gap-2">
                  {['Work', 'Going Out', 'Sport'].map((occ) => {
                    const active = newGarment.occasion.includes(occ);
                    return (
                      <button
                        type="button"
                        key={occ}
                        onClick={() => toggleNewGarmentOccasion(occ)}
                        className={`py-1.5 text-xs rounded-xl font-medium border transition-all ${
                          active
                            ? 'bg-indigo-600/30 border-indigo-500 text-indigo-200'
                            : 'bg-slate-800 border-slate-700 text-slate-400'
                        }`}
                      >
                        {OCCASION_LABELS[occ]}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Nivel de Abrigo */}
              <div className="space-y-1">
                <div className="flex justify-between text-xs text-slate-300">
                  <span>Nivel de Abrigo</span>
                  <span className="font-bold text-indigo-400">{newGarment.warmth} / 5</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="5"
                  value={newGarment.warmth}
                  onChange={(e) => setNewGarment(prev => ({ ...prev, warmth: Number(e.target.value) }))}
                  className="w-full accent-indigo-500 h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 font-semibold rounded-xl text-xs text-white flex justify-center items-center gap-2 shadow-lg shadow-indigo-500/25 transition-all"
              >
                <Plus className="w-4 h-4" /> Guardar en mi Armario
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Navegación Inferior Móvil */}
      <nav className="fixed bottom-0 max-w-md w-full bg-slate-900/95 border-t border-slate-800 backdrop-blur flex justify-around p-2 z-20">
        <button
          onClick={() => setActiveTab('generator')}
          className={`flex flex-col items-center gap-1 p-2 rounded-xl text-[10px] transition-all ${
            activeTab === 'generator' ? 'text-indigo-400 font-semibold' : 'text-slate-500 hover:text-slate-400'
          }`}
        >
          <Sparkles className="w-5 h-5" /> Outfits
        </button>

        <button
          onClick={() => setActiveTab('closet')}
          className={`flex flex-col items-center gap-1 p-2 rounded-xl text-[10px] transition-all ${
            activeTab === 'closet' ? 'text-indigo-400 font-semibold' : 'text-slate-500 hover:text-slate-400'
          }`}
        >
          <Shirt className="w-5 h-5" /> Armario
        </button>

        <button
          onClick={() => {
            setActiveTab('closet');
            setShowAddModal(true);
          }}
          className="flex flex-col items-center gap-1 p-2 rounded-xl text-[10px] text-indigo-400 hover:text-indigo-300 transition-all"
        >
          <Camera className="w-5 h-5" /> Cámara
        </button>

        <button
          onClick={() => setActiveTab('laundry')}
          className={`flex flex-col items-center gap-1 p-2 rounded-xl text-[10px] relative transition-all ${
            activeTab === 'laundry' ? 'text-indigo-400 font-semibold' : 'text-slate-500 hover:text-slate-400'
          }`}
        >
          <WashingMachine className="w-5 h-5" /> Colada
          {garments.filter(g => g.inLaundry).length > 0 && (
            <span className="absolute top-1 right-2 w-2 h-2 bg-amber-400 rounded-full"></span>
          )}
        </button>
      </nav>
    </div>
  );
}
