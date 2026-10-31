/* Use the existing event typography and rows for imported show dates. */
(() => {
  const schedule = document.querySelector('#events .events-scroll');
  if (!schedule) return;
  const normalize = value => value.normalize('NFKD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9]/g, '');
  const dateKey = (year, month, day) => `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
  // Keep today's shows through the end of the day in the band's timezone.
  const today = () => {
    const parts = new Intl.DateTimeFormat('en-US', {
      timeZone: 'America/New_York', year: 'numeric', month: '2-digit', day: '2-digit'
    }).formatToParts(new Date());
    const value = type => parts.find(part => part.type === type).value;
    return `${value('year')}-${value('month')}-${value('day')}`;
  };
  const months = new Map();
  const rows = new Map();
  schedule.querySelectorAll('.schedule-month').forEach(month => {
    const heading = month.querySelector('.schedule-month-title').textContent.trim();
    const parsed = new Date(`${heading.split(' ')[0]} 1, ${heading.split(' ').pop()}`);
    const key = dateKey(parsed.getFullYear(), parsed.getMonth() + 1, 1).slice(0, 7);
    months.set(key, month);
    month.querySelectorAll('.event').forEach(row => {
      const day = row.querySelector('.date strong').textContent.trim();
      row.dataset.date = `${key}-${day.padStart(2, '0')}`;
      rows.set(`${row.dataset.date}|${normalize(row.querySelector('.venue h3').textContent)}`, row);
    });
  });
  const removePastShows = () => {
    const cutoff = today();
    for (const [key, row] of rows) {
      if (row.dataset.date < cutoff) { row.remove(); rows.delete(key); }
    }
    for (const [key, month] of months) {
      if (!month.querySelector('.event')) { month.remove(); months.delete(key); }
    }
  };
  // This runs even when the external schedule is empty, invalid, or offline.
  removePastShows();
  setInterval(removePastShows, 60000);
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') removePastShows();
  });
  const make = (tag, className, text) => {
    const el = document.createElement(tag);
    el.className = className;
    if (text !== undefined) el.textContent = text;
    return el;
  };
  fetch('space-coast-dates.json', {cache: 'no-store'})
    .then(response => { if (!response.ok) throw new Error('Schedule unavailable'); return response.json(); })
    .then(data => {
      if (!Array.isArray(data.events) || data.events.some(event =>
        !/^\d{4}-\d{2}-\d{2}$/.test(event.date) || typeof event.venue !== 'string' || !event.venue.trim() || typeof event.time !== 'string' || !event.time.trim())) {
        throw new Error('Invalid schedule');
      }
      data.events.forEach(event => {
        if (event.date < today()) return;
        const date = new Date(`${event.date}T12:00:00`);
        const key = event.date.slice(0, 7);
        const existing = rows.get(`${event.date}|${normalize(event.venue)}`);
        // Confirmed manual times and private-event notes take precedence.
        if (existing) return;
        if (!months.has(key)) {
          const month = make('div', 'schedule-month');
          month.append(make('h3', 'schedule-month-title', date.toLocaleDateString('en-US', {month: 'long', year: 'numeric'})), make('div', 'event-list'));
          months.set(key, month);
        }
        const row = make('article', 'event');
        row.dataset.date = event.date;
        const badge = make('div', 'date');
        badge.append(make('span', '', date.toLocaleDateString('en-US', {month: 'short'}).toUpperCase()), make('strong', '', event.date.slice(8)));
        const venue = make('div', 'venue');
        venue.append(make('h3', '', event.venue), make('p', '', date.toLocaleDateString('en-US', {weekday: 'long'})));
        row.append(badge, venue, make('p', 'time', event.time), make('span', 'event-note', event.description || ''));
        months.get(key).querySelector('.event-list').append(row);
        rows.set(`${event.date}|${normalize(event.venue)}`, row);
      });
      const footer = schedule.querySelector('.schedule-note');
      [...months.entries()].sort(([a], [b]) => a.localeCompare(b)).forEach(([, month]) => {
        const list = month.querySelector('.event-list');
        [...list.querySelectorAll('.event')].sort((a, b) => a.dataset.date.localeCompare(b.dataset.date)).forEach(row => list.append(row));
        schedule.insertBefore(month, footer);
      });
      removePastShows();
    })
    .catch(() => { /* Preserve the site's existing dates when an update is unavailable. */ });
})();
