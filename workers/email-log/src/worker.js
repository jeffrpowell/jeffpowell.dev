import PostalMime, { decodeWords } from 'postal-mime';

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const path = url.pathname;

    if (path === '/api/emails' && request.method === 'GET') {
      return handleListEmails(url, env);
    }

    if (path === '/api/download' && request.method === 'GET') {
      return handleDownload(url, env);
    }

    if (path === '/api/view' && request.method === 'GET') {
      return handleView(url, env);
    }

    if (path === '/api/attachment' && request.method === 'GET') {
      return handleAttachment(url, env);
    }

    // Everything else is served by the static SPA assets.
    return env.ASSETS.fetch(request);
  }
};

/**
 * Query the Analytics Engine SQL API for the events email-triage logged.
 *
 * email-triage writes each event as:
 *   blobs:   [key, to, from, destination, status, outcome, error, subject]
 *            status  = "FIRST" | "RETRY"
 *            outcome = "FORWARDED" | "REJECTED" | "FAILED" (empty on rows logged before this field existed)
 *            error   = error message when outcome is "FAILED", else empty
 *            subject = raw Subject header, RFC 2047 encoded-words intact (empty on older rows)
 *   doubles: [Date.now()]
 * Analytics Engine also stamps an automatic `timestamp` column at ingestion.
 */
async function handleListEmails(url, env) {
  const accountId = env.CF_ACCOUNT_ID;
  const apiToken = env.CF_API_TOKEN;
  const dataset = env.ANALYTICS_DATASET || 'email_events';

  if (!accountId || !apiToken) {
    return jsonResponse(
      { error: 'Worker is missing CF_ACCOUNT_ID / CF_API_TOKEN configuration.' },
      500
    );
  }

  // Optional filters / pagination from the query string.
  const limit = clampInt(url.searchParams.get('limit'), 100, 1, 1000);
  const sender = (url.searchParams.get('sender') || '').trim();
  const recipient = (url.searchParams.get('recipient') || '').trim();
  const status = (url.searchParams.get('status') || '').trim().toUpperCase();

  // Filter on double1, the ms epoch email-triage writes via Date.now().
  const windowStartMs = Date.now() - 90 * 24 * 60 * 60 * 1000; // match your retention window
  const where = [`double1 > ${windowStartMs}`];
  if (sender) where.push(`blob3 LIKE '%${escapeSql(sender)}%'`);
  if (recipient) where.push(`blob2 LIKE '%${escapeSql(recipient)}%'`);
  if (status === 'FIRST' || status === 'RETRY') {
    where.push(`blob5 = '${escapeSql(status)}'`);
  }
  const whereClause = `WHERE ${where.join(' AND ')}`;

  // ORDER BY must use the alias (event_time_ms), not double1: once a column is
  // aliased in SELECT, the SQL API can't resolve its original name in ORDER BY
  // and returns 422 "unable to find type of column", which the handler below
  // would swallow as an empty result. (WHERE can still use the raw name.)
  const sql = `
    SELECT
      blob1 AS r2_key,
      blob2 AS recipient,
      blob3 AS sender,
      blob4 AS destination,
      blob5 AS status,
      blob8 AS subject,
      double1 AS event_time_ms
    FROM ${dataset}
    ${whereClause}
    ORDER BY event_time_ms DESC
    LIMIT ${limit}
  `.trim();

  let result;
  try {
    const resp = await fetch(
      `https://api.cloudflare.com/client/v4/accounts/${accountId}/analytics_engine/sql`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${apiToken}`,
          'Content-Type': 'text/plain'
        },
        body: sql
      }
    );

    if (!resp.ok) {
      const detail = (await resp.text()).trim();

      // Surface every failure, including 422 "unable to find type of column",
      // which is usually a query bug (e.g. ORDER BY an aliased column's raw name),
      // not an empty dataset. Swallowing it previously hid such bugs as "0 emails".
      console.error('Analytics Engine query failed:', resp.status, detail);
      return jsonResponse(
        { error: `Analytics Engine query failed (${resp.status}): ${detail.slice(0, 300)}` },
        502
      );
    }

    result = await resp.json();
  } catch (error) {
    console.error('Analytics Engine request error:', error);
    return jsonResponse({ error: 'Failed to reach Analytics Engine.' }, 502);
  }

  const emails = (result.data || []).map((row) => ({
    key: row.r2_key,
    recipient: row.recipient,
    sender: row.sender,
    destination: row.destination,
    status: row.status,
    subject: decodeSubject(row.subject),
    // double1 carries the millisecond timestamp captured by email-triage.
    eventTime: row.event_time_ms ? Number(row.event_time_ms) : null
  }));

  return jsonResponse({ count: emails.length, limit, emails });
}

/**
 * Stream the raw .eml stored in R2 back to the caller as a download.
 * The R2 object key is the `key` column surfaced by /api/emails.
 */
async function handleDownload(url, env) {
  const { key, object, errorResponse } = await getEmailObject(url, env);
  if (errorResponse) return errorResponse;

  const headers = new Headers();
  object.writeHttpMetadata(headers);
  headers.set('Content-Type', object.httpMetadata?.contentType || 'message/rfc822');
  headers.set('etag', object.httpEtag);
  // Offer the file as a download with a friendly, flattened filename.
  const filename = key.split('/').pop();
  headers.set('Content-Disposition', `attachment; filename="${filename}"`);

  return new Response(object.body, { headers });
}

/**
 * Parse the archived .eml and return the parts the browser viewer renders:
 * address headers, subject/date, the HTML and/or text body, and attachment metadata.
 * Inline images referenced from the HTML via `cid:` are embedded as data: URIs so
 * the sandboxed viewer iframe can show them without calling back into this worker.
 */
async function handleView(url, env) {
  const { key, object, errorResponse } = await getEmailObject(url, env);
  if (errorResponse) return errorResponse;

  let email;
  try {
    email = await PostalMime.parse(await object.arrayBuffer(), { attachmentEncoding: 'base64' });
  } catch (error) {
    console.error('Failed to parse email', key, error);
    return jsonResponse({ error: 'Failed to parse email content.' }, 422);
  }

  const cidMap = new Map();
  for (const att of email.attachments) {
    if (att.contentId) {
      cidMap.set(stripAngleBrackets(att.contentId).toLowerCase(), `data:${att.mimeType};base64,${att.content}`);
    }
  }

  let html = email.html || null;
  if (html && cidMap.size > 0) {
    html = html.replace(/cid:([^"'\s)>]+)/gi, (match, cid) => {
      let id = cid;
      try { id = decodeURIComponent(cid); } catch { /* keep raw */ }
      return cidMap.get(id.toLowerCase()) || match;
    });
  }

  return jsonResponse({
    key,
    subject: email.subject || '',
    date: email.date || null,
    messageId: email.messageId || null,
    from: formatAddresses(email.from ? [email.from] : []),
    to: formatAddresses(email.to),
    cc: formatAddresses(email.cc),
    replyTo: formatAddresses(email.replyTo),
    html,
    text: email.text || null,
    attachments: email.attachments.map((att, index) => ({
      index,
      filename: att.filename || `attachment-${index + 1}`,
      mimeType: att.mimeType,
      size: base64DecodedSize(att.content),
      inline: Boolean(att.related)
    }))
  });
}

/**
 * Stream a single attachment out of the archived .eml, selected by its index in the
 * parsed attachment list returned by /api/view. Always served as a download (never
 * rendered inline) so an attached HTML/SVG file can't execute on this origin.
 */
async function handleAttachment(url, env) {
  const index = parseInt(url.searchParams.get('index'), 10);
  if (Number.isNaN(index) || index < 0) {
    return jsonResponse({ error: 'Missing or invalid "index" query parameter.' }, 400);
  }

  const { key, object, errorResponse } = await getEmailObject(url, env);
  if (errorResponse) return errorResponse;

  let email;
  try {
    email = await PostalMime.parse(await object.arrayBuffer());
  } catch (error) {
    console.error('Failed to parse email', key, error);
    return jsonResponse({ error: 'Failed to parse email content.' }, 422);
  }

  const att = email.attachments[index];
  if (!att) {
    return jsonResponse({ error: 'Attachment not found.' }, 404);
  }

  const filename = att.filename || `attachment-${index + 1}`;
  // ASCII-only fallback for old clients plus RFC 5987 filename* for the real name.
  const asciiName = filename.replace(/[^\x20-\x7E]|["\\]/g, '_');
  return new Response(att.content, {
    headers: {
      'Content-Type': att.mimeType || 'application/octet-stream',
      'Content-Disposition': `attachment; filename="${asciiName}"; filename*=UTF-8''${encodeURIComponent(filename)}`,
      'X-Content-Type-Options': 'nosniff'
    }
  });
}

/**
 * Validate the `key` query param and fetch the matching object from R2.
 * Returns { key, object } on success or { errorResponse } on failure.
 */
async function getEmailObject(url, env) {
  const key = url.searchParams.get('key');

  if (!key) {
    return { errorResponse: jsonResponse({ error: 'Missing required "key" query parameter.' }, 400) };
  }

  // email-triage keys are "YYYY-MM-DD/sanitized-from/<hash>.eml". Reject anything
  // that tries to escape that shape so the endpoint can only read archived mail.
  if (key.includes('..') || !/^[A-Za-z0-9._\-\/@]+\.eml$/.test(key)) {
    return { errorResponse: jsonResponse({ error: 'Invalid object key.' }, 400) };
  }

  const object = await env.R2_BUCKET.get(key);
  if (object === null) {
    return { errorResponse: jsonResponse({ error: 'Email content not found in R2.' }, 404) };
  }

  return { key, object };
}

// Flatten postal-mime address objects (including RFC 5322 groups) into display strings.
function formatAddresses(list) {
  if (!list) return [];
  return list.flatMap((addr) => (addr.group ? addr.group : [addr])).map((addr) =>
    addr.name ? `${addr.name} <${addr.address}>` : addr.address
  );
}

// Decode RFC 2047 encoded-words (e.g. "=?UTF-8?B?...?=") in the stored raw Subject header.
function decodeSubject(raw) {
  if (!raw) return '';
  try {
    return decodeWords(raw);
  } catch {
    return raw;
  }
}

function stripAngleBrackets(value) {
  return value.trim().replace(/^<|>$/g, '');
}

function base64DecodedSize(b64) {
  if (typeof b64 !== 'string') return null;
  const padding = b64.endsWith('==') ? 2 : b64.endsWith('=') ? 1 : 0;
  return Math.floor((b64.length * 3) / 4) - padding;
}

function clampInt(raw, fallback, min, max) {
  const n = parseInt(raw, 10);
  if (Number.isNaN(n)) return fallback;
  return Math.min(max, Math.max(min, n));
}

// Escape single quotes for safe interpolation into the Analytics Engine SQL string.
function escapeSql(value) {
  return value.replace(/'/g, "''");
}

function jsonResponse(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' }
  });
}
