/* ========================================
   🎙️ TEXT-TO-SPEECH MODULE
   ======================================== */

import { API_URLS } from './config.js';
import { base64ToArrayBuffer, pcmToWav } from './audio-utils.js';

// 🎵 [Start: Audio Player Management]
let audioPlayer = null;
let currentAudio = null;
let lastRequestTime = 0;
const MIN_REQUEST_INTERVAL = 5000; // Minimum 5 seconds between requests (for free tier rate limits)
const audioCache = new Map(); // Cache audio URLs to avoid repeated API calls
const MAX_RETRIES = 2;

export function initTTS() {
    audioPlayer = document.getElementById('audio-player');
    
    // Set up global TTS button listeners
    document.addEventListener('click', (e) => {
        const ttsButton = e.target.closest('.tts-btn, .dialogue-tts-btn');
        if (ttsButton) {
            const text = ttsButton.dataset.word || ttsButton.dataset.line;
            handleTTS(text, ttsButton);
        }
        
        const downloadButton = e.target.closest('.download-btn');
        if (downloadButton) {
            generateAndDownloadAudio(downloadButton.dataset.word, downloadButton);
        }
    });
}
// 🎵 [End: Audio Player Management]

// 🔊 [Start: Handle TTS Playback]
export async function handleTTS(text, button) {
    // Stop currently playing audio if any
    if (currentAudio && !currentAudio.paused) {
        currentAudio.pause();
        currentAudio.currentTime = 0;
        
        // Reset all TTS button icons
        document.querySelectorAll('.tts-btn, .dialogue-tts-btn').forEach(btn => {
            btn.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon></svg>`;
        });
        
        // If clicking the same button, just stop
        if (currentAudio.srcObject && currentAudio.srcObject.url === text) return;
    }
    
    const originalIcon = button.innerHTML;
    button.innerHTML = `<div class="w-5 h-5 border-2 border-gray-400 border-t-transparent rounded-full animate-spin"></div>`;
    button.disabled = true;
    
    try {
        const voice = document.getElementById('voice-select').value;
        const cacheKey = `${text}_${voice}`;
        
        // Check cache first
        let audioUrl;
        if (audioCache.has(cacheKey)) {
            console.log('Using cached audio for:', text.substring(0, 30));
            audioUrl = audioCache.get(cacheKey);
        } else {
            // Check rate limiting only for new API requests
            const now = Date.now();
            const timeSinceLastRequest = now - lastRequestTime;
            
            if (timeSinceLastRequest < MIN_REQUEST_INTERVAL) {
                const waitTime = Math.ceil((MIN_REQUEST_INTERVAL - timeSinceLastRequest) / 1000);
                showTTSError(button, `Please wait ${waitTime} seconds before requesting new audio`);
                button.innerHTML = originalIcon;
                button.disabled = false;
                return;
            }
            
            lastRequestTime = Date.now(); // Update last request time
            audioUrl = await generateAudioFromTextWithRetry(text, voice);
            
            // Cache the audio URL
            audioCache.set(cacheKey, audioUrl);
            
            // Limit cache size to 20 items (prevent memory issues)
            if (audioCache.size > 20) {
                const firstKey = audioCache.keys().next().value;
                const oldUrl = audioCache.get(firstKey);
                URL.revokeObjectURL(oldUrl);
                audioCache.delete(firstKey);
            }
        }
        
        audioPlayer.src = audioUrl;
        await audioPlayer.play();
        currentAudio = audioPlayer;
        currentAudio.srcObject = { url: text }; // Tag it for comparison
        
        audioPlayer.onended = () => {
            button.innerHTML = originalIcon;
            button.disabled = false;
        };
        
    } catch (error) {
        console.error('TTS playback failed:', error);
        
        // Show user-friendly error message
        if (error.message.includes('429')) {
            showTTSError(button, 'API rate limit reached. Free tier allows 2 requests/minute. Please wait 30+ seconds.');
        } else if (error.message.includes('Network')) {
            showTTSError(button, 'Network error. Check your connection.');
        } else if (error.message.includes('timeout')) {
            showTTSError(button, 'Request timeout. Please try again.');
        } else {
            showTTSError(button, 'Audio generation failed. Try again in 30 seconds.');
        }
        
        button.innerHTML = originalIcon;
        button.disabled = false;
    }
}
// 🔊 [End: Handle TTS Playback]

// 🚨 [Start: Show TTS Error]
function showTTSError(button, message) {
    // Create temporary error tooltip
    const tooltip = document.createElement('div');
    tooltip.textContent = message;
    tooltip.style.cssText = `
        position: fixed;
        background: #991b1b;
        color: white;
        padding: 10px 14px;
        border-radius: 8px;
        font-size: 13px;
        z-index: 9999;
        pointer-events: none;
        max-width: 300px;
        text-align: center;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
        line-height: 1.4;
    `;
    
    // Position near button
    const rect = button.getBoundingClientRect();
    tooltip.style.top = `${rect.top - 60}px`;
    tooltip.style.left = `${rect.left + rect.width / 2}px`;
    tooltip.style.transform = 'translateX(-50%)';
    
    document.body.appendChild(tooltip);
    
    // Remove after 5 seconds (longer for rate limit messages)
    const duration = message.includes('rate limit') ? 5000 : 3000;
    setTimeout(() => {
        tooltip.remove();
    }, duration);
}
// 🚨 [End: Show TTS Error]

// 🔄 [Start: Generate Audio with Retry Logic]
async function generateAudioFromTextWithRetry(text, voice, retries = MAX_RETRIES) {
    for (let attempt = 0; attempt <= retries; attempt++) {
        try {
            console.log(`Generating audio (attempt ${attempt + 1}/${retries + 1}):`, text.substring(0, 30));
            return await generateAudioFromText(text, voice);
        } catch (error) {
            console.error(`Attempt ${attempt + 1} failed:`, error.message);
            
            // Don't retry on rate limit errors
            if (error.message.includes('429')) {
                throw error;
            }
            
            // If this was the last attempt, throw the error
            if (attempt === retries) {
                throw error;
            }
            
            // Wait before retrying (exponential backoff)
            const waitTime = Math.min(1000 * Math.pow(2, attempt), 5000);
            console.log(`Waiting ${waitTime}ms before retry...`);
            await new Promise(resolve => setTimeout(resolve, waitTime));
        }
    }
}
// 🔄 [End: Generate Audio with Retry Logic]

// 💾 [Start: Generate and Download Audio]
export async function generateAndDownloadAudio(text, button) {
    const originalIcon = button.innerHTML;
    button.innerHTML = `<div class="w-5 h-5 border-2 border-gray-400 border-t-transparent rounded-full animate-spin"></div>`;
    button.disabled = true;
    
    try {
        const voice = document.getElementById('voice-select').value;
        const audioUrl = await generateAudioFromText(text, voice);
        
        // Download the file
        const a = document.createElement('a');
        a.style.display = 'none';
        a.href = audioUrl;
        a.download = `${text.substring(0, 20).replace(/[^a-z0-9]/gi, '_')}.wav`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(audioUrl);
        a.remove();
        
    } catch (error) {
        console.error('Audio download failed:', error);
    } finally {
        button.innerHTML = originalIcon;
        button.disabled = false;
    }
}
// 💾 [End: Generate and Download Audio]

// ⏱️ [Start: Fetch with Timeout]
async function fetchWithTimeout(url, options, timeout = 15000) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);
    
    try {
        const response = await fetch(url, {
            ...options,
            signal: controller.signal
        });
        clearTimeout(timeoutId);
        return response;
    } catch (error) {
        clearTimeout(timeoutId);
        if (error.name === 'AbortError') {
            throw new Error('Request timeout - please try again');
        }
        throw error;
    }
}
// ⏱️ [End: Fetch with Timeout]

// 🎼 [Start: Generate Audio from Text]
async function generateAudioFromText(text, voice) {
    const payload = {
        contents: [{ parts: [{ text: `Say this in German: ${text}` }] }],
        generationConfig: {
            responseModalities: ["AUDIO"],
            speechConfig: {
                voiceConfig: {
                    prebuiltVoiceConfig: { voiceName: voice }
                }
            }
        }
    };
    
    const response = await fetchWithTimeout(API_URLS.tts, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
    }, 15000);
    
    if (!response.ok) {
        if (response.status === 429) {
            throw new Error('429: Rate limit exceeded');
        }
        const errorData = await response.json().catch(() => ({}));
        throw new Error(`TTS API error: ${errorData.error?.message || response.statusText}`);
    }
    
    const result = await response.json();
    
    // Validate response structure
    if (!result.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data) {
        throw new Error('Invalid TTS API response format');
    }
    
    const audioData = result.candidates[0].content.parts[0].inlineData.data;
    const mimeType = result.candidates[0].content.parts[0].inlineData.mimeType;
    const sampleRate = parseInt(mimeType.match(/rate=(\d+)/)[1], 10);
    
    // Convert to WAV
    const pcmData = base64ToArrayBuffer(audioData);
    const pcm16 = new Int16Array(pcmData);
    const wavBlob = pcmToWav(pcm16, 1, sampleRate);
    
    return URL.createObjectURL(wavBlob);
}
// 🎼 [End: Generate Audio from Text]


