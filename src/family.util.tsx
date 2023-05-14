import { Person, Marriage, PersonNode } from './family.interface';

// Enrich the trees from the people. Try to make trees unchanged.
export function enrichTreeData(
  trees: any[],
  people: Record<string, any>
): Person[] {
  return trees.map(function (person: Person, i: number) {
    person = { ...person };
    person.code ||= String(i + 1);
    return enrichPersonData(person, people);
  });
}

// Enrich the person from the people. Try to make person unchanged.
function enrichPersonData(person: any, people: Record<string, any>): Person {
  person = { ...person };
  const detail = people[person.id];
  if (detail) {
    Object.assign(person, detail);
  }

  const marriages = person.marriages || [];
  person.marriages = marriages.map(function (marriage: Marriage, i: number) {
    const married = marriages.length > 1 ? String(i + 1) : ''; // married count
    marriage = { ...marriage };
    marriage.spouse = {
      ...enrichPersonData(marriage.spouse, people),
      code: marriage.spouse.code || person.code + 'M' + married,
    };

    const children = marriage.children || [];
    marriage.children = children.map(function (child: Person, i: number) {
      child = { ...child };
      child.code ||=
        person.code + '.' + married + String(i + 1).padStart(2, '0');
      return enrichPersonData(child, people);
    });
    return marriage;
  });
  return createPerson(person);
}

// create and assign default required value for Person
function createPerson(data: any): Person {
  return {
    ...data,
    marriages: data.marriages || [],
  };
}

// convert Person[] to PersonNode[]
export function treesToPersonNode(
  trees: Person[],
  depth: number = 0
): PersonNode[] {
  const nodes: PersonNode[] = [];
  trees.forEach(person =>
    nodes.push(...personToPersonNode(person, [], 1, depth))
  );

  return nodes;
}

function personToPersonNode(
  person: Person,
  parents: Person[],
  level: number = 1,
  depth: number = 0
): PersonNode[] {
  const nodes: PersonNode[] = [];
  const node: PersonNode = {
    key: person.id,
    name: person.id,
    s: person.sex ?? 'M',
    attributes: [],
    spouses: [],
  };
  nodes.push(node);

  if (parents.length === 2) {
    node.father = parents[0].id;
    node.mother = parents[1].id;
  }

  if (person.deathdate) {
    node.attributes.push('S');
  }

  if (depth === 0 || level < depth) {
    person.marriages.forEach(function (marriage) {
      const spouse = marriage.spouse;
      const parents = [person, spouse];
      node.spouses.push(spouse.id);
      nodes.push(...personToPersonNode(spouse, [], level, depth));
      marriage.children.forEach(function (child) {
        nodes.push(...personToPersonNode(child, parents, level + 1, depth));
      });
    });
  }
  return nodes;
}

// Breakdown the person's family tree into array. Default algo is DFS.
export function explodePerson(person: Person): Person[] {
  const people = [person];
  person.marriages.forEach(function (marriage: Marriage) {
    people.push(marriage.spouse);
    marriage.children.forEach(function (person: Person) {
      people.push(person);
    });
  });
  return people;
}
