import fs from 'fs';
import path from 'path';

let violations = 0;

function checkFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');

  // 1. Check for "on request" or "fare on request"
  const requestMatches = content.match(/(fare\s*on\s*request|price\s*on\s*request)/gi);
  if (requestMatches) {
    console.error(`❌ [${filePath}] Found forbidden "on request" pricing: ${requestMatches.join(', ')}`);
    violations++;
  }

  // 2. Check for literal "undefined" rendered to user (exclude typeof ... !== 'undefined')
  const lines = content.split('\n');
  lines.forEach((line, idx) => {
    if (line.includes('undefined') && !line.includes("!== 'undefined'") && !line.includes("=== 'undefined'") && !line.includes('typeof')) {
      if (line.match(/[>"`']\s*undefined\s*[<"`']/i)) {
        console.error(`❌ [${filePath}:${idx + 1}] Found literal "undefined" rendered: ${line.trim()}`);
        violations++;
      }
    }
  });

  // 3. Check for fake strikethrough multiplier 1.15
  if (content.includes('* 1.15') || content.includes('*1.15')) {
    console.error(`❌ [${filePath}] Found forbidden fake strike-through multiplier * 1.15`);
    violations++;
  }

  // 4. Check for double +91
  const doublePlus91 = content.match(/(\+91\s*\+91|\+91\+91|\+91\s*\{SITE_CONFIG\.phone\})/g);
  if (doublePlus91) {
    console.error(`❌ [${filePath}] Found duplicate +91 country code: ${doublePlus91.join(', ')}`);
    violations++;
  }
}

function walkDir(dir) {
  const files = fs.readdirSync(dir);
  for (const f of files) {
    const fullPath = path.join(dir, f);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      if (!f.startsWith('.') && f !== 'node_modules' && f !== '.next' && f !== 'admin') {
        walkDir(fullPath);
      }
    } else if (f.endsWith('.tsx') || f.endsWith('.ts')) {
      checkFile(fullPath);
    }
  }
}

console.log('🔍 Running Urgent Taxis Content & Pricing Integrity Linter...');

// Check public app files and components
walkDir('frontend/app/(public)');
walkDir('frontend/components/public');
walkDir('frontend/lib/faqs');

// Verify permanent designer credit in Footer.tsx
const footerPath = 'frontend/components/public/Footer.tsx';
if (fs.existsSync(footerPath)) {
  const footerContent = fs.readFileSync(footerPath, 'utf8');
  const creditPattern = /Designed by[\s\S]*Mantsha Khan/i;
  const isDesignedByNormal = footerContent.includes('Designed by') && (footerContent.includes('font-normal') || !footerContent.includes('<strong>Designed by'));
  const isMantshaBold = footerContent.includes('Mantsha Khan') && (footerContent.includes('font-bold') || footerContent.includes('<strong>Mantsha Khan'));

  if (!creditPattern.test(footerContent) || !isDesignedByNormal || !isMantshaBold) {
    console.error('❌ [Footer.tsx] Protected designer credit "Designed by Mantsha Khan" was modified or missing!');
    violations++;
  } else {
    console.log('✅ Permanent designer credit "Designed by Mantsha Khan" verified intact.');
  }
}

if (violations > 0) {
  console.error(`\n🚨 Content Linter failed with ${violations} violations.`);
  process.exit(1);
} else {
  console.log('✅ Content & Pricing Integrity Linter passed with 0 violations!\n');
  process.exit(0);
}
