(function () {
  "use strict";

  /* ---------------------------------------------------------
     Theme sync (same as admin.js / login.js)
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
     Soft gate — shares the same sessionStorage key as
     admin.html, so signing in once covers both admin pages
     for the rest of the browser session.
  --------------------------------------------------------- */
  const GATE_KEY = "craft-admin-unlocked";
  const DEMO_USERNAME = "AKSHAY";
  const DEMO_CODE = "Ram@6002";
  const gate = document.getElementById("adminGate");
  const dashboard = document.getElementById("adminDashboard");
  const gateForm = document.getElementById("gateForm");
  const gateStatus = document.getElementById("gateStatus");

  let alreadyIn = false;
  try { alreadyIn = sessionStorage.getItem(GATE_KEY) === "1"; } catch (e) { /* ignore */ }
  if (alreadyIn) unlock();

  if (gateForm) {
    gateForm.addEventListener("submit", async e => {
      e.preventDefault();
      const user = document.getElementById("gateUsername").value.trim();
      const val = document.getElementById("gatePassword").value.trim();
      
      gateStatus.textContent = "Authenticating...";
      gateStatus.classList.remove("success");

      try {
        if (!window.convexClient) {
          throw new Error("Database client not loaded. Please refresh.");
        }
        const adminData = await window.convexClient.mutation("admins:login", {
          username: user,
          password: val,
        });

        // Login successful
        try { 
          sessionStorage.setItem(GATE_KEY, "1"); 
          sessionStorage.setItem("craft_admin_role", adminData.role);
          sessionStorage.setItem("craft_admin_name", adminData.name);
        } catch (e) { /* ignore */ }
        
        unlock();
      } catch (err) {
        gateStatus.textContent = err.message || "Login failed. Check credentials.";
        gateStatus.classList.remove("success");
      }
    });
  }
  const logoutBtn = document.getElementById("logoutBtn");
  if (logoutBtn) {
    logoutBtn.addEventListener("click", () => {
      try { 
        sessionStorage.removeItem(GATE_KEY);
        sessionStorage.removeItem("craft_admin_role");
        sessionStorage.removeItem("craft_admin_name");
      } catch (e) { /* ignore */ }
      location.reload();
    });
  }
  function unlock() {
    gate.style.display = "none";
    dashboard.hidden = false;
    initContentManager();
  }

  /* ---------------------------------------------------------
     Tabs
  --------------------------------------------------------- */
  function initTabs() {
    const tabs = document.querySelectorAll(".content-tab");
    tabs.forEach(tab => {
      tab.addEventListener("click", () => {
        tabs.forEach(t => t.classList.remove("is-active"));
        tab.classList.add("is-active");
        document.querySelectorAll(".content-panel").forEach(p => p.classList.remove("is-active"));
        document.getElementById("panel-" + tab.dataset.tab).classList.add("is-active");
      });
    });
  }

  /* ---------------------------------------------------------
     Small field-builder helper
  --------------------------------------------------------- */
  function field(label, key, value, opts) {
    opts = opts || {};
    const type = opts.type || "text";
    const full = opts.full ? " form-row--full" : "";
    const safeVal = (value == null ? "" : String(value)).replace(/"/g, "&quot;");
    if (type === "textarea") {
      return `<div class="form-row${full}"><label>${label}</label><textarea data-field="${key}">${safeVal}</textarea></div>`;
    }
    return `<div class="form-row${full}"><label>${label}</label><input type="${type}" data-field="${key}" value="${safeVal}"></div>`;
  }

  function readFields(container, obj) {
    container.querySelectorAll("[data-field]").forEach(el => {
      obj[el.dataset.field] = el.value;
    });
    return obj;
  }

  /* ---------------------------------------------------------
     Image upload helper — used by Build of Month, Projects,
     and Gallery. Stores the uploaded file as a base64 data URL
     directly on the wrapper element so collect functions can
     read it back out alongside the regular text fields.
  --------------------------------------------------------- */
  function imageUploadField(existingValue) {
    const preview = existingValue
      ? `<img src="${existingValue}" alt="" style="width:100%;height:100%;object-fit:cover;">`
      : "No image";
    return `
      <div class="form-row form-row--full">
        <label>Image</label>
        <div class="content-image-upload" data-image-value="${existingValue || ""}">
          <div class="content-image-preview">${preview}</div>
          <input type="file" accept="image/*" class="content-image-input">
        </div>
      </div>`;
  }

  function wireImageUploads(root) {
    root.querySelectorAll(".content-image-upload").forEach(wrap => {
      const input = wrap.querySelector(".content-image-input");
      const preview = wrap.querySelector(".content-image-preview");
      input.addEventListener("change", () => {
        const file = input.files && input.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = () => {
          wrap.dataset.imageValue = reader.result;
          preview.innerHTML = `<img src="${reader.result}" alt="" style="width:100%;height:100%;object-fit:cover;">`;
        };
        reader.readAsDataURL(file);
      });
    });
  }

  function readImageValue(container) {
    const wrap = container.querySelector(".content-image-upload");
    return wrap ? wrap.dataset.imageValue || "" : "";
  }

  /* ===========================================================
     ANNOUNCEMENTS
  =========================================================== */
  function renderAnnouncements() {
    const data = CraftContent.getAnnouncements();
    const featureForm = document.getElementById("featureAnnouncementForm");
    const list = document.getElementById("announcementList");

    featureForm.innerHTML = `
      <div class="content-card-grid">
        ${field("Tag / category", "tag", data.feature.tag)}
        ${field("Date shown", "date", data.feature.date)}
        ${field("Title", "title", data.feature.title, { full: true })}
        ${field("Description", "desc", data.feature.desc, { type: "textarea", full: true })}
        ${field("Link (e.g. #join, #events)", "link", data.feature.link)}
      </div>`;

    list.innerHTML = data.items.map(item => `
      <div class="content-card" data-id="${item.id}">
        <button type="button" class="content-item-remove" title="Remove">&times;</button>
        <div class="content-card-grid">
          ${field("Tag / category", "tag", item.tag)}
          ${field("Date shown", "date", item.date)}
          ${field("Title", "title", item.title, { full: true })}
          ${field("Description", "desc", item.desc, { type: "textarea", full: true })}
          ${field("Link (e.g. #join, #events)", "link", item.link)}
        </div>
      </div>
    `).join("");

    list.querySelectorAll(".content-item-remove").forEach(btn => {
      btn.addEventListener("click", () => btn.closest(".content-card").remove());
    });
  }

  function collectAnnouncements() {
    const featureForm = document.getElementById("featureAnnouncementForm");
    const feature = readFields(featureForm, {});
    const items = Array.from(document.querySelectorAll("#announcementList .content-card")).map(card => {
      return readFields(card, { id: card.dataset.id });
    });
    return { feature, items };
  }

  function wireAnnouncements() {
    document.getElementById("addAnnouncementBtn").addEventListener("click", () => {
      const list = document.getElementById("announcementList");
      const wrapper = document.createElement("div");
      wrapper.innerHTML = `
        <div class="content-card" data-id="${CraftContent.uid()}">
          <button type="button" class="content-item-remove" title="Remove">&times;</button>
          <div class="content-card-grid">
            ${field("Tag / category", "tag", "New")}
            ${field("Date shown", "date", "")}
            ${field("Title", "title", "", { full: true })}
            ${field("Description", "desc", "", { type: "textarea", full: true })}
            ${field("Link (e.g. #join, #events)", "link", "#")}
          </div>
        </div>`;
      const card = wrapper.firstElementChild;
      card.querySelector(".content-item-remove").addEventListener("click", () => card.remove());
      list.appendChild(card);
      card.scrollIntoView({ behavior: "smooth", block: "center" });
    });

    document.getElementById("saveAnnouncementsBtn").addEventListener("click", () => {
      const data = collectAnnouncements();
      CraftContent.saveAnnouncements(data);
      const status = document.getElementById("announcementsSaveStatus");
      status.textContent = "Saved — refresh the homepage to see it live.";
      status.classList.remove("is-error");
    });

    document.getElementById("resetAnnouncementsBtn").addEventListener("click", () => {
      if (!confirm("Reset announcements to the built-in defaults? This discards your edits.")) return;
      CraftContent.resetAnnouncements();
      renderAnnouncements();
      const status = document.getElementById("announcementsSaveStatus");
      status.textContent = "Reset to defaults.";
      status.classList.remove("is-error");
    });
  }

  /* ===========================================================
     EVENTS
  =========================================================== */
  function toDatetimeLocal(iso) {
    if (!iso) return "";
    // "2026-08-14T16:00:00" -> already compatible with datetime-local
    return iso.slice(0, 16);
  }

  function renderEvents() {
    const data = CraftContent.getEvents();
    const f = data.featured;
    const form = document.getElementById("featuredEventForm");

    form.innerHTML = `
      <div class="content-card-grid">
        ${field("Category", "category", f.category)}
        ${field("Level badge", "level", f.level)}
        ${field("Day", "day", f.day)}
        ${field("Month", "month", f.month)}
        ${field("Year", "year", f.year)}
        ${field("Registration deadline (text shown)", "deadline", f.deadline)}
        ${field("Title", "title", f.title, { full: true })}
        ${field("Outcome line", "outcome", f.outcome, { full: true })}
        ${field("Host / speaker", "host", f.host)}
        ${field("Venue", "venue", f.venue)}
        ${field("Time (text shown)", "time", f.time)}
        ${field("Seats left", "seatsLeft", f.seatsLeft, { type: "number" })}
        ${field("Seats total", "seatsTotal", f.seatsTotal, { type: "number" })}
        ${field("Countdown target (date + time)", "countdownTarget", toDatetimeLocal(f.countdownTarget), { type: "datetime-local", full: true })}
      </div>`;

    const list = document.getElementById("eventList");
    list.innerHTML = data.upcoming.map(ev => `
      <div class="content-card" data-id="${ev.id}">
        <button type="button" class="content-item-remove" title="Remove">&times;</button>
        <div class="content-card-grid">
          ${field("Day", "day", ev.day)}
          ${field("Month", "month", ev.month)}
          ${field("Category", "category", ev.category)}
          ${field("Seats left", "seatsLeft", ev.seatsLeft, { type: "number" })}
          ${field("Title", "title", ev.title, { full: true })}
          ${field("Description", "desc", ev.desc, { type: "textarea", full: true })}
          ${field("Venue", "venue", ev.venue)}
          ${field("Time (text shown)", "time", ev.time)}
        </div>
      </div>
    `).join("");

    list.querySelectorAll(".content-item-remove").forEach(btn => {
      btn.addEventListener("click", () => btn.closest(".content-card").remove());
    });
  }

  function collectEvents() {
    const form = document.getElementById("featuredEventForm");
    const featured = readFields(form, {});
    featured.seatsLeft = parseInt(featured.seatsLeft, 10) || 0;
    featured.seatsTotal = parseInt(featured.seatsTotal, 10) || 0;
    if (featured.countdownTarget && featured.countdownTarget.length === 16) {
      featured.countdownTarget = featured.countdownTarget + ":00";
    }

    const upcoming = Array.from(document.querySelectorAll("#eventList .content-card")).map(card => {
      const obj = readFields(card, { id: card.dataset.id });
      obj.seatsLeft = parseInt(obj.seatsLeft, 10) || 0;
      return obj;
    });
    return { featured, upcoming };
  }

  function wireEvents() {
    document.getElementById("addEventBtn").addEventListener("click", () => {
      const list = document.getElementById("eventList");
      const wrapper = document.createElement("div");
      wrapper.innerHTML = `
        <div class="content-card" data-id="${CraftContent.uid()}">
          <button type="button" class="content-item-remove" title="Remove">&times;</button>
          <div class="content-card-grid">
            ${field("Day", "day", "01")}
            ${field("Month", "month", "Sep")}
            ${field("Category", "category", "Workshop")}
            ${field("Seats left", "seatsLeft", 30, { type: "number" })}
            ${field("Title", "title", "", { full: true })}
            ${field("Description", "desc", "", { type: "textarea", full: true })}
            ${field("Venue", "venue", "")}
            ${field("Time (text shown)", "time", "")}
          </div>
        </div>`;
      const card = wrapper.firstElementChild;
      card.querySelector(".content-item-remove").addEventListener("click", () => card.remove());
      list.appendChild(card);
      card.scrollIntoView({ behavior: "smooth", block: "center" });
    });

    document.getElementById("saveEventsBtn").addEventListener("click", () => {
      const data = collectEvents();
      CraftContent.saveEvents(data);
      const status = document.getElementById("eventsSaveStatus");
      status.textContent = "Saved — refresh the homepage to see it live.";
      status.classList.remove("is-error");
    });

    document.getElementById("resetEventsBtn").addEventListener("click", () => {
      if (!confirm("Reset events to the built-in defaults? This discards your edits.")) return;
      CraftContent.resetEvents();
      renderEvents();
      const status = document.getElementById("eventsSaveStatus");
      status.textContent = "Reset to defaults.";
      status.classList.remove("is-error");
    });
  }

  /* ===========================================================
     BUILD OF THE MONTH
  =========================================================== */
  function renderBuildOfMonth() {
    const b = CraftContent.getBuildOfMonth();
    const form = document.getElementById("buildOfMonthForm");
    form.innerHTML = `
      <div class="content-card-grid">
        ${imageUploadField(b.image)}
        ${field("Project name", "name", b.name, { full: true })}
        ${field("Built by", "student", b.student)}
        ${field("Stack (comma-separated)", "stackText", (b.stack || []).join(", "))}
        ${field("Description", "desc", b.desc, { type: "textarea", full: true })}
        ${field("Why this build matters", "whyMatters", b.whyMatters, { type: "textarea", full: true })}
        ${field("GitHub URL", "githubUrl", b.githubUrl)}
        ${field("Live demo URL", "demoUrl", b.demoUrl)}
      </div>`;
    wireImageUploads(form);
  }

  function wireBuildOfMonth() {
    document.getElementById("saveBuildOfMonthBtn").addEventListener("click", () => {
      const form = document.getElementById("buildOfMonthForm");
      const data = readFields(form, {});
      data.stack = (data.stackText || "").split(",").map(s => s.trim()).filter(Boolean);
      delete data.stackText;
      data.image = readImageValue(form);
      CraftContent.saveBuildOfMonth(data);
      const status = document.getElementById("buildOfMonthSaveStatus");
      status.textContent = "Saved — refresh the homepage to see it live.";
    });
    document.getElementById("resetBuildOfMonthBtn").addEventListener("click", () => {
      if (!confirm("Reset Build of the Month to the built-in default? This discards your edits.")) return;
      CraftContent.resetBuildOfMonth();
      renderBuildOfMonth();
      document.getElementById("buildOfMonthSaveStatus").textContent = "Reset to defaults.";
    });
  }

  /* ===========================================================
     PROJECT SHOWCASE
  =========================================================== */
  function projectCardHtml(p) {
    return `
      <div class="content-card" data-id="${p.id}">
        <button type="button" class="content-item-remove" title="Remove">&times;</button>
        <div class="content-card-grid">
          ${imageUploadField(p.image)}
          ${field("Project name", "name", p.name)}
          ${field("Category", "category", p.category)}
          ${field("Stack (comma-separated)", "stackText", (p.stack || []).join(", "))}
          ${field("Built by", "student", p.student)}
          ${field("Description", "desc", p.desc, { type: "textarea", full: true })}
          ${field("GitHub URL", "githubUrl", p.githubUrl)}
          ${field("Live demo URL", "demoUrl", p.demoUrl)}
        </div>
      </div>`;
  }

  function renderProjects() {
    const list = CraftContent.getProjects();
    const container = document.getElementById("projectList");
    container.innerHTML = list.map(projectCardHtml).join("");
    container.querySelectorAll(".content-item-remove").forEach(btn => {
      btn.addEventListener("click", () => btn.closest(".content-card").remove());
    });
    wireImageUploads(container);
  }

  function collectProjects() {
    return Array.from(document.querySelectorAll("#projectList .content-card")).map(card => {
      const obj = readFields(card, { id: card.dataset.id });
      obj.stack = (obj.stackText || "").split(",").map(s => s.trim()).filter(Boolean);
      delete obj.stackText;
      obj.image = readImageValue(card);
      return obj;
    });
  }

  function wireProjects() {
    document.getElementById("addProjectBtn").addEventListener("click", () => {
      const container = document.getElementById("projectList");
      const wrapper = document.createElement("div");
      wrapper.innerHTML = projectCardHtml({ id: CraftContent.uid(), name: "", category: "Web", stack: [], student: "", desc: "", githubUrl: "#", demoUrl: "#" });
      const card = wrapper.firstElementChild;
      card.querySelector(".content-item-remove").addEventListener("click", () => card.remove());
      container.appendChild(card);
      wireImageUploads(card);
      card.scrollIntoView({ behavior: "smooth", block: "center" });
    });
    document.getElementById("saveProjectsBtn").addEventListener("click", () => {
      CraftContent.saveProjects(collectProjects());
      document.getElementById("projectsSaveStatus").textContent = "Saved — refresh the homepage to see it live.";
    });
    document.getElementById("resetProjectsBtn").addEventListener("click", () => {
      if (!confirm("Reset Project Showcase to the built-in defaults? This discards your edits.")) return;
      CraftContent.resetProjects();
      renderProjects();
      document.getElementById("projectsSaveStatus").textContent = "Reset to defaults.";
    });
  }

  /* ===========================================================
     GALLERY
  =========================================================== */
  function galleryCardHtml(g) {
    return `
      <div class="content-card" data-id="${g.id}">
        <button type="button" class="content-item-remove" title="Remove">&times;</button>
        <div class="content-card-grid">
          ${imageUploadField(g.image)}
          ${field("Caption label", "label", g.label)}
          ${field("Tile height (px)", "height", g.height, { type: "number" })}
        </div>
      </div>`;
  }

  function renderGallery() {
    const list = CraftContent.getGallery();
    const container = document.getElementById("galleryList");
    container.innerHTML = list.map(galleryCardHtml).join("");
    container.querySelectorAll(".content-item-remove").forEach(btn => {
      btn.addEventListener("click", () => btn.closest(".content-card").remove());
    });
    wireImageUploads(container);
  }

  function collectGallery() {
    return Array.from(document.querySelectorAll("#galleryList .content-card")).map(card => {
      const obj = readFields(card, { id: card.dataset.id });
      obj.height = parseInt(obj.height, 10) || 180;
      obj.image = readImageValue(card);
      return obj;
    });
  }

  function wireGallery() {
    document.getElementById("addGalleryBtn").addEventListener("click", () => {
      const container = document.getElementById("galleryList");
      const wrapper = document.createElement("div");
      wrapper.innerHTML = galleryCardHtml({ id: CraftContent.uid(), label: "New photo", height: 200 });
      const card = wrapper.firstElementChild;
      card.querySelector(".content-item-remove").addEventListener("click", () => card.remove());
      container.appendChild(card);
      wireImageUploads(card);
      card.scrollIntoView({ behavior: "smooth", block: "center" });
    });
    document.getElementById("saveGalleryBtn").addEventListener("click", () => {
      CraftContent.saveGallery(collectGallery());
      document.getElementById("gallerySaveStatus").textContent = "Saved — refresh the homepage to see it live.";
    });
    document.getElementById("resetGalleryBtn").addEventListener("click", () => {
      if (!confirm("Reset Gallery to the built-in defaults? This discards your edits.")) return;
      CraftContent.resetGallery();
      renderGallery();
      document.getElementById("gallerySaveStatus").textContent = "Reset to defaults.";
    });
  }

  /* ---------------------------------------------------------
     Bootstrap
  --------------------------------------------------------- */
  function initContentManager() {
    initTabs();
    renderAnnouncements();
    wireAnnouncements();
    renderEvents();
    wireEvents();
    renderBuildOfMonth();
    wireBuildOfMonth();
    renderProjects();
    wireProjects();
    renderGallery();
    wireGallery();
  }
})();
