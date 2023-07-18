import { createContext } from 'react';
import { Person } from '../family.interface';

interface AppContextValue {
  split: boolean;
  editMode: boolean;
  hidePersonCode: boolean;
  setTreeValue: (p: Person) => void;
  setTreesValue: (ps: Person[]) => void;
  deleteTreePerson: (p: Person) => void;
  treeMap: Record<string, Person>;
}

const AppContext = createContext<AppContextValue>({
  split: false,
  editMode: false,
  hidePersonCode: false,
  setTreeValue: () => {},
  setTreesValue: () => {},
  deleteTreePerson: () => {},
  treeMap: {},
});

export default AppContext;
