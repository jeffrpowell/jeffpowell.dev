const form = document.getElementById('filterForm');
const messageEl = document.getElementById('message');
const statusLine = document.getElementById('status-line');
const emailBody = document.getElementById('emailBody');
const refreshBtn = document.getElementById('refreshBtn');

form.addEventListener('submit', (e) => {
  e.preventDefault();
  loadEmails();
});

async function loadEmails() {
  const params = new URLSearchParams();
  const sender = document.getElementById('sender').value.trim();
  const recipient = document.getElementById('recipient').value.trim();
  const status = document.getElementById('status').value;
  const limit = document.getElementById('limit').value;

  if (sender) params.set('sender', sender);
  if (recipient) params.set('recipient', recipient);
  if (status) params.set('status', status);
  if (limit) params.set('limit', limit);

  refreshBtn.disabled = true;
  refreshBtn.textContent = 'Loading…';
  messageEl.classList.remove('show', 'error');
  emailBody.innerHTML = '<tr><td colspan="6" class="empty">Loading…</td></tr>';

  try {
    const response = await fetch(`/api/emails?${params.toString()}`);
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Failed to load emails');
    }

    renderEmails(data.emails, data.empty);
    statusLine.textContent = data.empty
      ? 'No email events have been logged yet.'
      : `Showing ${data.count} event${data.count === 1 ? '' : 's'} (limit ${data.limit}).`;
  } catch (error) {
    emailBody.innerHTML = '<tr><td colspan="6" class="empty">No data.</td></tr>';
    statusLine.textContent = '';
    messageEl.textContent = error.message || 'Network error. Please try again.';
    messageEl.classList.add('show', 'error');
  } finally {
    refreshBtn.disabled = false;
    refreshBtn.textContent = 'Refresh';
  }
}

function renderEmails(emails, empty) {
  if (!emails || emails.length === 0) {
    const msg = empty ? 'No emails have been logged yet.' : 'No matching emails.';
    emailBody.innerHTML = `<tr><td colspan="6" class="empty">${msg}</td></tr>`;
    return;
  }

  emailBody.innerHTML = '';
  for (const email of emails) {
    const tr = document.createElement('tr');
    tr.appendChild(textCell(formatTime(email.eventTime)));
    tr.appendChild(textCell(email.sender || '—'));
    tr.appendChild(textCell(email.recipient || '—'));
    tr.appendChild(textCell(email.destination || '—'));
    tr.appendChild(statusCell(email.status));
    tr.appendChild(downloadCell(email.key));
    emailBody.appendChild(tr);
  }
}

function textCell(text) {
  const td = document.createElement('td');
  td.textContent = text;
  return td;
}

function statusCell(status) {
  const td = document.createElement('td');
  const span = document.createElement('span');
  span.className = `badge ${status === 'RETRY' ? 'badge-retry' : 'badge-first'}`;
  span.textContent = status || '—';
  td.appendChild(span);
  return td;
}

function downloadCell(key) {
  const td = document.createElement('td');
  if (!key) {
    td.textContent = '—';
    return td;
  }
  const link = document.createElement('a');
  link.className = 'download-link';
  link.href = `/api/download?key=${encodeURIComponent(key)}`;
  link.textContent = '⬇ .eml';
  link.title = key;
  td.appendChild(link);
  return td;
}

function formatTime(eventTimeMs) {
  if (!eventTimeMs || Number.isNaN(eventTimeMs)) return '—';
  return new Date(eventTimeMs).toLocaleString();
}

loadEmails();
