export default {
  async fetch(request, env) {
    if (request.method === "OPTIONS") {
      return new Response(null, {
        status: 204,
        headers: corsHeaders()
      });
    }

    if (request.method !== "POST") {
      return json({ error: "Method not allowed" }, 405);
    }

    let body;
    try {
      body = await request.json();
    } catch {
      return json({ error: "Invalid JSON" }, 400);
    }

    const firstName = String(body.firstName || "").trim();
    const lastName = String(body.lastName || "").trim();
    const phone = String(body.phone || "").trim();
    const email = String(body.email || "").trim();
    const service = String(body.service || "").trim();
    const message = String(body.message || "").trim();

    if (!firstName || !lastName || !phone || !service || !message) {
      return json({ error: "Missing required fields" }, 400);
    }

    try {
      await env.EMAIL.send({
        to: "rwlovett@gmail.com",
        from: "noreply@riverviewpressurewashingservice.com",
        subject: `New Contact Form Submission - ${service}`,
        text:
          `Name: ${firstName} ${lastName}\n` +
          `Phone: ${phone}\n` +
          `Email: ${email || "(not provided)"}\n` +
          `Service Needed: ${service}\n\n` +
          `Message:\n${message}`
      });

      return json({ ok: true });
    } catch (error) {
      return json(
        { error: error?.message || "Email send failed" },
        500
      );
    }
  }
};

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Headers": "Content-Type",
      "Access-Control-Allow-Methods": "POST, OPTIONS"
    }
  });
}

function corsHeaders() {
  return {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Allow-Methods": "POST, OPTIONS"
  };
}

document.getElementById('contactForm').addEventListener('submit', async (e) => {
  e.preventDefault();

  const form = e.target;
  const payload = {
    firstName: form.firstName.value.trim(),
    lastName: form.lastName.value.trim(),
    phone: form.phone.value.trim(),
    email: form.email.value.trim(),
    service: form.service.value.trim(),
    message: form.message.value.trim()
  };

  const res = await fetch('https://api.riverviewpressurewashingservice.com/contact', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });

  const data = await res.json();
  alert(data.ok ? 'Message sent.' : (data.error || 'Failed.'));
});