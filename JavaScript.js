document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("contactForm");

  if (!form) return;

  form.addEventListener("submit", async (event) => {
    event.preventDefault();

    const button = form.querySelector('button[type="submit"]');

    const payload = {
      firstName: form.firstName.value.trim(),
      lastName: form.lastName.value.trim(),
      phone: form.phone.value.trim(),
      email: form.email.value.trim(),
      service: form.service.value.trim(),
      message: form.message.value.trim()
    };

    button.disabled = true;
    button.textContent = "Sending...";

    try {
      const response = await fetch(
        "https://api.riverviewpressurewashingservice.com/contact",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify(payload)
        }
      );

      const data = await response.json().catch(() => ({}));

      if (!response.ok || !data.ok) {
        throw new Error(data.error || "Failed to send message.");
      }

      alert("Message sent. We will get back to you soon.");
      form.reset();
    } catch (error) {
      console.error("Contact form submission failed:", error);
      alert(error.message || "Failed to send message.");
    } finally {
      button.disabled = false;
      button.textContent = "Send Message";
    }
  });
});