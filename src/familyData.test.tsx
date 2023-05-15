import { enrichTreeData, Person } from './familyData';

test('update nested tree data', () => {
  const familyData = {
    trees: [{
      id: 'satyr',
      marriages: [{
        spouse: { id: 'surtr' },
        children: [{ id: 'hound' }]
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
        sex: 'F'
      },
      hound: {
        name: 'Muhammad Hound',
        birthdate: '2007-06-09',
        sex: 'M'
      }
    }
  }

  enrichTreeData(familyData.trees, familyData.people);
  const tree = familyData.trees[0] as Person;
  const people = familyData.people;

  expect(tree.id).toEqual('satyr');
  expect(tree.name).toEqual(people.satyr.name);
  expect(tree.birthdate).toEqual(people.satyr.birthdate);
  expect(tree.sex).toEqual(people.satyr.sex);

  expect(tree.marriages[0].spouse.id).toEqual('surtr');
  expect(tree.marriages[0].spouse.name).toEqual(people.surtr.name);
  expect(tree.marriages[0].spouse.birthdate).toEqual(people.surtr.birthdate);
  expect(tree.marriages[0].spouse.sex).toEqual(people.surtr.sex);

  expect(tree.marriages[0].children[0].id).toEqual('hound');
  expect(tree.marriages[0].children[0].name).toEqual(people.hound.name);
  expect(tree.marriages[0].children[0].birthdate).toEqual(people.hound.birthdate);
  expect(tree.marriages[0].children[0].sex).toEqual(people.hound.sex);
});
