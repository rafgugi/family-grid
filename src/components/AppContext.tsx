import { createContext } from 'react';
import { Person } from '../family.interface';

interface AppContextValue {
  split: boolean;
  editMode: boolean;
  hidePersonCode: boolean;
  addTree: (t: Person) => void;
  setTreeValue: (p: Person) => void;
  deleteTreePerson: (p: Person) => void;
  treeMap: Record<string, Person>;
}

const AppContext = createContext<AppContextValue>({
  split: false,
  editMode: false,
  hidePersonCode: false,
  addTree: () => {},
  setTreeValue: () => {},
  deleteTreePerson: () => {},
  treeMap: {},
});

export default AppContext;
