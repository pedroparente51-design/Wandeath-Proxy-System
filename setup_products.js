const {Client} = require('pg');
const client = new Client({
    connectionString: 'postgresql://postgres.ljeohtdmxsfulsnmfegj:S3Nh000054326@aws-1-us-east-2.pooler.supabase.com:6543/postgres?pgbouncer=true'
});

async function run() {
    await client.connect();
    console.log('Connected to DB');

    await client.query(`
        CREATE TABLE IF NOT EXISTS public.products (
            id SERIAL PRIMARY KEY,
            name TEXT NOT NULL,
            price NUMERIC NOT NULL,
            category TEXT NOT NULL,
            tag TEXT,
            description TEXT,
            delivery TEXT,
            youtubeUrl TEXT,
            image TEXT,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
        );
    `);
    
    await client.query(`ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;`);
    
    // Policy for Select
    await client.query(`DROP POLICY IF EXISTS "Enable read access for all users" ON public.products;`);
    await client.query(`CREATE POLICY "Enable read access for all users" ON public.products FOR SELECT USING (true);`);
    
    // Policy for Insert/Update/Delete (allowing all for now because admin panel is entirely client-side without auth right now)
    await client.query(`DROP POLICY IF EXISTS "Enable insert/update/delete for admin only" ON public.products;`);
    await client.query(`CREATE POLICY "Enable insert/update/delete for admin only" ON public.products FOR ALL USING (true);`);

    const res = await client.query('SELECT count(*) FROM public.products;');
    if (parseInt(res.rows[0].count) === 0) {
        await client.query(`
            INSERT INTO public.products (name, price, category, tag, description, delivery, image) VALUES 
            ('Proxy Residencial Rotativa', 13.99, 'rotativa', 'Mais vendido', 'IPs residenciais rotativos com alta reputação e baixa detecção. Ideal para operações em massa.', '187.12.44.1:8080:wandeath_user:pass123', '/img-rotativa/1gb.png'),
            ('Proxy Mobile Premium', 27.79, 'mobile', 'Premium', 'IPs móveis reais (4G/5G) para máxima autenticidade e alta taxa de sucesso.', 'proxy-mob:5678:user:pass', '/img-rotativa/3gb.png'),
            ('Proxy Residencial Fixa', 46.19, 'fixa', 'Contingência', 'IPs dedicados e estáveis para operações de longa duração e alta confiabilidade.', 'proxy-fixa:9999:user:pass', '/img-rotativa/5gb.png');
        `);
        console.log('Products seeded');
    }
    
    console.log('Database setup complete');
    await client.end();
}

run().catch(console.error);
