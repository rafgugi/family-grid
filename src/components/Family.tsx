import { Fragment, useContext } from 'react';
import { Person } from '../family.interface';
import AppContext from './AppContext';
import FamilyGrid from './FamilyGrid';
import FamilyDiagram from './FamilyDiagram';
import { explodeTrees } from '../family.util';

interface FamilyProps {
  trees: Person[];
}

export default function Family(props: FamilyProps) {
  const { split } = useContext(AppContext);
  return split ? <SplitFamilies {...props} /> : <BigFamily {...props} />;
}

function SplitFamilies({ trees, ...props }: FamilyProps) {
  const people = explodeTrees(trees).filter(
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

function BigFamily({ trees, ...props }: FamilyProps) {
  return (
    <Fragment>
      <hr className="d-print-none" />
      <h3 className="text-center">Family Grid</h3>
      <FamilyDiagram trees={trees} />
      <FamilyGrid {...props} trees={trees} />
    </Fragment>
  );
}
