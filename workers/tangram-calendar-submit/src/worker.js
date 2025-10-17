export default {
  async fetch(request, env) {
    console.log(request);
    if (request.method !== "POST") {
      return new Response("", {status: 404});
    }
    try {
      const { pathname } = new URL(request.url);
      if (pathname.startsWith("/hint")) {
        const date = await getDateString(pathname);
        await env.KV_HINTS.put(date, request.body);
        return new Response();
      }
      else if (pathname.startsWith("/solution")) {
        const date = await getDateString(pathname);
        await env.KV_SOLUTIONS.put(date, request.body);
        return new Response();
      }
      else {
        return new Response("", {status: 404});
      }
    } catch(e) {
      return new Response(e.stack, { status: 500 })
    }
  }
}

async function getDateString(fullPath) {
  let date = new Date();
  const pathTokens = fullPath.split("/");
  if (pathTokens.length > 2) {
    const dateCandidate = new Date(pathTokens[2]);
    if (await isValidDate(dateCandidate)) {
      date = dateCandidate;
    }
  }
  return date.toISOString().substring(0, 10);
}

async function isValidDate(d) {
  return d instanceof Date && !isNaN(d);
}