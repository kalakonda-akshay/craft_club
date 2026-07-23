const { ConvexHttpClient } = require('convex/browser');
const client = new ConvexHttpClient("http://127.0.0.1:3210");

async function test() {
  try {
    console.log("Submitting mutation...");
    await client.mutation("joinRequests:submit", {
      name: "Test User",
      rollNumber: "CB.EN.U4CSE21001",
      collegeEmail: "test@cb.students.amrita.edu",
      department: "CSE",
      year: "3",
      reasonToJoin: "Testing frontend",
      phone: "9876543210",
      section: "A",
    });
    console.log("Mutation succeeded!");
    
    console.log("Querying list...");
    const list = await client.query("joinRequests:list");
    console.log("Found:", list.length);
  } catch (err) {
    console.error("Failed:", err.message);
  }
}
test();
