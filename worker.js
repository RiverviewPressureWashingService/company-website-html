const allowedOrigins = new Set([
  "https://riverviewpressurewashingservice.com",
  "https://www.riverviewpressurewashingservice.com"
]);

function getCorsHeaders(request) {
  const origin = request.headers.get("Origin");

  if (!allowedOrigins.has(origin)) {
    return {};
  }

  return {
    "Access-Control-Allow-Origin": origin,
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Max-Age": "86400",
    "Vary": "Origin"
  };
}

function json(request, body, status = 200) {
  return Response.json(body, {
    status,
    headers: {
      ...getCorsHeaders(request),
      "Cache-Control": "no-store"
    }
  });
}

function clean(value, maxLength) {
  return typeof value === "string"
    ? value.trim().slice(0, maxLength)
    : "";
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (url.pathname !== "/contact") {
      return env.ASSETS.fetch(request);
    }

    const corsHeaders = getCorsHeaders(request);

    if (request.method === "OPTIONS") {
      if (!corsHeaders["Access-Control-Allow-Origin"]) {
        return new Response("Origin not allowed.", { status: 403 });
      }

      return new Response(null, {
        status: 204,
        headers: corsHeaders
      });
    }

    if (request.method !== "POST") {
      return json(request, {
        ok: false,
        error: "Method not allowed."
      }, 405);
    }

    if (!corsHeaders["Access-Control-Allow-Origin"]) {
      return json(request, {
        ok: false,
        error: "Origin not allowed."
      }, 403);
    }

    if (!request.headers.get("Content-Type")?.includes("application/json")) {
      return json(request, {
        ok: false,
        error: "Expected a JSON request."
      }, 415);
    }

    try {
      const body = await request.json();

      const firstName = clean(body.firstName, 80);
      const lastName = clean(body.lastName, 80);
      const phone = clean(body.phone, 50);
      const email = clean(body.email, 254);
      const service = clean(body.service, 120);
      const message = clean(body.message, 5000);

      if (!firstName || !lastName || !phone || !service || !message) {
        return json(request, {
          ok: false,
          error: "Please complete all required fields."
        }, 400);
      }

      if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        return json(request, {
          ok: false,
          error: "Please enter a valid email address."
        }, 400);
      }

      const text = [
        "New Riverview Pressure Washing quote request",
        "",
        `Name: ${firstName} ${lastName}`,
        `Phone: ${phone}`,
        `Email: ${email || "Not provided"}`,
        `Service: ${service}`,
        "",
        "Message:",
        message
      ].join("\n");

      await env.EMAIL.send({
        from: "contact@riverviewpressurewashingservice.com",
        to: "rwlovett@gmail.com",
        subject: `New quote request: ${service}`,
        text
      });

      return json(request, { ok: true });
    } catch (error) {
      console.error("Contact form error:", error);

      return json(request, {
        ok: false,
        error: "The message could not be sent. Please try again."
      }, 500);
    }
  }
};