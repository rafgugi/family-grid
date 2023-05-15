import { Fragment } from 'react';
import { Marriage, Person } from '../family.interface';
import FamilyGrid from './FamilyGrid';
import FamilyDiagram from './FamilyDiagram';

interface FamilyProps {
  trees: Person[];
  split: boolean;
  hideCode: boolean;
}

export default function Family({ trees, split, hideCode }: FamilyProps) {
  return (
    <>
      {split ? renderFamilies(trees, hideCode) : renderFamily(trees, hideCode)}
    </>
  );
}

function renderFamilies(trees: Person[], hideCode: boolean) {
  const heirs: Person[] = [];
  trees.forEach(function (person: Person) {
    person.marriages.forEach(function (marriage: Marriage) {
      if (marriage.spouse.marriages.length > 0) {
        heirs.push(marriage.spouse);
      }
      marriage.children.forEach(function (child: Person) {
        if (child.marriages.length > 0) {
          heirs.push(child);
        }
      });
    });
  });

  return trees.map(tree => (
    <Fragment key={tree.id}>
      <hr className="d-print-none" />
      <h3 className="text-center">{tree.name ?? tree.id} Family</h3>
      <FamilyDiagram trees={[tree]} depth={2} />
      <FamilyGrid trees={[tree]} hideCode={hideCode} split />
      {heirs.map((person: Person) => (
        <Family key={person.id} trees={[person]} hideCode={hideCode} split />
      ))}
    </Fragment>
  ));
}

function renderFamily(trees: Person[], hideCode: boolean) {
  return (
    <Fragment>
      <hr className="d-print-none" />
      <h3 className="text-center">Family Grid</h3>
      <FamilyDiagram trees={trees} />
      <FamilyGrid trees={trees} hideCode={hideCode} split={false} />
    </Fragment>
  );
}
