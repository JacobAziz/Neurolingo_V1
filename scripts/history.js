/* ========================================
   📚 USER HISTORY MODULE
   ======================================== */

import { getSupabaseClient } from './supabase.js';
import { showElement, hideElement } from './ui-helpers.js';
import { renderResults } from './analyzer-renderer.js';

// 🎯 [Start: DOM Elements]
let historyContainer, historyLoading, historyError, historyContent;
let historyTabsContainer, analysisHistoryTab, scenariosHistoryTab;
let analysisHistoryList, scenariosHistoryList;
// 🎯 [End: DOM Elements]

// 🔧 [Start: Initialize History Module]
export function initHistory() {
    historyContainer = document.getElementById('history-container');
    historyLoading = document.getElementById('history-loading-indicator');
    historyError = document.getElementById('history-error-message');
    historyContent = document.getElementById('history-content');
    
    analysisHistoryTab = document.getElementById('history-tab-analysis');
    scenariosHistoryTab = document.getElementById('history-tab-scenarios');
    analysisHistoryList = document.getElementById('analysis-history-list');
    scenariosHistoryList = document.getElementById('scenarios-history-list');
    
    // Tab switching - only add listeners if elements exist
    if (analysisHistoryTab) {
        analysisHistoryTab.addEventListener('click', () => switchHistoryTab('analysis'));
    }
    if (scenariosHistoryTab) {
        scenariosHistoryTab.addEventListener('click', () => switchHistoryTab('scenarios'));
    }
}
// 🔧 [End: Initialize History Module]

// 📊 [Start: Load User History]
export async function loadUserHistory() {
    showElement(historyLoading);
    hideElement(historyError);
    hideElement(historyContent);
    
    try {
        const supabase = getSupabaseClient();
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) {
            throw new Error('User not authenticated');
        }
        
        // Load analysis history
        const { data: analysisHistory, error: analysisError } = await supabase
            .from('user_history')
            .select('*')
            .eq('user_id', user.id)
            .eq('type', 'analysis')
            .order('created_at', { ascending: false });
        
        if (analysisError) throw analysisError;
        
        // Load scenarios history
        const { data: scenariosHistory, error: scenariosError } = await supabase
            .from('user_history')
            .select('*')
            .eq('user_id', user.id)
            .eq('type', 'scenario')
            .order('created_at', { ascending: false });
        
        if (scenariosError) throw scenariosError;
        
        // Render history
        renderAnalysisHistory(analysisHistory || []);
        renderScenariosHistory(scenariosHistory || []);
        
        hideElement(historyLoading);
        showElement(historyContent);
        
    } catch (error) {
        console.error('Failed to load history:', error);
        historyError.textContent = 'Failed to load your history. Please try again.';
        hideElement(historyLoading);
        showElement(historyError);
    }
}
// 📊 [End: Load User History]

// 🎨 [Start: Render Analysis History]
function renderAnalysisHistory(history) {
    if (history.length === 0) {
        analysisHistoryList.innerHTML = `
            <div class="text-center py-12">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-16 w-16 mx-auto mb-4 text-gray-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2M9 5a2 2 0 0 0 2 2h2a2 2 0 0 0 2-2M9 5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2"></path>
                </svg>
                <p class="text-gray-400">No analyzed sentences yet.</p>
                <p class="text-gray-500 text-sm mt-2">Start analyzing German sentences to build your history!</p>
            </div>
        `;
        return;
    }
    
    let html = '<div class="space-y-4">';
    
    history.forEach(item => {
        const date = new Date(item.created_at).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
        
        html += `
            <div class="history-item p-4 rounded-lg border border-gray-700 hover:border-cyan-500 transition-colors cursor-pointer" data-type="analysis" data-id="${item.id}">
                <div class="flex justify-between items-start mb-2">
                    <div class="flex-1">
                        <p class="text-lg font-semibold text-gray-200">${item.sentence}</p>
                        <p class="text-sm text-gray-500 mt-1">${date}</p>
                    </div>
                    <button class="delete-history-btn text-red-400 hover:text-red-300 p-2" data-id="${item.id}" data-type="analysis">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <polyline points="3 6 5 6 21 6"></polyline>
                            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                        </svg>
                    </button>
                </div>
                <div class="flex items-center gap-2 text-sm text-gray-400">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48"></path>
                    </svg>
                    <span>Language Analysis</span>
                </div>
            </div>
        `;
    });
    
    html += '</div>';
    analysisHistoryList.innerHTML = html;
    
    // Add click listeners for viewing and deleting
    analysisHistoryList.querySelectorAll('.history-item').forEach(item => {
        item.addEventListener('click', (e) => {
            if (!e.target.closest('.delete-history-btn')) {
                const id = item.dataset.id;
                viewAnalysisHistory(id, history);
            }
        });
    });
    
    analysisHistoryList.querySelectorAll('.delete-history-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const id = btn.dataset.id;
            deleteHistoryItem(id, 'analysis');
        });
    });
}
// 🎨 [End: Render Analysis History]

// 🎨 [Start: Render Scenarios History]
function renderScenariosHistory(history) {
    if (history.length === 0) {
        scenariosHistoryList.innerHTML = `
            <div class="text-center py-12">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-16 w-16 mx-auto mb-4 text-gray-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path>
                    <circle cx="9" cy="7" r="4"></circle>
                    <path d="M22 21v-2a4 4 0 0 0-3-3.87"></path>
                    <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                </svg>
                <p class="text-gray-400">No scenarios generated yet.</p>
                <p class="text-gray-500 text-sm mt-2">Create your first dialogue scenario to build your history!</p>
            </div>
        `;
        return;
    }
    
    let html = '<div class="space-y-4">';
    
    history.forEach(item => {
        const date = new Date(item.created_at).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
        
        // Get preview of first line
        const firstLine = item.content?.dialogue?.[0]?.line_german || '';
        const preview = firstLine.length > 60 ? firstLine.substring(0, 60) + '...' : firstLine;
        
        html += `
            <div class="history-item p-4 rounded-lg border border-gray-700 hover:border-cyan-500 transition-colors cursor-pointer" data-type="scenario" data-id="${item.id}">
                <div class="flex justify-between items-start mb-2">
                    <div class="flex-1">
                        <p class="text-lg font-semibold text-gray-200">${item.scenario_title}</p>
                        <p class="text-sm text-gray-400 mt-1">${preview}</p>
                        <p class="text-sm text-gray-500 mt-1">${date}</p>
                    </div>
                    <button class="delete-history-btn text-red-400 hover:text-red-300 p-2" data-id="${item.id}" data-type="scenario">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <polyline points="3 6 5 6 21 6"></polyline>
                            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                        </svg>
                    </button>
                </div>
                <div class="flex items-center gap-2 text-sm text-gray-400">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path>
                        <circle cx="9" cy="7" r="4"></circle>
                        <path d="M22 21v-2a4 4 0 0 0-3-3.87"></path>
                        <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                    </svg>
                    <span>Scenario Dialogue</span>
                </div>
            </div>
        `;
    });
    
    html += '</div>';
    scenariosHistoryList.innerHTML = html;
    
    // Add click listeners for viewing and deleting
    scenariosHistoryList.querySelectorAll('.history-item').forEach(item => {
        item.addEventListener('click', (e) => {
            if (!e.target.closest('.delete-history-btn')) {
                const id = item.dataset.id;
                viewScenarioHistory(id, history);
            }
        });
    });
    
    scenariosHistoryList.querySelectorAll('.delete-history-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const id = btn.dataset.id;
            deleteHistoryItem(id, 'scenario');
        });
    });
}
// 🎨 [End: Render Scenarios History]

// 👁️ [Start: View Analysis History]
function viewAnalysisHistory(id, historyData) {
    const item = historyData.find(h => h.id === id);
    if (!item) return;
    
    // Switch to analyzer screen and render the results
    import('./navigation.js').then(({ showScreen }) => {
        showScreen('analyzer', 'history');
        
        // Set the sentence in the input
        document.getElementById('german-sentence').value = item.sentence;
        
        // Render the analysis results
        renderResults(item.sentence, item.content);
    });
}
// 👁️ [End: View Analysis History]

// 👁️ [Start: View Scenario History]
function viewScenarioHistory(id, historyData) {
    const item = historyData.find(h => h.id === id);
    if (!item) return;
    
    // Switch to scenarios screen and render the dialogue
    import('./navigation.js').then(({ showScreen }) => {
        showScreen('scenarios', 'history');
        
        // Import and use the renderDialogue function from scenarios module
        import('./scenarios.js').then(({ renderDialogueFromHistory }) => {
            renderDialogueFromHistory(item.content);
        });
    });
}
// 👁️ [End: View Scenario History]

// 🗑️ [Start: Delete History Item]
async function deleteHistoryItem(id, type) {
    if (!confirm('Are you sure you want to delete this item from your history?')) {
        return;
    }
    
    try {
        const supabase = getSupabaseClient();
        const { error } = await supabase
            .from('user_history')
            .delete()
            .eq('id', id);
        
        if (error) throw error;
        
        // Reload history
        await loadUserHistory();
        
    } catch (error) {
        console.error('Failed to delete history item:', error);
        alert('Failed to delete item. Please try again.');
    }
}
// 🗑️ [End: Delete History Item]

// 🔄 [Start: Switch History Tab]
function switchHistoryTab(tab) {
    if (tab === 'analysis') {
        analysisHistoryTab.classList.add('active');
        scenariosHistoryTab.classList.remove('active');
        showElement(analysisHistoryList);
        hideElement(scenariosHistoryList);
    } else {
        scenariosHistoryTab.classList.add('active');
        analysisHistoryTab.classList.remove('active');
        showElement(scenariosHistoryList);
        hideElement(analysisHistoryList);
    }
}
// 🔄 [End: Switch History Tab]

// 💾 [Start: Save Analysis to History]
export async function saveAnalysisToHistory(sentence, analysisData) {
    try {
        const supabase = getSupabaseClient();
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) return;
        
        const { error } = await supabase
            .from('user_history')
            .insert({
                user_id: user.id,
                type: 'analysis',
                sentence: sentence,
                content: analysisData
            });
        
        if (error) {
            console.error('Failed to save analysis to history:', error);
        }
    } catch (error) {
        console.error('Error saving analysis to history:', error);
    }
}
// 💾 [End: Save Analysis to History]

// 💾 [Start: Save Scenario to History]
export async function saveScenarioToHistory(scenarioTitle, scenarioData) {
    try {
        const supabase = getSupabaseClient();
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) return;
        
        const { error } = await supabase
            .from('user_history')
            .insert({
                user_id: user.id,
                type: 'scenario',
                scenario_title: scenarioTitle,
                content: scenarioData
            });
        
        if (error) {
            console.error('Failed to save scenario to history:', error);
        }
    } catch (error) {
        console.error('Error saving scenario to history:', error);
    }
}
// 💾 [End: Save Scenario to History]



