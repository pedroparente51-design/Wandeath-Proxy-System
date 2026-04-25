// Supabase Configuration for Wandeath VIP
const SUPABASE_URL = 'https://ljeohtdmxsfulsnmfegj.supabase.co';
const SUPABASE_KEY = 'sb_publishable_wUXSeCpUm0Ab__szSmOkFQ_Zx8Vm0DF';

// Initialize Supabase Client
window.supabaseClient = window.supabase
    ? window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY)
    : null;

if (window.supabaseClient) {
    console.log('Supabase connected successfully!');
} else {
    console.warn('Supabase SDK não carregado — continuando sem autenticação.');
}

window.syncProductsFromSupabase = async function() {
    if (!window.supabaseClient) return;
    try {
        const { data: products, error } = await window.supabaseClient
            .from('products')
            .select('*')
            .order('id', { ascending: true });
            
        if (error) throw error;
        
        if (products && products.length > 0) {
            const mappedProducts = products.map(p => ({
                ...p,
                youtubeUrl: p.youtubeurl
            }));
            localStorage.setItem('wandeath_products', JSON.stringify(mappedProducts));
            window.dispatchEvent(new Event('wandeath_products_updated'));
            console.log('[Wandeath] Produtos sincronizados com o Supabase!', products.length);
        }
    } catch (e) {
        console.error('[Wandeath] Erro ao sincronizar produtos:', e.message);
    }
};

// Auto-sync na inicialização
window.syncProductsFromSupabase();
