const fs = require('fs');

try {
  const content = fs.readFileSync('index.html', 'utf8');

  // Check if expected roles exist
  if (!content.includes('Specialista / člen týmu')) {
    throw new Error('Test Failed: Role Specialista missing from HTML.');
  }

  // Check if expected questions exist (rephrased)
  if (!content.includes('Je něco, co by vám pomohlo cítit větší jistotu')) {
    throw new Error('Test Failed: Rephrased management question missing.');
  }

  if (!content.includes('Je něco, co by vám pomohlo lépe fungovat na home office?')) {
    throw new Error('Test Failed: Rephrased employee question missing.');
  }

  // Check if the old text was removed
  if (content.includes('(Pokud vás nic nenapadá, můžete napsat „není“ nebo „nic“.)')) {
    throw new Error('Test Failed: Hint was not removed as requested.');
  }

  console.log('All tests passed successfully.');
} catch (error) {
  console.error(error.message);
  process.exit(1);
}
