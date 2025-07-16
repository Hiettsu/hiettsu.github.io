fetch('kennel-events-alt.json')
  .then(res => res.json())
  .then(data => {
    const tbody = document.getElementById('event-body');
    const searchInput = document.getElementById('search');

    function parseFinnishDate(dateStr) {
      if (!dateStr) return null;

      const rangeMatch = dateStr.match(/(\d{1,2})\.-?(\d{1,2})?\.(\d{1,2})\.(\d{4})/);
      const singleMatch = dateStr.match(/(\d{1,2})\.(\d{1,2})\.(\d{4})/);

      if (rangeMatch) {
        const [, , dayEnd, month, year] = rangeMatch;
        const day = parseInt(dayEnd || rangeMatch[1], 10);
        return new Date(`${year}-${month.padStart(2, '0')}-${day.toString().padStart(2, '0')}`);
      } else if (singleMatch) {
        const [, day, month, year] = singleMatch;
        return new Date(`${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`);
      }

      return null;
    }

    function clean(text) {
      return (text || '').replace(/Ilmoittaudu/gi, '').trim();
    }

    const render = (filtered) => {
      tbody.innerHTML = '';
      const today = new Date();

      filtered.forEach(event => {
        const parsedDate = parseFinnishDate(event.date);
        const isPast = parsedDate && parsedDate < today;

        const tr = document.createElement('tr');
        tr.classList.add(isPast ? 'past-event' : 'future-event', 'animate__animated', 'animate__fadeInUp');

        // Clean fields
        const cleanName = clean(event.fullName || event.name);
        const cleanDeadline = clean(event.deadline);
        const eventDate = parseFinnishDate(event.date);
        const deadlineDate = parseFinnishDate(cleanDeadline);

        // Build deadline cell content
        let deadlineHTML = cleanDeadline || '-';
        if (eventDate && eventDate >= today && deadlineDate) {
          if (deadlineDate < today) {
            deadlineHTML = `<span class="text-danger fw-bold">Ilmoittautuminen suljettu</span>`;
          } else {
            const msDiff = deadlineDate - today;
            const daysLeft = Math.ceil(msDiff / (1000 * 60 * 60 * 24));

            if (daysLeft <= 7) {
              deadlineHTML = `
                ${cleanDeadline}
                <br><span class="badge-warning">1 VIIKKO JÄLJELLÄ</span>
              `;
            } else {
              deadlineHTML = `
                ${cleanDeadline}
                <br><span class="badge-upcoming">Ilmoittautuminen avoinna</span>
              `;
            }
          }
        }

        const isMobile = window.innerWidth <= 768;

if (isMobile) {
  tr.innerHTML = `
    <td colspan="8" class="border-0">
      <div class="d-flex flex-column p-2 border rounded bg-white gap-1">
        <div><strong>Päivämäärä:</strong> ${event.date}</div>
        <div><strong>Nimi:</strong> ${cleanName}${isPast ? ' <span class="badge-past">Mennyt</span>' : ''}</div>
        <div><strong>Tyyppi:</strong> ${event.type || ''}</div>
        <div><strong>Paikka:</strong> ${event.location || event.place || ''}</div>
        <div><strong>Ilmo päättyy:</strong> ${deadlineHTML}</div>
        <div><strong>Tuomari:</strong> ${event.judge || '-'}</div>
        <div><strong>Linkki:</strong> <a href="${event.url}" target="_blank">Avaa</a></div>
        <div><strong>Muistuta:</strong> <input type="checkbox" disabled title="Tuleva ominaisuus – muistutus" /></div>
      </div>
    </td>
  `;
} else {
  tr.innerHTML = `
    <td>${event.date}</td>
    <td>${cleanName}${isPast ? ' <span class="badge-past">Mennyt</span>' : ''}</td>
    <td>${event.type || ''}</td>
    <td>${event.location || event.place || ''}</td>
    <td>${deadlineHTML}</td>
    <td>${event.judge || '-'}</td>
    <td><a href="${event.url}" target="_blank">Avaa</a></td>
    <td><input type="checkbox" disabled title="Tuleva ominaisuus – muistutus" /></td>
  `;
}
        tbody.appendChild(tr);
      });
    };

    render(data);

    searchInput.addEventListener('input', () => {
      const q = searchInput.value.toLowerCase();
      const filtered = data.filter(e =>
        (e.name || '').toLowerCase().includes(q) ||
        (e.fullName || '').toLowerCase().includes(q) ||
        (e.location || e.place || '').toLowerCase().includes(q) ||
        (e.judge || '').toLowerCase().includes(q)
      );
      render(filtered);
    });
  });
