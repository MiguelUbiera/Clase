/**
 * Cloudflare Worker: API para verificar disponibilidad de secuencias
 * Reemplaza al script de fetch del lado del cliente
 * 
 * Coloca este código en Cloudflare Workers
 * Ruta: /api/check
 */

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    
    // Solo responder a requests GET
    if (request.method !== 'GET') {
      return new Response('Method not allowed', { status: 405 });
    }

    // CORS headers para permitir llamadas desde el navegador
    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET',
      'Access-Control-Allow-Headers': 'Content-Type',
      'Content-Type': 'application/json',
    };

    // Si es un preflight CORS
    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }

    // Endpoint: /api/check?code=S321-00001
    const code = url.searchParams.get('code');
    if (!code) {
      return new Response(JSON.stringify({ error: 'Missing code parameter' }), {
        status: 400,
        headers: corsHeaders,
      });
    }

    try {
      // Verificar si la carpeta existe intentando obtener el index.html
      const sequencePath = `/${code}/index.html`;
      const response = await fetch(`https://v1-secuencia321.pages.dev${sequencePath}`, {
        method: 'HEAD',
        cf: { cacheTtl: 3600 }, // Cachear por 1 hora
      });

      const exists = response.ok;
      
      return new Response(JSON.stringify({ code, exists }), {
        status: 200,
        headers: corsHeaders,
      });
    } catch (error) {
      return new Response(JSON.stringify({ error: error.message }), {
        status: 500,
        headers: corsHeaders,
      });
    }
  },
};
