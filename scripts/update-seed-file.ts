const fs = require('fs');

const SHIFT_TYPE_IDS = [
  '335afe36-804d-4722-88bf-4066798ffbfb', // Early Day Shift
  'a0bb0dda-bc73-4126-ac66-5d331f0fac27', // Day Shift
  '7d924e7d-fd2f-4a3c-9ed2-0da5f956cfdd', // Swing Shift
  'ebb9a736-caad-443d-81c8-4d3d9f7a4dc1'  // Graveyard
];

const SEED_FILE_PATH = 'supabase/seed.sql';

function updateEmployeeShiftTypes(content: string): string {
  const lines = content.split('\n');
  const updatedLines: string[] = [];
  let employeeCount = 0;
  let inEmployeeSection = false;

  for (let line of lines) {
    // Check if we're in the employees section
    if (line.trim().startsWith('INSERT INTO "public"."employees"')) {
      inEmployeeSection = true;
      updatedLines.push(line);
      continue;
    }

    // Check if we're leaving the employees section
    if (line.includes('-- Data for Name: shifts;')) {
      inEmployeeSection = false;
    }

    if (inEmployeeSection && line.includes("'")) {
      // Split the line by single quotes
      const parts = line.split("'");
      if (parts.length >= 9) {
        // The shift type ID is the 7th single-quoted value
        const newShiftTypeId = SHIFT_TYPE_IDS[employeeCount % SHIFT_TYPE_IDS.length];
        parts[7] = newShiftTypeId;
        line = parts.join("'");
        employeeCount++;
      }
    }

    updatedLines.push(line);
  }

  console.log(`Updated ${employeeCount} employees in the seed file.`);
  console.log('Final distribution:');
  const distribution = SHIFT_TYPE_IDS.reduce((acc, id) => {
    const count = Math.floor(employeeCount / SHIFT_TYPE_IDS.length) + (employeeCount % SHIFT_TYPE_IDS.length > SHIFT_TYPE_IDS.indexOf(id) ? 1 : 0);
    acc[id] = count;
    return acc;
  }, {} as Record<string, number>);

  const shiftNames = {
    [SHIFT_TYPE_IDS[0]]: 'Early Day Shift',
    [SHIFT_TYPE_IDS[1]]: 'Day Shift',
    [SHIFT_TYPE_IDS[2]]: 'Swing Shift',
    [SHIFT_TYPE_IDS[3]]: 'Graveyard'
  };

  Object.entries(distribution).forEach(([id, count]) => {
    console.log(`${shiftNames[id]}: ${count} employees`);
  });

  return updatedLines.join('\n');
}

try {
  const content = fs.readFileSync(SEED_FILE_PATH, 'utf8');
  const updatedContent = updateEmployeeShiftTypes(content);
  fs.writeFileSync(SEED_FILE_PATH, updatedContent);
  console.log('Successfully updated seed file.');
} catch (error) {
  console.error('Error updating seed file:', error);
  process.exit(1);
} 