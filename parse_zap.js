const fs = require('fs');
const content = fs.readFileSync('2026-07-10-ZAP-Report-.html', 'utf8');

// Looking for High/Medium alerts by just printing the lines that contain "High" or "Medium" or "Low" 
// with the surrounding context to understand the table structure
const lines = content.split('\n');
const alerts = new Set();

for(let i=0; i<lines.length; i++) {
   if(lines[i].includes('Risk</span>')) {
       // It's usually something like <tr><td><a href="#alert-1">SQL Injection</a></td><td class="risk-3">High</td>...
       continue;
   }
   if(lines[i].includes('class="risk-')) {
       let alertName = '';
       for(let j=i-5; j<=i+5; j++) {
           if(lines[j] && lines[j].includes('<a href="#alert')) {
               alertName = lines[j].replace(/<[^>]*>?/gm, '').trim();
           }
       }
       if (alertName) alerts.add(alertName);
   }
}

if(alerts.size === 0) {
  // alternative parsing
  const matches = content.match(/<tr.*?>.*?<td.*?>.*?<a href="#alert.*?>(.*?)<\/a>.*?<\/td>.*?<td.*?>.*?<\/td>.*?<\/tr>/gs);
  if(matches) {
     matches.forEach(m => console.log(m.replace(/<[^>]*>?/gm, '').trim().replace(/\s+/g, ' ')));
  }
} else {
  console.log(Array.from(alerts));
}

// Just dump all links that start with #alert
const alertLinks = content.match(/<a href="#alert-[^"]+">(.*?)<\/a>/g);
if(alertLinks) {
   const uniqueAlerts = [...new Set(alertLinks.map(a => a.replace(/<[^>]*>?/gm, '').trim()))];
   console.log("Unique Alerts:", uniqueAlerts);
}
