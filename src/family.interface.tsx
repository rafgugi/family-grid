export interface Person {
  id: string;
  code: string;
  name?: string;
  sex?: string;
  birthplace?: string;
  birthdate?: string;
  deathdate?: string;
  phone?: string;
  email?: string;
  ig?: string;
  address?: string;
  marriages: Marriage[];
}

export interface Marriage {
  spouse: Person;
  children: Person[];
}

export interface PersonNode {
  key: number | string;
  name: string;
  s: string;
  mother?: string;
  father?: string;
  spouses: string[];
  attributes: string[];
}
