export const masterTemplate = (innerContent: string) => `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    /* Reset & Base */
    body { margin: 0; padding: 20px; font-family: 'Inter', Arial, sans-serif; background-color: #f6f8f9; }
    table { border-spacing: 0; border-collapse: collapse; }
    td { padding: 0; }
    
    /* Colors */
    .bg-navy { background-color: #04162e; }
    .bg-white { background-color: #ffffff; }
    .bg-gold { background-color: #c89637; }
    .bg-light-gold { background-color: #fdfaf4; }
    
    .text-navy { color: #04162e; }
    .text-gold { color: #c89637; }
    .text-white { color: #ffffff; }
    .text-gray { color: #555555; }
    
    /* Layout */
    .container { max-width: 700px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.05); border: 1px solid #e0e0e0; }
    
    /* Header */
    .header { background-color: #04162e; text-align: center; padding: 25px 20px; border-bottom: 4px solid #c89637; }
    .header-logo { font-size: 28px; font-weight: 800; letter-spacing: 2px; color: #c89637; margin: 0; }
    .header-sub { font-size: 10px; font-weight: 600; letter-spacing: 1.5px; color: #a1b0c0; margin: 5px 0 0 0; }
    
    /* Content Padding */
    .content-wrapper { padding: 40px; }
    
    /* Typography */
    h1 { font-size: 28px; margin: 0 0 20px 0; font-weight: 800; text-transform: uppercase; }
    p { font-size: 14px; line-height: 1.6; margin: 0 0 15px 0; color: #333333; }
    .greeting { color: #c89637; font-weight: 600; margin-bottom: 20px; display: block; }
    
    /* Footer */
    .footer { background-color: #04162e; padding: 15px 30px; font-size: 12px; }
    .footer-left { color: white; }
    .footer-right { color: #c89637; font-weight: 600; text-align: right; letter-spacing: 1px; }
    .footer a { color: white; text-decoration: none; }
  </style>
</head>
<body>
  <div class="container">
    <!-- Header -->
    <div class="header">
      <h1 class="header-logo">&lt;/&gt; CRAFT</h1>
      <p class="header-sub">COUNCIL FOR REAL-WORLD APPLICATIONS & FUTURE TECH</p>
    </div>
    
    <!-- Body Content -->
    <div class="content-wrapper">
      ${innerContent}
    </div>

    <!-- Footer -->
    <table width="100%" class="footer">
      <tr>
        <td class="footer-left">
          &#9993; craftclub.ngl@gmail.com &nbsp;&nbsp;|&nbsp;&nbsp; &#9742; +91 9390093424
        </td>
        <td class="footer-right">
          Learn • Build • Deploy • Grow
        </td>
      </tr>
    </table>
  </div>
</body>
</html>
`;

export const templateWelcome = (data: { name: string }) => masterTemplate(`
  <table width="100%">
    <tr>
      <td width="70%">
        <h1 class="text-navy">WELCOME TO<br><span class="text-gold">CRAFT!</span></h1>
      </td>
      <td width="30%" align="right">
        <!-- Icon placeholder -->
        <div style="background-color: #04162e; width: 60px; height: 60px; border-radius: 50%; text-align: center; line-height: 60px; color: #c89637; font-size: 24px; border: 3px solid #c89637;">&#128101;</div>
      </td>
    </tr>
  </table>

  <span class="greeting">Hello ${data.name},</span>
  <p>Thank you for joining <strong>CRAFT</strong> – Council for Real-world Applications & Future Tech.</p>
  <p>We are excited to have you with a community of passionate learners and builders.</p>

  <!-- Quote Box -->
  <div style="background-color: #fdfaf4; border-left: 4px solid #c89637; padding: 20px; margin: 30px 0; border-radius: 4px;">
    <p style="margin: 0; font-weight: 600; color: #04162e; font-size: 15px; font-style: italic;">
      <span style="color: #c89637; font-size: 24px; line-height: 10px;">"</span>
      Great things are built by curious minds who never stop learning.
    </p>
  </div>

  <h3 class="text-navy" style="font-size: 14px; text-transform: uppercase; margin-top: 40px; margin-bottom: 20px; border-bottom: 1px solid #eee; padding-bottom: 10px;">What Happens Next?</h3>
  
  <table width="100%" style="font-size: 12px; color: #555;">
    <tr>
      <td width="25%" valign="top">
        <div style="font-weight: 700; color: #04162e; margin-bottom: 5px;">&#128196; Application Review</div>
        We review your application
      </td>
      <td width="25%" valign="top">
        <div style="font-weight: 700; color: #04162e; margin-bottom: 5px;">&#10004; Membership Approval</div>
        You'll get an email once approved
      </td>
      <td width="25%" valign="top">
        <div style="font-weight: 700; color: #04162e; margin-bottom: 5px;">&#128179; Digital ID Card</div>
        Get your official member ID
      </td>
      <td width="25%" valign="top">
        <div style="font-weight: 700; color: #04162e; margin-bottom: 5px;">&#128640; Start Your Journey</div>
        Explore events, workshops & more
      </td>
    </tr>
  </table>
`);

export const templateApproved = (data: { name: string; memberId: string; role?: string; dept?: string; year?: string; qrCodeUrl: string }) => masterTemplate(`
  <table width="100%" style="margin-bottom: 30px;">
    <tr>
      <td width="75%">
        <h1 class="text-navy">MEMBERSHIP<br><span class="text-gold">APPROVED!</span></h1>
      </td>
      <td width="25%" align="right">
        <div style="background-color: #04162e; width: 60px; height: 60px; border-radius: 50%; text-align: center; line-height: 60px; color: #c89637; font-size: 28px; border: 3px solid #c89637;">&#10004;</div>
      </td>
    </tr>
  </table>

  <span class="greeting">Hello ${data.name},</span>
  <p>Congratulations! Your application has been approved.</p>
  <p>Welcome to the CRAFT family!</p>

  <table width="100%" style="margin-top: 30px;">
    <tr>
      <!-- User Details -->
      <td width="55%" valign="top">
        <table width="100%" style="font-size: 13px; line-height: 2.2;">
          <tr>
            <td width="10%">&#128100;</td>
            <td width="40%" style="color: #666; font-weight: 600; font-size: 11px;">MEMBER ID</td>
            <td width="50%" style="font-weight: 700; color: #04162e;">${data.memberId}</td>
          </tr>
          <tr>
            <td>&#128188;</td>
            <td style="color: #666; font-weight: 600; font-size: 11px;">ROLE</td>
            <td style="font-weight: 700; color: #04162e;">${data.role || "Core Member"}</td>
          </tr>
          <tr>
            <td>&#127970;</td>
            <td style="color: #666; font-weight: 600; font-size: 11px;">DEPARTMENT</td>
            <td style="font-weight: 700; color: #04162e;">${data.dept || "N/A"}</td>
          </tr>
          <tr>
            <td>&#128197;</td>
            <td style="color: #666; font-weight: 600; font-size: 11px;">YEAR</td>
            <td style="font-weight: 700; color: #04162e;">${data.year || "N/A"}</td>
          </tr>
        </table>
      </td>
      <!-- Digital ID Card -->
      <td width="45%" valign="top" align="right">
        <div style="background-color: #04162e; border-radius: 8px; padding: 15px; color: white; width: 220px; text-align: left; position: relative;">
          <div style="font-size: 8px; text-align: center; color: #c89637; font-weight: bold; letter-spacing: 1px; margin-bottom: 10px;">YOUR DIGITAL ID CARD</div>
          <div style="font-weight: 800; color: #c89637; font-size: 20px;">CRAFT</div>
          <div style="font-size: 7px; color: #a1b0c0; letter-spacing: 0.5px; margin-bottom: 15px;">COUNCIL FOR REAL-WORLD<br>APPLICATIONS & FUTURE TECH</div>
          
          <table width="100%">
            <tr>
              <td valign="bottom">
                <div style="font-size: 8px; color: #a1b0c0; text-transform: uppercase;">MEMBER ID</div>
                <div style="font-size: 11px; font-weight: bold; color: white;">${data.memberId}</div>
                <div style="font-size: 8px; color: #c89637; margin-top: 10px;">Learn. Build.<br>Deploy. Grow.</div>
              </td>
              <td align="right" valign="bottom">
                <img src="${data.qrCodeUrl}" alt="QR" width="60" style="border: 2px solid white; border-radius: 4px; background: white;" />
              </td>
            </tr>
          </table>
        </div>
      </td>
    </tr>
  </table>

  <h3 class="text-navy" style="font-size: 12px; text-transform: uppercase; margin-top: 40px; margin-bottom: 15px;">You Can Now</h3>
  <table width="100%" style="font-size: 11px; color: #555; text-align: center;">
    <tr>
      <td>&#128187;<br><br>Access<br>Dashboard</td>
      <td>&#128221;<br><br>Register for<br>Workshops</td>
      <td>&#128187;<br><br>Participate in<br>Projects</td>
      <td>&#127942;<br><br>Join<br>Hackathons</td>
      <td>&#129309;<br><br>Network &<br>Collaborate</td>
    </tr>
  </table>
`);

export const templateUpdate = (data: { name: string }) => masterTemplate(`
  <table width="100%">
    <tr>
      <td width="75%">
        <h1 class="text-navy">APPLICATION<br><span style="color: #c0524a;">UPDATE</span></h1>
      </td>
      <td width="25%" align="right">
        <div style="background-color: #fce8e6; width: 60px; height: 60px; border-radius: 50%; text-align: center; line-height: 60px; color: #c0524a; font-size: 28px;">&#9993;</div>
      </td>
    </tr>
  </table>

  <span class="greeting">Hello ${data.name},</span>
  <p>Thank you for your interest in joining <strong>CRAFT</strong> – Council for Real-world Applications & Future Tech.</p>
  <p>After careful review, we regret to inform you that your application was not selected for the current intake due to limited availability.</p>
  <p>This does not reflect your potential or enthusiasm.</p>

  <div style="margin-top: 30px;">
    <h3 style="font-size: 14px; color: #04162e;">We encourage you to:</h3>
    <ul style="font-size: 13px; color: #555; line-height: 2;">
      <li><span style="color: #c0524a;">&#10004;</span> Attend our open workshops</li>
      <li><span style="color: #c0524a;">&#10004;</span> Build real-world projects</li>
      <li><span style="color: #c0524a;">&#10004;</span> Participate in events</li>
      <li><span style="color: #c0524a;">&#10004;</span> Apply again in the next recruitment cycle</li>
    </ul>
  </div>

  <div style="background-color: #fdfaf4; border-left: 4px solid #c89637; padding: 20px; margin: 30px 0 10px 0; border-radius: 4px;">
    <p style="margin: 0; font-weight: 600; color: #04162e; font-size: 14px; font-style: italic;">
      <span style="color: #c89637; font-size: 24px; line-height: 10px;">"</span>
      Every expert was once a beginner. Keep learning. Keep building.
    </p>
  </div>
`);

export const templateEventConfirmed = (data: { name: string; eventTitle: string; date: string; venue: string; reportingTime: string; sessionTime: string; registrationId: string; qrCodeUrl: string }) => masterTemplate(`
  <table width="100%">
    <tr>
      <td width="75%">
        <h1 class="text-navy">YOUR REGISTRATION IS<br><span class="text-gold">CONFIRMED!</span></h1>
      </td>
      <td width="25%" align="right">
        <div style="background-color: #04162e; width: 60px; height: 60px; border-radius: 50%; text-align: center; line-height: 60px; color: #c89637; font-size: 28px; border: 3px solid #c89637;">&#128197;</div>
      </td>
    </tr>
  </table>

  <span class="greeting">Hello ${data.name},</span>
  <p>Your seat has been successfully reserved for the event.</p>

  <table width="100%" style="margin-top: 30px;">
    <tr>
      <!-- Event Details -->
      <td width="50%" valign="top">
        <table width="100%" style="font-size: 12px; line-height: 2;">
          <tr>
            <td width="15%">&#128197;</td>
            <td width="40%" style="color: #666; font-weight: 600; font-size: 10px;">EVENT</td>
            <td width="45%" style="font-weight: 700; color: #04162e;">${data.eventTitle}</td>
          </tr>
          <tr>
            <td>&#128197;</td>
            <td style="color: #666; font-weight: 600; font-size: 10px;">DATE</td>
            <td style="font-weight: 700; color: #04162e;">${data.date}</td>
          </tr>
          <tr>
            <td>&#128205;</td>
            <td style="color: #666; font-weight: 600; font-size: 10px;">VENUE</td>
            <td style="font-weight: 700; color: #04162e;">${data.venue}</td>
          </tr>
          <tr>
            <td>&#9200;</td>
            <td style="color: #666; font-weight: 600; font-size: 10px;">REPORTING TIME</td>
            <td style="font-weight: 700; color: #04162e;">${data.reportingTime}</td>
          </tr>
          <tr>
            <td>&#8987;</td>
            <td style="color: #666; font-weight: 600; font-size: 10px;">SESSION TIME</td>
            <td style="font-weight: 700; color: #04162e;">${data.sessionTime}</td>
          </tr>
          <tr>
            <td>&#127915;</td>
            <td style="color: #666; font-weight: 600; font-size: 10px;">REGISTRATION ID</td>
            <td style="font-weight: 700; color: #04162e;">${data.registrationId}</td>
          </tr>
        </table>
      </td>
      
      <!-- Bring List -->
      <td width="25%" valign="top" style="border-left: 1px solid #eee; padding-left: 20px;">
        <div style="font-size: 10px; color: #c89637; font-weight: bold; margin-bottom: 10px;">PLEASE BRING</div>
        <div style="font-size: 11px; color: #555; line-height: 2;">
          &#128187; Laptop<br>
          &#128268; Charger<br>
          &#127970; College ID<br>
          &#127760; Internet Access<br>
          &#128167; Water Bottle
        </div>
      </td>
      
      <!-- QR Code -->
      <td width="25%" valign="top" align="center">
        <div style="font-size: 10px; color: #c89637; font-weight: bold; margin-bottom: 10px;">CHECK-IN QR CODE</div>
        <img src="${data.qrCodeUrl}" alt="QR" width="80" style="border: 2px solid #04162e; border-radius: 4px; padding: 5px; margin-bottom: 10px;" />
        <div style="font-size: 9px; color: #666; line-height: 1.4;">Show this QR code<br>during check-in<br>at the venue.</div>
      </td>
    </tr>
  </table>
`);

export const templateEventReminder = (data: { name: string; eventTitle: string; date: string; venue: string; reportingTime: string; sessionTime: string; qrCodeUrl: string }) => masterTemplate(`
  <table width="100%">
    <tr>
      <td width="75%">
        <h1 class="text-navy">EVENT REMINDER<br><span style="font-size: 16px; color: #666; font-weight: 500; letter-spacing: 0;">Your workshop starts tomorrow!</span></h1>
      </td>
      <td width="25%" align="right">
        <div style="background-color: #fdfaf4; width: 60px; height: 60px; border-radius: 50%; text-align: center; line-height: 60px; color: #c89637; font-size: 28px;">&#128276;</div>
      </td>
    </tr>
  </table>

  <span class="greeting">Hello ${data.name},</span>
  <p>This is a friendly reminder for your upcoming workshop.</p>

  <table width="100%" style="margin-top: 30px;">
    <tr>
      <!-- Event Details -->
      <td width="50%" valign="top">
        <table width="100%" style="font-size: 12px; line-height: 2;">
          <tr>
            <td width="15%">&#128197;</td>
            <td width="40%" style="color: #666; font-weight: 600; font-size: 10px;">WORKSHOP</td>
            <td width="45%" style="font-weight: 700; color: #04162e;">${data.eventTitle}</td>
          </tr>
          <tr>
            <td>&#128197;</td>
            <td style="color: #666; font-weight: 600; font-size: 10px;">DATE</td>
            <td style="font-weight: 700; color: #04162e;">${data.date} (Tomorrow)</td>
          </tr>
          <tr>
            <td>&#128205;</td>
            <td style="color: #666; font-weight: 600; font-size: 10px;">VENUE</td>
            <td style="font-weight: 700; color: #04162e;">${data.venue}</td>
          </tr>
          <tr>
            <td>&#9200;</td>
            <td style="color: #666; font-weight: 600; font-size: 10px;">REPORTING TIME</td>
            <td style="font-weight: 700; color: #04162e;">${data.reportingTime}</td>
          </tr>
          <tr>
            <td>&#8987;</td>
            <td style="color: #666; font-weight: 600; font-size: 10px;">SESSION TIME</td>
            <td style="font-weight: 700; color: #04162e;">${data.sessionTime}</td>
          </tr>
        </table>
      </td>
      
      <!-- Bring List -->
      <td width="25%" valign="top" style="border-left: 1px solid #eee; padding-left: 20px;">
        <div style="font-size: 10px; color: #c89637; font-weight: bold; margin-bottom: 10px;">BEFORE YOU ARRIVE</div>
        <div style="font-size: 11px; color: #555; line-height: 2;">
          <span style="color: #27ae60;">&#10004;</span> Bring your laptop<br>
          <span style="color: #27ae60;">&#10004;</span> Carry your college ID<br>
          <span style="color: #27ae60;">&#10004;</span> Reach at least 15 min early<br>
          <span style="color: #27ae60;">&#10004;</span> Show your QR code<br>
        </div>
      </td>
      
      <!-- QR Code -->
      <td width="25%" valign="top" align="center">
        <div style="font-size: 10px; color: #c89637; font-weight: bold; margin-bottom: 10px;">YOUR QR CODE</div>
        <img src="${data.qrCodeUrl}" alt="QR" width="80" style="border: 2px solid #04162e; border-radius: 4px; padding: 5px; margin-bottom: 10px;" />
        <div style="font-size: 9px; color: #666; line-height: 1.4;">Keep this QR code<br>ready for check-in.</div>
      </td>
    </tr>
  </table>
`);

export const templateEventPass = (data: { name: string; eventTitle: string; date: string; venue: string; reportingTime: string; sessionTime: string; seatNo: string; registrationId: string; qrCodeUrl: string }) => masterTemplate(`
  <table width="100%">
    <tr>
      <td width="75%">
        <h1 class="text-navy">CRAFT EVENT PASS<br><span style="font-size: 16px; color: #666; font-weight: 500; letter-spacing: 0;">Present this pass at the venue</span></h1>
      </td>
      <td width="25%" align="right">
        <div style="background-color: #fdfaf4; width: 60px; height: 60px; border-radius: 50%; text-align: center; line-height: 60px; color: #c89637; font-size: 28px;">&#127915;</div>
      </td>
    </tr>
  </table>

  <span class="greeting">Hello ${data.name},</span>
  
  <table width="100%" style="margin-top: 30px;">
    <tr>
      <!-- Event Details -->
      <td width="60%" valign="top">
        <table width="100%" style="font-size: 13px; line-height: 2.2;">
          <tr>
            <td width="15%">&#128197;</td>
            <td width="40%" style="color: #666; font-weight: 600; font-size: 11px;">EVENT</td>
            <td width="45%" style="font-weight: 700; color: #04162e;">${data.eventTitle}</td>
          </tr>
          <tr>
            <td>&#128197;</td>
            <td style="color: #666; font-weight: 600; font-size: 11px;">DATE</td>
            <td style="font-weight: 700; color: #04162e;">${data.date}</td>
          </tr>
          <tr>
            <td>&#128205;</td>
            <td style="color: #666; font-weight: 600; font-size: 11px;">VENUE</td>
            <td style="font-weight: 700; color: #04162e;">${data.venue}</td>
          </tr>
          <tr>
            <td>&#9200;</td>
            <td style="color: #666; font-weight: 600; font-size: 11px;">REPORTING TIME</td>
            <td style="font-weight: 700; color: #04162e;">${data.reportingTime}</td>
          </tr>
          <tr>
            <td>&#8987;</td>
            <td style="color: #666; font-weight: 600; font-size: 11px;">SESSION TIME</td>
            <td style="font-weight: 700; color: #04162e;">${data.sessionTime}</td>
          </tr>
          <tr>
            <td>&#128186;</td>
            <td style="color: #666; font-weight: 600; font-size: 11px;">SEAT NO.</td>
            <td style="font-weight: 700; color: #04162e;">${data.seatNo}</td>
          </tr>
          <tr>
            <td>&#127915;</td>
            <td style="color: #666; font-weight: 600; font-size: 11px;">REGISTRATION ID</td>
            <td style="font-weight: 700; color: #04162e;">${data.registrationId}</td>
          </tr>
        </table>
      </td>
      
      <!-- QR Ticket Box -->
      <td width="40%" valign="top" align="right">
        <div style="background-color: #fdfaf4; border: 1px solid #c89637; border-radius: 8px; padding: 20px; text-align: center;">
          <div style="font-size: 11px; color: #c89637; font-weight: bold; margin-bottom: 15px; letter-spacing: 1px;">CHECK-IN QR CODE</div>
          <img src="${data.qrCodeUrl}" alt="QR" width="120" style="margin-bottom: 15px;" />
          <div style="font-size: 10px; color: #04162e; line-height: 1.4;">Present this QR code<br>at the registration desk.</div>
        </div>
      </td>
    </tr>
  </table>
`);

export const templateCertificate = (data: { name: string; eventTitle: string; certId: string; date: string; downloadLink: string }) => masterTemplate(`
  <table width="100%">
    <tr>
      <td width="75%">
        <h1 class="text-navy">YOUR CERTIFICATE IS<br><span class="text-gold">READY!</span></h1>
      </td>
      <td width="25%" align="right">
        <div style="background-color: #04162e; width: 60px; height: 60px; border-radius: 50%; text-align: center; line-height: 60px; color: white; font-size: 28px;">&#127891;</div>
      </td>
    </tr>
  </table>

  <span class="greeting">Hello ${data.name},</span>
  <p>Congratulations on successfully completing the workshop. Your certificate has been generated.</p>

  <table width="100%" style="margin-top: 30px;">
    <tr>
      <!-- Certificate Details -->
      <td width="60%" valign="top">
        <table width="100%" style="font-size: 12px; line-height: 2;">
          <tr>
            <td width="10%">&#128187;</td>
            <td width="30%" style="color: #666; font-weight: 600; font-size: 10px;">WORKSHOP</td>
            <td width="60%" style="font-weight: 700; color: #04162e;">${data.eventTitle}</td>
          </tr>
          <tr>
            <td>&#128196;</td>
            <td style="color: #666; font-weight: 600; font-size: 10px;">CERTIFICATE ID</td>
            <td style="font-weight: 700; color: #04162e;">${data.certId}</td>
          </tr>
          <tr>
            <td>&#128197;</td>
            <td style="color: #666; font-weight: 600; font-size: 10px;">ISSUE DATE</td>
            <td style="font-weight: 700; color: #04162e;">${data.date}</td>
          </tr>
          <tr>
            <td>&#10004;</td>
            <td style="color: #666; font-weight: 600; font-size: 10px;">PARTICIPATION</td>
            <td style="font-weight: 700; color: #04162e;">Successfully Completed</td>
          </tr>
        </table>
        
        <div style="background-color: #fdfaf4; border-left: 4px solid #c89637; padding: 15px; margin: 20px 0 0 0; border-radius: 4px;">
          <p style="margin: 0; font-weight: 600; color: #04162e; font-size: 12px; font-style: italic;">
            <span style="color: #c89637; font-size: 18px; line-height: 10px;">"</span>
            Learning is not the end. It's just the beginning of building something great.
          </p>
        </div>
      </td>
      
      <!-- Download Box -->
      <td width="40%" valign="top" align="right">
        <div style="background-color: #fdfaf4; padding: 15px; text-align: center; border-radius: 8px;">
          <div style="font-size: 10px; color: #c89637; font-weight: bold; margin-bottom: 10px;">DOWNLOAD YOUR CERTIFICATE</div>
          <div style="background-color: white; border: 4px solid #c89637; padding: 20px; text-align: center; margin-bottom: 15px;">
            <div style="font-size: 10px; font-weight: bold; color: #04162e;">CERTIFICATE</div>
            <div style="font-size: 8px; color: #666;">OF PARTICIPATION</div>
            <div style="color: #c89637; font-size: 16px; margin-top: 10px;">&#127894;</div>
          </div>
          <a href="${data.downloadLink}" style="display: inline-block; background-color: #04162e; color: white; text-decoration: none; font-size: 11px; font-weight: bold; padding: 10px 20px; border-radius: 4px; border-bottom: 3px solid #c89637;">&#11015; DOWNLOAD CERTIFICATE</a>
        </div>
      </td>
    </tr>
  </table>
`);

export const templateWorkshopAnnounce = (data: { name: string; eventTitle: string; date: string; venue: string; duration: string; seats: string; registrationLink: string }) => masterTemplate(`
  <table width="100%">
    <tr>
      <td width="80%">
        <h1 class="text-navy">NEW WORKSHOP<br><span class="text-gold">ANNOUNCEMENT!</span></h1>
      </td>
      <td width="20%" align="right">
        <div style="color: #c89637; font-size: 32px;">&#128227;</div>
      </td>
    </tr>
  </table>

  <p style="font-weight: bold; color: #555; font-size: 13px;">Registrations are now open!</p>
  <span class="greeting">Hello ${data.name},</span>
  <p>Join us for an exciting hands-on workshop.</p>

  <table width="100%" style="margin-top: 20px;">
    <tr>
      <!-- Event Details -->
      <td width="55%" valign="top">
        <table width="100%" style="font-size: 12px; line-height: 2;">
          <tr>
            <td width="15%">&#128187;</td>
            <td width="35%" style="color: #666; font-weight: 600; font-size: 10px;">WORKSHOP</td>
            <td width="50%" style="font-weight: 700; color: #04162e;">${data.eventTitle}</td>
          </tr>
          <tr>
            <td>&#128197;</td>
            <td style="color: #666; font-weight: 600; font-size: 10px;">DATE</td>
            <td style="font-weight: 700; color: #04162e;">${data.date}</td>
          </tr>
          <tr>
            <td>&#128205;</td>
            <td style="color: #666; font-weight: 600; font-size: 10px;">VENUE</td>
            <td style="font-weight: 700; color: #04162e;">${data.venue}</td>
          </tr>
          <tr>
            <td>&#9200;</td>
            <td style="color: #666; font-weight: 600; font-size: 10px;">DURATION</td>
            <td style="font-weight: 700; color: #04162e;">${data.duration}</td>
          </tr>
          <tr>
            <td>&#128186;</td>
            <td style="color: #666; font-weight: 600; font-size: 10px;">SEATS</td>
            <td style="font-weight: 700; color: #04162e;">${data.seats} Only</td>
          </tr>
        </table>
      </td>
      
      <!-- What You Will Learn -->
      <td width="45%" valign="top" style="border-left: 1px solid #eee; padding-left: 20px;">
        <div style="font-size: 10px; color: #c89637; font-weight: bold; margin-bottom: 10px;">WHAT YOU WILL LEARN</div>
        <div style="font-size: 11px; color: #555; line-height: 2.2;">
          <span style="color: #27ae60;">&#10004;</span> Build full-stack application<br>
          <span style="color: #27ae60;">&#10004;</span> Database integration<br>
          <span style="color: #27ae60;">&#10004;</span> Deployment to cloud<br>
          <span style="color: #27ae60;">&#10004;</span> Real-world project
        </div>
      </td>
    </tr>
  </table>
  
  <div style="text-align: right; margin-top: 20px;">
    <a href="${data.registrationLink}" style="display: inline-block; background-color: #c89637; color: white; text-decoration: none; font-size: 12px; font-weight: bold; padding: 12px 30px; border-radius: 4px;">REGISTER NOW &rarr;</a>
  </div>
`);

export const templateWellDone = (data: { name: string }) => masterTemplate(`
  <table width="100%">
    <tr>
      <td width="80%">
        <h1 class="text-navy">WELL DONE!</h1>
      </td>
      <td width="20%" align="right">
        <div style="color: #c89637; font-size: 32px;">&#127942;</div>
      </td>
    </tr>
  </table>

  <span class="greeting">Hello ${data.name},</span>
  <p>Congratulations on successfully completing the workshop.<br>Thank you for your active participation and enthusiasm.</p>

  <table width="100%" style="margin-top: 30px;">
    <tr>
      <!-- Achievement List -->
      <td width="55%" valign="top">
        <div style="background-color: #fdfaf4; padding: 20px; border-radius: 8px;">
          <div style="font-size: 10px; color: #c89637; font-weight: bold; margin-bottom: 15px;">YOUR ACHIEVEMENT</div>
          <div style="font-size: 12px; color: #04162e; line-height: 2.2; font-weight: 500;">
            <span style="color: #27ae60;">&#10004;</span> Workshop Completed<br>
            <span style="color: #27ae60;">&#10004;</span> Attendance Verified<br>
            <span style="color: #27ae60;">&#10004;</span> Certificate Generated<br>
            <span style="color: #27ae60;">&#10004;</span> XP Points Added (Coming Soon)
          </div>
        </div>
      </td>
      
      <!-- Quote -->
      <td width="45%" valign="top" align="center" style="padding-left: 20px;">
        <div style="margin-top: 20px;">
          <p style="margin: 0; font-weight: 600; color: #04162e; font-size: 14px; font-style: italic; line-height: 1.6;">
            <span style="color: #c89637; font-size: 24px; line-height: 10px;">"</span><br>
            The best project you'll ever work on is YOU.
          </p>
        </div>
      </td>
    </tr>
  </table>
`);
