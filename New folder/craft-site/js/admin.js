(function () {
  "use strict";

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
     Soft gate (frontend-only demo — not real auth)
     Swap DEMO_USERNAME / DEMO_CODE for the real coordinator
     credentials whenever they're ready — this is the only
     place they need to change.
  --------------------------------------------------------- */
  const GATE_KEY = "craft-admin-gate";
  const DEMO_USERNAME = "admin";
  const DEMO_CODE = "craft2026";

  const gate = document.getElementById("adminGate");
  const dashboard = document.getElementById("adminDashboard");
  const gateForm = document.getElementById("gateForm");
  const gateStatus = document.getElementById("gateStatus");

  function showDashboard() {
    gate.hidden = true;
    dashboard.hidden = false;
    renderAll();
  }

  let alreadyIn = false;
  try { alreadyIn = sessionStorage.getItem(GATE_KEY) === "1"; } catch (e) { /* ignore */ }
  if (alreadyIn) showDashboard();

  gateForm.addEventListener("submit", e => {
    e.preventDefault();
    const user = document.getElementById("gateUsername").value.trim();
    const val = document.getElementById("gatePassword").value.trim();
    if (user === DEMO_USERNAME && val === DEMO_CODE) {
      try { sessionStorage.setItem(GATE_KEY, "1"); } catch (e) { /* ignore */ }
      showDashboard();
    } else {
      gateStatus.textContent = "That username or access code isn't right. Ask the Club Lead for the current one.";
      gateStatus.classList.remove("success");
    }
  });

  document.getElementById("logoutBtn").addEventListener("click", () => {
    try { sessionStorage.removeItem(GATE_KEY); } catch (e) { /* ignore */ }
    location.reload();
  });

  /* ---------------------------------------------------------
     State
  --------------------------------------------------------- */
  let activeFilter = "all";
  let searchTerm = "";

  const FILTERS = [
    { key: "all", label: "All" },
    { key: "pending", label: "Pending" },
    { key: "accepted", label: "Accepted" },
    { key: "waitlist", label: "Waitlist" },
    { key: "rejected", label: "Rejected" },
  ];

  function getCap() {
    const s = (typeof CraftContent !== "undefined") ? CraftContent.getClubStats() : CRAFT_CLUB_STATS;
    return (s && s.activeCap) || 50;
  }
  function getTotalSessions() {
    const s = (typeof CraftContent !== "undefined") ? CraftContent.getClubStats() : CRAFT_CLUB_STATS;
    return (s && s.totalSessionsConducted) || 0;
  }

  /* ---------------------------------------------------------
     Rendering
  --------------------------------------------------------- */
  function renderStats() {
    const all = CraftRegistrations.readAll();
    const cap = getCap();
    const accepted = all.filter(r => r.status === "accepted").length;
    const pending = all.filter(r => r.status === "pending").length;
    const remaining = Math.max(0, cap - accepted);
    const pct = Math.min(100, Math.round((accepted / cap) * 100));
    const totalSessions = getTotalSessions();
    const flagged = all.filter(r => CraftRegistrations.trailingAbsences(r) >= 2).length;

    const stats = [
      { num: all.length, label: "Total applications" },
      { num: pending, label: "Pending review", warn: pending > 0 },
      { num: accepted, label: "Accepted members" },
      { num: `${remaining}`, label: `of ${cap} seats remaining`, bar: pct },
    ];

    document.getElementById("adminStats").innerHTML = stats.map(s => `
      <div class="admin-stat-card${s.warn ? " is-warning" : ""}">
        <span class="admin-stat-num">${s.num}</span>
        <span class="admin-stat-label">${s.label}</span>
        ${s.bar != null ? `<div class="admin-stat-bar"><div class="admin-stat-bar-fill" style="width:${s.bar}%;"></div></div>` : ""}
      </div>
    `).join("") + `
      <div class="admin-stat-card admin-stat-card--sessions">
        <span class="admin-stat-num">${totalSessions}</span>
        <span class="admin-stat-label">Sessions conducted</span>
        <button class="btn btn-outline admin-add-session-btn" id="addSessionBtn" type="button">+ Add session</button>
      </div>
    ` + (flagged > 0 ? `
      <div class="admin-stat-card admin-stat-card--alert">
        <span class="admin-stat-num">${flagged}</span>
        <span class="admin-stat-label">⚠ 2+ consecutive absences</span>
      </div>
    ` : "");

    const addBtn = document.getElementById("addSessionBtn");
    if (addBtn) {
      addBtn.addEventListener("click", () => {
        if (typeof CraftContent === "undefined") return;
        CraftContent.addSession();
        renderAll();
      });
    }
  }

  function renderFilters() {
    const el = document.getElementById("adminFilters");
    el.innerHTML = FILTERS.map(f =>
      `<button class="admin-filter-chip${f.key === activeFilter ? " is-active" : ""}" data-filter="${f.key}">${f.label}</button>`
    ).join("");
    el.querySelectorAll(".admin-filter-chip").forEach(btn => {
      btn.addEventListener("click", () => {
        activeFilter = btn.dataset.filter;
        renderFilters();
        renderTable();
      });
    });
  }

  function fmtDate(iso) {
    try {
      return new Date(iso).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
    } catch (e) { return ""; }
  }

  function fmtDob(isoDob) {
    if (!isoDob) return "";
    const [y, m, d] = isoDob.split("-");
    return `${d}-${m}-${y}`;
  }

  function actionButtons(r) {
    const btns = [];
    if (r.status !== "accepted") btns.push(`<button class="admin-action-btn admin-action-btn--accept" data-action="accepted" data-id="${r.id}">Accept</button>`);
    if (r.status !== "waitlist") btns.push(`<button class="admin-action-btn admin-action-btn--waitlist" data-action="waitlist" data-id="${r.id}">Waitlist</button>`);
    if (r.status !== "rejected") btns.push(`<button class="admin-action-btn admin-action-btn--reject" data-action="rejected" data-id="${r.id}">Reject</button>`);
    return btns.join("");
  }

  function renderTable() {
    let list = CraftRegistrations.readAll();

    if (activeFilter !== "all") list = list.filter(r => r.status === activeFilter);
    if (searchTerm.trim()) {
      const q = searchTerm.trim().toLowerCase();
      list = list.filter(r =>
        (r.name || "").toLowerCase().includes(q) ||
        (r.roll || "").toLowerCase().includes(q) ||
        (r.email || "").toLowerCase().includes(q)
      );
    }

    const body = document.getElementById("adminTableBody");
    const empty = document.getElementById("adminEmpty");

    if (!list.length) {
      body.innerHTML = "";
      empty.hidden = false;
      return;
    }
    empty.hidden = true;

    const totalSessions = getTotalSessions();

    let rowsHtml = "";
    try {
      rowsHtml = list.map(r => {
      const flagged = CraftRegistrations.trailingAbsences(r) >= 2;
      const avatar = r.photo
        ? `<img src="${r.photo}" alt="" class="admin-avatar-img">`
        : `<span class="admin-avatar-fallback">${(r.name || "??").trim().split(/\s+/).map(w => w[0]).slice(0, 2).join("").toUpperCase()}</span>`;
      const att = r.attendance || [];
      const pills = Array.from({ length: totalSessions }).map((_, i) => {
        const mark = att[i] || null;
        const cls = mark === "P" ? "is-present" : mark === "A" ? "is-absent" : "is-unmarked";
        const label = mark || "–";
        return `<button class="attendance-pill ${cls}" data-att-index="${i}" data-id="${r.id}" title="Session ${i + 1}: click to cycle Present / Absent / Unmarked">${label}</button>`;
      }).join("");

      return `
      <tr class="${flagged ? "is-flagged-row" : ""}">
        <td data-label="Applicant">
          <div class="admin-applicant-row">
            <span class="admin-avatar">${avatar}</span>
            <div>
              <div class="admin-applicant-name">${r.name || "—"} ${flagged ? '<span class="absence-flag" title="2+ consecutive absences">⚠</span>' : ""}</div>
              <div class="admin-applicant-meta">${r.roll || "—"} · ${r.email || "—"}</div>
              <div class="admin-applicant-meta">${r.memberId || "—"} ${r.dob ? "· DOB " + fmtDob(r.dob) : ""}</div>
            </div>
          </div>
        </td>
        <td data-label="Department">${r.dept || "—"}</td>
        <td data-label="Year">${r.year || "—"}</td>
        <td data-label="Interest">${r.interest || "—"}</td>
        <td data-label="Attendance">
          <div class="attendance-pill-row">${pills || '<span class="admin-applicant-meta">No sessions yet</span>'}</div>
          <div class="attendance-summary">${r.sessionsAttended || 0} of ${totalSessions} attended</div>
        </td>
        <td data-label="Submitted">${fmtDate(r.submittedAt)}</td>
        <td data-label="Status"><span class="status-badge status-badge--${r.status}">${r.status}</span></td>
        <td data-label="Actions">
          <div class="admin-actions">
            ${actionButtons(r)}
            <button class="admin-action-btn admin-action-btn--idcard" data-idcard="${r.id}">🪪 ID Card</button>
          </div>
        </td>
      </tr>
    `;
      }).join("");
    } catch (err) {
      console.error("CRAFT admin: failed to render one or more rows", err);
      rowsHtml = `<tr><td colspan="8" style="padding:20px; color:#A23A31;">
        Something went wrong rendering the applicant list. Open the browser console for details,
        or click "Clear all" and re-add data if a record got corrupted.
      </td></tr>`;
    }
    body.innerHTML = rowsHtml;

    body.querySelectorAll("[data-action]").forEach(btn => {
      btn.addEventListener("click", () => {
        CraftRegistrations.updateStatus(btn.dataset.id, btn.dataset.action);
        renderAll();
      });
    });

    body.querySelectorAll("[data-att-index]").forEach(btn => {
      btn.addEventListener("click", () => {
        const idx = parseInt(btn.dataset.attIndex, 10);
        const entry = CraftRegistrations.findById(btn.dataset.id);
        const current = (entry.attendance || [])[idx] || null;
        const next = current === null ? "P" : current === "P" ? "A" : null;
        CraftRegistrations.setAttendance(btn.dataset.id, idx, next);
        renderTable();
        renderStats();
      });
    });

    body.querySelectorAll("[data-idcard]").forEach(btn => {
      btn.addEventListener("click", () => openIdCardModal(btn.dataset.idcard));
    });
  }

  /* ---------------------------------------------------------
     ID card modal
  --------------------------------------------------------- */
  function openIdCardModal(regId) {
    const r = CraftRegistrations.findById(regId);
    if (!r) return;
    let modal = document.getElementById("idCardModal");
    if (!modal) {
      modal = document.createElement("div");
      modal.id = "idCardModal";
      modal.className = "idcard-modal-overlay";
      modal.innerHTML = `<div class="idcard-modal-box"><button class="lightbox-close" id="idCardModalClose" aria-label="Close">&times;</button><div id="idCardModalContent"></div></div>`;
      document.body.appendChild(modal);
      modal.addEventListener("click", e => { if (e.target === modal) closeIdCardModal(); });
      document.getElementById("idCardModalClose").addEventListener("click", closeIdCardModal);
      document.addEventListener("keydown", e => { if (e.key === "Escape") closeIdCardModal(); });
    }
    const initials = (r.name || "??").trim().split(/\s+/).map(w => w[0]).slice(0, 2).join("").toUpperCase();
    const photoOrInitials = r.photo ? `<img src="${r.photo}" alt="">` : initials;
    const totalSessions = getTotalSessions();
    const att = r.attendance || [];
    const pillsHtml = Array.from({ length: totalSessions }).map((_, i) => {
      const mark = att[i] || null;
      const cls = mark === "P" ? "is-present" : mark === "A" ? "is-absent" : "is-unmarked";
      return `<span class="attendance-pill ${cls}">${mark || "–"}</span>`;
    }).join("");
    const flagged = CraftRegistrations.trailingAbsences(r) >= 2;
    document.getElementById("idCardModalContent").innerHTML = `
      <div class="id-card">
        <div class="id-card-top">
          <span class="id-card-brand"><span class="brand-mark">&gt;_</span> CRAFT</span>
          <span class="id-card-type">Member ID</span>
        </div>
        <div class="id-card-body">
          <div class="id-card-photo">${photoOrInitials}</div>
          <div class="id-card-info">
            <h3>${r.name || "—"}</h3>
            <p class="id-card-role">${r.dept || "—"} · ${r.year || "—"}</p>
            <dl class="id-card-fields">
              <div><dt>Member ID</dt><dd>${r.memberId || "—"}</dd></div>
              <div><dt>Roll No.</dt><dd>${r.roll || "—"}</dd></div>
              <div><dt>Interest</dt><dd>${r.interest || "—"}</dd></div>
              <div><dt>Status</dt><dd><span class="status-badge status-badge--${r.status}">${r.status}</span></dd></div>
              <div><dt>Sessions attended</dt><dd>${r.sessionsAttended || 0} of ${totalSessions}</dd></div>
            </dl>
          </div>
        </div>
        ${totalSessions ? `<div class="idcard-attendance-row">${pillsHtml}</div>` : ""}
        ${flagged ? `<div class="idcard-alert">⚠ 2+ consecutive absences — seat is at risk per club policy.</div>` : ""}
        <div class="id-card-bottom">
          <span>Issued ${fmtDate(r.submittedAt)}</span>
          <span class="qr-placeholder" title="QR placeholder">▦</span>
        </div>
      </div>`;
    modal.classList.add("is-open");
  }
  function closeIdCardModal() {
    const modal = document.getElementById("idCardModal");
    if (modal) modal.classList.remove("is-open");
  }

  function renderAll() {
    renderStats();
    renderFilters();
    renderTable();
  }

  /* ---------------------------------------------------------
     Toolbar actions: search, seed demo data, export, clear
  --------------------------------------------------------- */
  document.getElementById("adminSearch").addEventListener("input", e => {
    searchTerm = e.target.value;
    renderTable();
  });

  document.getElementById("seedBtn").addEventListener("click", () => {
    CraftRegistrations.seedDemoData();
    renderAll();
  });

  document.getElementById("clearBtn").addEventListener("click", () => {
    if (confirm("Clear every registration? This can't be undone.")) {
      CraftRegistrations.clearAll();
      renderAll();
    }
  });

  document.getElementById("exportBtn").addEventListener("click", () => {
    const list = CraftRegistrations.readAll();
    if (!list.length) { alert("Nothing to export yet."); return; }
    const cols = ["memberId", "name", "roll", "email", "year", "dept", "interest", "profile", "status", "sessionsAttended", "attendanceSummary", "hasPhoto", "flaggedAbsences", "submittedAt"];
    const enriched = list.map(r => Object.assign({}, r, {
      attendanceSummary: (r.attendance || []).map(a => a || "-").join(" "),
      hasPhoto: r.photo ? "yes" : "no",
      flaggedAbsences: CraftRegistrations.trailingAbsences(r) >= 2 ? "yes" : "no",
    }));
    const rows = [cols.join(",")].concat(
      enriched.map(r => cols.map(c => `"${String(r[c] || "").replace(/"/g, '""')}"`).join(","))
    );
    const blob = new Blob([rows.join("\n")], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `craft-registrations-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  });
})();
