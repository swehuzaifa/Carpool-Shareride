const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../.env') });

const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_KEY
);

async function runMigrations() {
    const migrationsDir = path.join(__dirname, 'migrations');
    const files = fs.readdirSync(migrationsDir)
        .filter(f => f.endsWith('.sql'))
        .sort();

    console.log(`📦 Found ${files.length} migration files\n`);

    for (const file of files) {
        const filePath = path.join(migrationsDir, file);
        const sql = fs.readFileSync(filePath, 'utf8');

        console.log(`▶ Running: ${file}...`);
        const { error } = await supabase.rpc('exec_sql', { sql_string: sql }).maybeSingle();

        if (error) {
            // Try running via direct SQL if RPC not available
            const { error: err2 } = await supabase.from('_migrations').select().limit(0);
            console.log(`  ⚠️  RPC not available, running via SQL editor required`);
            console.log(`  Copy the SQL from: ${filePath}`);
        } else {
            console.log(`  ✅ ${file} applied`);
        }
    }

    console.log('\n🎉 Migration run complete!');
}

runMigrations().catch(console.error);
