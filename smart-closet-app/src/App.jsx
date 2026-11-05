import React, { useState, useEffect, useRef } from 'react';
import { 
  Shirt, 
  Sparkles, 
  WashingMachine, 
  Plus, 
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
  Image as ImageIcon,
  ThumbsUp,
  ThumbsDown,
  MessageSquarePlus,
  Filter,
  Tag,
  History,
  Star
} from 'lucide-react';

// Clasificaciones detalladas de prendas y su bloque funcional para armar outfits
const GARMENT_TYPES = [
  { id: 'Camisetas', label: 'Camisetas', slot: 'Top' },
  { id: 'Camisas', label: 'Camisas / Blusas', slot: 'Top' },
  { id: 'Sudaderas', label: 'Sudaderas', slot: 'Top' },
  { id: 'Jerseys', label: 'Jerseys / Punto', slot: 'Top' },
  { id: 'Pantalones', label: 'Pantalones', slot: 'Bottom' },
  { id: 'Vaqueros', label: 'Vaqueros / Jeans', slot: 'Bottom' },
  { id: 'FaldasShorts', label: 'Faldas / Bermudas', slot: 'Bottom' },
  { id: 'Abrigos', label: 'Abrigos / Cazadoras', slot: 'Outerwear' },
  { id: 'Blazers', label: 'Blazers / Americanas', slot: 'Outerwear' },
  { id: 'Calzado', label: 'Calzado / Zapatillas', slot: 'Footwear' }
];

const getSlotFromType = (subcategory, fallbackCategory = 'Top') => {
  const found = GARMENT_TYPES.find(t => t.id === subcategory);
  if (found) return found.slot;
  return fallbackCategory;
};

const getDefaultSubcategory = (category) => {
  if (category === 'Top') return 'Camisetas';
  if (category === 'Bottom') return 'Pantalones';
  if (category === 'Outerwear') return 'Abrigos';
  if (category === 'Footwear') return 'Calzado';
  return 'Camisetas';
};

// Datos iniciales de ejemplo
const INITIAL_GARMENTS = [
  {
    id: '1',
    name: 'Blazer Entallada Negra',
    category: 'Outerwear',
    subcategory: 'Blazers',
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
    subcategory: 'Camisetas',
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
    subcategory: 'Pantalones',
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
    subcategory: 'Calzado',
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
    subcategory: 'Abrigos',
    occasion: ['Work', 'Going Out', 'Sport'],
    warmth: 4,
    comfort: 4,
    color: 'Azul Marino',
    inLaundry: false,
    image: 'https://images.unsplash.com/photo-1544441893-675973e31985?w=400&auto=format&fit=crop&q=80'
  },
  {
    id: '6',
    name: 'Sudadera Gris Capucha',
    category: 'Top',
    subcategory: 'Sudaderas',
    occasion: ['Going Out', 'Sport'],
    warmth: 4,
    comfort: 5,
    color: 'Gris',
    inLaundry: false,
    image: 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=400&auto=format&fit=crop&q=80'
  },
  {
    id: '7',
    name: 'Jersey Punto Burdeos',
    category: 'Top',
    subcategory: 'Jerseys',
    occasion: ['Work', 'Going Out'],
    warmth: 4,
    comfort: 4,
    color: 'Burdeos',
    inLaundry: false,
    image: 'https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?w=400&auto=format&fit=crop&q=80'
  }
];

const OCCASION_LABELS = {
  Work: 'Trabajo',
  'Going Out': 'Salir',
  Sport: 'Deporte'
};

const FEEDBACK_REASONS = [
  { id: 'colors', label: 'No combinan bien los colores' },
  { id: 'too_cold', label: 'Pasaría frío (poco abrigo)' },
  { id: 'too_warm', label: 'Pasaría calor (demasiado abrigo)' },
  { id: 'wrong_style', label: 'No encaja con la ocasión' },
  { id: 'dislike_combo', label: 'No me gusta esta combinación de prendas' }
];

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
  const [authMode, setAuthMode] = useState('login');
  const [authUsername, setAuthUsername] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [authName, setAuthName] = useState('');
  const [includeSampleCloset, setIncludeSampleCloset] = useState(true);
  const [authError, setAuthError] = useState('');

  // --- Navegación, Armario y Filtro ---
  const [activeTab, setActiveTab] = useState('generator');
  const [garments, setGarments] = useState([]);
  const [selectedFilter, setSelectedFilter] = useState('ALL');
  const [editingGarmentId, setEditingGarmentId] = useState(null);

  // --- Historial de Feedback del Usuario ---
  const [feedbackHistory, setFeedbackHistory] = useState([]);
  const [showRejectPanel, setShowRejectPanel] = useState(false);
  const [selectedReasons, setSelectedReasons] = useState(['dislike_combo']);
  const [customFeedbackText, setCustomFeedbackText] = useState('');
  const [outfitRating, setOutfitRating] = useState(8);
  const [outfitAcceptedMsg, setOutfitAcceptedMsg] = useState('');

  // Cargar el armario y el feedback específico del usuario cuando inicia sesión
  useEffect(() => {
    if (!currentUser) {
      setGarments([]);
      setFeedbackHistory([]);
      return;
    }
    const closetKey = `smart_closet_garments_${currentUser.username}`;
    const feedbackKey = `smart_closet_feedback_${currentUser.username}`;

    try {
      const savedGarments = localStorage.getItem(closetKey);
      if (savedGarments) {
        // Asegurar que prendas antiguas tengan subcategory
        const parsed = JSON.parse(savedGarments).map(g => ({
          ...g,
          subcategory: g.subcategory || getDefaultSubcategory(g.category),
          category: getSlotFromType(g.subcategory || getDefaultSubcategory(g.category), g.category)
        }));
        setGarments(parsed);
      } else {
        setGarments(INITIAL_GARMENTS);
        localStorage.setItem(closetKey, JSON.stringify(INITIAL_GARMENTS));
      }

      const savedFeedback = localStorage.getItem(feedbackKey);
      setFeedbackHistory(savedFeedback ? JSON.parse(savedFeedback) : []);
    } catch (e) {
      console.error('Error al cargar datos del usuario:', e);
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

  // Guardar feedback del usuario actual
  const updateUserFeedback = (newFeedbackList) => {
    setFeedbackHistory(newFeedbackList);
    if (currentUser) {
      try {
        localStorage.setItem(
          `smart_closet_feedback_${currentUser.username}`,
          JSON.stringify(newFeedbackList)
        );
      } catch (e) {
        console.error('Error al guardar feedback:', e);
      }
    }
  };

  // --- Clima y Geolocalización ---
  const [locationName, setLocationName] = useState('A Coruña');
  const [temp, setTemp] = useState(16);
  const [isRaining, setIsRaining] = useState(false);

  // --- Parámetros de Generación ---
  const [selectedOccasion, setSelectedOccasion] = useState('Work');
  const [desiredWarmth, setDesiredWarmth] = useState(3);
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
  const nativeCameraInputRef = useRef(null);

  const [newGarment, setNewGarment] = useState({
    name: '',
    subcategory: 'Camisetas',
    occasion: ['Work'],
    warmth: 3,
    comfort: 4,
    color: '',
    image: ''
  });

  // Cargar Clima mediante Open-Meteo API
  const fetchWeather = async (lat = 43.3623, lon = -8.4115, name = 'A Coruña') => {
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
    }
  };

  useEffect(() => {
    fetchWeather();
    return () => stopCamera();
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
      localStorage.setItem('smart_closet_users', JSON.stringify([...users, newUser]));
      
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
      setCameraError('Tu navegador no permite cámara en vivo. Usa el botón "Cámara / Galería".');
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
      setCameraError('No se pudo abrir la cámara en vivo. Verifica permisos o usa "Cámara / Galería".');
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
    if (cameraActive) startCamera(nextMode);
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
      if (exists && prev.occasion.length === 1) return prev;
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

    const slot = getSlotFromType(newGarment.subcategory, 'Top');

    const created = {
      id: Date.now().toString(),
      name: newGarment.name.trim(),
      category: slot,
      subcategory: newGarment.subcategory,
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
      subcategory: 'Camisetas',
      occasion: ['Work'],
      warmth: 3,
      comfort: 4,
      color: '',
      image: ''
    });
  };

  // Eliminar prenda del armario
  const deleteGarment = (id, name) => {
    const updated = garments.filter(g => String(g.id) !== String(id));
    updateUserGarments(updated);
    if (currentOutfit && currentOutfit.some(g => String(g.id) === String(id))) {
      setCurrentOutfit(null);
    }
  };

  // Cambiar clasificación de una prenda existente
  const changeGarmentSubcategory = (id, newSubcat) => {
    const newSlot = getSlotFromType(newSubcat, 'Top');
    const updated = garments.map(g =>
      String(g.id) === String(id)
        ? { ...g, subcategory: newSubcat, category: newSlot }
        : g
    );
    updateUserGarments(updated);
    setEditingGarmentId(null);
  };

  // --- Generador Inteligente de Outfits con Aprendizaje de Feedback ---
  const generateOutfit = () => {
    setGenerating(true);
    setShowRejectPanel(false);
    setOutfitAcceptedMsg('');

    setTimeout(() => {
      const available = garments.filter(g => !g.inLaundry && g.occasion.includes(selectedOccasion));

      const tops = available.filter(g => getSlotFromType(g.subcategory, g.category) === 'Top');
      const bottoms = available.filter(g => getSlotFromType(g.subcategory, g.category) === 'Bottom');
      const footwears = available.filter(g => getSlotFromType(g.subcategory, g.category) === 'Footwear');
      const outerwears = available.filter(g => getSlotFromType(g.subcategory, g.category) === 'Outerwear');

      if (tops.length === 0 || bottoms.length === 0 || footwears.length === 0) {
        alert("Necesitas al menos 1 Parte Superior (camiseta/camisa/sudadera/jersey), 1 Parte Inferior (pantalón/vaquero) y 1 Calzado limpios para esta ocasión.");
        setGenerating(false);
        return;
      }

      // Analizar feedback pasado del usuario
      const rejectedFeedbacks = feedbackHistory.filter(f => f.status === 'rejected');
      const acceptedFeedbacks = feedbackHistory.filter(f => f.status === 'accepted');

      // Calcular ajuste de abrigo aprendido según rechazos previos por frío/calor
      let warmthBias = 0;
      rejectedFeedbacks.forEach(fb => {
        if (fb.reasons?.includes('too_cold')) warmthBias += 0.5;
        if (fb.reasons?.includes('too_warm')) warmthBias -= 0.5;
      });
      const targetWarmth = Math.min(5, Math.max(1, Math.round(desiredWarmth + warmthBias)));

      // Evaluar varios candidatos de outfit y puntuar según preferencias/feedback
      let bestCandidate = null;
      let bestScore = -9999;

      const maxAttempts = 25;
      for (let i = 0; i < maxAttempts; i++) {
        const candidateTop = tops[Math.floor(Math.random() * tops.length)];
        const candidateBottom = bottoms[Math.floor(Math.random() * bottoms.length)];
        const candidateFootwear = footwears[Math.floor(Math.random() * footwears.length)];

        let candidateOuterwear = null;
        if (targetWarmth >= 3 || isRaining) {
          if (outerwears.length > 0) {
            candidateOuterwear = outerwears[Math.floor(Math.random() * outerwears.length)];
          }
        }

        const candidateItems = [candidateTop, candidateBottom, candidateFootwear];
        if (candidateOuterwear) candidateItems.push(candidateOuterwear);

        const candidateIds = candidateItems.map(item => String(item.id)).sort().join('-');
        const colorPairKey = `${candidateTop.color?.toLowerCase()}_${candidateBottom.color?.toLowerCase()}`;

        let score = 0;

        // 1. Penalizar fuertemente si esta combinación exacta ya fue rechazada
        const exactRejected = rejectedFeedbacks.some(fb => fb.comboKey === candidateIds);
        if (exactRejected) score -= 50;

        // 2. Penalizar si el par (Top + Bottom) fue rechazado por combinación o colores
        const pairRejected = rejectedFeedbacks.some(
          fb =>
            fb.topBottomKey === `${candidateTop.id}_${candidateBottom.id}` ||
            (fb.reasons?.includes('colors') && fb.colorPairKey === colorPairKey)
        );
        if (pairRejected) score -= 25;

        // 3. Premiar o penalizar según la valoración de 0 a 10 estrellas en usos previos
        const previousRatings = feedbackHistory.filter(
          fb => fb.comboKey === candidateIds || fb.topBottomKey === `${candidateTop.id}_${candidateBottom.id}`
        );
        previousRatings.forEach(fb => {
          if (typeof fb.rating === 'number') {
            // Si tiene >= 6 estrellas suma puntos; si tiene < 5 resta puntos proporcionalmente
            score += (fb.rating - 5) * 4;
          } else if (fb.status === 'accepted') {
            score += 10;
          }
        });

        // 4. Ajustar cercanía al abrigo objetivo (incluyendo aprendizaje)
        const avgWarmth =
          candidateItems.reduce((acc, it) => acc + (Number(it.warmth) || 3), 0) /
          candidateItems.length;
        score -= Math.abs(avgWarmth - targetWarmth) * 4;

        // 5. Evitar repetir exactamente el outfit que está en pantalla ahora mismo si hay más opciones
        if (currentOutfit) {
          const currentKey = currentOutfit.map(item => String(item.id)).sort().join('-');
          if (currentKey === candidateIds) score -= 15;
        }

        if (score > bestScore) {
          bestScore = score;
          bestCandidate = candidateItems;
        }
      }

      setCurrentOutfit(bestCandidate);
      setOutfitRating(8);

      const topItem = bestCandidate[0];
      const bottomItem = bestCandidate[1];
      const learnedNote =
        rejectedFeedbacks.length > 0
          ? ` Se han tenido en cuenta tus ${rejectedFeedbacks.length} valoraciones previas para evitar combinaciones rechazadas.`
          : '';

      setAiNote(
        `Combinación de ${topItem.subcategory || 'prenda'} (${topItem.color}) con ${bottomItem.subcategory || 'pantalón'} (${bottomItem.color}). Nivel de abrigo ${targetWarmth}/5 adaptado al clima.${learnedNote}`
      );
      setGenerating(false);
    }, 350);
  };

  // Aceptar el Outfit sugerido
  const handleAcceptOutfit = (sendToLaundry = false) => {
    if (!currentOutfit) return;
    const topItem = currentOutfit[0];
    const bottomItem = currentOutfit[1];
    const comboKey = currentOutfit.map(i => String(i.id)).sort().join('-');

    const entry = {
      id: Date.now().toString(),
      date: new Date().toLocaleDateString('es-ES'),
      status: 'accepted',
      rating: outfitRating,
      occasion: selectedOccasion,
      comboKey,
      topBottomKey: `${topItem.id}_${bottomItem.id}`,
      colorPairKey: `${topItem.color?.toLowerCase()}_${bottomItem.color?.toLowerCase()}`,
      summary: currentOutfit.map(i => i.name).join(' + '),
      reasons: [],
      comment: `Outfit aceptado (${outfitRating}/10 ⭐)`
    };

    updateUserFeedback([entry, ...feedbackHistory]);

    if (sendToLaundry) {
      const outfitIds = currentOutfit.map(g => g.id);
      updateUserGarments(garments.map(g => outfitIds.includes(g.id) ? { ...g, inLaundry: true } : g));
      setCurrentOutfit(null);
      setOutfitAcceptedMsg(`¡Outfit valorado con ${outfitRating}/10 ⭐! Prendas enviadas a la colada.`);
    } else {
      setOutfitAcceptedMsg(`¡Guardado con ${outfitRating}/10 ⭐! Tendremos en cuenta tu valoración en futuros looks.`);
    }
    setShowRejectPanel(false);
  };

  // Rechazar Outfit y guardar Feedback para el futuro
  const handleRejectSubmit = (e) => {
    e.preventDefault();
    if (!currentOutfit) return;

    const topItem = currentOutfit[0];
    const bottomItem = currentOutfit[1];
    const comboKey = currentOutfit.map(i => String(i.id)).sort().join('-');

    const entry = {
      id: Date.now().toString(),
      date: new Date().toLocaleDateString('es-ES'),
      status: 'rejected',
      rating: outfitRating,
      occasion: selectedOccasion,
      comboKey,
      topBottomKey: `${topItem.id}_${bottomItem.id}`,
      colorPairKey: `${topItem.color?.toLowerCase()}_${bottomItem.color?.toLowerCase()}`,
      summary: currentOutfit.map(i => i.name).join(' + '),
      reasons: selectedReasons,
      comment: customFeedbackText.trim()
    };

    const updatedFeedback = [entry, ...feedbackHistory];
    updateUserFeedback(updatedFeedback);

    // Ajustar el slider de abrigo inmediatamente si el usuario indicó frío o calor
    if (selectedReasons.includes('too_cold') && desiredWarmth < 5) {
      setDesiredWarmth(prev => Math.min(5, prev + 1));
    } else if (selectedReasons.includes('too_warm') && desiredWarmth > 1) {
      setDesiredWarmth(prev => Math.max(1, prev - 1));
    }

    setCustomFeedbackText('');
    setShowRejectPanel(false);
    // Generar una nueva propuesta automáticamente teniendo en cuenta el rechazo
    generateOutfit();
  };

  const toggleReason = (reasonId) => {
    setSelectedReasons(prev =>
      prev.includes(reasonId) ? prev.filter(r => r !== reasonId) : [...prev, reasonId]
    );
  };

  const toggleLaundry = (id) => {
    updateUserGarments(garments.map(g => g.id === id ? { ...g, inLaundry: !g.inLaundry } : g));
  };

  // Prendas filtradas en la vista de Armario
  const filteredGarments =
    selectedFilter === 'ALL'
      ? garments
      : garments.filter(g => (g.subcategory || getDefaultSubcategory(g.category)) === selectedFilter);

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
              Inicia sesión para gestionar tu armario personal, clasificar prendas y entrenar tu estilista IA
            </p>
          </div>

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
                    placeholder="Ej. Javi"
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
        <main className="p-4 flex-1 space-y-5">
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

          {outfitAcceptedMsg && (
            <div className="p-3 bg-emerald-950/50 border border-emerald-700/50 rounded-xl text-xs text-emerald-200 flex items-center gap-2">
              <Check className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>{outfitAcceptedMsg}</span>
            </div>
          )}

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
                      <p className="text-[10px] text-indigo-300 font-medium">
                        {GARMENT_TYPES.find(t => t.id === item.subcategory)?.label || item.subcategory || item.category} • {item.color}
                      </p>
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

              {/* Valoración de 0 a 10 Estrellas y Botones de Aceptar o Rechazar */}
              <div className="bg-slate-800/60 border border-slate-700/70 rounded-2xl p-3.5 space-y-3">
                <div className="space-y-1.5">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-300 font-medium">Valora este Outfit (0 a 10 estrellas):</span>
                    <span className="font-bold text-amber-400 bg-amber-500/10 border border-amber-500/30 px-2 py-0.5 rounded-full">
                      {outfitRating} / 10 ⭐
                    </span>
                  </div>

                  <div className="flex items-center justify-between gap-0.5 pt-1">
                    <button
                      type="button"
                      onClick={() => setOutfitRating(0)}
                      className={`px-1.5 py-1 rounded text-[10px] font-bold border transition-all ${
                        outfitRating === 0
                          ? 'bg-rose-600 text-white border-rose-500'
                          : 'bg-slate-900 text-slate-400 border-slate-700 hover:text-slate-200'
                      }`}
                      title="0 estrellas"
                    >
                      0
                    </button>
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((starValue) => (
                      <button
                        type="button"
                        key={starValue}
                        onClick={() => setOutfitRating(starValue)}
                        className="p-1 focus:outline-none transition-transform hover:scale-110"
                        title={`${starValue} estrellas`}
                      >
                        <Star
                          className={`w-5 h-5 ${
                            starValue <= outfitRating
                              ? 'text-amber-400 fill-amber-400'
                              : 'text-slate-600'
                          }`}
                        />
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2.5 pt-1">
                  <button
                    type="button"
                    onClick={() => handleAcceptOutfit(false)}
                    className="py-2.5 px-3 bg-emerald-600/20 hover:bg-emerald-600/30 border border-emerald-500/40 text-emerald-300 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all"
                  >
                    <ThumbsUp className="w-4 h-4" /> Aceptar ({outfitRating}/10)
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      if (!showRejectPanel && outfitRating > 4) setOutfitRating(3);
                      setShowRejectPanel(!showRejectPanel);
                    }}
                    className={`py-2.5 px-3 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 border transition-all ${
                      showRejectPanel
                        ? 'bg-rose-600 text-white border-rose-500'
                        : 'bg-rose-600/20 hover:bg-rose-600/30 border-rose-500/40 text-rose-300'
                    }`}
                  >
                    <ThumbsDown className="w-4 h-4" /> Rechazar y dar Feedback
                  </button>
                </div>

                <button
                  type="button"
                  onClick={() => handleAcceptOutfit(true)}
                  className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-xl text-xs font-medium text-slate-300 flex items-center justify-center gap-2 transition-all"
                >
                  <WashingMachine className="w-4 h-4 text-pink-400" /> Aceptar ({outfitRating}/10), usar hoy y enviar a colada
                </button>
              </div>

              {/* Panel de Feedback al Rechazar */}
              {showRejectPanel && (
                <form
                  onSubmit={handleRejectSubmit}
                  className="bg-slate-800/90 border border-rose-500/40 rounded-2xl p-4 space-y-3 animate-fadeIn"
                >
                  <div className="flex justify-between items-center">
                    <h4 className="text-xs font-bold text-rose-300 flex items-center gap-1.5">
                      <MessageSquarePlus className="w-4 h-4" /> ¿Por qué rechazas este outfit?
                    </h4>
                    <button
                      type="button"
                      onClick={() => setShowRejectPanel(false)}
                      className="text-slate-400 hover:text-slate-200"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  <p className="text-[11px] text-slate-400">
                    Tu feedback se guardará en tu perfil para no repetir combinaciones que no te gusten y ajustar el nivel de abrigo.
                  </p>

                  <div className="flex flex-wrap gap-1.5">
                    {FEEDBACK_REASONS.map(reason => {
                      const active = selectedReasons.includes(reason.id);
                      return (
                        <button
                          type="button"
                          key={reason.id}
                          onClick={() => toggleReason(reason.id)}
                          className={`px-2.5 py-1.5 rounded-lg text-[11px] font-medium border transition-all ${
                            active
                              ? 'bg-rose-500/30 border-rose-400 text-rose-200'
                              : 'bg-slate-900 border-slate-700 text-slate-400 hover:text-slate-300'
                          }`}
                        >
                          {reason.label}
                        </button>
                      );
                    })}
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] text-slate-300 font-medium">
                      Comentario adicional para tener en cuenta en el futuro (opcional):
                    </label>
                    <textarea
                      rows={2}
                      placeholder="Ej. No me gusta llevar esta sudadera con pantalón de vestir..."
                      value={customFeedbackText}
                      onChange={(e) => setCustomFeedbackText(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-xs text-slate-100 focus:outline-none focus:border-rose-500"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-2.5 bg-rose-600 hover:bg-rose-500 text-white font-semibold rounded-xl text-xs shadow-lg transition-all"
                  >
                    Guardar Feedback y Generar Nuevo Outfit
                  </button>
                </form>
              )}
            </section>
          ) : (
            <div className="text-center py-10 text-slate-500 space-y-2">
              <Shirt className="w-12 h-12 mx-auto stroke-1 text-slate-600" />
              <p className="text-xs">Pulsa el botón superior para crear tu combinación del día.</p>
            </div>
          )}

          {/* Historial de Feedback Aprendido */}
          {feedbackHistory.length > 0 && (
            <section className="bg-slate-800/40 border border-slate-800 rounded-2xl p-3.5 space-y-2.5">
              <div className="flex justify-between items-center">
                <h4 className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                  <History className="w-3.5 h-3.5 text-indigo-400" /> Aprendizaje de tus Gustos ({feedbackHistory.length})
                </h4>
                <button
                  onClick={() => updateUserFeedback([])}
                  className="text-[10px] text-slate-500 hover:text-rose-400"
                >
                  Limpiar historial
                </button>
              </div>
              <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1">
                {feedbackHistory.slice(0, 5).map(item => (
                  <div
                    key={item.id}
                    className="p-2 rounded-xl bg-slate-900/70 border border-slate-800 text-[11px] flex flex-col gap-0.5"
                  >
                    <div className="flex justify-between items-center">
                      <span
                        className={`font-semibold flex items-center gap-1.5 ${
                          item.status === 'accepted' ? 'text-emerald-400' : 'text-rose-400'
                        }`}
                      >
                        <span>{item.status === 'accepted' ? '✓ Aceptado' : '✗ Rechazado'}</span>
                        {typeof item.rating === 'number' && (
                          <span className="text-amber-400 bg-amber-500/10 px-1.5 py-0.2 rounded border border-amber-500/30 text-[10px]">
                            ⭐ {item.rating}/10
                          </span>
                        )}
                      </span>
                      <span className="text-[10px] text-slate-500">{item.date}</span>
                    </div>
                    <p className="text-slate-300 truncate">{item.summary}</p>
                    {item.reasons?.length > 0 && (
                      <p className="text-[10px] text-slate-400">
                        Motivo:{' '}
                        {item.reasons
                          .map(r => FEEDBACK_REASONS.find(fr => fr.id === r)?.label || r)
                          .join(', ')}
                      </p>
                    )}
                    {item.comment && item.status === 'rejected' && (
                      <p className="text-[10px] text-indigo-300 italic">"{item.comment}"</p>
                    )}
                  </div>
                ))}
              </div>
            </section>
          )}
        </main>
      )}

      {/* Vista: Armario con Clasificación, Filtros y Eliminación */}
      {activeTab === 'closet' && (
        <main className="p-4 flex-1 space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-base font-bold text-slate-200">
              Mi Armario ({filteredGarments.length}/{garments.length})
            </h2>
            <button
              onClick={() => setShowAddModal(true)}
              className="flex items-center gap-1.5 px-3 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold shadow-lg shadow-indigo-500/25 transition-all"
            >
              <Camera className="w-4 h-4" /> Añadir Prenda
            </button>
          </div>

          {/* Barra de Filtros por Tipo de Prenda */}
          <div className="space-y-1.5">
            <div className="flex items-center gap-1.5 text-xs text-slate-400">
              <Filter className="w-3.5 h-3.5 text-indigo-400" />
              <span>Filtrar por tipo de prenda:</span>
            </div>
            <div className="flex gap-1.5 overflow-x-auto pb-2 scrollbar-thin">
              <button
                onClick={() => setSelectedFilter('ALL')}
                className={`px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-all ${
                  selectedFilter === 'ALL'
                    ? 'bg-indigo-600 text-white shadow'
                    : 'bg-slate-800 text-slate-400 border border-slate-700 hover:bg-slate-700'
                }`}
              >
                Todas ({garments.length})
              </button>
              {GARMENT_TYPES.map(type => {
                const count = garments.filter(
                  g => (g.subcategory || getDefaultSubcategory(g.category)) === type.id
                ).length;
                return (
                  <button
                    key={type.id}
                    onClick={() => setSelectedFilter(type.id)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-all ${
                      selectedFilter === type.id
                        ? 'bg-indigo-600 text-white shadow'
                        : 'bg-slate-800 text-slate-400 border border-slate-700 hover:bg-slate-700'
                    }`}
                  >
                    {type.label} ({count})
                  </button>
                );
              })}
            </div>
          </div>

          {filteredGarments.length === 0 ? (
            <div className="text-center py-10 bg-slate-800/40 rounded-2xl border border-slate-800 p-6 space-y-3">
              <Shirt className="w-10 h-10 mx-auto text-indigo-400 stroke-1" />
              <p className="text-xs text-slate-400">
                {selectedFilter === 'ALL'
                  ? 'Tu armario está vacío. ¡Añade tu primera prenda con la cámara!'
                  : `No tienes prendas clasificadas en "${GARMENT_TYPES.find(t => t.id === selectedFilter)?.label}".`}
              </p>
              {selectedFilter !== 'ALL' ? (
                <button
                  onClick={() => setSelectedFilter('ALL')}
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-semibold border border-slate-700"
                >
                  Ver todas las prendas
                </button>
              ) : (
                <button
                  onClick={() => setShowAddModal(true)}
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold"
                >
                  <Plus className="w-4 h-4" /> Fotografiar Prenda
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              {filteredGarments.map((g) => {
                const subcatLabel =
                  GARMENT_TYPES.find(t => t.id === (g.subcategory || getDefaultSubcategory(g.category)))?.label ||
                  g.subcategory ||
                  g.category;

                return (
                  <div
                    key={g.id}
                    className={`bg-slate-800 rounded-xl overflow-hidden border flex flex-col justify-between ${
                      g.inLaundry ? 'border-amber-500/40 opacity-70' : 'border-slate-700'
                    } relative`}
                  >
                    <div>
                      <div className="relative">
                        <img src={g.image} alt={g.name} className="w-full h-32 object-cover" />
                        <span className="absolute bottom-1.5 left-1.5 bg-slate-900/85 text-indigo-300 text-[10px] font-medium px-2 py-0.5 rounded-md border border-slate-700">
                          {subcatLabel}
                        </span>
                      </div>

                      <div className="p-2.5 space-y-1.5">
                        <p className="text-xs font-semibold text-slate-200 truncate">{g.name}</p>
                        <p className="text-[10px] text-slate-400">
                          {g.color} • Abrigo: {g.warmth}/5
                        </p>

                        {/* Selector rápido para reclasificar cualquier prenda existente */}
                        {editingGarmentId === g.id ? (
                          <div className="pt-1 space-y-1">
                            <label className="text-[10px] text-indigo-300 block">Cambiar tipo:</label>
                            <select
                              value={g.subcategory || getDefaultSubcategory(g.category)}
                              onChange={(e) => changeGarmentSubcategory(g.id, e.target.value)}
                              className="w-full bg-slate-900 border border-indigo-500 rounded-lg px-2 py-1 text-[11px] text-slate-100"
                            >
                              {GARMENT_TYPES.map(type => (
                                <option key={type.id} value={type.id}>
                                  {type.label}
                                </option>
                              ))}
                            </select>
                          </div>
                        ) : (
                          <button
                            type="button"
                            onClick={() => setEditingGarmentId(g.id)}
                            className="text-[10px] text-indigo-400 hover:text-indigo-300 flex items-center gap-1"
                          >
                            <Tag className="w-3 h-3" /> Cambiar clasificación
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Botones de Acción: Colada y Eliminar */}
                    <div className="p-2.5 pt-0 space-y-1.5">
                      <button
                        type="button"
                        onClick={() => toggleLaundry(g.id)}
                        className={`w-full py-1.5 text-[11px] rounded-lg font-medium transition-all flex items-center justify-center gap-1 ${
                          g.inLaundry 
                            ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' 
                            : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                        }`}
                      >
                        <WashingMachine className="w-3 h-3" />
                        {g.inLaundry ? 'En Colada' : 'Enviar a Colada'}
                      </button>

                      <button
                        type="button"
                        onClick={() => deleteGarment(g.id, g.name)}
                        className="w-full py-1.5 text-[11px] rounded-lg font-medium bg-rose-500/15 hover:bg-rose-600 text-rose-300 hover:text-white border border-rose-500/30 transition-all flex items-center justify-center gap-1"
                      >
                        <Trash2 className="w-3 h-3" /> Eliminar Prenda
                      </button>
                    </div>
                  </div>
                );
              })}
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
                      <p className="text-[10px] text-slate-400">
                        {GARMENT_TYPES.find(t => t.id === g.subcategory)?.label || g.subcategory || g.category}
                      </p>
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

      {/* Modal para Añadir Prenda con Cámara y Clasificación */}
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

                <input
                  ref={nativeCameraInputRef}
                  type="file"
                  accept="image/*"
                  capture="environment"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </div>

              {/* Nombre de la Prenda */}
              <div className="space-y-1">
                <label className="text-xs font-medium text-slate-300">Nombre de la prenda</label>
                <input
                  type="text"
                  placeholder="Ej. Sudadera Capucha Gris"
                  value={newGarment.name}
                  onChange={(e) => setNewGarment(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-indigo-500"
                  required
                />
              </div>

              {/* Clasificación (Tipo de Prenda) y Color */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-medium text-slate-300">Tipo de prenda</label>
                  <select
                    value={newGarment.subcategory}
                    onChange={(e) => setNewGarment(prev => ({ ...prev, subcategory: e.target.value }))}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-2.5 py-2 text-xs text-slate-100 focus:outline-none focus:border-indigo-500"
                  >
                    {GARMENT_TYPES.map(type => (
                      <option key={type.id} value={type.id}>
                        {type.label}
                      </option>
                    ))}
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
