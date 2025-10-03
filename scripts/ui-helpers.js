/* ========================================
   🎨 UI HELPER FUNCTIONS
   ======================================== */

// 📋 [Start: Copy to Clipboard]
export function copyToClipboard(text, button) {
    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.style.position = 'absolute';
    textarea.style.left = '-9999px';
    document.body.appendChild(textarea);
    textarea.select();
    
    try {
        document.execCommand('copy');
        const originalIcon = button.innerHTML;
        
        // Show success checkmark
        button.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" class="text-green-400"><polyline points="20 6 9 17 4 12"></polyline></svg>`;
        
        setTimeout(() => {
            button.innerHTML = originalIcon;
        }, 2000);
    } catch (err) {
        console.error('Failed to copy text:', err);
    }
    
    document.body.removeChild(textarea);
}
// 📋 [End: Copy to Clipboard]

// 🎭 [Start: Show/Hide Elements]
export function showElement(element) {
    element.classList.remove('hidden');
}

export function hideElement(element) {
    element.classList.add('hidden');
}

export function toggleElement(element) {
    element.classList.toggle('hidden');
}
// 🎭 [End: Show/Hide Elements]

// ⚠️ [Start: Error Display]
export function showError(errorElement, message) {
    errorElement.textContent = message;
    showElement(errorElement);
}

export function hideError(errorElement) {
    hideElement(errorElement);
}
// ⚠️ [End: Error Display]


