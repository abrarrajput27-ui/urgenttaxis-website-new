const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, 'frontend');

// Helper to walk directory
function walk(dir, done) {
  let results = [];
  fs.readdir(dir, function(err, list) {
    if (err) return done(err);
    let pending = list.length;
    if (!pending) return done(null, results);
    list.forEach(function(file) {
      file = path.join(dir, file);
      fs.stat(file, function(err, stat) {
        if (stat && stat.isDirectory()) {
          walk(file, function(err, res) {
            results = results.concat(res);
            if (!--pending) done(null, results);
          });
        } else {
          if (file.endsWith('.tsx')) {
            results.push(file);
          }
          if (!--pending) done(null, results);
        }
      });
    });
  });
}

function processFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let original = content;

  // We are looking for href={`${SITE_CONFIG.whatsapp}?text=...`} or href={SITE_CONFIG.whatsapp}
  // The user wants: Hello Urgent Taxis! 👋\n\nI would like to... etc.

  // Instead of a perfect regex, we can just do some manual replacements based on the specific pages.
  
  const replacements = [
    // Header & Footer & Contact & Generic
    {
      find: /href={SITE_CONFIG\.whatsapp}/g,
      replace: 'href={`${SITE_CONFIG.whatsapp}?text=Hello%20Urgent%20Taxis!%20%F0%9F%91%8B%0A%0AI%20would%20like%20to%20make%20an%20inquiry.%20%E2%9C%A8`}'
    },
    // PublicFareWidget
    {
      find: /href={`\$\{SITE_CONFIG\.whatsapp\}\?text=Hello%20Urgent%20Taxis%2C%20I%20want%20to%20book%20a%20\$\{fareResult\.serviceType\}%20cab%20for%20Rs\.\$\{fareResult\.customerPayable\}`}/g,
      replace: 'href={`${SITE_CONFIG.whatsapp}?text=Hello%20Urgent%20Taxis!%20%F0%9F%91%8B%0A%0AI%20would%20like%20to%20book%20a%20*${fareResult.serviceType}*%20cab.%20%🚖%0A%F0%9F%92%B0%20*Fare%20Estimate*%3A%20%E2%82%B9${fareResult.customerPayable}%0APlease%20confirm%20my%20booking.`}'
    },
    {
      find: /href={`\$\{SITE_CONFIG\.whatsapp\}\?text=Hello%20Urgent%20Taxis%2C%20I%20need%20a%20fare%20quote`}/g,
      replace: 'href={`${SITE_CONFIG.whatsapp}?text=Hello%20Urgent%20Taxis!%20%F0%9F%91%8B%0A%0AI%20need%20a%20*Fare%20Quote*%20for%20my%20upcoming%20trip.%20%F0%9F%9A%96`}'
    },
    // Routes Detail (app/(public)/routes/[slug]/page.tsx)
    {
      find: /href={`\$\{SITE_CONFIG\.whatsapp\}\?text=Hello%20Urgent%20Taxis%2C%20I%20want%20to%20book%20a%20cab%20from%20\$\{encodeURIComponent\(originName\)\}%20to%20\$\{encodeURIComponent\(destName\)\}`}/g,
      replace: 'href={`${SITE_CONFIG.whatsapp}?text=Hello%20Urgent%20Taxis!%20%F0%9F%91%8B%0A%0AI%20would%20like%20to%20book%20an%20*Outstation%20Cab*.%20%F0%9F%9A%96%0A%F0%9F%93%8D%20*Route*%3A%20${encodeURIComponent(originName)}%20to%20${encodeURIComponent(destName)}%0APlease%20let%20me%20know%20the%20availability.`}'
    },
    // Routes Listing (app/(public)/routes/page.tsx)
    {
      find: /href={`\$\{SITE_CONFIG\.whatsapp\}\?text=Hello%20Urgent%20Taxis%2C%20I%20want%20to%20book%20a%20cab%20from%20\$\{encodeURIComponent\(r\.originName\)\}%20to%20\$\{encodeURIComponent\(r\.destName\)\}`}/g,
      replace: 'href={`${SITE_CONFIG.whatsapp}?text=Hello%20Urgent%20Taxis!%20%F0%9F%91%8B%0A%0AI%20would%20like%20to%20book%20an%20*Outstation%20Cab*.%20%F0%9F%9A%96%0A%F0%9F%93%8D%20*Route*%3A%20${encodeURIComponent(r.originName)}%20to%20${encodeURIComponent(r.destName)}%0APlease%20let%20me%20know%20the%20availability.`}'
    },
    // Tour Packages
    {
      find: /href={`\$\{SITE_CONFIG\.whatsapp\}\?text=Hello%20Urgent%20Taxis%2C%20I%20want%20to%20inquire%20about%20the%20(.+?)%20Tour%20Package.`}/g,
      replace: 'href={`${SITE_CONFIG.whatsapp}?text=Hello%20Urgent%20Taxis!%20%F0%9F%91%8B%0A%0AI%20would%20like%20to%20inquire%20about%20the%20*$1%20Tour%20Package*.%20%F0%9F%8F%94%EF%B8%8F`}'
    },
    {
      find: /href={`\$\{SITE_CONFIG\.whatsapp\}\?text=Hello%20Urgent%20Taxis%2C%20I%20want%20to%20plan%20a%20custom%20tour%20package.`}/g,
      replace: 'href={`${SITE_CONFIG.whatsapp}?text=Hello%20Urgent%20Taxis!%20%F0%9F%91%8B%0A%0AI%20would%20like%20to%20plan%20a%20*Custom%20Tour%20Package*.%20%F0%9F%8F%94%EF%B8%8F`}'
    },
    // Local Rentals
    {
      find: /href={`\$\{SITE_CONFIG\.whatsapp\}\?text=Hello%20Urgent%20Taxis%2C%20I%20want%20to%20book%20a%20local%20rental%20package%3A%20\$\{pkg\.included_hours\}H%2F\$\{pkg\.included_km\}KM`}/g,
      replace: 'href={`${SITE_CONFIG.whatsapp}?text=Hello%20Urgent%20Taxis!%20%F0%9F%91%8B%0A%0AI%20would%20like%20to%20book%20a%20*Local%20Rental%20Cab*.%20%F0%9F%9A%96%0A%E2%8F%B1%EF%B8%8F%20*Package*%3A%20${pkg.included_hours}H%20%2F%20${pkg.included_km}KM`}'
    },
    {
      find: /href={`\$\{SITE_CONFIG\.whatsapp\}\?text=Hello%20Urgent%20Taxis%2C%20I%20want%20to%20book%20the%20\$\{encodeURIComponent\(catName\)\}%20Local%20Rental%20Package%20\(\$\{pkg\.included_hours\}H%2F\$\{pkg\.included_km\}KM\)`}/g,
      replace: 'href={`${SITE_CONFIG.whatsapp}?text=Hello%20Urgent%20Taxis!%20%F0%9F%91%8B%0A%0AI%20would%20like%20to%20book%20a%20*Local%20Rental%20Cab*.%20%F0%9F%9A%96%0A%E2%8F%B1%EF%B8%8F%20*Package*%3A%20${encodeURIComponent(catName)}%20(${pkg.included_hours}H%2F${pkg.included_km}KM)`}'
    },
    // Fleet / Category
    {
      find: /href={`\$\{SITE_CONFIG\.whatsapp\}\?text=Hello%20Urgent%20Taxis%2C%20I%20want%20to%20book%20a%20\$\{encodeURIComponent\(category\.name\)\}%20cab.`}/g,
      replace: 'href={`${SITE_CONFIG.whatsapp}?text=Hello%20Urgent%20Taxis!%20%F0%9F%91%8B%0A%0AI%20would%20like%20to%20book%20a%20*${encodeURIComponent(category.name)}*%20cab.%20%F0%9F%9A%96`}'
    },
    // Specific pages
    {
      find: /href={`\$\{SITE_CONFIG\.whatsapp\}\?text=Hello%20Urgent%20Taxis%2C%20I%20am%20interested%20in%20setting%20up%20a%20corporate%20account.`}/g,
      replace: 'href={`${SITE_CONFIG.whatsapp}?text=Hello%20Urgent%20Taxis!%20%F0%9F%91%8B%0A%0AI%20am%20interested%20in%20setting%20up%20a%20*Corporate%20Account*.%20%F0%9F%8F%A2`}'
    },
    {
      find: /href={`\$\{SITE_CONFIG\.whatsapp\}\?text=Hello%20Urgent%20Taxis%2C%20I%20am%20looking%20to%20book%20a%20cab%20for%20Chardham%20Yatra.`}/g,
      replace: 'href={`${SITE_CONFIG.whatsapp}?text=Hello%20Urgent%20Taxis!%20%F0%9F%99%8F%0A%0AI%20am%20looking%20to%20book%20a%20cab%20for%20*Chardham%20Yatra*.%20%F0%9F%9A%96`}'
    },
    {
      find: /href={`\$\{SITE_CONFIG\.whatsapp\}\?text=Hello%20Urgent%20Taxis%2C%20I%20want%20to%20enquire%20about%20a%20Tempo%20Traveller%20booking.`}/g,
      replace: 'href={`${SITE_CONFIG.whatsapp}?text=Hello%20Urgent%20Taxis!%20%F0%9F%91%8B%0A%0AI%20want%20to%20enquire%20about%20a%20*Tempo%20Traveller*%20booking.%20%F0%9F%9A%90`}'
    },
    {
      find: /href={`\$\{SITE_CONFIG\.whatsapp\}\?text=Hello%20Urgent%20Taxis%2C%20I%20would%20like%20to%20request%20a%20quote%20for%20a%20Bus%20Charter.`}/g,
      replace: 'href={`${SITE_CONFIG.whatsapp}?text=Hello%20Urgent%20Taxis!%20%F0%9F%91%8B%0A%0AI%20would%20like%20to%20request%20a%20quote%20for%20a%20*Bus%20Charter*.%20%F0%9F%9A%8C`}'
    },
    {
      find: /href={`\$\{SITE_CONFIG\.whatsapp\}\?text=Hello%2C%20I%20have%20submitted%20a%20booking%20request%20with%20reference%20\$\{booking\.booking_reference\}\.%20I%20want%20to%20pay%20the%20token%20amount.`}/g,
      replace: 'href={`${SITE_CONFIG.whatsapp}?text=Hello%20Urgent%20Taxis!%20%F0%9F%91%8B%0A%0AI%20have%20submitted%20a%20booking%20request.%0A%F0%9F%93%8B%20*Reference*%3A%20${booking.booking_reference}%0A%0AI%20would%20like%20to%20pay%20the%20*Token%20Amount*.%20%F0%9F%92%B0`}'
    },
    {
      find: /href={`\$\{SITE_CONFIG\.whatsapp\}\?text=Hello%20Urgent%20Taxis%2C%20I%20read%20your%20article%20on%20\$\{encodeURIComponent\(blog\.title\)\}`}/g,
      replace: 'href={`${SITE_CONFIG.whatsapp}?text=Hello%20Urgent%20Taxis!%20%F0%9F%91%8B%0A%0AI%20read%20your%20article%20on%20*${encodeURIComponent(blog.title)}*.%20%F0%9F%93%96`}'
    },
    {
      find: /href={`\$\{SITE_CONFIG\.whatsapp\}\?text=Hello%20Urgent%20Taxis`}/g,
      replace: 'href={`${SITE_CONFIG.whatsapp}?text=Hello%20Urgent%20Taxis!%20%F0%9F%91%8B%0A%0AI%20need%20some%20help%20with%20my%20booking.%20%E2%9C%A8`}'
    }
  ];

  let modified = false;
  replacements.forEach(rep => {
    if (content.match(rep.find)) {
      content = content.replace(rep.find, rep.replace);
      modified = true;
    }
  });

  if (modified && content !== original) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Updated ${filePath}`);
  }
}

walk(srcDir, function(err, results) {
  if (err) throw err;
  results.forEach(processFile);
  console.log('Done updating WhatsApp links.');
});
