const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

let supabaseAdmin = null;

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;

if (supabaseUrl && supabaseServiceKey && supabaseUrl !== 'https://your-project.supabase.co') {
    supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
        auth: {
            autoRefreshToken: false,
            persistSession: false,
        },
    });
    console.log('🔐 Supabase admin client initialized');
} else {
    console.warn('⚠️  Supabase credentials not configured — auth features disabled');
}

module.exports = { supabaseAdmin };
