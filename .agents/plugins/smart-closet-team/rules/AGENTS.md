# Reglas de Arquitectura Multi-Agente — Smart Closet App

1. **Orquestación de 7 Agentes**:
   - Usa `agente-diagnostico` para auditorías técnicas, bugs, memoria o seguridad.
   - Usa `agente-mejoras` para proponer innovaciones de producto y mejoras de UX.
   - Usa `orquestador-proyecto` para coordinar tareas multi-disciplinares entre `experto-desarrollo`, `experto-apariencia`, `experto-ia-estilista` y `experto-qa-deploy`.
2. **Invariantes del Dominio**:
   - Contraseñas procesadas internamente con `PBKDF2-SHA256` (100.000 iteraciones) y datos morfológicos cifrados con `AES-256-GCM` en `src/security.js` (sin exponer tecnicismos de cifrado en la interfaz de usuario).
   - Toda prenda conserva su `subcategory` (`GARMENT_TYPES`) y su `category` funcional (`Top`, `Bottom`, `Outerwear`, `Footwear`).
   - Aislamiento multi-usuario en `localStorage` bajo `smart_closet_*_<username>`.
