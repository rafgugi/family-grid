import { createContext } from 'react';
import { Person } from '../family.interface';

interface AppContextValue {
  split: boolean;
  editMode: boolean;
  hidePersonCode: boolean;
  setTreeValue: (p: Person) => void;
}

const AppContext = createContext<AppContextValue>({
  split: false,
  editMode: false,
  hidePersonCode: false,
  setTreeValue: () => {},
});

export default AppContext;
