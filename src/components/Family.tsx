import React from 'react';
import { Person, Marriage } from '../family.interface';

interface FamilyProps {
  person: Person;
  code: string;
  showAddress?: boolean;
}

export function Family({ person, code, showAddress }: FamilyProps) {
  if (person.marriages.length === 0) {
    return (
      <PersonRow code={code} person={person} />
    )
  }

  const heirs: Person[] = [];
  person.marriages.forEach(function (marriage: Marriage) {
    marriage.children.forEach(function (person: Person) {
      heirs.push(person)
    });
    heirs.push(marriage.spouse);
  });

  return (
    <>
      <PersonRow key={person.id} code="P" person={person} />
      <tr key="address" hidden={!showAddress || !person.address} className="table-secondary">
        <td colSpan={7}>{person.address}</td>
      </tr>
      {person.marriages.map((marriage: Marriage) =>
        <React.Fragment key={marriage.spouse.id}>
          <Family key={marriage.spouse.id} code="M" person={marriage.spouse} />
          {marriage.children.map((person: Person) =>
            <Family key={person.id} code="C" person={person} />
          )}
        </React.Fragment>
      )}
    </>
  );
}

interface PersonRowProps {
  code: string;
  person: Person;
}

function PersonRow({ code, person }: PersonRowProps) {
  const name = person.name || person.id;

  return (
    <tr>
      <td className="text-center" style={{ width: "30px" }} hidden>{code}</td>
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
