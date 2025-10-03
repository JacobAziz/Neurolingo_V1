/* ========================================
   🚀 MAIN APPLICATION ENTRY POINT
   ======================================== */

import { initSupabase } from './supabase.js';
import { initAuth } from './auth.js';
import { initNavigation } from './navigation.js';
import { initAnalyzer } from './analyzer.js';
import { initScenarios } from './scenarios.js';
import { initTTS } from './tts.js';
import { initHistory } from './history.js';
import { TTS_VOICES } from './config.js';

// 🎬 [Start: Initialize Application]
document.addEventListener('DOMContentLoaded', () => {
    console.log('🎯 Initializing NeuroLingo Hub...');
    
    // Initialize Supabase client
    const supabase = initSupabase();
    if (!supabase) {
        console.error('❌ Failed to initialize Supabase');
        return;
    }
    
    // Populate voice selector
    populateVoiceSelector();
    
    // Initialize all modules
    console.log('🔧 Initializing modules...');
    initAuth();
    initNavigation();
    initAnalyzer();
    initScenarios();
    initTTS();
    
    console.log('📚 Initializing history module...');
    try {
        initHistory();
        console.log('✅ History module initialized');
    } catch (error) {
        console.error('❌ History module initialization failed:', error);
    }
    
    console.log('✅ NeuroLingo Hub initialized successfully!');
});
// 🎬 [End: Initialize Application]

// 🎙️ [Start: Populate Voice Selector]
function populateVoiceSelector() {
    const voiceSelect = document.getElementById('voice-select');
    
    TTS_VOICES.forEach(voice => {
        const option = document.createElement('option');
        option.value = voice.value;
        option.textContent = voice.label;
        voiceSelect.appendChild(option);
    });
}
// 🎙️ [End: Populate Voice Selector]


