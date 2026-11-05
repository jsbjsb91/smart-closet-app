import React, { useState, useEffect } from 'react';
import { 
  Sparkles, Sun, CloudRain, Thermometer, Shirt, RefreshCw, 
  Check, Calendar, MapPin, Wand2, Plus, Trash2, WashingMachine, 
  SlidersHorizontal, Cloud, Navigation, ChevronRight
} from 'lucide-react';

const INITIAL_GARMENTS = [
  {
    id: '1',
    name: 'Blazer Entallada Negra',
    category: 'Outerwear',
    occasions: ['Work', 'Going Out'],
    warmth: 3,
    comfort: 3,
    inLaundry: false,
    color: 'Negro',
    pattern: 'Liso',
    image: 'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=400&auto=format&fit=crop&q=80'
  },
  {
    id: '2',
    name: 'Camiseta Algodón Blanca',
    category: 'Top',
    occasions: ['Work', 'Going Out', 'Sport'],
    warmth: 1,
    comfort: 5,
    inLaundry: false,
    color: 'Blanco',
    pattern: 'Liso',
    image: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=400&auto=format&fit=crop&q=80'
  },
  {
    id: '3',
    name: 'Jeans Fit Elásticos',
    category: 'Bottom',
    occasions: ['Work', 'Going Out'],
    warmth: 2,
    comfort: 4,
    inLaundry: false,
    color: 'Azul',
    pattern: 'Vaquero',
    image: 'https://images.unsplash.com/photo-1541099649105-f69ad21f3246?w=400&auto=format&fit=crop&q=80'
  },
  {
    id: '4',
    name: 'Zapatillas Blancas Urbanas',
    category: 'Footwear',
    occasions: ['Work', 'Going Out', 'Sport'],
    warmth: 2,
    comfort: 5,
    inLaundry: false,
    color: 'Blanco',
    pattern: 'Liso',
    image: 'https://images.unsplash.com/photo-1560769629-975ec94e6a86?w=400&auto=format&fit=crop&q=80'
  },
  {
    id: '5',
    name: 'Chubasquero Técnico Tarde',
    category: 'Outerwear',
    occasions: ['Work', 'Sport'],
    warmth: 4,
    comfort: 4,
    inLaundry: false,
    color: 'Gris',
    pattern: 'Impermeable',
    image: 'https://images.unsplash.com/photo-1544441893-675973e31985?w=400&auto=format&fit=crop&q=80'
  },
  {
    id: '6',
    name: 'Pantalón Chándal Cómodo',
    category: 'Bottom',
    occasions: ['Sport'],
    warmth: 3,
    comfort: 5,
    inLaundry: true,
    color: 'Gris',
    pattern: 'Liso',
    image: 'https://images.unsplash.com/photo-1552902865-b72c031ac5ea?w=400&auto=format&fit=crop&q=80'
  }
];

export default function App() {
  const [activeTab, setActiveTab] = useState('generator');
  const [garments, setGarments] = useState(INITIAL_GARMENTS);
  
  // Clima y Geolocalización
  const [locationName, setLocationName] = useState('A Coruña');
  const [temp, setTemp]