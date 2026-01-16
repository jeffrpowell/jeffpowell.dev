const form = document.getElementById('registerForm');
const messageEl = document.getElementById('message');
const submitBtn = document.getElementById('submitBtn');
const prefixInput = document.getElementById('prefix');

prefixInput.addEventListener('input', (e) => {
  e.target.value = e.target.value.toLowerCase();
});

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  
  const prefix = document.getElementById('prefix').value.trim().toLowerCase().replace('@jeffpowell.dev', '');
  const target = document.getElementById('target').value.trim();
  
  submitBtn.disabled = true;
  submitBtn.textContent = 'Registering...';
  messageEl.classList.remove('show', 'success', 'error');
  
  try {
    const response = await fetch('/api/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ prefix, target })
    });
    
    const data = await response.json();
    
    if (response.ok) {
      messageEl.textContent = data.message;
      messageEl.classList.add('show', 'success');
      form.reset();
      document.getElementById('target').value = 'DEFAULT';
    } else {
      messageEl.textContent = data.error || 'Registration failed';
      messageEl.classList.add('show', 'error');
    }
  } catch (error) {
    messageEl.textContent = 'Network error. Please try again.';
    messageEl.classList.add('show', 'error');
  } finally {
    submitBtn.disabled = false;
    submitBtn.textContent = 'Register Alias';
  }
});
