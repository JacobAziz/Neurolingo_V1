/* ========================================
   🎙️ TEXT-TO-SPEECH MODULE
   ======================================== */

import { API_URLS } from './config.js';
import { base64ToArrayBuffer, pcmToWav } from './audio-utils.js';

// 🎵 [Start: Audio Player Management]
let audioPlayer = null;
let currentAudio = null;

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
        const audioUrl = await generateAudioFromText(text, voice);
        
        audioPlayer.src = audioUrl;
        audioPlayer.play();
        currentAudio = audioPlayer;
        currentAudio.srcObject = { url: text }; // Tag it for comparison
        
        audioPlayer.onended = () => {
            button.innerHTML = originalIcon;
            button.disabled = false;
            URL.revokeObjectURL(audioUrl);
        };
        
    } catch (error) {
        console.error('TTS failed:', error);
        button.innerHTML = originalIcon;
        button.disabled = false;
    }
}
// 🔊 [End: Handle TTS Playback]

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
    
    const response = await fetch(API_URLS.tts, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
    });
    
    if (!response.ok) {
        throw new Error(`TTS API error: ${response.statusText}`);
    }
    
    const result = await response.json();
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


