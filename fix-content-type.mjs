import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';

// Reemplaza con tu service_role key (Project Settings → API)
const SUPABASE_URL = 'https://aypaifpbtykozsurpoyq.supabase.co';
const SERVICE_ROLE_KEY = 'TU_SERVICE_ROLE_KEY_AQUI';

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

const files = [
    { local: './terms-and-conditions.html', remote: 'terms-and-conditions.html' },
    // Agrega más si también necesitas arreglar privacy-policy.html
];

for (const file of files) {
    const content = readFileSync(file.local);

    const { error } = await supabase.storage
        .from('docs')
        .update(file.remote, content, {
            contentType: 'text/html; charset=utf-8',
            upsert: true,
        });

    if (error) {
        console.error(`Error con ${file.remote}:`, error.message);
    } else {
        console.log(`✓ ${file.remote} actualizado con Content-Type: text/html`);
    }
}
