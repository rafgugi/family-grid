import { Table } from 'reactstrap';
import { Person, Marriage } from '../family.interface';

interface FamilyGridProps {
  trees: Person[];
  split: boolean;
  hideCode: boolean;
}

export default function FamilyGrid({
  trees,
  split,
  hideCode,
}: FamilyGridProps) {
  return (
    <Table size="sm" bordered hover responsive>
      <thead>
        <tr>
          <th style={{ width: '7em' }} hidden={hideCode}>
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
        {trees.map(person => (
          <Family
            key={person.id}
            person={person}
            hideCode={hideCode}
            split={split}
          />
        ))}
      </tbody>
    </Table>
  );
}

interface FamilyProps {
  person: Person;
  split: boolean;
  hideCode: boolean;
  showAddress?: boolean;
}

function Family({ person, split, showAddress, hideCode }: FamilyProps) {
  const heirs: Person[] = [];
  person.marriages.forEach(function (marriage: Marriage) {
    heirs.push(marriage.spouse);
    marriage.children.forEach(function (person: Person) {
      heirs.push(person);
    });
  });

  return (
    <>
      <PersonRow key={person.id} person={person} hideCode={hideCode} />
      <tr
        key="address"
        hidden={!showAddress || !person.address}
        className="table-secondary"
      >
        <td colSpan={7}>{person.address}</td>
      </tr>
      {heirs.map((person: Person) =>
        split ? (
          <PersonRow key={person.id} person={person} hideCode={hideCode} />
        ) : (
          <Family
            key={person.id}
            person={person}
            split={split}
            hideCode={hideCode}
          />
        )
      )}
    </>
  );
}

interface PersonRowProps {
  person: Person;
  hideCode: boolean;
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
