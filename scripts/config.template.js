/* ========================================
   ⚙️ APPLICATION CONFIGURATION TEMPLATE
   ========================================
   
   📝 SETUP INSTRUCTIONS:
   1. Copy this file and rename it to: config.js
   2. Fill in your actual API keys below
   3. NEVER commit config.js to Git (it's in .gitignore)
   
   🔑 WHERE TO GET API KEYS:
   - Supabase: https://supabase.com/ (create project → Settings → API)
   - Gemini API: https://aistudio.google.com/app/apikey
   ======================================== */

// 🔒 [Start: Supabase Configuration]
export const SUPABASE_CONFIG = {
    url: 'YOUR_SUPABASE_PROJECT_URL_HERE',  // Example: https://xxxxx.supabase.co
    anonKey: 'YOUR_SUPABASE_ANON_KEY_HERE'  // Example: eyJhbGc...
};
// 🔒 [End: Supabase Configuration]

// 🔑 [Start: Gemini API Configuration]
export const GEMINI_CONFIG = {
    apiKey: 'YOUR_GEMINI_API_KEY_HERE',     // Example: AIzaSy...
    ttsModel: 'gemini-2.5-flash-preview-tts', // TTS uses Flash model
    genModel: 'gemini-2.5-pro' // Using Gemini 2.5 Pro for text generation
};

// Build API URLs
export const API_URLS = {
    tts: `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_CONFIG.ttsModel}:generateContent?key=${GEMINI_CONFIG.apiKey}`,
    generation: `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_CONFIG.genModel}:generateContent?key=${GEMINI_CONFIG.apiKey}`
};
// 🔑 [End: Gemini API Configuration]

// 🎙️ [Start: TTS Voice Options]
export const TTS_VOICES = [
    { value: 'Gacrux', label: 'Gacrux (Mature)' },
    { value: 'Autonoe', label: 'Autonoe (Bright)' },
    { value: 'Enceladus', label: 'Enceladus (Breathy)' },
    { value: 'Iapetus', label: 'Iapetus (Clear)' },
    { value: 'Umbriel', label: 'Umbriel (Easy-going)' },
    { value: 'Algieba', label: 'Algieba (Smooth)' },
    { value: 'Charon', label: 'Charon (Informative)' },
    { value: 'Kore', label: 'Kore (Firm)' }
];
// 🎙️ [End: TTS Voice Options]

// 🎯 [Start: App Constants]
export const APP_CONSTANTS = {
    retryAttempts: 3,
    retryDelay: 1000,
    dbTableName: 'german_analysis'
};
// 🎯 [End: App Constants]

