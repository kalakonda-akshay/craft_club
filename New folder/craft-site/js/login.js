(function () {
  "use strict";

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------------------------------------------------------
     Theme sync (reads the same choice made on the main site)
  --------------------------------------------------------- */
  (function () {
    const btn = document.getElementById("themeToggle");
    const root = document.documentElement;
    const KEY = "craft-theme";
    function apply(theme) {
      if (theme === "mono") { root.setAttribute("data-theme", "mono"); if (btn) btn.textContent = "◑"; }
      else { root.removeAttribute("data-theme"); if (btn) btn.textContent = "◐"; }
    }
    let saved = null;
    try { saved = localStorage.getItem(KEY); } catch (e) { /* private mode */ }
    apply(saved === "mono" ? "mono" : "color");
    if (btn) {
      btn.addEventListener("click", () => {
        const isMono = root.getAttribute("data-theme") === "mono";
        const next = isMono ? "color" : "mono";
        apply(next);
        try { localStorage.setItem(KEY, next); } catch (e) { /* private mode */ }
      });
    }
  })();

  /* ---------------------------------------------------------
     Flicker-on sequence for the spotlight room, then reveal
     the login card once the lights "settle."
     Mirrors the timed on/off pattern from the reference demo.
  --------------------------------------------------------- */
  const lights = document.getElementById("roomLights");
  const bulbs = [document.getElementById("bulb1"), document.getElementById("bulb2"), document.getElementById("bulb3")];
  const revealEls = document.querySelectorAll(".reveal-in");

  function setLit(on) {
    bulbs.forEach(b => { if (b) b.classList.toggle("is-on", on); });
    if (lights) lights.classList.toggle("is-lit", on);
  }

  async function runFlicker() {
    const sleep = ms => new Promise(r => setTimeout(r, ms));
    if (!lights) return;

    if (reduceMotion) { setLit(true); revealEls.forEach(el => el.classList.add("is-in")); return; }

    lights.classList.add("is-flicker");
    await sleep(500);
    setLit(true);  await sleep(100);
    setLit(false); await sleep(250);
    setLit(true);  await sleep(60);
    setLit(false); await sleep(180);
    setLit(true);  await sleep(50);
    setLit(false); await sleep(70);
    setLit(true);  await sleep(300);

    lights.classList.remove("is-flicker");
    setLit(true);

    revealEls.forEach((el, i) => {
      setTimeout(() => el.classList.add("is-in"), i * 130);
    });
  }
  runFlicker();

  /* ---------------------------------------------------------
     Login: looks up the entered email against CraftRegistrations
     and, if found, shows that member's real, live dashboard
     (status, sessions, attendance history, and photo all reflect
     whatever the admin has set / whatever the member uploads).
     No password is actually verified — this is a frontend
     preview of the flow, not real authentication.
  --------------------------------------------------------- */
  const form = document.getElementById("loginForm");
  const status = document.getElementById("loginStatus");
  const memberCardView = document.getElementById("memberCardView");
  const memberCardSlot = document.getElementById("memberCardSlot");
  const memberAlertSlot = document.getElementById("memberAlertSlot");
  const memberAttendanceRow = document.getElementById("memberAttendanceRow");
  const memberSessionsNum = document.getElementById("memberSessionsNum");
  const memberStatusNum = document.getElementById("memberStatusNum");
  const memberPhotoInput = document.getElementById("memberPhotoInput");
  const memberPhotoPreview = document.getElementById("memberPhotoPreview");
  const memberPhotoStatus = document.getElementById("memberPhotoStatus");
  const memberLogoutBtn = document.getElementById("memberLogoutBtn");
  const loginEyebrow = document.getElementById("loginEyebrow");
  const loginTitle = document.getElementById("loginTitle");
  const loginSub = document.getElementById("loginSub");

  let currentEntryId = null;

  function findRegistrationByEmail(email) {
    if (typeof CraftRegistrations === "undefined") return null;
    const q = email.trim().toLowerCase();
    return CraftRegistrations.readAll().find(r => (r.email || "").trim().toLowerCase() === q) || null;
  }

  function getTotalSessions() {
    if (typeof CraftContent === "undefined") return 0;
    const s = CraftContent.getClubStats();
    return (s && s.totalSessionsConducted) || 0;
  }

  function avatarMarkup(entry) {
    if (entry.photo) return `<img src="${entry.photo}" alt="">`;
    return (entry.name || "??").trim().split(/\s+/).map(w => w[0]).slice(0, 2).join("").toUpperCase();
  }

  function renderMemberCard(entry) {
    const statusLabel = { pending: "Pending Review", accepted: "Active Member", rejected: "Not Accepted", waitlist: "Waitlisted" }[entry.status] || entry.status;
    const totalSessions = getTotalSessions();
    memberCardSlot.innerHTML = `
      <div class="id-card">
        <div class="id-card-top">
          <span class="id-card-brand"><span class="brand-mark">&gt;_</span> CRAFT</span>
          <span class="id-card-type">Member ID</span>
        </div>
        <div class="id-card-body">
          <div class="id-card-photo">${avatarMarkup(entry)}</div>
          <div class="id-card-info">
            <h3>${entry.name || "—"}</h3>
            <p class="id-card-role">${entry.dept || "—"} · ${entry.year || "—"}</p>
            <dl class="id-card-fields">
              <div><dt>Member ID</dt><dd>${entry.memberId || "—"}</dd></div>
              <div><dt>Roll No.</dt><dd>${entry.roll || "—"}</dd></div>
              <div><dt>Interest</dt><dd>${entry.interest || "—"}</dd></div>
              <div><dt>Status</dt><dd><span class="status-badge status-badge--${entry.status}">${statusLabel}</span></dd></div>
              <div><dt>Sessions attended</dt><dd>${entry.sessionsAttended || 0} of ${totalSessions}</dd></div>
            </dl>
          </div>
        </div>
        <div class="id-card-bottom">
          <span>Member since ${new Date(entry.submittedAt).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}</span>
          <span class="qr-placeholder" title="QR placeholder">▦</span>
        </div>
      </div>`;

    if (memberPhotoPreview) {
      memberPhotoPreview.innerHTML = entry.photo ? `<img src="${entry.photo}" alt="">` : "👤";
    }
  }

  function renderDashboardTiles(entry) {
    const totalSessions = getTotalSessions();
    const statusLabel = { pending: "Pending", accepted: "Active", rejected: "Not accepted", waitlist: "Waitlisted" }[entry.status] || entry.status;
    if (memberSessionsNum) memberSessionsNum.textContent = `${entry.sessionsAttended || 0} / ${totalSessions}`;
    if (memberStatusNum) memberStatusNum.textContent = statusLabel;
  }

  function renderAttendanceHistory(entry) {
    const totalSessions = getTotalSessions();
    const att = entry.attendance || [];
    if (!totalSessions) {
      memberAttendanceRow.innerHTML = `<span class="attendance-empty">No sessions have been logged yet.</span>`;
      return;
    }
    memberAttendanceRow.innerHTML = Array.from({ length: totalSessions }).map((_, i) => {
      const mark = att[i] || null;
      const cls = mark === "P" ? "is-present" : mark === "A" ? "is-absent" : "is-unmarked";
      return `<span class="attendance-pill ${cls}" title="Session ${i + 1}">${mark || "–"}</span>`;
    }).join("");
  }

  function renderAbsenceAlert(entry) {
    const consecutive = (typeof CraftRegistrations !== "undefined") ? CraftRegistrations.trailingAbsences(entry) : 0;
    if (consecutive >= 2) {
      memberAlertSlot.innerHTML = `
        <div class="member-alert-banner">
          ⚠ You've missed ${consecutive} sessions in a row. Per club policy, two consecutive unexcused
          absences can release your seat to the waiting list — reach out to a coordinator if something came up.
        </div>`;
    } else {
      memberAlertSlot.innerHTML = "";
    }
  }

  function showMemberCard(entry) {
    currentEntryId = entry.id;
    form.hidden = true;
    loginEyebrow.textContent = "Signed in";
    loginTitle.textContent = `Welcome, ${(entry.name || "").split(" ")[0] || "member"}.`;
    loginSub.textContent = "Here's your CRAFT membership dashboard.";
    renderMemberCard(entry);
    renderDashboardTiles(entry);
    renderAttendanceHistory(entry);
    renderAbsenceAlert(entry);
    memberCardView.hidden = false;
    document.querySelector(".login-card-wrap").classList.add("is-dashboard");
  }

  function refreshDashboard() {
    if (!currentEntryId || typeof CraftRegistrations === "undefined") return;
    const entry = CraftRegistrations.findById(currentEntryId);
    if (entry) showMemberCard(entry);
  }

  function showLoginForm() {
    currentEntryId = null;
    memberCardView.hidden = true;
    form.hidden = false;
    form.reset();
    status.textContent = "";
    status.classList.remove("success");
    loginEyebrow.textContent = "Member Access";
    loginTitle.textContent = "Welcome back.";
    loginSub.textContent = "Log in to track your registrations, RSVPs, and coordinator tools.";
    document.querySelector(".login-card-wrap").classList.remove("is-dashboard");
  }

  // The registrant's DOB is stored as YYYY-MM-DD (native <input type="date">
  // format). Login expects it typed back as DD-MM-YYYY. Compare by digits
  // only so DD-MM-YYYY / DD/MM/YYYY / DD.MM.YYYY all work the same way.
  function digitsOnly(s) { return (s || "").replace(/\D/g, ""); }
  function dobMatches(storedIsoDob, typedPassword) {
    if (!storedIsoDob) return false;
    const [y, m, d] = storedIsoDob.split("-");
    const expected = `${d}${m}${y}`; // DDMMYYYY
    return digitsOnly(typedPassword) === expected;
  }

  if (form && status) {
    form.addEventListener("submit", e => {
      e.preventDefault();
      if (!form.checkValidity()) {
        status.textContent = "Enter your email and date of birth to continue.";
        status.classList.remove("success");
        return;
      }
      const email = document.getElementById("lemail").value;
      const typedPassword = document.getElementById("lpassword").value;
      const entry = findRegistrationByEmail(email);
      if (!entry) {
        status.textContent = "No CRAFT registration found for that email yet — register first, then log in.";
        status.classList.remove("success");
        return;
      }
      if (!dobMatches(entry.dob, typedPassword)) {
        status.textContent = "That date of birth doesn't match our record for this email. Format: DD-MM-YYYY.";
        status.classList.remove("success");
        return;
      }
      showMemberCard(entry);
    });
  }

  // Members can update their own photo — persisted the same way admin
  // edits are, straight back into the shared registrations store.
  if (memberPhotoInput) {
    memberPhotoInput.addEventListener("change", () => {
      const file = memberPhotoInput.files && memberPhotoInput.files[0];
      if (!file || !currentEntryId) return;
      const reader = new FileReader();
      reader.onload = () => {
        CraftRegistrations.updatePhoto(currentEntryId, reader.result);
        refreshDashboard();
        if (memberPhotoStatus) memberPhotoStatus.textContent = "Photo updated and saved.";
      };
      reader.readAsDataURL(file);
    });
  }

  if (memberLogoutBtn) memberLogoutBtn.addEventListener("click", showLoginForm);

  const forgotLink = document.getElementById("forgotPasswordLink");
  const forgotPanel = document.getElementById("forgotPasswordPanel");
  if (forgotLink && forgotPanel) {
    forgotLink.addEventListener("click", e => {
      e.preventDefault();
      forgotPanel.hidden = !forgotPanel.hidden;
    });
  }
})();
