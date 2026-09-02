// EM Tinting — allow same-day website bookings while hiding past time slots.
(() => {
  const form = document.getElementById('bookingForm');
  const dateEl = form?.elements?.appointment_date;
  const timeEl = document.getElementById('appointmentTime');
  const statusEl = document.getElementById('bookingStatus');
  if (!form || !dateEl || !timeEl) return;

  const zone = 'America/Chicago';
  const zonedParts = (date = new Date()) => {
    const parts = new Intl.DateTimeFormat('en-US', {
      timeZone: zone,
      year: 'numeric', month: '2-digit', day: '2-digit',
      hour: '2-digit', minute: '2-digit', hour12: false
    }).formatToParts(date).reduce((acc, p) => (acc[p.type] = p.value, acc), {});
    return {
      date: `${parts.year}-${parts.month}-${parts.day}`,
      hour: Number(parts.hour),
      minute: Number(parts.minute)
    };
  };

  const today = zonedParts();
  dateEl.min = today.date;

  function fillSameDayTimes() {
    timeEl.innerHTML = '<option value="">Choose appointment time</option>';
    if (!dateEl.value) return;

    const selected = new Date(`${dateEl.value}T12:00:00`);
    const day = selected.getDay();
    if (day === 0) {
      if (statusEl) statusEl.textContent = 'We are closed on Sundays. Please choose another date.';
      dateEl.value = '';
      return;
    }

    if (statusEl) statusEl.textContent = '';
    const endHour = day === 6 ? 14 : 18;
    let startHour = 10;

    const now = zonedParts();
    if (dateEl.value === now.date) {
      startHour = Math.max(10, now.hour + (now.minute > 0 ? 1 : 0));
      if (startHour > endHour) {
        if (statusEl) statusEl.textContent = 'There are no appointment times left today. Please choose another date.';
        return;
      }
    }

    for (let h = startHour; h <= endHour; h++) {
      const value = `${String(h).padStart(2, '0')}:00`;
      const label = new Date(`2000-01-01T${value}:00`).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
      timeEl.insertAdjacentHTML('beforeend', `<option value="${value}">${label}</option>`);
    }
  }

  dateEl.addEventListener('change', () => setTimeout(fillSameDayTimes, 0));
  fillSameDayTimes();
})();
