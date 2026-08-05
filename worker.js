export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    return new Response(
      JSON.stringify({
        method: request.method,
        pathname: url.pathname,
        host: url.host
      }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Headers": "Content-Type",
          "Access-Control-Allow-Methods": "POST, OPTIONS"
        }
      }
    );
  }
};