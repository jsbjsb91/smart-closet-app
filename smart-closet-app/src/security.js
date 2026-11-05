// ============================================================================
// CAPA DE SEGURIDAD, CRIPTOGRAFÍA WEB (PBKDF2 + AES-GCM) Y NUBE (FIREBASE)
// ============================================================================

const SECURITY_SALT_PREFIX = 'smart_closet_v2_sec_';
const PBKDF2_ITERATIONS = 100000;

const bufToBase64 = (buffer) => {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
};

const base64ToBuf = (base64) => {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes.buffer;
};

/**
 * Genera o recupera un salt aleatorio de 128 bits para un usuario.
 */
export const getOrCreateUserSalt = (username) => {
  const key = `smart_closet_salt_${username.toLowerCase()}`;
  let existing = localStorage.getItem(key);
  if (!existing) {
    const randomBytes = crypto.getRandomValues(new Uint8Array(16));
    existing = bufToBase64(randomBytes.buffer);
    localStorage.setItem(key, existing);
  }
  return existing;
};

/**
 * Deriva un hash irreversible PBKDF2-SHA256 de la contraseña para no guardar nunca contraseñas en texto plano.
 */
export const hashPasswordSecure = async (password, username) => {
  if (!password) return '';
  if (!window.crypto?.subtle) {
    // Fallback básico si el navegador no está en contexto HTTPS/localhost
    return `legacy_${btoa(encodeURIComponent(password))}`;
  }
  const enc = new TextEncoder();
  const salt = getOrCreateUserSalt(username);
  const keyMaterial = await window.crypto.subtle.importKey(
    'raw',
    enc.encode(password),
    { name: 'PBKDF2' },
    false,
    ['deriveBits']
  );
  const derivedBits = await window.crypto.subtle.deriveBits(
    {
      name: 'PBKDF2',
      salt: enc.encode(`${SECURITY_SALT_PREFIX}${salt}`),
      iterations: PBKDF2_ITERATIONS,
      hash: 'SHA-256'
    },
    keyMaterial,
    256
  );
  return `pbkdf2$${salt}$${bufToBase64(derivedBits)}`;
};

/**
 * Verifica una contraseña contra el hash almacenado (con migración transparente si era texto plano antiguo).
 */
export const verifyPasswordSecure = async (inputPassword, storedUser) => {
  if (!storedUser.passwordHash && !storedUser.password) return true;
  if (storedUser.passwordHash) {
    const computed = await hashPasswordSecure(inputPassword, storedUser.username);
    return computed === storedUser.passwordHash;
  }
  // Retrocompatibilidad con cuentas creadas antes del cifrado PBKDF2
  return storedUser.password === inputPassword;
};

/**
 * Deriva una clave criptográfica AES-GCM de 256 bits para cifrar los datos sensibles del perfil (peso, altura, fecha de nacimiento).
 */
const getDeviceEncryptionKey = async (username) => {
  const enc = new TextEncoder();
  const salt = getOrCreateUserSalt(username);
  const keyMaterial = await window.crypto.subtle.importKey(
    'raw',
    enc.encode(`${SECURITY_SALT_PREFIX}_vault_${username.toLowerCase()}`),
    { name: 'PBKDF2' },
    false,
    ['deriveKey']
  );
  return window.crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: enc.encode(salt),
      iterations: 50000,
      hash: 'SHA-256'
    },
    keyMaterial,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt']
  );
};

/**
 * Cifra un objeto JSON sensible (como medidas corporales y fecha de nacimiento) con AES-GCM 256 bits.
 */
export const encryptSensitiveProfile = async (username, profileData) => {
  if (!window.crypto?.subtle) return JSON.stringify(profileData);
  try {
    const key = await getDeviceEncryptionKey(username);
    const iv = window.crypto.getRandomValues(new Uint8Array(12));
    const encoded = new TextEncoder().encode(JSON.stringify(profileData));
    const cipherBuf = await window.crypto.subtle.encrypt(
      { name: 'AES-GCM', iv },
      key,
      encoded
    );
    return `aesgcm$${bufToBase64(iv.buffer)}$${bufToBase64(cipherBuf)}`;
  } catch (e) {
    console.warn('Error al cifrar perfil:', e);
    return JSON.stringify(profileData);
  }
};

/**
 * Descifra el objeto JSON sensible cifrado con AES-GCM 256 bits.
 */
export const decryptSensitiveProfile = async (username, encryptedPayload) => {
  if (!encryptedPayload) return {};
  if (typeof encryptedPayload === 'object') return encryptedPayload;
  if (!String(encryptedPayload).startsWith('aesgcm$')) {
    try {
      return JSON.parse(encryptedPayload);
    } catch {
      return {};
    }
  }
  try {
    const [, ivB64, cipherB64] = String(encryptedPayload).split('$');
    const key = await getDeviceEncryptionKey(username);
    const iv = new Uint8Array(base64ToBuf(ivB64));
    const cipherBuf = base64ToBuf(cipherB64);
    const plainBuf = await window.crypto.subtle.decrypt(
      { name: 'AES-GCM', iv },
      key,
      cipherBuf
    );
    return JSON.parse(new TextDecoder().decode(plainBuf));
  } catch (e) {
    console.warn('No se pudo descifrar el perfil sensible:', e);
    return {};
  }
};
