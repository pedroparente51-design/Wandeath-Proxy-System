// Supabase Configuration for Wandeath VIP
const SUPABASE_URL = 'https://ljeohtdmxsfulsnmfegj.supabase.co';
const SUPABASE_KEY = 'sb_publishable_wUXSeCpUm0Ab__szSmOkFQ_Zx8Vm0DF';

// Initialize Supabase Client (SDK expõe window.supabase.createClient)
const supabaseClient = window.supabase
    ? window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY)
    : null;

if (supabaseClient) {
    console.log('Supabase connected successfully!');
} else {
    console.warn('Supabase SDK não carregado — continuando sem autenticação.');
}
