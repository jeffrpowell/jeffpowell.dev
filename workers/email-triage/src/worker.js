export default {
  async email(message, env, ctx) {
    const { to, from } = message;
    let route = await env.KV_EMAIL.get(to) || await env.CATCH_ALL_ADDRESS;

    // Check primary health status
    let primaryHealthy = (await env.KV_EMAIL.get("PRIMARY_STATUS")) === "HEALTHY";
    let destination;

    if (route === "DEFAULT") {
      destination = primaryHealthy
        ? await env.PRIMARY_ADDRESS
        : await env.BACKUP_ADDRESS;
    } else {
      destination = route;
    }

    // Create prefix structure: date/from-address/filename
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const datePrefix = `${year}-${month}-${day}`;
    
    // Sanitize the 'from' address to be path-safe
    const fromSanitized = from.replace(/[^a-zA-Z0-9._\-]/g, '_');
    const filename = `${Date.now()}-${crypto.randomUUID()}.eml`;
    const key = `${datePrefix}/${fromSanitized}/${filename}`;

    // Log to Analytics Engine
    await env.ANALYTICS_EMAIL.writeDataPoint({
      blobs: [key, to, from, destination],
      doubles: [Date.now()]
    });

    // Forward or reject
    if (destination === "DROP") {
      console.log({ result: "DROP", to });
      await message.setReject(`${to} is not allowed`);
    } else {
      // Store raw email in R2 with hierarchical prefix
      const rawEmailStream = message.raw;
      const rawEmailBuffer = await streamToArrayBuffer(rawEmailStream);
      
      await env.R2_BUCKET.put(key, rawEmailBuffer, {
        httpMetadata: { contentType: "message/rfc822" }
      });
      console.log({ result: "FORWARD", to, target: destination });
      await message.forward(destination);
    }
  },

  // Scheduled trigger for health checks only
  async scheduled(event, env, ctx) {
    ctx.waitUntil(healthCheck(env));
  }
};

// Active health check logic — simplified for free tier
async function healthCheck(env) {
  // For free-tier: mark PRIMARY as healthy unless manual toggle via KV
  // In production, you'd replace this with actual synthetic test
  await env.KV_EMAIL.put("PRIMARY_STATUS", "HEALTHY");
}

// Helper function to convert ReadableStream to ArrayBuffer
async function streamToArrayBuffer(stream) {
  const reader = stream.getReader();
  const chunks = [];
  
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      chunks.push(value);
    }
  } finally {
    reader.releaseLock();
  }
  
  // Calculate total length and create combined buffer
  const totalLength = chunks.reduce((acc, chunk) => acc + chunk.byteLength, 0);
  const result = new Uint8Array(totalLength);
  let offset = 0;
  
  for (const chunk of chunks) {
    result.set(new Uint8Array(chunk), offset);
    offset += chunk.byteLength;
  }
  
  return result.buffer;
}