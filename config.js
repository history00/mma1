const SUPABASE_URL = 'https://vxpvjivuebywafjvbozn.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_IN_diZfgJpMJbCuS3yfUIg_ysEX5n30';
const sb = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
const ADMIN_PIN = '1111';
console.log('✅ Supabase подключен:', SUPABASE_URL);
