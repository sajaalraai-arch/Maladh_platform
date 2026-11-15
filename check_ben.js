const fs = require('fs');

const files = [
  'js/dashboard.js',
  'js/doctor-dashboard.js',
  'js/admin-dashboard.js',
  'appointments.html',
  'dashboard.html',
  'doctor-dashboard.html',
  'admin-dashboard.html'
];

files.forEach(f => {
  if (!fs.existsSync(f)) return;
  const c = fs.readFileSync(f, 'utf8');
  const lines = c.split('\n');
  lines.forEach((l, idx) => {
    if (l.includes('patientName') || l.includes('beneficiaryName') || l.includes('beneficiary') || l.includes('المستفيد:')) {
      console.log(`${f}:${idx+1}: ${l.trim().slice(0, 120)}`);
    }
  });
});
