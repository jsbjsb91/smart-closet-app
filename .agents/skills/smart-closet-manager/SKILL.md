---
name: smart-closet-manager
description: >-
  Playbook operativo para gestionar, ampliar, rediseñar o depurar Smart Closet App
  coordinando al equipo de agentes (orquestador-proyecto, experto-desarrollo,
  experto-apariencia, experto-ia-estilista y experto-qa-deploy). Úsalo siempre que
  el usuario pida nuevas funciones, mejoras visuales, ajustes en el generador de
  outfits o mantenimiento del proyecto.
---

# Smart Closet Manager — Playbook de Gestión Multi-Agente

Esta skill guía la ejecución coordinada de cambios en **Smart Closet App** (`smart-closet-app/src/App.jsx`).

## 1. Cuándo invocar a cada Agente (`invoke_subagent`)

- **`orquestador-proyecto`**: Para peticiones grandes o abiertas que requieran dividir el trabajo en varias fases (ej. *"rediseña el armario y añade un calendario de outfits"*).
- **`experto-desarrollo`**: Para cambios en estado React, almacenamiento `localStorage`, gestión de usuarios, cámara/canvas, filtros o refactorización en subcomponentes.
- **`experto-apariencia`**: Para cambios de diseño visual, maquetación móvil Tailwind CSS, animaciones, tarjetas de prendas, modales y experiencia táctil.
- **`experto-ia-estilista`**: Para mejorar el algoritmo `generateOutfit`, el sistema de puntuación de 0 a 10 estrellas, los motivos de rechazo, la armonía de colores, la adaptación al clima o la integración con Gemini API.
- **`experto-qa-deploy`**: Para verificar la compilación (`npm run build`), auditar casos extremos y preparar el despliegue en Vercel.

## 2. Flujo Estándar para Nuevas Funcionalidades

1. **Inspección**: Revisa la sección relevante de [App.jsx](file:///c:/Users/seijo/.gemini/antigravity/scratch/smart-closet-app/smart-closet-app/src/App.jsx).
2. **Diseño de Datos (`experto-desarrollo`)**:
   - Si se añade una nueva categoría o atributo a las prendas, actualiza `GARMENT_TYPES` y asegura valores por defecto en el `useEffect` de carga para no romper los armarios ya guardados en `localStorage`.
3. **Lógica de Recomendación (`experto-ia-estilista`)**:
   - Si el cambio influye en cómo se eligen los outfits, ajusta los pesos de puntuación (`score`) dentro de `generateOutfit()` respetando `feedbackHistory` y `targetWarmth`.
4. **Interfaz Mobile-First (`experto-apariencia`)**:
   - Mantén la estética `slate-900` con acentos `indigo-500`/`purple-600`, bordes redondeados (`rounded-xl` / `rounded-2xl`) y controles cómodos para móvil.
5. **Validación (`experto-qa-deploy`)**:
   - Ejecuta `npm run build` en `c:\Users\seijo\.gemini\antigravity\scratch\smart-closet-app\smart-closet-app` para verificar que no hay errores.
