---
name: smart-closet-manager
description: >-
  Playbook operativo para gestionar, diagnosticar, mejorar, rediseñar o depurar Smart Closet App
  coordinando al equipo de 7 agentes (orquestador-proyecto, agente-diagnostico, agente-mejoras,
  experto-desarrollo, experto-apariencia, experto-ia-estilista y experto-qa-deploy). Úsalo siempre
  que el usuario pida diagnósticos, ideas de mejora, nuevas funciones, mejoras visuales o mantenimiento.
---

# Smart Closet Manager — Playbook de Gestión Multi-Agente (7 Especialistas)

Esta skill guía la ejecución coordinada de cambios, diagnósticos y mejoras continuas en **Smart Closet App** (`smart-closet-app/src/App.jsx` y `smart-closet-app/src/security.js`).

## 1. Cuándo invocar a cada Agente (`invoke_subagent`)

- **`orquestador-proyecto`**: Para peticiones grandes o multidisciplinares que requieran coordinar varios especialistas.
- **`agente-diagnostico`**: Para auditar la salud del código, encontrar bugs, revisar fugas de memoria/cámara, comprobar el cifrado `AES-256`/`PBKDF2` o diagnosticar por qué algo falla.
- **`agente-mejoras`**: Para analizar la app en busca de mejoras de UX, nuevas funciones de estilismo IA, estadísticas de uso del armario o recomendaciones de compra en tiendas según la talla y estilo del usuario.
- **`experto-desarrollo`**: Para cambios en estado React, criptografía (`src/security.js`), `localStorage`, calendario semanal, cámara/canvas o componentes.
- **`experto-apariencia`**: Para mejoras de diseño visual Tailwind CSS, tarjetas editoriales, animaciones y experiencia móvil.
- **`experto-ia-estilista`**: Para mejorar el algoritmo de outfits, el aprendizaje de 0 a 10 ⭐, la autodetección de prendas por foto o la armonía de colores.
- **`experto-qa-deploy`**: Para verificar builds, auditar casos extremos y desplegar en GitHub / Vercel.
