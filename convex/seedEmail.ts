import { mutation } from "./_generated/server";

const htmlContent = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body { margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f4f4f4; }
    .container { max-width: 600px; margin: 0 auto; background-color: #fdfdfd; padding: 20px; color: #333; }
    
    /* Header */
    .header { background-color: #04162e; color: white; padding: 20px; border-bottom: 4px solid #c89637; text-align: center; }
    .header h1 { margin: 0; color: #c89637; font-size: 28px; letter-spacing: 2px; }
    .header p { margin: 5px 0 0 0; font-size: 10px; letter-spacing: 1px; color: #a1b0c0; text-transform: uppercase; }
    
    /* Title */
    .title-section { padding: 30px 20px 10px 20px; }
    .title-section h2 { font-size: 32px; margin: 0; color: #04162e; text-transform: uppercase; }
    .title-section .highlight { background-color: #c89637; color: white; padding: 0 10px; border-radius: 4px; display: inline-block; }
    
    /* Main Content */
    .content { padding: 20px; font-size: 15px; line-height: 1.6; }
    .content h3 { color: #c89637; font-size: 18px; margin-top: 0; }
    
    /* Quote Box */
    .quote-box { background-color: #fdf5e6; border-left: 4px solid #c89637; border-radius: 8px; padding: 20px; margin: 20px 0; display: flex; align-items: center; }
    .quote-box .icon { font-size: 30px; color: #c89637; margin-right: 15px; font-family: serif; }
    .quote-box p { margin: 0; font-weight: 600; color: #04162e; }

    /* Next Steps */
    .steps-card { background-color: #f8f9fa; border: 1px solid #eaeaea; border-radius: 8px; overflow: hidden; margin-bottom: 20px; }
    .steps-header { background-color: #04162e; color: #c89637; padding: 15px; text-align: center; font-weight: bold; letter-spacing: 1px; }
    .steps-body { padding: 20px; }
    .step-item { margin-bottom: 15px; }
    .step-item strong { color: #04162e; display: block; }
    .step-item p { margin: 5px 0 0 0; font-size: 13px; color: #555; }

    /* Features Grid */
    .features-header { text-align: center; margin: 30px 0 20px 0; }
    .features-header span { background-color: #04162e; color: #c89637; padding: 5px 15px; border-radius: 4px; font-size: 12px; font-weight: bold; }
    .features-grid { text-align: center; font-size: 13px; margin-bottom: 30px; }
    .feature { margin-bottom: 15px; }
    .feature h4 { margin: 10px 0 5px 0; color: #04162e; text-transform: uppercase; }
    .feature p { margin: 0; color: #666; font-size: 12px; }
    
    /* Footer */
    .footer { background-color: #04162e; color: white; text-align: center; padding: 20px; margin-top: 20px; border-radius: 8px 8px 0 0; }
    .footer a { color: white; text-decoration: none; margin: 0 10px; font-size: 13px; }
    .help-section { background-color: #fdf5e6; padding: 20px; text-align: center; border-radius: 8px; margin-top: -5px; }
    .help-section p { margin: 5px 0; font-size: 14px; }
    .help-section h4 { color: #c89637; margin: 0 0 10px 0; text-transform: uppercase; }
    .signature { font-family: 'Brush Script MT', cursive, serif; font-size: 24px; color: #04162e; margin-top: 15px; }
    .footer-bottom { background-color: #020a16; color: #c89637; text-align: center; padding: 15px; font-size: 12px; }
  </style>
</head>
<body>
  <div class="container">
    <!-- Header -->
    <div class="header">
      <h1>&lt;/&gt; CRAFT</h1>
      <p>Council for Real-World Applications & Future Tech</p>
    </div>

    <!-- Title -->
    <div class="title-section">
      <h2>THANK YOU<br>for joining <span class="highlight">CRAFT!</span></h2>
    </div>

    <!-- Content -->
    <div class="content">
      <h3>Hello {{name}},</h3>
      <p>We are excited to welcome you to <strong>CRAFT</strong> &mdash; Council for Real-world Applications & Future Tech.</p>
      <p>Your registration has been successfully received. You are one step closer to learning, building, and growing with a community of passionate builders.</p>
      <p>Our leadership team will review your application. You will be notified soon about your membership status and next steps.</p>
      
      <div class="quote-box">
        <div class="icon">&ldquo;</div>
        <p>Great things are built by curious minds who never stop learning.</p>
      </div>
    </div>

    <!-- Next Steps -->
    <div class="steps-card">
      <div class="steps-header">WHAT HAPPENS NEXT?</div>
      <div class="steps-body">
        <div class="step-item">
          <strong>1. APPLICATION REVIEW</strong>
          <p>Our team will review your application carefully.</p>
        </div>
        <div class="step-item">
          <strong>2. CONFIRMATION</strong>
          <p>You will receive an email once your application is approved.</p>
        </div>
        <div class="step-item">
          <strong>3. WELCOME ABOARD</strong>
          <p>Get access to workshops, resources, events and your member ID.</p>
        </div>
        <div class="step-item">
          <strong>4. START YOUR JOURNEY</strong>
          <p>Learn, build, collaborate and showcase your ideas with CRAFT.</p>
        </div>
      </div>
    </div>

    <!-- About CRAFT Features -->
    <div class="features-header">
      <span>ABOUT CRAFT</span>
    </div>
    <div class="features-grid">
      <table width="100%" cellpadding="0" cellspacing="0">
        <tr>
          <td width="50%" valign="top" class="feature">
            <h4>💡 LEARN</h4>
            <p>Workshops, build-alongs and resources to help you grow.</p>
          </td>
          <td width="50%" valign="top" class="feature">
            <h4>&lt;/&gt; BUILD</h4>
            <p>Create real-world projects and strengthen your portfolio.</p>
          </td>
        </tr>
        <tr><td height="20"></td></tr>
        <tr>
          <td width="50%" valign="top" class="feature">
            <h4>🚀 DEPLOY</h4>
            <p>Deploy your ideas and make an impact with real solutions.</p>
          </td>
          <td width="50%" valign="top" class="feature">
            <h4>🤝 COLLABORATE</h4>
            <p>Learn and grow with a community of passionate and supportive peers.</p>
          </td>
        </tr>
      </table>
    </div>

    <!-- Footer Links -->
    <div class="footer">
      <a href="#">Website</a> | <a href="#">Instagram</a> | <a href="#">LinkedIn</a> | <a href="#">GitHub</a>
    </div>
    
    <div class="help-section">
      <h4>Need Help?</h4>
      <p>For any queries, feel free to reach out to us.</p>
      <p>✉️ craftclub.ngl@gmail.com</p>
      <div class="signature">We can't wait to see what you will build!</div>
    </div>
    
    <div class="footer-bottom">
      &lt;/&gt; TEAM CRAFT<br>
      <span style="color:#fff;">Learn. Build. Deploy. Grow.</span>
    </div>

  </div>
</body>
</html>
`;

export default mutation({
  handler: async (ctx) => {
    try {
      // Get the first admin
      const admin = await ctx.db.query("admins").first();
      if (!admin) {
        throw new Error("No admins found! Run seed first.");
      }

      // Check if the template already exists
      const existing = await ctx.db
        .query("emailTemplates")
        .filter((q) => q.eq(q.field("title"), "Join Request Received"))
        .first();

      if (existing) {
        await ctx.db.patch(existing._id, {
          subject: "Thank You for Joining CRAFT! 🚀",
          htmlContent: htmlContent,
          updatedAt: Date.now(),
        });
      } else {
        await ctx.db.insert("emailTemplates", {
          title: "Join Request Received",
          subject: "Thank You for Joining CRAFT! 🚀",
          htmlContent: htmlContent,
          createdBy: admin._id,
          createdAt: Date.now(),
          updatedAt: Date.now(),
        });
      }

      // ============================================
      // TEMPLATE 2: Join Request Approved (WITH QR)
      // ============================================
      const approvedHtml = `
<!DOCTYPE html>
<html lang="en">
<head>
  <style>
    body { font-family: Arial, sans-serif; background-color: #f4f4f4; margin: 0; padding: 20px; }
    .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; padding: 30px; border-radius: 8px; text-align: center; }
    .header { color: #04162e; margin-bottom: 20px; }
    .qr-box { margin: 30px 0; padding: 20px; border: 2px dashed #c89637; display: inline-block; border-radius: 12px; }
    .qr-box img { max-width: 200px; }
    .footer { margin-top: 30px; font-size: 12px; color: #888; }
  </style>
</head>
<body>
  <div class="container">
    <h2 class="header">Welcome to CRAFT, {{name}}! 🎉</h2>
    <p>Your join request has been <strong>approved</strong>. We are thrilled to have you onboard.</p>
    <p>Your official Member ID is: <strong>{{memberId}}</strong></p>
    
    <div class="qr-box">
      <p style="margin-top: 0; font-weight: bold; color: #04162e;">YOUR EVENT PASS</p>
      <img src="{{qrCodeUrl}}" alt="Member QR Code" />
      <p style="margin-bottom: 0; font-size: 13px; color: #666;">Scan this code at club events for check-in.</p>
    </div>

    <p>We look forward to seeing you at our next session!</p>
    <div class="footer">&lt;/&gt; TEAM CRAFT</div>
  </div>
</body>
</html>`;

      const existingApproved = await ctx.db
        .query("emailTemplates")
        .filter((q) => q.eq(q.field("title"), "Join Request Approved"))
        .first();

      if (existingApproved) {
        await ctx.db.patch(existingApproved._id, {
          subject: "You're In! Welcome to CRAFT 🚀",
          htmlContent: approvedHtml,
          updatedAt: Date.now(),
        });
      } else {
        await ctx.db.insert("emailTemplates", {
          title: "Join Request Approved",
          subject: "You're In! Welcome to CRAFT 🚀",
          htmlContent: approvedHtml,
          createdBy: admin._id,
          createdAt: Date.now(),
          updatedAt: Date.now(),
        });
      }

      return "Templates updated/inserted successfully!";
    } catch (err) {
      console.error(err);
      throw err;
    }
  },
});
