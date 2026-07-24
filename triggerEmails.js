const { ConvexHttpClient } = require('convex/browser');
const client = new ConvexHttpClient('http://127.0.0.1:3210');

client.mutation('bulkEmail:sendEventReminder', {
  specificEmails: ['avinashnaidu2131@gmail.com', 'akshaykalakonda9@gmail.com'],
  eventTitle: 'Build AI Agents with CRAFT',
  date: 'This Weekend',
  venue: 'Main Auditorium',
  reportingTime: '9:30 AM',
  sessionTime: '10:00 AM - 4:00 PM'
}).then(res => {
  console.log('Emails queued:', res);
}).catch(console.error);
