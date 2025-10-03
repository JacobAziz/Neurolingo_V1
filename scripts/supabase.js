/* ========================================
   🗄️ SUPABASE CLIENT INITIALIZATION
   ======================================== */

import { SUPABASE_CONFIG } from './config.js';

// 🔗 [Start: Initialize Supabase Client]
let supabaseClient = null;

export function initSupabase() {
    if (SUPABASE_CONFIG.url === 'YOUR_SUPABASE_URL') {
        console.error('❌ Supabase URL not configured!');
        return null;
    }
    
    const { createClient } = supabase;
    supabaseClient = createClient(SUPABASE_CONFIG.url, SUPABASE_CONFIG.anonKey);
    return supabaseClient;
}

export function getSupabaseClient() {
    return supabaseClient;
}
// 🔗 [End: Initialize Supabase Client]


