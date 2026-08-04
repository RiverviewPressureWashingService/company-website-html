document.addEventListener('DOMContentLoaded', function () {
    const form = document.getElementById('contactForm');
    const status = document.getElementById('formStatus');

    if (!form) return;

    const endpoint = 'https://api.riverviewpressurewashingservice.com/contact';

    form.addEventListener('submit', async function (e) {
        e.preventDefault();

        if (!form.checkValidity()) {
            form.reportValidity();
            return;
        }

        const payload = {
            firstName: form.firstName.value.trim(),
            lastName: form.lastName.value.trim(),
            phone: form.phone.value.trim(),
            email: form.email.value.trim(),
            service: form.service.value,
            message: form.message.value.trim()
        };

        if (status) status.textContent = 'Sending...';

        try {
            const res = await fetch(endpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(payload)
            });

            const data = await res.json().catch(() => ({}));
            if (!res.ok) throw new Error(data.error || 'Submission failed');

            form.reset();
            if (status) status.textContent = 'Message sent successfully.';
        } catch (err) {
            if (status) status.textContent = 'Sorry, something went wrong. Please try again.';
        }
    });
});
export default {
  async fetch(request, env) {
    const origin = request.headers.get('Origin') || '';
    const allowed = [
      'https://www.riverviewpressurewashingservice.com',
      'https://riverviewpressurewashingservice.com'
    ];

    if (request.method === 'OPTIONS') {
      return new Response(null, {
        status: 204,
        headers: corsHeaders(origin, allowed)
      });
    }

    if (request.method !== 'POST') {
      return json({ error: 'Method not allowed' }, 405, origin, allowed);
    }

    let body;
    try {
      body = await request.json();
    } catch {
      return json({ error: 'Invalid JSON' }, 400, origin, allowed);
    }

    const firstName = clean(body.firstName);
    const lastName = clean(body.lastName);
    const phone = clean(body.phone);
    const email = clean(body.email, true);
    const service = clean(body.service);
    const message = clean(body.message);

    if (!firstName || !lastName || !phone || !service || !message) {
      return json({ error: 'Missing required fields' }, 400, origin, allowed);
    }

    if (
      firstName.length > 80 ||
      lastName.length > 80 ||
      phone.length > 40 ||
      service.length > 80 ||
      message.length > 4000 ||
      email.length > 120
    ) {
      return json({ error: 'Field too long' }, 400, origin, allowed);
    }

    if (email && !/^\S+@\S+\.\S+$/.test(email)) {
      return json({ error: 'Invalid email' }, 400, origin, allowed);
    }

    const subject = `New Contact Form Submission - ${service}`;
    const text = [
      'New contact form submission',
      '',
      `Name: ${firstName} ${lastName}`,
      `Phone: ${phone}`,
      `Email: ${email || '(not provided)'}`,
      `Service Needed: ${service}`,
      '',
      'Message:',
      message
    ].join('\n');

    await env.SEND_EMAIL.send({
      from: 'noreply@riverviewpressurewashingservice.com',
      to: 'rwlovett@gmail.com',
      subject,
      text,
      replyTo: email || undefined
    });

    return json({ ok: true }, 200, origin, allowed);
  }
};

function clean(value, allowEmpty = false) {
  if (value == null) return '';
  return String(value).replace(/[<>]/g, '').trim();
}

function corsHeaders(origin, allowed) {
  const base = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type'
  };
  if (allowed.includes(origin)) base['Access-Control-Allow-Origin'] = origin;
  return base;
}

function json(data, status, origin, allowed) {
  return new Response(JSON.stringify(data), {
    status,
    headers: corsHeaders(origin, allowed)
  });
}