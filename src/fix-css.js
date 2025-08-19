// CSS Fix Script
// This script ensures that CSS is properly loaded and applied
// Run this with: node src/fix-css.js

const fs = require('fs');
const path = require('path');

console.log('🔍 Starting CSS fix process...');

// Force Next.js to regenerate CSS by touching the globals.css file
const globalsCssPath = path.join(__dirname, 'app', 'globals.css');
try {
  const content = fs.readFileSync(globalsCssPath, 'utf8');
  // Add a harmless comment at the end to force recompilation
  const newContent = content.trim() + '\n\n/* Force rebuild: ' + new Date().toISOString() + ' */\n';
  fs.writeFileSync(globalsCssPath, newContent);
  console.log('✅ Updated globals.css to force rebuild');
} catch (error) {
  console.error('❌ Error updating globals.css:', error);
}

// Create a .css-fixed file in .next to signal that CSS was fixed
const nextDir = path.join(__dirname, '..', '.next');
try {
  if (fs.existsSync(nextDir)) {
    fs.writeFileSync(path.join(nextDir, '.css-fixed'), new Date().toISOString());
    console.log('✅ Created CSS fix marker');
  } else {
    console.warn('⚠️ .next directory not found - build the project first');
  }
} catch (error) {
  console.error('❌ Error creating CSS fix marker:', error);
}

console.log('🎉 CSS fix process completed');
console.log('ℹ️ Now run: npm run build && npm run dev');
