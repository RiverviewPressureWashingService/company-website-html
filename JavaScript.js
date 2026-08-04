document.getElementById('contactForm').addEventListener('submit', async (e) => {
  e.preventDefault();

  const form = e.target;
  const payload = {
    firstName: form.firstName.value.trim(),
    lastName: form.lastName.value.trim(),
    phone: form.phone.value.trim(),
    email: form.email.value.trim(),
    service: form.service.value.trim(),
    message: form.message.value.trim()
  };

  const res = await fetch('https://api.riverviewpressurewashingservice.com/contact', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });

  const data = await res.json();
  alert(data.ok ? 'Message sent.' : (data.error || 'Failed.'));
});