const fs = require('fs');
const path = require('path');
const https = require('https');

const locations = [
  'Haridwar',
  'Dehradun',
  'Ramnagar,_Uttarakhand',
  'Rishikesh',
  'Nainital',
  'Mussoorie',
  'Jaipur',
  'Shimla'
];

const destDir = path.join(__dirname, 'frontend', 'public', 'destinations');

if (!fs.existsSync(destDir)){
    fs.mkdirSync(destDir, { recursive: true });
}

async function downloadImage(url, filename) {
  return new Promise((resolve, reject) => {
    https.get(url, { headers: { 'User-Agent': 'UrgentTaxisBot/1.0 (info@urgenttaxis.com)' } }, (res) => {
      if (res.statusCode === 301 || res.statusCode === 302) {
        return downloadImage(res.headers.location, filename).then(resolve).catch(reject);
      }
      const file = fs.createWriteStream(filename);
      res.pipe(file);
      file.on('finish', () => {
        file.close();
        resolve();
      });
    }).on('error', (err) => {
      fs.unlink(filename, () => {});
      reject(err);
    });
  });
}

async function fetchWikiImage(location) {
  return new Promise((resolve, reject) => {
    const apiUrl = `https://en.wikipedia.org/api/rest_v1/page/summary/${location}`;
    https.get(apiUrl, { headers: { 'User-Agent': 'UrgentTaxisBot/1.0' } }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          if (json.originalimage && json.originalimage.source) {
            resolve(json.originalimage.source);
          } else if (json.thumbnail && json.thumbnail.source) {
            resolve(json.thumbnail.source);
          } else {
            resolve(null);
          }
        } catch (e) {
          resolve(null);
        }
      });
    }).on('error', reject);
  });
}

async function main() {
  for (const loc of locations) {
    console.log(`Fetching image for ${loc}...`);
    try {
      const imgUrl = await fetchWikiImage(loc);
      if (imgUrl) {
        const ext = imgUrl.split('.').pop().toLowerCase() || 'jpg';
        const cleanExt = ext.split('?')[0]; 
        const filename = path.join(destDir, `${loc.replace(',_Uttarakhand', '').toLowerCase()}.${cleanExt}`);
        await downloadImage(imgUrl, filename);
        console.log(`Saved ${filename}`);
      } else {
        console.log(`No image found for ${loc}`);
      }
    } catch (err) {
      console.error(`Failed to download ${loc}:`, err);
    }
  }
}

main();
