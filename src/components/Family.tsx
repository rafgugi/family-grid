import { Fragment } from 'react';
import { Person } from '../family.interface';
import FamilyGrid from './FamilyGrid';
import FamilyDiagram from './FamilyDiagram';
import { explodeTrees } from '../family.util';

interface FamilyProps {
  trees: Person[];
  split: boolean;
  editMode: boolean;
  hideCode: boolean;
  setTreeValue: (p: Person) => void;
}

export default function Family(props: FamilyProps) {
  return props.split ? <SplitFamilies {...props} /> : <BigFamily {...props} />;
}

function SplitFamilies(props: FamilyProps) {
  const people = explodeTrees(props.trees).filter(
    person => person.marriages.length !== 0
  );

  return (
    <>
      {people.map(tree => (
        <Fragment key={tree.id}>
          <hr className="d-print-none" />
          <h3 className="text-center">{tree.name ?? tree.id} Family</h3>
          <FamilyDiagram trees={[tree]} depth={2} />
          <FamilyGrid {...props} trees={[tree]} />
        </Fragment>
      ))}
    </>
  );
}

function BigFamily(props: FamilyProps) {
  return (
    <Fragment>
      <hr className="d-print-none" />
      <h3 className="text-center">Family Grid</h3>
      <FamilyDiagram trees={props.trees} />
      <FamilyGrid {...props} />
    </Fragment>
  );
}
