export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const path = url.pathname;

    if (path === '/api/register' && request.method === 'POST') {
      return handleRegister(request, env);
    }

    return env.ASSETS.fetch(request);
  }
};

async function handleRegister(request, env) {
  try {
    const body = await request.json();
    const { prefix, target } = body;

    if (!prefix || typeof prefix !== 'string') {
      return jsonResponse({ error: 'Email prefix is required' }, 400);
    }

    if (!target || typeof target !== 'string') {
      return jsonResponse({ error: 'Target address is required' }, 400);
    }

    const emailPrefix = prefix.trim().toLowerCase();
    if (!/^[a-z0-9._-]+$/.test(emailPrefix)) {
      return jsonResponse({ error: 'Invalid email prefix. Use only lowercase letters, numbers, dots, hyphens, and underscores.' }, 400);
    }

    const fullEmail = `${emailPrefix}@jeffpowell.dev`;

    const existing = await env.KV_EMAIL.get(fullEmail);
    if (existing !== null) {
      return jsonResponse({ 
        error: `Email alias ${fullEmail} already exists with target: ${existing}`,
        exists: true 
      }, 409);
    }

    await env.KV_EMAIL.put(fullEmail, target);

    return jsonResponse({ 
      success: true, 
      email: fullEmail,
      target: target,
      message: `Successfully registered ${fullEmail} → ${target}`
    });

  } catch (error) {
    console.error('Registration error:', error);
    return jsonResponse({ error: 'Internal server error' }, 500);
  }
}

function jsonResponse(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' }
  });
}
