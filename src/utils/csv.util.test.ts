import { Person } from '../family.interface';
import {
  exportTreeToCsv,
  parseCsv,
  importCsvToTree,
  extractPersonIds,
} from './csv.util';

const samplePerson: Person = {
  id: 'john',
  code: '1',
  name: 'John Doe',
  sex: 'M',
  birthplace: 'New York',
  birthdate: '1980-01-15',
  deathdate: '',
  phone: '+1234567890',
  email: 'john@example.com',
  ig: '@johndoe',
  address: '123 Main St',
  photo: 'https://example.com/photo.jpg',
  marriages: [],
};

const sampleTreeSimple: Person[] = [
  {
    id: 'parent1',
    code: '1',
    name: 'Parent One',
    sex: 'M',
    birthplace: 'City A',
    birthdate: '1950-01-01',
    phone: '1111111111',
    marriages: [
      {
        spouse: {
          id: 'parent2',
          code: '1.1',
          name: 'Parent Two',
          sex: 'F',
          marriages: [],
        },
        children: [
          {
            id: 'child1',
            code: '1.01',
            name: 'Child One',
            sex: 'M',
            birthdate: '1980-01-01',
            marriages: [],
          },
        ],
      },
    ],
  },
];

describe('extractPersonIds', () => {
  it('should extract all person IDs from simple tree', () => {
    const ids = extractPersonIds(sampleTreeSimple);
    expect(ids).toContain('parent1');
    expect(ids).toContain('parent2');
    expect(ids).toContain('child1');
    expect(ids.length).toBe(3);
  });

  it('should extract IDs from multiple trees', () => {
    const trees: Person[] = [
      {
        id: 'tree1',
        code: '1',
        marriages: [],
      },
      {
        id: 'tree2',
        code: '2',
        marriages: [],
      },
    ];
    const ids = extractPersonIds(trees);
    expect(ids).toContain('tree1');
    expect(ids).toContain('tree2');
    expect(ids.length).toBe(2);
  });

  it('should handle empty tree array', () => {
    const ids = extractPersonIds([]);
    expect(ids.length).toBe(0);
  });
});

describe('exportTreeToCsv', () => {
  it('should export all fields except photo', () => {
    const csv = exportTreeToCsv([samplePerson]);

    expect(csv).toContain(
      'id,code,name,sex,birthplace,birthdate,deathdate,phone,email,ig,address'
    );
    expect(csv).toContain('john');
    expect(csv).toContain('John Doe');
    expect(csv).toContain('M');
    expect(csv).toContain('New York');
    expect(csv).toContain('+1234567890');
    expect(csv).toContain('john@example.com');
    expect(csv).toContain('@johndoe');
    expect(csv).not.toContain('photo');
    expect(csv).not.toContain('https://example.com/photo.jpg');
  });

  it('should export with correct column count for missing fields', () => {
    const personWithBlanks: Person = {
      id: 'jane',
      code: '2',
      sex: 'F',
      marriages: [],
    };
    const csv = exportTreeToCsv([personWithBlanks]);

    const lines = csv.split('\n');
    expect(lines[1].split(',').length).toBe(11);
    expect(csv).toContain('jane');
    expect(csv).toContain('2');
  });

  it('should prefix text-forced fields with single quote', () => {
    const personWithTextFields: Person = {
      id: 'test',
      code: '1.201',
      birthdate: '2000-01-01',
      deathdate: '2020-12-31',
      phone: '08512345678',
      marriages: [],
    };
    const csv = exportTreeToCsv([personWithTextFields]);

    expect(csv).toContain("'1.201");
    expect(csv).toContain("'2000-01-01");
    expect(csv).toContain("'2020-12-31");
    expect(csv).toContain("'08512345678");
  });

  it('should not export photos (base64 or URL)', () => {
    const personWithBase64: Person = {
      id: 'dave',
      code: '6',
      photo: 'data:image/jpeg;base64,/9j/4AAQSkZJRg==',
      marriages: [],
    };
    const personWithUrl: Person = {
      id: 'eve',
      code: '7',
      photo: 'https://example.com/photo.jpg',
      marriages: [],
    };

    const csv1 = exportTreeToCsv([personWithBase64]);
    expect(csv1).not.toContain('photo');
    expect(csv1).not.toContain('data:image/jpeg;base64');

    const csv2 = exportTreeToCsv([personWithUrl]);
    expect(csv2).not.toContain('photo');
    expect(csv2).not.toContain('https://example.com/photo.jpg');
  });

  it('should quote and escape special characters', () => {
    const personWithSpecialChars: Person = {
      id: 'special',
      code: '3',
      name: 'Charlie "Chuck" Brown',
      address: '123 Main St\nApt 4B\nNew York, NY 10001',
      marriages: [],
    };
    const csv = exportTreeToCsv([personWithSpecialChars]);

    expect(csv).toContain('"123 Main St\nApt 4B\nNew York, NY 10001"');
    expect(csv).toContain('"Charlie ""Chuck"" Brown"');
  });

  it('should export complex tree with multiple people', () => {
    const csv = exportTreeToCsv(sampleTreeSimple);
    const lines = csv.split('\n');

    expect(lines.length).toBe(4);
    expect(csv).toContain('parent1');
    expect(csv).toContain('parent2');
    expect(csv).toContain('child1');
  });
});

describe('parseCsv', () => {
  describe('with simple CSV', () => {
    const csv = 'id,name,sex\njohn,John Doe,M\njane,Jane Doe,F';
    let result: Array<Record<string, string>>;

    beforeEach(() => {
      result = parseCsv(csv);
    });

    it('should parse all rows correctly', () => {
      expect(result.length).toBe(2);
      expect(result[0].id).toBe('john');
      expect(result[0].name).toBe('John Doe');
      expect(result[0].sex).toBe('M');
      expect(result[1].id).toBe('jane');
    });
  });

  describe('with special characters', () => {
    it('should parse quoted multi-line fields', () => {
      const csv = 'id,address\njohn,"123 Main St\nApt 4B"';
      const result = parseCsv(csv);

      expect(result.length).toBe(1);
      expect(result[0].address).toBe('123 Main St\nApt 4B');
    });

    it('should parse escaped quotes', () => {
      const csv = 'id,name\ncharlie,"Charlie ""Chuck"" Brown"';
      const result = parseCsv(csv);

      expect(result.length).toBe(1);
      expect(result[0].name).toBe('Charlie "Chuck" Brown');
    });
  });

  describe('with empty fields', () => {
    const csv = 'id,name,phone\njohn,,1234567890';
    let result: Array<Record<string, string>>;

    beforeEach(() => {
      result = parseCsv(csv);
    });

    it('should handle empty middle field', () => {
      expect(result.length).toBe(1);
      expect(result[0].id).toBe('john');
      expect(result[0].name).toBe('');
      expect(result[0].phone).toBe('1234567890');
    });
  });

  it('should handle empty CSV', () => {
    const result = parseCsv('');
    expect(result.length).toBe(0);
  });

  it('should handle CSV with only headers', () => {
    const result = parseCsv('id,name,sex');
    expect(result.length).toBe(0);
  });
});

describe('importCsvToTree', () => {
  describe('with valid CSV', () => {
    const csv =
      'id,name,phone\nparent1,Updated Parent,9999999999\nparent2,Updated Spouse,8888888888\nchild1,Updated Child,7777777777';
    let result: ReturnType<typeof importCsvToTree>;

    beforeEach(() => {
      result = importCsvToTree(csv, sampleTreeSimple);
    });

    it('should update all people correctly', () => {
      expect(result.updatedCount).toBe(3);
      expect(result.trees[0].name).toBe('Updated Parent');
      expect(result.trees[0].phone).toBe('9999999999');
      expect(result.trees[0].marriages[0].spouse.name).toBe('Updated Spouse');
      expect(result.trees[0].marriages[0].children[0].name).toBe(
        'Updated Child'
      );
    });
  });

  describe('with partial column updates', () => {
    const csv = 'id,phone\nparent1,9999999999\nparent2,\nchild1,';
    let result: ReturnType<typeof importCsvToTree>;

    beforeEach(() => {
      result = importCsvToTree(csv, sampleTreeSimple);
    });

    it('should update only specified columns', () => {
      expect(result.trees[0].phone).toBe('9999999999');
      expect(result.trees[0].name).toBe('Parent One');
    });
  });

  describe('with blank cells', () => {
    const csv = 'id,name,phone\nparent1,Parent One,\nparent2,,\nchild1,,';
    let result: ReturnType<typeof importCsvToTree>;

    beforeEach(() => {
      result = importCsvToTree(csv, sampleTreeSimple);
    });

    it('should clear blank fields', () => {
      expect(result.trees[0].phone).toBe('');
    });
  });

  describe('with readonly fields', () => {
    const csv =
      'id,code,name\nparent1,999,Updated Name\nparent2,888,\nchild1,777,';
    let result: ReturnType<typeof importCsvToTree>;

    beforeEach(() => {
      result = importCsvToTree(csv, sampleTreeSimple);
    });

    it('should ignore code but update other fields', () => {
      expect(result.trees[0].code).toBe('1');
      expect(result.trees[0].name).toBe('Updated Name');
    });
  });

  describe('with immutable fields', () => {
    const csv = 'id,name\nparent1,Updated Name\nparent2,\nchild1,';
    let result: ReturnType<typeof importCsvToTree>;

    beforeEach(() => {
      result = importCsvToTree(csv, sampleTreeSimple);
    });

    it('should not update ID field', () => {
      expect(result.trees[0].id).toBe('parent1');
    });
  });

  describe('with text-forced fields', () => {
    const csv =
      "id,code,birthdate,phone\nparent1,'1,'2000-01-01,'08512345\nparent2,,,\nchild1,,,";
    let result: ReturnType<typeof importCsvToTree>;

    beforeEach(() => {
      result = importCsvToTree(csv, sampleTreeSimple);
    });

    it('should strip leading quotes', () => {
      expect(result.trees[0].birthdate).toBe('2000-01-01');
      expect(result.trees[0].phone).toBe('08512345');
    });
  });

  describe('with missing or excess people', () => {
    it('should ignore missing people and only update those present', () => {
      const csv = 'id,name\nparent1,Updated Name';
      const result = importCsvToTree(csv, sampleTreeSimple);

      expect(result.updatedCount).toBe(1);
      expect(result.trees[0].name).toBe('Updated Name');
      // Other people remain unchanged
      expect(result.trees[0].marriages[0].spouse.name).toBe('Parent Two');
    });

    it('should ignore excess people not in tree', () => {
      const csv =
        'id,name\nparent1,Name1\nparent2,Name2\nchild1,Name3\nextra,Extra Person';
      const result = importCsvToTree(csv, sampleTreeSimple);

      expect(result.updatedCount).toBe(3);
      expect(result.trees[0].name).toBe('Name1');
    });

    it('should return error for empty CSV', () => {
      const result = importCsvToTree('', sampleTreeSimple);

      expect(result.updatedCount).toBe(0);
    });
  });

  describe('with special content', () => {
    it('should handle multi-line addresses', () => {
      const csv =
        'id,address\nparent1,"123 Main St\nApt 4B\nNew York"\nparent2,\nchild1,';
      const result = importCsvToTree(csv, sampleTreeSimple);

      expect(result.trees[0].address).toBe('123 Main St\nApt 4B\nNew York');
    });

    it('should handle photo updates', () => {
      const csv =
        'id,photo\nparent1,https://example.com/new-photo.jpg\nparent2,"data:image/jpeg;base64,ABC123"\nchild1,';
      const result = importCsvToTree(csv, sampleTreeSimple);

      expect(result.trees[0].photo).toBe('https://example.com/new-photo.jpg');
      expect(result.trees[0].marriages[0].spouse.photo).toBe(
        'data:image/jpeg;base64,ABC123'
      );
    });
  });
});
