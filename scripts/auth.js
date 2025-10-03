/* ========================================
   🔐 AUTHENTICATION MODULE
   ======================================== */

import { getSupabaseClient } from './supabase.js';
import { showScreen } from './navigation.js';

// 🎯 [Start: DOM Elements]
let authContainer, mainAppWrapper;
let loginForm, googleLoginBtn, showSignupLink, logoutBtn;
let authErrorMessage;
// 🎯 [End: DOM Elements]

// 🔧 [Start: Initialize Auth Module]
export function initAuth() {
    // Get DOM elements
    authContainer = document.getElementById('auth-container');
    mainAppWrapper = document.getElementById('main-app-wrapper');
    loginForm = document.getElementById('login-form');
    googleLoginBtn = document.getElementById('google-login-btn');
    showSignupLink = document.getElementById('show-signup-link');
    logoutBtn = document.getElementById('logout-btn');
    authErrorMessage = document.getElementById('auth-error-message');
    
    // Set up event listeners
    loginForm.addEventListener('submit', handleLoginSubmit);
    googleLoginBtn.addEventListener('click', handleGoogleLogin);
    logoutBtn.addEventListener('click', handleLogout);
    showSignupLink.addEventListener('click', toggleAuthMode);
    
    // Listen to auth state changes
    const supabase = getSupabaseClient();
    supabase.auth.onAuthStateChange(handleAuthStateChange);
    
    // Check initial session
    checkUserSession();
}
// 🔧 [End: Initialize Auth Module]

// 🔍 [Start: Check User Session]
async function checkUserSession() {
    const supabase = getSupabaseClient();
    const { data: { session } } = await supabase.auth.getSession();
    
    if (session) {
        authContainer.classList.add('hidden');
        mainAppWrapper.classList.remove('hidden');
        showScreen('selection', 'auth');
    } else {
        authContainer.classList.remove('hidden');
        mainAppWrapper.classList.add('hidden');
    }
}
// 🔍 [End: Check User Session]

// 📝 [Start: Handle Login/Signup Submit]
async function handleLoginSubmit(e) {
    e.preventDefault();
    
    const email = e.target.email.value;
    const password = e.target.password.value;
    const isSignUp = showSignupLink.textContent.trim().toLowerCase() === 'sign in';
    
    const supabase = getSupabaseClient();
    
    try {
        let response;
        
        if (isSignUp) {
            response = await supabase.auth.signUp({ email, password });
        } else {
            response = await supabase.auth.signInWithPassword({ email, password });
        }
        
        if (response.error) throw response.error;
        
        if (isSignUp && !response.error && response.data.user) {
            alert('Signup successful! Please check your email to verify your account.');
        }
    } catch (error) {
        authErrorMessage.textContent = error.message;
        authErrorMessage.classList.remove('hidden');
    }
}
// 📝 [End: Handle Login/Signup Submit]

// 🔵 [Start: Handle Google Login]
function handleGoogleLogin() {
    const supabase = getSupabaseClient();
    supabase.auth.signInWithOAuth({ provider: 'google' });
}
// 🔵 [End: Handle Google Login]

// 🚪 [Start: Handle Logout]
function handleLogout() {
    const supabase = getSupabaseClient();
    supabase.auth.signOut();
}
// 🚪 [End: Handle Logout]

// 🔄 [Start: Toggle Auth Mode (Login/Signup)]
function toggleAuthMode(e) {
    e.preventDefault();
    
    const isLoginView = e.target.textContent.trim().toLowerCase() === 'sign up';
    
    e.target.textContent = isLoginView ? 'Sign in' : 'Sign up';
    document.getElementById('login-btn').textContent = isLoginView ? 'Sign Up' : 'Sign In';
    authContainer.querySelector('h2').textContent = isLoginView ? 'Create an Account' : 'Welcome Back!';
    authErrorMessage.classList.add('hidden');
}
// 🔄 [End: Toggle Auth Mode (Login/Signup)]

// 🎭 [Start: Handle Auth State Changes]
function handleAuthStateChange(event, session) {
    if (event === 'SIGNED_OUT') {
        showScreen(null, 'auth');
        authContainer.classList.remove('hidden');
        mainAppWrapper.classList.add('hidden');
    } else if (session) {
        authContainer.classList.add('hidden');
        mainAppWrapper.classList.remove('hidden');
        showScreen('selection', 'auth');
    }
}
// 🎭 [End: Handle Auth State Changes]


