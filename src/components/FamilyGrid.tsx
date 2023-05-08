import React from 'react';
import { Table } from 'reactstrap';
import { Person, Marriage } from '../family.interface';

interface FamilyGridProps {
  person: Person;
}

export default function FamilyGrid({ person }: FamilyGridProps) {
  return (
    <Table size="sm" bordered hover responsive>
      <thead></thead>
      <tbody>
        <Family key={person.id} person={person} />
      </tbody>
    </Table>
  )
}

interface FamilyProps {
  person: Person;
  showAddress?: boolean;
}

function Family({ person, showAddress }: FamilyProps) {
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
      {heirs.map((person: Person) =>
        <Family key={person.id} person={person} />
      )}
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
      <td className="text-left" style={{ width: "7.5em" }}>{person.code}</td>
      <td className="text-left" style={{ }}>
        {name}
        {person.name && <small className="fw-light"> ({person.id})</small>}
      </td>
      <td className="text-center" style={{ width: "30px" }} hidden>{person.sex}</td>
      <td className="text-left" style={{ width: "7em" }}>{person.birthplace}</td>
      <td className="text-left" style={{ width: "7em" }}>{person.birthdate}</td>
      <td className="text-left" style={{ width: "8.5em" }}>{person.ig}</td>
      <td className="text-left" style={{ width: "8.5em" }}>{person.phone}</td>
      <td className="text-left" style={{ }}>{person.address}</td>
    </tr>
  )
}
