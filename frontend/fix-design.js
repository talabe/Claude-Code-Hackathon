import { readFileSync, writeFileSync } from 'fs';
import { join } from 'path';

const componentsPath = './src/components';
const files = ['Dashboard.jsx', 'Upload.jsx', 'Processing.jsx', 'FollowUp.jsx', 'Results.jsx'];

const replacements = [
  // Fonts
  [/font-\['IBM_Plex_Mono'\]/g, 'font-mono'],
  [/font-\['Montserrat'\]/g, 'font-sans'],

  // Colors - Text
  [/text-\[#111\]/g, 'text-heading'],
  [/text-\[#222\]/g, 'text-neutral-dark'],
  [/text-\[#ceced0\]/g, 'text-neutral-light'],
  [/text-\[#000\]/g, 'text-black'],

  // Colors - Background
  [/bg-\[#c7e565\]/g, 'bg-primary'],
  [/hover:bg-\[#90BC00\]/g, 'hover:bg-primaryDark'],
  [/bg-\[#f5f5f5\]/g, 'bg-background-light'],
  [/bg-\[#F8FAFC\]/g, 'bg-background-light'],

  // Colors - Border
  [/border-\[#eaeaea\]/g, 'border-border'],

  // Focus rings
  [/focus:ring-\[#c7e565\]/g, 'focus:ring-primary'],
];

files.forEach(file => {
  const filePath = join(componentsPath, file);
  try {
    let content = readFileSync(filePath, 'utf8');

    replacements.forEach(([pattern, replacement]) => {
      content = content.replace(pattern, replacement);
    });

    writeFileSync(filePath, content, 'utf8');
    console.log(`✓ Fixed ${file}`);
  } catch (error) {
    console.error(`✗ Error fixing ${file}:`, error.message);
  }
});

console.log('\n✓ All components updated with correct Tailwind classes!');
