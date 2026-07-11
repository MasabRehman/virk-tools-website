const fs = require('fs');
const content = fs.readFileSync('2026-07-10-ZAP-Report-.html', 'utf8');
const lines = content.split('\n');

const results = [];
for (let i = 0; i < lines.length; i++) {
    if (lines[i].includes('class="risk-1"') || lines[i].includes('class="risk-2"') || lines[i].includes('class="risk-3"')) {
        let alertName = '';
        for (let j = Math.max(0, i - 3); j <= Math.min(lines.length - 1, i + 3); j++) {
            if (lines[j].includes('<a href="#alert-')) {
                alertName = lines[j].replace(/<[^>]+>/g, '').trim();
                break;
            }
        }
        if (alertName && !results.includes(alertName)) {
            results.push(alertName);
        }
    }
}
console.log(results);
