import { Table } from 'reactstrap';
import { Person, Marriage } from '../family.interface';

interface FamilyGridProps {
  trees: Person[];
  split: boolean;
}

export default function FamilyGrid({ trees, split }: FamilyGridProps) {
  return (
    <Table size="sm" bordered hover responsive>
      <thead>
        <tr>
          <th className="text-left" style={{ width: "7.5em" }}>Code</th>
          <th className="text-left" style={{ }}>Name</th>
          <th className="text-center" style={{ width: "30px" }} hidden>Sex</th>
          <th className="text-left" style={{ width: "7em" }}>Birthplace</th>
          <th className="text-left" style={{ width: "7em" }}>Birthdate</th>
          <th className="text-left" style={{ width: "8.5em" }}>Phone</th>
          <th className="text-left" style={{ }}>Address</th>
          <th className="text-left" style={{ width: "8.5em" }}>IG</th>
        </tr>
      </thead>
      <tbody>
        {trees.map(person =>
          <Family key={person.id} person={person} split={split} />
        )}
      </tbody>
    </Table>
  )
}

interface FamilyProps {
  person: Person;
  split: boolean;
  showAddress?: boolean;
}

function Family({ person, split, showAddress }: FamilyProps) {
  const heirs: Person[] = [];
  person.marriages.forEach(function (marriage: Marriage) {
    heirs.push(marriage.spouse);
    marriage.children.forEach(function (person: Person) {
      heirs.push(person)
    });
  });

  return (
    <>
      <PersonRow key={person.id} person={person} />
      <tr key="address" hidden={!showAddress || !person.address} className="table-secondary">
        <td colSpan={7}>{person.address}</td>
      </tr>
      {heirs.map((person: Person) => split ? (
        <PersonRow key={person.id} person={person} />
      ) : (
        <Family key={person.id} person={person} split={split} />
      ))}
    </>
  );
}

interface PersonRowProps {
  person: Person;
}

function PersonRow({ person }: PersonRowProps) {
  const name = person.name || person.id;

  return (
    <tr>
      <td className="text-left">{person.code}</td>
      <td className="text-left">
        {name}
        {person.name && <small className="fw-light"> ({person.id})</small>}
      </td>
      <td className="text-center" hidden>{person.sex}</td>
      <td className="text-left">{person.birthplace}</td>
      <td className="text-left">{person.birthdate}</td>
      <td className="text-left">{person.phone}</td>
      <td className="text-left">{person.address}</td>
      <td className="text-left">{person.ig}</td>
    </tr>
  )
}
