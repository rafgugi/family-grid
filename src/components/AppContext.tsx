import { createContext } from 'react';
import { Person } from '../family.interface';

interface AppContextValue {
  split: boolean;
  editMode: boolean;
  showPersonCode: boolean;
  setTreesValue: (ps: Person[]) => void;
  upsertPerson: (p: Person) => void;
  deletePerson: (p: Person) => void;
  treeMap: Record<string, Person>;
}

const AppContext = createContext<AppContextValue>({
  split: false,
  editMode: false,
  showPersonCode: false,
  setTreesValue: () => {},
  upsertPerson: () => {},
  deletePerson: () => {},
  treeMap: {},
});

export default AppContext;
