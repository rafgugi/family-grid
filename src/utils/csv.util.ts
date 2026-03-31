import { Person } from '../family.interface';

// CSV column headers in order (excluding marriages and photo)
const CSV_HEADERS = [
  'id',
  'code',
  'name',
  'sex',
  'birthplace',
  'birthdate',
  'deathdate',
  'phone',
  'email',
  'ig',
  'address',
] as const;

// Fields that should not be updated on import
const IMMUTABLE_FIELDS = ['id'];
const READONLY_FIELDS = ['code'];

// Fields that should be forced as text in spreadsheet apps (prefixed with ')
const FORCE_TEXT_FIELDS = ['code', 'birthdate', 'deathdate', 'phone'];

/**
 * Extract all person IDs from tree topology
 */
export function extractPersonIds(trees: Person[]): string[] {
  const ids = new Set<string>();

  function traverse(person: Person) {
    ids.add(person.id);
    person.marriages.forEach(marriage => {
      ids.add(marriage.spouse.id);
      marriage.children.forEach(child => traverse(child));
    });
  }

  trees.forEach(tree => traverse(tree));
  return Array.from(ids);
}

/**
 * Escape CSV field value with proper quoting
 * @param value Field value to escape
 * @param fieldName Field name (to determine if text forcing is needed)
 */
function escapeCsvField(value: string | undefined, fieldName?: string): string {
  if (value === undefined || value === null) {
    return '';
  }

  const stringValue = String(value);

  // For fields that should be treated as text in spreadsheets (to prevent data loss)
  // Prefix with single quote so Google Sheets/Excel treats them as text
  if (fieldName && FORCE_TEXT_FIELDS.includes(fieldName) && stringValue) {
    // If the field needs quoting for CSV reasons, handle that too
    if (
      stringValue.includes(',') ||
      stringValue.includes('\n') ||
      stringValue.includes('"')
    ) {
      const escaped = stringValue.replace(/"/g, '""');
      return `"'${escaped}"`;
    }
    return `'${stringValue}`;
  }

  // Check if field needs quoting (contains comma, newline, or quote)
  if (
    stringValue.includes(',') ||
    stringValue.includes('\n') ||
    stringValue.includes('"')
  ) {
    // Escape internal quotes by doubling them
    const escaped = stringValue.replace(/"/g, '""');
    return `"${escaped}"`;
  }

  return stringValue;
}

/**
 * Parse CSV string into array of objects
 */
export function parseCsv(content: string): Array<Record<string, string>> {
  const lines: string[] = [];
  let currentLine = '';
  let inQuotes = false;
  let i = 0;

  // Parse CSV with proper quote handling for line boundaries
  // We only track quotes to know when newlines are inside quoted fields
  // We keep the quotes and escaped quotes intact for parseCsvLine to handle
  while (i < content.length) {
    const char = content[i];
    const nextChar = content[i + 1];

    if (char === '"' && inQuotes && nextChar === '"') {
      // Escaped quote inside quotes - keep both quotes for parseCsvLine
      currentLine += '""';
      i += 2;
    } else if (char === '"') {
      // Toggle quote state and keep the quote
      currentLine += char;
      inQuotes = !inQuotes;
      i++;
    } else if (char === '\n' && !inQuotes) {
      // End of line
      if (currentLine.trim()) {
        lines.push(currentLine);
      }
      currentLine = '';
      i++;
    } else if (char === '\r' && !inQuotes) {
      // Skip carriage return
      i++;
    } else {
      currentLine += char;
      i++;
    }
  }

  // Add last line if exists
  if (currentLine.trim()) {
    lines.push(currentLine);
  }

  if (lines.length === 0) {
    return [];
  }

  const headers = parseCsvLine(lines[0]);
  const result: Array<Record<string, string>> = [];
  for (let i = 1; i < lines.length; i++) {
    const values = parseCsvLine(lines[i]);
    const row: Record<string, string> = {};

    headers.forEach((header, index) => {
      row[header] = values[index] || '';
    });

    result.push(row);
  }

  return result;
}

/**
 * Parse a single CSV line into fields
 */
function parseCsvLine(line: string): string[] {
  const fields: string[] = [];
  let currentField = '';
  let inQuotes = false;
  let i = 0;

  while (i < line.length) {
    const char = line[i];
    const nextChar = line[i + 1];

    if (char === '"' && inQuotes && nextChar === '"') {
      // Escaped quote inside quotes - add one quote to field and skip both
      currentField += '"';
      i += 2; // Skip both quotes
    } else if (char === '"') {
      // Toggle quote state (don't add quote to field)
      inQuotes = !inQuotes;
      i++;
    } else if (char === ',' && !inQuotes) {
      // End of field
      fields.push(currentField);
      currentField = '';
      i++;
    } else {
      currentField += char;
      i++;
    }
  }

  // Add last field
  fields.push(currentField);

  return fields;
}

/**
 * Export tree data to CSV string
 */
export function exportTreeToCsv(trees: Person[]): string {
  const personIds = extractPersonIds(trees);

  // Build people map
  const peopleMap = new Map<string, Person>();
  function collectPeople(person: Person) {
    peopleMap.set(person.id, person);
    person.marriages.forEach(marriage => {
      peopleMap.set(marriage.spouse.id, marriage.spouse);
      marriage.children.forEach(child => collectPeople(child));
    });
  }
  trees.forEach(tree => collectPeople(tree));

  const headerRow = CSV_HEADERS.join(',');
  const dataRows = personIds
    .map(id => {
      const person = peopleMap.get(id);
      if (!person) {
        return '';
      }

      const values = CSV_HEADERS.map(header => {
        const value = person[header as keyof Person];
        return escapeCsvField(value as string, header);
      });

      return values.join(',');
    })
    .filter(row => row); // Filter out empty rows

  return [headerRow, ...dataRows].join('\n');
}

/**
 * Import CSV data into tree structure
 * Updates matching people, ignores missing/excess IDs
 * Returns updated trees and count of updated people
 */
export function importCsvToTree(
  csvContent: string,
  trees: Person[]
): {
  trees: Person[];
  updatedCount: number;
} {
  const csvData = parseCsv(csvContent);
  if (csvData.length === 0) {
    return { trees, updatedCount: 0 };
  }

  const headers = Object.keys(csvData[0]);

  // Build map of CSV rows by ID
  const updateMap = new Map<string, Record<string, string>>();
  csvData.forEach(row => {
    if (row.id) {
      updateMap.set(row.id, row);
    }
  });

  let updatedCount = 0;

  // Apply updates to tree (recursive deep copy with updates)
  function updatePerson(person: Person): Person {
    const csvRow = updateMap.get(person.id);
    const updated = { ...person };

    if (csvRow) {
      // Update only fields present in CSV headers
      headers.forEach(header => {
        if (
          !IMMUTABLE_FIELDS.includes(header) &&
          !READONLY_FIELDS.includes(header) &&
          header !== 'marriages'
        ) {
          let value = csvRow[header] || '';

          // Strip leading single quote if present (used to force text format in spreadsheets)
          if (value.startsWith("'")) {
            value = value.substring(1);
          }

          // Update field with cleaned value
          (updated as any)[header] = value;
        }
      });
      updatedCount++;
    }

    // Recursively update marriages and children
    updated.marriages = person.marriages.map(marriage => ({
      spouse: updatePerson(marriage.spouse),
      children: marriage.children.map(child => updatePerson(child)),
    }));

    return updated;
  }

  const updatedTrees = trees.map(tree => updatePerson(tree));
  return {
    trees: updatedTrees,
    updatedCount,
  };
}
