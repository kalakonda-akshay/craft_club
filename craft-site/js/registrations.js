/* =========================================================
   CRAFT — Registrations store
   A tiny localStorage-backed "database" so the Join form and
   the Admin panel can share data without a real backend yet.
   Swap this out for real API calls once Supabase (or similar)
   is wired up — the function signatures below are the contract
   the rest of the site relies on.
========================================================= */
const CraftRegistrations = (function () {
  const KEY = "craft-registrations-v1";
  const SEQ_KEY = "craft-registrations-seq-v1";

  let memoryCache = null;

  async function syncWithConvex() {
    if (window.convexClient) {
      try {
        const joinRequests = await window.convexClient.query("joinRequests:list");
        const membersList = await window.convexClient.query("members:list");
        const attendanceList = await window.convexClient.query("attendance:listAll");
        
        // Map Convex schema to frontend expected fields
        memoryCache = joinRequests.map(r => {
          const member = membersList.find(m => m.rollNumber === r.rollNumber);
          
          let memberAttendance = [];
          if (member) {
            // Find attendance for this member ID
            const att = attendanceList.filter(a => a.memberId === member._id);
            memberAttendance = att.map(a => a.status === "absent" ? "A" : "P"); 
          }

          return {
            id: r._id,
            memberId: member ? member.memberId : "CRAFT-2026-" + r._id.slice(-4),
            memberDbId: member ? member._id : null,
            name: r.name,
            roll: r.rollNumber,
            email: r.collegeEmail,
            dept: r.department,
            year: r.year === "1" ? "1st Year" : r.year === "2" ? "2nd Year" : r.year === "3" ? "3rd Year" : "4th Year",
            interest: r.reasonToJoin,
            status: r.status === "Approved" ? "accepted" : r.status === "Waitlisted" ? "waitlist" : r.status.toLowerCase(),
            submittedAt: new Date(r.submittedAt).toISOString(),
            photo: member && member.photoUrl ? member.photoUrl : "",
            attendance: memberAttendance,
            sessionsAttended: memberAttendance.filter(a => a === "P").length
          };
        });
        writeAll(memoryCache);
      } catch (e) {
        console.error("Failed to sync with Convex", e);
      }
    }
  }

  function readAll() {
    if (memoryCache !== null) return memoryCache;
    try {
      const raw = localStorage.getItem(KEY);
      return raw ? JSON.parse(raw) : [];
    } catch (e) {
      return [];
    }
  }

  function writeAll(list) {
    try { localStorage.setItem(KEY, JSON.stringify(list)); } catch (e) { /* private mode — ignore */ }
  }

  function nextMemberId() {
    let seq = 1;
    try { seq = parseInt(localStorage.getItem(SEQ_KEY) || "0", 10) + 1; } catch (e) { /* ignore */ }
    try { localStorage.setItem(SEQ_KEY, String(seq)); } catch (e) { /* ignore */ }
    return "CRAFT-2026-" + String(seq).padStart(4, "0");
  }

  async function add(record) {
    const list = readAll();
    const entry = Object.assign({
      id: "reg_" + Date.now() + "_" + Math.random().toString(36).slice(2, 7),
      memberId: nextMemberId(),
      submittedAt: new Date().toISOString(),
      status: "pending", // pending | accepted | rejected | waitlist
      photo: "",         // base64 data URL, or "" for initials fallback
      attendance: [],    // ["P","A","P",...] — one entry per conducted session
      sessionsAttended: 0,
    }, record);
    
    if (window.convexClient) {
      try {
        await window.convexClient.mutation("joinRequests:submit", {
          name: record.name,
          rollNumber: record.roll,
          collegeEmail: record.email,
          department: record.dept,
          year: String(parseInt(record.year, 10) || 1),
          reasonToJoin: record.interest || record.profile || "No reason provided",
          phone: record.phone || "0000000000",
          section: record.section || "A",
        });
      } catch (err) {
        alert("Server Error: " + err.message);
        throw err;
      }
    }

    list.unshift(entry);
    writeAll(list);
    return entry;
  }

  async function updateStatus(id, status) {
    if (window.convexClient) {
      try {
        if (status === "accepted") {
          await window.convexClient.mutation("joinRequests:approve", { id });
        } else if (status === "rejected") {
          await window.convexClient.mutation("joinRequests:reject", { id });
        } else if (status === "waitlist") {
          await window.convexClient.mutation("joinRequests:waitlist", { id });
        }
        await syncWithConvex();
      } catch (err) {
        alert("Server Error: " + err.message);
        throw err;
      }
    } else {
      const list = readAll();
      const idx = list.findIndex(r => r.id === id);
      if (idx === -1) return null;
      list[idx].status = status;
      list[idx].decidedAt = new Date().toISOString();
      writeAll(list);
    }
  }

  function updatePhoto(id, dataUrl) {
    const list = readAll();
    const idx = list.findIndex(r => r.id === id);
    if (idx === -1) return null;
    list[idx].photo = dataUrl;
    writeAll(list);
    return list[idx];
  }

  /* ---------------------------------------------------------
     Attendance — one entry per session conducted so far.
     setAttendance(id, sessionIndex, status) writes/overwrites
     that specific session's mark ("P", "A", or null to clear),
     padding shorter arrays with null as needed, then recomputes
     the sessionsAttended count from the log itself so the two
     never drift out of sync.
  --------------------------------------------------------- */
  function setAttendance(id, sessionIndex, status) {
    const list = readAll();
    const idx = list.findIndex(r => r.id === id);
    if (idx === -1) return null;
    const att = list[idx].attendance || [];
    while (att.length <= sessionIndex) att.push(null);
    att[sessionIndex] = status;
    list[idx].attendance = att;
    list[idx].sessionsAttended = att.filter(a => a === "P").length;
    writeAll(list);
    return list[idx];
  }

  // How many *consecutive* absences sit at the end of the log right
  // now (ignoring any not-yet-marked trailing sessions). Two or more
  // means the constitution's "two consecutive unexcused absences"
  // rule has been triggered.
  function trailingAbsences(entry) {
    const att = (entry && entry.attendance) || [];
    let count = 0;
    for (let i = att.length - 1; i >= 0; i--) {
      const mark = att[i];
      if (mark == null) continue; // skip unmarked/future sessions
      if (mark === "A") { count++; continue; }
      break; // hit a "P" — streak broken
    }
    return count;
  }

  function findById(id) {
    return readAll().find(r => r.id === id) || null;
  }

  function remove(id) {
    writeAll(readAll().filter(r => r.id !== id));
  }

  function clearAll() {
    writeAll([]);
  }

  function seedDemoData() {
    if (readAll().length > 0) return;
    const names = ["Aravind S", "Divya R", "Karthik M", "Priya N", "Rahul V", "Sneha K"];
    const depts = ["CSE A", "CSE B", "CSE C", "AI & DS", "ECE"];
    const interests = ["AI & AI Agents", "Web Development", "UI/UX", "Automation", "Cloud & Deployment", "Hackathons"];
    const statuses = ["pending", "pending", "accepted", "pending", "rejected", "waitlist"];
    const dobs = ["2005-03-14", "2004-11-02", "2005-07-22", "2006-01-30", "2004-09-09", "2005-05-18"];
    const attendanceSamples = [
      [], [], ["P", "P", "P"], [], ["P", "A"], ["P", "A", "A"],
    ];
    names.forEach((name, i) => {
      const entry = add({
        name,
        roll: `NC.SC.U4CSE250${10 + i}`,
        email: name.toLowerCase().replace(" ", ".") + "@college.edu",
        dob: dobs[i],
        year: ["1st Year", "2nd Year", "3rd Year", "4th Year"][i % 4],
        dept: depts[i % depts.length],
        interest: interests[i % interests.length],
        profile: "",
        status: statuses[i],
      });
      const sample = attendanceSamples[i] || [];
      sample.forEach((mark, sessionIndex) => setAttendance(entry.id, sessionIndex, mark));
    });
  }

  return {
    syncWithConvex,
    readAll,
    add,
    updateStatus, updatePhoto,
    setAttendance, trailingAbsences,
    findById, remove, clearAll, seedDemoData,
  };
})();
