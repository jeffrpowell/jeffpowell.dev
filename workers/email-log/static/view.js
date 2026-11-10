const key = new URLSearchParams(window.location.search).get('key');

const subjectEl = document.getElementById('subject');
const messageEl = document.getElementById('message');
const headersEl = document.getElementById('emailHeaders');
const downloadLink = document.getElementById('downloadLink');
const attachmentsSection = document.getElementById('attachmentsSection');
const attachmentList = document.getElementById('attachmentList');
const bodyWrap = document.getElementById('bodyWrap');
const htmlBody = document.getElementById('htmlBody');
const textBody = document.getElementById('textBody');
const remoteBar = document.getElementById('remoteBar');
const loadRemoteBtn = document.getElementById('loadRemoteBtn');

let emailHtml = null;

async function loadEmail() {
  if (!key) {
    showError('No email key was provided.');
    return;
  }

  downloadLink.href = `/api/download?key=${encodeURIComponent(key)}`;
  downloadLink.hidden = false;

  try {
    const response = await fetch(`/api/view?key=${encodeURIComponent(key)}`);
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.error || 'Failed to load email');
    }
    render(data);
  } catch (error) {
    showError(error.message || 'Network error. Please try again.');
  }
}

function render(email) {
  const subject = email.subject || '(no subject)';
  subjectEl.textContent = subject;
  document.title = `${subject} · Email Viewer`;

  addHeader('From', email.from);
  addHeader('To', email.to);
  addHeader('Cc', email.cc);
  addHeader('Reply-To', email.replyTo);
  addHeader('Date', email.date ? formatDate(email.date) : null);
  addHeader('Message-ID', email.messageId);
  addHeader('R2 key', email.key);

  renderAttachments(email.attachments);

  bodyWrap.hidden = false;
  if (email.html) {
    emailHtml = email.html;
    htmlBody.hidden = false;
    htmlBody.addEventListener('load', resizeIframe);
    remoteBar.hidden = !hasRemoteContent(emailHtml);
    loadRemoteBtn.addEventListener('click', () => {
      remoteBar.hidden = true;
      htmlBody.srcdoc = withViewerDefaults(emailHtml, true);
    }, { once: true });
    htmlBody.srcdoc = withViewerDefaults(emailHtml, false);
  } else {
    textBody.hidden = false;
    textBody.textContent = email.text || '(this message has no body)';
  }
}

function addHeader(label, value) {
  const text = Array.isArray(value) ? value.join(', ') : value;
  if (!text) return;
  const dt = document.createElement('dt');
  dt.textContent = label;
  const dd = document.createElement('dd');
  dd.textContent = text;
  headersEl.append(dt, dd);
}

function renderAttachments(attachments) {
  // Inline images referenced from the HTML are already embedded in the body.
  const listed = (attachments || []).filter((att) => !att.inline);
  if (listed.length === 0) return;

  attachmentsSection.hidden = false;
  for (const att of listed) {
    const li = document.createElement('li');
    const link = document.createElement('a');
    link.className = 'download-link';
    link.href = `/api/attachment?key=${encodeURIComponent(key)}&index=${att.index}`;
    link.textContent = `📎 ${att.filename}`;
    const meta = document.createElement('span');
    meta.className = 'attachment-meta';
    meta.textContent = ` ${att.mimeType}${att.size != null ? ` · ${formatSize(att.size)}` : ''}`;
    li.append(link, meta);
    attachmentList.appendChild(li);
  }
}

// Content-Security-Policy for the email document. Inline styles and data: URIs
// (including inlined cid: images) always work; remote images, stylesheets and fonts
// are blocked until the user opts in, so opening an email doesn't trigger tracking
// pixels. Scripts are already blocked by the iframe sandbox.
const CSP_BLOCKED = "default-src 'none'; img-src data:; style-src 'unsafe-inline'; font-src data:";
const CSP_REMOTE = "default-src 'none'; img-src data: http: https:; style-src 'unsafe-inline' http: https:; font-src data: http: https:";

// Inject viewer defaults ahead of all of the email's own markup:
// - the CSP above (it must come before anything it governs)
// - no Referer on image loads or link clicks, so neither this viewer's hostname
//   nor its URL leaks to senders or linked sites
// - links open in a new tab instead of navigating the iframe
// - a sans-serif base font; it comes before the email's own styles, so emails that
//   set their own font still win.
// They are inserted right after the doctype (or at the very start), where the HTML
// parser always places <meta>/<base>/<style> into <head>. Matching the email's own
// <head> tag instead is fragile (e.g. a regex can match <header>), and a CSP <meta>
// that ends up in <body> is ignored.
function withViewerDefaults(html, allowRemote) {
  const defaults =
    `<meta http-equiv="Content-Security-Policy" content="${allowRemote ? CSP_REMOTE : CSP_BLOCKED}">` +
    '<meta name="referrer" content="no-referrer">' +
    '<base target="_blank">' +
    '<style>body { font-family: -apple-system, BlinkMacSystemFont, \'Segoe UI\', Roboto, Helvetica, Arial, sans-serif; }</style>';
  const doctype = html.match(/^\s*(?:<!--[\s\S]*?-->\s*)*<!doctype[^>]*>/i);
  const at = doctype ? doctype[0].length : 0;
  return html.slice(0, at) + defaults + html.slice(at);
}

// Best-effort check for anything the blocking CSP would stop, so the
// "Load remote images" bar only shows when it would make a difference.
function hasRemoteContent(html) {
  return /\b(?:src|srcset|background|poster)\s*=\s*["']?\s*(?:https?:)?\/\//i.test(html) ||
    /url\(\s*["']?\s*(?:https?:)?\/\//i.test(html) ||
    /@import/i.test(html) ||
    /<link\b[^>]*\bhref\s*=\s*["']?\s*(?:https?:)?\/\//i.test(html);
}

function resizeIframe() {
  const doc = htmlBody.contentDocument;
  if (!doc) return;
  htmlBody.style.height = `${doc.documentElement.scrollHeight + 20}px`;
  // Late-loading images change the height after the initial load event.
  for (const img of doc.images) {
    if (!img.complete) img.addEventListener('load', resizeIframe, { once: true });
  }
}

function showError(text) {
  subjectEl.textContent = 'Unable to display email';
  messageEl.textContent = text;
  messageEl.classList.add('show', 'error');
}

function formatDate(value) {
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? value : d.toLocaleString();
}

function formatSize(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

loadEmail();
