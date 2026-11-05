# Arquitectura Multi-Agente — Smart Closet App

Este repositorio cuenta con un ecosistema de **7 agentes especializados** (más el autor de reglas de seguridad de Firestore) y **skills operativas** para diagnosticar, evolucionar, asegurar y mantener **Smart Closet App** (`smart-closet-app/src/App.jsx` y `smart-closet-app/src/security.js`) de manera óptima.

## 1. Mapa de Agentes y Roles

| Agente (`subagent` / `.agents/agents/`) | Rol Principal | Responsabilidades Clave |
| :--- | :--- | :--- |
| **`orquestador-proyecto`** | **Orquestador y Arquitecto de Producto** | Analiza las peticiones del usuario, descompone tareas complejas en pasos atómicos, delega en los agentes especialistas en paralelo o secuencia, y verifica la integración final. |
| **`agente-diagnostico`** | **Ingeniero de Diagnóstico, Depuración y Salud** | Audita el código en busca de bugs, fugas de memoria/cámara, límites de cuota en `localStorage`, manejo de errores asíncronos y vulnerabilidades de seguridad/cifrado. |
| **`agente-mejoras`** | **Analista de Mejoras e Innovación Fashion-Tech** | Analiza la app proactivamente para proponer mejoras de UX, nuevas funciones de estilismo IA, detección de huecos en el armario (*Wardrobe Gaps*) y recomendación de tiendas según talla/medidas. |
| **`experto-desarrollo`** | **Ingeniero Full-Stack & React** | Arquitectura de estado en React, criptografía Web (`PBKDF2` + `AES-256-GCM`), persistencia multi-usuario, calendario semanal, cámara en `<canvas>` y geolocalización. |
| **`experto-apariencia`** | **Especialista en UI/UX & Fashion Design** | Sistema de diseño *mobile-first* con Tailwind CSS, tarjetas editoriales del armario, selector de 0–10 estrellas, micro-interacciones y accesibilidad táctil. |
| **`experto-ia-estilista`** | **Motor de Estilismo IA & Visión por Computador** | Algoritmo de puntuación de outfits (`generateOutfit` y planificador semanal), aprendizaje por refuerzo (`feedbackHistory`), autodetección de prendas por foto (Gemini Vision + Canvas HSL) y teoría del color. |
| **`experto-qa-deploy`** | **Ingeniero de QA, Rendimiento y Despliegue** | Validación de builds con Vite (`npm run build`), control de cuota de almacenamiento, pruebas de casos extremos y sincronización continua con GitHub y Vercel. |

---

## 2. Protocolo de Orquestación (Flujo de Trabajo)

Ante cualquier solicitud de cambio, auditoría o nueva funcionalidad en **Smart Closet App**:

1. **Diagnóstico y Análisis Proactivo (`agente-diagnostico` + `agente-mejoras`)**:
   - Si el usuario reporta un comportamiento inesperado o quiere revisar el estado técnico -> invoca a `agente-diagnostico`.
   - Si el usuario busca ideas, optimizaciones o siguientes pasos de producto -> invoca a `agente-mejoras`.
2. **Triaje y Ejecución (`orquestador-proyecto`)**:
   - Cambios visuales o de experiencia móvil -> `experto-apariencia`.
   - Cambios de datos, seguridad, estado, cámara o calendario -> `experto-desarrollo`.
   - Cambios en recomendación de outfits, feedback o visión por foto -> `experto-ia-estilista`.
3. **Invariantes del Dominio (Reglas de Oro)**:
   - **Seguridad y Privacidad Primero**: Las contraseñas siempre se procesan con `hashPasswordSecure` (`PBKDF2-SHA256`, 100.000 iteraciones) y los datos morfológicos (`gender`, `birthDate`, `heightCm`, `weightKg`) se cifran con `encryptSensitiveProfile` (`AES-256-GCM`) en `src/security.js`.
   - **Slots y Subcategorías**: Toda prenda debe tener un `subcategory` válido de `GARMENT_TYPES` y su `category` funcional derivada mediante `getSlotFromType(subcategory)` (`Top`, `Bottom`, `Outerwear`, `Footwear`).
   - **Aislamiento Multi-Usuario**: Los datos siempre se leen y guardan bajo las claves `smart_closet_garments_<username>`, `smart_closet_feedback_<username>` y `smart_closet_planner_<username>`.
   - **Compresión de Imágenes**: Las fotos de cámara o galería siempre deben redimensionarse en `<canvas>` (máx. `600px`, `image/jpeg`) antes de guardarse.
4. **Verificación y Despliegue (`experto-qa-deploy`)**:
   - Validar el código y mantener `origin/main` actualizado para despliegue automático en Vercel.
