// Supabase Configuration for Wandeath VIP
const SUPABASE_URL = 'https://ljeohtdmxsfulsnmfegj.supabase.co';
const SUPABASE_KEY = 'sb_publishable_wUXSeCpUm0Ab__szSmOkFQ_Zx8Vm0DF';

// Initialize Supabase Client
const supabase = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

console.log('Supabase connected successfully!');
