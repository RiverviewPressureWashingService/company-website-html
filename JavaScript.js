export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (request.method === "GET") {
      return new Response(getPage(), {
        headers: { "Content-Type": "text/html;charset=UTF-8" }
      });
    }

    if (request.method === "POST" && url.pathname === "/contact") {
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
          to: "riverviewpressurewashingservices@gmail.com",
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

    return json({ error: "Not found" }, 404);
  }
};

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json" }
  });
}

function getPage() {
  return `<!doctype html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <title>Contact</title>
</head>
<body>
  <form id="contactForm">
    <input name="firstName" placeholder="First name" required>
    <input name="lastName" placeholder="Last name" required>
    <input name="phone" placeholder="Phone" required>
    <input name="email" type="email" placeholder="Email">
    <select name="service" required>
      <option value="">Choose a service</option>
      <option>Pressure Washing</option>
      <option>Soft Washing</option>
      <option>Roof Cleaning</option>
    </select>
    <textarea name="message" placeholder="Message" required></textarea>
    <button type="submit">Send</button>
  </form>

  <script>
    const form = document.getElementById('contactForm');
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const payload = Object.fromEntries(new FormData(form).entries());
      const res = await fetch('/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      alert(data.ok ? 'Sent!' : (data.error || 'Failed'));
    });
  </script>
</body>
</html>`;
}