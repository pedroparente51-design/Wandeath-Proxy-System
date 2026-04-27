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
            const localProducts = JSON.parse(localStorage.getItem('wandeath_products') || '[]');
            
            const mappedProducts = products.map(p => {
                const localP = localProducts.find(lp => lp.id === p.id || lp.name === p.name) || {};
                
                return {
                    ...p,
                    youtubeUrl: p.youtubeurl || localP.youtubeUrl || '',
                    minQty: [p.minqty, p.minQty, p.min_qty, localP.minQty].find(v => v !== undefined && v !== null) || 1,
                    maxQty: [p.maxqty, p.maxQty, p.max_qty, localP.maxQty].find(v => v !== undefined && v !== null) || 100,
                    delivery: p.delivery !== undefined ? p.delivery : (localP.delivery || '')
                };
            });
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
