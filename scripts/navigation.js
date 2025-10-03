/* ========================================
   🧭 NAVIGATION MODULE
   ======================================== */

// 🎯 [Start: Screen Management]
let screens = {};
let currentScreen = 'selection';

export function initNavigation() {
    // Initialize screen references
    screens = {
        selection: document.getElementById('selection-container'),
        analyzer: document.getElementById('app-container'),
        scenarios: document.getElementById('scenarios-container'),
        history: document.getElementById('history-container')
    };
    
    // Set up navigation buttons
    const analyzerBtn = document.getElementById('goto-analyzer-btn');
    const scenariosBtn = document.getElementById('goto-scenarios-btn');
    const historyBtn = document.getElementById('goto-history-btn');
    
    if (analyzerBtn) {
        analyzerBtn.addEventListener('click', () => showScreen('analyzer'));
    }
    
    if (scenariosBtn) {
        scenariosBtn.addEventListener('click', () => showScreen('scenarios'));
    }
    
    if (historyBtn) {
        historyBtn.addEventListener('click', () => {
            console.log('History button clicked'); // Debug log
            showScreen('history');
            // Load history when navigating to history screen
            import('./history.js').then(({ loadUserHistory }) => {
                loadUserHistory();
            }).catch(error => {
                console.error('Failed to load history module:', error);
            });
        });
    } else {
        console.error('History button not found in DOM');
    }
    
    // Set up back buttons
    document.querySelectorAll('.back-to-selection-btn').forEach(btn => {
        btn.addEventListener('click', () => showScreen('selection'));
    });
}
// 🎯 [End: Screen Management]

// 🔀 [Start: Show Screen Function]
export function showScreen(screenName, from) {
    // Don't switch if already on the screen (unless coming from auth)
    if (screenName === currentScreen && from !== 'auth') return;
    
    // Hide all screens
    Object.values(screens).forEach(screen => screen.classList.add('hidden'));
    
    // Show requested screen
    if (screenName && screens[screenName]) {
        screens[screenName].classList.remove('hidden');
        currentScreen = screenName;
    }
}
// 🔀 [End: Show Screen Function]

// 📍 [Start: Get Current Screen]
export function getCurrentScreen() {
    return currentScreen;
}
// 📍 [End: Get Current Screen]


