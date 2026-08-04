export default {
  async fetch(request, env) {
    if (request.method === 'OPTIONS') {
      return new Response(null, {
        status: 204,
        headers: corsHeaders(request)
      });
    }

    if (request.method !== 'POST') {
      return json({ error: 'Method not allowed' }, 405, request);
    }

    let body;
    try {
      body = await request.json();
    } catch {
      return json({ error: 'Invalid JSON' }, 400, request);
    }

    const firstName = String(body.firstName || '').trim();
    const lastName = String(body.lastName || '').trim();
    const phone = String(body.phone || '').trim();
    const email = String(body.email || '').trim();
    const service = String(body.service || '').trim();
    const message = String(body.message || '').trim();

    if (!firstName || !lastName || !phone || !service || !message) {
      return json({ error: 'Missing required fields' }, 400, request);
    }

    try {
      await env.EMAIL.send({
        to: 'rwlovett@gmail.com',
        from: 'noreply@riverviewpressurewashingservice.com',
        subject: `New Contact Form Submission - ${service}`,
        text:
          `Name: ${firstName} ${lastName}\n` +
          `Phone: ${phone}\n` +
          `Email: ${email || '(not provided)'}\n` +
          `Service Needed: ${service}\n\n` +
          `Message:\n${message}`
      });

      return json({ ok: true }, 200, request);
    } catch (error) {
      return json(
        { error: error?.message || 'Email send failed' },
        500,
        request
      );
    }
  }
};

function json(data, status, request) {
  return new Response(JSON.stringify(data), {
    status,
    headers: corsHeaders(request)
  });
}

function corsHeaders(request) {
  const origin = request.headers.get('Origin') || '*';

  return {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': origin,
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS'
  };
}