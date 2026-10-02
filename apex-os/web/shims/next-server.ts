export const NextResponse = {
  json: (data: unknown, init?: ResponseInit) => new Response(JSON.stringify(data), { ...init, headers: { "content-type": "application/json" } }),
};
