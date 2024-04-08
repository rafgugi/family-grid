import {
  deletePerson,
  enrichTreeData,
  explodeTrees,
  idAsNickName,
  treesToPersonNode,
  treesToRecord,
  unrichTreeData,
} from './family.util';

const familyData = [{
  id: 'satyr',
  marriages: [{
    spouse: { id: 'surtr' },
    children: [{
      id: 'hound',
      marriages: [{
        spouse: { id: 'alpha' },
        children: [{ id: 'ryora' }],
      }],
    }],
  }, {
    spouse: { id: 'nala' },
    children: [{ id: 'mufasa' }],
  }],
}];

const doubleFamilyData = {
  trees: [{
    id: 'satyr',
    marriages: [{
      spouse: { id: 'surtr' },
      children: [{
        id: 'hound',
        marriages: [{
          spouse: { id: 'alpha' },
          children: [{ id: 'ryora' }],
        }],
      }],
    }, {
      spouse: { id: 'nala' },
      children: [{ id: 'mufasa' }],
    }],
  }, {
    id: 'angela',
    sex: 'F',
    marriages: [{
      spouse: { id: 'saber', sex: 'M' },
      children: [{ id: 'alpha' }],
    }],
  }],
};

const enrichingPeople = {
  satyr: {
    name: 'Muhammad Satyr',
    birthdate: '1982-02-13',
    sex: 'M',
  },
  surtr: {
    name: 'Amalia Surtrain',
    birthdate: '1987-11-21',
    deathdate: '2021-01-13',
    sex: 'F',
  },
  hound: {
    name: 'Muhammad Hound',
    birthdate: '2007-06-09',
    sex: 'M',
  },
  alpha: {
    name: 'Siti Alpha',
    birthdate: '2008-06-19',
    sex: 'F',
  },
  ryora: {
    name: 'Muhammad Ryora',
    birthdate: '2030-03-12',
    sex: 'M',
  },
  nala: {
    sex: 'F',
  },
};

const enrichedTree = [{
  id: 'satyr',
  code: '1',
  name: 'Muhammad Satyr',
  sex: 'M',
  birthdate: '1982-02-13',
  marriages: [{
    spouse: {
      id: 'surtr',
      code: '1M1',
      name: 'Amalia Surtrain',
      sex: 'F',
      birthdate: '1987-11-21',
      deathdate: '2021-01-13',
      marriages: [],
    },
    children: [{
      id: 'hound',
      code: '1.101',
      name: 'Muhammad Hound',
      sex: 'M',
      birthdate: '2007-06-09',
      marriages: [{
        spouse: {
          id: 'alpha',
          code: '1.101M',
          name: 'Siti Alpha',
          sex: 'F',
          birthdate: '2008-06-19',
          marriages: [],
        },
        children: [{
          id: 'ryora',
          code: '1.101.01',
          name: 'Muhammad Ryora',
          sex: 'M',
          birthdate: '2030-03-12',
          marriages: [],
        }],
      }],
    }],
  }, {
    spouse: {
      id: 'nala',
      code: '1M2',
      sex: 'F',
      marriages: [],
    },
    children: [{
      id: 'mufasa',
      code: '1.201',
      marriages: [],
    }],
  }],
}];

describe('enrichTreeData', () => {
  const trees = enrichTreeData(familyData, enrichingPeople);

  it('each person has correct properties', () => {
    expect(trees).toEqual(enrichedTree);
  });

  it('doesnt change the family data trees', () => {
    const oldTree = [{
      id: 'satyr',
      marriages: [{
        spouse: { id: 'surtr' },
        children: [{
          id: 'hound',
          marriages: [{
            spouse: { id: 'alpha' },
            children: [{ id: 'ryora' }],
          }],
        }],
      }, {
        spouse: { id: 'nala' },
        children: [{ id: 'mufasa' }],
      }],
    }];

    expect(familyData).toEqual(oldTree);
  });

  test('empty data returns empty array', () => {
    expect(enrichTreeData([], {})).toEqual([]);
  });

  describe('contains invalid person', () => {
    const familyData = [
      {},
      {
        id: 'satyr',
        marriages: [{}],
      },
      {
        id: 'hound',
        marriages: [{
          children: [{ id: 'ryora' }, { name: 'meta' }],
        }],
      },
    ];
    const trees = enrichTreeData(familyData, []);

    test('should validate invalid person', () => {
      expect(trees).toEqual([{
        id: 'satyr',
        code: '2',
        marriages: [],
      }, {
        id: 'hound',
        code: '3',
        marriages: [{
          spouse: { id: 'hound__m', code: '3M', marriages: [] },
          children: [{ id: 'ryora', code: '3.01', marriages: [] }],
        }],
      }]);
    });
  });

  describe('remaining people should become trees', () => {
    const satyr = {
      name: 'Muhammad Satyr',
      birthdate: '1982-02-13',
      sex: 'M',
    };

    test('with undefined code', () => {
      expect(enrichTreeData([], { satyr: satyr })).toEqual([{
        ...satyr,
        id: 'satyr',
        code: '.1',
        marriages: [],
      }]);
    });

    test('with person own code', () => {
      const newSatyr = { ...satyr, code: 'code' };
      expect(enrichTreeData([], { satyr: newSatyr })).toEqual([{
        ...newSatyr,
        id: 'satyr',
        code: 'code',
        marriages: [],
      }]);
    });

    test('with person empty code', () => {
      const newSatyr = { ...satyr, code: '' };
      expect(enrichTreeData([], { satyr: newSatyr })).toEqual([{
        ...newSatyr,
        id: 'satyr',
        code: '.1',
        marriages: [],
      }]);
    });
  });

  describe('unexpected param should return empty tree', () => {
    test('param is string', () => {
      expect(enrichTreeData(['1'], [])).toEqual([]);
    });

    test('param is null', () => {
      expect(enrichTreeData(null, [])).toEqual([]);
    });
  });
});

describe('unrichTreeData', () => {
  describe('single tree', () => {
    const { trees, people } = unrichTreeData(enrichedTree);

    test('each person has correct properties', () => {
      expect(trees).toEqual(familyData);
      expect(people).toEqual({
        satyr: {
          code: '1',
          name: 'Muhammad Satyr',
          sex: 'M',
          birthdate: '1982-02-13',
        },
        surtr: {
          code: '1M1',
          name: 'Amalia Surtrain',
          sex: 'F',
          birthdate: '1987-11-21',
          deathdate: '2021-01-13',
        },
        hound: {
          code: '1.101',
          name: 'Muhammad Hound',
          sex: 'M',
          birthdate: '2007-06-09',
        },
        alpha: {
          code: '1.101M',
          name: 'Siti Alpha',
          sex: 'F',
          birthdate: '2008-06-19',
        },
        ryora: {
          code: '1.101.01',
          name: 'Muhammad Ryora',
          sex: 'M',
          birthdate: '2030-03-12',
        },
        nala: { code: '1M2', sex: 'F' },
        mufasa: { code: '1.201' },
      });
    });

    test('should be reverted to rich tree data', () => {
      expect(enrichTreeData(trees, people)).toEqual(enrichedTree);
    });
  });
});

describe('treesToPersonNode', () => {
  const trees = enrichTreeData(familyData, enrichingPeople);

  test('without depth', () => {
    const nodes = treesToPersonNode(trees);
    expect(nodes).toEqual([
      { key: 'satyr', name: 'Satyr', s: 'M', attributes: [], spouses: ['surtr', 'nala'] },
      { key: 'surtr', name: 'Surtr', s: 'F', attributes: ['S'], spouses: [] },
      { key: 'hound', name: 'Hound', s: 'M', attributes: [], spouses: ['alpha'], father: 'satyr', mother: 'surtr' },
      { key: 'alpha', name: 'Alpha', s: 'F', attributes: [], spouses: [] },
      { key: 'ryora', name: 'Ryora', s: 'M', attributes: [], spouses: [], father: 'hound', mother: 'alpha' },
      { key: 'nala', name: 'Nala', s: 'F', attributes: [], spouses: [] },
      { key: 'mufasa', name: 'Mufasa', s: 'M', attributes: [], spouses: [], father: 'satyr', mother: 'nala' },
    ]);
  });

  test('with depth 2', () => {
    const nodes = treesToPersonNode(trees, 2);
    expect(nodes).toEqual([
      { key: 'satyr', name: 'Satyr', s: 'M', attributes: [], spouses: ['surtr', 'nala'] },
      { key: 'surtr', name: 'Surtr', s: 'F', attributes: ['S'], spouses: [] },
      { key: 'hound', name: 'Hound', s: 'M', attributes: [], spouses: [], father: 'satyr', mother: 'surtr' },
      { key: 'nala', name: 'Nala', s: 'F', attributes: [], spouses: [] },
      { key: 'mufasa', name: 'Mufasa', s: 'M', attributes: [], spouses: [], father: 'satyr', mother: 'nala' },
    ]);
  });

  describe('with double trees', () => {
    test('without depth', () => {
      const trees = enrichTreeData(doubleFamilyData.trees, enrichingPeople);
      const nodes = treesToPersonNode(trees);
      expect(nodes).toEqual([
        { key: 'satyr', name: 'Satyr', s: 'M', attributes: [], spouses: ['surtr', 'nala'] },
        { key: 'surtr', name: 'Surtr', s: 'F', attributes: ['S'], spouses: [] },
        { key: 'hound', name: 'Hound', s: 'M', attributes: [], spouses: ['alpha'], father: 'satyr', mother: 'surtr' },
        { key: 'alpha', name: 'Alpha', s: 'F', attributes: [], spouses: [], father: 'saber', mother: 'angela' },
        { key: 'ryora', name: 'Ryora', s: 'M', attributes: [], spouses: [], father: 'hound', mother: 'alpha' },
        { key: 'nala', name: 'Nala', s: 'F', attributes: [], spouses: [] },
        { key: 'mufasa', name: 'Mufasa', s: 'M', attributes: [], spouses: [], father: 'satyr', mother: 'nala' },
        { key: 'angela', name: 'Angela', s: 'F', attributes: [], spouses: ['saber'] },
        { key: 'saber', name: 'Saber', s: 'M', attributes: [], spouses: [] },
      ]);
    });
  });
});

describe('explodeTrees', () => {
  const trees = enrichTreeData(familyData, enrichingPeople);

  test('without depth', () => {
    const people = explodeTrees(trees);
    const expectedPeople = ['satyr', 'surtr', 'hound', 'alpha', 'ryora', 'nala', 'mufasa'];
    expect(people.map(person => person.id)).toEqual(expectedPeople);
  });

  test('with depth 2', () => {
    const people = explodeTrees(trees, 2);
    const expectedPeople = ['satyr', 'surtr', 'hound', 'nala', 'mufasa'];
    expect(people.map(person => person.id)).toEqual(expectedPeople);
  });
});

describe('treesToRecord', () => {
  const trees = enrichTreeData(familyData, enrichingPeople);
  const record = treesToRecord(trees);

  it('has all of the people', () => {
    const people = ['satyr', 'surtr', 'hound', 'alpha', 'ryora', 'nala', 'mufasa'];
    people.forEach(key => {
      expect(record[key].id).toEqual(key);
    });
  });

  it('preserves the relation and properties', () => {
    // random sampling for satyr
    expect(record['satyr'].marriages[0].spouse).toEqual(record['surtr']);
  });
});

describe('deletePerson', () => {
  const trees = enrichTreeData(familyData, []);

  test('person is root', () => {
    expect(deletePerson(trees, 'satyr')).toEqual([]);
  });

  test('person is children', () => {
    expect(deletePerson(trees, 'hound')).toEqual([{
      id: 'satyr',
      code: '1',
      marriages: [{
        spouse: { id: 'surtr', code: '1M1', marriages: [] },
        children: [],
      }, {
        spouse: { id: 'nala', code: '1M2', marriages: [] },
        children: [{ id: 'mufasa', code: '1.201', marriages: [] }],
      }],
    }]);

    expect(deletePerson(trees, 'ryora')).toEqual([{
      id: 'satyr',
      code: '1',
      marriages: [{
        spouse: { id: 'surtr', code: '1M1', marriages: [] },
        children: [{
          id: 'hound',
          code: '1.101',
          marriages: [{
            spouse: { id: 'alpha', code: '1.101M', marriages: [] },
            children: [],
          }],
        }],
      }, {
        spouse: { id: 'nala', code: '1M2', marriages: [] },
        children: [{ id: 'mufasa', code: '1.201', marriages: [] }],
      }],
    }]);
  });

  test('person is spouse', () => {
    expect(deletePerson(trees, 'surtr')).toEqual([{
      id: 'satyr',
      code: '1',
      marriages: [{
        spouse: { id: 'nala', code: '1M2', marriages: [] },
        children: [{ id: 'mufasa', code: '1.201', marriages: [] }],
      }],
    }]);

    expect(deletePerson(trees, 'nala')).toEqual([{
      id: 'satyr',
      code: '1',
      marriages: [{
        spouse: { id: 'surtr', code: '1M1', marriages: [] },
        children: [{
          id: 'hound',
          code: '1.101',
          marriages: [{
            spouse: { id: 'alpha', code: '1.101M', marriages: [] },
            children: [{ id: 'ryora', code: '1.101.01', marriages: [] }],
          }],
        }],
      }],
    }]);
  });
});

describe('idAsNickName', () => {
  test('convert correctly', () => {
    expect(idAsNickName('satyr')).toEqual('Satyr');
    expect(idAsNickName('satyr123')).toEqual('Satyr');
    expect(idAsNickName('sat123yr')).toEqual('Satyr');
  });
});
