const ALLOW_LIST = [
    'aoc.jpg',
    'backup.jpg',
    'commandPrompt.png',
    'pdf.png',
    'repo_website.jpg',
    'JeffPowell_CliftonStrengths.pdf',
    'JeffPowell_DiSC.pdf',
    'JeffPowell_RHETI.pdf',
    'JeffPowell_SocialStyles.pdf',
    'JeffPowell_StrengthsProfile.pdf',
    'JeffPowell_CliftonStrengths.pdf',
    'JeffPowell_MTDISC.pdf',
    'ListawayWordmarkLight.png'
];

async function handleRequest(request, env, ctx) {
    const url = new URL(request.url);
    const path = url.pathname.slice(1);
    console.log(path);
    
    if (!ALLOW_LIST.includes(path)) {
        return new Response("Not Found", { status: 404 });
    }

    const cacheKey = `https://${url.hostname}${path}`;
    const cache = caches.default;
    let response = await cache.match(cacheKey);
    
    if (!response) {
        console.log(
            `${request.url} not present in cache (cacheKey: ${cacheKey})`
        );
        const object = await env.JEFFPOWELL_DEV_ASSETS.get(path);
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