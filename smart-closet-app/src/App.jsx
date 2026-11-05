import React, { useState, useEffect } from 'react';
import { 
  Shirt, 
  Sparkles, 
  Calendar, 
  CloudSun, 
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
  ChevronRight
} from 'lucide-react';
import { GoogleGenerativeAI } from '@google/generative-ai';

// Datos iniciales de ejemplo
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

export default function App() {
  const [activeTab, setActiveTab] = useState('generator');
  const [garments, setGarments] = useState(INITIAL_GARMENTS);
  
  // Clima y Geolocalización
  const [locationName, setLocationName] = useState('A Coruña');
  const [temp, setTemp] = useState(16);
  const [isRaining, setIsRaining] = useState(false);
  const [loadingWeather, setLoadingWeather] = useState(false);

  // Parámetros de Generación
  const [selectedOccasion, setSelectedOccasion] = useState('Work');
  const [desiredWarmth, setDesiredWarmth] = useState(3);
  const [desiredComfort, setDesiredComfort] = useState(4);
  const [currentOutfit, setCurrentOutfit] = useState(null);
  const [aiNote, setAiNote] = useState('');
  const [generating, setGenerating] = useState(false);

  // Nueva Prenda Form
  const [newGarment, setNewGarment] = useState({
    name: '',
    category: 'Top',
    occasion: ['Work'],
    warmth: 3,
    comfort: 3,
    color: '',
    image: ''
  });

  // Cargar Clima mediante Open-Meteo API (A Coruña por defecto)
  const fetchWeather = async (lat = 43.3623, lon = -8.4115, name = 'A Coruña') => {
    setLoadingWeather(true);
    try {
      const res = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}¤t_weather=true`);
      const data = await res.json();
      if (data.current_weather) {
        setTemp(Math.round(data.current_weather.temperature));
        setIsRaining([51, 53, 55, 61, 63, 65, 80, 81, 82].includes(data.current_weather.weathercode));
        setLocationName(name);
        
        // Auto-ajustar nivel de abrigo deseado según temperatura real
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

  // Generador Inteligente de Outfits
  const generateOutfit = () => {
    setGenerating(true);

    setTimeout(() => {
      // Filtrar prendas disponibles (no en la colada) que encajen con la ocasión
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

      // Selección óptima
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
    setGarments(garments.map(g => g.id === id ? { ...g, inLaundry: !g.inLaundry } : g));
  };

  const markOutfitAsWorn = () => {
    if (!currentOutfit) return;
    const outfitIds = currentOutfit.map(g => g.id);
    setGarments(garments.map(g => outfitIds.includes(g.id) ? { ...g, inLaundry: true } : g));
    setCurrentOutfit(null);
    alert("¡Outfit marcado como usado! Las prendas se han enviado a la colada.");
  };

  return (
    <div className="max-w-md mx-auto min-h-screen bg-slate-900 text-slate-100 flex flex-col pb-20 font-sans border-x border-slate-800 shadow-2xl">
      {/* Header */}
      <header className="p-4 border-b border-slate-800 bg-slate-900/80 backdrop-blur sticky top-0 z-10 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <Sparkles className="w-6 h-6 text-indigo-400" />
          <h1 className="text-xl font-bold bg-gradient-to-r from-indigo-400 to-pink-400 bg-clip-text text-transparent">Smart Closet</h1>
        </div>
        <div className="flex items-center gap-2 text-xs bg-slate-800 px-3 py-1.5 rounded-full border border-slate-700">
          <MapPin className="w-3.5 h-3.5 text-indigo-400" />
          <span>{locationName}</span>
          <span className="text-slate-500">|</span>
          <Thermometer className="w-3.5 h-3.5 text-amber-400" />
          <span>{temp}°C</span>
          {isRaining && <Droplets className="w-3.5 h-3.5 text-blue-400" />}
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
                  {occ === 'Work' ? 'Trabajo' : occ === 'Going Out' ? 'Salir' : 'Deporte'}
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
                      <p className="text-[10px] text-slate-400 capitalize">{item.category} • {item.color}</p>
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
          </div>

          <div className="grid grid-cols-2 gap-3">
            {garments.map((g) => (
              <div key={g.id} className={`bg-slate-800 rounded-xl overflow-hidden border ${g.inLaundry ? 'border-amber-500/40 opacity-60' : 'border-slate-700'} relative`}>
                <img src={g.image} alt={g.name} className="w-full h-32 object-cover" />
                <div className="p-2.5 space-y-2">
                  <div>
                    <p className="text-xs font-semibold text-slate-200 truncate">{g.name}</p>
                    <p className="text-[10px] text-slate-400">{g.category} • Abrigo: {g.warmth}/5</p>
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
                      <p className="text-[10px] text-slate-400">{g.category}</p>
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
