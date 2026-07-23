/* =========================================================
   CRAFT — Renders leadership cards from js/data.js and drives
   the "01 / Club Agenda" process-line scroll progress.
   Loaded AFTER data.js and BEFORE main.js so the cards exist
   in the DOM before main.js wires up .reveal / stagger / etc.
========================================================= */
/* =========================================================
   CRAFT — Renders leadership, events, projects, radar,
   announcements, gallery, and testimonials from js/data.js.
   Loaded AFTER data.js and BEFORE main.js.

   IMPORTANT: main.js's scroll-reveal observer only scans the
   DOM once, at load. Anything this file injects afterward
   needs its OWN reveal handling — hence observeReveals() below,
   used everywhere this file adds new .reveal elements.
========================================================= */
const CRAFT_reveal_io = ("IntersectionObserver" in window)
  ? new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          CRAFT_reveal_io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15 })
  : null;

function observeReveals(root) {
  const els = root.querySelectorAll(".reveal");
  if (!CRAFT_reveal_io) { els.forEach(el => el.classList.add("is-visible")); return; }
  els.forEach((el, i) => {
    el.style.setProperty("--stagger-i", Math.min(i, 6));
    CRAFT_reveal_io.observe(el);
  });
}

(function () {
  const grid = document.getElementById("leadershipGrid");
  if (!grid || typeof CRAFT_LEADERSHIP === "undefined") return;

  // Show a brief skeleton state first — mirrors how this would behave
  // once the data comes from a real API instead of a local file.
  grid.innerHTML = Array.from({ length: 6 }).map(() => `
    <div class="skeleton-card">
      <div class="skeleton-block skeleton-avatar"></div>
      <div class="skeleton-block skeleton-line skeleton-line--wide"></div>
      <div class="skeleton-block skeleton-line skeleton-line--mid"></div>
      <div class="skeleton-block skeleton-line skeleton-line--narrow"></div>
    </div>
  `).join("");

  const iconRow = () => `
    <div class="student-icons">
      <span class="icon-btn" title="GitHub placeholder">⌥</span>
      <span class="icon-btn" title="LinkedIn placeholder">in</span>
      <span class="icon-btn" title="Instagram placeholder">◎</span>
    </div>`;

  setTimeout(() => {
    grid.innerHTML = CRAFT_LEADERSHIP.map(m => `
      <article class="student-card lead-card reveal">
        <div class="photo-ring photo-ring--sm"><div class="photo-ring-inner">👤</div></div>
        <h3>${m.name} <span class="status-dot" title="Active"></span></h3>
        <span class="student-role">${m.role}</span>
        <span class="badge-pill" style="margin-top:8px;">${m.team}</span>
        <p class="lead-intro">${m.intro}</p>
        <p class="lead-focus"><strong>Focus:</strong> ${m.focus}</p>
        <div class="tag-row lead-tags">${m.skills.slice(0, 3).map(s => `<span class="tag">${s}</span>`).join("")}</div>
        <p class="lead-contribution">&ldquo;${m.contribution}&rdquo;</p>
        ${iconRow()}
        <span class="lead-since">${m.since}</span>
      </article>
    `).join("");
    observeReveals(grid);
  }, 350);
})();

/* Agenda process-line scroll progress — dots light up individually
   as the fill line actually reaches them, instead of all looking
   permanently "lit" regardless of scroll position. */
(function () {
  const section = document.getElementById("agenda");
  const fill = document.getElementById("processLineFill");
  const flow = document.querySelector(".process-flow");
  if (!section || !fill || !flow) return;
  const stages = Array.from(flow.querySelectorAll(".process-stage"));

  function update() {
    const rect = section.getBoundingClientRect();
    const vh = window.innerHeight;
    const total = rect.height + vh;
    const scrolled = vh - rect.top;
    const pct = Math.max(0, Math.min(1, scrolled / total));
    fill.style.height = (pct * 100) + "%";
    fill.classList.toggle("is-active", pct > 0.02 && pct < 0.999);

    const flowRect = flow.getBoundingClientRect();
    const fillBottomY = flowRect.top + flowRect.height * pct;
    let frontier = null;
    stages.forEach(stage => {
      const dotY = stage.getBoundingClientRect().top + 34; // matches ::before offset
      const passed = dotY <= fillBottomY;
      stage.classList.toggle("is-passed", passed);
      stage.classList.remove("is-current");
      if (passed) frontier = stage;
    });
    // Only the most recently reached stage pulses — once you scroll past
    // it to the next one, the pulse moves forward instead of every lit
    // dot animating forever.
    if (frontier && pct < 0.999) frontier.classList.add("is-current");
  }

  window.addEventListener("scroll", update, { passive: true });
  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "visible") requestAnimationFrame(update);
  });
  window.addEventListener("resize", update);
  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "visible") update();
  });
  update();
})();

/* ---------------------------------------------------------
   Upcoming Events — featured + side list.
   Reads through CraftContent (localStorage), which is seeded
   from CRAFT_EVENTS the first time and editable afterward from
   admin-content.html.
--------------------------------------------------------- */
(function () {
  const featuredEl = document.getElementById("eventFeatured");
  const sideEl = document.getElementById("eventSideList");
  if (!featuredEl || !sideEl) return;
  const source = (typeof CraftContent !== "undefined") ? CraftContent.getEvents() : CRAFT_EVENTS;
  if (!source || !source.featured) return;

  const f = source.featured;
  const pct = Math.round(((f.seatsTotal - f.seatsLeft) / f.seatsTotal) * 100);

  featuredEl.innerHTML = `
    <div class="event-poster-placeholder">Event poster<br>placeholder</div>
    <div class="event-featured-body">
      <div class="event-top-row">
        <span class="badge-pill badge-pill--dark">${f.category}</span>
        <span class="level-badge">${f.level}</span>
      </div>
      <div class="date-block">
        <span class="date-day">${f.day}</span>
        <span class="date-month-year">${f.month}<br>${f.year}</span>
      </div>
      <h3 class="event-title">${f.title}</h3>
      <p class="event-outcome">${f.outcome}</p>
      <div class="event-meta">
        <span>🎤 ${f.host}</span>
        <span>📍 ${f.venue}</span>
        <span>🕐 ${f.time}</span>
      </div>
      <div class="seats-row">
        <span>${f.seatsLeft} of ${f.seatsTotal} seats left</span>
        <div class="seats-bar"><div class="seats-bar-fill" style="width:${pct}%;"></div></div>
      </div>
      <p class="event-deadline">Registration deadline: ${f.deadline}</p>
      <div class="countdown" id="eventCountdown" data-target="${f.countdownTarget}">
        <div class="countdown-unit"><span class="countdown-num" data-unit="days">00</span><span class="countdown-label">Days</span></div>
        <div class="countdown-unit"><span class="countdown-num" data-unit="hours">00</span><span class="countdown-label">Hrs</span></div>
        <div class="countdown-unit"><span class="countdown-num" data-unit="mins">00</span><span class="countdown-label">Min</span></div>
        <div class="countdown-unit"><span class="countdown-num" data-unit="secs">00</span><span class="countdown-label">Sec</span></div>
      </div>
      <div class="event-footer">
        <a href="#join" class="btn btn-primary">Register for Event</a>
        <a href="#" class="btn btn-outline" style="border-color:var(--gold-300); color:var(--gold-300);">View Details</a>
        <span class="qr-placeholder" title="QR placeholder">▦</span>
      </div>
      <p class="event-note">Resources shared after the session</p>
    </div>`;

  sideEl.innerHTML = (source.upcoming || []).map(ev => `
    <article class="event-card reveal">
      <div class="event-top-row">
        <span class="date-block date-block--sm"><span class="date-day">${ev.day}</span><span class="date-month-year">${ev.month}<br>2026</span></span>
        <span class="badge-pill">${ev.category}</span>
      </div>
      <h3 style="margin-top:12px; font-size:16px; color:var(--navy-950); font-family:var(--font-display);">${ev.title}</h3>
      <p style="font-size:13px; color:var(--ink-700); margin-top:8px;">${ev.desc}</p>
      <div class="event-meta">
        <span>📍 ${ev.venue}</span>
        <span>🕐 ${ev.time}</span>
        <span>🎟 ${ev.seatsLeft} left</span>
      </div>
      <div class="event-footer">
        <a href="#join" class="icon-btn icon-btn--arrow" title="Register" aria-label="Register for ${ev.title}">→</a>
      </div>
    </article>
  `).join("") + `<a href="#" class="view-all-cta reveal">View all events →</a>`;

  observeReveals(sideEl);
})();

/* ---------------------------------------------------------
   Project Showcase — with category filter chips
--------------------------------------------------------- */
(function () {
  const grid = document.getElementById("projectsGrid");
  const filterRow = document.getElementById("projectsFilterRow");
  if (!grid) return;
  const projects = (typeof CraftContent !== "undefined") ? CraftContent.getProjects() : (typeof CRAFT_PROJECTS !== "undefined" ? CRAFT_PROJECTS : []);
  if (!projects.length) return;

  function cardHtml(p) {
    const img = p.image ? `<img src="${p.image}" alt="${p.name}" style="width:100%;height:100%;object-fit:cover;">` : "Project image";
    return `
      <article class="project-card reveal" data-filterable data-category="${p.category}">
        <div class="project-image-placeholder">${img}</div>
        <div class="project-body">
          <h3>${p.name}</h3>
          <p>${p.desc}</p>
          <div class="tag-row">${(p.stack || []).map(s => `<span class="tag">${s}</span>`).join("")}</div>
          <div class="build-cta"><a href="${p.githubUrl || '#'}" class="btn btn-outline">GitHub</a><a href="${p.demoUrl || '#'}" class="btn btn-outline">Demo</a></div>
          <p class="project-attrib">Built by ${p.student}</p>
        </div>
      </article>`;
  }

  grid.innerHTML = projects.map(cardHtml).join("");
  observeReveals(grid);

  if (filterRow) {
    const categories = ["All", ...new Set(projects.map(p => p.category))];
    filterRow.innerHTML = categories.map((c, i) =>
      `<button class="filter-chip${i === 0 ? " is-active" : ""}" data-cat="${c}">${c}</button>`
    ).join("");

    filterRow.addEventListener("click", e => {
      const btn = e.target.closest(".filter-chip");
      if (!btn) return;
      filterRow.querySelectorAll(".filter-chip").forEach(b => b.classList.remove("is-active"));
      btn.classList.add("is-active");
      const cat = btn.dataset.cat;
      grid.querySelectorAll("[data-filterable]").forEach(card => {
        card.classList.toggle("is-hidden", cat !== "All" && card.dataset.category !== cat);
      });
    });
  }
})();

/* ---------------------------------------------------------
   Tech Radar — feature + compact items, with filter chips
--------------------------------------------------------- */
(function () {
  const featureEl = document.getElementById("radarFeature");
  const itemsEl = document.getElementById("radarItems");
  const filterRow = document.getElementById("radarFilterRow");
  if (!featureEl || !itemsEl || typeof CRAFT_RADAR === "undefined") return;

  const f = CRAFT_RADAR.feature;
  featureEl.innerHTML = `
    <div class="radar-decoration" aria-hidden="true">
      <span class="radar-ring radar-ring--1"></span>
      <span class="radar-ring radar-ring--2"></span>
      <span class="radar-ring radar-ring--3"></span>
      <span class="radar-dot"></span>
    </div>
    <div>
      <span class="badge-pill badge-pill--dark">${f.category}</span>
      <h3 style="color:#fff; font-size:22px; margin-top:14px;">${f.name}</h3>
      <p style="color:var(--mist-200); font-size:14.5px; margin-top:10px; line-height:1.6;">${f.desc}</p>
      <div class="radar-stats">
        <span>Trend score: <strong>${f.trend} / 100</strong></span>
        <span>Relevance: <strong>${f.level}</strong></span>
      </div>
      <p class="radar-why">${f.why}</p>
    </div>`;

  function itemHtml(r) {
    return `
      <article class="radar-item reveal" data-filterable data-category="${r.category}">
        <span class="badge-pill badge-pill--dark">${r.category}</span>
        <h4>${r.name}</h4>
        <p>${r.desc}</p>
        <div class="radar-stats">
          ${r.trend != null ? `<span>Trend: <strong>${r.trend}</strong></span>` : `<span>Deadline: <strong>${r.deadline}</strong></span>`}
          <span>Level: <strong>${r.level}</strong></span>
        </div>
      </article>`;
  }
  itemsEl.innerHTML = CRAFT_RADAR.items.map(itemHtml).join("");
  observeReveals(itemsEl);

  if (filterRow) {
    const categories = ["All", ...new Set(CRAFT_RADAR.items.map(r => r.category))];
    filterRow.innerHTML = categories.map((c, i) =>
      `<button class="filter-chip${i === 0 ? " is-active" : ""}" data-cat="${c}">${c}</button>`
    ).join("");
    filterRow.addEventListener("click", e => {
      const btn = e.target.closest(".filter-chip");
      if (!btn) return;
      filterRow.querySelectorAll(".filter-chip").forEach(b => b.classList.remove("is-active"));
      btn.classList.add("is-active");
      const cat = btn.dataset.cat;
      itemsEl.querySelectorAll("[data-filterable]").forEach(card => {
        card.classList.toggle("is-hidden", cat !== "All" && card.dataset.category !== cat);
      });
    });
  }
})();

/* ---------------------------------------------------------
   Announcements — pinned feature + feed list.
   Reads through CraftContent (localStorage), which is seeded
   from CRAFT_ANNOUNCEMENTS the first time and editable
   afterward from admin-content.html.
--------------------------------------------------------- */
(function () {
  const featureEl = document.getElementById("announceFeature");
  const listEl = document.getElementById("announceList");
  if (!featureEl || !listEl) return;
  const source = (typeof CraftContent !== "undefined") ? CraftContent.getAnnouncements() : CRAFT_ANNOUNCEMENTS;
  if (!source || !source.feature) return;

  const f = source.feature;
  featureEl.innerHTML = `
    <span class="announce-pin">📌 Pinned</span>
    <span class="mock-tag" style="margin:0 0 10px;">${f.tag}</span>
    <h3>${f.title}</h3>
    <p>${f.desc}</p>
    <span class="announce-date">${f.date}</span>
    <a href="${f.link}" class="announce-arrow">Read more →</a>`;

  listEl.innerHTML = (source.items || []).map(a => `
    <article class="announce-list-item reveal">
      <span class="mock-tag">${a.tag}</span>
      <div class="announce-list-body">
        <h4>${a.title}</h4>
        <p>${a.desc}</p>
      </div>
      <span class="announce-date">${a.date}</span>
      <a href="${a.link}" class="announce-arrow">→</a>
    </article>
  `).join("");
  observeReveals(listEl);
})();

/* ---------------------------------------------------------
   Gallery masonry
--------------------------------------------------------- */
(function () {
  const grid = document.getElementById("galleryGrid");
  if (!grid) return;
  const gallery = (typeof CraftContent !== "undefined") ? CraftContent.getGallery() : (typeof CRAFT_GALLERY !== "undefined" ? CRAFT_GALLERY : []);
  grid.innerHTML = gallery.map(g => {
    const bg = g.image ? `background-image:url('${g.image}'); background-size:cover; background-position:center; color:#fff; text-shadow:0 1px 4px rgba(0,0,0,0.6);` : "";
    return `<div class="masonry-item reveal" style="height:${g.height}px; ${bg}">${g.label}</div>`;
  }).join("");
  observeReveals(grid);
})();

/* ---------------------------------------------------------
   Build of the Month
--------------------------------------------------------- */
(function () {
  const slot = document.getElementById("buildOfMonthSlot");
  if (!slot) return;
  const b = (typeof CraftContent !== "undefined") ? CraftContent.getBuildOfMonth() : (typeof CRAFT_BUILD_OF_MONTH !== "undefined" ? CRAFT_BUILD_OF_MONTH : null);
  if (!b) return;
  const img = b.image
    ? `<img src="${b.image}" alt="${b.name}" style="width:100%;height:100%;object-fit:cover;border-radius:12px;">`
    : "Project screenshot<br>placeholder";
  slot.innerHTML = `
    <div class="build-image-placeholder">${img}</div>
    <div>
      <h3 style="color:#fff; font-size:21px;">${b.name}</h3>
      <p style="color:var(--mist-200); font-size:13px; margin-top:6px; font-family:var(--font-display);">Built by ${b.student}</p>
      <p style="color:var(--mist-200); font-size:14.5px; margin-top:14px; line-height:1.6;">${b.desc}</p>
      <div class="tag-row">${(b.stack || []).map(s => `<span class="tag">${s}</span>`).join("")}</div>
      <div class="build-cta">
        <a href="${b.githubUrl || '#'}" class="btn btn-outline" style="border-color:var(--gold-300); color:var(--gold-300);">GitHub</a>
        <a href="${b.demoUrl || '#'}" class="btn btn-primary">Live demo</a>
      </div>
      <p class="build-why" style="color:var(--mist-200); border-color:var(--gold-500);">
        <strong style="color:#fff;">Why this build matters:</strong> ${b.whyMatters}
      </p>
    </div>`;
})();

/* ---------------------------------------------------------
   Member Notes — testimonial carousel
--------------------------------------------------------- */
(function () {
  const slidesEl = document.getElementById("testimonialSlides");
  const dotsEl = document.getElementById("testimonialDots");
  if (!slidesEl || !dotsEl || typeof CRAFT_TESTIMONIALS === "undefined") return;

  slidesEl.innerHTML = CRAFT_TESTIMONIALS.map(t => `
    <div class="carousel-slide">
      <article class="testimonial-card reveal">
        <p class="testimonial-quote">${t.quote}</p>
        <p class="testimonial-name">${t.name}</p>
        <p class="testimonial-meta">${t.meta}</p>
      </article>
    </div>
  `).join("");
  observeReveals(slidesEl);

  dotsEl.innerHTML = CRAFT_TESTIMONIALS.map((_, i) =>
    `<button class="carousel-dot${i === 0 ? " is-active" : ""}" data-i="${i}" aria-label="Go to testimonial ${i + 1}"></button>`
  ).join("");

  let index = 0;
  const perView = window.innerWidth >= 860 ? 3 : 1;
  const maxIndex = Math.max(0, CRAFT_TESTIMONIALS.length - perView);

  function go(i) {
    index = Math.max(0, Math.min(maxIndex, i));
    slidesEl.style.transform = `translateX(-${index * (100 / (window.innerWidth >= 860 ? 3 : 1))}%)`;
    dotsEl.querySelectorAll(".carousel-dot").forEach((d, di) => d.classList.toggle("is-active", di === index));
  }

  document.querySelectorAll('[data-carousel-prev]').forEach(b => b.addEventListener("click", () => go(index - 1)));
  document.querySelectorAll('[data-carousel-next]').forEach(b => b.addEventListener("click", () => go(index + 1)));
  dotsEl.addEventListener("click", e => {
    const dot = e.target.closest(".carousel-dot");
    if (dot) go(parseInt(dot.dataset.i, 10));
  });

  let autoplay = setInterval(() => go(index >= maxIndex ? 0 : index + 1), 5000);
  const carousel = slidesEl.closest(".carousel");
  if (carousel) {
    carousel.addEventListener("mouseenter", () => clearInterval(autoplay));
    carousel.addEventListener("mouseleave", () => { autoplay = setInterval(() => go(index >= maxIndex ? 0 : index + 1), 5000); });
  }
})();

/* ---------------------------------------------------------
   Wire club-wide stats into Join copy + stats band
--------------------------------------------------------- */
(function () {
  const s = (typeof CraftContent !== "undefined") ? CraftContent.getClubStats() : CRAFT_CLUB_STATS;
  if (!s) return;
  const remaining = s.activeCap - s.activeFilled;

  const capEl = document.getElementById("statActiveCap");
  if (capEl) capEl.textContent = String(s.activeCap);
  const minEl = document.getElementById("statSessionMinutes");
  if (minEl) minEl.textContent = String(s.sessionMinutes);
  const ratioEl = document.getElementById("statDeployRatio");
  if (ratioEl) ratioEl.textContent = s.liveDeployRatio;

  const remainEl = document.getElementById("joinSeatsRemaining");
  if (remainEl) remainEl.textContent = `${remaining} of ${s.activeCap} seats remaining`;
})();

/* ---------------------------------------------------------
   Club Members — public roster of accepted registrations
--------------------------------------------------------- */
(function () {
  const grid = document.getElementById("membersGrid");
  const emptyNote = document.getElementById("membersEmptyNote");
  if (!grid || typeof CraftRegistrations === "undefined") return;

  const members = CraftRegistrations.readAll().filter(r => r.status === "accepted");
  if (!members.length) {
    if (emptyNote) emptyNote.style.display = "block";
    return;
  }

  grid.innerHTML = members.map(m => {
    const avatar = m.photo
      ? `<img src="${m.photo}" alt="${m.name}">`
      : (m.name || "??").trim().split(/\s+/).map(w => w[0]).slice(0, 2).join("").toUpperCase();
    return `
      <article class="member-mini-card reveal">
        <div class="photo-ring photo-ring--sm"><div class="photo-ring-inner">${avatar}</div></div>
        <h4>${m.name || "—"}</h4>
        <p>${m.dept || "—"} · ${m.year || "—"}</p>
      </article>`;
  }).join("");
  observeReveals(grid);
})();
