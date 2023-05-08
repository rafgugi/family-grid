import { Person } from '../family.interface';
import FamilyGrid from './FamilyGrid';
import FamilyDiagram from './FamilyDiagram';

interface FamilyProps {
  trees: Person[];
  split?: boolean;
}

export default function Family({ trees, split }: FamilyProps) {
  return (
    <>
      <h1>Family Grid</h1>
      <FamilyDiagram trees={trees} />
      <FamilyGrid person={trees[0]} />
    </>
  );
}
