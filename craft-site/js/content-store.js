/* =========================================================
   CRAFT — Content store (Announcements + Events)

   Same pattern as registrations.js: localStorage-backed,
   seeded from the defaults in js/data.js the first time it's
   used, then fully editable from admin-content.html. The
   public site (render.js) reads through this module instead
   of the raw CRAFT_ANNOUNCEMENTS / CRAFT_EVENTS constants, so
   admin edits show up on the live page immediately.
========================================================= */
const CraftContent = (function () {
  const ANN_KEY = "craft-announcements-v1";
  const EVT_KEY = "craft-events-v1";
  const STATS_KEY = "craft-club-stats-v1";

  function uid() {
    return "id-" + Math.random().toString(36).slice(2, 10) + Date.now().toString(36);
  }

  function readRaw(key) {
    try {
      const raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : null;
    } catch (e) { return null; }
  }
  function writeRaw(key, value) {
    try { localStorage.setItem(key, JSON.stringify(value)); return true; }
    catch (e) { return false; }
  }

  /* ---------------- Club-wide stats ---------------- */
  function getClubStats() {
    let data = readRaw(STATS_KEY);
    if (!data) {
      data = (typeof CRAFT_CLUB_STATS !== "undefined") ? Object.assign({}, CRAFT_CLUB_STATS) : {};
      writeRaw(STATS_KEY, data);
    }
    return data;
  }
  function saveClubStats(data) { writeRaw(STATS_KEY, data); }
  function resetClubStats() {
    const data = (typeof CRAFT_CLUB_STATS !== "undefined") ? Object.assign({}, CRAFT_CLUB_STATS) : {};
    writeRaw(STATS_KEY, data);
    return data;
  }
  // Marks that another Build-Along has been held — bumps the count that
  // members compare their personal "sessions attended" against.
  function addSession() {
    const data = getClubStats();
    data.totalSessionsConducted = (data.totalSessionsConducted || 0) + 1;
    saveClubStats(data);
    return data;
  }
  
  // Removes the last session conducted (decrements the count, min 0)
  function removeSession() {
    const data = getClubStats();
    if ((data.totalSessionsConducted || 0) > 0) {
      data.totalSessionsConducted -= 1;
      saveClubStats(data);
      
      // Also truncate attendance array for all members in local storage
      if (typeof CraftRegistrations !== "undefined") {
        const list = CraftRegistrations.readAll();
        let changed = false;
        list.forEach(r => {
          if (r.attendance && r.attendance.length > data.totalSessionsConducted) {
            r.attendance = r.attendance.slice(0, data.totalSessionsConducted);
            r.sessionsAttended = r.attendance.filter(a => a === "P").length;
            changed = true;
          }
        });
        if (changed) {
          try { localStorage.setItem("craft-registrations-v1", JSON.stringify(list)); }
          catch (e) {}
        }
      }
    }
    return data;
  }

  /* ---------------- Build of the Month ---------------- */
  const BOM_KEY = "craft-build-of-month-v1";
  function getBuildOfMonth() {
    let data = readRaw(BOM_KEY);
    if (!data) {
      data = (typeof CRAFT_BUILD_OF_MONTH !== "undefined") ? Object.assign({}, CRAFT_BUILD_OF_MONTH) : {};
      writeRaw(BOM_KEY, data);
    }
    return data;
  }
  function saveBuildOfMonth(data) { writeRaw(BOM_KEY, data); }
  function resetBuildOfMonth() {
    const data = (typeof CRAFT_BUILD_OF_MONTH !== "undefined") ? Object.assign({}, CRAFT_BUILD_OF_MONTH) : {};
    writeRaw(BOM_KEY, data);
    return data;
  }

  /* ---------------- Project Showcase ---------------- */
  const PROJ_KEY = "craft-projects-v1";
  function getProjects() {
    let data = readRaw(PROJ_KEY);
    if (!data) {
      data = (typeof CRAFT_PROJECTS !== "undefined") ? CRAFT_PROJECTS.map(p => Object.assign({ id: uid() }, p)) : [];
      writeRaw(PROJ_KEY, data);
    }
    return data;
  }
  function saveProjects(data) { writeRaw(PROJ_KEY, data); }
  function resetProjects() {
    const data = (typeof CRAFT_PROJECTS !== "undefined") ? CRAFT_PROJECTS.map(p => Object.assign({ id: uid() }, p)) : [];
    writeRaw(PROJ_KEY, data);
    return data;
  }

  /* ---------------- Gallery ---------------- */
  const GAL_KEY = "craft-gallery-v1";
  function getGallery() {
    let data = readRaw(GAL_KEY);
    if (!data) {
      data = (typeof CRAFT_GALLERY !== "undefined") ? CRAFT_GALLERY.map(g => Object.assign({ id: uid() }, g)) : [];
      writeRaw(GAL_KEY, data);
    }
    return data;
  }
  function saveGallery(data) { writeRaw(GAL_KEY, data); }
  function resetGallery() {
    const data = (typeof CRAFT_GALLERY !== "undefined") ? CRAFT_GALLERY.map(g => Object.assign({ id: uid() }, g)) : [];
    writeRaw(GAL_KEY, data);
    return data;
  }

  /* ---------------- Announcements ---------------- */
  function seedAnnouncements() {
    if (typeof CRAFT_ANNOUNCEMENTS === "undefined") return { feature: null, items: [] };
    const feature = Object.assign({ id: uid() }, CRAFT_ANNOUNCEMENTS.feature);
    const items = CRAFT_ANNOUNCEMENTS.items.map(a => Object.assign({ id: uid() }, a));
    return { feature, items };
  }

  function getAnnouncements() {
    let data = readRaw(ANN_KEY);
    if (!data) { data = seedAnnouncements(); writeRaw(ANN_KEY, data); }
    return data;
  }
  function saveAnnouncements(data) { writeRaw(ANN_KEY, data); }

  function resetAnnouncements() {
    const data = seedAnnouncements();
    writeRaw(ANN_KEY, data);
    return data;
  }

  /* ---------------- Events ---------------- */
  function seedEvents() {
    if (typeof CRAFT_EVENTS === "undefined") return { featured: null, upcoming: [] };
    const featured = Object.assign({ id: uid() }, CRAFT_EVENTS.featured);
    const upcoming = CRAFT_EVENTS.upcoming.map(e => Object.assign({ id: uid() }, e));
    return { featured, upcoming };
  }

  function getEvents() {
    let data = readRaw(EVT_KEY);
    if (!data) { data = seedEvents(); writeRaw(EVT_KEY, data); }
    return data;
  }
  function saveEvents(data) { writeRaw(EVT_KEY, data); }

  function resetEvents() {
    const data = seedEvents();
    writeRaw(EVT_KEY, data);
    return data;
  }

  return {
    getAnnouncements, saveAnnouncements, resetAnnouncements,
    getEvents, saveEvents, resetEvents,
    getClubStats, saveClubStats, resetClubStats, addSession, removeSession,
    getBuildOfMonth, saveBuildOfMonth, resetBuildOfMonth,
    getProjects, saveProjects, resetProjects,
    getGallery, saveGallery, resetGallery,
    uid,
  };
})();
