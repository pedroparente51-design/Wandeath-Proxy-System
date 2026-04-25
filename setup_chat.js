const {Client} = require('pg');
const client = new Client({connectionString: 'postgresql://postgres.ljeohtdmxsfulsnmfegj:S3Nh000054326@aws-1-us-east-2.pooler.supabase.com:6543/postgres?pgbouncer=true'});
async function run() {
    await client.connect();
    await client.query(`CREATE TABLE IF NOT EXISTS public.chat_messages (id SERIAL PRIMARY KEY, session_id TEXT NOT NULL, sender TEXT NOT NULL, text TEXT NOT NULL, created_at TIMESTAMPTZ DEFAULT NOW());`);
    try { await client.query(`ALTER PUBLICATION supabase_realtime ADD TABLE public.chat_messages;`); } catch(e) { console.log('Publciation already added'); }
    await client.query(`ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;`);
    try { await client.query(`DROP POLICY IF EXISTS "Enable ALL for chat_messages" ON public.chat_messages;`); } catch(e) {}
    await client.query(`CREATE POLICY "Enable ALL for chat_messages" ON public.chat_messages FOR ALL USING (true) WITH CHECK (true);`);
    console.log('Tabela chat_messages criada com sucesso!');
    await client.end();
}
run().catch(console.error);
