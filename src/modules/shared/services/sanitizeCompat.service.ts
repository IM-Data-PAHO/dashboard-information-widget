// Reexporta la nueva función sanitize como default para compatibilidad
import { sanitize as sanitizeAsync } from './sanitize.service';

// Para compatibilidad con código existente que espera sanitize(content) => string
export default function sanitizeCompat(content) {
    // Devuelve solo el html (sincrónico, pero realmente es promesa)
    // ¡OJO! Si el código llama sanitize y espera string, debe migrarse a usar sanitizeAsync
    // Esto es solo para evitar romper imports
    return sanitizeAsync(content).then(res => res.html);
}
