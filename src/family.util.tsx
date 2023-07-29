import { Person, Marriage, PersonNode } from './family.interface';

// Enrich the trees from the people. Try to make trees unchanged.
export function enrichTreeData(
  trees: any[] | any,
  people: Record<string, any>
): Person[] {
  if (!Array.isArray(trees)) return [];

  const enrichedTrees = trees
    .map((person: any, i: number) => {
      if (!person || typeof person !== 'object') return null;

      person = { ...person };
      person.code ||= String(i + 1);
      return enrichPerson(person, people);
    })
    .flatMap(f => (!!f ? [f] : []));

  // fill the remaining people that not in trees
  const peopleKeys = new Set(Object.keys(people));
  const treesKeys = new Set(Object.keys(treesToRecord(enrichedTrees)));
  peopleKeys.forEach((id: string) => {
    if (!treesKeys.has(id)) {
      const person = people[id];
      person.code = !!person.code
        ? person.code
        : '.' + (enrichedTrees.length + 1);
      enrichedTrees.push({
        id,
        marriages: [],
        ...person,
      });
    }
  });

  return enrichedTrees;
}

// Enrich the person from the people. Try to make person unchanged.
const enrichPerson = (
  person: any,
  people: Record<string, any>
): Person | null => {
  if (!person || typeof person.id !== 'string') return null;

  const p = createPerson({
    id: person.id,
    code: person.code,
    name: person.name,
    sex: person.sex,
    birthplace: person.birthplace,
    birthdate: person.birthdate,
    deathdate: person.deathdate,
    phone: person.phone,
    email: person.email,
    ig: person.ig,
    address: person.address,
    marriages: person.marriages,
  });
  const detail = people[p.id];
  if (detail) {
    Object.assign(p, detail);
  }

  p.marriages = p.marriages.map((marriage: Marriage, i: number) => {
    const married = p.marriages.length > 1 ? String(i + 1) : '';
    const spouse =
      enrichPerson(marriage.spouse, people) ||
      createPerson({ id: p.id + '__m' });

    const children = (marriage.children || [])
      .map((child: Person, i: number) => {
        child = { ...child };
        child.code ||= p.code + '.' + married + String(i + 1).padStart(2, '0');
        return enrichPerson(child, people);
      })
      .flatMap(f => (!!f ? [f] : []));

    return {
      spouse: {
        ...spouse,
        code: spouse.code || p.code + 'M' + married,
      },
      children,
    } as Marriage;
  });
  return p;
};

// Breakdown the person's family tree into array.
export function explodeTrees(trees: Person[], depth: number = -1): Person[] {
  const people: Person[] = [];
  if (depth === 0) return people;

  trees.forEach(function (person) {
    people.push(person);
    person.marriages.forEach(function (marriage: Marriage) {
      people.push(...explodeTrees([marriage.spouse], depth - 1));
      people.push(...explodeTrees(marriage.children, depth - 1));
    });
  });
  return people;
}

// Convert person's family tree into Record<id, Person>
export function treesToRecord(trees: Person[]): Record<string, Person> {
  const record: Record<string, Person> = {};
  trees.forEach(function (person) {
    record[person.id] = person;
    person.marriages.forEach(function (marriage) {
      Object.assign(record, treesToRecord([marriage.spouse]));
      Object.assign(record, treesToRecord(marriage.children));
    });
  });
  return record;
}

// Delete person completely by id from the trees
export function deletePerson(trees: Person[], id: string): Person[] {
  const updatedTree: Person[] = [];
  trees.forEach(person => {
    if (person.id === id) return;

    const updatedPerson: Person = { ...person, marriages: [] };
    person.marriages.forEach(marriage => {
      if (marriage.spouse.id === id) return;

      const children = deletePerson(marriage.children, id);
      const updatedMarriage: Marriage = { ...marriage, children: children };
      updatedPerson.marriages.push(updatedMarriage);
    });
    updatedTree.push(updatedPerson);
  });

  return updatedTree;
}

// create and assign default required value for Person
function createPerson(data: any): Person {
  return {
    ...data,
    marriages:
      data.marriages?.filter((f: any) => !!Object.keys(f).length) || [],
  };
}

// convert Person[] to PersonNode[]
export function treesToPersonNode(
  trees: Person[],
  depth: number = 0
): PersonNode[] {
  const nodes: Record<string, PersonNode> = {};
  trees.forEach(person => personToPersonNode(nodes, person, [], 1, depth));

  return Object.values(nodes);
}

function personToPersonNode(
  nodes: Record<string, PersonNode>,
  person: Person,
  parents: Person[],
  level: number = 1,
  depth: number = 0
) {
  if (!nodes[person.id]) {
    nodes[person.id] = {
      key: person.id,
      name: person.id,
      s: person.sex ?? 'M',
      attributes: [],
      spouses: [],
    };
  }
  const node: PersonNode = nodes[person.id];

  if (parents.length === 2) {
    if (parents[0].sex === 'F') {
      node.mother = parents[0].id;
      node.father = parents[1].id;
    } else {
      node.father = parents[0].id;
      node.mother = parents[1].id;
    }
  }

  if (person.deathdate) {
    node.attributes.push('S');
  }

  if (depth === 0 || level < depth) {
    person.marriages.forEach(function (marriage) {
      const spouse = marriage.spouse;
      const parents = [person, spouse];
      node.spouses.push(spouse.id);
      personToPersonNode(nodes, spouse, [], level, depth);
      marriage.children.forEach(function (child) {
        personToPersonNode(nodes, child, parents, level + 1, depth);
      });
    });
  }
  return nodes;
}
