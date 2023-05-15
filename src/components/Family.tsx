import { Fragment } from 'react';
import { Marriage, Person } from '../family.interface';
import FamilyGrid from './FamilyGrid';
import FamilyDiagram from './FamilyDiagram';

interface FamilyProps {
  trees: Person[];
  split: boolean;
}

export default function Family({ trees, split }: FamilyProps) {
  return (
    <>
      {split ? renderFamilies(trees) : renderFamily(trees)}
    </>
  );
}

function renderFamilies(trees: Person[]) {
  const heirs: Person[] = [];
  trees.forEach(function (person: Person) {
    person.marriages.forEach(function (marriage: Marriage) {
      if (marriage.spouse.marriages.length > 0) {
        heirs.push(marriage.spouse);
      }
      marriage.children.forEach(function (child: Person) {
        if (child.marriages.length > 0) {
          heirs.push(child)
        }
      });
    });
  });

  return trees.map(tree =>
    <Fragment key={tree.id}>
      <h1>{tree.name ?? tree.id} Family</h1>
      <FamilyDiagram trees={[tree]} depth={2} />
      <FamilyGrid trees={[tree]} split />
      {heirs.map((person: Person) =>
        <Family key={person.id} trees={[person]} split />
      )}
    </Fragment>
  )
}

function renderFamily(trees: Person[]) {
  return (
    <>
      <h1>Family Grid</h1>
      <FamilyDiagram trees={trees} />
      <FamilyGrid trees={trees} split={false} />
    </>
  );
}
