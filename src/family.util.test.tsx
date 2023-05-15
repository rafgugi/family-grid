import { Person } from './family.interface';
import { enrichTreeData, treesToPersonNode } from './family.util';

const familyData = {
  trees: [{
    id: 'satyr',
    marriages: [{
      spouse: { id: 'surtr' },
      children: [{
        id: 'hound',
        marriages: [{
          spouse: { id: 'alpha' },
          children: [{ id: 'ryora' }]
        }]
      }]
    }, {
      spouse: { id: 'nala' },
      children: [{ id: 'mufasa' }]
    }]
  }],
  people: {
    satyr: {
      name: 'Muhammad Satyr',
      birthdate: '1982-02-13',
      sex: 'M'
    },
    surtr: {
      name: 'Amalia Surtrain',
      birthdate: '1987-11-21',
      deathdate: '2021-01-13',
      sex: 'F'
    },
    hound: {
      name: 'Muhammad Hound',
      birthdate: '2007-06-09',
      sex: 'M'
    },
    alpha: {
      name: 'Siti Alpha',
      birthdate: '2008-06-19',
      sex: 'F'
    },
    ryora: {
      name: 'Muhammad Ryora',
      birthdate: '2030-03-12',
      sex: 'M'
    },
    nala: {
      sex: 'F'
    }
  }
}

test('update nested tree data', () => {
  const trees = enrichTreeData(familyData.trees, familyData.people);
  const tree = trees[0] as Person;
  const people = familyData.people;
  const oldTree = [{
    id: 'satyr',
    marriages: [{
      spouse: { id: 'surtr' },
      children: [{
        id: 'hound',
        marriages: [{
          spouse: { id: 'alpha' },
          children: [{ id: 'ryora' }]
        }]
      }]
    }, {
      spouse: { id: 'nala' },
      children: [{ id: 'mufasa' }]
    }]
  }];

  // expect the familyData trees doesn't changed
  expect(familyData.trees).toEqual(oldTree);

  let person: Person = tree;
  expect(person.id).toEqual('satyr');
  expect(person.code).toEqual('1');
  expect(person.name).toEqual(people.satyr.name);
  expect(person.birthdate).toEqual(people.satyr.birthdate);
  expect(person.sex).toEqual(people.satyr.sex);

  person = tree.marriages[0].spouse;
  expect(person.id).toEqual('surtr');
  expect(person.code).toEqual('1M1');
  expect(person.name).toEqual(people.surtr.name);
  expect(person.birthdate).toEqual(people.surtr.birthdate);
  expect(person.deathdate).toEqual(people.surtr.deathdate);
  expect(person.sex).toEqual(people.surtr.sex);

  person = tree.marriages[0].children[0];
  expect(person.id).toEqual('hound');
  expect(person.code).toEqual('1.101');
  expect(person.name).toEqual(people.hound.name);
  expect(person.birthdate).toEqual(people.hound.birthdate);
  expect(person.sex).toEqual(people.hound.sex);

  person = tree.marriages[0].children[0].marriages[0].spouse;
  expect(person.id).toEqual('alpha');
  expect(person.code).toEqual('1.101M');
  expect(person.name).toEqual(people.alpha.name);
  expect(person.birthdate).toEqual(people.alpha.birthdate);
  expect(person.sex).toEqual(people.alpha.sex);

  person = tree.marriages[0].children[0].marriages[0].children[0];
  expect(person.id).toEqual('ryora');
  expect(person.code).toEqual('1.101.01');
  expect(person.name).toEqual(people.ryora.name);
  expect(person.birthdate).toEqual(people.ryora.birthdate);
  expect(person.sex).toEqual(people.ryora.sex);

  person = tree.marriages[1].spouse;
  expect(person.id).toEqual('nala');
  expect(person.code).toEqual('1M2');
  expect(person.sex).toEqual(people.nala.sex);

  person = tree.marriages[1].children[0];
  expect(person.id).toEqual('mufasa');
  expect(person.code).toEqual('1.201');
});

test('convert trees to PersonNode without depth', () => {
  const trees = enrichTreeData(familyData.trees, familyData.people);
  const nodes = treesToPersonNode(trees);

  expect(nodes).toEqual([
    { key: 'satyr', name: 'satyr', s: 'M', attributes: [], spouses: ['surtr', 'nala'] },
    { key: 'surtr', name: 'surtr', s: 'F', attributes: ['S'], spouses: [] },
    { key: 'hound', name: 'hound', s: 'M', attributes: [], spouses: ['alpha'], father: 'satyr', mother: 'surtr' },
    { key: 'alpha', name: 'alpha', s: 'F', attributes: [], spouses: [] },
    { key: 'ryora', name: 'ryora', s: 'M', attributes: [], spouses: [], father: 'hound', mother: 'alpha' },
    { key: 'nala', name: 'nala', s: 'F', attributes: [], spouses: [] },
    { key: 'mufasa', name: 'mufasa', s: 'M', attributes: [], spouses: [], father: 'satyr', mother: 'nala' },
  ]);
});

test('convert trees to PersonNode with depth 2', () => {
  const trees = enrichTreeData(familyData.trees, familyData.people);
  const nodes = treesToPersonNode(trees, 2);

  expect(nodes).toEqual([
    { key: 'satyr', name: 'satyr', s: 'M', attributes: [], spouses: ['surtr', 'nala'] },
    { key: 'surtr', name: 'surtr', s: 'F', attributes: ['S'], spouses: [] },
    { key: 'hound', name: 'hound', s: 'M', attributes: [], spouses: [], father: 'satyr', mother: 'surtr' },
    { key: 'nala', name: 'nala', s: 'F', attributes: [], spouses: [] },
    { key: 'mufasa', name: 'mufasa', s: 'M', attributes: [], spouses: [], father: 'satyr', mother: 'nala' },
  ]);
});
