interface Env {
    JEFFPOWELL_DEV_ASSETS: R2Bucket;
}

async function handleRequest(
    request: Request,
    env: Env,
    ctx: ExecutionContext
): Promise<Response> {
    const url = new URL(request.url);
    const path = url.pathname.slice(1);
    console.log(path);
    
    // Only handle /assets/* requests
    if (!path.startsWith('assets/')) {
        return new Response("Not Found", { status: 404 });
    }
    
    // Extract filename from /assets/[filename]
    const filename = path.slice('assets/'.length);

    const cacheKey = `https://${url.hostname}${url.pathname}`;
    const cache = (caches as any).default as Cache;
    let response = await cache.match(cacheKey);
    
    if (!response) {
        console.log(
            `${request.url} not present in cache (cacheKey: ${cacheKey})`
        );
        // Use filename (not path) when fetching from R2
        const object = await env.JEFFPOWELL_DEV_ASSETS.get(filename);
        if (!object) {
            return new Response("Not Found", { status: 404 });
        }
        response = new Response(object.body);
        //604800s == 7 days
        response.headers.append('Cache-Control', 'max-age=604800');
        response.headers.append('etag', object.httpEtag)
        // Store the fetched response for cacheKey
        // Use waitUntil so you can return the response without blocking on writing to cache
        ctx.waitUntil(cache.put(cacheKey, response.clone()));
    } else {
        console.log(`Cache hit for: ${request.url} (cacheKey: ${cacheKey}).`);
    }
    return response;
}

export default {
    fetch: handleRequest
};
