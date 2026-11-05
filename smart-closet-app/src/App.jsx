import React, { useState, useEffect, useRef, useMemo } from 'react';
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
  History,
  Star,
  ChevronRight,
  CheckCircle2,
  Briefcase,
  Coffee,
  Dumbbell,
  Sun,
  Cloud,
  Snowflake,
  Calendar,
  Search,
  KeyRound,
  Ruler,
  Scale,
  Cake,
  ShoppingBag,
  ShieldCheck,
  Download,
  Footprints,
  Utensils,
  PartyPopper,
  Music,
  Moon,
  Heart,
  CloudRain,
  RotateCcw,
  Eye,
  EyeOff,
  Mail,
  Send,
  AlertCircle,
  Share2
} from 'lucide-react';
import {
  hashPasswordSecure,
  verifyPasswordSecure,
  encryptSensitiveProfile,
  decryptSensitiveProfile
} from './security';
import {
  isFirebaseConfigured,
  registerWithEmail,
  loginWithEmail,
  loginWithGoogle,
  resetPassword,
  resendVerificationEmail,
  logoutFirebase
} from './firebase';

// Clasificaciones detalladas de prendas
const GARMENT_TYPES = [
  { id: 'Camisetas', label: 'Camisetas', singular: 'Camiseta', slot: 'Top', emoji: '👕' },
  { id: 'Camisas', label: 'Camisas', singular: 'Camisa', slot: 'Top', emoji: '👔' },
  { id: 'Sudaderas', label: 'Sudaderas', singular: 'Sudadera', slot: 'Top', emoji: '🧥' },
  { id: 'Jerseys', label: 'Jerseys', singular: 'Jersey', slot: 'Top', emoji: '🧶' },
  { id: 'Pantalones', label: 'Pantalones', singular: 'Pantalón', slot: 'Bottom', emoji: '👖' },
  { id: 'Vaqueros', label: 'Vaqueros', singular: 'Vaquero', slot: 'Bottom', emoji: '👖' },
  { id: 'FaldasShorts', label: 'Bermudas / Faldas', singular: 'Bermuda/Falda', slot: 'Bottom', emoji: '🩳' },
  { id: 'Abrigos', label: 'Abrigos', singular: 'Abrigo', slot: 'Outerwear', emoji: '🧥' },
  { id: 'Blazers', label: 'Blazers', singular: 'Blazer', slot: 'Outerwear', emoji: '🤵' },
  { id: 'Calzado', label: 'Calzado', singular: 'Calzado', slot: 'Footwear', emoji: '👟' }
];

// Paleta rápida de colores para añadir prendas sin teclear
const QUICK_COLORS = [
  { name: 'Negro', hex: '#1e293b' },
  { name: 'Blanco', hex: '#f8fafc', border: true },
  { name: 'Gris', hex: '#94a3b8' },
  { name: 'Beige', hex: '#d6c7b2' },
  { name: 'Azul Marino', hex: '#1e3a8a' },
  { name: 'Azul', hex: '#3b82f6' },
  { name: 'Verde', hex: '#16a34a' },
  { name: 'Burdeos', hex: '#881337' },
  { name: 'Rojo', hex: '#ef4444' },
  { name: 'Marrón', hex: '#78350f' },
  { name: 'Rosa', hex: '#ec4899' },
  { name: 'Amarillo', hex: '#eab308' }
];

const WEEK_DAYS = [
  { id: 'Lun', full: 'Lunes', defaultOccasion: 'Work' },
  { id: 'Mar', full: 'Martes', defaultOccasion: 'Work' },
  { id: 'Mié', full: 'Miércoles', defaultOccasion: 'Work' },
  { id: 'Jue', full: 'Jueves', defaultOccasion: 'Dinner' },
  { id: 'Vie', full: 'Viernes', defaultOccasion: 'Going Out' },
  { id: 'Sáb', full: 'Sábado', defaultOccasion: 'Party' },
  { id: 'Dom', full: 'Domingo', defaultOccasion: 'Walk' }
];

// Helpers de Ficha Morfológica (Edad y Talla Recomendada para Tiendas)
const calculateAgeFromBirthDate = (birthDateStr) => {
  if (!birthDateStr) return null;
  const birth = new Date(birthDateStr);
  if (isNaN(birth.getTime())) return null;
  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const m = today.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
  return age >= 0 && age <= 120 ? age : null;
};

const estimateRecommendedSize = (weightKg, heightCm, gender = 'hombre') => {
  const w = Number(weightKg);
  const h = Number(heightCm);
  if (!w || !h || h < 120 || w < 30) return null;
  const bmi = w / Math.pow(h / 100, 2);

  if (gender === 'mujer') {
    if (bmi < 19.5 && w < 52) return 'XS (EU 34)';
    if (bmi < 22 && w < 60) return 'S (EU 36)';
    if (bmi < 25 && w < 68) return 'M (EU 38-40)';
    if (bmi < 28 && w < 78) return 'L (EU 42)';
    return 'XL (EU 44+)';
  } else {
    if (bmi < 20 && w < 64) return 'XS / S';
    if (bmi < 22.5 && w < 73) return 'S / M';
    if (bmi < 25.5 && w < 84) return 'M / L';
    if (bmi < 28.5 && w < 95) return 'L / XL';
    return 'XL / XXL';
  }
};

const getColorHex = (colorName = '') => {
  const found = QUICK_COLORS.find(c => c.name.toLowerCase() === String(colorName).toLowerCase());
  return found ? found.hex : '#6366f1';
};

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

const analyzeWardrobeGaps = (garmentsList = []) => {
  if (!garmentsList || garmentsList.length === 0) return [];
  const gaps = [];

  const tops = garmentsList.filter(g => getSlotFromType(g.subcategory, g.category) === 'Top');
  const bottoms = garmentsList.filter(g => getSlotFromType(g.subcategory, g.category) === 'Bottom');
  const footwears = garmentsList.filter(g => getSlotFromType(g.subcategory, g.category) === 'Footwear');
  const outerwears = garmentsList.filter(g => getSlotFromType(g.subcategory, g.category) === 'Outerwear');

  // 1. Ratio Tops vs Bottoms (Regla cápsula 2:1)
  if (bottoms.length > 0 && tops.length < bottoms.length * 1.5) {
    gaps.push({
      id: 'top-ratio',
      title: 'Ratio de Partes Superiores',
      tag: 'Básico Cápsula',
      desc: `Tienes ${tops.length} partes superiores para ${bottoms.length} partes inferiores. Añadir 2 o 3 partes de arriba multiplicará las rotaciones sin tener que comprar más pantalones.`
    });
  }

  // 2. Cobertura de Lluvia
  const hasRainWear = garmentsList.some(g =>
    (g.name && (
      g.name.toLowerCase().includes('chubasquero') ||
      g.name.toLowerCase().includes('impermeable') ||
      g.name.toLowerCase().includes('gabardina') ||
      g.name.toLowerCase().includes('técnico') ||
      g.name.toLowerCase().includes('parka')
    )) ||
    g.subcategory === 'coat'
  );
  if (!hasRainWear) {
    gaps.push({
      id: 'rain-wear',
      title: 'Prenda para Lluvia / Impermeable',
      tag: 'Climático',
      desc: 'No dispones de un chubasquero, gabardina o abrigo técnico para cuando llueve o hay previsión de lluvia.'
    });
  }

  // 3. Calzado Formal vs Casual
  const hasFormalShoes = footwears.some(f =>
    f.occasion?.includes('Wedding') ||
    f.occasion?.includes('Elegant Night') ||
    f.occasion?.includes('Dinner') ||
    f.subcategory === 'dress_shoes' ||
    f.subcategory === 'heels' ||
    f.subcategory === 'loafers' ||
    (f.name && (
      f.name.toLowerCase().includes('mocasín') ||
      f.name.toLowerCase().includes('tacón') ||
      f.name.toLowerCase().includes('zapato') ||
      f.name.toLowerCase().includes('oxford') ||
      f.name.toLowerCase().includes('elegante')
    ))
  );
  if (!hasFormalShoes && footwears.length > 0) {
    gaps.push({
      id: 'formal-shoes',
      title: 'Calzado Formal / Vestir',
      tag: 'Eventos & Noche',
      desc: 'Tu calzado actual es principalmente informal. Unos zapatos de vestir, mocasines o tacones abrirán la puerta a looks de Boda, Noche elegante o Cenas.'
    });
  }

  // 4. Calzado Deportivo para Gimnasio
  const hasSportShoes = footwears.some(f =>
    f.occasion?.includes('Gym') ||
    f.subcategory === 'sneakers' ||
    (f.name && (
      f.name.toLowerCase().includes('deportiv') ||
      f.name.toLowerCase().includes('running') ||
      f.name.toLowerCase().includes('gym')
    ))
  );
  if (!hasSportShoes && footwears.length > 0) {
    gaps.push({
      id: 'sport-shoes',
      title: 'Zapatillas de Entrenamiento / Gym',
      tag: 'Gimnasio & Sport',
      desc: 'No tienes calzado asignado a la ocasión Gimnasio o entrenamientos activos.'
    });
  }

  // 5. Camisa o Blusa Versátil
  const hasFormalTop = tops.some(t =>
    t.subcategory === 'shirt' ||
    t.subcategory === 'blouse' ||
    (t.name && (
      t.name.toLowerCase().includes('camisa') ||
      t.name.toLowerCase().includes('blusa')
    ))
  );
  if (!hasFormalTop && tops.length > 0) {
    gaps.push({
      id: 'formal-top',
      title: 'Camisa o Blusa de Fondo de Armario',
      tag: 'Fondo de Armario',
      desc: 'Una camisa de lino o algodón blanca o azul añade sofisticación instantánea tanto para Trabajo como para Cenar o Salir.'
    });
  }

  // 6. Prenda de Capas / Abrigo Estructurada
  if (outerwears.length === 0) {
    gaps.push({
      id: 'outerwear-missing',
      title: 'Prenda de Abrigo (Blazer o Cazadora)',
      tag: 'Estructura & Capas',
      desc: 'No tienes prendas de abrigo registradas. Incorporar un blazer, sobrecamisa o chaqueta de entretiempo eleva cualquier look básico.'
    });
  }

  return gaps;
};

// Datos iniciales de ejemplo con multietiquetado enriquecido para todas las ocasiones
const INITIAL_GARMENTS = [
  {
    id: '1',
    name: 'Blazer Entallada Negra',
    category: 'Outerwear',
    subcategory: 'Blazers',
    occasion: ['Work', 'Dinner', 'Elegant Night', 'Wedding', 'Going Out'],
    warmth: 3,
    comfort: 3,
    color: 'Negro',
    price: 89,
    wearCount: 6,
    inLaundry: false,
    image: 'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=400&auto=format&fit=crop&q=80'
  },
  {
    id: '2',
    name: 'Camiseta Algodón Blanca',
    category: 'Top',
    subcategory: 'Camisetas',
    occasion: ['Work', 'Walk', 'Going Out', 'Dinner', 'Festival', 'Gym'],
    warmth: 1,
    comfort: 5,
    color: 'Blanco',
    price: 22,
    wearCount: 14,
    inLaundry: false,
    image: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=400&auto=format&fit=crop&q=80'
  },
  {
    id: '3',
    name: 'Pantalón Chino Beige',
    category: 'Bottom',
    subcategory: 'Pantalones',
    occasion: ['Work', 'Walk', 'Going Out', 'Dinner', 'Elegant Night', 'Wedding'],
    warmth: 2,
    comfort: 4,
    color: 'Beige',
    price: 49,
    wearCount: 8,
    inLaundry: false,
    image: 'https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?w=400&auto=format&fit=crop&q=80'
  },
  {
    id: '4',
    name: 'Zapatillas Blancas Cuero',
    category: 'Footwear',
    subcategory: 'Calzado',
    occasion: ['Work', 'Walk', 'Going Out', 'Party', 'Festival', 'Gym'],
    warmth: 2,
    comfort: 5,
    color: 'Blanco',
    price: 79,
    wearCount: 18,
    inLaundry: false,
    image: 'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=400&auto=format&fit=crop&q=80'
  },
  {
    id: '5',
    name: 'Chubasquero Técnico Azul',
    category: 'Outerwear',
    subcategory: 'Abrigos',
    occasion: ['Work', 'Walk', 'Going Out', 'Festival', 'Gym'],
    warmth: 4,
    comfort: 4,
    color: 'Azul Marino',
    price: 69,
    wearCount: 4,
    inLaundry: false,
    image: 'https://images.unsplash.com/photo-1544441893-675973e31985?w=400&auto=format&fit=crop&q=80'
  },
  {
    id: '6',
    name: 'Sudadera Gris Capucha',
    category: 'Top',
    subcategory: 'Sudaderas',
    occasion: ['Walk', 'Going Out', 'Gym', 'Festival'],
    warmth: 4,
    comfort: 5,
    color: 'Gris',
    price: 45,
    wearCount: 5,
    inLaundry: false,
    image: 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=400&auto=format&fit=crop&q=80'
  },
  {
    id: '7',
    name: 'Jersey Punto Burdeos',
    category: 'Top',
    subcategory: 'Jerseys',
    occasion: ['Work', 'Walk', 'Going Out', 'Dinner', 'Elegant Night'],
    warmth: 4,
    comfort: 4,
    color: 'Burdeos',
    price: 55,
    wearCount: 0,
    inLaundry: false,
    image: 'https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?w=400&auto=format&fit=crop&q=80'
  }
];

// Opciones completas de Look y Planes (Multietiqueta)
const OCCASIONS = [
  { id: 'Work', label: 'Trabajo', emoji: '💼', icon: Briefcase },
  { id: 'Walk', label: 'Paseo', emoji: '🚶', icon: Footprints },
  { id: 'Going Out', label: 'Salir', emoji: '☕', icon: Coffee },
  { id: 'Dinner', label: 'Cenar', emoji: '🍽️', icon: Utensils },
  { id: 'Party', label: 'Fiesta', emoji: '🎉', icon: PartyPopper },
  { id: 'Festival', label: 'Festival', emoji: '🎪', icon: Music },
  { id: 'Elegant Night', label: 'Noche elegante', emoji: '🌙', icon: Moon },
  { id: 'Wedding', label: 'Boda', emoji: '💍', icon: Heart },
  { id: 'Gym', label: 'Gimnasio', emoji: '🏋️', icon: Dumbbell }
];

const WARMTH_LEVELS = [
  { value: 1, label: 'Calor', desc: 'Ropa fresca', icon: Sun },
  { value: 3, label: 'Templado', desc: 'Entretiempo', icon: Cloud },
  { value: 5, label: 'Frío', desc: 'Bien abrigado', icon: Snowflake }
];

const FEEDBACK_REASONS = [
  { id: 'colors', label: '🎨 No pegan los colores' },
  { id: 'too_cold', label: '🥶 Pasaría frío' },
  { id: 'too_warm', label: '🥵 Pasaría calor' },
  { id: 'wrong_style', label: '👔 No encaja hoy' },
  { id: 'dislike_combo', label: '👎 No me gusta junto' }
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
  const [savedUsers, setSavedUsers] = useState([]);
  const [authMode, setAuthMode] = useState('login');
  const [authUsername, setAuthUsername] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [authPasswordConfirm, setAuthPasswordConfirm] = useState('');
  const [authEmail, setAuthEmail] = useState('');
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotMsg, setForgotMsg] = useState('');
  const [authLoading, setAuthLoading] = useState(false);
  const [emailNotice, setEmailNotice] = useState('');
  const [showAuthPassword, setShowAuthPassword] = useState(false);
  const [authName, setAuthName] = useState('');
  const [authGender, setAuthGender] = useState('hombre'); // 'hombre' | 'mujer'
  const [authBirthDate, setAuthBirthDate] = useState('');
  const [authHeight, setAuthHeight] = useState('');
  const [authWeight, setAuthWeight] = useState('');
  const [includeSampleCloset, setIncludeSampleCloset] = useState(true);
  const [authError, setAuthError] = useState('');
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [requirePinOnQuickLogin, setRequirePinOnQuickLogin] = useState(false);

  // --- Navegación, Armario y Filtro ---
  const [activeTab, setActiveTab] = useState('generator');
  const [garments, setGarments] = useState([]);
  const [selectedFilter, setSelectedFilter] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [seasonFilterActive, setSeasonFilterActive] = useState(false);
  const [editingPriceId, setEditingPriceId] = useState(null);
  const [editingPriceVal, setEditingPriceVal] = useState('');

  // --- Calendario / Planificador Semanal ---
  const [weeklyPlan, setWeeklyPlan] = useState({});
  const [selectedDay, setSelectedDay] = useState(() => {
    const dayIndex = new Date().getDay(); // 0 Dom, 1 Lun...
    const map = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
    return map[dayIndex] || 'Lun';
  });

  // --- Autodetección IA de Prendas por Foto y Modo Estudio ---
  const [analyzingPhoto, setAnalyzingPhoto] = useState(false);
  const [aiVisionBadge, setAiVisionBadge] = useState('');
  const [studioCutoutMode, setStudioCutoutMode] = useState(true);
  const [showApiKeyInput, setShowApiKeyInput] = useState(false);
  const [geminiApiKey, setGeminiApiKey] = useState(() => {
    try {
      return localStorage.getItem('smart_closet_gemini_api_key') || import.meta.env.VITE_GEMINI_API_KEY || '';
    } catch {
      return '';
    }
  });

  // --- Prenda Ancla ("Pin & Build Outfit"), Briefing Matutino y Maleta de Viaje (Pestaña "Viaje") ---
  const [lockedGarment, setLockedGarment] = useState(null);
  const [morningBriefingMsg, setMorningBriefingMsg] = useState('');
  const morningLoadedUserRef = useRef('');
  const [tripName, setTripName] = useState('');
  const [tripDays, setTripDays] = useState(3);
  const [tripOccasion, setTripOccasion] = useState('Going Out');
  const [tripWarmth, setTripWarmth] = useState(3);
  const [tripIsRaining, setTripIsRaining] = useState(false);
  const [capsuleItems, setCapsuleItems] = useState([]);
  const [packedItemIds, setPackedItemIds] = useState([]);
  const isTravelLoadedRef = useRef(false);
  const [laundryRescueData, setLaundryRescueData] = useState(null);
  const [showWardrobeGaps, setShowWardrobeGaps] = useState(false);

  // --- Historial de Feedback del Usuario ---
  const [feedbackHistory, setFeedbackHistory] = useState([]);
  const [showRejectPanel, setShowRejectPanel] = useState(false);
  const [selectedReasons, setSelectedReasons] = useState(['dislike_combo']);
  const [customFeedbackText, setCustomFeedbackText] = useState('');
  const [outfitRating, setOutfitRating] = useState(8);
  const [toastMsg, setToastMsg] = useState('');
  const toastTimeoutRef = useRef(null);

  const showToast = (msg) => {
    setToastMsg(msg);
    if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
    toastTimeoutRef.current = setTimeout(() => setToastMsg(''), 3200);
  };

  // Rehidratar y descifrar bóveda AES-256 en memoria si la sesión persistida está cifrada
  useEffect(() => {
    let active = true;
    const rehydrateEncryptedSession = async () => {
      if (!currentUser?.username) return;
      if (currentUser.encryptedVault && !currentUser._decryptedInMemory) {
        const decrypted = await decryptSensitiveProfile(currentUser.username, currentUser.encryptedVault);
        if (!active) return;
        setCurrentUser(prev =>
          prev
            ? {
                ...prev,
                gender: decrypted.gender || prev.gender || 'hombre',
                birthDate: decrypted.birthDate || '',
                heightCm: decrypted.heightCm ?? '',
                weightKg: decrypted.weightKg ?? '',
                _decryptedInMemory: true
              }
            : null
        );
      }
    };
    rehydrateEncryptedSession();
    return () => {
      active = false;
    };
  }, [currentUser?.username]);

  // Cargar lista de usuarios registrados
  useEffect(() => {
    try {
      const raw = localStorage.getItem('smart_closet_users');
      setSavedUsers(raw ? JSON.parse(raw) : []);
    } catch {
      setSavedUsers([]);
    }
  }, [currentUser?.username]);

  // Cargar el armario, el feedback y el plan semanal específico del usuario cuando inicia sesión
  useEffect(() => {
    if (!currentUser?.username) {
      setGarments([]);
      setFeedbackHistory([]);
      setWeeklyPlan({});
      setTripName('');
      setTripDays(3);
      setTripOccasion('Going Out');
      setTripWarmth(3);
      setTripIsRaining(false);
      setCapsuleItems([]);
      setPackedItemIds([]);
      isTravelLoadedRef.current = false;
      return;
    }
    const closetKey = `smart_closet_garments_${currentUser.username}`;
    const feedbackKey = `smart_closet_feedback_${currentUser.username}`;
    const plannerKey = `smart_closet_planner_${currentUser.username}`;
    const travelKey = `smart_closet_travel_${currentUser.username}`;

    try {
      const savedGarments = localStorage.getItem(closetKey);
      if (savedGarments) {
        const parsed = JSON.parse(savedGarments).map(g => ({
          ...g,
          wearCount: Number(g.wearCount) || 0,
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

      const savedPlan = localStorage.getItem(plannerKey);
      setWeeklyPlan(savedPlan ? JSON.parse(savedPlan) : {});

      const savedTravel = localStorage.getItem(travelKey);
      if (savedTravel) {
        const parsedT = JSON.parse(savedTravel);
        if (typeof parsedT.tripName === 'string') setTripName(parsedT.tripName);
        if (Number(parsedT.tripDays)) setTripDays(Number(parsedT.tripDays));
        if (parsedT.tripOccasion) setTripOccasion(parsedT.tripOccasion);
        if (Number(parsedT.tripWarmth)) setTripWarmth(Number(parsedT.tripWarmth));
        if (typeof parsedT.tripIsRaining === 'boolean') setTripIsRaining(parsedT.tripIsRaining);
        if (Array.isArray(parsedT.capsuleItems)) setCapsuleItems(parsedT.capsuleItems);
        if (Array.isArray(parsedT.packedItemIds)) setPackedItemIds(parsedT.packedItemIds);
      } else {
        setTripName('');
        setTripDays(3);
        setTripOccasion('Going Out');
        setTripWarmth(3);
        setTripIsRaining(false);
        setCapsuleItems([]);
        setPackedItemIds([]);
      }
      isTravelLoadedRef.current = true;
    } catch (e) {
      console.error('Error al cargar datos del usuario:', e);
      setGarments(INITIAL_GARMENTS);
    }
  }, [currentUser?.username]);

  // Guardar maleta de viaje del usuario actual en tiempo real
  useEffect(() => {
    if (!currentUser?.username || !isTravelLoadedRef.current) return;
    try {
      const travelKey = `smart_closet_travel_${currentUser.username}`;
      const payload = {
        tripName,
        tripDays,
        tripOccasion,
        tripWarmth,
        tripIsRaining,
        capsuleItems,
        packedItemIds
      };
      localStorage.setItem(travelKey, JSON.stringify(payload));
    } catch (e) {
      console.error('Error guardando maleta en localStorage:', e);
    }
  }, [currentUser?.username, tripName, tripDays, tripOccasion, tripWarmth, tripIsRaining, capsuleItems, packedItemIds]);

  // Guardar plan semanal del usuario actual
  const updateUserPlanner = (newPlan) => {
    setWeeklyPlan(newPlan);
    if (currentUser) {
      try {
        localStorage.setItem(
          `smart_closet_planner_${currentUser.username}`,
          JSON.stringify(newPlan)
        );
      } catch (e) {
        console.error('Error al guardar plan semanal:', e);
      }
    }
  };

  const handleSaveGeminiKey = (val) => {
    setGeminiApiKey(val);
    try {
      localStorage.setItem('smart_closet_gemini_api_key', val.trim());
    } catch (e) {
      console.error('Error guardando API key:', e);
    }
  };

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
        showToast('Espacio de almacenamiento lleno. Intenta borrar alguna prenda antigua.');
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
    occasion: ['Work', 'Going Out'],
    warmth: 3,
    comfort: 4,
    color: 'Negro',
    price: '',
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
        if (t < 13) {
          setDesiredWarmth(5);
          setTripWarmth(5);
        } else if (t < 21) {
          setDesiredWarmth(3);
          setTripWarmth(3);
        } else {
          setDesiredWarmth(1);
          setTripWarmth(1);
        }
      }
    } catch (e) {
      console.error("Error al obtener clima:", e);
    }
  };

  useEffect(() => {
    fetchWeather();
    return () => {
      stopCamera();
      if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
    };
  }, []);

  useEffect(() => {
    if (!showAddModal) {
      stopCamera();
    }
  }, [showAddModal]);

  const persistEncryptedSessionUser = (userPayload) => {
    try {
      const safeStorageSession = {
        username: userPayload.username,
        name: userPayload.name,
        encryptedVault: userPayload.encryptedVault || '',
        requirePinOnQuickLogin: Boolean(userPayload.requirePinOnQuickLogin),
        encrypted: true
      };
      localStorage.setItem('smart_closet_current_user', JSON.stringify(safeStorageSession));
    } catch (e) {
      console.error('Error al persistir sesión cifrada:', e);
    }
  };

  // --- Funciones de Autenticación ---
  const getUsers = () => {
    try {
      const raw = localStorage.getItem('smart_closet_users');
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  };

  const quickLoginUser = async (userObj) => {
    // Si el usuario tiene contraseña o activó protección en acceso rápido, pedir contraseña
    if (userObj.requirePinOnQuickLogin && (userObj.passwordHash || userObj.password)) {
      setAuthMode('login');
      setAuthPasswordConfirm('');
      setAuthUsername(userObj.username);
      setAuthError('Por tu seguridad, introduce tu contraseña para desbloquear tu perfil.');
      return;
    }

    let sensitive = {};
    let vault = userObj.encryptedVault;
    if (vault) {
      sensitive = await decryptSensitiveProfile(userObj.username, vault);
    } else {
      vault = await encryptSensitiveProfile(userObj.username, {
        gender: userObj.gender || 'hombre',
        birthDate: userObj.birthDate || '',
        heightCm: userObj.heightCm ?? '',
        weightKg: userObj.weightKg ?? ''
      });
    }

    const sessionUser = {
      username: userObj.username,
      name: userObj.name,
      encryptedVault: vault,
      gender: sensitive.gender || userObj.gender || 'hombre',
      birthDate: sensitive.birthDate || userObj.birthDate || '',
      heightCm: sensitive.heightCm ?? userObj.heightCm ?? '',
      weightKg: sensitive.weightKg ?? userObj.weightKg ?? '',
      requirePinOnQuickLogin: Boolean(userObj.requirePinOnQuickLogin),
      encrypted: true,
      _decryptedInMemory: true
    };
    persistEncryptedSessionUser(sessionUser);
    setCurrentUser(sessionUser);
    setCurrentOutfit(null);
    setLockedGarment(null);
  };

  const handleUpdateUserProfile = async (e) => {
    e.preventDefault();
    if (!currentUser) return;
    const encryptedVault = await encryptSensitiveProfile(currentUser.username, {
      gender: currentUser.gender || 'hombre',
      birthDate: currentUser.birthDate || '',
      heightCm: currentUser.heightCm || '',
      weightKg: currentUser.weightKg || ''
    });

    const users = getUsers();
    const updatedUsers = users.map(u => {
      if (u.username !== currentUser.username) return u;
      const copy = {
        ...u,
        name: currentUser.name,
        encryptedVault,
        requirePinOnQuickLogin: Boolean(currentUser.requirePinOnQuickLogin)
      };
      // Eliminar campos sensibles en texto plano del almacenamiento general
      delete copy.birthDate;
      delete copy.heightCm;
      delete copy.weightKg;
      return copy;
    });

    try {
      localStorage.setItem('smart_closet_users', JSON.stringify(updatedUsers));
    } catch (err) {
      console.error('Error guardando usuarios:', err);
    }
    const updatedSession = {
      ...currentUser,
      encryptedVault,
      encrypted: true,
      _decryptedInMemory: true
    };
    persistEncryptedSessionUser(updatedSession);
    setCurrentUser(updatedSession);
    setSavedUsers(updatedUsers);
    setShowProfileModal(false);
    showToast('Perfil actualizado correctamente');
  };

  const handleExportUserData = () => {
    if (!currentUser) return;
    const exportPayload = {
      exportedAt: new Date().toISOString(),
      security: 'AES-GCM-256 & PBKDF2-SHA256',
      profile: currentUser,
      garments,
      weeklyPlan,
      feedbackHistory
    };
    const blob = new Blob([JSON.stringify(exportPayload, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `smart_closet_backup_${currentUser.username}.json`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('Copia de seguridad descargada');
  };

  const handleDeleteUserAccountPermanently = () => {
    if (!currentUser) return;
    const confirmDelete = window.confirm(
      `¿Seguro que deseas eliminar permanentemente la cuenta de "${currentUser.name}" y borrar todas sus fotos, prendas y datos biométricos de este dispositivo? Esta acción no se puede deshacer.`
    );
    if (!confirmDelete) return;

    const uName = currentUser.username;
    try {
      localStorage.removeItem(`smart_closet_garments_${uName}`);
      localStorage.removeItem(`smart_closet_feedback_${uName}`);
      localStorage.removeItem(`smart_closet_planner_${uName}`);
      localStorage.removeItem(`smart_closet_travel_${uName}`);
      localStorage.removeItem(`smart_closet_salt_${uName}`);
      localStorage.removeItem('smart_closet_current_user');

      const remainingUsers = getUsers().filter(u => u.username !== uName);
      localStorage.setItem('smart_closet_users', JSON.stringify(remainingUsers));
      setSavedUsers(remainingUsers);
    } catch (err) {
      console.error('Error eliminando datos:', err);
    }
    setShowProfileModal(false);
    setCurrentUser(null);
    setCurrentOutfit(null);
    setLockedGarment(null);
  };

  const handleAuthSubmit = async (e) => {
    e.preventDefault();
    setAuthError('');
    const usernameClean = authUsername.trim().toLowerCase();

    if (!usernameClean) {
      setAuthError('Introduce tu nombre de usuario.');
      return;
    }

    const users = getUsers();

    if (authMode === 'register') {
      if (users.some(u => u.username === usernameClean)) {
        setAuthError('Ese usuario ya existe. Selecciónalo arriba o inicia sesión.');
        return;
      }
      if (!authPassword || authPassword.trim().length < 4) {
        setAuthError('Por seguridad, crea una contraseña de al menos 4 caracteres para cifrar tus datos.');
        return;
      }
      if (authPassword !== authPasswordConfirm) {
        setAuthError('Las contraseñas no coinciden. Revísalas antes de crear tu armario.');
        return;
      }

      // Si Firebase está configurado y hay correo, registrar en Firebase y mandar correo de confirmación
      let firebaseUid = '';
      if (isFirebaseConfigured() && authEmail.trim()) {
        try {
          setAuthLoading(true);
          const fbUser = await registerWithEmail(authEmail.trim(), authPassword, authName.trim() || authUsername.trim());
          firebaseUid = fbUser?.uid || '';
          setEmailNotice(`Te hemos enviado un correo de confirmación a ${fbUser.email}. Revisa tu bandeja de entrada o spam.`);
          showToast('¡Cuenta creada! Revisa tu correo');
        } catch (fbErr) {
          console.error('Error Firebase register:', fbErr);
          if (fbErr.code === 'auth/email-already-in-use') {
            setAuthError('Ese correo ya está registrado en Firebase. Inicia sesión o recupera tu contraseña.');
            setAuthLoading(false);
            return;
          } else if (fbErr.code === 'auth/weak-password') {
            setAuthError('Por seguridad del servidor, la contraseña debe tener al menos 6 caracteres.');
            setAuthLoading(false);
            return;
          } else if (fbErr.code === 'auth/invalid-email') {
            setAuthError('El formato del correo electrónico no es válido.');
            setAuthLoading(false);
            return;
          }
        } finally {
          setAuthLoading(false);
        }
      }

      const passwordHash = await hashPasswordSecure(authPassword, usernameClean);
      const sensitiveData = {
        gender: authGender || 'hombre',
        birthDate: authBirthDate,
        heightCm: authHeight ? Number(authHeight) : '',
        weightKg: authWeight ? Number(authWeight) : ''
      };
      const encryptedVault = await encryptSensitiveProfile(usernameClean, sensitiveData);

      const newUser = {
        username: usernameClean,
        name: authName.trim() || authUsername.trim(),
        email: authEmail.trim(),
        uid: firebaseUid,
        passwordHash,
        encryptedVault,
        requirePinOnQuickLogin,
        createdAt: new Date().toISOString()
      };
      const updated = [...users, newUser];
      try {
        localStorage.setItem('smart_closet_users', JSON.stringify(updated));
      } catch (err) {
        console.error('Error guardando nuevo usuario:', err);
        setAuthError('No se ha podido guardar tu cuenta en este dispositivo: el almacenamiento está lleno. Libera espacio (borra prendas o cuentas antiguas) e inténtalo de nuevo.');
        return;
      }
      try {
        const initialCloset = includeSampleCloset ? INITIAL_GARMENTS : [];
        localStorage.setItem(`smart_closet_garments_${usernameClean}`, JSON.stringify(initialCloset));
      } catch (err) {
        console.warn('No se pudo guardar el armario inicial del nuevo usuario:', err);
      }
      setSavedUsers(updated);
      
      const sessionUser = {
        username: newUser.username,
        name: newUser.name,
        email: newUser.email || '',
        uid: newUser.uid || '',
        encryptedVault,
        ...sensitiveData,
        requirePinOnQuickLogin,
        encrypted: true,
        _decryptedInMemory: true
      };
      persistEncryptedSessionUser(sessionUser);
      setCurrentUser(sessionUser);
      setCurrentOutfit(null);
      setLockedGarment(null);
      setAuthPassword('');
      setAuthPasswordConfirm('');
      setAuthEmail('');
      setShowAuthPassword(false);
    } else {
      if (isFirebaseConfigured() && (authEmail.trim() || usernameClean.includes('@'))) {
        const loginTargetEmail = authEmail.trim() || usernameClean;
        try {
          setAuthLoading(true);
          await loginWithEmail(loginTargetEmail, authPassword);
        } catch (fbErr) {
          console.error('Error Firebase login:', fbErr);
          if (fbErr.code === 'auth/invalid-credential' || fbErr.code === 'auth/wrong-password' || fbErr.code === 'auth/user-not-found') {
            setAuthError('Correo o contraseña incorrectos.');
            setAuthLoading(false);
            return;
          }
        } finally {
          setAuthLoading(false);
        }
      }

      const found = users.find(u => u.username === usernameClean || (u.email && u.email.toLowerCase() === usernameClean));
      if (!found) {
        setAuthError('Usuario no encontrado. ¿Quieres crear una cuenta nueva?');
        return;
      }
      if ((found.passwordHash || found.password) && !authPassword) {
        setAuthError('Introduce tu contraseña.');
        return;
      }
      const isValid = await verifyPasswordSecure(authPassword, found);
      if (!isValid) {
        setAuthError('Contraseña incorrecta. Tus datos están protegidos.');
        return;
      }

      // Si era una cuenta antigua sin hash PBKDF2 o sin bóveda AES-GCM, migrarla automáticamente
      if (!found.passwordHash && authPassword) {
        found.passwordHash = await hashPasswordSecure(authPassword, found.username);
        delete found.password;
      }
      if (!found.encryptedVault) {
        found.encryptedVault = await encryptSensitiveProfile(found.username, {
          gender: found.gender || 'hombre',
          birthDate: found.birthDate || '',
          heightCm: found.heightCm || '',
          weightKg: found.weightKg || ''
        });
        delete found.birthDate;
        delete found.heightCm;
        delete found.weightKg;
      }
      const updatedUsers = users.map(u => (u.username === found.username ? found : u));
      try {
        localStorage.setItem('smart_closet_users', JSON.stringify(updatedUsers));
      } catch (err) {
        console.error('Error actualizando usuario:', err);
      }
      setSavedUsers(updatedUsers);

      const decrypted = await decryptSensitiveProfile(found.username, found.encryptedVault);
      const sessionUser = {
        username: found.username,
        name: found.name,
        encryptedVault: found.encryptedVault,
        gender: decrypted.gender || found.gender || 'hombre',
        birthDate: decrypted.birthDate || found.birthDate || '',
        heightCm: decrypted.heightCm ?? found.heightCm ?? '',
        weightKg: decrypted.weightKg ?? found.weightKg ?? '',
        requirePinOnQuickLogin: Boolean(found.requirePinOnQuickLogin),
        encrypted: true,
        _decryptedInMemory: true
      };
      persistEncryptedSessionUser(sessionUser);
      setCurrentUser(sessionUser);
      setCurrentOutfit(null);
      setLockedGarment(null);
      setAuthPassword('');
      setAuthPasswordConfirm('');
      setAuthEmail('');
      setShowAuthPassword(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setAuthError('');
    try {
      setAuthLoading(true);
      const gUser = await loginWithGoogle();
      const email = gUser.email || '';
      const name = gUser.displayName || email.split('@')[0] || 'Usuario';
      const usernameClean = (email.split('@')[0] || gUser.uid.slice(0, 8)).toLowerCase().replace(/[^a-z0-9_]/g, '');

      const users = getUsers();
      let found = users.find(u => u.username === usernameClean || (u.email && u.email.toLowerCase() === email.toLowerCase()));
      if (!found) {
        const sensitiveData = {
          gender: 'hombre',
          birthDate: '',
          heightCm: '',
          weightKg: ''
        };
        const encryptedVault = await encryptSensitiveProfile(usernameClean, sensitiveData);
        found = {
          username: usernameClean,
          name,
          email,
          uid: gUser.uid,
          photoURL: gUser.photoURL || '',
          encryptedVault,
          createdAt: new Date().toISOString()
        };
        const updated = [...users, found];
        localStorage.setItem('smart_closet_users', JSON.stringify(updated));
        const initialCloset = INITIAL_GARMENTS;
        localStorage.setItem(`smart_closet_garments_${usernameClean}`, JSON.stringify(initialCloset));
        setSavedUsers(updated);
      }

      const sessionUser = {
        username: found.username,
        name: found.name,
        email,
        uid: gUser.uid,
        photoURL: gUser.photoURL || '',
        encryptedVault: found.encryptedVault,
        gender: found.gender || 'hombre',
        birthDate: found.birthDate || '',
        heightCm: found.heightCm ?? '',
        weightKg: found.weightKg ?? '',
        encrypted: true,
        _decryptedInMemory: true
      };
      persistEncryptedSessionUser(sessionUser);
      setCurrentUser(sessionUser);
      setCurrentOutfit(null);
      setLockedGarment(null);
      showToast(`¡Bienvenido, ${name}!`);
    } catch (err) {
      console.error('Error Google Sign-In:', err);
      if (err.code !== 'auth/popup-closed-by-user') {
        setAuthError('No se pudo iniciar sesión con Google. Inténtalo de nuevo.');
      }
    } finally {
      setAuthLoading(false);
    }
  };

  const handleSendResetPassword = async (e) => {
    e.preventDefault();
    setForgotMsg('');
    if (!forgotEmail.trim()) {
      setForgotMsg('Introduce tu correo electrónico.');
      return;
    }
    try {
      await resetPassword(forgotEmail.trim());
      setForgotMsg('¡Correo enviado! Revisa tu bandeja de entrada o spam para restablecer tu contraseña.');
    } catch (err) {
      console.error('Error reset password:', err);
      setForgotMsg('No se pudo enviar el correo. Comprueba que la dirección esté registrada.');
    }
  };

  const handleLogout = async () => {
    stopCamera();
    try {
      await logoutFirebase();
    } catch {}
    try {
      localStorage.removeItem('smart_closet_current_user');
    } catch {}
    setCurrentUser(null);
    setCurrentOutfit(null);
    setLockedGarment(null);
    setAuthUsername('');
    setAuthPassword('');
    setAuthPasswordConfirm('');
    setAuthEmail('');
    setShowAuthPassword(false);
    setAuthError('');
  };

  // --- Funciones de Cámara y Fotografía ---
  const startCamera = async (mode = facingMode) => {
    setCameraError('');
    stopCamera();

    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setCameraError('Usa el botón "Móvil / Galería" para hacer la foto directamente.');
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
      setCameraError('No se pudo abrir la cámara en vivo. Pulsa en "Móvil / Galería".');
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

  // --- Motor Dual de Visión IA (Gemini Vision API + Visión Local Cromática en Canvas) ---
  const mapRgbToClosetColor = (r, g, b) => {
    const rNorm = r / 255, gNorm = g / 255, bNorm = b / 255;
    const max = Math.max(rNorm, gNorm, bNorm), min = Math.min(rNorm, gNorm, bNorm);
    const l = (max + min) / 2;
    let h = 0, s = 0;

    if (max !== min) {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      switch (max) {
        case rNorm: h = ((gNorm - bNorm) / d + (gNorm < bNorm ? 6 : 0)) * 60; break;
        case gNorm: h = ((bNorm - rNorm) / d + 2) * 60; break;
        case bNorm: h = ((rNorm - gNorm) / d + 4) * 60; break;
      }
    }

    if (l < 0.18) return 'Negro';
    if (l > 0.84 && s < 0.22) return 'Blanco';
    if (s < 0.14) return l < 0.32 ? 'Negro' : l > 0.80 ? 'Blanco' : 'Gris';

    if (h >= 18 && h <= 48 && s < 0.48 && l >= 0.55) return 'Beige';
    if (h >= 12 && h <= 42 && l < 0.42) return 'Marrón';

    if (h >= 345 || h < 12) return l < 0.35 ? 'Burdeos' : 'Rojo';
    if (h >= 12 && h < 42) return l > 0.65 ? 'Beige' : 'Marrón';
    if (h >= 42 && h < 70) return l > 0.60 && s < 0.45 ? 'Beige' : 'Amarillo';
    if (h >= 70 && h < 168) return 'Verde';
    if (h >= 168 && h < 260) return l < 0.32 ? 'Azul Marino' : 'Azul';
    if (h >= 260 && h < 345) return l < 0.34 ? 'Burdeos' : 'Rosa';

    return 'Gris';
  };

  const extractDominantGarmentFeatures = (dataUrl) => {
    return new Promise((resolve) => {
      const img = new Image();
      img.crossOrigin = 'Anonymous';
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const size = 120;
        canvas.width = size;
        canvas.height = size;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, size, size);

        const start = Math.floor(size * 0.275);
        const regionSize = Math.floor(size * 0.45);
        const { data } = ctx.getImageData(start, start, regionSize, regionSize);

        const colorCounts = {};
        let count = 0;

        for (let i = 0; i < data.length; i += 16) {
          const r = data[i], g = data[i + 1], b = data[i + 2], a = data[i + 3];
          if (a < 128) continue;
          const mapped = mapRgbToClosetColor(r, g, b);
          colorCounts[mapped] = (colorCounts[mapped] || 0) + 1;
          count++;
        }

        const sortedColors = Object.entries(colorCounts).sort((a, b) => b[1] - a[1]);
        let dominantColor = sortedColors[0]?.[0] || 'Negro';
        if (
          (dominantColor === 'Blanco' || dominantColor === 'Gris') &&
          sortedColors[1] &&
          sortedColors[1][1] > count * 0.25
        ) {
          dominantColor = sortedColors[1][0];
        }

        resolve({ dominantColor });
      };
      img.onerror = () => resolve({ dominantColor: 'Negro' });
      img.src = dataUrl;
    });
  };

  const buildCoherentGarmentDefaults = (subcategory, color) => {
    const presetMap = {
      Camisetas:    { warmth: 1, occasion: ['Walk', 'Going Out', 'Gym', 'Festival'], adj: 'Básica' },
      Camisas:      { warmth: 3, occasion: ['Work', 'Dinner', 'Going Out', 'Elegant Night'], adj: 'Clásica' },
      Sudaderas:    { warmth: 5, occasion: ['Walk', 'Going Out', 'Gym', 'Festival'], adj: 'Confort' },
      Jerseys:      { warmth: 4, occasion: ['Work', 'Walk', 'Dinner', 'Going Out'], adj: 'de Punto' },
      Pantalones:   { warmth: 3, occasion: ['Work', 'Dinner', 'Going Out', 'Elegant Night'], adj: 'Chino' },
      Vaqueros:     { warmth: 3, occasion: ['Going Out', 'Walk', 'Work', 'Dinner', 'Party', 'Festival'], adj: 'Denim' },
      FaldasShorts: { warmth: 1, occasion: ['Going Out', 'Party', 'Festival', 'Walk'], adj: 'Casual' },
      Abrigos:      { warmth: 5, occasion: ['Work', 'Walk', 'Dinner', 'Going Out', 'Elegant Night'], adj: 'Térmico' },
      Blazers:      { warmth: 3, occasion: ['Work', 'Dinner', 'Elegant Night', 'Wedding'], adj: 'Entallada' },
      Calzado:      { warmth: 3, occasion: ['Work', 'Walk', 'Going Out', 'Dinner', 'Party', 'Gym'], adj: 'Urbano' }
    };
    const typeObj = GARMENT_TYPES.find(t => t.id === subcategory) || GARMENT_TYPES[0];
    const preset = presetMap[typeObj.id] || presetMap.Camisetas;
    return {
      subcategory: typeObj.id,
      color,
      warmth: preset.warmth,
      occasion: preset.occasion,
      name: `${typeObj.singular} ${preset.adj} ${color}`.trim()
    };
  };

  const analyzeGarmentImageWithAI = async (dataUrl, currentSubcat = 'Camisetas') => {
    if (!dataUrl) return;
    setAnalyzingPhoto(true);
    setAiVisionBadge('Analizando prenda con IA...');

    const { dominantColor } = await extractDominantGarmentFeatures(dataUrl);
    const localSuggestion = buildCoherentGarmentDefaults(currentSubcat, dominantColor);

    const activeKey = (geminiApiKey || import.meta.env.VITE_GEMINI_API_KEY || '').trim();

    if (!activeKey) {
      setNewGarment(prev => ({
        ...prev,
        image: dataUrl,
        color: localSuggestion.color,
        warmth: localSuggestion.warmth,
        occasion: localSuggestion.occasion,
        name: localSuggestion.name
      }));
      setAiVisionBadge(`✨ Detectado: ${localSuggestion.name} (IA Local)`);
      setAnalyzingPhoto(false);
      return;
    }

    try {
      const { GoogleGenerativeAI } = await import('@google/generative-ai');
      const genAI = new GoogleGenerativeAI(activeKey);
      const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

      const base64Data = dataUrl.split(',')[1];
      const prompt = `Analiza esta foto de una prenda de ropa y devuelve EXCLUSIVAMENTE un JSON válido (sin markdown) con este esquema:
{
  "subcategory": uno de ["Camisetas","Camisas","Sudaderas","Jerseys","Pantalones","Vaqueros","FaldasShorts","Abrigos","Blazers","Calzado"],
  "color": uno de ["Negro","Blanco","Gris","Beige","Azul Marino","Azul","Rojo","Burdeos","Verde","Rosa","Amarillo","Marrón"],
  "warmth": número entero entre 1 (fresco), 3 (templado) o 5 (abrigo),
  "occasion": array con 1 a 4 valores de ["Work","Walk","Going Out","Dinner","Party","Festival","Elegant Night","Wedding","Gym"],
  "name": nombre descriptivo corto en español (ej. "Camisa Oxford Azul", "Sudadera Gris Capucha")
}`;

      const result = await model.generateContent([
        prompt,
        { inlineData: { data: base64Data, mimeType: 'image/jpeg' } }
      ]);

      const rawText = result.response.text().replace(/```json|```/g, '').trim();
      const parsed = JSON.parse(rawText);

      const validSubcat = GARMENT_TYPES.some(t => t.id === parsed.subcategory)
        ? parsed.subcategory
        : localSuggestion.subcategory;
      const validWarmth = [1, 3, 5].includes(Number(parsed.warmth))
        ? Number(parsed.warmth)
        : localSuggestion.warmth;
      const validOccasions = Array.isArray(parsed.occasion) && parsed.occasion.length > 0
        ? parsed.occasion.filter(o => OCCASIONS.some(occ => occ.id === o))
        : localSuggestion.occasion;

      setNewGarment(prev => ({
        ...prev,
        image: dataUrl,
        subcategory: validSubcat,
        color: parsed.color || localSuggestion.color,
        warmth: validWarmth,
        occasion: validOccasions.length > 0 ? validOccasions : localSuggestion.occasion,
        name: parsed.name?.trim() || localSuggestion.name
      }));
      setAiVisionBadge(`✨ Detectado por Gemini Vision: ${parsed.name || localSuggestion.name}`);
    } catch (err) {
      console.warn('Fallback a Visión Local por error en Gemini API:', err);
      setNewGarment(prev => ({
        ...prev,
        image: dataUrl,
        color: localSuggestion.color,
        warmth: localSuggestion.warmth,
        occasion: localSuggestion.occasion,
        name: localSuggestion.name
      }));
      setAiVisionBadge(`✨ Detectado: ${localSuggestion.name} (IA Local)`);
    } finally {
      setAnalyzingPhoto(false);
    }
  };

  // Mejora 3: Encuadre y Fondo Limpio de Estudio en <canvas> (sin servidores externos)
  const applyStudioCutoutToCanvas = (ctx, width, height) => {
    // 1. Halo / viñeta suave de estudio (#f8fafc) en los bordes para limpiar fondos desordenados (camas, puertas, suelo)
    const cx = width / 2;
    const cy = height / 2;
    const innerRadius = Math.min(width, height) * 0.34;
    const outerRadius = Math.max(width, height) * 0.62;
    const grad = ctx.createRadialGradient(cx, cy, innerRadius, cx, cy, outerRadius);
    grad.addColorStop(0, 'rgba(248, 250, 252, 0)');
    grad.addColorStop(0.7, 'rgba(248, 250, 252, 0.35)');
    grad.addColorStop(1, 'rgba(248, 250, 252, 0.94)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, width, height);

    // 2. Marco editorial limpio de catálogo
    ctx.strokeStyle = '#f1f5f9';
    ctx.lineWidth = Math.max(6, Math.round(Math.min(width, height) * 0.025));
    ctx.strokeRect(0, 0, width, height);
  };

  const applyStudioToExistingPhoto = () => {
    if (!newGarment.image) return;
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const width = img.width || 500;
      const height = img.height || 500;
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      ctx.fillStyle = '#f8fafc';
      ctx.fillRect(0, 0, width, height);
      ctx.filter = 'contrast(1.06) saturate(1.05) brightness(1.03)';
      // Encuadre centrado al 92% para centrar la prenda
      const padX = Math.round(width * 0.04);
      const padY = Math.round(height * 0.04);
      ctx.drawImage(img, padX, padY, width - padX * 2, height - padY * 2);
      ctx.filter = 'none';
      applyStudioCutoutToCanvas(ctx, width, height);
      const studioDataUrl = canvas.toDataURL('image/jpeg', 0.84);
      setNewGarment(prev => ({ ...prev, image: studioDataUrl }));
      showToast('✨ Encuadre y fondo limpio de estudio aplicado');
    };
    img.src = newGarment.image;
  };

  const capturePhotoFromVideo = () => {
    if (!videoRef.current) return;
    const video = videoRef.current;
    const canvas = document.createElement('canvas');
    const maxDim = garments.length > 40 ? 480 : 600;
    const jpegQuality = garments.length > 40 ? 0.72 : 0.82;
    let width = video.videoWidth || maxDim;
    let height = video.videoHeight || maxDim;

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
    if (studioCutoutMode) {
      ctx.filter = 'contrast(1.05) saturate(1.04) brightness(1.02)';
    }
    ctx.drawImage(video, 0, 0, width, height);
    ctx.filter = 'none';
    if (studioCutoutMode) {
      applyStudioCutoutToCanvas(ctx, width, height);
    }
    const dataUrl = canvas.toDataURL('image/jpeg', jpegQuality);
    setNewGarment(prev => ({ ...prev, image: dataUrl }));
    stopCamera();
    analyzeGarmentImageWithAI(dataUrl, newGarment.subcategory);
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const maxDim = garments.length > 40 ? 480 : 600;
        const jpegQuality = garments.length > 40 ? 0.72 : 0.82;
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
        if (studioCutoutMode) {
          ctx.filter = 'contrast(1.05) saturate(1.04) brightness(1.02)';
        }
        ctx.drawImage(img, 0, 0, width, height);
        ctx.filter = 'none';
        if (studioCutoutMode) {
          applyStudioCutoutToCanvas(ctx, width, height);
        }
        const compressedDataUrl = canvas.toDataURL('image/jpeg', jpegQuality);
        setNewGarment(prev => ({ ...prev, image: compressedDataUrl }));
        stopCamera();
        analyzeGarmentImageWithAI(compressedDataUrl, newGarment.subcategory);
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

  const handleSaveGarment = (e, keepOpenForBurst = false) => {
    if (e?.preventDefault) e.preventDefault();
    if (!newGarment.image) {
      showToast('Primero haz una foto o sube una imagen de la prenda.');
      return;
    }

    const typeObj = GARMENT_TYPES.find(t => t.id === newGarment.subcategory) || GARMENT_TYPES[0];
    const autoName = `${typeObj.singular} ${newGarment.color || ''}`.trim();
    const numericPrice = newGarment.price !== '' && Number(newGarment.price) > 0 ? Number(newGarment.price) : undefined;

    const created = {
      id: Date.now().toString(),
      name: newGarment.name.trim() || autoName,
      category: typeObj.slot,
      subcategory: newGarment.subcategory,
      occasion: newGarment.occasion,
      warmth: Number(newGarment.warmth),
      comfort: 4,
      color: newGarment.color.trim() || 'Negro',
      price: numericPrice,
      inLaundry: false,
      wearCount: 0,
      image: newGarment.image
    };

    updateUserGarments([created, ...garments]);
    setAiVisionBadge('');
    setNewGarment({
      name: '',
      subcategory: newGarment.subcategory || 'Camisetas',
      occasion: ['Work', 'Going Out'],
      warmth: 3,
      comfort: 4,
      color: 'Negro',
      price: '',
      image: ''
    });

    if (keepOpenForBurst) {
      showToast(`📸 "${created.name}" guardada. ¡Lista para la siguiente foto!`);
    } else {
      stopCamera();
      setShowAddModal(false);
      showToast(`"${created.name}" añadida a tu armario`);
    }
  };

  // Guardar o actualizar el precio (€) de una prenda para calcular su Coste por Uso (CPW)
  const saveGarmentPrice = (id, priceVal) => {
    const num = Number(priceVal);
    const updated = garments.map(g =>
      String(g.id) === String(id)
        ? { ...g, price: num > 0 ? num : undefined }
        : g
    );
    updateUserGarments(updated);
    setEditingPriceId(null);
    setEditingPriceVal('');
    showToast(num > 0 ? `💶 Precio actualizado (${num} €)` : 'Precio eliminado');
  };

  // Eliminar prenda del armario
  const deleteGarment = (id) => {
    const target = garments.find(g => String(g.id) === String(id));
    const updated = garments.filter(g => String(g.id) !== String(id));
    updateUserGarments(updated);
    if (lockedGarment && String(lockedGarment.id) === String(id)) {
      setLockedGarment(null);
    }
    if (currentOutfit && currentOutfit.some(g => String(g.id) === String(id))) {
      setCurrentOutfit(null);
    }
    if (target) showToast(`"${target.name}" eliminada`);
  };

  // Cambiar clasificación de una prenda existente con 1 toque
  const changeGarmentSubcategory = (id, newSubcat) => {
    const newSlot = getSlotFromType(newSubcat, 'Top');
    const updated = garments.map(g =>
      String(g.id) === String(id)
        ? { ...g, subcategory: newSubcat, category: newSlot }
        : g
    );
    updateUserGarments(updated);
    showToast(`Clasificación actualizada a ${newSubcat}`);
  };

  // ============================================================================
  // MOTOR DE ARMONÍA CROMÁTICA Y COHERENCIA ESTILÍSTICA (IA ESTILISTA)
  // ============================================================================
  const evaluateColorHarmony = (items = []) => {
    const normalizeColor = (c = '') => String(c).trim().toLowerCase();
    const colors = items.map(it => normalizeColor(it?.color)).filter(Boolean);
    if (colors.length < 2) return { score: 0, label: 'Neutra' };

    const neutrals = new Set(['negro', 'blanco', 'gris', 'beige']);
    const classicBase = new Set(['azul marino', 'marrón']);
    const vividAccents = new Set(['rojo', 'rosa', 'amarillo', 'verde', 'azul', 'burdeos']);

    let score = 0;
    let harmonyReason = '';

    const topColor = normalizeColor(items[0]?.color);
    const bottomColor = normalizeColor(items[1]?.color);
    const shoeColor = normalizeColor(items[2]?.color);
    const outerColor = items[3] ? normalizeColor(items[3]?.color) : null;

    const hasPair = (c1, c2, a, b) => (c1 === a && c2 === b) || (c1 === b && c2 === a);

    // 1. Choques cromáticos estridentes (Penalizaciones)
    const checkClash = (c1, c2) => {
      if (!c1 || !c2) return 0;
      if (hasPair(c1, c2, 'rojo', 'rosa')) return -18;
      if (hasPair(c1, c2, 'rojo', 'verde')) return -16;
      if (hasPair(c1, c2, 'amarillo', 'rosa')) return -14;
      if (hasPair(c1, c2, 'burdeos', 'rojo')) return -10;
      if (hasPair(c1, c2, 'azul marino', 'negro')) return -6;
      return 0;
    };

    const topBottomClash = checkClash(topColor, bottomColor);
    if (topBottomClash < 0) {
      score += topBottomClash;
      harmonyReason = 'Contraste cromático arriesgado';
    }
    if (outerColor) {
      score += Math.round(checkClash(outerColor, topColor) * 0.7);
      score += Math.round(checkClash(outerColor, bottomColor) * 0.7);
    }

    // Marrón oscuro chocando con Negro puro sin puente neutro (blanco/beige/gris)
    const hasBrownAndBlack = colors.includes('marrón') && colors.includes('negro');
    const hasLightBridge = colors.includes('blanco') || colors.includes('beige') || colors.includes('gris');
    if (hasBrownAndBlack && !hasLightBridge) {
      score -= 12;
    }

    // Penalizar exceso de colores muy saturados no neutros (> 2 tonos vivos distintos)
    const uniqueVivids = new Set(colors.filter(c => vividAccents.has(c)));
    if (uniqueVivids.size > 2) {
      score -= (uniqueVivids.size - 2) * 14;
    }

    // 2. Combinaciones clásicas y armónicas (Bonificaciones)
    if (
      hasPair(topColor, bottomColor, 'azul marino', 'beige') ||
      hasPair(topColor, bottomColor, 'azul marino', 'blanco')
    ) {
      score += 14;
      harmonyReason = 'armonía clásica Azul Marino y neutro luminoso';
    } else if (
      hasPair(topColor, bottomColor, 'burdeos', 'gris') ||
      hasPair(topColor, bottomColor, 'burdeos', 'beige') ||
      hasPair(topColor, bottomColor, 'burdeos', 'negro')
    ) {
      score += 13;
      harmonyReason = 'sofisticación cromática en Burdeos y neutro';
    } else if (
      hasPair(topColor, bottomColor, 'marrón', 'beige') ||
      hasPair(topColor, bottomColor, 'marrón', 'blanco') ||
      hasPair(topColor, bottomColor, 'verde', 'beige')
    ) {
      score += 12;
      harmonyReason = 'paleta tierra orgánica y equilibrada';
    } else if (
      hasPair(topColor, bottomColor, 'negro', 'blanco') ||
      hasPair(topColor, bottomColor, 'negro', 'beige') ||
      hasPair(topColor, bottomColor, 'gris', 'blanco')
    ) {
      score += 11;
      harmonyReason = 'contraste minimalista de alta versatilidad';
    } else if (
      (neutrals.has(topColor) && vividAccents.has(bottomColor)) ||
      (vividAccents.has(topColor) && (neutrals.has(bottomColor) || classicBase.has(bottomColor)))
    ) {
      score += 10;
      harmonyReason = 'base neutra con acento de color equilibrado';
    } else if (topColor === bottomColor && neutrals.has(topColor)) {
      score += 8;
      harmonyReason = 'estética monocromática limpia';
    } else if (topColor === bottomColor && vividAccents.has(topColor)) {
      score -= 8; // Monocromo saturado sin variación de luminosidad
    }

    // 3. Coherencia de Calzado y Prenda Exterior (Sandwich Rule / Continuidad)
    if (shoeColor) {
      if (neutrals.has(shoeColor) || shoeColor === 'marrón' || shoeColor === 'azul marino') {
        score += 4;
      }
      if (shoeColor === topColor || (outerColor && shoeColor === outerColor)) {
        score += 5; // Regla del sándwich cromático
        if (!harmonyReason) harmonyReason = 'equilibrio visual entre calzado y parte superior';
      }
    }

    if (outerColor) {
      if (neutrals.has(outerColor) || classicBase.has(outerColor)) {
        score += 6;
      } else if (uniqueVivids.size <= 1) {
        score += 4;
      }
    }

    return {
      score,
      label: harmonyReason || 'paleta cromática equilibrada'
    };
  };

  const evaluateStyleCoherence = (items = [], occasion = 'Work') => {
    let score = 0;
    let styleReason = '';

    const subcats = items.map(it => it?.subcategory || getDefaultSubcategory(it?.category));
    const hasSubcat = (s) => subcats.includes(s);

    // Niveles de formalidad por subcategoría (1: Deportivo/Relax, 2: Casual, 3: Smart/Formal)
    const formalityMap = {
      Sudaderas: 1,
      FaldasShorts: 1.5,
      Camisetas: 2,
      Vaqueros: 2.2,
      Calzado: 2.2,
      Jerseys: 2.6,
      Pantalones: 2.8,
      Abrigos: 2.8,
      Camisas: 3,
      Blazers: 3.2
    };

    const formalities = subcats.map(s => formalityMap[s] || 2);
    const maxFormality = Math.max(...formalities);
    const minFormality = Math.min(...formalities);

    // Evitar choques extremos de formalidad (ej. Blazer con Sudadera o Bermudas deportivas)
    if (hasSubcat('Blazers') && hasSubcat('Sudaderas')) {
      score -= 16;
    }
    if (hasSubcat('Blazers') && hasSubcat('FaldasShorts') && occasion === 'Work') {
      score -= 22;
    }
    if (hasSubcat('Camisas') && hasSubcat('FaldasShorts') && occasion === 'Work') {
      score -= 14;
    }
    if (maxFormality - minFormality > 1.8) {
      score -= 10;
    }

    // Reglas y sinergias según la ocasión
    if (occasion === 'Work') {
      if (hasSubcat('Sudaderas')) score -= 18;
      if (hasSubcat('FaldasShorts')) score -= 14;
      if (hasSubcat('Blazers') && (hasSubcat('Camisas') || hasSubcat('Jerseys')) && (hasSubcat('Pantalones') || hasSubcat('Vaqueros'))) {
        score += 18;
        styleReason = 'sastrería smart-casual impecable para trabajo';
      } else if ((hasSubcat('Camisas') || hasSubcat('Jerseys')) && hasSubcat('Pantalones')) {
        score += 14;
        styleReason = 'línea profesional y cómoda';
      } else if (hasSubcat('Camisetas') && hasSubcat('Blazers') && hasSubcat('Pantalones')) {
        score += 11;
        styleReason = 'registro ejecutivo moderno con blazer';
      }
    } else if (occasion === 'Walk') {
      if (hasSubcat('Blazers')) score -= 14;
      if (hasSubcat('Camisetas') || hasSubcat('Jerseys') || hasSubcat('Sudaderas')) {
        score += 14;
        styleReason = 'look cómodo y relajado para caminar o pasear';
      }
      if (hasSubcat('Calzado')) score += 5;
    } else if (occasion === 'Going Out') {
      if ((hasSubcat('Vaqueros') || hasSubcat('Pantalones')) && (hasSubcat('Camisas') || hasSubcat('Jerseys') || hasSubcat('Camisetas'))) {
        score += 12;
        styleReason = 'versatilidad casual urbana';
      }
      if (hasSubcat('Blazers') && hasSubcat('Vaqueros')) {
        score += 15;
        styleReason = 'contraste elevado blazer & denim';
      }
    } else if (occasion === 'Dinner') {
      if (hasSubcat('Sudaderas')) score -= 22;
      if (hasSubcat('Blazers') || hasSubcat('Camisas') || hasSubcat('Jerseys')) {
        score += 16;
        styleReason = 'toque smart-casual perfecto para cenar';
      }
      if (hasSubcat('Pantalones') || hasSubcat('Vaqueros')) score += 8;
    } else if (occasion === 'Party') {
      if (hasSubcat('Sudaderas')) score -= 14;
      if (hasSubcat('Blazers') || hasSubcat('Camisas') || hasSubcat('FaldasShorts')) {
        score += 15;
        styleReason = 'estilo con carácter y presencia festiva nocturna';
      }
    } else if (occasion === 'Festival') {
      if (hasSubcat('Blazers')) score -= 25;
      if (hasSubcat('Camisetas') || hasSubcat('Sudaderas') || hasSubcat('FaldasShorts')) {
        score += 16;
        styleReason = 'look festivalero fresco y todoterreno';
      }
    } else if (occasion === 'Elegant Night') {
      if (hasSubcat('Sudaderas')) score -= 30;
      if (hasSubcat('FaldasShorts')) score -= 16;
      if (hasSubcat('Camisetas')) score -= 12;
      if (hasSubcat('Blazers') && (hasSubcat('Camisas') || hasSubcat('Jerseys')) && hasSubcat('Pantalones')) {
        score += 24;
        styleReason = 'máxima distinción y sobriedad para noche elegante';
      } else if (hasSubcat('Blazers') || hasSubcat('Camisas')) {
        score += 15;
        styleReason = 'elegancia refinada nocturna';
      }
    } else if (occasion === 'Wedding') {
      if (hasSubcat('Sudaderas')) score -= 45;
      if (hasSubcat('FaldasShorts')) score -= 30;
      if (hasSubcat('Camisetas')) score -= 25;
      if (hasSubcat('Blazers') && hasSubcat('Camisas') && hasSubcat('Pantalones')) {
        score += 30;
        styleReason = 'porte formal impecable de etiqueta para boda';
      } else if (hasSubcat('Blazers') || hasSubcat('Camisas')) {
        score += 18;
        styleReason = 'elegancia distinguida para ceremonia';
      }
    } else if (occasion === 'Gym' || occasion === 'Sport') {
      if (hasSubcat('Blazers')) score -= 35;
      if (hasSubcat('Camisas')) score -= 28;
      if (hasSubcat('Jerseys')) score -= 18;
      if (hasSubcat('Camisetas') || hasSubcat('Sudaderas') || hasSubcat('FaldasShorts')) {
        score += 18;
        styleReason = 'funcionalidad y transpirabilidad para entrenamiento activo';
      }
    }

    // Adecuación explícita de las prendas a la ocasión seleccionada
    items.forEach(it => {
      if (Array.isArray(it?.occasion) && it.occasion.includes(occasion)) score += 6;
      else score -= 4;
    });

    const occFound = OCCASIONS.find(o => o.id === occasion);
    return {
      score,
      label: styleReason || (occFound ? `estilo ideal para ${occFound.label}` : 'estilo equilibrado')
    };
  };

  const calculateRefinedWarmthBias = (baseWarmth, history = []) => {
    let bias = 0;
    // Ponderar con mayor peso los feedbacks más recientes (los primeros del array)
    history.slice(0, 12).forEach((fb, idx) => {
      const recencyWeight = Math.max(0.35, 1 - idx * 0.07);
      if (fb.reasons?.includes('too_cold')) bias += 0.65 * recencyWeight;
      if (fb.reasons?.includes('too_warm')) bias -= 0.65 * recencyWeight;
    });
    const clampedBias = Math.max(-2, Math.min(2, bias));
    return Math.min(5, Math.max(1, Math.round(baseWarmth + clampedBias)));
  };

  const scoreOutfitCandidate = ({
    candidateItems,
    occasion,
    targetWarmth,
    avgClosetWear,
    excludedIds = new Set(),
    todayStr
  }) => {
    const candidateTop = candidateItems[0];
    const candidateBottom = candidateItems[1];
    const candidateIds = candidateItems.map(item => String(item.id)).sort().join('-');
    const topBottomKey = `${candidateTop.id}_${candidateBottom.id}`;
    const colorPairKey = `${candidateTop.color?.toLowerCase()}_${candidateBottom.color?.toLowerCase()}`;

    let score = 0;
    const rejectedFeedbacks = feedbackHistory.filter(f => f.status === 'rejected');

    // 1. Penalización por rechazos directos o combinaciones cromáticas rechazadas
    if (rejectedFeedbacks.some(fb => fb.comboKey === candidateIds)) score -= 60;
    if (
      rejectedFeedbacks.some(
        fb =>
          fb.topBottomKey === topBottomKey ||
          (fb.reasons?.includes('colors') && fb.colorPairKey === colorPairKey)
      )
    ) {
      score -= 30;
    }

    // 2. Aprendizaje por refuerzo positivo (8-10 ⭐) y penalización gradual (0-4 ⭐)
    feedbackHistory.forEach((fb, idx) => {
      const recency = Math.max(0.5, 1 - idx * 0.04);
      const isExactCombo = fb.comboKey === candidateIds;
      const isSamePair = fb.topBottomKey === topBottomKey;
      const isSameColorPair = fb.colorPairKey === colorPairKey;

      if (typeof fb.rating === 'number') {
        if (isExactCombo || isSamePair) {
          if (fb.rating >= 8) {
            score += (fb.rating - 6) * 5.5 * recency;
          } else if (fb.rating <= 4) {
            score -= (5 - fb.rating) * 6 * recency;
          } else {
            score += (fb.rating - 5) * 3 * recency;
          }
        } else if (isSameColorPair) {
          if (fb.rating >= 8 && fb.status === 'accepted') {
            score += 7 * recency;
          } else if (fb.rating <= 4 || fb.reasons?.includes('colors')) {
            score -= 9 * recency;
          }
        }
      } else if (fb.status === 'accepted' && (isExactCombo || isSamePair)) {
        score += 10 * recency;
      }

      if (fb.reasons?.includes('wrong_style') && fb.occasion === occasion && isSamePair) {
        score -= 18 * recency;
      }
    });

    // 3. Armonía Cromática y Coherencia Estilística
    const colorEval = evaluateColorHarmony(candidateItems);
    const styleEval = evaluateStyleCoherence(candidateItems, occasion);
    score += colorEval.score;
    score += styleEval.score;

    // 4. Rotación Anti-Olvido y penalización de prendas repetidas el mismo día
    let unwornBoostCount = 0;
    candidateItems.forEach(it => {
      const wears = Number(it.wearCount) || 0;
      if (wears === 0) {
        score += 9;
        unwornBoostCount++;
      } else if (wears < avgClosetWear) {
        score += 4.5;
      }
      if (todayStr && it.lastWornAt === todayStr) {
        score -= 16; // Evitar sugerir prendas ya usadas hoy si hay alternativas
      }
      if (excludedIds.has(String(it.id))) {
        score -= 14; // Evitar repetición consecutiva
      }
    });

    // 5. Equilibrio térmico
    const avgWarmth =
      candidateItems.reduce((acc, it) => acc + (Number(it.warmth) || 3), 0) /
      candidateItems.length;
    const warmthDiff = Math.abs(avgWarmth - targetWarmth);
    score -= warmthDiff * 5;

    // Calcular % de afinidad (Match %) normalizado entre 68% y 99%
    const affinityPct = Math.max(68, Math.min(99, Math.round(78 + score * 0.45)));

    return {
      score,
      affinityPct,
      colorEval,
      styleEval,
      unwornBoostCount,
      avgWarmth
    };
  };

  const buildStylistEditorialNote = ({
    items,
    evalResult,
    activeAnchor,
    targetWarmth,
    isRainingNow,
    historyCount
  }) => {
    const topItem = items[0];
    const bottomItem = items[1];
    const outerItem = items[3];
    const parts = [];

    parts.push(`✨ Afinidad ${evalResult.affinityPct}%: ${topItem.name} con ${bottomItem.name}${outerItem ? ` y ${outerItem.name}` : ''}.`);
    parts.push(`Destaca por su ${evalResult.colorEval.label} y ${evalResult.styleEval.label}.`);

    if (activeAnchor) {
      parts.push(`Construido alrededor de tu prenda ancla "${activeAnchor.name}".`);
    } else if (evalResult.unwornBoostCount > 0) {
      parts.push(`Activa la rotación de tu armario rescatando prendas con pocos usos.`);
    }

    if (isRainingNow) {
      parts.push(`🌧️ Look adaptado a lluvia: incluye capa exterior protectora para ${temp}°C.`);
    } else if (targetWarmth >= 4) {
      parts.push(`Aislamiento térmico óptimo para ${temp}°C.`);
    } else if (targetWarmth <= 2) {
      parts.push(`Tejidos ligeros ideales para ${temp}°C.`);
    }

    if (historyCount > 0) {
      parts.push(`Calibrado con tus ${historyCount} valoraciones ⭐.`);
    }

    return parts.join(' ');
  };

  // Cambiar solo una prenda individual dentro del outfit sugerido priorizando armonía cromática y estilo
  const swapSingleOutfitItem = (slotToSwap, currentItemId) => {
    if (!currentOutfit) return;
    const pool = garments.filter(
      g =>
        !g.inLaundry &&
        getSlotFromType(g.subcategory, g.category) === slotToSwap &&
        String(g.id) !== String(currentItemId)
    );
    if (pool.length === 0) {
      showToast('No tienes otra prenda limpia de este tipo para cambiar.');
      return;
    }

    const cleanGarments = garments.filter(g => !g.inLaundry);
    const avgClosetWear =
      cleanGarments.reduce((acc, g) => acc + (Number(g.wearCount) || 0), 0) /
      Math.max(1, cleanGarments.length);
    const targetWarmth = calculateRefinedWarmthBias(desiredWarmth, feedbackHistory);
    const todayStr = new Date().toLocaleDateString('es-ES');

    const scoredCandidates = pool.map(candidateReplacement => {
      const simulatedOutfit = currentOutfit.map(item =>
        String(item.id) === String(currentItemId) ? candidateReplacement : item
      );
      const evalRes = scoreOutfitCandidate({
        candidateItems: simulatedOutfit,
        occasion: selectedOccasion,
        targetWarmth,
        avgClosetWear,
        todayStr
      });
      return {
        replacement: candidateReplacement,
        simulatedOutfit,
        evalRes
      };
    });

    scoredCandidates.sort((a, b) => b.evalRes.score - a.evalRes.score);
    // Elegir entre las 2 mejores alternativas para mantener alta armonía sin bloquear variedad
    const topSlice = scoredCandidates.slice(0, Math.min(2, scoredCandidates.length));
    const chosen = topSlice[Math.floor(Math.random() * topSlice.length)];

    setCurrentOutfit(chosen.simulatedOutfit);
    setAiNote(
      buildStylistEditorialNote({
        items: chosen.simulatedOutfit,
        evalResult: chosen.evalRes,
        activeAnchor: lockedGarment,
        targetWarmth,
        isRainingNow: isRaining,
        historyCount: feedbackHistory.length
      })
    );
  };

  // --- Fijar Prenda Ancla ("Pin & Build Outfit") desde Mi Armario ---
  const combineWithGarment = (garment) => {
    if (garment.inLaundry) {
      showToast('Esta prenda está en la colada. Lávala primero para combinarla.');
      return;
    }
    setLockedGarment(garment);
    setActiveTab('generator');
    generateOutfit(garment);
  };

  // --- Generador Inteligente de Outfits con Prenda Ancla, Rotación Anti-Olvido y Aprendizaje ---
  const generateOutfit = (explicitAnchor = undefined) => {
    const activeAnchor =
      explicitAnchor && explicitAnchor.id ? explicitAnchor : lockedGarment;
    setGenerating(true);
    setShowRejectPanel(false);

    setTimeout(() => {
      // Buscar primero prendas de la ocasión; si falta algún bloque básico, usar cualquier prenda limpia de ese bloque
      const cleanGarments = garments.filter(g => !g.inLaundry);
      const occasionGarments = cleanGarments.filter(g => g.occasion?.includes(selectedOccasion));

      const getPool = (slot) => {
        if (activeAnchor && getSlotFromType(activeAnchor.subcategory, activeAnchor.category) === slot) {
          return [activeAnchor];
        }
        const byOccasion = occasionGarments.filter(g => getSlotFromType(g.subcategory, g.category) === slot);
        if (byOccasion.length > 0) return byOccasion;
        return cleanGarments.filter(g => getSlotFromType(g.subcategory, g.category) === slot);
      };

      const tops = getPool('Top');
      const bottoms = getPool('Bottom');
      const footwears = getPool('Footwear');
      const outerwears = getPool('Outerwear');

      if (tops.length === 0 || bottoms.length === 0 || footwears.length === 0) {
        const missing = [];
        if (tops.length === 0) missing.push({ slot: 'Top', name: 'Parte Superior' });
        if (bottoms.length === 0) missing.push({ slot: 'Bottom', name: 'Parte Inferior' });
        if (footwears.length === 0) missing.push({ slot: 'Footwear', name: 'Calzado' });

        const dirtyRescuables = garments.filter(g =>
          g.inLaundry && missing.some(m => getSlotFromType(g.subcategory, g.category) === m.slot)
        );

        setGenerating(false);
        if (dirtyRescuables.length > 0) {
          setLaundryRescueData({ missingSlots: missing, dirtyRescuables });
        } else {
          showToast(`Necesitas al menos 1 ${missing.map(m => m.name).join(', ')} limpia en tu armario.`);
        }
        return;
      }

      const targetWarmth = calculateRefinedWarmthBias(desiredWarmth, feedbackHistory);
      const avgClosetWear =
        cleanGarments.reduce((acc, g) => acc + (Number(g.wearCount) || 0), 0) /
        Math.max(1, cleanGarments.length);
      const todayStr = new Date().toLocaleDateString('es-ES');
      const currentIdsSet = new Set(currentOutfit ? currentOutfit.map(i => String(i.id)) : []);

      let bestCandidate = null;
      let bestEval = null;
      let bestScore = -9999;

      const iterations = Math.min(48, Math.max(28, tops.length * bottoms.length * 2));

      for (let i = 0; i < iterations; i++) {
        const candidateTop = tops[Math.floor(Math.random() * tops.length)];
        const candidateBottom = bottoms[Math.floor(Math.random() * bottoms.length)];
        const candidateFootwear = footwears[Math.floor(Math.random() * footwears.length)];

        let candidateOuterwear = null;
        if (
          activeAnchor &&
          getSlotFromType(activeAnchor.subcategory, activeAnchor.category) === 'Outerwear'
        ) {
          candidateOuterwear = activeAnchor;
        } else if (isRaining || targetWarmth >= 3) {
          if (outerwears.length > 0) {
            if (isRaining) {
              const rainOuter = outerwears.filter(o =>
                (o.name?.toLowerCase().includes('chubasquero') ||
                 o.name?.toLowerCase().includes('técnico') ||
                 o.name?.toLowerCase().includes('abrigo') ||
                 o.subcategory === 'Abrigos')
              );
              const pool = rainOuter.length > 0 ? rainOuter : outerwears;
              candidateOuterwear = pool[Math.floor(Math.random() * pool.length)];
            } else {
              candidateOuterwear = outerwears[Math.floor(Math.random() * outerwears.length)];
            }
          }
        }

        const candidateItems = [candidateTop, candidateBottom, candidateFootwear];
        if (candidateOuterwear) candidateItems.push(candidateOuterwear);

        const candidateIds = candidateItems.map(item => String(item.id)).sort().join('-');

        const evalRes = scoreOutfitCandidate({
          candidateItems,
          occasion: selectedOccasion,
          targetWarmth,
          avgClosetWear,
          excludedIds: currentIdsSet,
          todayStr
        });

        let score = evalRes.score;

        if (currentOutfit) {
          const currentKey = currentOutfit.map(item => String(item.id)).sort().join('-');
          if (currentKey === candidateIds) score -= 22;
        }

        // Pequeño jitter estocástico para desempatar candidatos con puntuación idéntica
        score += Math.random() * 1.5;

        if (score > bestScore) {
          bestScore = score;
          bestCandidate = candidateItems;
          bestEval = evalRes;
        }
      }

      setCurrentOutfit(bestCandidate);
      setOutfitRating(8);

      setAiNote(
        buildStylistEditorialNote({
          items: bestCandidate,
          evalResult: bestEval,
          activeAnchor,
          targetWarmth,
          isRainingNow: isRaining,
          historyCount: feedbackHistory.length
        })
      );
      setGenerating(false);
    }, 280);
  };

  // Aceptar el Outfit sugerido (Modo Limpio, Modo Colada o Solo Favorito)
  const handleAcceptOutfit = (mode = 'wear_clean') => {
    if (!currentOutfit) return;
    const topItem = currentOutfit[0];
    const bottomItem = currentOutfit[1];
    const comboKey = currentOutfit.map(i => String(i.id)).sort().join('-');
    const todayStr = new Date().toLocaleDateString('es-ES');

    const entry = {
      id: Date.now().toString(),
      date: todayStr,
      status: 'accepted',
      rating: outfitRating,
      occasion: selectedOccasion,
      comboKey,
      topBottomKey: `${topItem.id}_${bottomItem.id}`,
      colorPairKey: `${topItem.color?.toLowerCase()}_${bottomItem.color?.toLowerCase()}`,
      summary: currentOutfit.map(i => i.name).join(' + '),
      reasons: [],
      comment: `Valorado con ${outfitRating}/10 ⭐`
    };

    updateUserFeedback([entry, ...feedbackHistory]);

    const outfitIds = new Set(currentOutfit.map(g => String(g.id)));

    if (mode === 'wear_and_laundry') {
      updateUserGarments(
        garments.map(g =>
          outfitIds.has(String(g.id))
            ? {
                ...g,
                inLaundry: true,
                wearCount: (Number(g.wearCount) || 0) + 1,
                lastWornAt: todayStr
              }
            : g
        )
      );
      setCurrentOutfit(null);
      setLockedGarment(null);
      showToast(`¡Look registrado (${outfitRating}/10 ⭐), usos sumados y enviado a colada!`);
    } else if (mode === 'wear_clean') {
      updateUserGarments(
        garments.map(g =>
          outfitIds.has(String(g.id))
            ? {
                ...g,
                inLaundry: false,
                wearCount: (Number(g.wearCount) || 0) + 1,
                lastWornAt: todayStr
              }
            : g
        )
      );
      showToast(`¡Me lo pongo hoy! Usos sumados al coste por puesta (${outfitRating}/10 ⭐)`);
    } else {
      showToast(`¡Guardado en tus favoritos con ${outfitRating}/10 ⭐!`);
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

    updateUserFeedback([entry, ...feedbackHistory]);

    if (selectedReasons.includes('too_cold') && desiredWarmth < 5) {
      setDesiredWarmth(prev => Math.min(5, prev + 2));
    } else if (selectedReasons.includes('too_warm') && desiredWarmth > 1) {
      setDesiredWarmth(prev => Math.max(1, prev - 2));
    }

    setCustomFeedbackText('');
    setShowRejectPanel(false);
    showToast('Feedback aprendido. Buscando otra combinación...');
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

  const washAllLaundry = () => {
    updateUserGarments(garments.map(g => ({ ...g, inLaundry: false })));
    showToast('¡Toda la colada está limpia y de vuelta en tu armario!');
  };

  const rescueGarmentFromLaundry = (id) => {
    updateUserGarments(garments.map(g => String(g.id) === String(id) ? { ...g, inLaundry: false } : g));
    showToast('Prenda rescatada de la colada y marcada como limpia');
  };

  const copyToClipboardFallback = (text, successMsg) => {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text)
        .then(() => showToast(successMsg))
        .catch(() => showToast('No se pudo copiar'));
    } else {
      showToast('Compartir no disponible en este navegador');
    }
  };

  const handleShareLook = async () => {
    if (!currentOutfit || currentOutfit.length === 0) return;
    const pieces = currentOutfit
      .map(g => {
        const typeLabel =
          GARMENT_TYPES.find(t => t.id === g.subcategory)?.singular ||
          g.subcategory ||
          g.category;
        return `• ${g.name} (${typeLabel}, ${g.color})`;
      })
      .join('\n');
    const noteText = aiNote ? `\n💡 Estilo: ${aiNote}\n` : '\n';
    const textToShare = `✨ Mi Look de Hoy — Smart Closet:\n${pieces}${noteText}⭐ Puntuación: ${outfitRating}/10\n🎯 Ocasión: ${selectedOccasion}`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Mi Look de Hoy — Smart Closet',
          text: textToShare
        });
        showToast('¡Look compartido!');
      } catch (err) {
        if (err?.name !== 'AbortError') {
          copyToClipboardFallback(textToShare, '¡Look copiado al portapapeles!');
        }
      }
    } else {
      copyToClipboardFallback(textToShare, '¡Look copiado al portapapeles!');
    }
  };

  const handleShareTravelCapsule = async () => {
    if (!capsuleItems || capsuleItems.length === 0) return;
    const pieces = capsuleItems
      .map(g => {
        const isPacked = packedItemIds.includes(String(g.id));
        return `${isPacked ? '✅' : '⬜'} ${g.name} (${g.color})`;
      })
      .join('\n');
    const textToShare = `🧳 Maleta para ${tripName || 'Viaje'} (${tripDays} días):\n${pieces}\n\nProgreso: ${packedItemIds.length}/${capsuleItems.length} prendas listas.\nGenerado con Smart Closet`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: `Maleta de Viaje — ${tripName || 'Smart Closet'}`,
          text: textToShare
        });
        showToast('¡Maleta compartida!');
      } catch (err) {
        if (err?.name !== 'AbortError') {
          copyToClipboardFallback(textToShare, '¡Checklist de maleta copiado al portapapeles!');
        }
      }
    } else {
      copyToClipboardFallback(textToShare, '¡Checklist de maleta copiado al portapapeles!');
    }
  };

  // --- Funciones del Planificador / Calendario Semanal ---
  const pickBestOutfitForOccasion = (occ = 'Work', excludedTopIds = []) => {
    const cleanGarments = garments.filter(g => !g.inLaundry);
    const occasionGarments = cleanGarments.filter(g => g.occasion?.includes(occ));

    const getPool = (slot) => {
      const byOcc = occasionGarments.filter(g => getSlotFromType(g.subcategory, g.category) === slot);
      if (byOcc.length > 0) return byOcc;
      return cleanGarments.filter(g => getSlotFromType(g.subcategory, g.category) === slot);
    };

    const allTops = getPool('Top');
    const nonRepeatedTops = allTops.filter(t => !excludedTopIds.includes(String(t.id)));
    const tops = nonRepeatedTops.length > 0 ? nonRepeatedTops : allTops;
    const bottoms = getPool('Bottom');
    const footwears = getPool('Footwear');
    const outerwears = getPool('Outerwear');

    if (tops.length === 0 || bottoms.length === 0 || footwears.length === 0) return null;

    const targetWarmth = calculateRefinedWarmthBias(desiredWarmth, feedbackHistory);
    const avgClosetWear =
      cleanGarments.reduce((acc, g) => acc + (Number(g.wearCount) || 0), 0) /
      Math.max(1, cleanGarments.length);
    const excludedSet = new Set(excludedTopIds.map(String));

    let bestCandidate = null;
    let bestScore = -9999;

    for (let i = 0; i < 32; i++) {
      const candidateTop = tops[Math.floor(Math.random() * tops.length)];
      const candidateBottom = bottoms[Math.floor(Math.random() * bottoms.length)];
      const candidateFootwear = footwears[Math.floor(Math.random() * footwears.length)];

      let candidateOuterwear = null;
      if ((isRaining || targetWarmth >= 3) && outerwears.length > 0) {
        if (isRaining) {
          const rainOuter = outerwears.filter(o =>
            (o.name?.toLowerCase().includes('chubasquero') ||
             o.name?.toLowerCase().includes('técnico') ||
             o.name?.toLowerCase().includes('abrigo') ||
             o.subcategory === 'Abrigos')
          );
          const pool = rainOuter.length > 0 ? rainOuter : outerwears;
          candidateOuterwear = pool[Math.floor(Math.random() * pool.length)];
        } else {
          candidateOuterwear = outerwears[Math.floor(Math.random() * outerwears.length)];
        }
      }

      const candidateItems = [candidateTop, candidateBottom, candidateFootwear];
      if (candidateOuterwear) candidateItems.push(candidateOuterwear);

      const evalRes = scoreOutfitCandidate({
        candidateItems,
        occasion: occ,
        targetWarmth,
        avgClosetWear,
        excludedIds: excludedSet
      });

      const score = evalRes.score + Math.random() * 1.2;

      if (score > bestScore) {
        bestScore = score;
        bestCandidate = candidateItems;
      }
    }

    return bestCandidate;
  };

  const assignCurrentOutfitToDay = (dayId) => {
    if (!currentOutfit || currentOutfit.length === 0) return;
    const dayObj = WEEK_DAYS.find(d => d.id === dayId);
    const updated = {
      ...weeklyPlan,
      [dayId]: {
        occasion: selectedOccasion,
        warmth: desiredWarmth,
        garmentIds: currentOutfit.map(g => String(g.id)),
        note: aiNote || `Look preparado para ${dayObj?.full || dayId}`,
        completed: false
      }
    };
    updateUserPlanner(updated);
    setSelectedDay(dayId);
    showToast(`Look guardado para el ${dayObj?.full || dayId}`);
  };

  const generateSingleDayPlan = (dayId, customOccasion) => {
    const dayMeta = WEEK_DAYS.find(d => d.id === dayId);
    const occ = customOccasion || weeklyPlan[dayId]?.occasion || dayMeta?.defaultOccasion || 'Work';
    const picked = pickBestOutfitForOccasion(occ);
    if (!picked) {
      showToast('Necesitas al menos 1 Parte Superior, 1 Parte Inferior y 1 Calzado limpios para planificar.');
      return;
    }
    const colorHarmony = evaluateColorHarmony(picked);
    const styleCoh = evaluateStyleCoherence(picked, occ);
    const updated = {
      ...weeklyPlan,
      [dayId]: {
        occasion: occ,
        warmth: desiredWarmth,
        garmentIds: picked.map(g => String(g.id)),
        note: `${picked[0]?.name} + ${picked[1]?.name} (${colorHarmony.label}, ${styleCoh.label})`,
        completed: false
      }
    };
    updateUserPlanner(updated);
    showToast(`Look del ${dayMeta?.full || dayId} actualizado`);
  };

  const generateFullWeekPlan = () => {
    const newPlan = {};
    const recentTopIds = [];

    for (const day of WEEK_DAYS) {
      const occ = weeklyPlan[day.id]?.occasion || day.defaultOccasion;
      const picked = pickBestOutfitForOccasion(occ, recentTopIds.slice(-2));
      if (!picked) {
        showToast('Necesitas al menos 1 Parte Superior, 1 Parte Inferior y 1 Calzado limpios en tu armario.');
        return;
      }
      if (picked[0]) recentTopIds.push(String(picked[0].id));
      const colorHarmony = evaluateColorHarmony(picked);
      newPlan[day.id] = {
        occasion: occ,
        warmth: desiredWarmth,
        garmentIds: picked.map(g => String(g.id)),
        note: `${picked[0]?.name} con ${picked[1]?.name} • ${colorHarmony.label}`,
        completed: false
      };
    }

    updateUserPlanner(newPlan);
    showToast('✨ ¡Semana completa de outfits planificada con IA!');
  };

  const wearPlannedDayOutfit = (dayId, sendToLaundry = true) => {
    const planEntry = weeklyPlan[dayId];
    if (!planEntry || !planEntry.garmentIds?.length) return;
    const idSet = new Set(planEntry.garmentIds.map(String));
    const todayStr = new Date().toLocaleDateString('es-ES');
    updateUserGarments(
      garments.map(g =>
        idSet.has(String(g.id))
          ? {
              ...g,
              inLaundry: sendToLaundry,
              wearCount: (Number(g.wearCount) || 0) + 1,
              lastWornAt: todayStr
            }
          : g
      )
    );
    updateUserPlanner({
      ...weeklyPlan,
      [dayId]: { ...planEntry, completed: true }
    });
    showToast(
      sendToLaundry
        ? '¡Look usado hoy! Usos sumados y prendas enviadas a colada.'
        : '¡Look usado hoy! Usos sumados al coste por puesta (prendas limpias).'
    );
  };

  const clearPlannedDay = (dayId) => {
    const copy = { ...weeklyPlan };
    delete copy[dayId];
    updateUserPlanner(copy);
    showToast('Día liberado del calendario');
  };

  const resetFullWeekPlan = () => {
    updateUserPlanner({});
    showToast('🔄 Semana reseteada. Puedes planificar o generar nuevos looks en cualquier momento.');
  };

  // --- Mejora 1: Look Matutino Automático ("Morning Briefing") al abrir la app ---
  useEffect(() => {
    if (!currentUser?.username || garments.length === 0) return;
    if (morningLoadedUserRef.current === currentUser.username) return;
    morningLoadedUserRef.current = currentUser.username;

    const todayMeta = WEEK_DAYS.find(d => d.id === selectedDay);
    const todayPlan = weeklyPlan[selectedDay];

    if (todayPlan && Array.isArray(todayPlan.garmentIds) && todayPlan.garmentIds.length >= 3) {
      const plannedGarments = todayPlan.garmentIds
        .map(id => garments.find(g => String(g.id) === String(id) && !g.inLaundry))
        .filter(Boolean);
      if (plannedGarments.length >= 3) {
        setCurrentOutfit(plannedGarments);
        setAiNote(todayPlan.note || `Look planificado en tu calendario para el ${todayMeta?.full || selectedDay}.`);
        setMorningBriefingMsg(
          `☀️ Buenos días: Tu look planificado para hoy (${todayMeta?.full || selectedDay}) está listo para ${temp}°C en ${locationName}.`
        );
        return;
      }
    }

    // Si no hay look planificado hoy, generar automáticamente una sugerencia matutina
    const picked = pickBestOutfitForOccasion(todayMeta?.defaultOccasion || selectedOccasion);
    if (picked && picked.length >= 3) {
      const avgClosetWear =
        garments.reduce((acc, g) => acc + (Number(g.wearCount) || 0), 0) / Math.max(1, garments.length);
      const evalRes = scoreOutfitCandidate({
        candidateItems: picked,
        occasion: todayMeta?.defaultOccasion || selectedOccasion,
        targetWarmth: desiredWarmth,
        avgClosetWear
      });
      setCurrentOutfit(picked);
      setAiNote(
        buildStylistEditorialNote({
          items: picked,
          evalResult: evalRes,
          activeAnchor: null,
          targetWarmth: desiredWarmth,
          isRainingNow: isRaining,
          historyCount: feedbackHistory.length
        })
      );
      setMorningBriefingMsg(
        `☀️ Buenos días: Hemos preparado tu look automático para hoy (${temp}°C en ${locationName}).`
      );
    }
  }, [currentUser?.username, garments.length]);

  // --- Generador de Maleta de Viaje (Pestaña Dedicada "Viaje") ---
  const generateTravelCapsule = (days = tripDays, occ = tripOccasion, warmthTarget = tripWarmth) => {
    const clean = garments.filter(g => !g.inLaundry);
    const scoreForTrip = (g) => {
      let s = 0;
      if (g.occasion?.includes(occ)) s += 16;
      s -= Math.abs((Number(g.warmth) || 3) - warmthTarget) * 3.5;
      const neutralColors = ['negro', 'blanco', 'gris', 'beige', 'azul marino'];
      if (neutralColors.includes((g.color || '').toLowerCase())) s += 7;
      // Priorizar prendas versátiles o poco amortizadas
      if ((Number(g.wearCount) || 0) === 0) s += 3;
      return s;
    };

    const bySlot = (slot) =>
      clean
        .filter(g => getSlotFromType(g.subcategory, g.category) === slot)
        .sort((a, b) => scoreForTrip(b) - scoreForTrip(a));

    const topsNeeded = Math.min(Math.max(2, days), 6);
    const bottomsNeeded = Math.min(Math.max(1, Math.ceil(days / 2)), 3);
    const shoesNeeded = days >= 4 ? 2 : 1;

    const selectedTops = bySlot('Top').slice(0, topsNeeded);
    const selectedBottoms = bySlot('Bottom').slice(0, bottomsNeeded);
    const selectedShoes = bySlot('Footwear').slice(0, shoesNeeded);
    const selectedOuter = warmthTarget >= 3 || tripIsRaining || isRaining ? bySlot('Outerwear').slice(0, days >= 5 ? 2 : 1) : [];

    const capsule = [...selectedTops, ...selectedBottoms, ...selectedShoes, ...selectedOuter];
    if (capsule.length < 3) {
      showToast('Añade o lava más prendas para armar tu maleta cápsula.');
      return;
    }
    setCapsuleItems(capsule);
    setPackedItemIds([]);
    showToast(`🧳 Maleta cápsula de ${capsule.length} prendas creada para ${days} días`);
  };

  const togglePackItem = (id) => {
    const strId = String(id);
    setPackedItemIds(prev =>
      prev.includes(strId) ? prev.filter(item => item !== strId) : [...prev, strId]
    );
  };

  const swapCapsuleItem = (itemToSwap) => {
    const slot = getSlotFromType(itemToSwap.subcategory, itemToSwap.category);
    const currentCapsuleIds = new Set(capsuleItems.map(c => String(c.id)));
    const alternatives = garments.filter(
      g =>
        !g.inLaundry &&
        getSlotFromType(g.subcategory, g.category) === slot &&
        !currentCapsuleIds.has(String(g.id))
    );
    if (alternatives.length === 0) {
      showToast('No tienes otra prenda limpia de este tipo para intercambiar en la maleta.');
      return;
    }
    const replacement = alternatives[Math.floor(Math.random() * alternatives.length)];
    setCapsuleItems(prev =>
      prev.map(it => (String(it.id) === String(itemToSwap.id) ? replacement : it))
    );
    setPackedItemIds(prev => prev.filter(id => id !== String(itemToSwap.id)));
    showToast(`🔄 Cambiada por "${replacement.name}"`);
  };

  const finishTripAndSendToLaundry = () => {
    const targetIds =
      packedItemIds.length > 0
        ? new Set(packedItemIds.map(String))
        : new Set(capsuleItems.map(c => String(c.id)));
    if (targetIds.size === 0) return;

    const todayStr = new Date().toLocaleDateString('es-ES');
    updateUserGarments(
      garments.map(g =>
        targetIds.has(String(g.id))
          ? {
              ...g,
              inLaundry: true,
              wearCount: (Number(g.wearCount) || 0) + 1,
              lastWornAt: todayStr
            }
          : g
      )
    );
    setCapsuleItems([]);
    setPackedItemIds([]);
    showToast(`🧺 ¡Buen regreso! ${targetIds.size} prendas del viaje enviadas a colada y usos sumados.`);
  };

  // Prendas filtradas en la vista de Armario (Categoría, Ocasión/Plan, Olvidadas, Modo Temporada + Buscador)
  const filteredGarments = garments.filter(g => {
    const matchesCategory =
      selectedFilter === 'ALL'
        ? true
        : selectedFilter === 'UNWORN'
        ? (Number(g.wearCount) || 0) === 0
        : OCCASIONS.some(o => o.id === selectedFilter)
        ? Array.isArray(g.occasion) && g.occasion.includes(selectedFilter)
        : (g.subcategory || getDefaultSubcategory(g.category)) === selectedFilter;
    const matchesSeason =
      !seasonFilterActive || Math.abs((Number(g.warmth) || 3) - desiredWarmth) <= 2;
    const q = searchQuery.trim().toLowerCase();
    const matchesSearch =
      !q ||
      g.name?.toLowerCase().includes(q) ||
      g.color?.toLowerCase().includes(q) ||
      g.subcategory?.toLowerCase().includes(q) ||
      (Array.isArray(g.occasion) && g.occasion.some(occ => occ.toLowerCase().includes(q)));
    return matchesCategory && matchesSeason && matchesSearch;
  });

  const laundryCount = garments.filter(g => g.inLaundry).length;
  const plannedDaysCount = WEEK_DAYS.filter(d => weeklyPlan[d.id]?.garmentIds?.length > 0).length;
  const unwornCount = garments.filter(g => (Number(g.wearCount) || 0) === 0).length;
  const activeClosetPercent =
    garments.length > 0
      ? Math.round(((garments.length - unwornCount) / garments.length) * 100)
      : 0;
  const topWornGarment =
    garments.length > 0
      ? [...garments].sort((a, b) => (Number(b.wearCount) || 0) - (Number(a.wearCount) || 0))[0]
      : null;

  // Analítica de Coste por Uso (CPW - Cost Per Wear)
  const pricedGarments = garments.filter(g => Number(g.price) > 0);
  const averageCPW =
    pricedGarments.length > 0
      ? (
          pricedGarments.reduce(
            (acc, g) => acc + Number(g.price) / Math.max(1, Number(g.wearCount) || 1),
            0
          ) / pricedGarments.length
        ).toFixed(1)
      : null;

  // Analítica de Huecos en el Armario Cápsula (Wardrobe Gaps)
  const wardrobeGaps = useMemo(() => analyzeWardrobeGaps(garments), [garments]);

  // ============================================================================
  // PANTALLA DE ACCESO EDITORIAL ("QUIET LUXURY") CON PERFILES DE 1 CLIC
  // ============================================================================
  if (!currentUser) {
    return (
      <div className="min-h-screen bg-[#FAF9F6] flex flex-col justify-center items-center p-5">
        <div className="max-w-md w-full bg-white rounded-3xl p-7 shadow-[0_8px_30px_rgb(15,23,42,0.06)] border border-slate-200/80 space-y-6">
          <div className="text-center space-y-2">
            <div className="w-12 h-12 rounded-2xl bg-slate-900 flex items-center justify-center mx-auto shadow-md">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
              Smart Closet
            </h1>
            <p className="text-xs font-medium text-slate-500">
              Tu armario cápsula digital y estilista personal inteligente
            </p>
          </div>

          {/* Acceso en 1 Toque si ya hay usuarios en el dispositivo */}
          {savedUsers.length > 0 && (
            <div className="space-y-2.5">
              <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Acceso directo a tu armario
              </p>
              <div className="grid grid-cols-1 gap-2">
                {savedUsers.map(u => (
                  <button
                    key={u.username}
                    type="button"
                    onClick={() => quickLoginUser(u)}
                    className="w-full p-3 rounded-2xl bg-[#FAF9F6] hover:bg-slate-100/80 border border-slate-200/80 hover:border-slate-300 flex items-center justify-between transition-all group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-slate-900 text-white font-bold flex items-center justify-center text-sm shadow-sm">
                        {(u.name || u.username).charAt(0).toUpperCase()}
                      </div>
                      <div className="text-left">
                        <p className="text-sm font-bold text-slate-900">
                          {u.name}
                        </p>
                        <p className="text-xs text-slate-400">@{u.username}</p>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-slate-900 group-hover:translate-x-0.5 transition-all" />
                  </button>
                ))}
              </div>
              <div className="relative py-1">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-slate-200/80"></div>
                </div>
                <div className="relative flex justify-center">
                  <span className="bg-white px-3 text-[11px] text-slate-400">o accede con otra cuenta</span>
                </div>
              </div>
            </div>
          )}

          {/* Pestañas Iniciar Sesión / Nuevo Armario */}
          <div className="grid grid-cols-2 gap-1.5 bg-slate-100 p-1.5 rounded-2xl">
            <button
              type="button"
              onClick={() => { setAuthMode('login'); setAuthError(''); setAuthPasswordConfirm(''); }}
              className={`py-2.5 text-xs font-bold rounded-xl transition-all ${
                authMode === 'login'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              Iniciar Sesión
            </button>
            <button
              type="button"
              onClick={() => { setAuthMode('register'); setAuthError(''); setAuthPasswordConfirm(''); }}
              className={`py-2.5 text-xs font-bold rounded-xl transition-all ${
                authMode === 'register'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              Nuevo Usuario
            </button>
          </div>

          <form onSubmit={handleAuthSubmit} className="space-y-4">
            {authMode === 'register' && (
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700">Tu Nombre</label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                  <input
                    type="text"
                    placeholder=""
                    value={authName}
                    onChange={(e) => setAuthName(e.target.value)}
                    className="w-full bg-[#FAF9F6] border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-sm text-slate-900 focus:outline-none focus:border-slate-900 focus:bg-white transition-all"
                  />
                </div>
              </div>
            )}

            {authMode === 'register' && (
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 flex items-center justify-between">
                  <span>Correo Electrónico</span>
                  <span className="text-[10px] text-slate-400 font-normal">Para confirmación y avisos</span>
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                  <input
                    type="email"
                    placeholder=""
                    value={authEmail}
                    onChange={(e) => setAuthEmail(e.target.value)}
                    autoComplete="email"
                    className="w-full bg-[#FAF9F6] border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-sm text-slate-900 focus:outline-none focus:border-slate-900 focus:bg-white transition-all"
                    required
                  />
                </div>
              </div>
            )}

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700">
                {authMode === 'login' ? 'Usuario o Correo' : 'Usuario'}
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="text"
                  placeholder=""
                  value={authUsername}
                  onChange={(e) => setAuthUsername(e.target.value)}
                  autoComplete="username"
                  autoCapitalize="none"
                  autoCorrect="off"
                  spellCheck={false}
                  className="w-full bg-[#FAF9F6] border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-sm text-slate-900 focus:outline-none focus:border-slate-900 focus:bg-white transition-all"
                  required
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700">
                Contraseña
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type={showAuthPassword ? 'text' : 'password'}
                  placeholder=""
                  value={authPassword}
                  onChange={(e) => setAuthPassword(e.target.value)}
                  autoComplete={authMode === 'login' ? 'current-password' : 'new-password'}
                  className="w-full bg-[#FAF9F6] border border-slate-200 rounded-xl pl-10 pr-11 py-2.5 text-sm text-slate-900 focus:outline-none focus:border-slate-900 focus:bg-white transition-all"
                  required={authMode === 'register'}
                />
                <button
                  type="button"
                  onClick={() => setShowAuthPassword(v => !v)}
                  aria-label={showAuthPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                  title={showAuthPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                  className="absolute right-2 top-1.5 p-1.5 rounded-lg text-slate-400 hover:text-slate-900 transition-colors"
                >
                  {showAuthPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {authMode === 'login' && isFirebaseConfigured() && (
                <div className="flex justify-end pt-1">
                  <button
                    type="button"
                    onClick={() => {
                      setShowForgotModal(true);
                      setForgotMsg('');
                      setForgotEmail(authEmail || (authUsername.includes('@') ? authUsername : ''));
                    }}
                    className="text-[11px] font-semibold text-slate-500 hover:text-slate-900 transition-colors"
                  >
                    ¿Has olvidado tu contraseña?
                  </button>
                </div>
              )}
            </div>

            {authMode === 'register' && (
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700">
                  Repetir contraseña
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                  <input
                    type={showAuthPassword ? 'text' : 'password'}
                    placeholder=""
                    value={authPasswordConfirm}
                    onChange={(e) => setAuthPasswordConfirm(e.target.value)}
                    autoComplete="new-password"
                    className="w-full bg-[#FAF9F6] border border-slate-200 rounded-xl pl-10 pr-11 py-2.5 text-sm text-slate-900 focus:outline-none focus:border-slate-900 focus:bg-white transition-all"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowAuthPassword(v => !v)}
                    aria-label={showAuthPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                    title={showAuthPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                    className="absolute right-2 top-1.5 p-1.5 rounded-lg text-slate-400 hover:text-slate-900 transition-colors"
                  >
                    {showAuthPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            )}

            {authMode === 'register' && (
              <>
                {/* Ficha Morfológica y de Estilo */}
                <div className="p-4 rounded-2xl bg-[#FAF9F6] border border-slate-200/80 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                      <ShoppingBag className="w-3.5 h-3.5 text-indigo-600" /> Perfil de Talla y Estilo
                    </span>
                    {estimateRecommendedSize(authWeight, authHeight, authGender) && (
                      <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-slate-900 text-white">
                        Talla est.: {estimateRecommendedSize(authWeight, authHeight, authGender)}
                      </span>
                    )}
                  </div>

                  {/* Hombre / Mujer */}
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-700">Género / Corte de prendas</label>
                    <div className="grid grid-cols-2 gap-2">
                      {[
                        { id: 'hombre', label: '👨 Hombre' },
                        { id: 'mujer', label: '👩 Mujer' }
                      ].map(g => (
                        <button
                          key={g.id}
                          type="button"
                          onClick={() => setAuthGender(g.id)}
                          className={`py-2 rounded-xl text-xs font-bold border transition-all ${
                            authGender === g.id
                              ? 'bg-slate-900 text-white border-slate-900 shadow-sm'
                              : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                          }`}
                        >
                          {g.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Peso (kg) y Altura (cm) */}
                  <div className="grid grid-cols-2 gap-2.5">
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-slate-700 flex items-center gap-1">
                        <Ruler className="w-3.5 h-3.5 text-slate-500" /> Altura (cm)
                      </label>
                      <input
                        type="number"
                        min="120"
                        max="230"
                        placeholder=""
                        value={authHeight}
                        onChange={(e) => setAuthHeight(e.target.value)}
                        className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-slate-900"
                        required
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-slate-700 flex items-center gap-1">
                        <Scale className="w-3.5 h-3.5 text-slate-500" /> Peso (kg)
                      </label>
                      <input
                        type="number"
                        min="35"
                        max="200"
                        step="0.5"
                        placeholder=""
                        value={authWeight}
                        onChange={(e) => setAuthWeight(e.target.value)}
                        className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-slate-900"
                        required
                      />
                    </div>
                  </div>

                  {/* Fecha de Nacimiento */}
                  <div className="space-y-1">
                    <div className="flex justify-between items-center">
                      <label className="text-xs font-semibold text-slate-700 flex items-center gap-1">
                        <Cake className="w-3.5 h-3.5 text-slate-500" /> Fecha de nacimiento
                      </label>
                      {calculateAgeFromBirthDate(authBirthDate) !== null && (
                        <span className="text-[11px] font-bold text-indigo-600">
                          {calculateAgeFromBirthDate(authBirthDate)} años
                        </span>
                      )}
                    </div>
                    <input
                      type="date"
                      value={authBirthDate}
                      onChange={(e) => setAuthBirthDate(e.target.value)}
                      className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-slate-900"
                      required
                    />
                  </div>
                </div>

                <label className="flex items-center gap-2.5 text-xs text-slate-600 cursor-pointer p-2.5 rounded-xl bg-[#FAF9F6] border border-slate-200/70">
                  <input
                    type="checkbox"
                    checked={requirePinOnQuickLogin}
                    onChange={(e) => setRequirePinOnQuickLogin(e.target.checked)}
                    className="w-4 h-4 rounded accent-slate-900"
                  />
                  <span>Exigir siempre mi contraseña al entrar desde el acceso rápido</span>
                </label>
              </>
            )}

            {authError && (
              <p className="text-xs font-medium text-rose-600 bg-rose-50 border border-rose-200 p-3 rounded-xl">
                {authError}
              </p>
            )}

            <button
              type="submit"
              disabled={authLoading}
              className="w-full py-3.5 bg-slate-900 hover:bg-slate-800 active:scale-[0.99] font-bold rounded-2xl text-sm text-white shadow-md transition-all flex items-center justify-center gap-2"
            >
              {authLoading && <RefreshCw className="w-4 h-4 animate-spin" />}
              <span>{authMode === 'login' ? 'Entrar a mi Armario' : 'Crear mi Armario'}</span>
            </button>

            {isFirebaseConfigured() && (
              <>
                <div className="relative py-1">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-slate-200/80"></div>
                  </div>
                  <div className="relative flex justify-center">
                    <span className="bg-white px-3 text-[11px] text-slate-400">o continuar con</span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleGoogleSignIn}
                  disabled={authLoading}
                  className="w-full py-3 px-4 rounded-2xl bg-white hover:bg-slate-50 border border-slate-200 hover:border-slate-300 flex items-center justify-center gap-2.5 text-xs font-bold text-slate-700 shadow-sm transition-all"
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"/>
                    <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z"/>
                    <path fill="#FBBC05" d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.99 0 12s.45 3.82 1.25 5.42l4.03-3.15z"/>
                    <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"/>
                  </svg>
                  <span>Continuar con Google</span>
                </button>
              </>
            )}
          </form>

          {/* Modal Recuperar Contraseña Firebase */}
          {showForgotModal && (
            <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
              <div className="max-w-sm w-full bg-white rounded-3xl p-6 shadow-2xl border border-slate-200/80 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-slate-900">Recuperar contraseña</h3>
                  <button
                    type="button"
                    onClick={() => setShowForgotModal(false)}
                    className="p-1 rounded-lg text-slate-400 hover:text-slate-700"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
                <p className="text-xs text-slate-500">
                  Introduce tu correo electrónico y te enviaremos un enlace oficial para restablecer tu contraseña.
                </p>
                <form onSubmit={handleSendResetPassword} className="space-y-3">
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                    <input
                      type="email"
                      placeholder="tu@email.com"
                      value={forgotEmail}
                      onChange={(e) => setForgotEmail(e.target.value)}
                      className="w-full bg-[#FAF9F6] border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-slate-900"
                      required
                    />
                  </div>
                  {forgotMsg && (
                    <p className="text-xs text-slate-700 bg-slate-100 p-2.5 rounded-xl border border-slate-200">
                      {forgotMsg}
                    </p>
                  )}
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setShowForgotModal(false)}
                      className="flex-1 py-2 rounded-xl text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200"
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      className="flex-1 py-2 rounded-xl text-xs font-bold text-white bg-slate-900 hover:bg-slate-800"
                    >
                      Enviar enlace
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  // ============================================================================
  // APLICACIÓN PRINCIPAL — SISTEMA DE DISEÑO EDITORIAL UNIFICADO
  // ============================================================================
  return (
    <div className="max-w-md mx-auto min-h-screen bg-[#FAF9F6] text-slate-900 flex flex-col pb-28 shadow-[0_0_50px_rgba(15,23,42,0.06)] border-x border-slate-200/70 relative">
      {/* Notificación flotante (Toast) */}
      {toastMsg && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 bg-slate-900 text-white px-4 py-2.5 rounded-full text-xs font-semibold shadow-xl flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Cabecera Editorial Minimalista */}
      <header className="px-5 pt-4 pb-3.5 bg-white/90 backdrop-blur-xl sticky top-0 z-20 border-b border-slate-200/70 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setShowProfileModal(true)}
            title="Editar mi ficha de talla, altura y peso"
            className="w-9 h-9 rounded-full bg-slate-900 flex items-center justify-center text-white font-bold text-xs shadow-sm hover:bg-indigo-600 transition-colors"
          >
            {(currentUser.name || currentUser.username).charAt(0).toUpperCase()}
          </button>
          <div>
            <div className="flex items-center gap-1.5">
              <h1 className="text-sm font-extrabold text-slate-900 tracking-tight">
                {currentUser.name}
              </h1>
              <button
                type="button"
                onClick={() => setShowProfileModal(true)}
                className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200/80 hover:bg-slate-200 transition-colors"
              >
                {estimateRecommendedSize(currentUser.weightKg, currentUser.heightCm, currentUser.gender)
                  ? `Talla ${estimateRecommendedSize(currentUser.weightKg, currentUser.heightCm, currentUser.gender)}`
                  : 'Medidas'}
              </button>
            </div>
            <div className="flex items-center gap-1.5 text-[11px] text-slate-500 font-medium mt-0.5">
              <MapPin className="w-3 h-3 text-slate-400" />
              <span>{locationName}</span>
              <span>•</span>
              <span className="text-slate-700 font-semibold">{temp}°C</span>
              {isRaining && <Droplets className="w-3 h-3 text-sky-500" />}
            </div>
          </div>
        </div>

        <button
          onClick={handleLogout}
          title="Cambiar de usuario"
          className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900 bg-slate-100/80 hover:bg-slate-200/70 px-3 py-2 rounded-full transition-colors"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>Salir</span>
        </button>
      </header>

      {/* Aviso de confirmación de correo electrónico */}
      {emailNotice && (
        <div className="mx-4 mt-3 p-3.5 rounded-2xl bg-indigo-50 border border-indigo-200/80 flex items-start justify-between gap-3 text-xs text-indigo-950">
          <div className="flex items-start gap-2.5">
            <Mail className="w-4 h-4 text-indigo-600 mt-0.5 shrink-0" />
            <div>
              <p className="font-bold">Verificación de correo enviada</p>
              <p className="text-[11px] text-indigo-800 mt-0.5">{emailNotice}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setEmailNotice('')}
            className="p-1 rounded-lg text-indigo-400 hover:text-indigo-900"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Modal de Ficha Morfológica y Perfil Personal */}
      {showProfileModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl border border-slate-100">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                  <User className="w-5 h-5 text-slate-900" /> Mi Perfil y Medidas
                </h3>
                <p className="text-[11px] text-slate-500">
                  Personaliza tus datos para ajustar tus recomendaciones
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowProfileModal(false)}
                className="p-1.5 bg-slate-100 text-slate-500 hover:text-slate-800 rounded-full"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleUpdateUserProfile} className="space-y-3.5">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">Género / Corte preferido</label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { id: 'hombre', label: '👨 Hombre' },
                    { id: 'mujer', label: '👩 Mujer' }
                  ].map(g => (
                    <button
                      key={g.id}
                      type="button"
                      onClick={() => setCurrentUser(prev => ({ ...prev, gender: g.id }))}
                      className={`py-2 rounded-xl text-xs font-bold border transition-all ${
                        (currentUser.gender || 'hombre') === g.id
                          ? 'bg-slate-900 text-white border-slate-900 shadow-sm'
                          : 'bg-slate-50 text-slate-600 border-slate-200'
                      }`}
                    >
                      {g.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 flex items-center gap-1">
                    <Ruler className="w-3.5 h-3.5 text-slate-500" /> Altura (cm)
                  </label>
                  <input
                    type="number"
                    min="120"
                    max="230"
                    placeholder=""
                    value={currentUser.heightCm || ''}
                    onChange={(e) => setCurrentUser(prev => ({ ...prev, heightCm: e.target.value ? Number(e.target.value) : '' }))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-slate-900"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 flex items-center gap-1">
                    <Scale className="w-3.5 h-3.5 text-slate-500" /> Peso (kg)
                  </label>
                  <input
                    type="number"
                    min="35"
                    max="200"
                    step="0.5"
                    placeholder=""
                    value={currentUser.weightKg || ''}
                    onChange={(e) => setCurrentUser(prev => ({ ...prev, weightKg: e.target.value ? Number(e.target.value) : '' }))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-slate-900"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <div className="flex justify-between items-center">
                  <label className="text-xs font-bold text-slate-700 flex items-center gap-1">
                    <Cake className="w-3.5 h-3.5 text-slate-500" /> Fecha de nacimiento
                  </label>
                  {calculateAgeFromBirthDate(currentUser.birthDate) !== null && (
                    <span className="text-xs font-bold text-indigo-600">
                      {calculateAgeFromBirthDate(currentUser.birthDate)} años
                    </span>
                  )}
                </div>
                <input
                  type="date"
                  value={currentUser.birthDate || ''}
                  onChange={(e) => setCurrentUser(prev => ({ ...prev, birthDate: e.target.value }))}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-slate-900"
                />
              </div>

              {estimateRecommendedSize(currentUser.weightKg, currentUser.heightCm, currentUser.gender) && (
                <div className="p-3 rounded-2xl bg-[#FAF9F6] border border-slate-200 flex items-center justify-between text-xs">
                  <span className="font-semibold text-slate-700">Tu talla orientativa:</span>
                  <span className="font-extrabold text-slate-900 bg-white px-2.5 py-1 rounded-xl border border-slate-200">
                    {estimateRecommendedSize(currentUser.weightKg, currentUser.heightCm, currentUser.gender)}
                  </span>
                </div>
              )}

              <label className="flex items-center gap-2.5 text-xs text-slate-600 cursor-pointer p-2.5 rounded-xl bg-slate-50 border border-slate-200/70">
                <input
                  type="checkbox"
                  checked={Boolean(currentUser.requirePinOnQuickLogin)}
                  onChange={(e) =>
                    setCurrentUser(prev => ({
                      ...prev,
                      requirePinOnQuickLogin: e.target.checked
                    }))
                  }
                  className="w-4 h-4 rounded accent-slate-900"
                />
                <span>Pedir siempre contraseña al cambiar de usuario</span>
              </label>

              <button
                type="submit"
                className="w-full py-3 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-2xl text-xs shadow-md transition-all flex items-center justify-center gap-1.5"
              >
                <Check className="w-4 h-4" />
                <span>Guardar Perfil</span>
              </button>

              {/* Centro de Privacidad y Control de Datos del Usuario */}
              <div className="pt-2 border-t border-slate-100 space-y-2">
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" /> Privacidad y Control de tus Datos
                </p>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={handleExportUserData}
                    className="py-2 px-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] font-bold flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <Download className="w-3.5 h-3.5" /> Exportar mis datos
                  </button>
                  <button
                    type="button"
                    onClick={handleDeleteUserAccountPermanently}
                    className="py-2 px-2.5 rounded-xl bg-rose-50 hover:bg-rose-600 text-rose-600 hover:text-white border border-rose-200 text-[11px] font-bold flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" /> Eliminar cuenta
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =====================================================================
          VISTA 1: GENERADOR DE OUTFITS ("HOY")
      ====================================================================== */}
      {activeTab === 'generator' && (
        <main className="p-4 flex-1 space-y-4">
          {/* Mejora 1: Briefing Matutino Automático */}
          {morningBriefingMsg && (
            <div className="p-3.5 rounded-2xl bg-white border border-slate-200/80 shadow-sm flex items-center justify-between gap-2.5">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 border border-amber-200/60 flex items-center justify-center shrink-0">
                  <Sun className="w-4 h-4" />
                </div>
                <p className="text-xs font-semibold text-slate-800 leading-snug">
                  {morningBriefingMsg}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setMorningBriefingMsg('')}
                className="p-1 text-slate-400 hover:text-slate-600 shrink-0"
                title="Cerrar aviso matutino"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Panel de Selección Rápida */}
          <section className="bg-white p-5 rounded-3xl shadow-[0_2px_16px_-4px_rgba(15,23,42,0.05)] border border-slate-200/80 space-y-4">
            {/* Píldora de Prenda Ancla si el usuario fijó una prenda desde Mi Armario */}
            {lockedGarment && (
              <div className="p-3 rounded-2xl bg-[#FAF9F6] border border-slate-200 flex items-center justify-between gap-2.5">
                <div className="flex items-center gap-2.5 min-w-0">
                  <img
                    src={lockedGarment.image}
                    alt={lockedGarment.name}
                    className="w-10 h-10 rounded-xl object-cover border border-slate-200 shrink-0"
                  />
                  <div className="min-w-0">
                    <p className="text-[10px] font-extrabold uppercase tracking-wider text-indigo-600">
                      📌 Prenda Ancla Fijada
                    </p>
                    <p className="text-xs font-bold text-slate-900 truncate">
                      {lockedGarment.name}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setLockedGarment(null)}
                  className="px-2.5 py-1 rounded-xl bg-white hover:bg-rose-50 text-slate-600 hover:text-rose-600 border border-slate-200 text-[11px] font-bold shrink-0 transition-colors"
                >
                  Soltar ✕
                </button>
              </div>
            )}

            {/* 1. ¿Para qué ocasión? (9 Opciones de Estilo y Plan) */}
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  1. ¿Qué plan u ocasión tienes hoy?
                </label>
                <span className="text-[10px] font-bold text-slate-500">
                  {OCCASIONS.find(o => o.id === selectedOccasion)?.label}
                </span>
              </div>
              <div className="grid grid-cols-3 gap-1.5">
                {OCCASIONS.map((occ) => {
                  const Icon = occ.icon;
                  const active = selectedOccasion === occ.id;
                  return (
                    <button
                      key={occ.id}
                      onClick={() => setSelectedOccasion(occ.id)}
                      className={`py-2 px-1.5 rounded-2xl font-bold text-xs flex flex-col items-center justify-center gap-1 border transition-all ${
                        active
                          ? 'bg-slate-900 text-white border-slate-900 shadow-sm'
                          : 'bg-[#FAF9F6] text-slate-600 border-slate-200/80 hover:bg-slate-100'
                      }`}
                    >
                      <Icon className={`w-4 h-4 ${active ? 'text-amber-300' : 'text-slate-500'}`} />
                      <span className="text-[11px] truncate tracking-tight">{occ.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 2. Sensación térmica + Modificador de Lluvia combinable */}
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  2. Clima y Abrigo deseado
                </label>
                <span className="text-[11px] font-semibold text-slate-600">
                  {locationName}: {temp}°C
                </span>
              </div>
              <div className="grid grid-cols-3 gap-2">
                {WARMTH_LEVELS.map((lvl) => {
                  const Icon = lvl.icon;
                  const active =
                    (lvl.value === 1 && desiredWarmth <= 2) ||
                    (lvl.value === 3 && desiredWarmth === 3) ||
                    (lvl.value === 5 && desiredWarmth >= 4);
                  return (
                    <button
                      key={lvl.value}
                      type="button"
                      onClick={() => setDesiredWarmth(lvl.value)}
                      className={`p-2.5 rounded-2xl border text-left transition-all flex items-center gap-2 ${
                        active
                          ? 'bg-slate-900 border-slate-900 text-white shadow-sm'
                          : 'bg-[#FAF9F6] border-slate-200/80 text-slate-600 hover:bg-slate-100'
                      }`}
                    >
                      <Icon className={`w-4 h-4 shrink-0 ${active ? 'text-amber-300' : 'text-slate-400'}`} />
                      <div className="min-w-0">
                        <p className="text-xs font-bold leading-tight truncate">{lvl.label}</p>
                        <p className={`text-[10px] truncate ${active ? 'text-slate-300' : 'text-slate-400'}`}>
                          {lvl.desc}
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Botón Lluvioso combinable con cualquiera de los 3 niveles térmicos */}
              <button
                type="button"
                onClick={() => {
                  const nextRaining = !isRaining;
                  setIsRaining(nextRaining);
                  showToast(
                    nextRaining
                      ? '🌧️ Modo lluvia activado: prioriza abrigo impermeable / chubasquero'
                      : '☀️ Modo seco activado'
                  );
                }}
                className={`w-full py-2.5 px-3.5 rounded-2xl border text-xs font-bold flex items-center justify-between transition-all ${
                  isRaining
                    ? 'bg-sky-50 border-sky-300 text-sky-950 ring-1 ring-sky-400/30 shadow-xs'
                    : 'bg-[#FAF9F6] border-slate-200/80 text-slate-600 hover:bg-slate-100'
                }`}
              >
                <div className="flex items-center gap-2">
                  <CloudRain className={`w-4 h-4 ${isRaining ? 'text-sky-600' : 'text-slate-400'}`} />
                  <span className="font-bold">🌧️ ¿Tiempo Lluvioso o amenaza lluvia?</span>
                </div>
                <span
                  className={`text-[10px] px-2.5 py-0.5 rounded-full font-extrabold ${
                    isRaining
                      ? 'bg-sky-600 text-white'
                      : 'bg-slate-200 text-slate-600'
                  }`}
                >
                  {isRaining ? 'Lluvia Activada' : 'Sin Lluvia'}
                </span>
              </button>
            </div>

            {/* Botón Principal de Generar */}
            <button
              onClick={() => generateOutfit()}
              disabled={generating}
              className="w-full py-3.5 bg-slate-900 hover:bg-indigo-600 active:scale-[0.99] text-white font-bold rounded-2xl text-xs flex justify-center items-center gap-2 shadow-md transition-all"
            >
              {generating ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                <Sparkles className="w-4 h-4 text-amber-300" />
              )}
              <span>
                {generating
                  ? 'Combinando tu ropa...'
                  : lockedGarment
                  ? `Combinar mi "${lockedGarment.name}"`
                  : 'Recomendarme mi Outfit de Hoy'}
              </span>
            </button>
          </section>

          {/* Resultado del Outfit */}
          {currentOutfit ? (
            <section className="bg-white p-5 rounded-3xl shadow-[0_2px_16px_-4px_rgba(15,23,42,0.05)] border border-slate-200/80 space-y-4">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-sm font-extrabold text-slate-900">Tu Look Recomendado</h3>
                  <p className="text-[11px] text-slate-500">
                    Toca 🔄 en cualquier prenda para cambiar solo esa pieza
                  </p>
                </div>
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={handleShareLook}
                    className="px-3 py-1.5 text-indigo-700 bg-indigo-50 hover:bg-indigo-100 rounded-full text-xs font-bold flex items-center gap-1.5 transition-colors border border-indigo-100 shadow-2xs"
                    title="Compartir este look"
                  >
                    <Share2 className="w-3.5 h-3.5" /> Compartir
                  </button>
                  <button
                    onClick={() => generateOutfit()}
                    className="px-3 py-1.5 text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-full text-xs font-bold flex items-center gap-1 transition-colors"
                    title="Generar otra combinación completa"
                  >
                    <RefreshCw className="w-3.5 h-3.5" /> Otro
                  </button>
                </div>
              </div>

              {/* Grid Editorial de Prendas del Outfit (Proporción Vertical 4:5) */}
              <div className="grid grid-cols-2 gap-3">
                {currentOutfit.map((item) => {
                  const slot = getSlotFromType(item.subcategory, item.category);
                  const typeLabel =
                    GARMENT_TYPES.find(t => t.id === item.subcategory)?.singular ||
                    item.subcategory ||
                    item.category;

                  return (
                    <div
                      key={item.id}
                      className="bg-white rounded-2xl overflow-hidden border border-slate-200/80 relative group flex flex-col shadow-sm"
                    >
                      <div className="relative aspect-[4/5] bg-[#F4F3EF]">
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-full h-full object-cover"
                        />
                        <button
                          type="button"
                          onClick={() => swapSingleOutfitItem(slot, item.id)}
                          title="Cambiar solo esta prenda"
                          className="absolute top-2.5 right-2.5 bg-white/95 hover:bg-slate-900 text-slate-700 hover:text-white p-1.5 rounded-full shadow-sm border border-slate-200/60 transition-colors"
                        >
                          <RefreshCw className="w-3.5 h-3.5" />
                        </button>
                        <span className="absolute bottom-2 left-2 bg-white/95 backdrop-blur-md text-slate-800 text-[10px] font-bold px-2.5 py-0.5 rounded-full shadow-sm border border-slate-200/60">
                          {typeLabel}
                        </span>
                      </div>
                      <div className="p-2.5">
                        <p className="text-xs font-bold text-slate-900 truncate">{item.name}</p>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <span
                            className="w-2.5 h-2.5 rounded-full border border-slate-300 shrink-0"
                            style={{ backgroundColor: getColorHex(item.color) }}
                          />
                          <p className="text-[11px] text-slate-500 truncate">{item.color}</p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {aiNote && (
                <div className="p-3.5 bg-indigo-50/70 border border-indigo-100 rounded-2xl text-xs text-indigo-950 flex items-start gap-2.5">
                  <Sparkles className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
                  <p className="leading-relaxed">{aiNote}</p>
                </div>
              )}

              {/* Atajo para Planificar este Outfit en un Día de la Semana */}
              <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-3.5 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-extrabold text-slate-700 flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-indigo-600" />
                    Guardar este look en tu Semana:
                  </span>
                  <button
                    type="button"
                    onClick={() => setActiveTab('planner')}
                    className="text-[11px] font-bold text-indigo-600 hover:underline"
                  >
                    Ver calendario →
                  </button>
                </div>
                <div className="grid grid-cols-7 gap-1.5">
                  {WEEK_DAYS.map(day => {
                    const isAssignedHere =
                      weeklyPlan[day.id]?.garmentIds?.join('-') ===
                      currentOutfit.map(g => String(g.id)).join('-');
                    return (
                      <button
                        type="button"
                        key={day.id}
                        onClick={() => assignCurrentOutfitToDay(day.id)}
                        className={`py-2 rounded-xl text-[11px] font-extrabold transition-all border ${
                          isAssignedHere
                            ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                            : 'bg-white text-slate-700 border-slate-200 hover:border-indigo-400 hover:text-indigo-600'
                        }`}
                      >
                        {day.id}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Valoración de 0 a 10 Estrellas + Aceptar / Rechazar */}
              <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200/80 space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-bold text-slate-700">
                      Puntúa este look (0 a 10):
                    </span>
                    <span className="text-xs font-extrabold text-amber-600 bg-amber-100 px-2.5 py-0.5 rounded-full">
                      {outfitRating} / 10 ⭐
                    </span>
                  </div>

                  <div className="flex items-center justify-between gap-0.5 bg-white p-2 rounded-xl border border-slate-200/70">
                    <button
                      type="button"
                      onClick={() => setOutfitRating(0)}
                      className={`px-2 py-1 rounded-lg text-xs font-bold transition-all ${
                        outfitRating === 0
                          ? 'bg-rose-600 text-white'
                          : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                      }`}
                    >
                      0
                    </button>
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((val) => (
                      <button
                        type="button"
                        key={val}
                        onClick={() => setOutfitRating(val)}
                        className="p-0.5 focus:outline-none active:scale-125 transition-transform"
                      >
                        <Star
                          className={`w-5 h-5 ${
                            val <= outfitRating
                              ? 'text-amber-400 fill-amber-400'
                              : 'text-slate-200 fill-slate-200'
                          }`}
                        />
                      </button>
                    ))}
                  </div>
                </div>

                {/* Botones editoriales de Decisión */}
                <div className="space-y-2">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => handleAcceptOutfit('wear_clean')}
                      className="py-3 px-3 bg-slate-900 hover:bg-slate-800 active:scale-[0.99] text-white font-bold rounded-2xl text-xs flex items-center justify-center gap-1.5 shadow-sm transition-all"
                      title="Suma 1 uso para amortizar el precio (CPW) y mantiene las prendas limpias para repetir look"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                      <span>Me lo pongo (sigue limpia)</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleAcceptOutfit('wear_and_laundry')}
                      className="py-3 px-3 bg-emerald-700 hover:bg-emerald-800 active:scale-[0.99] text-white font-bold rounded-2xl text-xs flex items-center justify-center gap-1.5 shadow-sm transition-all"
                      title="Suma 1 uso al CPW y envía las prendas a la colada"
                    >
                      <WashingMachine className="w-3.5 h-3.5 text-emerald-200" />
                      <span>Usar y a la colada</span>
                    </button>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => handleAcceptOutfit('favorite_only')}
                      className="py-2.5 px-3 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all shadow-2xs"
                    >
                      <ThumbsUp className="w-3.5 h-3.5 text-emerald-600" /> Solo guardar nota
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        if (!showRejectPanel && outfitRating > 4) setOutfitRating(3);
                        setShowRejectPanel(!showRejectPanel);
                      }}
                      className={`py-2.5 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 border transition-all ${
                        showRejectPanel
                          ? 'bg-rose-600 text-white border-rose-600'
                          : 'bg-white hover:bg-rose-50 text-rose-600 border-rose-200 shadow-2xs'
                      }`}
                    >
                      <ThumbsDown className="w-3.5 h-3.5" /> Rechazar look
                    </button>
                  </div>
                </div>

                {/* Panel de Feedback en 1 toque cuando se rechaza */}
                {showRejectPanel && (
                  <form
                    onSubmit={handleRejectSubmit}
                    className="bg-white border border-rose-200 rounded-2xl p-4 space-y-3 shadow-sm"
                  >
                    <div className="flex justify-between items-center">
                      <p className="text-xs font-extrabold text-rose-700 flex items-center gap-1.5">
                        <MessageSquarePlus className="w-4 h-4" /> ¿Qué cambiarías para la próxima vez?
                      </p>
                      <button
                        type="button"
                        onClick={() => setShowRejectPanel(false)}
                        className="text-slate-400 hover:text-slate-600"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="flex flex-wrap gap-1.5">
                      {FEEDBACK_REASONS.map(reason => {
                        const active = selectedReasons.includes(reason.id);
                        return (
                          <button
                            type="button"
                            key={reason.id}
                            onClick={() => toggleReason(reason.id)}
                            className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
                              active
                                ? 'bg-rose-600 text-white border-rose-600 shadow-sm'
                                : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                            }`}
                          >
                            {reason.label}
                          </button>
                        );
                      })}
                    </div>

                    <input
                      type="text"
                      placeholder="Nota opcional (ej: no pegar pantalón beige con deportivas)..."
                      value={customFeedbackText}
                      onChange={(e) => setCustomFeedbackText(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-rose-400 focus:bg-white"
                    />

                    <button
                      type="submit"
                      className="w-full py-3 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl text-xs shadow transition-all"
                    >
                      Aprender de mi feedback y proponer otro Outfit
                    </button>
                  </form>
                )}
              </div>
            </section>
          ) : (
            <div className="bg-white rounded-3xl p-8 text-center border border-slate-200/70 space-y-2">
              <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto">
                <Shirt className="w-6 h-6" />
              </div>
              <p className="text-sm font-bold text-slate-800">¿Listo para vestirte?</p>
              <p className="text-xs text-slate-500">
                Elige tu plan arriba y pulsa el botón morado para recibir tu recomendación.
              </p>
            </div>
          )}

          {/* Historial compacto de gustos aprendidos */}
          {feedbackHistory.length > 0 && (
            <section className="bg-white border border-slate-200/70 rounded-3xl p-4 space-y-3">
              <div className="flex justify-between items-center">
                <h4 className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                  <History className="w-4 h-4 text-indigo-600" /> Tus Valoraciones Recientes ({feedbackHistory.length})
                </h4>
                <button
                  onClick={() => updateUserFeedback([])}
                  className="text-[11px] text-slate-400 hover:text-rose-600 font-medium"
                >
                  Borrar historial
                </button>
              </div>
              <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
                {feedbackHistory.slice(0, 4).map(item => (
                  <div
                    key={item.id}
                    className="p-2.5 rounded-2xl bg-slate-50 border border-slate-200/60 text-xs flex items-center justify-between gap-2"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="font-semibold text-slate-800 truncate">{item.summary}</p>
                      {item.comment && (
                        <p className="text-[11px] text-slate-500 truncate">{item.comment}</p>
                      )}
                    </div>
                    <span
                      className={`shrink-0 px-2.5 py-1 rounded-full font-bold text-[11px] ${
                        item.status === 'accepted'
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-rose-100 text-rose-800'
                      }`}
                    >
                      ⭐ {typeof item.rating === 'number' ? `${item.rating}/10` : item.status}
                    </span>
                  </div>
                ))}
              </div>
            </section>
          )}
        </main>
      )}

      {/* =====================================================================
          VISTA 1.5: CALENDARIO / PLANIFICADOR SEMANAL DE OUTFITS ("SEMANA")
      ====================================================================== */}
      {activeTab === 'planner' && (
        <main className="p-4 flex-1 space-y-4">
          {/* Cabecera Editorial Limpia del Planificador Semanal */}
          <section className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-[0_2px_16px_-4px_rgba(15,23,42,0.05)] space-y-4">
            <div className="flex justify-between items-start gap-3">
              <div>
                <h2 className="text-base font-extrabold text-slate-900 flex items-center gap-2 tracking-tight">
                  <Calendar className="w-5 h-5 text-indigo-600" />
                  <span>Calendario Semanal</span>
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  {plannedDaysCount} de 7 días planificados sin repetir parte superior seguida
                </p>
              </div>
              <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200/70 shrink-0">
                {plannedDaysCount}/7 días
              </span>
            </div>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={generateFullWeekPlan}
                className="flex-1 py-3 px-4 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow-md shadow-slate-900/10 flex items-center justify-center gap-2 transition-all active:scale-[0.99]"
              >
                <Sparkles className="w-4 h-4 text-amber-300" />
                <span>Generar Semana Completa con IA</span>
              </button>
              {plannedDaysCount > 0 && (
                <button
                  type="button"
                  onClick={resetFullWeekPlan}
                  title="Resetear o vaciar la semana para empezar de nuevo"
                  className="py-3 px-3.5 rounded-2xl bg-[#FAF9F6] hover:bg-rose-50 text-slate-700 hover:text-rose-600 border border-slate-200/80 font-bold text-xs flex items-center gap-1.5 transition-colors shrink-0"
                >
                  <RotateCcw className="w-4 h-4" />
                  <span>Resetear</span>
                </button>
              )}
            </div>

            <p className="text-[11px] text-slate-500 leading-relaxed">
              💡 <strong>Flexibilidad total:</strong> No tienes que esperar a que pasen 7 días. Puedes regenerar cualquier día suelto, cambiar su ocasión o pulsar <strong>Resetear</strong> para empezar de nuevo cuando quieras.
            </p>

            {/* Cinta de Días Lunes a Domingo (Clean Studio) */}
            <div className="grid grid-cols-7 gap-1.5 bg-[#FAF9F6] p-1.5 rounded-2xl border border-slate-200/80">
              {WEEK_DAYS.map(day => {
                const isSelected = selectedDay === day.id;
                const dayPlan = weeklyPlan[day.id];
                const hasPlan = dayPlan?.garmentIds?.length > 0;
                return (
                  <button
                    key={day.id}
                    type="button"
                    onClick={() => setSelectedDay(day.id)}
                    className={`relative flex flex-col items-center justify-center py-2.5 rounded-xl text-xs font-bold transition-all ${
                      isSelected
                        ? 'bg-slate-900 text-white shadow-sm'
                        : hasPlan
                        ? 'bg-white text-slate-800 border border-slate-200/80 hover:border-slate-300'
                        : 'text-slate-400 hover:bg-white/70 hover:text-slate-700'
                    }`}
                  >
                    <span>{day.id}</span>
                    <span
                      className={`mt-1 w-1.5 h-1.5 rounded-full ${
                        dayPlan?.completed
                          ? 'bg-amber-500'
                          : hasPlan
                          ? isSelected
                            ? 'bg-emerald-400'
                            : 'bg-emerald-500'
                          : 'bg-slate-200'
                      }`}
                    />
                  </button>
                );
              })}
            </div>
          </section>

          {/* Detalle del Día Seleccionado */}
          {(() => {
            const dayMeta = WEEK_DAYS.find(d => d.id === selectedDay) || WEEK_DAYS[0];
            const dayPlan = weeklyPlan[selectedDay];
            const plannedItems = (dayPlan?.garmentIds || [])
              .map(id => garments.find(g => String(g.id) === String(id)))
              .filter(Boolean);
            const activeOccasion = dayPlan?.occasion || dayMeta.defaultOccasion;

            return (
              <section className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-[0_2px_16px_-4px_rgba(15,23,42,0.05)] space-y-4">
                <div className="flex flex-wrap justify-between items-center gap-2 border-b border-slate-100 pb-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-extrabold text-slate-900">{dayMeta.full}</h3>
                      {dayPlan?.completed && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                          ✓ Usado
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-slate-500">
                      Elige el tipo de ocasión para este día:
                    </p>
                  </div>

                  {/* Selector rápido de Ocasión del Día (9 Opciones) */}
                  <div className="flex gap-1.5 bg-[#FAF9F6] p-1 rounded-xl border border-slate-200/70 overflow-x-auto no-scrollbar max-w-full">
                    {OCCASIONS.map(occ => {
                      const isOcc = activeOccasion === occ.id;
                      return (
                        <button
                          key={occ.id}
                          type="button"
                          onClick={() => generateSingleDayPlan(selectedDay, occ.id)}
                          className={`px-2.5 py-1 rounded-lg text-[11px] font-bold whitespace-nowrap transition-all ${
                            isOcc
                              ? 'bg-slate-900 text-white shadow-xs'
                              : 'text-slate-500 hover:text-slate-900'
                          }`}
                        >
                          {occ.emoji} {occ.label}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {plannedItems.length > 0 ? (
                  <>
                    <div className="grid grid-cols-2 gap-3">
                      {plannedItems.map(item => {
                        const typeObj = GARMENT_TYPES.find(t => t.id === item.subcategory);
                        return (
                          <div
                            key={item.id}
                            className="bg-white rounded-2xl overflow-hidden border border-slate-200/80 shadow-xs flex flex-col justify-between"
                          >
                            <div className="relative aspect-[4/5] bg-[#F4F3EF]">
                              <img
                                src={item.image}
                                alt={item.name}
                                className={`w-full h-full object-cover ${item.inLaundry ? 'opacity-50 grayscale-[25%]' : ''}`}
                              />
                              <span className="absolute bottom-2 left-2 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-white/90 text-slate-800 backdrop-blur-md border border-slate-200/60 shadow-2xs">
                                {typeObj?.emoji} {typeObj?.singular || item.subcategory}
                              </span>
                              {item.inLaundry && (
                                <span className="absolute top-2 right-2 px-2 py-0.5 rounded-full text-[9px] font-bold bg-amber-500 text-white shadow-xs">
                                  En colada
                                </span>
                              )}
                            </div>
                            <div className="p-2.5">
                              <p className="text-xs font-bold text-slate-900 truncate">{item.name}</p>
                              <div className="flex items-center gap-1.5 mt-0.5">
                                <span
                                  className="w-2.5 h-2.5 rounded-full ring-1 ring-slate-300 shrink-0"
                                  style={{ backgroundColor: getColorHex(item.color) }}
                                />
                                <span className="text-[10px] text-slate-500 truncate">{item.color}</span>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {dayPlan?.note && (
                      <p className="text-xs text-slate-700 bg-[#FAF9F6] border border-slate-200/80 rounded-2xl p-3 font-medium">
                        ✨ {dayPlan.note}
                      </p>
                    )}

                    <div className="flex flex-col sm:flex-row gap-2 pt-1">
                      <button
                        type="button"
                        onClick={() => wearPlannedDayOutfit(selectedDay, false)}
                        className="flex-1 py-2.5 px-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-sm transition-all"
                        title="Suma 1 uso al CPW y mantiene las prendas limpias"
                      >
                        <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                        <span>Usar Hoy (sigue limpia)</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => wearPlannedDayOutfit(selectedDay, true)}
                        className="flex-1 py-2.5 px-3 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-sm transition-all"
                        title="Suma 1 uso al CPW y envía las prendas a la colada"
                      >
                        <WashingMachine className="w-3.5 h-3.5 text-emerald-200" />
                        <span>Usar y a Colada</span>
                      </button>

                      <div className="flex gap-1.5">
                        <button
                          type="button"
                          onClick={() => generateSingleDayPlan(selectedDay)}
                          title="Regenerar look de este día"
                          className="bg-slate-100 hover:bg-slate-200 text-slate-700 p-2.5 rounded-xl border border-slate-200/80 transition-colors"
                        >
                          <RefreshCw className="w-4 h-4" />
                        </button>

                        <button
                          type="button"
                          onClick={() => clearPlannedDay(selectedDay)}
                          title="Limpiar este día"
                          className="bg-rose-50 hover:bg-rose-100 text-rose-600 p-2.5 rounded-xl border border-rose-200/60 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="text-center py-6 space-y-3">
                    <p className="text-xs text-slate-500">
                      Aún no has asignado ningún outfit para el <strong className="text-slate-900">{dayMeta.full}</strong>.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-2 justify-center">
                      <button
                        type="button"
                        onClick={() => generateSingleDayPlan(selectedDay)}
                        className="py-2.5 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-sm transition-all"
                      >
                        <Sparkles className="w-4 h-4 text-amber-300" /> Sugerir Look para {dayMeta.full}
                      </button>
                      {currentOutfit && (
                        <button
                          type="button"
                          onClick={() => assignCurrentOutfitToDay(selectedDay)}
                          className="py-2.5 px-4 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 text-xs font-bold flex items-center justify-center gap-1.5 transition-all"
                        >
                          <Check className="w-4 h-4" /> Asignar el Look de Hoy
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </section>
            );
          })()}

          {/* Atajo directo a la pestaña dedicada de Maleta de Viaje */}
          <section className="bg-white rounded-3xl p-4 border border-slate-200/80 shadow-xs flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-10 h-10 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 shrink-0">
                <Briefcase className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <h3 className="text-xs font-extrabold text-slate-900 truncate">
                  🧳 ¿Vas a hacer una escapada o viaje?
                </h3>
                <p className="text-[11px] text-slate-500 truncate">
                  Prepara tu maleta cápsula y checklist en la pestaña Viaje
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setActiveTab('travel')}
              className="px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-[11px] font-bold shrink-0 transition-colors"
            >
              Ir a Viaje →
            </button>
          </section>
        </main>
      )}

      {/* =====================================================================
          VISTA 1.8: PESTAÑA DEDICADA "VIAJE" — MALETA CÁPSULA Y CHECKLIST IA
      ====================================================================== */}
      {activeTab === 'travel' && (
        <main className="p-4 flex-1 space-y-4">
          {/* Cabecera Editorial de Maleta de Viaje */}
          <section className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-[0_2px_16px_-4px_rgba(15,23,42,0.05)] space-y-4">
            <div className="flex justify-between items-start gap-3">
              <div>
                <h2 className="text-base font-extrabold text-slate-900 flex items-center gap-2 tracking-tight">
                  <Briefcase className="w-5 h-5 text-indigo-600" />
                  <span>Maleta Cápsula de Viaje</span>
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Viaja ligero con las prendas clave de tu armario que combinan todas entre sí
                </p>
              </div>
              {capsuleItems.length > 0 && (
                <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 shrink-0">
                  {packedItemIds.length}/{capsuleItems.length} listas
                </span>
              )}
            </div>

            {/* Destino opcional */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-slate-600 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-indigo-600" /> Destino o nombre del viaje (opcional)
              </label>
              <input
                type="text"
                placeholder="Ej. Escapada a Madrid, Viaje de trabajo a Lisboa..."
                value={tripName}
                onChange={(e) => setTripName(e.target.value)}
                className="w-full bg-[#FAF9F6] border border-slate-200/90 rounded-2xl px-3.5 py-2.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-slate-900 transition-colors"
              />
            </div>

            {/* Selector de Duración (Días) */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-slate-600">1. ¿Cuántos días dura el viaje?</label>
              <div className="grid grid-cols-5 gap-1.5">
                {[2, 3, 5, 7, 10].map(d => (
                  <button
                    key={d}
                    type="button"
                    onClick={() => setTripDays(d)}
                    className={`py-2 rounded-xl text-xs font-bold border transition-all ${
                      tripDays === d
                        ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                        : 'bg-[#FAF9F6] text-slate-600 border-slate-200/80 hover:bg-slate-100'
                    }`}
                  >
                    {d} días
                  </button>
                ))}
              </div>
            </div>

            {/* Selector de Clima en Destino y Estilo Principal */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <div className="flex justify-between items-center">
                  <label className="text-[11px] font-bold text-slate-600">2. Clima en tu destino</label>
                  <button
                    type="button"
                    onClick={() => {
                      const next = !tripIsRaining;
                      setTripIsRaining(next);
                      showToast(next ? '🌧️ Previsión de lluvia añadida al viaje' : '☀️ Viaje en seco');
                    }}
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full border transition-all ${
                      tripIsRaining
                        ? 'bg-sky-50 text-sky-700 border-sky-300'
                        : 'bg-[#FAF9F6] text-slate-500 border-slate-200 hover:text-slate-800'
                    }`}
                  >
                    {tripIsRaining ? '🌧️ Con lluvia' : '☀️ Sin lluvia'}
                  </button>
                </div>
                <div className="grid grid-cols-3 gap-1.5">
                  {WARMTH_LEVELS.map(lvl => {
                    const active = tripWarmth === lvl.value;
                    return (
                      <button
                        key={lvl.value}
                        type="button"
                        onClick={() => setTripWarmth(lvl.value)}
                        className={`py-2 px-2 rounded-xl text-[11px] font-bold border transition-all ${
                          active
                            ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                            : 'bg-[#FAF9F6] text-slate-600 border-slate-200/80 hover:bg-slate-100'
                        }`}
                      >
                        {lvl.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="space-y-1.5">
                <div className="flex justify-between items-center">
                  <label className="text-[11px] font-bold text-slate-600">3. Plan del viaje</label>
                  <span className="text-[10px] font-bold text-slate-500">
                    {OCCASIONS.find(o => o.id === tripOccasion)?.label}
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-1.5 max-h-32 overflow-y-auto pr-0.5">
                  {OCCASIONS.map(occ => (
                    <button
                      key={occ.id}
                      type="button"
                      onClick={() => setTripOccasion(occ.id)}
                      className={`py-2 px-1 rounded-xl text-[10px] font-bold border truncate transition-all ${
                        tripOccasion === occ.id
                          ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                          : 'bg-[#FAF9F6] text-slate-600 border-slate-200/80 hover:bg-slate-100'
                      }`}
                    >
                      {occ.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={() => generateTravelCapsule(tripDays, tripOccasion, tripWarmth)}
              className="w-full py-3.5 px-4 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow-md shadow-slate-900/10 flex items-center justify-center gap-2 transition-all active:scale-[0.99]"
            >
              <Sparkles className="w-4 h-4 text-amber-300" />
              <span>
                Generar Maleta Inteligente para {tripDays} días {tripName ? `en ${tripName}` : ''}
              </span>
            </button>
          </section>

          {/* Checklist Interactivo de Maleta */}
          {capsuleItems.length > 0 ? (
            <section className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-[0_2px_16px_-4px_rgba(15,23,42,0.05)] space-y-4">
              {(() => {
                const topsCount = capsuleItems.filter(
                  g => getSlotFromType(g.subcategory, g.category) === 'Top'
                ).length;
                const bottomsCount = capsuleItems.filter(
                  g => getSlotFromType(g.subcategory, g.category) === 'Bottom'
                ).length;
                const outfitCombos = Math.max(1, topsCount * bottomsCount);
                const progressPct = Math.round((packedItemIds.length / capsuleItems.length) * 100);

                return (
                  <>
                    <div className="flex flex-wrap justify-between items-center gap-2 border-b border-slate-100 pb-3">
                      <div>
                        <h3 className="text-sm font-extrabold text-slate-900">
                          {tripName ? `🧳 Maleta para ${tripName}` : `🧳 Tu Checklist de Maleta (${tripDays} días)`}
                        </h3>
                        <p className="text-[11px] text-indigo-600 font-semibold">
                          ✨ Con estas {capsuleItems.length} prendas creas hasta {outfitCombos} looks distintos
                        </p>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={handleShareTravelCapsule}
                          className="px-3 py-1.5 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-xs font-bold text-indigo-700 transition-colors flex items-center gap-1 border border-indigo-100 shadow-2xs"
                          title="Compartir checklist de la maleta"
                        >
                          <Share2 className="w-3.5 h-3.5" /> Compartir
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            if (packedItemIds.length === capsuleItems.length) {
                              setPackedItemIds([]);
                            } else {
                              setPackedItemIds(capsuleItems.map(c => String(c.id)));
                            }
                          }}
                          className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-xs font-bold text-slate-700 transition-colors"
                        >
                          {packedItemIds.length === capsuleItems.length ? 'Desmarcar todo' : '✓ Marcar todas'}
                        </button>
                      </div>
                    </div>

                    {/* Barra de progreso de empacado */}
                    <div className="space-y-1.5">
                      <div className="flex justify-between text-[11px] font-bold">
                        <span className="text-slate-500">Progreso de tu maleta</span>
                        <span className="text-emerald-600">
                          {packedItemIds.length} de {capsuleItems.length} prendas listas ({progressPct}%)
                        </span>
                      </div>
                      <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-emerald-500 transition-all duration-300"
                          style={{ width: `${progressPct}%` }}
                        />
                      </div>
                    </div>

                    <p className="text-[11px] text-slate-500">
                      Toca cada prenda cuando la metas en la maleta o pulsa 🔄 si prefieres llevar otra:
                    </p>

                    <div className="grid grid-cols-2 gap-3">
                      {capsuleItems.map(item => {
                        const isPacked = packedItemIds.includes(String(item.id));
                        const typeObj = GARMENT_TYPES.find(t => t.id === item.subcategory);
                        return (
                          <div
                            key={item.id}
                            onClick={() => togglePackItem(item.id)}
                            className={`cursor-pointer rounded-2xl overflow-hidden border transition-all flex flex-col justify-between ${
                              isPacked
                                ? 'bg-emerald-50/40 border-emerald-400 ring-1 ring-emerald-500/20'
                                : 'bg-white border-slate-200/80 hover:border-slate-300 shadow-2xs'
                            }`}
                          >
                            <div className="relative aspect-[4/5] bg-[#F4F3EF]">
                              <img
                                src={item.image}
                                alt={item.name}
                                className={`w-full h-full object-cover transition-opacity ${
                                  isPacked ? 'opacity-85' : ''
                                }`}
                              />
                              <span
                                className={`absolute top-2 left-2 px-2 py-0.5 rounded-full text-[9px] font-bold shadow-2xs ${
                                  isPacked
                                    ? 'bg-emerald-600 text-white'
                                    : 'bg-white/90 text-slate-700 backdrop-blur-md border border-slate-200/70'
                                }`}
                              >
                                {isPacked ? '✓ En maleta' : 'Pendiente'}
                              </span>
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  swapCapsuleItem(item);
                                }}
                                title="Cambiar por otra prenda de tu armario"
                                className="absolute top-2 right-2 p-1.5 rounded-full bg-white/90 hover:bg-slate-900 text-slate-700 hover:text-white border border-slate-200/70 shadow-2xs transition-colors"
                              >
                                <RefreshCw className="w-3.5 h-3.5" />
                              </button>
                              <span className="absolute bottom-2 left-2 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-white/90 text-slate-800 backdrop-blur-md border border-slate-200/60">
                                {typeObj?.emoji} {typeObj?.singular || item.subcategory}
                              </span>
                            </div>
                            <div className="p-2.5">
                              <p className="text-xs font-bold text-slate-900 truncate">{item.name}</p>
                              <div className="flex items-center gap-1.5 mt-0.5">
                                <span
                                  className="w-2.5 h-2.5 rounded-full ring-1 ring-slate-300 shrink-0"
                                  style={{ backgroundColor: getColorHex(item.color) }}
                                />
                                <p className="text-[10px] text-slate-500 truncate">{item.color}</p>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {/* Acciones de Fin de Viaje */}
                    <div className="flex flex-col sm:flex-row gap-2 pt-2">
                      <button
                        type="button"
                        onClick={finishTripAndSendToLaundry}
                        className="flex-1 py-3 px-4 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-sm transition-all"
                      >
                        <WashingMachine className="w-4 h-4 text-emerald-400" />
                        <span>Fin del viaje: Enviar maleta a Colada (+1 uso)</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setCapsuleItems([]);
                          setPackedItemIds([]);
                        }}
                        className="py-3 px-4 rounded-2xl bg-rose-50 hover:bg-rose-100 text-rose-600 text-xs font-bold border border-rose-200/70 transition-colors"
                      >
                        Vaciar maleta
                      </button>
                    </div>
                  </>
                );
              })()}
            </section>
          ) : (
            <div className="bg-white rounded-3xl p-8 text-center border border-slate-200/80 shadow-xs space-y-2">
              <div className="w-12 h-12 rounded-2xl bg-[#FAF9F6] border border-slate-200/80 text-slate-700 flex items-center justify-center mx-auto">
                <Briefcase className="w-6 h-6" />
              </div>
              <p className="text-sm font-bold text-slate-900">Tu maleta inteligente está lista para empezar</p>
              <p className="text-xs text-slate-500">
                Elige arriba los días, el clima de tu destino y el estilo del viaje para que la IA seleccione qué prendas meter en tu maleta.
              </p>
            </div>
          )}
        </main>
      )}

      {/* =====================================================================
          VISTA 2: MI ARMARIO (DISEÑO EDITORIAL CLEAN STUDIO & ANALÍTICA CPW)
      ====================================================================== */}
      {activeTab === 'closet' && (
        <main className="p-4 flex-1 space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-lg font-extrabold text-slate-900 tracking-tight">Mi Armario</h2>
              <p className="text-xs text-slate-500">
                Mostrando {filteredGarments.length} de {garments.length} prendas
              </p>
            </div>
            <button
              onClick={() => setShowAddModal(true)}
              className="flex items-center gap-1.5 px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-2xl text-xs font-bold shadow-sm transition-all"
            >
              <Camera className="w-4 h-4" /> + Añadir
            </button>
          </div>

          {/* Barra Editorial Luminosa de Analítica de Uso y Amortización (CPW) */}
          {garments.length > 0 && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              <div className="bg-white rounded-2xl p-3 border border-slate-200/80 shadow-2xs">
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Uso Activo</p>
                <p className="text-base font-extrabold text-slate-900 mt-0.5">
                  {activeClosetPercent}%
                </p>
                <p className="text-[10px] text-slate-500 truncate">de tu armario</p>
              </div>

              <div className="bg-white rounded-2xl p-3 border border-slate-200/80 shadow-2xs">
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Más Usada</p>
                <p className="text-xs font-extrabold text-slate-900 truncate mt-1">
                  {topWornGarment && (Number(topWornGarment.wearCount) || 0) > 0
                    ? topWornGarment.name
                    : 'Aún sin usos'}
                </p>
                <p className="text-[10px] text-indigo-600 font-semibold">
                  {topWornGarment ? `${Number(topWornGarment.wearCount) || 0} puestas` : '0 puestas'}
                </p>
              </div>

              <div className="bg-white rounded-2xl p-3 border border-slate-200/80 shadow-2xs">
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Coste / Uso</p>
                <p className="text-base font-extrabold text-emerald-600 mt-0.5">
                  {averageCPW ? `${averageCPW} €` : '—'}
                </p>
                <p className="text-[10px] text-slate-500 truncate">media por puesta</p>
              </div>

              <button
                type="button"
                onClick={() =>
                  setSelectedFilter(selectedFilter === 'UNWORN' ? 'ALL' : 'UNWORN')
                }
                className={`rounded-2xl p-3 border text-left transition-all shadow-2xs ${
                  selectedFilter === 'UNWORN'
                    ? 'bg-amber-50 border-amber-300 ring-1 ring-amber-400/30'
                    : 'bg-white border-slate-200/80 hover:border-amber-300'
                }`}
              >
                <p className="text-[10px] text-amber-600 font-bold uppercase tracking-wider">Olvidadas</p>
                <p className="text-base font-extrabold text-slate-900 mt-0.5">{unwornCount}</p>
                <p className="text-[10px] text-slate-500 truncate">
                  {selectedFilter === 'UNWORN' ? 'Ver todo ✕' : 'Filtrar 0 usos →'}
                </p>
              </button>
            </div>
          )}

          {/* Detector de Huecos en el Armario Cápsula (Wardrobe Gaps) */}
          {garments.length > 0 && (
            <div className="bg-white rounded-2xl border border-slate-200/80 p-3.5 shadow-2xs space-y-2.5">
              <div className="flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setShowWardrobeGaps(!showWardrobeGaps)}
                  className="flex items-center gap-2 text-left w-full justify-between focus:outline-none"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
                      <Sparkles className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="text-xs font-extrabold text-slate-900">
                        {wardrobeGaps.length === 0
                          ? '✨ Armario Cápsula Equilibrado'
                          : `💡 ${wardrobeGaps.length} Hueco${wardrobeGaps.length > 1 ? 's' : ''} detectado${wardrobeGaps.length > 1 ? 's' : ''} en tu armario`}
                      </span>
                      <p className="text-[10px] text-slate-500">
                        {wardrobeGaps.length === 0
                          ? 'Excelente cobertura en ocasiones, proporciones y clima.'
                          : 'Piezas clave para multiplicar la versatilidad de tus prendas.'}
                      </p>
                    </div>
                  </div>
                  <span className="text-[11px] font-bold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 px-2.5 py-1 rounded-full shrink-0 transition-colors">
                    {showWardrobeGaps ? 'Ocultar' : 'Ver análisis'}
                  </span>
                </button>
              </div>

              {showWardrobeGaps && (
                <div className="pt-2 border-t border-slate-100 space-y-2 animate-in fade-in duration-150">
                  {wardrobeGaps.length === 0 ? (
                    <div className="p-3 bg-emerald-50/70 rounded-xl border border-emerald-100 text-xs text-emerald-900 leading-relaxed">
                      🎉 ¡Enhorabuena! Tu armario tiene un balance óptimo de prendas superiores, inferiores, calzado formal, deportivo y abrigo.
                    </div>
                  ) : (
                    wardrobeGaps.map(gap => (
                      <div
                        key={gap.id}
                        className="p-3 bg-[#FAF9F6] rounded-xl border border-slate-200/80 text-xs space-y-1"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-extrabold text-slate-900">{gap.title}</span>
                          <span className="text-[10px] font-bold text-indigo-600 bg-indigo-100/70 px-2 py-0.5 rounded-full">
                            {gap.tag}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-600 leading-relaxed">{gap.desc}</p>
                        {currentUser && (currentUser.weightKg || currentUser.gender) && (
                          <p className="text-[10px] text-slate-400 font-medium pt-0.5">
                            Recomendación para perfil: {currentUser.gender === 'mujer' ? 'Mujer' : 'Hombre'}
                            {estimateRecommendedSize(currentUser.weightKg, currentUser.heightCm, currentUser.gender)
                              ? ` • Talla sugerida: ${estimateRecommendedSize(currentUser.weightKg, currentUser.heightCm, currentUser.gender)}`
                              : ''}
                          </p>
                        )}
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
          )}

          {/* Buscador rápido por nombre, color o categoría */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              placeholder="Buscar prenda por nombre, color o tipo..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white border border-slate-200/90 rounded-2xl pl-10 pr-9 py-2.5 text-xs text-slate-800 shadow-2xs focus:outline-none focus:border-slate-900 transition-colors"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Barra de Filtros por Categoría + Modo Temporada en 1 Clic */}
          <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
            <button
              onClick={() => setSelectedFilter('ALL')}
              className={`px-3.5 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all ${
                selectedFilter === 'ALL'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-white text-slate-600 border border-slate-200/80 hover:bg-slate-100'
              }`}
            >
              Todo ({garments.length})
            </button>
            {/* Mejora 4: Modo Temporada en 1 Clic */}
            <button
              type="button"
              onClick={() => setSeasonFilterActive(!seasonFilterActive)}
              className={`px-3.5 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1 ${
                seasonFilterActive
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'bg-white text-slate-600 border border-slate-200/80 hover:bg-slate-100'
              }`}
              title="Oculta automáticamente las prendas fuera de estación según el clima actual"
            >
              <span>🌤️ Temporada ({temp}°C)</span>
            </button>
            <button
              onClick={() => setSelectedFilter('UNWORN')}
              className={`px-3.5 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1 ${
                selectedFilter === 'UNWORN'
                  ? 'bg-amber-500 text-white shadow-xs'
                  : 'bg-white text-slate-600 border border-slate-200/80 hover:bg-slate-100'
              }`}
            >
              <span>✨ Olvidadas ({unwornCount})</span>
            </button>
            {GARMENT_TYPES.map(type => {
              const count = garments.filter(
                g => (g.subcategory || getDefaultSubcategory(g.category)) === type.id
              ).length;
              return (
                <button
                  key={type.id}
                  onClick={() => setSelectedFilter(type.id)}
                  className={`px-3.5 py-2 rounded-full text-xs font-bold whitespace-nowrap flex items-center gap-1.5 transition-all ${
                    selectedFilter === type.id
                      ? 'bg-slate-900 text-white shadow-xs'
                      : 'bg-white text-slate-600 border border-slate-200/80 hover:bg-slate-100'
                  }`}
                >
                  <span>{type.emoji}</span>
                  <span>{type.label}</span>
                  <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                    selectedFilter === type.id ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-500'
                  }`}>
                    {count}
                  </span>
                </button>
              );
            })}
            {/* Filtros rápidos por Ocasión / Plan */}
            {OCCASIONS.map(occ => {
              const count = garments.filter(
                g => Array.isArray(g.occasion) && g.occasion.includes(occ.id)
              ).length;
              if (count === 0) return null;
              return (
                <button
                  key={occ.id}
                  onClick={() => setSelectedFilter(selectedFilter === occ.id ? 'ALL' : occ.id)}
                  className={`px-3.5 py-2 rounded-full text-xs font-bold whitespace-nowrap flex items-center gap-1.5 transition-all ${
                    selectedFilter === occ.id
                      ? 'bg-indigo-600 text-white shadow-xs'
                      : 'bg-white text-slate-600 border border-slate-200/80 hover:bg-slate-100'
                  }`}
                >
                  <span>{occ.emoji}</span>
                  <span>{occ.label}</span>
                  <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                    selectedFilter === occ.id ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-500'
                  }`}>
                    {count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Listado Editorial Clean Studio de Prendas */}
          {filteredGarments.length === 0 ? (
            <div className="bg-white rounded-3xl p-8 text-center border border-slate-200/80 space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-[#FAF9F6] border border-slate-200/80 text-slate-700 flex items-center justify-center mx-auto">
                <Camera className="w-6 h-6" />
              </div>
              <p className="text-sm font-bold text-slate-900">
                {selectedFilter === 'ALL' && !searchQuery
                  ? 'Tu armario está vacío'
                  : 'No hay prendas que coincidan con este filtro'}
              </p>
              {selectedFilter !== 'ALL' || searchQuery ? (
                <button
                  onClick={() => {
                    setSelectedFilter('ALL');
                    setSearchQuery('');
                  }}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold"
                >
                  Ver todas las prendas
                </button>
              ) : (
                <button
                  onClick={() => setShowAddModal(true)}
                  className="px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold"
                >
                  Hacer foto a mi primera prenda
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3.5">
              {filteredGarments.map((g) => {
                const subcatId = g.subcategory || getDefaultSubcategory(g.category);
                const typeObj = GARMENT_TYPES.find(t => t.id === subcatId);
                const wears = Number(g.wearCount) || 0;
                const hasPrice = Number(g.price) > 0;
                const cpw = hasPrice ? (Number(g.price) / Math.max(1, wears)).toFixed(1) : null;
                const isAmortized = hasPrice && wears > 0 && Number(cpw) <= 3;

                return (
                  <div
                    key={g.id}
                    className={`group bg-white rounded-2xl overflow-hidden border transition-all duration-200 flex flex-col justify-between shadow-[0_2px_10px_-3px_rgba(15,23,42,0.05)] hover:shadow-md ${
                      g.inLaundry
                        ? 'border-amber-300/80 bg-amber-50/10'
                        : 'border-slate-200/80 hover:border-slate-300'
                    }`}
                  >
                    <div>
                      {/* Imagen Vertical Proporción Moda 4:5 sobre Fondo Estudio */}
                      <div className="relative aspect-[4/5] w-full overflow-hidden bg-[#F4F3EF]">
                        <img
                          src={g.image}
                          alt={g.name}
                          className={`w-full h-full object-cover transition-transform duration-500 group-hover:scale-103 ${
                            g.inLaundry ? 'opacity-55 grayscale-[25%]' : ''
                          }`}
                        />

                        {/* Pill Superior Izquierda: En Colada (si está sucia) o Subcategoría */}
                        {g.inLaundry ? (
                          <span className="absolute top-2.5 left-2.5 text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-amber-500 text-white shadow-xs flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                            En colada
                          </span>
                        ) : (
                          <span className="absolute top-2.5 left-2.5 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-white/90 text-slate-800 backdrop-blur-md border border-slate-200/60 shadow-2xs flex items-center gap-1">
                            <span>{typeObj?.emoji}</span>
                            <span className="truncate max-w-[82px]">{typeObj?.singular || subcatId}</span>
                          </span>
                        )}

                        {/* Pill Superior Derecha: Contador de Usos */}
                        <span
                          className="absolute top-2.5 right-2.5 text-[10px] font-bold px-2 py-0.5 rounded-full bg-white/90 text-slate-700 backdrop-blur-md border border-slate-200/60 shadow-2xs"
                          title={g.lastWornAt ? `Último uso: ${g.lastWornAt}` : 'Aún sin estrenar'}
                        >
                          {wears} {wears === 1 ? 'uso' : 'usos'}
                        </span>

                        {/* Botón Flotante Circular en Imagen para Combinar esta Prenda (Prenda Ancla) */}
                        {!g.inLaundry && (
                          <button
                            type="button"
                            onClick={() => combineWithGarment(g)}
                            title="Crear outfit con esta prenda"
                            className="absolute bottom-2.5 right-2.5 w-8 h-8 rounded-full bg-slate-900/90 hover:bg-indigo-600 text-white flex items-center justify-center shadow-md backdrop-blur-xs transition-all active:scale-95"
                          >
                            <Sparkles className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>

                      {/* Cuerpo Editorial Compacto y Limpio */}
                      <div className="p-3 space-y-2">
                        <p className="text-xs font-bold text-slate-900 truncate tracking-tight">
                          {g.name}
                        </p>

                        {/* Fila Unificada: Color + Coste por Uso (CPW) interactivo */}
                        {editingPriceId === g.id ? (
                          <div className="flex items-center gap-1">
                            <input
                              type="number"
                              min="0"
                              step="1"
                              placeholder="Precio €"
                              value={editingPriceVal}
                              autoFocus
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                  saveGarmentPrice(g.id, editingPriceVal);
                                } else if (e.key === 'Escape') {
                                  setEditingPriceId(null);
                                }
                              }}
                              onChange={(e) => setEditingPriceVal(e.target.value)}
                              className="w-full bg-[#FAF9F6] border border-slate-300 rounded-lg px-2 py-1 text-[11px] text-slate-900 focus:outline-none focus:border-slate-900"
                            />
                            <button
                              type="button"
                              onClick={() => saveGarmentPrice(g.id, editingPriceVal)}
                              className="px-2 py-1 rounded-lg bg-slate-900 text-white text-[10px] font-bold shrink-0"
                            >
                              OK
                            </button>
                            <button
                              type="button"
                              onClick={() => setEditingPriceId(null)}
                              className="px-1.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-500 text-[10px] font-bold shrink-0"
                              title="Cancelar"
                            >
                              ✕
                            </button>
                          </div>
                        ) : (
                          <div className="flex items-center justify-between gap-1.5 text-[11px]">
                            <div className="flex items-center gap-1.5 min-w-0">
                              <span
                                className="w-2.5 h-2.5 rounded-full shrink-0 ring-1 ring-slate-300"
                                style={{ backgroundColor: getColorHex(g.color) }}
                              />
                              <span className="truncate font-medium text-slate-600">{g.color}</span>
                            </div>

                            <button
                              type="button"
                              onClick={() => {
                                setEditingPriceId(g.id);
                                setEditingPriceVal(hasPrice ? String(g.price) : '');
                              }}
                              title="Toca para editar el precio y ver su amortización"
                              className={`px-1.5 py-0.5 rounded-md text-[10px] font-bold shrink-0 border transition-colors ${
                                isAmortized
                                  ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
                                  : hasPrice
                                  ? 'bg-slate-50 border-slate-200 text-slate-600 hover:border-slate-300'
                                  : 'bg-transparent border-dashed border-slate-200 text-slate-400 hover:text-slate-700'
                              }`}
                            >
                              {hasPrice ? `${cpw}€/uso` : '+ €'}
                            </button>
                          </div>
                        )}

                        {/* Etiquetas de Ocasión Multietiqueta */}
                        {Array.isArray(g.occasion) && g.occasion.length > 0 && (
                          <div className="flex flex-wrap gap-1 pt-1">
                            {g.occasion.map(occ => {
                              const occMeta = OCCASIONS.find(o => o.id === occ);
                              const isSelected = selectedFilter === occ;
                              return (
                                <button
                                  key={occ}
                                  type="button"
                                  onClick={() => setSelectedFilter(isSelected ? 'ALL' : occ)}
                                  className={`text-[9px] font-bold px-1.5 py-0.5 rounded-md border transition-all ${
                                    isSelected
                                      ? 'bg-slate-900 text-white border-slate-900'
                                      : 'bg-[#FAF9F6] hover:bg-slate-100 text-slate-600 border-slate-200/70'
                                  }`}
                                  title={`Filtrar por ${occMeta?.label || occ}`}
                                >
                                  {occMeta?.emoji} {occMeta?.label || occ}
                                </button>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Pie Limpio de 1 sola fila: Selector de Categoría + Colada + Borrar */}
                    <div className="px-3 pb-3 pt-1.5 border-t border-slate-100 flex items-center gap-1.5">
                      <select
                        value={subcatId}
                        onChange={(e) => changeGarmentSubcategory(g.id, e.target.value)}
                        className="flex-1 min-w-0 bg-[#FAF9F6] hover:bg-slate-100 border border-slate-200/80 rounded-lg px-2 py-1.5 text-[10px] font-semibold text-slate-700 focus:outline-none focus:border-slate-900 cursor-pointer truncate"
                        title="Cambiar categoría de la prenda"
                      >
                        {GARMENT_TYPES.map(type => (
                          <option key={type.id} value={type.id}>
                            {type.emoji} {type.singular}
                          </option>
                        ))}
                      </select>

                      <button
                        type="button"
                        onClick={() => toggleLaundry(g.id)}
                        title={g.inLaundry ? 'Marcar como limpia' : 'Enviar a la colada'}
                        className={`p-1.5 rounded-lg border transition-colors shrink-0 ${
                          g.inLaundry
                            ? 'bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100'
                            : 'bg-[#FAF9F6] text-slate-500 border-slate-200/80 hover:text-slate-900 hover:bg-slate-100'
                        }`}
                      >
                        <WashingMachine className="w-3.5 h-3.5" />
                      </button>

                      <button
                        type="button"
                        onClick={() => deleteGarment(g.id)}
                        title="Eliminar prenda"
                        className="p-1.5 rounded-lg bg-[#FAF9F6] hover:bg-rose-50 text-slate-400 hover:text-rose-600 border border-slate-200/80 hover:border-rose-200 transition-colors shrink-0"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </main>
      )}

      {/* =====================================================================
          VISTA 3: CESTA DE LAVANDERÍA ("COLADA")
      ====================================================================== */}
      {activeTab === 'laundry' && (
        <main className="p-4 flex-1 space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-lg font-extrabold text-slate-900 tracking-tight">Cesta de Colada</h2>
              <p className="text-xs text-slate-500">
                {laundryCount === 0
                  ? 'Toda tu ropa está limpia'
                  : `${laundryCount} prenda(s) pendientes de lavar`}
              </p>
            </div>
            {laundryCount > 0 && (
              <button
                onClick={washAllLaundry}
                className="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-2xl text-xs font-bold shadow-xs transition-all flex items-center gap-1.5"
              >
                <Check className="w-4 h-4 text-emerald-400" /> Lavar Todo
              </button>
            )}
          </div>

          {laundryCount === 0 ? (
            <div className="bg-white rounded-3xl p-10 text-center border border-slate-200/80 space-y-2">
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto">
                <Check className="w-6 h-6" />
              </div>
              <p className="text-sm font-bold text-slate-900">¡Todo limpio!</p>
              <p className="text-xs text-slate-500">
                Todas tus prendas están disponibles para crear outfits.
              </p>
            </div>
          ) : (
            <div className="space-y-2.5">
              {garments.filter(g => g.inLaundry).map((g) => (
                <div
                  key={g.id}
                  className="p-3 bg-white rounded-2xl border border-slate-200/80 shadow-2xs flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <img src={g.image} alt={g.name} className="w-12 h-14 rounded-xl object-cover bg-[#F4F3EF]" />
                    <div>
                      <p className="text-xs font-bold text-slate-900">{g.name}</p>
                      <p className="text-[11px] text-slate-500">
                        {GARMENT_TYPES.find(t => t.id === g.subcategory)?.label || g.subcategory} • {g.color}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => toggleLaundry(g.id)}
                    className="px-3.5 py-2 bg-emerald-50 hover:bg-emerald-600 text-emerald-700 hover:text-white border border-emerald-200 rounded-xl text-xs font-bold transition-all"
                  >
                    Ya está limpia
                  </button>
                </div>
              ))}
            </div>
          )}
        </main>
      )}

      {/* =====================================================================
          MODAL DE RESCATE ASISTIDO DE PRENDAS DE LA COLADA
      ====================================================================== */}
      {laundryRescueData && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl max-w-sm w-full p-5 shadow-2xl border border-slate-200/80 space-y-4">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
                  <WashingMachine className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-extrabold text-slate-900">Prendas en la colada</h4>
                  <p className="text-[11px] text-slate-500">
                    Falta: {laundryRescueData.missingSlots.map(m => m.name).join(', ')} limpia
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setLaundryRescueData(null)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              Para generar este look necesitas al menos una prenda limpia de esa categoría. Puedes rescatar una de tu cesto de colada ahora mismo:
            </p>

            <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
              {laundryRescueData.dirtyRescuables.map(item => (
                <div
                  key={item.id}
                  className="flex items-center justify-between gap-2.5 p-2.5 bg-[#FAF9F6] border border-slate-200/80 rounded-2xl"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-11 h-11 rounded-xl object-cover bg-slate-100 shrink-0"
                    />
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-slate-900 truncate">{item.name}</p>
                      <p className="text-[10px] text-slate-500 truncate">{item.color}</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      rescueGarmentFromLaundry(item.id);
                      setLaundryRescueData(null);
                      generateOutfit();
                    }}
                    className="px-2.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-bold rounded-xl shrink-0 flex items-center gap-1 shadow-xs transition-colors"
                  >
                    <Check className="w-3.5 h-3.5" /> Marcar limpia y generar
                  </button>
                </div>
              ))}
            </div>

            <div className="flex gap-2 pt-1">
              <button
                type="button"
                onClick={() => {
                  setLaundryRescueData(null);
                  setActiveTab('laundry');
                }}
                className="flex-1 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-colors"
              >
                Ir a Mi Colada
              </button>
              <button
                type="button"
                onClick={() => setLaundryRescueData(null)}
                className="py-2.5 px-3 rounded-xl border border-slate-200 text-slate-600 text-xs font-semibold hover:bg-slate-50 transition-colors"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =====================================================================
          MODAL RÁPIDO PARA AÑADIR PRENDA CON CÁMARA EN SEGUNDOS (MODO RÁFAGA)
      ====================================================================== */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="bg-white rounded-t-3xl sm:rounded-3xl max-w-md w-full p-5 space-y-4 shadow-2xl max-h-[92vh] overflow-y-auto">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2 tracking-tight">
                  <Camera className="w-5 h-5 text-indigo-600" /> Nueva Prenda
                </h3>
                <p className="text-[11px] text-slate-500">
                  Haz una foto y la IA detectará color, tipo y abrigo
                </p>
              </div>
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => setShowApiKeyInput(!showApiKeyInput)}
                  title="Configurar API Key de Gemini Vision (opcional)"
                  className={`p-1.5 rounded-full border text-xs transition-colors ${
                    geminiApiKey
                      ? 'bg-indigo-50 text-indigo-600 border-indigo-200'
                      : 'bg-slate-100 text-slate-500 border-transparent hover:text-slate-800'
                  }`}
                >
                  <KeyRound className="w-4 h-4" />
                </button>
                <button
                  onClick={() => {
                    stopCamera();
                    setShowAddModal(false);
                    setAiVisionBadge('');
                  }}
                  className="p-1.5 bg-slate-100 text-slate-500 hover:text-slate-800 rounded-full"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {showApiKeyInput && (
              <div className="p-3 bg-indigo-50/70 border border-indigo-100 rounded-2xl space-y-1.5">
                <label className="text-[11px] font-bold text-indigo-900 block">
                  Clave Gemini API (opcional para reconocimiento avanzado):
                </label>
                <input
                  type="password"
                  placeholder="AIzaSy... (Si se deja vacío usa Visión Local instantánea)"
                  value={geminiApiKey}
                  onChange={(e) => handleSaveGeminiKey(e.target.value)}
                  className="w-full bg-white border border-indigo-200 rounded-xl px-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-indigo-500"
                />
              </div>
            )}

            <form onSubmit={(e) => handleSaveGarment(e, false)} className="space-y-4">
              {/* 1. Foto con Cámara en Vivo o Galería */}
              <div>
                {cameraActive ? (
                  <div className="relative rounded-2xl overflow-hidden bg-black">
                    <video
                      ref={videoRef}
                      autoPlay
                      playsInline
                      muted
                      className="w-full h-60 object-cover"
                    />
                    <div className="absolute bottom-3 inset-x-0 flex justify-center items-center gap-3 px-4">
                      <button
                        type="button"
                        onClick={toggleCameraFacing}
                        className="p-3 bg-white/90 text-slate-800 rounded-full shadow"
                        title="Girar cámara"
                      >
                        <SwitchCamera className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={capturePhotoFromVideo}
                        className="px-6 py-3 bg-slate-900 text-white font-bold text-xs rounded-full shadow-lg flex items-center gap-2"
                      >
                        <Camera className="w-4 h-4" /> Capturar Foto
                      </button>
                      <button
                        type="button"
                        onClick={stopCamera}
                        className="p-3 bg-white/90 text-rose-600 rounded-full shadow"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ) : newGarment.image ? (
                  <div className="space-y-2">
                    <div className="relative rounded-2xl overflow-hidden border border-slate-200 bg-[#F4F3EF]">
                      <img
                        src={newGarment.image}
                        alt="Prenda"
                        className="w-full h-52 object-cover"
                      />
                      <div className="absolute top-3 right-3 flex flex-wrap gap-1.5">
                        <button
                          type="button"
                          onClick={applyStudioToExistingPhoto}
                          className="px-2.5 py-1.5 bg-slate-900/90 hover:bg-slate-800 text-xs font-bold text-amber-300 rounded-xl shadow flex items-center gap-1"
                          title="Limpia bordes desordenados y aplica fondo de estudio"
                        >
                          <span>✨ Fondo Estudio</span>
                        </button>
                        <button
                          type="button"
                          disabled={analyzingPhoto}
                          onClick={() => analyzeGarmentImageWithAI(newGarment.image, newGarment.subcategory)}
                          className="px-3 py-1.5 bg-indigo-600/95 hover:bg-indigo-700 text-xs font-bold text-white rounded-xl shadow flex items-center gap-1"
                        >
                          <Sparkles className="w-3.5 h-3.5" />
                          <span>{analyzingPhoto ? 'Analizando...' : 'Re-analizar IA'}</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setNewGarment(prev => ({ ...prev, image: '' }));
                            setAiVisionBadge('');
                          }}
                          className="px-3 py-1.5 bg-white/95 text-xs font-bold text-rose-600 rounded-xl shadow"
                        >
                          Repetir foto
                        </button>
                      </div>
                    </div>

                    {(analyzingPhoto || aiVisionBadge) && (
                      <div className="px-3 py-2 rounded-xl bg-[#FAF9F6] border border-slate-200/80 text-xs font-bold text-slate-800 flex items-center gap-2">
                        {analyzingPhoto ? (
                          <RefreshCw className="w-3.5 h-3.5 text-indigo-600 animate-spin shrink-0" />
                        ) : (
                          <Sparkles className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                        )}
                        <span className="truncate">{aiVisionBadge || 'Detectando color y prenda...'}</span>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="space-y-2">
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        type="button"
                        onClick={() => startCamera()}
                        className="p-5 bg-[#FAF9F6] hover:bg-slate-100 border border-dashed border-slate-300 rounded-2xl flex flex-col items-center justify-center gap-2 text-slate-900 transition-all"
                      >
                        <Camera className="w-6 h-6 text-indigo-600" />
                        <span className="text-xs font-bold">Cámara en Vivo</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => nativeCameraInputRef.current?.click()}
                        className="p-5 bg-[#FAF9F6] hover:bg-slate-100 border border-dashed border-slate-300 rounded-2xl flex flex-col items-center justify-center gap-2 text-slate-700 transition-all"
                      >
                        <ImageIcon className="w-6 h-6 text-slate-600" />
                        <span className="text-xs font-bold">Móvil / Galería</span>
                      </button>
                    </div>
                    <label className="flex items-center justify-between px-3 py-2 rounded-xl bg-[#FAF9F6] border border-slate-200/80 cursor-pointer">
                      <span className="text-[11px] font-bold text-slate-700">
                        ✨ Encuadre y Fondo Limpio de Estudio automático
                      </span>
                      <input
                        type="checkbox"
                        checked={studioCutoutMode}
                        onChange={(e) => setStudioCutoutMode(e.target.checked)}
                        className="w-4 h-4 rounded accent-slate-900"
                      />
                    </label>
                  </div>
                )}

                {cameraError && (
                  <p className="text-xs text-amber-700 bg-amber-50 border border-amber-200 p-2.5 rounded-xl mt-2">
                    {cameraError}
                  </p>
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

              {/* 2. Tipo de Prenda con Botones Táctiles */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">¿Qué tipo de prenda es?</label>
                <div className="grid grid-cols-2 gap-1.5 max-h-36 overflow-y-auto pr-1">
                  {GARMENT_TYPES.map(type => {
                    const active = newGarment.subcategory === type.id;
                    return (
                      <button
                        type="button"
                        key={type.id}
                        onClick={() => {
                          const suggestion = buildCoherentGarmentDefaults(type.id, newGarment.color);
                          setNewGarment(prev => ({
                            ...prev,
                            subcategory: type.id,
                            warmth: suggestion.warmth,
                            occasion: suggestion.occasion,
                            name: suggestion.name
                          }));
                        }}
                        className={`py-2 px-3 rounded-xl text-xs font-bold flex items-center gap-2 border text-left transition-all ${
                          active
                            ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                            : 'bg-[#FAF9F6] text-slate-700 border-slate-200/80 hover:bg-slate-100'
                        }`}
                      >
                        <span>{type.emoji}</span>
                        <span className="truncate">{type.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 3. Selección de Color en 1 Toque */}
              <div className="space-y-1.5">
                <div className="flex justify-between items-center">
                  <label className="text-xs font-bold text-slate-700">Color principal</label>
                  <span className="text-xs font-semibold text-indigo-600">{newGarment.color}</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {QUICK_COLORS.map(c => {
                    const selected = newGarment.color.toLowerCase() === c.name.toLowerCase();
                    return (
                      <button
                        type="button"
                        key={c.name}
                        onClick={() => setNewGarment(prev => ({ ...prev, color: c.name }))}
                        className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border transition-all ${
                          selected
                            ? 'border-slate-900 bg-slate-900 text-white'
                            : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'
                        }`}
                      >
                        <span
                          className={`w-3.5 h-3.5 rounded-full ${c.border ? 'border border-slate-300' : ''}`}
                          style={{ backgroundColor: c.hex }}
                        />
                        <span>{c.name}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 4. Nombre opcional y Precio (€) para Coste por Uso */}
              <div className="grid grid-cols-3 gap-2">
                <div className="col-span-2 space-y-1">
                  <label className="text-xs font-bold text-slate-700">
                    Nombre <span className="text-slate-400 font-normal">(opcional)</span>
                  </label>
                  <input
                    type="text"
                    placeholder={`Ej: ${
                      GARMENT_TYPES.find(t => t.id === newGarment.subcategory)?.singular || 'Prenda'
                    } ${newGarment.color}`}
                    value={newGarment.name}
                    onChange={(e) => setNewGarment(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full bg-[#FAF9F6] border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-900 focus:outline-none focus:border-slate-900 focus:bg-white"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">
                    Precio (€)
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="1"
                    placeholder="Ej: 39"
                    value={newGarment.price}
                    onChange={(e) => setNewGarment(prev => ({ ...prev, price: e.target.value }))}
                    className="w-full bg-[#FAF9F6] border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-slate-900 focus:bg-white"
                  />
                </div>
              </div>

              {/* 5. Ocasiones y Planes (Multietiqueta) */}
              <div className="space-y-1.5">
                <div className="flex justify-between items-center">
                  <label className="text-xs font-bold text-slate-700">
                    5. ¿Para qué planes encaja? (Multietiqueta)
                  </label>
                  <span className="text-[10px] font-bold text-indigo-600">
                    {newGarment.occasion.length} seleccionado(s)
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-1.5">
                  {OCCASIONS.map((occ) => {
                    const active = newGarment.occasion.includes(occ.id);
                    return (
                      <button
                        type="button"
                        key={occ.id}
                        onClick={() => toggleNewGarmentOccasion(occ.id)}
                        className={`py-2 px-1 text-[11px] rounded-xl font-bold border transition-all flex items-center justify-center gap-1 ${
                          active
                            ? 'bg-slate-900 border-slate-900 text-white shadow-xs'
                            : 'bg-[#FAF9F6] border-slate-200 text-slate-600 hover:bg-slate-100'
                        }`}
                      >
                        <span>{active ? '✓' : occ.emoji}</span>
                        <span className="truncate">{occ.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <button
                  type="submit"
                  className="w-full py-3.5 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-2xl text-xs flex justify-center items-center gap-1.5 shadow-md transition-all"
                >
                  <Check className="w-4 h-4" /> Guardar Prenda
                </button>
                <button
                  type="button"
                  onClick={(e) => handleSaveGarment(e, true)}
                  className="w-full py-3.5 bg-[#FAF9F6] hover:bg-slate-100 text-slate-800 border border-slate-200 font-bold rounded-2xl text-xs flex justify-center items-center gap-1.5 transition-all"
                >
                  <Camera className="w-4 h-4" /> Guardar y + Otra Foto
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =====================================================================
          BARRA DE NAVEGACIÓN INFERIOR SIMÉTRICA DE 6 COLUMNAS (SIN DESBORDES)
      ====================================================================== */}
      <nav className="fixed bottom-3 left-1/2 -translate-x-1/2 max-w-md w-[94%] bg-white/95 backdrop-blur-xl border border-slate-200/90 shadow-[0_8px_30px_rgb(15,23,42,0.10)] rounded-full px-2 py-1.5 z-30 grid grid-cols-6 items-center">
        <button
          onClick={() => setActiveTab('generator')}
          className={`flex flex-col items-center justify-center gap-0.5 py-1.5 rounded-full text-[10px] font-semibold transition-all ${
            activeTab === 'generator'
              ? 'text-slate-900 font-extrabold'
              : 'text-slate-400 hover:text-slate-700'
          }`}
        >
          <Sparkles className={`w-4 h-4 ${activeTab === 'generator' ? 'text-indigo-600' : ''}`} />
          <span>Hoy</span>
        </button>

        <button
          onClick={() => setActiveTab('planner')}
          className={`relative flex flex-col items-center justify-center gap-0.5 py-1.5 rounded-full text-[10px] font-semibold transition-all ${
            activeTab === 'planner'
              ? 'text-slate-900 font-extrabold'
              : 'text-slate-400 hover:text-slate-700'
          }`}
        >
          <Calendar className={`w-4 h-4 ${activeTab === 'planner' ? 'text-indigo-600' : ''}`} />
          <span>Semana</span>
          {plannedDaysCount > 0 && (
            <span className="absolute top-0.5 right-2 w-3.5 h-3.5 bg-slate-900 text-white text-[8px] font-bold rounded-full flex items-center justify-center">
              {plannedDaysCount}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('travel')}
          className={`relative flex flex-col items-center justify-center gap-0.5 py-1.5 rounded-full text-[10px] font-semibold transition-all ${
            activeTab === 'travel'
              ? 'text-slate-900 font-extrabold'
              : 'text-slate-400 hover:text-slate-700'
          }`}
        >
          <Briefcase className={`w-4 h-4 ${activeTab === 'travel' ? 'text-indigo-600' : ''}`} />
          <span>Viaje</span>
          {capsuleItems.length > 0 && (
            <span className="absolute top-0.5 right-2 w-3.5 h-3.5 bg-emerald-600 text-white text-[8px] font-bold rounded-full flex items-center justify-center">
              {capsuleItems.length}
            </span>
          )}
        </button>

        {/* Botón Circular Editorial de Cámara */}
        <button
          onClick={() => setShowAddModal(true)}
          title="Añadir prenda con cámara"
          className="w-10 h-10 mx-auto rounded-full bg-slate-900 hover:bg-indigo-600 text-white flex items-center justify-center shadow-md shadow-slate-900/20 active:scale-95 transition-all"
        >
          <Camera className="w-4 h-4" />
        </button>

        <button
          onClick={() => setActiveTab('closet')}
          className={`flex flex-col items-center justify-center gap-0.5 py-1.5 rounded-full text-[10px] font-semibold transition-all ${
            activeTab === 'closet'
              ? 'text-slate-900 font-extrabold'
              : 'text-slate-400 hover:text-slate-700'
          }`}
        >
          <Shirt className={`w-4 h-4 ${activeTab === 'closet' ? 'text-indigo-600' : ''}`} />
          <span>Armario</span>
        </button>

        <button
          onClick={() => setActiveTab('laundry')}
          className={`relative flex flex-col items-center justify-center gap-0.5 py-1.5 rounded-full text-[10px] font-semibold transition-all ${
            activeTab === 'laundry'
              ? 'text-slate-900 font-extrabold'
              : 'text-slate-400 hover:text-slate-700'
          }`}
        >
          <WashingMachine className={`w-4 h-4 ${activeTab === 'laundry' ? 'text-indigo-600' : ''}`} />
          <span>Colada</span>
          {laundryCount > 0 && (
            <span className="absolute top-0.5 right-2 w-3.5 h-3.5 bg-amber-500 text-white text-[8px] font-bold rounded-full flex items-center justify-center">
              {laundryCount}
            </span>
          )}
        </button>
      </nav>
    </div>
  );
}
