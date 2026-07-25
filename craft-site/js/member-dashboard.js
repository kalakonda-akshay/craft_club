document.addEventListener("DOMContentLoaded", async () => {
  // Check session
  const sessionStr = sessionStorage.getItem("craft-member");
  if (!sessionStr) {
    window.location.href = "member-login.html";
    return;
  }

  const session = JSON.parse(sessionStr);

  // Logout handler
  document.getElementById("logoutBtn").addEventListener("click", () => {
    sessionStorage.removeItem("craft-member");
    window.location.href = "member-login.html";
  });

  // Fetch dashboard data
  if (!window.convexClient) {
    console.error("Convex client not loaded");
    return;
  }

  try {
    const data = await window.convexClient.query("memberDashboard:getDashboardData", {
      memberId: session._id
    });

    populateDashboard(data);
    document.getElementById("dashboardContent").style.display = "grid";
  } catch (err) {
    console.error("Failed to load dashboard:", err);
    alert("Error loading dashboard data.");
  }

  // PDF Generation
  document.getElementById("downloadIdBtn").addEventListener("click", () => {
    const cardEl = document.querySelector(".id-card-inner");
    // Temporarily remove hover flip effect for rendering
    cardEl.style.transform = "none";
    cardEl.style.transition = "none";
    
    // Create a printable version (just the front and back stacked)
    const printWrap = document.createElement("div");
    printWrap.style.width = "400px";
    printWrap.style.padding = "20px";
    printWrap.style.background = "#111";
    printWrap.style.color = "#fff";
    printWrap.style.borderRadius = "16px";
    
    const frontClone = document.querySelector(".id-card-front").cloneNode(true);
    frontClone.style.position = "static";
    frontClone.style.marginBottom = "20px";
    
    const backClone = document.querySelector(".id-card-back").cloneNode(true);
    backClone.style.position = "static";
    backClone.style.transform = "none";

    printWrap.appendChild(frontClone);
    printWrap.appendChild(backClone);

    const opt = {
      margin: 0.5,
      filename: `CRAFT_ID_${session.memberId}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true },
      jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' }
    };

    html2pdf().set(opt).from(printWrap).save().then(() => {
      // Restore styles
      cardEl.style.transform = "";
      cardEl.style.transition = "transform 0.8s";
    });
  });
});

function populateDashboard(data) {
  const m = data.member;
  
  // Nav
  document.getElementById("navMemberName").textContent = `Welcome, ${m.name.split(" ")[0]}`;

  // Profile
  document.getElementById("profileName").textContent = m.name;
  document.getElementById("profileRoll").textContent = m.rollNumber;
  document.getElementById("profileDept").textContent = `${m.department} - Year ${m.year}`;
  document.getElementById("profileStatus").textContent = m.status.charAt(0).toUpperCase() + m.status.slice(1);
  if (m.profilePhotoStorageId) {
    // Ideally resolve this to a URL, but for now we'll leave placeholder or real URL if stored
    // document.getElementById("profileAvatar").src = ...
  }

  // ID Card
  document.getElementById("cardName").textContent = m.name;
  document.getElementById("cardRoll").textContent = m.rollNumber;
  document.getElementById("cardId").textContent = m.memberId;
  const qrUrl = `https://quickchart.io/qr?size=250&text=${encodeURIComponent(m.memberId)}`;
  document.getElementById("cardQrCode").src = qrUrl;

  // Stats
  document.getElementById("statAttendance").textContent = `${data.stats.attendancePercentage}%`;
  document.getElementById("statEvents").textContent = data.stats.eventsAttended;
  document.getElementById("statCertificates").textContent = data.stats.certificatesEarned;
  document.getElementById("statSkills").textContent = `Lvl ${data.stats.skillsLevel}`;

  // Upcoming Events
  const eventsContainer = document.getElementById("upcomingEventsList");
  if (data.upcomingEvents.length === 0) {
    eventsContainer.innerHTML = `<p style="color: var(--text-muted); font-size: 14px;">No upcoming events currently scheduled.</p>`;
  } else {
    eventsContainer.innerHTML = data.upcomingEvents.map(e => `
      <div class="list-item">
        <div>
          <div class="list-item-title">${e.title}</div>
          <div class="list-item-meta">${new Date(e.eventDate).toLocaleDateString()} at ${e.venue}</div>
        </div>
      </div>
    `).join("");
  }

  // Certificates
  const certsContainer = document.getElementById("certificatesList");
  if (data.recentCertificates.length === 0) {
    certsContainer.innerHTML = `<p style="color: var(--text-muted); font-size: 14px;">You haven't earned any certificates yet. Attend more events!</p>`;
  } else {
    certsContainer.innerHTML = data.recentCertificates.map(c => `
      <div class="list-item">
        <div>
          <div class="list-item-title">${c.certificateType || "Certificate"}</div>
          <div class="list-item-meta">Code: ${c.verificationCode}</div>
        </div>
        <button class="btn btn-outline" style="padding: 5px 10px; font-size: 12px;">View</button>
      </div>
    `).join("");
  }
}

  // --- DELETION REQUEST LOGIC ---
  if (data.member) {
    const m = data.member;
    const nameInput = document.getElementById("delName");
    const idInput = document.getElementById("delMemberId");
    const deptInput = document.getElementById("delDept");
    if (nameInput) nameInput.value = m.name || "";
    if (idInput) idInput.value = m.memberId || "";
    if (deptInput) deptInput.value = m.department || "";
  }

  const deletionForm = document.getElementById("deletionRequestForm");
  if (deletionForm) {
    deletionForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      const reason = document.getElementById("delReason").value;
      const comments = document.getElementById("delComments").value;
      const ack = document.getElementById("delAcknowledge").checked;
      
      if (!reason || !ack) return;
      
      const submitBtn = document.getElementById("delSubmitBtn");
      const submitText = document.getElementById("delSubmitText");
      
      submitBtn.disabled = true;
      submitText.textContent = "Submitting...";
      
      try {
        await window.convexClient.mutation("deletionRequests:submitRequest", {
          convexMemberId: session._id,
          reason: reason,
          comments: comments
        });
        
        alert("Your deletion request has been submitted successfully. The leadership team will review it shortly.");
        deletionForm.reset();
        if (data.member) {
          document.getElementById("delName").value = data.member.name;
          document.getElementById("delMemberId").value = data.member.memberId;
          document.getElementById("delDept").value = data.member.department;
        }
      } catch (err) {
        console.error(err);
        alert("Failed to submit request. Please try again later.");
      } finally {
        submitBtn.disabled = false;
        submitText.textContent = "Submit Deletion Request";
      }
    });
  }
  // -----------------------------
