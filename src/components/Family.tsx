import { Dispatch, Fragment } from 'react';
import { Marriage, Person } from '../family.interface';
import FamilyGrid from './FamilyGrid';
import FamilyDiagram from './FamilyDiagram';

interface FamilyProps {
  trees: Person[];
  split: boolean;
  editMode: boolean;
  hideCode: boolean;
  setTreeValue: Dispatch<any>;
}

export default function Family(props: FamilyProps) {
  return (
    <>
      {props.split ? renderFamilies(props) : renderFamily(props)}
    </>
  );
}

function renderFamilies(props: FamilyProps) {
  const heirs: Person[] = [];
  props.trees.forEach(function (person: Person) {
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

  return props.trees.map(tree => (
    <Fragment key={tree.id}>
      <hr className="d-print-none" />
      <h3 className="text-center">{tree.name ?? tree.id} Family</h3>
      <FamilyDiagram trees={[tree]} depth={2} />
      <FamilyGrid
        trees={[tree]}
        split
        editMode={props.editMode}
        hideCode={props.hideCode}
        setTreeValue={props.setTreeValue}
      />

      {heirs.map((person: Person) => (
        <Family
          key={person.id}
          trees={[person]}
          split
          editMode={props.editMode}
          hideCode={props.hideCode}
          setTreeValue={props.setTreeValue}
        />
      ))}
    </Fragment>
  ));
}

function renderFamily(props: FamilyProps) {
  return (
    <Fragment>
      <hr className="d-print-none" />
      <h3 className="text-center">Family Grid</h3>
      <FamilyDiagram trees={props.trees} />
      <FamilyGrid
        trees={props.trees}
        split={false}
        editMode={props.editMode}
        hideCode={props.hideCode}
        setTreeValue={props.setTreeValue}
      />
    </Fragment>
  );
}
