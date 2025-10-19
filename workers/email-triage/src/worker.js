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

    // Generate deduplication key from email headers
    const dedupKey = await generateEmailFingerprint(message);
    
    // Check if we've already processed this email
    const isDuplicate = await env.KV_DEDUP.get(dedupKey);

    // Create prefix structure: date/from-address/dedup-key
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const datePrefix = `${year}-${month}-${day}`;
    
    // Sanitize the 'from' address to be path-safe
    const fromSanitized = from.replace(/[^a-zA-Z0-9._\-]/g, '_');
    const key = `${datePrefix}/${fromSanitized}/${dedupKey}.eml`;

    // Log to Analytics Engine
    await env.ANALYTICS_EMAIL.writeDataPoint({
      blobs: [key, to, from, destination, isDuplicate ? "RETRY" : "FIRST"],
      doubles: [Date.now()]
    });

    // Mark as processed in KV with TTL to prevent memory bloat (only on first attempt)
    // 2-week TTL
    if (!isDuplicate) {
      await env.KV_DEDUP.put(dedupKey, key, { expirationTtl: 1209600 });
    }

    // Forward or reject
    if (destination === "DROP") {
      console.log({ result: "DROP", to });
      await message.setReject(`${to} is not allowed`);
    } else {
      // Store raw email in R2 only on first attempt
      if (!isDuplicate) {
        const rawEmailStream = message.raw;
        const rawEmailBuffer = await streamToArrayBuffer(rawEmailStream);
        
        await env.R2_BUCKET.put(key, rawEmailBuffer, {
          httpMetadata: { contentType: "message/rfc822" }
        });
      }
      console.log({ result: "FORWARD", to: to, target: destination, duplicate: isDuplicate });
      await message.forward(destination);
    }
  },

  // Scheduled trigger for health checks only
  async scheduled(event, env, ctx) {
    ctx.waitUntil(healthCheck(env));
  }
};

// Generate a fingerprint from email headers to identify duplicates
async function generateEmailFingerprint(message) {
  // Extract key headers that uniquely identify an email
  const messageId = message.headers.get("Message-ID") || "";
  const from = message.from || "";
  const to = message.to || "";
  const subject = message.headers.get("Subject") || "";
  const date = message.headers.get("Date") || "";
  
  // Combine headers to create fingerprint
  const fingerprinterSource = `${messageId}|${from}|${to}|${subject}|${date}`;
  
  // Use SubtleCrypto to hash the combined string
  const encoder = new TextEncoder();
  const data = encoder.encode(fingerprinterSource);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  
  // Convert to hex string
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  
  return hashHex;
}

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