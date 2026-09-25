const fs = require('fs');
const path = require('path');
const os = require('os');
const https = require('https');

async function enableApi() {
  try {
    const tokenPath = path.join(os.homedir(), '.config', 'configstore', 'firebase-tools.json');
    const config = JSON.parse(fs.readFileSync(tokenPath, 'utf8'));
    const token = config.tokens.access_token;
    
    console.log('Enabling Firestore API for hurc2026-prod-db...');
    
    const postData = JSON.stringify({});
    
    const req = https.request({
      hostname: 'serviceusage.googleapis.com',
      path: '/v1/projects/hurc2026-prod-db/services/firestore.googleapis.com:enable',
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData)
      }
    }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        console.log(`Status: ${res.statusCode}`);
        console.log(`Body: ${data}`);
      });
    });
    
    req.on('error', e => console.error(`Problem with request: ${e.message}`));
    req.write(postData);
    req.end();
  } catch (err) {
    console.error('Failed:', err.message);
  }
}

enableApi();
