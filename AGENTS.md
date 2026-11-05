# Arquitectura Multi-Agente — Smart Closet App

Este repositorio cuenta con un sistema de **5 agentes especializados** y **skills operativas** para gestionar, evolucionar y mantener **Smart Closet App** (`smart-closet-app/src/App.jsx`) de manera óptima.

## 1. Mapa de Agentes y Roles

| Agente (`subagent` / `.agents/agents/`) | Rol Principal | Responsabilidades Clave |
| :--- | :--- | :--- |
| **`orquestador-proyecto`** | **Orquestador y Arquitecto de Producto** | Analiza las peticiones del usuario, descompone tareas complejas en pasos atómicos, delega en los agentes especialistas en paralelo o secuencia, y verifica la integración final. |
| **`experto-desarrollo`** | **Ingeniero Full-Stack & React** | Arquitectura de estado en React, custom hooks, persistencia segura multi-usuario en `localStorage`, captura/compresión de cámara en `<canvas>`, geolocalización y refactorización modular. |
| **`experto-apariencia`** | **Especialista en UI/UX & Fashion Design** | Sistema de diseño *mobile-first* con Tailwind CSS (`slate-900`, acentos `indigo`/`purple`/`pink`), micro-interacciones, selector de 0–10 estrellas, tarjetas de prendas y accesibilidad táctil. |
| **`experto-ia-estilista`** | **Motor de Estilismo IA & Algoritmos de Moda** | Algoritmo de puntuación de outfits (`generateOutfit`), aprendizaje por refuerzo a partir de `feedbackHistory` (valoraciones 0–10 ⭐ y rechazos), armonía de color, ajuste térmico y visión con Gemini API. |
| **`experto-qa-deploy`** | **Ingeniero de QA, Rendimiento y Despliegue** | Validación de builds con Vite (`npm run build`), control de cuota de `localStorage`, pruebas de casos extremos (armario vacío, fallbacks de cámara, migración de datos) y configuración de Vercel. |

---

## 2. Protocolo de Orquestación (Flujo de Trabajo)

Ante cualquier solicitud de cambio o nueva funcionalidad en **Smart Closet App**:

1. **Triaje y Planificación (`orquestador-proyecto`)**:
   - Si el cambio es **visual o de experiencia de usuario** -> delega o aplica las directrices de `experto-apariencia`.
   - Si el cambio afecta a **datos, estado, cámara, filtros o nuevos flujos** -> delega en `experto-desarrollo`.
   - Si el cambio afecta a **cómo se eligen, puntúan o aprenden los outfits** -> delega en `experto-ia-estilista`.
   - Si la tarea es **multidisciplinar** (ej. *"añadir planificador semanal de outfits"* o *"autocompletar prendas con IA al hacer una foto"*), el Orquestador coordina a `experto-desarrollo`, `experto-ia-estilista` y `experto-apariencia`.
2. **Invariantes del Dominio (Reglas de Oro)**:
   - **Slots y Subcategorías**: Toda prenda debe tener un `subcategory` válido de `GARMENT_TYPES` (`Camisetas`, `Camisas`, `Sudaderas`, `Jerseys`, `Pantalones`, `Vaqueros`, `FaldasShorts`, `Abrigos`, `Blazers`, `Calzado`) y su `category` funcional derivada mediante `getSlotFromType(subcategory)` (`Top`, `Bottom`, `Outerwear`, `Footwear`).
   - **Aislamiento Multi-Usuario**: Los datos siempre se leen y guardan bajo las claves `smart_closet_garments_<username>` y `smart_closet_feedback_<username>`.
   - **Compresión de Imágenes**: Las fotos de cámara o galería siempre deben redimensionarse en `<canvas>` (máx. `600px`, `image/jpeg` al `0.8`) antes de guardarse para no saturar `localStorage`.
   - **Aprendizaje de Feedback**: El generador debe respetar siempre las valoraciones de `0 a 10 ⭐`, penalizar combinaciones rechazadas (`comboKey`, `topBottomKey`, `colorPairKey`) y ajustar el sesgo térmico (`warmthBias`).
3. **Verificación Obligatoria (`experto-qa-deploy`)**:
   - Ningún cambio se da por terminado sin ejecutar `npm run build` en `smart-closet-app` y confirmar `exit code 0`.
