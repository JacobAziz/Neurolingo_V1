/* ========================================
   🎨 ANALYZER RESULTS RENDERER
   ======================================== */

import { copyToClipboard } from './ui-helpers.js';

// 🎯 [Start: Main Render Function]
export function renderResults(originalSentence, data) {
    const resultsContainer = document.getElementById('results');
    const tabContentWrapper = document.getElementById('tab-content-wrapper');
    
    const contentRenderers = {
        translation: () => renderTranslationLayers(originalSentence, data.translation_layers),
        vocab: () => renderVocabTable(data.vocab_breakdown),
        structure: () => renderStructureAnalysis(data.structure_analysis),
        deeper: () => renderDeeperAnalysis(data.deeper_analysis),
        nuggets: () => renderLinguisticsNuggets(data.linguistics_nuggets),
        plug: () => renderPlugAndPlay(data.plug_and_play)
    };
    
    function switchTab(category, tabName) {
        // Main category tabs
        document.querySelectorAll('.main-tab-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.category === category);
        });
        
        // Sub-tabs containers
        document.querySelectorAll('.sub-tabs-container').forEach(container => {
            container.classList.toggle('hidden', !container.id.includes(category));
        });
        
        // Sub-tabs
        document.querySelectorAll(`#sub-tabs-${category} .tab-btn`).forEach(btn => {
            btn.classList.toggle('active', btn.dataset.tab === tabName);
        });
        
        // Render content
        tabContentWrapper.innerHTML = contentRenderers[tabName]();
    }
    
    // Initial render
    resultsContainer.classList.remove('hidden');
    switchTab('essential', 'translation');
    
    // Set up tab event listeners
    document.querySelectorAll('.main-tab-btn').forEach(btn => {
        btn.onclick = () => {
            const firstSubTab = document.querySelector(`#sub-tabs-${btn.dataset.category} .tab-btn`).dataset.tab;
            switchTab(btn.dataset.category, firstSubTab);
        };
    });
    
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.onclick = () => {
            const category = btn.closest('.sub-tabs-container').id.split('-')[2];
            switchTab(category, btn.dataset.tab);
        };
    });
    
    // Set up copy button listener
    tabContentWrapper.addEventListener('click', (e) => {
        const copyButton = e.target.closest('.copy-btn');
        if (copyButton) {
            copyToClipboard(copyButton.dataset.textToCopy, copyButton);
        }
    });
}
// 🎯 [End: Main Render Function]

// 🌐 [Start: Render Translation Layers]
function renderTranslationLayers(original, translations) {
    return `
        <div class="space-y-4">
            <div class="p-4 rounded-lg flex items-center justify-between" style="background-color: var(--dark-navy);">
                <div>
                    <p class="text-xs text-gray-400 mb-1">German</p>
                    <p class="text-lg text-gray-200">${original}</p>
                </div>
                <div class="flex items-center gap-2">
                    <button class="copy-btn p-2 rounded-full hover:bg-gray-700" data-text-to-copy="${original}">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
                    </button>
                    <button class="tts-btn p-2 rounded-full hover:bg-gray-700" data-word="${original}">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon></svg>
                    </button>
                    <button class="download-btn p-2 rounded-full hover:bg-gray-700" data-word="${original}">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
                    </button>
                </div>
            </div>
            <div class="p-4 rounded-lg flex items-center justify-between" style="background-color: var(--dark-navy);">
                <div>
                    <p class="text-xs text-gray-400 mb-1">Word for word</p>
                    <p class="text-lg text-gray-200">${translations.word_for_word}</p>
                </div>
                <button class="copy-btn p-2 rounded-full hover:bg-gray-700" data-text-to-copy="${translations.word_for_word}">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
                </button>
            </div>
            <div class="p-4 rounded-lg flex items-center justify-between bg-green-500 bg-opacity-10 border border-green-500/30">
                <div>
                    <p class="text-xs text-green-300 mb-1">Proper Translation</p>
                    <p class="text-lg text-green-200 font-semibold">${translations.proper_translation}</p>
                </div>
                <button class="copy-btn p-2 rounded-full hover:bg-green-500/20" data-text-to-copy="${translations.proper_translation}">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-green-300"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
                </button>
            </div>
        </div>
    `;
}
// 🌐 [End: Render Translation Layers]

// 📚 [Start: Render Vocabulary Table]
function renderVocabTable(vocabData) {
    let table = `<div class="overflow-x-auto rounded-lg border" style="border-color: var(--lightest-navy);">
        <table class="min-w-full divide-y" style="divide-color: var(--lightest-navy); background-color: var(--dark-navy);">
            <thead>
                <tr>
                    <th class="py-3 px-4 text-left text-xs font-medium uppercase tracking-wider">#</th>
                    <th class="py-3 px-4 text-left text-xs font-medium uppercase tracking-wider">German Word</th>
                    <th class="py-3 px-4 text-left text-xs font-medium uppercase tracking-wider">Meaning</th>
                    <th class="py-3 px-4 text-left text-xs font-medium uppercase tracking-wider">Case Type</th>
                    <th class="py-3 px-4 text-left text-xs font-medium uppercase tracking-wider">Part of Speech</th>
                </tr>
            </thead>
            <tbody class="divide-y" style="divide-color: var(--lightest-navy);">`;
    
    vocabData.forEach((v, index) => {
        table += `<tr>
            <td class="py-4 px-4 whitespace-nowrap text-sm font-medium text-gray-400">${index + 1}</td>
            <td class="py-4 px-4 whitespace-nowrap">
                <div class="flex items-center">
                    <span class="font-semibold text-gray-200">${v.german_word}</span>
                    <button class="tts-btn ml-3 p-1 rounded-full hover:bg-gray-700" data-word="${v.german_word}">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon></svg>
                    </button>
                </div>
            </td>
            <td class="py-4 px-4 whitespace-nowrap text-sm">${v.meaning}</td>
            <td class="py-4 px-4 whitespace-nowrap text-sm">${v.case_type}</td>
            <td class="py-4 px-4 text-sm">${v.part_of_speech}</td>
        </tr>`;
    });
    
    return table + '</tbody></table></div>';
}
// 📚 [End: Render Vocabulary Table]

// 🏗️ [Start: Render Structure Analysis]
function renderStructureAnalysis(structureData) {
    let breakdown = '<ul class="space-y-3">';
    structureData.breakdown.forEach(b => {
        breakdown += `<li class="flex items-baseline">
            <span class="font-mono font-bold text-lg mr-4" style="color: var(--accent-cyan);">${b.part}</span>
            <span class="text-sm">${b.role}</span>
        </li>`;
    });
    breakdown += '</ul>';
    
    return `<div class="p-6 rounded-lg space-y-4" style="background-color: var(--dark-navy);">
        <h4 class="text-xl font-bold text-gray-100">${structureData.title}</h4>
        <p>${structureData.explanation}</p>
        <div class="border-t pt-4 mt-4" style="border-color: var(--lightest-navy);">${breakdown}</div>
    </div>`;
}
// 🏗️ [End: Render Structure Analysis]

// 🔍 [Start: Render Deeper Analysis]
function renderDeeperAnalysis(data) {
    const createListPoints = (text) => {
        if (!text) return '<li>No details provided.</li>';
        return text.split('. ')
            .filter(s => s.trim())
            .map(s => `<li>${s.trim().replace(/\.$/, '')}.</li>`)
            .join('');
    };
    
    const germanVerbPoints = createListPoints(data.verb_placement.german);
    const englishVerbPoints = createListPoints(data.verb_placement.english);
    
    return `
        <div class="space-y-6">
            <div class="p-6 rounded-lg" style="background-color: var(--dark-navy);">
                <h4 class="text-lg font-bold text-gray-100 mb-3">Sentence Type</h4>
                <p class="text-gray-300">
                    <strong class="font-semibold text-gray-200">St.Type:</strong> 
                    <span class="font-bold mx-1" style="color: var(--accent-cyan);">${data.sentence_type.type}</span> 
                    <span class="text-gray-400">(${data.sentence_type.explanation})</span>
                </p>
            </div>
            
            <div class="p-6 rounded-lg" style="background-color: var(--dark-navy);">
                <h4 class="text-lg font-bold text-gray-100 mb-4">Verb Placement</h4>
                <div class="space-y-4">
                    <div>
                        <h5 class="font-semibold text-gray-200 mb-2">In German:</h5>
                        <ul class="list-disc list-inside text-gray-400 space-y-1 pl-2">${germanVerbPoints}</ul>
                    </div>
                    <div>
                        <h5 class="font-semibold text-gray-200 mb-2">In English:</h5>
                        <ul class="list-disc list-inside text-gray-400 space-y-1 pl-2">${englishVerbPoints}</ul>
                    </div>
                </div>
            </div>
            
            <div class="p-6 rounded-lg" style="background-color: var(--dark-navy);">
                <h4 class="text-lg font-bold text-gray-100 mb-3">Idiomatic Expression</h4>
                <p class="text-gray-400">${data.idiomatic_expression.explanation}</p>
            </div>
            
            <div class="p-6 rounded-lg" style="background-color: var(--dark-navy);">
                <h4 class="text-lg font-bold text-gray-100 mb-3">Difficulty Level</h4>
                <p class="text-gray-300">
                    <span class="font-extrabold text-xl align-middle mr-2 py-1 px-2 rounded-md" style="color: var(--dark-navy); background-color: var(--accent-cyan);">${data.difficulty_level.level}</span>
                    <span class="align-middle">${data.difficulty_level.explanation}</span>
                </p>
            </div>
        </div>
    `;
}
// 🔍 [End: Render Deeper Analysis]

// 💎 [Start: Render Linguistics Nuggets]
function renderLinguisticsNuggets(data) {
    let html = '<div class="space-y-6">';
    
    // Untranslatable Particles
    const particles = data.untranslatable_particles;
    html += `<div class="p-6 rounded-lg" style="background-color: var(--dark-navy);">
        <h4 class="text-xl font-bold text-gray-100 mb-4">Untranslatable Particles</h4>`;
    
    if (particles.particle_found) {
        html += `<div class="border border-gray-700 rounded-lg p-4">
            <h5 class="font-mono text-lg font-bold mb-3" style="color: var(--accent-cyan);">"${particles.particle_name}"</h5>
            <ul class="space-y-3 text-sm">
                <li><strong class="font-semibold text-gray-300 block mb-1">Meaning in context:</strong> ${particles.meaning_in_context}</li>
                <li><strong class="font-semibold text-gray-300 block mb-1">Why it's untranslatable:</strong> ${particles.explanation}</li>
            </ul>
        </div>`;
    } else {
        html += `<p class="text-gray-400 text-sm">${particles.explanation}</p>`;
    }
    html += `</div>`;
    
    // Reflexiveness
    const reflex = data.reflexiveness;
    html += `<div class="p-6 rounded-lg" style="background-color: var(--dark-navy);">
        <h4 class="text-xl font-bold text-gray-100 mb-4">Reflexiveness</h4>`;
    
    if (reflex.reflexive_found) {
        html += `<div class="border border-gray-700 rounded-lg p-4">
            <h5 class="font-mono text-lg font-bold mb-3" style="color: var(--accent-cyan);">${reflex.german_expression}</h5>
            <ul class="space-y-3 text-sm">
                <li><strong class="font-semibold text-gray-300 block mb-1">English Equivalent:</strong> ${reflex.english_equivalent}</li>
                <li><strong class="font-semibold text-gray-300 block mb-1">The Mismatch:</strong> ${reflex.explanation}</li>
            </ul>
        </div>`;
    } else {
        html += `<p class="text-gray-400 text-sm">${reflex.explanation}</p>`;
    }
    html += `</div>`;
    
    // Culture Specific Expressions
    const culture = data.culture_specific_expressions;
    html += `<div class="p-6 rounded-lg" style="background-color: var(--dark-navy);">
        <h4 class="text-xl font-bold text-gray-100 mb-4">Culture Specific Expressions</h4>`;
    
    if (culture.expression_found) {
        html += `<div class="border border-gray-700 rounded-lg p-4">
            <h5 class="font-mono text-lg font-bold mb-3" style="color: var(--accent-cyan);">${culture.german_expression}</h5>
            <ul class="space-y-3 text-sm">
                <li><strong class="font-semibold text-gray-300 block mb-1">English Meaning:</strong> ${culture.english_meaning}</li>
                <li><strong class="font-semibold text-gray-300 block mb-1">Cultural Context:</strong> ${culture.explanation}</li>
            </ul>
        </div>`;
    } else {
        html += `<p class="text-gray-400 text-sm">${culture.explanation}</p>`;
    }
    html += `</div>`;
    
    html += '</div>';
    return html;
}
// 💎 [End: Render Linguistics Nuggets]

// 🧩 [Start: Render Plug and Play]
function renderPlugAndPlay(data) {
    if (!data || data.length === 0) {
        return `<div class="p-6 rounded-lg text-center" style="background-color: var(--dark-navy);">
            <p class="text-gray-400">This sentence is too simple to break into reusable phrases.</p>
        </div>`;
    }
    
    let tableRows = '';
    let fullTextToCopy = '';
    
    data.forEach((item, index) => {
        tableRows += `
            <tr class="border-b" style="border-color: var(--lightest-navy);">
                <td class="py-4 px-4 text-sm font-medium text-gray-400">${index + 1}</td>
                <td class="py-4 px-4 text-base font-semibold text-gray-200">${item.german_phrase}</td>
                <td class="py-4 px-4">
                    <button class="tts-btn p-2 rounded-full hover:bg-gray-700" data-word="${item.german_phrase}">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon></svg>
                    </button>
                </td>
                <td class="py-4 px-4 text-sm text-gray-300">${item.english_meaning}</td>
            </tr>
        `;
        fullTextToCopy += `${item.german_phrase} - ${item.english_meaning}\n`;
    });
    
    return `
        <div class="relative">
            <button class="copy-btn absolute top-0 right-0 mt-[-50px] p-2 rounded-lg hover:bg-gray-700" data-text-to-copy="${fullTextToCopy.trim()}" title="Copy all phrases">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
            </button>
            <div class="overflow-x-auto rounded-lg border" style="border-color: var(--lightest-navy); background-color: var(--dark-navy);">
                <table class="min-w-full">
                    <thead>
                        <tr class="border-b" style="border-color: var(--lightest-navy);">
                            <th class="py-3 px-4 text-left text-xs font-medium uppercase tracking-wider">#</th>
                            <th class="py-3 px-4 text-left text-xs font-medium uppercase tracking-wider">Plug and Play</th>
                            <th class="py-3 px-4 text-left text-xs font-medium uppercase tracking-wider">Listen</th>
                            <th class="py-3 px-4 text-left text-xs font-medium uppercase tracking-wider">Meaning in English</th>
                        </tr>
                    </thead>
                    <tbody>${tableRows}</tbody>
                </table>
            </div>
        </div>
    `;
}
// 🧩 [End: Render Plug and Play]


