/* eslint-disable */

const fs = require('fs');
const path = require('path');

function replaceInDir(dir) {
  if (!fs.existsSync(dir)) return;
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      replaceInDir(fullPath);
    } else if (fullPath.endsWith('.tsx')) {
      let content = fs.readFileSync(fullPath, 'utf8');
      content = content.replace(/\bpy-20\b/g, 'py-8');
      content = content.replace(/\bpy-16\b/g, 'py-6');
      content = content.replace(/\bpy-12\b/g, 'py-4');
      content = content.replace(/\bpy-10\b/g, 'py-4');
      
      content = content.replace(/\bmy-20\b/g, 'my-8');
      content = content.replace(/\bmy-16\b/g, 'my-6');
      content = content.replace(/\bmy-12\b/g, 'my-4');
      content = content.replace(/\bmy-10\b/g, 'my-4');
      
      content = content.replace(/\bmt-20\b/g, 'mt-8');
      content = content.replace(/\bmt-16\b/g, 'mt-6');
      content = content.replace(/\bmt-12\b/g, 'mt-4');
      
      content = content.replace(/\bmb-20\b/g, 'mb-8');
      content = content.replace(/\bmb-16\b/g, 'mb-6');
      content = content.replace(/\bmb-12\b/g, 'mb-4');
      
      content = content.replace(/\bspace-y-12\b/g, 'space-y-6');
      content = content.replace(/\bspace-y-16\b/g, 'space-y-6');
      content = content.replace(/\bspace-y-20\b/g, 'space-y-8');
      content = content.replace(/\bgap-12\b/g, 'gap-6');
      content = content.replace(/\bgap-16\b/g, 'gap-8');
      fs.writeFileSync(fullPath, content);
    }
  }
}
replaceInDir(path.join(__dirname, 'app', '(public)'));
replaceInDir(path.join(__dirname, 'components', 'public'));
console.log('Padding replaced successfully');
