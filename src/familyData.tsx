// Enrich the person from the people
export function enrichPersonData(person: any, people: { [key: string]: any }): Person {
  const detail = people[person.id];
  if (detail) {
    Object.assign(person, detail);
  }

  const marriages = person.marriages || [];
  marriages.forEach(function (marriage: Marriage) {
    marriage.spouse.code ||= person.code + 'M';
    marriage.spouse = enrichPersonData(marriage.spouse, people);

    marriage.children = marriage.children.map(function (child: Person, i: number) {
      child.code ||= person.code + '.' + String(i + 1).padStart(2, '0');
      return enrichPersonData(child, people)
    });
  })
  return createPerson(person);
}

// Enrich the trees from the people
export function enrichTreeData(trees: any[], people: { [key: string]: any }): Person[] {
  return trees.map(function (person: Person, i: number) {
    person.code ||=  String(i + 1);
    return enrichPersonData(person, people);
  });
}

export interface Person {
  id: string;
  code: string;
  name?: string;
  birthplace?: string;
  birthdate?: string;
  deathdate?: string;
  address?: string;
  sex?: string;
  marriages: Marriage[];
  phone?: string;
  email?: string;
  ig?: string;
};

function createPerson(data: any): Person {
  data.marriages = data.marriages ?? [];
  return data;
}

export interface Marriage {
  spouse: Person;
  children: Person[];
};

export interface RawFamily {
  trees: Person[];
  people: { [key: string]: any };
}
