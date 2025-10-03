/* ========================================
   🎭 SCENARIOS GENERATOR MODULE
   ======================================== */

import { API_URLS } from './config.js';
import { SCENARIOS } from '../data/scenarios.js';
import { showElement, hideElement, showError } from './ui-helpers.js';

// 🎯 [Start: DOM Elements]
let scenarioSelect, suggestContextBtn, generateDialogueBtn;
let scenarioLoading, scenarioError, dialogueOutput;
let contextInput, contextSuggestionsContainer;
// 🎯 [End: DOM Elements]

// 🔧 [Start: Initialize Scenarios Module]
export function initScenarios() {
    scenarioSelect = document.getElementById('scenario-select');
    suggestContextBtn = document.getElementById('suggest-context-btn');
    generateDialogueBtn = document.getElementById('generate-dialogue-btn');
    scenarioLoading = document.getElementById('scenario-loading-indicator');
    scenarioError = document.getElementById('scenario-error-message');
    dialogueOutput = document.getElementById('dialogue-output');
    contextInput = document.getElementById('scenario-context');
    contextSuggestionsContainer = document.getElementById('context-suggestions');
    
    populateScenarios();
    
    suggestContextBtn.addEventListener('click', getAIContextSuggestions);
    generateDialogueBtn.addEventListener('click', generateDialogue);
    
    // Context suggestion selection
    contextSuggestionsContainer.addEventListener('click', (e) => {
        if (e.target.tagName === 'BUTTON') {
            contextInput.value = e.target.textContent;
            contextSuggestionsContainer.innerHTML = '';
        }
    });
}
// 🔧 [End: Initialize Scenarios Module]

// 📋 [Start: Populate Scenarios Dropdown]
function populateScenarios() {
    SCENARIOS.forEach((scenario, index) => {
        const option = document.createElement('option');
        option.value = scenario;
        option.textContent = `Scenario ${index + 1}: ${scenario}`;
        scenarioSelect.appendChild(option);
    });
}
// 📋 [End: Populate Scenarios Dropdown]

// 💡 [Start: Get AI Context Suggestions]
async function getAIContextSuggestions() {
    const scenario = scenarioSelect.value;
    suggestContextBtn.textContent = 'Suggesting...';
    suggestContextBtn.disabled = true;
    
    const prompt = `Based on the German learning scenario "${scenario}", suggest three distinct, concise, and realistic contexts. Each context should be a single sentence a user could be in. Return ONLY a JSON array of 3 strings. Example: ["I'm at a crowded party and see someone I know.", "I'm meeting a colleague for the first time.", "I run into an old friend on the street."].`;
    
    try {
        const payload = {
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: { responseMimeType: "application/json" }
        };
        
        const response = await fetch(API_URLS.generation, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
        
        if (!response.ok) throw new Error('Failed to fetch suggestions.');
        
        const result = await response.json();
        const suggestions = JSON.parse(result.candidates[0].content.parts[0].text);
        
        renderContextSuggestions(suggestions);
        
    } catch (error) {
        console.error("Context suggestion error:", error);
        contextSuggestionsContainer.innerHTML = `<p class="text-red-400 text-sm">Could not generate suggestions.</p>`;
    } finally {
        suggestContextBtn.textContent = 'Or, let AI suggest a context';
        suggestContextBtn.disabled = false;
    }
}
// 💡 [End: Get AI Context Suggestions]

// 🎨 [Start: Render Context Suggestions]
function renderContextSuggestions(suggestions) {
    const html = suggestions.map(s => 
        `<button class="secondary-btn text-sm w-full text-left py-2 px-3 rounded-md">${s}</button>`
    ).join('');
    
    contextSuggestionsContainer.innerHTML = html;
}
// 🎨 [End: Render Context Suggestions]

// ✨ [Start: Generate Dialogue]
async function generateDialogue() {
    const scenario = scenarioSelect.value;
    const context = contextInput.value;
    const format = document.getElementById('dialogue-format').value;
    const length = document.getElementById('dialogue-length').value;
    
    if (!context) {
        scenarioError.textContent = "Please provide a context for the scenario.";
        showElement(scenarioError);
        return;
    }
    
    showElement(scenarioLoading);
    hideElement(scenarioError);
    hideElement(dialogueOutput);
    generateDialogueBtn.disabled = true;
    
    const prompt = `You are a German language tutor. Create a German dialogue for a language learner.
- Scenario: ${scenario}
- Context: ${context}
- Format: ${format}
- Length: ${length}
- The dialogue should be natural, using common colloquialisms where appropriate.
- Provide a title for the dialogue.
- The dialogue should be between two speakers, clearly labeled (e.g., Speaker A, Speaker B, or with names).

Return a single, valid JSON object with the following structure:
{
  "title": "Dialogue Title",
  "dialogue": [
    { "speaker": "Speaker Name", "line_german": "German text...", "line_english": "English translation..." },
    { "speaker": "Another Speaker", "line_german": "...", "line_english": "..." }
  ]
}`;
    
    try {
        const payload = {
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: { responseMimeType: "application/json" }
        };
        
        const response = await fetch(API_URLS.generation, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
        
        if (!response.ok) throw new Error('Failed to generate dialogue.');
        
        const result = await response.json();
        const dialogueData = JSON.parse(result.candidates[0].content.parts[0].text);
        
        renderDialogue(dialogueData);
        
    } catch (error) {
        console.error("Dialogue generation error:", error);
        scenarioError.textContent = "Sorry, I couldn't generate the dialogue. Please try again.";
        showElement(scenarioError);
    } finally {
        hideElement(scenarioLoading);
        generateDialogueBtn.disabled = false;
    }
}
// ✨ [End: Generate Dialogue]

// 🎨 [Start: Render Dialogue]
function renderDialogue(data) {
    let html = `<h3 class="text-2xl font-bold text-center mb-4 text-gray-100">${data.title}</h3>`;
    html += '<div class="space-y-4">';
    
    data.dialogue.forEach(item => {
        html += `
            <div class="p-4 rounded-lg" style="background-color: var(--dark-navy);">
                <div class="flex justify-between items-center mb-2">
                    <p class="font-bold text-gray-200">${item.speaker}</p>
                    <button class="dialogue-tts-btn p-2 rounded-full hover:bg-gray-700" data-line="${item.line_german}">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon></svg>
                    </button>
                </div>
                <p class="text-lg text-gray-300">${item.line_german}</p>
                <p class="text-sm text-gray-500 mt-1">${item.line_english}</p>
            </div>
        `;
    });
    
    html += '</div>';
    dialogueOutput.innerHTML = html;
    showElement(dialogueOutput);
}
// 🎨 [End: Render Dialogue]


