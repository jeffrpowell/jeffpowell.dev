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
    htmlBody.hidden = false;
    htmlBody.addEventListener('load', resizeIframe);
    htmlBody.srcdoc = withViewerDefaults(email.html);
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

// Inject viewer defaults at the very top of the email's <head>:
// - links open in a new tab instead of navigating the iframe
// - a sans-serif base font; it comes before the email's own styles, so emails that
//   set their own font still win.
function withViewerDefaults(html) {
  const base = '<base target="_blank">' +
    '<style>body { font-family: -apple-system, BlinkMacSystemFont, \'Segoe UI\', Roboto, Helvetica, Arial, sans-serif; }</style>';
  const headMatch = html.match(/<head[^>]*>/i);
  if (headMatch) {
    const at = headMatch.index + headMatch[0].length;
    return html.slice(0, at) + base + html.slice(at);
  }
  return base + html;
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
