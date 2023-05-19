import { Dispatch } from 'react';
import { Table } from 'reactstrap';
import { Person, Marriage } from '../family.interface';

interface FamilyGridProps {
  trees: Person[];
  split: boolean;
  hideCode: boolean;
  setTreeValue: Dispatch<any>;
}

export default function FamilyGrid(props: FamilyGridProps) {
  return (
    <Table size="sm" bordered hover responsive>
      <thead>
        <tr>
          <th style={{ width: '7em' }} hidden={props.hideCode}>
            Code
          </th>
          <th style={{ width: '15.5em' }}>Name</th>
          <th style={{ width: '7em' }}>Birthplace</th>
          <th style={{ width: '7em' }}>Birthdate</th>
          <th style={{ width: '8.5em' }}>Phone</th>
          <th style={{ width: '18.5em' }}>Address</th>
          <th style={{ width: '8.5em' }}>IG</th>
        </tr>
      </thead>
      <tbody>
        {props.trees.map(person => (
          <FamilyRows
            key={person.id}
            person={person}
            split={props.split}
            hideCode={props.hideCode}
            setTreeValue={props.setTreeValue}
          />
        ))}
      </tbody>
    </Table>
  );
}

interface PersonRowProps {
  person: Person;
  split?: boolean;
  hideCode: boolean;
  setTreeValue?: Dispatch<any>;
}

function FamilyRows(props: PersonRowProps) {
  const person = props.person;
  const heirs: Person[] = [];
  person.marriages.forEach(function (marriage: Marriage) {
    heirs.push(marriage.spouse);
    marriage.children.forEach(function (person: Person) {
      heirs.push(person);
    });
  });

  return (
    <>
      <PersonRow
        key={person.id}
        person={person}
        hideCode={props.hideCode}
        setTreeValue={props.setTreeValue}
      />
      {heirs.map((person: Person) =>
        props.split ? (
          <PersonRow
            key={person.id}
            person={person}
            hideCode={props.hideCode}
            setTreeValue={props.setTreeValue}
          />
        ) : (
          <FamilyRows
            key={person.id}
            person={person}
            split={props.split}
            hideCode={props.hideCode}
            setTreeValue={props.setTreeValue}
          />
        )
      )}
    </>
  );
}

function PersonRow({ person, hideCode }: PersonRowProps) {
  const name = person.name || person.id;

  return (
    <tr>
      <td hidden={hideCode}>{person.code}</td>
      <td>
        {name}
        {person.name && <small className="fw-light"> ({person.id})</small>}
      </td>
      <td>{person.birthplace}</td>
      <td>{person.birthdate}</td>
      <td>{person.phone}</td>
      <td>{person.address}</td>
      <td>{person.ig}</td>
    </tr>
  );
}
