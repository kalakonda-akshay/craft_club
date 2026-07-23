(function () {
  "use strict";

  /* ---------------------------------------------------------
     Reduced motion detection
  --------------------------------------------------------- */
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (reduceMotion) document.body.classList.add("reduced-motion");

  /* ---------------------------------------------------------
     Mobile nav toggle (now a full-screen overlay menu)
  --------------------------------------------------------- */
  const navToggle = document.getElementById("navToggle");
  const mobileMenu = document.getElementById("mobileMenu");
  const mobileMenuClose = document.getElementById("mobileMenuClose");
  function closeMobileMenu() {
    mobileMenu.classList.remove("is-open");
    navToggle.setAttribute("aria-expanded", "false");
    document.body.style.overflow = "";
  }
  if (navToggle && mobileMenu) {
    navToggle.addEventListener("click", () => {
      const open = mobileMenu.classList.toggle("is-open");
      navToggle.setAttribute("aria-expanded", String(open));
      document.body.style.overflow = open ? "hidden" : "";
    });
    mobileMenu.querySelectorAll("a").forEach(a => a.addEventListener("click", closeMobileMenu));
    if (mobileMenuClose) mobileMenuClose.addEventListener("click", closeMobileMenu);
    document.addEventListener("keydown", e => {
      if (e.key === "Escape" && mobileMenu.classList.contains("is-open")) closeMobileMenu();
    });
  }

  /* ---------------------------------------------------------
     Footer year
  --------------------------------------------------------- */
  const yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* ---------------------------------------------------------
     Join form — stores submissions via CraftRegistrations so
     the Admin panel has something real to review/accept/reject.
     Still no real backend — this is localStorage, not a server.
  --------------------------------------------------------- */
  const joinForm = document.getElementById("joinForm");
  const formStatus = document.getElementById("formStatus");
  const idCardContainer = document.getElementById("idCardContainer");
  const fphoto = document.getElementById("fphoto");
  const fphotoPreview = document.getElementById("fphotoPreview");
  let pendingPhotoDataUrl = "";

  if (fphoto && fphotoPreview) {
    fphoto.addEventListener("change", () => {
      const file = fphoto.files && fphoto.files[0];
      if (!file) { pendingPhotoDataUrl = ""; fphotoPreview.innerHTML = "👤"; return; }
      const reader = new FileReader();
      reader.onload = () => {
        pendingPhotoDataUrl = reader.result;
        fphotoPreview.innerHTML = `<img src="${pendingPhotoDataUrl}" alt="">`;
      };
      reader.readAsDataURL(file);
    });
  }

  function avatarMarkup(entry, sizeClass) {
    if (entry.photo) return `<img src="${entry.photo}" alt="${entry.name || ""}">`;
    const initials = (entry.name || "??").trim().split(/\s+/).map(w => w[0]).slice(0, 2).join("").toUpperCase();
    return initials;
  }

  function renderIdCard(entry) {
    if (!idCardContainer) return;
    idCardContainer.innerHTML = `
      <div class="id-card reveal is-visible">
        <div class="id-card-top">
          <span class="id-card-brand"><span class="brand-mark">&gt;_</span> CRAFT</span>
          <span class="id-card-type">Member ID</span>
        </div>
        <div class="id-card-body">
          <div class="id-card-photo">${avatarMarkup(entry)}</div>
          <div class="id-card-info">
            <h3>${entry.name}</h3>
            <p class="id-card-role">${entry.dept || "—"} · ${entry.year || "—"}</p>
            <dl class="id-card-fields">
              <div><dt>Member ID</dt><dd>${entry.memberId}</dd></div>
              <div><dt>Roll No.</dt><dd>${entry.roll}</dd></div>
              <div><dt>Interest</dt><dd>${entry.interest || "—"}</dd></div>
              <div><dt>Status</dt><dd><span class="status-badge status-badge--pending">Pending Review</span></dd></div>
              <div><dt>Sessions attended</dt><dd>${entry.sessionsAttended}</dd></div>
            </dl>
          </div>
        </div>
        <div class="id-card-bottom">
          <span>Issued ${new Date(entry.submittedAt).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}</span>
          <span class="qr-placeholder" title="QR placeholder">▦</span>
        </div>
      </div>
      <p class="id-card-note">This is your provisional CRAFT ID — it updates automatically once a coordinator reviews your application.</p>
    `;
    idCardContainer.scrollIntoView({ behavior: "smooth", block: "center" });
  }

  if (joinForm) {
    joinForm.addEventListener("submit", async e => {
      e.preventDefault();
      if (!joinForm.checkValidity()) {
        formStatus.textContent = "Please fill in every field before submitting.";
        formStatus.classList.remove("success");
        return;
      }
      const name = joinForm.fname.value.trim();
      let entry = null;
      if (typeof CraftRegistrations !== "undefined") {
        entry = await CraftRegistrations.add({
          name,
          roll: joinForm.froll.value.trim(),
          email: joinForm.femail.value.trim(),
          phone: joinForm.fphone ? joinForm.fphone.value.trim() : "",
          dob: joinForm.fdob ? joinForm.fdob.value : "", // stored as YYYY-MM-DD (native date input)
          year: joinForm.fyear.value,
          dept: joinForm.fdept ? joinForm.fdept.value : "",
          section: joinForm.fsection ? joinForm.fsection.value.trim() : "",
          interest: joinForm.finterest ? joinForm.finterest.value : "",
          profile: joinForm.fprofile ? joinForm.fprofile.value.trim() : "",
          photo: pendingPhotoDataUrl,
        });
      }
      const firstName = name.split(" ")[0];
      formStatus.textContent = `Thanks, ${firstName} — your registration is noted. Your provisional ID card is below.`;
      formStatus.classList.add("success");
      if (entry) renderIdCard(entry);
      joinForm.reset();
      pendingPhotoDataUrl = "";
      if (fphotoPreview) fphotoPreview.innerHTML = "👤";
    });
  }

  /* ---------------------------------------------------------
     PIXEL-ART PONG HERO
     A ball bounces inside the hero canvas; four auto-tracking
     paddles guard each edge. The word "CRAFT" is rendered as
     a grid of pixel blocks — each block "breaks" (fades to
     gold) the first time the ball collides with it.
  --------------------------------------------------------- */
  const canvas = document.getElementById("heroCanvas");
  if (!canvas) return;
  const ctx = canvas.getContext("2d");

  // 5x7 dot-matrix bitmap font, just the letters CRAFT needs.
  const FONT = {
    C: ["01110","10001","10000","10000","10000","10001","01110"],
    R: ["11110","10001","10001","11110","10100","10010","10001"],
    A: ["01110","10001","10001","11111","10001","10001","10001"],
    F: ["11111","10000","10000","11110","10000","10000","10000"],
    T: ["11111","00100","00100","00100","00100","00100","00100"],
  };
  const WORD = "CRAFT";

  let cols = [], rows = 7;
  let cellSize = 10;
  let pixels = []; // {x,y,col,row,alive}
  let gridW = 0, gridH = 0, gridOffsetX = 0, gridOffsetY = 0;

  function buildGrid() {
    pixels = [];
    let colCursor = 0;
    const letterGap = 1;
    WORD.split("").forEach((ch, li) => {
      const glyph = FONT[ch];
      glyph.forEach((rowStr, r) => {
        rowStr.split("").forEach((bit, c) => {
          if (bit === "1") {
            pixels.push({ col: colCursor + c, row: r, alive: true });
          }
        });
      });
      colCursor += 5 + letterGap;
    });
    gridW = colCursor - letterGap;
    gridH = rows;
  }
  buildGrid();

  function resize() {
    const rect = canvas.parentElement.getBoundingClientRect();
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    canvas.style.width = rect.width + "px";
    canvas.style.height = rect.height + "px";
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    // Fit the CRAFT grid within ~70% of width, capped cell size.
    const targetW = rect.width * 0.82;
    cellSize = Math.max(7, Math.min(26, Math.floor(targetW / gridW)));
    gridOffsetX = (rect.width - gridW * cellSize) / 2;
    gridOffsetY = (rect.height - gridH * cellSize) / 2;

    W = rect.width; H = rect.height;
  }

  let W = 0, H = 0;

  // Ball
  const ball = { x: 0, y: 0, r: 5, vx: 3.2, vy: 2.6 };

  // Paddles: top/bottom track x, left/right track y
  const PADDLE_LEN = 90, PADDLE_THICK = 8, PADDLE_SPEED = 0.09;
  const paddles = {
    top: { pos: 0 },
    bottom: { pos: 0 },
    left: { pos: 0 },
    right: { pos: 0 },
  };

  function resetBall() {
    ball.x = W / 2 + (Math.random() - 0.5) * 80;
    ball.y = H * 0.62;
    const angle = (Math.random() * 0.6 + 0.2) * Math.PI;
    const speed = 3.6;
    ball.vx = Math.cos(angle) * speed * (Math.random() > 0.5 ? 1 : -1);
    ball.vy = -Math.abs(Math.sin(angle) * speed);
  }

  function pixelRect(p) {
    return {
      x: gridOffsetX + p.col * cellSize,
      y: gridOffsetY + p.row * cellSize,
      w: cellSize - 2,
      h: cellSize - 2,
    };
  }

  function collideWithPixels() {
    for (const p of pixels) {
      if (!p.alive) continue;
      const r = pixelRect(p);
      if (
        ball.x + ball.r > r.x &&
        ball.x - ball.r < r.x + r.w &&
        ball.y + ball.r > r.y &&
        ball.y - ball.r < r.y + r.h
      ) {
        p.alive = false;
        // Decide bounce axis based on penetration depth
        const overlapX = Math.min(ball.x + ball.r - r.x, r.x + r.w - (ball.x - ball.r));
        const overlapY = Math.min(ball.y + ball.r - r.y, r.y + r.h - (ball.y - ball.r));
        if (overlapX < overlapY) ball.vx *= -1; else ball.vy *= -1;
        return;
      }
    }
  }

  let liveCount = 0;
  function checkRespawn() {
    liveCount = pixels.reduce((n, p) => n + (p.alive ? 1 : 0), 0);
    if (liveCount === 0) {
      setTimeout(() => {
        pixels.forEach(p => (p.alive = true));
      }, 900);
    }
  }

  function step() {
    // Move ball
    ball.x += ball.vx;
    ball.y += ball.vy;

    // Paddle tracking (top/bottom follow x, left/right follow y)
    paddles.top.pos += (ball.x - paddles.top.pos) * PADDLE_SPEED;
    paddles.bottom.pos += (ball.x - paddles.bottom.pos) * PADDLE_SPEED;
    paddles.left.pos += (ball.y - paddles.left.pos) * PADDLE_SPEED;
    paddles.right.pos += (ball.y - paddles.right.pos) * PADDLE_SPEED;

    // Edge collisions (paddles occupy a thin band just inside each edge)
    if (ball.y - ball.r <= PADDLE_THICK + 4) { ball.vy = Math.abs(ball.vy); ball.y = PADDLE_THICK + 4 + ball.r; }
    if (ball.y + ball.r >= H - PADDLE_THICK - 4) { ball.vy = -Math.abs(ball.vy); ball.y = H - PADDLE_THICK - 4 - ball.r; }
    if (ball.x - ball.r <= PADDLE_THICK + 4) { ball.vx = Math.abs(ball.vx); ball.x = PADDLE_THICK + 4 + ball.r; }
    if (ball.x + ball.r >= W - PADDLE_THICK - 4) { ball.vx = -Math.abs(ball.vx); ball.x = W - PADDLE_THICK - 4 - ball.r; }

    collideWithPixels();
  }

  function isMonoTheme() {
    return document.documentElement.getAttribute("data-theme") === "mono";
  }

  function draw() {
    ctx.clearRect(0, 0, W, H);
    const mono = isMonoTheme();

    // Paddles
    ctx.fillStyle = mono ? "rgba(255,255,255,0.55)" : "rgba(232,200,119,0.55)";
    ctx.fillRect(paddles.top.pos - PADDLE_LEN / 2, 0, PADDLE_LEN, PADDLE_THICK);
    ctx.fillRect(paddles.bottom.pos - PADDLE_LEN / 2, H - PADDLE_THICK, PADDLE_LEN, PADDLE_THICK);
    ctx.fillRect(0, paddles.left.pos - PADDLE_LEN / 2, PADDLE_THICK, PADDLE_LEN);
    ctx.fillRect(W - PADDLE_THICK, paddles.right.pos - PADDLE_LEN / 2, PADDLE_THICK, PADDLE_LEN);

    // Pixel text
    for (const p of pixels) {
      const r = pixelRect(p);
      ctx.fillStyle = p.alive ? "rgba(255,255,255,0.9)" : (mono ? "rgba(140,140,140,0.9)" : "rgba(201,154,46,0.9)");
      ctx.fillRect(r.x, r.y, r.w, r.h);
    }

    // Ball
    ctx.beginPath();
    ctx.arc(ball.x, ball.y, ball.r, 0, Math.PI * 2);
    ctx.fillStyle = mono ? "#FFFFFF" : "#E8C877";
    ctx.shadowColor = mono ? "rgba(255,255,255,0.7)" : "rgba(232,200,119,0.8)";
    ctx.shadowBlur = 12;
    ctx.fill();
    ctx.shadowBlur = 0;
  }

  let rafId = null;
  function loop() {
    if (canvas.dataset.paused !== "1") {
      step();
      draw();
      checkRespawn();
    }
    rafId = requestAnimationFrame(loop);
  }

  // Bug fix: browsers fully pause requestAnimationFrame for backgrounded
  // tabs, and can also momentarily report stale/zero layout measurements
  // right at the instant a tab becomes visible again — which was leaving
  // the CRAFT pixel-art looking half-broken, faded, and misaligned with
  // the eyebrow badge until the next real resize. Rather than trying to
  // resume the exact mid-animation state (not worth the complexity for a
  // decorative element), just do a full clean restart: wait one frame for
  // the browser's layout to settle, then re-measure and reset the grid.
  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState !== "visible") return;
    requestAnimationFrame(() => {
      if (canvas.dataset.paused === "1") return; // hero off-screen — nothing to fix yet
      resize();
      pixels.forEach(p => (p.alive = true));
      resetBall();
      draw();
    });
  });

  function startAnimation() {
    resize();
    lastWidth = W;
    resetBall();
    paddles.top.pos = paddles.bottom.pos = W / 2;
    paddles.left.pos = paddles.right.pos = H / 2;
    if (rafId) cancelAnimationFrame(rafId);
    if (!reduceMotion) {
      loop();
    } else {
      // Static reveal: draw once with all pixels "broken" (gold) and no ball.
      draw();
    }
  }

  // Let the pointer gently attract the ball (fun, optional interaction)
  canvas.addEventListener("pointermove", e => {
    if (reduceMotion) return;
    const rect = canvas.getBoundingClientRect();
    const mx = e.clientX - rect.left, my = e.clientY - rect.top;
    const dx = mx - ball.x, dy = my - ball.y;
    const dist = Math.hypot(dx, dy);
    if (dist < 140 && dist > 0.01) {
      ball.vx += (dx / dist) * 0.4;
      ball.vy += (dy / dist) * 0.4;
      const speed = Math.hypot(ball.vx, ball.vy);
      const maxSpeed = 6.5;
      if (speed > maxSpeed) { ball.vx = (ball.vx / speed) * maxSpeed; ball.vy = (ball.vy / speed) * maxSpeed; }
    }
  });

  canvas.addEventListener("touchstart", e => {
    if (reduceMotion || !e.touches || !e.touches.length) return;
    const rect = canvas.getBoundingClientRect();
    const t = e.touches[0];
    const mx = t.clientX - rect.left, my = t.clientY - rect.top;
    const dx = mx - ball.x, dy = my - ball.y;
    const dist = Math.hypot(dx, dy);
    if (dist > 0.01) {
      ball.vx += (dx / dist) * 0.9;
      ball.vy += (dy / dist) * 0.9;
      const speed = Math.hypot(ball.vx, ball.vy);
      const maxSpeed = 6.5;
      if (speed > maxSpeed) { ball.vx = (ball.vx / speed) * maxSpeed; ball.vy = (ball.vy / speed) * maxSpeed; }
    }
  }, { passive: true });

  // Mobile browsers fire "resize" constantly while scrolling (address-bar
  // show/hide), which used to restart the whole animation and made the
  // CRAFT pixel-art appear to shrink/pop. Fix: only react when the WIDTH
  // actually changes meaningfully, and only recompute layout — never reset
  // the ball, paddles, or pixel grid once the animation is already running.
  let lastWidth = 0;
  function handleResize() {
    const rect = canvas.parentElement.getBoundingClientRect();
    if (Math.abs(rect.width - lastWidth) < 2) return; // height-only change (mobile chrome) — ignore
    lastWidth = rect.width;
    const prevW = W, prevH = H;
    resize();
    // Keep the ball and paddles proportionally where they were instead of
    // snapping back to center, so a real width change (rotation, resize)
    // doesn't look like a reset either.
    if (prevW > 0 && prevH > 0) {
      ball.x = (ball.x / prevW) * W;
      ball.y = (ball.y / prevH) * H;
      paddles.top.pos = (paddles.top.pos / prevW) * W;
      paddles.bottom.pos = (paddles.bottom.pos / prevW) * W;
      paddles.left.pos = (paddles.left.pos / prevH) * H;
      paddles.right.pos = (paddles.right.pos / prevH) * H;
    }
  }

  let resizeTimer;
  window.addEventListener("resize", () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(handleResize, 150);
  });

  startAnimation();
})();

/* ---------------------------------------------------------
   NEW: FAQ accordion (added section — does not touch
   any behavior above this line)
--------------------------------------------------------- */
(function () {
  const items = document.querySelectorAll(".faq-item");
  items.forEach(item => {
    const q = item.querySelector(".faq-question");
    const a = item.querySelector(".faq-answer");
    if (!q || !a) return;
    q.addEventListener("click", () => {
      const isOpen = item.classList.contains("is-open");
      items.forEach(other => {
        other.classList.remove("is-open");
        other.querySelector(".faq-answer").style.maxHeight = null;
      });
      if (!isOpen) {
        item.classList.add("is-open");
        a.style.maxHeight = a.scrollHeight + "px";
      }
    });
  });
})();

/* ---------------------------------------------------------
   NEW: Featured event countdown
--------------------------------------------------------- */
(function () {
  const el = document.getElementById("eventCountdown");
  if (!el) return;
  const target = new Date(el.dataset.target).getTime();
  function tick() {
    const now = Date.now();
    const diff = Math.max(0, target - now);
    const days = Math.floor(diff / 86400000);
    const hours = Math.floor((diff % 86400000) / 3600000);
    const mins = Math.floor((diff % 3600000) / 60000);
    const secs = Math.floor((diff % 60000) / 1000);
    const set = (id, val) => { const n = el.querySelector(`[data-unit="${id}"]`); if (n) n.textContent = String(val).padStart(2, "0"); };
    set("days", days); set("hours", hours); set("mins", mins); set("secs", secs);
  }
  tick();
  setInterval(tick, 1000);
})();

/* ---------------------------------------------------------
   NEW: Scroll-reveal for newly added sections only
   (elements carrying the .reveal class)
--------------------------------------------------------- */
(function () {
  const targets = document.querySelectorAll(".reveal");
  if (!targets.length) return;
  if (!("IntersectionObserver" in window)) {
    targets.forEach(t => t.classList.add("is-visible"));
    return;
  }
  const io = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-visible");
        io.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15 });
  targets.forEach(t => io.observe(t));
})();

/* ---------------------------------------------------------
   NEW BATCH: stagger reveal delays, scroll-spy nav,
   back-to-top, gallery lightbox, FAQ expand-all + deep link,
   countdown end-state, method-track progress fill,
   stats count-up, hero scroll-cue + custom cursor dot,
   pause hero canvas RAF when off-screen.
   (Appended only — nothing above this line is touched.)
--------------------------------------------------------- */

/* Stagger delay per reveal element within its own section */
(function () {
  const groups = {};
  document.querySelectorAll(".reveal").forEach(el => {
    const parent = el.closest("section") || document.body;
    const key = parent;
    groups[Symbol.for("x")] = null;
    if (!parent.__revealCount) parent.__revealCount = 0;
    el.style.setProperty("--stagger-i", Math.min(parent.__revealCount, 6));
    parent.__revealCount += 1;
  });
})();

/* Scroll-spy: highlight the nav link for the section in view */
(function () {
  const sections = ["about", "agenda", "framework", "leadership", "faculty", "events", "join"]
    .map(id => document.getElementById(id))
    .filter(Boolean);
  const navLinks = Array.from(document.querySelectorAll(".nav-links a, .nav-links--mobile a"));
  if (!sections.length || !navLinks.length || !("IntersectionObserver" in window)) return;

  const linkFor = id => navLinks.filter(a => a.getAttribute("href") === `#${id}`);

  const io = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        navLinks.forEach(a => a.classList.remove("is-active"));
        linkFor(entry.target.id).forEach(a => a.classList.add("is-active"));
      }
    });
  }, { rootMargin: "-45% 0px -50% 0px", threshold: 0 });

  sections.forEach(s => io.observe(s));
})();

/* Back-to-top button */
(function () {
  const btn = document.createElement("button");
  btn.className = "back-to-top";
  btn.setAttribute("aria-label", "Back to top");
  btn.innerHTML = "&#8593;";
  document.body.appendChild(btn);
  btn.addEventListener("click", () => window.scrollTo({ top: 0, behavior: "smooth" }));
  window.addEventListener("scroll", () => {
    btn.classList.toggle("is-visible", window.scrollY > 700);
  }, { passive: true });
})();

/* Gallery lightbox */
(function () {
  const items = document.querySelectorAll(".masonry-item, .gallery-placeholder");
  if (!items.length) return;
  const overlay = document.createElement("div");
  overlay.className = "lightbox-overlay";
  overlay.innerHTML = '<div class="lightbox-box"><button class="lightbox-close" aria-label="Close">&times;</button><p class="lightbox-label"></p></div>';
  document.body.appendChild(overlay);
  const label = overlay.querySelector(".lightbox-label");
  const close = () => overlay.classList.remove("is-open");
  overlay.querySelector(".lightbox-close").addEventListener("click", close);
  overlay.addEventListener("click", e => { if (e.target === overlay) close(); });
  document.addEventListener("keydown", e => { if (e.key === "Escape") close(); });
  items.forEach(item => {
    item.addEventListener("click", () => {
      label.textContent = (item.textContent || "Gallery image").trim() + " — full size placeholder";
      overlay.classList.add("is-open");
    });
  });
})();

/* FAQ: expand-all toggle + deep-link by hash (#faq-1 etc.) */
(function () {
  const list = document.querySelector(".faq-list");
  if (!list) return;
  const items = Array.from(list.querySelectorAll(".faq-item"));
  items.forEach((item, i) => { item.id = item.id || `faq-${i + 1}`; });

  const toolbar = document.createElement("div");
  toolbar.className = "faq-toolbar";
  toolbar.innerHTML = '<button class="faq-toggle-all" type="button">Expand all</button>';
  list.parentElement.insertBefore(toolbar, list);
  const toggleBtn = toolbar.querySelector(".faq-toggle-all");
  let allOpen = false;
  toggleBtn.addEventListener("click", () => {
    allOpen = !allOpen;
    items.forEach(item => {
      const a = item.querySelector(".faq-answer");
      item.classList.toggle("is-open", allOpen);
      a.style.maxHeight = allOpen ? a.scrollHeight + "px" : null;
    });
    toggleBtn.textContent = allOpen ? "Collapse all" : "Expand all";
  });

  if (location.hash && location.hash.startsWith("#faq-")) {
    const target = document.querySelector(location.hash);
    if (target) {
      const a = target.querySelector(".faq-answer");
      target.classList.add("is-open");
      if (a) a.style.maxHeight = a.scrollHeight + "px";
      target.scrollIntoView({ block: "center" });
    }
  }
})();

/* Countdown end-state */
(function () {
  const el = document.getElementById("eventCountdown");
  if (!el) return;
  const target = new Date(el.dataset.target).getTime();
  const msg = document.createElement("p");
  msg.className = "countdown-ended-msg";
  msg.textContent = "This event has started — see you there.";
  el.insertAdjacentElement("afterend", msg);
  const check = setInterval(() => {
    if (Date.now() >= target) {
      el.classList.add("is-ended");
      clearInterval(check);
    }
  }, 1000);
})();

/* Method-track progress fill on scroll-into-view */
(function () {
  const track = document.querySelector(".method-track");
  if (!track) return;
  const bar = document.createElement("div");
  bar.className = "method-progress-track";
  bar.innerHTML = '<div class="method-progress-fill"></div>';
  track.prepend(bar);
  const fill = bar.querySelector(".method-progress-fill");
  if (!("IntersectionObserver" in window)) { fill.style.width = "100%"; return; }
  const io = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        requestAnimationFrame(() => { fill.style.width = "100%"; });
        io.unobserve(entry.target);
      }
    });
  }, { threshold: 0.4 });
  io.observe(track);
})();

/* Stats count-up (numeric stat-num values only) */
(function () {
  const nums = document.querySelectorAll(".stat-num");
  if (!nums.length || !("IntersectionObserver" in window)) return;
  const io = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const el = entry.target;
      const raw = el.textContent.trim();
      const match = raw.match(/^(\d+)$/);
      io.unobserve(el);
      if (!match) return; // skip "1:1", "∞", etc — leave as-is
      const target = parseInt(match[1], 10);
      const duration = 900;
      const start = performance.now();
      function step(now) {
        const p = Math.min(1, (now - start) / duration);
        el.textContent = Math.round(target * (1 - Math.pow(1 - p, 3)));
        if (p < 1) requestAnimationFrame(step); else el.textContent = String(target);
      }
      requestAnimationFrame(step);
    });
  }, { threshold: 0.6 });
  nums.forEach(n => io.observe(n));
})();

/* Hero: scroll-down cue + custom cursor dot + pause canvas when off-screen */
(function () {
  const hero = document.querySelector(".hero");
  if (!hero) return;

  const cue = document.createElement("div");
  cue.className = "scroll-cue";
  cue.innerHTML = '<span>Scroll</span><span class="chevron" aria-hidden="true"></span>';
  hero.querySelector(".hero-inner").appendChild(cue);

  const dot = document.createElement("div");
  dot.className = "hero-cursor-dot";
  document.body.appendChild(dot);
  hero.addEventListener("pointermove", e => {
    dot.style.transform = `translate(${e.clientX}px, ${e.clientY}px) translate(-50%,-50%)`;
    dot.classList.add("is-active");
  });
  hero.addEventListener("pointerleave", () => dot.classList.remove("is-active"));

  const canvas = document.getElementById("heroCanvas");
  if (canvas && "IntersectionObserver" in window) {
    const io = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        canvas.dataset.paused = entry.isIntersecting ? "" : "1";
      });
    }, { threshold: 0.05 });
    io.observe(hero);
  }
})();

/* ---------------------------------------------------------
   NEW: Theme toggle (color <-> mono), persisted via localStorage
--------------------------------------------------------- */
(function () {
  const btn = document.getElementById("themeToggle");
  if (!btn) return;
  const root = document.documentElement;
  const KEY = "craft-theme";

  function apply(theme) {
    if (theme === "mono") { root.setAttribute("data-theme", "mono"); btn.textContent = "◑"; }
    else { root.removeAttribute("data-theme"); btn.textContent = "◐"; }
  }

  let saved = null;
  try { saved = localStorage.getItem(KEY); } catch (e) { /* private mode — ignore */ }
  apply(saved === "mono" ? "mono" : "color");

  btn.addEventListener("click", () => {
    const isMono = root.getAttribute("data-theme") === "mono";
    const next = isMono ? "color" : "mono";
    apply(next);
    try { localStorage.setItem(KEY, next); } catch (e) { /* private mode — ignore */ }
  });
})();

/* ---------------------------------------------------------
   NEW: Top-of-page scroll progress bar
--------------------------------------------------------- */
(function () {
  const bar = document.getElementById("scrollProgress");
  if (!bar) return;
  function update() {
    const h = document.documentElement;
    const scrollable = h.scrollHeight - h.clientHeight;
    const pct = scrollable > 0 ? (h.scrollTop / scrollable) * 100 : 0;
    bar.style.width = pct + "%";
  }
  window.addEventListener("scroll", update, { passive: true });
  window.addEventListener("resize", update);
  update();
})();

/* ---------------------------------------------------------
   NEW: Sticky "Join CRAFT" mini-CTA (appears after the hero)
--------------------------------------------------------- */
(function () {
  const hero = document.querySelector(".hero");
  if (!hero) return;
  const cta = document.createElement("a");
  cta.href = "#join";
  cta.className = "sticky-join";
  cta.innerHTML = '<span class="dot"></span> Join CRAFT';
  document.body.appendChild(cta);

  if ("IntersectionObserver" in window) {
    const io = new IntersectionObserver(entries => {
      entries.forEach(entry => cta.classList.toggle("is-visible", !entry.isIntersecting));
    }, { threshold: 0 });
    io.observe(hero);
  }
  cta.addEventListener("click", () => cta.classList.remove("is-visible"));
})();

/* ---------------------------------------------------------
   NEW: FAQ keyboard navigation (Up/Down between questions)
--------------------------------------------------------- */
(function () {
  const questions = Array.from(document.querySelectorAll(".faq-question"));
  if (!questions.length) return;
  questions.forEach((q, i) => {
    q.addEventListener("keydown", e => {
      if (e.key === "ArrowDown") { e.preventDefault(); (questions[i + 1] || questions[0]).focus(); }
      if (e.key === "ArrowUp") { e.preventDefault(); (questions[i - 1] || questions[questions.length - 1]).focus(); }
    });
  });
})();

/* ---------------------------------------------------------
   NEW: Lightbox focus trap (keeps Tab cycling inside the modal)
--------------------------------------------------------- */
(function () {
  const overlay = document.querySelector(".lightbox-overlay");
  if (!overlay) return;
  overlay.addEventListener("keydown", e => {
    if (e.key !== "Tab") return;
    const focusable = overlay.querySelectorAll("button, [href], input, select, textarea");
    if (!focusable.length) return;
    const first = focusable[0], last = focusable[focusable.length - 1];
    if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
  });
  // When opened, move focus to the close button for screen-reader users
  const closeBtn = overlay.querySelector(".lightbox-close");
  const obs = new MutationObserver(() => {
    if (overlay.classList.contains("is-open") && closeBtn) closeBtn.focus();
  });
  obs.observe(overlay, { attributes: true, attributeFilter: ["class"] });
})();
