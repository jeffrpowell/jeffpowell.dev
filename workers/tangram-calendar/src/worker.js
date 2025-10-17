export default {
  /*expecting the following pathnames
  
  /hint/
  /hint/[ISO date]
  /solution/
  /solution/[ISO date]

  */
  async fetch(request, env) {
    try {
      if (request.method === "OPTIONS") {
        return await handleOptions(request);
      }
      else if (request.method !== "GET") {
        return new Response("", {status: 404});
      }
      const { hostname, pathname } = new URL(request.url);
      if (pathname.startsWith("/hint")) {
        const date = await getDateString(pathname);
        const cacheKey = `https://${hostname}/hint/${date}`;
        return await getContent(env.KV_HINTS, date, cacheKey);
      }
      else if (pathname.startsWith("/solution")) {
        const date = await getDateString(pathname);
        const cacheKey = `https://${hostname}/solution/${date}`;
        return await getContent(env.KV_SOLUTIONS, date, cacheKey);
      }
      else {
        return new Response("", {status: 404});
      }
    } catch(e) {
      return new Response(e.stack, { status: 500 })
    }
  }
}

async function getContent(kv, date, cacheKey) {
  const cache = caches.default;

  let response = await cache.match(cacheKey);
  if (!response) {
    const value = await kv.get(date);
    if (value === null) {
      return new Response("Haven't loaded a solution for " + date,  { status:  404})
    }
    response = new Response(value);
    //604800s == 7 days
    response.headers.append('Cache-Control', 'max-age=604800');
    response.headers.append('etag', cacheKey);
    response.headers.append("Access-Control-Allow-Origin", "*");
    response.headers.append("Access-Control-Allow-Methods", "GET, OPTIONS");
    // Store the fetched response for cacheKey
    // Use waitUntil so you can return the response without blocking on writing to cache
    await cache.put(cacheKey, response.clone());
  }
  return response;
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

//https://stackoverflow.com/a/69685872
const corsOptionsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET,HEAD,OPTIONS",
  "Access-Control-Max-Age": "86400",
};
async function handleOptions (request) {
  // Make sure the necessary headers are present
  // for this to be a valid pre-flight request
  let headers = request.headers
  if (
    headers.get("Origin") !== null &&
    headers.get("Access-Control-Request-Method") !== null &&
    headers.get("Access-Control-Request-Headers") !== null
  ) {
    // Handle CORS pre-flight request.
    // If you want to check or reject the requested method + headers
    // you can do that here.
    let respHeaders = {
      ...corsOptionsHeaders,
      // Allow all future content Request headers to go back to browser
      // such as Authorization (Bearer) or X-Client-Name-Version
      "Access-Control-Allow-Headers": request.headers.get("Access-Control-Request-Headers"),
    }
    return new Response(null, {
      headers: respHeaders,
    })
  }
  else {
    // Handle standard OPTIONS request.
    // If you want to allow other HTTP Methods, you can do that here.
    return new Response(null, {
      headers: {
        Allow: "GET, HEAD, POST, OPTIONS",
      },
    })
  }
}