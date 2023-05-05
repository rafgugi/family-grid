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

export interface Marriage {
  spouse: Person;
  children: Person[];
};

export interface PersonNode {
  key: number | string;
  name: string;
  s: string;
  mother?: string;
  father?: string;
  spouses: string[];
  attributes: string[];
}
