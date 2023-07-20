import { ChangeEvent, useContext } from 'react';
import { Input, Table } from 'reactstrap';
import { Person } from '../family.interface';
import { explodeTrees } from '../family.util';
import AppContext from './AppContext';

interface FamilyGridProps {
  trees: Person[];
}

export default function FamilyGrid({ trees }: FamilyGridProps) {
  const { hidePersonCode } = useContext(AppContext);

  return (
    <Table size="sm" bordered hover responsive>
      <thead>
        <tr>
          <th style={{ width: '7em' }} hidden={hidePersonCode}>
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
          <FamilyRows key={person.id} person={person} />
        ))}
      </tbody>
    </Table>
  );
}

interface PersonRowProps {
  person: Person;
}

function FamilyRows({ person, ...props }: PersonRowProps) {
  const { split } = useContext(AppContext);
  var heirs: Person[];
  if (split) {
    heirs = explodeTrees([person], 2);
  } else {
    heirs = explodeTrees([person]);
  }

  return (
    <>
      {heirs.map((person: Person) => (
        <PersonRow {...props} key={person.id} person={person} />
      ))}
    </>
  );
}

function PersonRow({ person }: PersonRowProps) {
  const { editMode, hidePersonCode, upsertPerson } = useContext(AppContext);
  const name = person.name || person.id;

  const updatePerson = function (e: ChangeEvent<any>, key: string) {
    upsertPerson({ ...person, [key]: e.target.value });
  };

  let inputClass = 'd-none';
  let spanClass = '';
  if (editMode) {
    inputClass = 'd-print-none';
    spanClass = 'd-none d-print-block';
  }

  return (
    <tr>
      <td hidden={hidePersonCode}>
        <span>{person.code}</span>
      </td>
      <td>
        <Input
          bsSize="sm"
          className={inputClass}
          value={person.name || ''}
          placeholder={person.id}
          onChange={e => updatePerson(e, 'name')}
        />
        <span className={spanClass}>
          {name}
          {person.name && <small className="fw-light"> ({person.id})</small>}
        </span>
      </td>
      <td>
        <Input
          bsSize="sm"
          className={inputClass}
          value={person.birthplace || ''}
          onChange={e => updatePerson(e, 'birthplace')}
        />
        <span className={spanClass}>{person.birthplace}</span>
      </td>
      <td>
        <Input
          bsSize="sm"
          className={inputClass}
          value={person.birthdate || ''}
          onChange={e => updatePerson(e, 'birthdate')}
        />
        <span className={spanClass}>{person.birthdate}</span>
      </td>
      <td>
        <Input
          bsSize="sm"
          className={inputClass}
          value={person.phone || ''}
          onChange={e => updatePerson(e, 'phone')}
        />
        <span className={spanClass}>{person.phone}</span>
      </td>
      <td>
        <Input
          bsSize="sm"
          className={inputClass}
          value={person.address || ''}
          onChange={e => updatePerson(e, 'address')}
        />
        <span className={spanClass}>{person.address}</span>
      </td>
      <td>
        <Input
          bsSize="sm"
          className={inputClass}
          value={person.ig || ''}
          onChange={e => updatePerson(e, 'ig')}
        />
        <span className={spanClass}>{person.ig}</span>
      </td>
    </tr>
  );
}
