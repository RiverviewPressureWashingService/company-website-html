export default {
  async fetch(request) {
    const url = new URL(request.url);
    return new Response(`reached ${request.method} ${url.pathname}`, {
      headers: { "Content-Type": "text/plain" }
    });
  }
};