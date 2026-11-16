import { readFileSync, statSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { join } from 'node:path';
import { validateCatalog } from './catalog.mjs';

const root = fileURLToPath(new URL('../', import.meta.url));
try {
    const catalog = validateCatalog(JSON.parse(readFileSync(join(root, 'badges.json'), 'utf8')));
    for (const [id, badge] of Object.entries(catalog.badges)) {
        if (badge.icon.startsWith('icons/') && !statSync(join(root, badge.icon)).isFile()) {
            throw new Error(`Imagem não encontrada: ${id} (${badge.icon}).`);
        }
    }
    console.log(`Catálogo válido: ${Object.keys(catalog.badges).length} badges e ${Object.keys(catalog.users).length} usuários.`);
} catch (error) {
    console.error(error.message);
    process.exitCode = 1;
}
