(function () {
  "use strict";

  /* ---------------------------------------------------------
     Reduced motion detection
  --------------------------------------------------------- */
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (reduceMotion) document.body.classList.add("reduced-motion");

  /* ---------------------------------------------------------
     Mobile nav toggle
  --------------------------------------------------------- */
  const navToggle = document.getElementById("navToggle");
  const mobileMenu = document.getElementById("mobileMenu");
  if (navToggle && mobileMenu) {
    navToggle.addEventListener("click", () => {
      const open = mobileMenu.classList.toggle("is-open");
      navToggle.setAttribute("aria-expanded", String(open));
    });
    mobileMenu.querySelectorAll("a").forEach(a =>
      a.addEventListener("click", () => {
        mobileMenu.classList.remove("is-open");
        navToggle.setAttribute("aria-expanded", "false");
      })
    );
  }

  /* ---------------------------------------------------------
     Footer year
  --------------------------------------------------------- */
  const yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* ---------------------------------------------------------
     Join form (client-side only — no backend wired up)
  --------------------------------------------------------- */
  const joinForm = document.getElementById("joinForm");
  const formStatus = document.getElementById("formStatus");
  if (joinForm) {
    joinForm.addEventListener("submit", e => {
      e.preventDefault();
      if (!joinForm.checkValidity()) {
        formStatus.textContent = "Please fill in every field before submitting.";
        formStatus.classList.remove("success");
        return;
      }
      const name = joinForm.fname.value.trim().split(" ")[0];
      formStatus.textContent = `Thanks, ${name} — your registration is noted. The Operations & Logistics Team will confirm your Active/Waitlist status by email.`;
      formStatus.classList.add("success");
      joinForm.reset();
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
    const targetW = rect.width * 0.72;
    cellSize = Math.max(6, Math.min(22, Math.floor(targetW / gridW)));
    gridOffsetX = (rect.width - gridW * cellSize) / 2;
    gridOffsetY = rect.height * 0.30;

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

  function draw() {
    ctx.clearRect(0, 0, W, H);

    // Paddles
    ctx.fillStyle = "rgba(255,255,255,0.55)";
    ctx.fillRect(paddles.top.pos - PADDLE_LEN / 2, 0, PADDLE_LEN, PADDLE_THICK);
    ctx.fillRect(paddles.bottom.pos - PADDLE_LEN / 2, H - PADDLE_THICK, PADDLE_LEN, PADDLE_THICK);
    ctx.fillRect(0, paddles.left.pos - PADDLE_LEN / 2, PADDLE_THICK, PADDLE_LEN);
    ctx.fillRect(W - PADDLE_THICK, paddles.right.pos - PADDLE_LEN / 2, PADDLE_THICK, PADDLE_LEN);

    // Pixel text
    for (const p of pixels) {
      const r = pixelRect(p);
      ctx.fillStyle = p.alive ? "rgba(255,255,255,0.9)" : "rgba(170,170,170,0.9)";
      ctx.fillRect(r.x, r.y, r.w, r.h);
    }

    // Ball
    ctx.beginPath();
    ctx.arc(ball.x, ball.y, ball.r, 0, Math.PI * 2);
    ctx.fillStyle = "#FFFFFF";
    ctx.shadowColor = "rgba(255,255,255,0.8)";
    ctx.shadowBlur = 12;
    ctx.fill();
    ctx.shadowBlur = 0;
  }

  let rafId = null;
  function loop() {
    step();
    draw();
    checkRespawn();
    rafId = requestAnimationFrame(loop);
  }

  function startAnimation() {
    resize();
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

  let resizeTimer;
  window.addEventListener("resize", () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(startAnimation, 150);
  });

  startAnimation();
})();
