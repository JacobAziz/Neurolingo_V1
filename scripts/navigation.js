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
        scenarios: document.getElementById('scenarios-container')
    };
    
    // Set up navigation buttons
    document.getElementById('goto-analyzer-btn').addEventListener('click', () => showScreen('analyzer'));
    document.getElementById('goto-scenarios-btn').addEventListener('click', () => showScreen('scenarios'));
    
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


