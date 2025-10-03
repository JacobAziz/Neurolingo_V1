/* ========================================
   🔬 LANGUAGE ANALYZER MODULE
   ======================================== */

import { getSupabaseClient } from './supabase.js';
import { API_URLS, APP_CONSTANTS } from './config.js';
import { showElement, hideElement, showError, hideError } from './ui-helpers.js';
import { renderResults } from './analyzer-renderer.js';

// 🎯 [Start: DOM Elements]
let analyzeBtn, sentenceInput, loadingIndicator, dbIndicator, errorMessage, errorText, resultsContainer;
// 🎯 [End: DOM Elements]

// 🔧 [Start: Initialize Analyzer]
export function initAnalyzer() {
    analyzeBtn = document.getElementById('analyze-btn');
    sentenceInput = document.getElementById('german-sentence');
    loadingIndicator = document.getElementById('loading-indicator');
    dbIndicator = document.getElementById('db-indicator');
    errorMessage = document.getElementById('error-message');
    errorText = document.getElementById('error-text');
    resultsContainer = document.getElementById('results');
    
    analyzeBtn.addEventListener('click', handleAnalysis);
}
// 🔧 [End: Initialize Analyzer]

// 📊 [Start: Handle Analysis]
async function handleAnalysis() {
    const sentence = sentenceInput.value.trim();
    if (!sentence) return;
    
    // Reset UI
    hideElement(resultsContainer);
    hideElement(errorMessage);
    hideElement(dbIndicator);
    showElement(loadingIndicator);
    analyzeBtn.disabled = true;
    
    try {
        // 1. Check database cache first
        const cachedData = await checkDatabaseCache(sentence);
        
        if (cachedData) {
            // Show DB indicator briefly
            hideElement(loadingIndicator);
            showElement(dbIndicator);
            
            setTimeout(() => {
                hideElement(dbIndicator);
                renderResults(sentence, cachedData);
            }, 1000);
            
            return;
        }
        
        // 2. Call API if not cached
        const analysisData = await callGeminiAPI(sentence);
        
        // 3. Save to database cache
        await saveToDatabaseCache(sentence, analysisData);
        
        // 4. Save to user history
        import('./history.js').then(({ saveAnalysisToHistory }) => {
            saveAnalysisToHistory(sentence, analysisData);
        });
        
        // 5. Render results
        renderResults(sentence, analysisData);
        
    } catch (error) {
        console.error('Analysis failed:', error);
        errorText.textContent = error.message || 'An unknown error occurred.';
        showElement(errorMessage);
    } finally {
        hideElement(loadingIndicator);
        analyzeBtn.disabled = false;
    }
}
// 📊 [End: Handle Analysis]

// 💾 [Start: Check Database Cache]
async function checkDatabaseCache(sentence) {
    const supabase = getSupabaseClient();
    
    const { data: cachedData, error: dbError } = await supabase
        .from(APP_CONSTANTS.dbTableName)
        .select('analysis_data')
        .eq('sentence', sentence)
        .single();
    
    if (dbError && dbError.code !== 'PGRST116') { // PGRST116 = No rows found
        throw new Error(`Database error: ${dbError.message}`);
    }
    
    if (cachedData) {
        // Verify it's in the new format
        const isNewFormat = cachedData.analysis_data?.vocab_breakdown?.[0]?.german_word;
        if (isNewFormat) {
            return cachedData.analysis_data;
        }
    }
    
    return null;
}
// 💾 [End: Check Database Cache]

// 💾 [Start: Save to Database Cache]
async function saveToDatabaseCache(sentence, analysisData) {
    const supabase = getSupabaseClient();
    
    const { error } = await supabase
        .from(APP_CONSTANTS.dbTableName)
        .upsert({ sentence: sentence, analysis_data: analysisData }, { onConflict: 'sentence' });
    
    if (error) {
        console.error('Supabase upsert error:', error);
    }
}
// 💾 [End: Save to Database Cache]

// 🤖 [Start: Call Gemini API]
async function callGeminiAPI(sentence, retries = APP_CONSTANTS.retryAttempts, delay = APP_CONSTANTS.retryDelay) {
    const systemPrompt = `You are a German linguistics expert. Analyze the provided German sentence and return a detailed, structured JSON object. The JSON object must have the following keys: "translation_layers", "vocab_breakdown", "structure_analysis", "deeper_analysis", "linguistics_nuggets", and "plug_and_play".

- "translation_layers": An object with "word_for_word" and "proper_translation" strings.
- "vocab_breakdown": An array of objects, each representing a word from the sentence in order. Each object must have these keys:
    - "german_word": The German word from the sentence.
    - "meaning": The English meaning of the word.
    - "case_type": The grammatical case (e.g., "Nominative", "Accusative masculine singular"). Use "N/A" if not applicable.
    - "part_of_speech": The part of speech. For verbs, you MUST provide details in the format: "Verb - Infinitive: [infinitive_form] - [type/tense/mood]". For contractions like 'beim', explain them: "Contraction of bei dem - Preposition + Definite article".
- "structure_analysis": An object with "title", "explanation", and a "breakdown" array (each object with "part" and "role").
- "deeper_analysis": An object containing four sub-objects:
    1. "sentence_type": with "type" (e.g., "Simple") and "explanation" strings.
    2. "verb_placement": with "german" and "english" explanation strings.
    3. "idiomatic_expression": with "expression_found" (boolean) and "explanation" string.
    4. "difficulty_level": with "level" (e.g., "A1") and "explanation" string.
- "linguistics_nuggets": A main object containing three sub-objects: "untranslatable_particles", "reflexiveness", and "culture_specific_expressions".
    1. "untranslatable_particles": An object with "particle_found" (boolean), "particle_name" (string), "meaning_in_context" (string), and a detailed "explanation" (string). If none found, explanation should state so.
    2. "reflexiveness": An object analyzing reflexive verbs that don't exist in English. It must have: "reflexive_found" (boolean), "german_expression" (string, e.g., "sich erinnern"), "english_equivalent" (string, e.g., "to remember"), and "explanation" (string detailing the mismatch, e.g., "The German verb is reflexive... The English is not..."). If none found, explanation should state: "This sentence does not contain any German-specific reflexive verbs that differ from English.".
    3. "culture_specific_expressions": An object analyzing expressions deeply rooted in German culture that lack a direct English equivalent (e.g., "Feierabend", "Schadenfreude"). It must have: "expression_found" (boolean). If true, it MUST also include "german_expression" (string), "english_meaning" (string), and a detailed "explanation" (string describing the cultural context and why it's unique). If false, the "explanation" MUST be "No specific cultural expressions were found in this sentence.".
- "plug_and_play": An array of objects. Based on your 'structure_analysis', identify the key reusable building blocks (Subjects, Objects, important Expressions). For each block, provide an object with "german_phrase" and "english_meaning" keys. If the sentence is too simple for meaningful chunks, return an empty array.

Ensure the entire output is a single, valid JSON object following this exact structure.`;
    
    const payload = {
        contents: [{ parts: [{ text: `Analyze this sentence: "${sentence}"` }] }],
        systemInstruction: { parts: [{ text: systemPrompt }] },
        generationConfig: { responseMimeType: "application/json" }
    };
    
    for (let i = 0; i < retries; i++) {
        try {
            const response = await fetch(API_URLS.generation, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            
            if (!response.ok) {
                throw new Error(`API error: ${response.statusText}`);
            }
            
            const result = await response.json();
            const jsonString = result.candidates?.[0]?.content?.parts?.[0]?.text;
            
            if (!jsonString) {
                throw new Error("Invalid API response structure.");
            }
            
            return JSON.parse(jsonString);
            
        } catch (error) {
            if (i === retries - 1) throw error;
            await new Promise(res => setTimeout(res, delay * Math.pow(2, i)));
        }
    }
}
// 🤖 [End: Call Gemini API]


