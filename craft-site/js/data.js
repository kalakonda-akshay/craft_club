/* =========================================================
   CRAFT — Club-wide stats (drives Join section + stats band)
========================================================= */
const CRAFT_CLUB_STATS = {
  activeCap: 100,
  activeFilled: 13,       // update as real registrations come in
  sessionMinutes: 90,
  liveDeployRatio: "1:1",
  totalSessionsConducted: 3, // bumped each time a Build-Along is marked as held
};

/* =========================================================
   CRAFT — Upcoming events
========================================================= */
const CRAFT_EVENTS = {
  featured: {
    category: "Workshop",
    level: "Beginner friendly",
    day: "14", month: "Aug", year: "2026",
    title: "AI Agent Build-Along: Automate Your Notes",
    outcome: "Leave with a working AI workflow.",
    host: "Technical Coordination Team",
    venue: "CSE Seminar Hall, Block C",
    time: "4:00 – 5:30 PM",
    seatsLeft: 37, seatsTotal: 50,
    deadline: "Aug 12, 2026, 11:59 PM",
    countdownTarget: "2026-08-14T16:00:00",
  },
  upcoming: [
    { day: "21", month: "Aug", category: "Clinic", title: "Resume & GitHub Portfolio Clinic",
      desc: "A working session to tighten your resume and pin your best repos.",
      venue: "CSE Lab 2", time: "5:00 PM", seatsLeft: 20 },
    { day: "28", month: "Aug", category: "Meetup", title: "Hackathon Prep Meetup",
      desc: "Team formation and strategy ahead of the next campus hackathon.",
      venue: "Seminar Hall", time: "4:30 PM", seatsLeft: 15 },
  ],
};

/* =========================================================
   CRAFT — Project Showcase (mock — edit freely)
========================================================= */
const CRAFT_PROJECTS = [
  { name: "TaskFlow", category: "Web", desc: "A minimal Kanban board with drag-and-drop and Supabase-backed persistence.", stack: ["React", "Supabase"], student: "Student Name" },
  { name: "CampusBot", category: "AI", desc: "A Gemini-powered FAQ agent trained on department circulars and timetables.", stack: ["Gemini API", "Node.js"], student: "Student Name" },
  { name: "ShipLog", category: "Web", desc: "A changelog generator that turns git commit history into a shareable public page.", stack: ["TypeScript", "Vercel"], student: "Student Name" },
  { name: "GradeLens", category: "Web", desc: "A JWT-authenticated dashboard for tracking personal semester CGPA trends.", stack: ["JWT", "Tailwind"], student: "Student Name" },
];

/* =========================================================
   CRAFT — Tech Radar items (feature + 3 compact items)
========================================================= */
const CRAFT_RADAR = {
  feature: {
    category: "Technology of the Month", name: "Bun 2.0",
    desc: "A faster, all-in-one JavaScript runtime — bundler, test runner, and package manager in a single binary.",
    trend: 92, level: "Intermediate",
    why: "Why it matters: it's fast enough to change how we structure Build-Along starter kits.",
  },
  items: [
    { category: "AI Tool", name: "Gemini 2.0 Flash", desc: "A faster, cheaper Gemini tier — good fit for student-scale agent projects.", trend: 88, level: "Beginner" },
    { category: "Hackathon", name: "Smart India Hackathon 2026", desc: "Registrations open now — team formation happening at the next meetup.", trend: null, level: "All", deadline: "Sep 5" },
    { category: "Certification", name: "AWS Cloud Practitioner", desc: "A solid first cert for anyone touching deployment or cloud infrastructure.", trend: 75, level: "Beginner" },
  ],
};

/* =========================================================
   CRAFT — Announcements (pinned feature + list)
========================================================= */
const CRAFT_ANNOUNCEMENTS = {
  feature: {
    tag: "Coordinator Recruitment",
    title: "Coordinator recruitment is open for this semester",
    desc: "Applications are now open for Technical, PR & Media, and Operations coordinators. Message the WhatsApp number in the Join section to apply.",
    date: "Posted Aug 1, 2026",
    link: "#join",
  },
  items: [
    { tag: "Workshop", title: "Next Build-Along drops Aug 14", desc: "AI Agent workshop — see the Upcoming Events section above for full details.", date: "Jul 28, 2026", link: "#events" },
    { tag: "Deadline", title: "Portfolio clinic registration closes soon", desc: "Registrations close 48 hours before each session — don't wait until the last minute.", date: "Jul 25, 2026", link: "#events" },
    { tag: "Campus", title: "CRAFT is now a recognized CSE department initiative", desc: "Official recognition means lab bookings and faculty sign-off are now fully in place.", date: "Jul 10, 2026", link: "#about" },
  ],
};

/* =========================================================
   CRAFT — Gallery placeholder captions
========================================================= */
const CRAFT_GALLERY = [
  { label: "Workshop", height: 180 },
  { label: "Meeting", height: 240 },
  { label: "Hackathon", height: 150 },
  { label: "Poster", height: 210 },
  { label: "Event highlight", height: 170 },
  { label: "Demo Day", height: 200 },
  { label: "Workshop", height: 160 },
  { label: "Team photo", height: 220 },
];

/* =========================================================
   CRAFT — Member Notes / testimonials
========================================================= */
const CRAFT_TESTIMONIALS = [
  { quote: "I shipped my first deployed project in one session. That alone changed how I see coursework.", name: "Student Name", meta: "2nd Year, CSE" },
  { quote: "The 15-60-15 format keeps things moving. No session ever feels like a wasted evening.", name: "Student Name", meta: "3rd Year, CSE" },
  { quote: "Coordinators actually help you debug live — it's the closest thing to pair programming with a mentor.", name: "Student Name", meta: "1st Year, CSE" },
];

/* =========================================================
   CRAFT — Leadership data
   Edit this file to update names, roles, and details for the
   "03 / Leadership" section. Each object renders as one card.
========================================================= */
const CRAFT_LEADERSHIP = [
  {
    name: "Kalakonda Akshay",
    role: "Founder & Club Lead",
    team: "Leadership",
    intro: "Started CRAFT to close the gap between coursework and what the industry actually hires for.",
    focus: "Club Strategy, Projects & Community",
    skills: ["TypeScript", "AI Agents", "Systems Design"],
    contribution: "Leads CRAFT's vision, technical direction, partnerships, and student initiatives.",
    since: "CRAFT since 2026",
  },
  {
    name: "Name to be added",
    role: "Technical & Mentorship Coordinator",
    team: "Technical",
    intro: "Focused on turning workshop concepts into starter kits members can actually build from.",
    focus: "Workshops, Projects & Resources",
    skills: ["Frontend", "APIs", "Git"],
    contribution: "Helps members learn tools, build projects, and access practical resources.",
    since: "CRAFT since 2026",
  },
  {
    name: "Name to be added",
    role: "Technical & Mentorship Coordinator",
    team: "Technical",
    intro: "Keeps the build-along pipeline running — from local repo to live deployment.",
    focus: "AI, Web & Deployment",
    skills: ["Gemini API", "Vercel", "Supabase"],
    contribution: "Supports build-alongs, project reviews, and technical learning tracks.",
    since: "CRAFT since 2026",
  },
  {
    name: "Name to be added",
    role: "PR & Media Coordinator",
    team: "PR & Media",
    intro: "Handles the day-to-day Instagram presence and campus-facing announcements.",
    focus: "Communication, Posters & Social Media",
    skills: ["Content", "Instagram", "Design"],
    contribution: "Shares CRAFT activities, opportunities, and member work with the campus community.",
    since: "CRAFT since 2026",
  },
  {
    name: "Name to be added",
    role: "PR & Media Coordinator",
    team: "PR & Media",
    intro: "Covers every event live and turns it into a story worth sharing afterward.",
    focus: "Event Coverage & Community Content",
    skills: ["Photography", "Reels", "Copywriting"],
    contribution: "Documents events, manages media, and helps create a visible CRAFT identity.",
    since: "CRAFT since 2026",
  },
  {
    name: "Name to be added",
    role: "Operations & Logistics Coordinator",
    team: "Operations",
    intro: "Makes sure every workshop has a room, a headcount, and a working projector.",
    focus: "Events, Registrations & Coordination",
    skills: ["Logistics", "Scheduling", "Ops"],
    contribution: "Keeps workshops organized through registrations, attendance, logistics, and event support.",
    since: "CRAFT since 2026",
  },
  {
    name: "Name to be added",
    role: "Design Coordinator",
    team: "PR & Media",
    intro: "Shapes how CRAFT looks everywhere — posters, slide decks, and the site itself.",
    focus: "UI/UX, Branding & Visual Design",
    skills: ["Figma", "UI/UX", "Branding"],
    contribution: "Designs posters, presentation decks, and the visual identity behind every CRAFT touchpoint.",
    since: "CRAFT since 2026",
  },
  {
    name: "Name to be added",
    role: "Community & Outreach Coordinator",
    team: "Operations",
    intro: "The first point of contact for new members and campus partnerships.",
    focus: "Member Engagement & Campus Partnerships",
    skills: ["Community", "Outreach", "Onboarding"],
    contribution: "Welcomes new members, runs onboarding, and builds ties with other campus clubs.",
    since: "CRAFT since 2026",
  },
];

/* =========================================================
   CRAFT — Build of the Month (editable via admin-content.html)
========================================================= */
const CRAFT_BUILD_OF_MONTH = {
  name: "NoteSynth — AI Study Notes Aggregator",
  student: "Student Name, 2nd Year CSE",
  desc: "Takes messy lecture notes and turns them into structured, searchable summaries using an LLM pipeline built entirely during a single Build-Along.",
  stack: ["TypeScript", "Gemini API", "Vercel"],
  githubUrl: "#",
  demoUrl: "#",
  whyMatters: "It shipped in one 90-minute session, end to end — proof that CRAFT's method produces real, usable software, not just exercises.",
  image: "", // base64 data URL, or "" for the placeholder
};
