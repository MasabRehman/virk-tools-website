const fs = require('fs');
const content = fs.readFileSync('2026-07-10-ZAP-Report-.html', 'utf8');
const text = content.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ');
fs.writeFileSync('zap_plain.txt', text);
