import { Button, FormGroup, Input, Label, Modal, ModalBody, ModalHeader } from 'reactstrap';
import { Dispatch, useEffect, useState } from 'react';
import { Marriage, Person } from '../family.interface';

interface ModalAddSpouseProps {
  person: Person | null;
  setPerson: Dispatch<any>;
  isOpen: boolean;
  toggle: () => void;
  record: Record<string, Person>;
  setTreeValue: (p: Person) => void;
}

function ModalAddSpouse(props: ModalAddSpouseProps) {
  const person = props.person;
  const setPerson = props.setPerson;
  const record = props.record;
  const [spouse, setSpouse] = useState('');

  // this is for debgging performance only
  useEffect(() => {
    console.log("useEffect of ModalAddSpouse");
  });

  const marriedPeople = Object.values(record).filter(
    (person) => person.marriages.length > 0
  );

  const handlePersonChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const person = record[event.target.value];
    setPerson(person || null);
    setSpouse('');
  };

  const handleChildChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSpouse(event.target.value);
  };

  const handleSubmit = () => {
    if (!person || !spouse) return;

    if (Object.keys(record).includes(spouse)) {
      console.log(spouse + ' is already exist');
      return;
    }

    const spousePerson: Person = {
      id: spouse,
      code: '',
      marriages: [] as Marriage[],
    };
    person.marriages.push({
      spouse: spousePerson,
      children: [],
    });

    props.setTreeValue(person);
    setPerson(null);
    setSpouse('');
    props.toggle();
  };

  return (
    <Modal
      isOpen={props.isOpen}
      toggle={props.toggle}
      unmountOnClose={true}
    >
      <ModalHeader toggle={props.toggle}>Add a spouse</ModalHeader>
      <ModalBody>
        <FormGroup>
          <Label for="select-person">Person</Label>
          <Input
            type="select"
            id="select-person"
            value={person ? person.id : ''}
            onChange={handlePersonChange}
          >
            <option value="">Select a person</option>
            {marriedPeople.map((person) => (
              <option key={person.id} value={person.id}>
                {person.id}
              </option>
            ))}
          </Input>
        </FormGroup>
        {person && (
          <FormGroup>
            <Label for="input-spouse">
              Spouse
            </Label>
            <Input
              id="input-spouse"
              placeholder=""
              type="text"
              value={spouse}
              onChange={handleChildChange}
            />
          </FormGroup>
        )}
        <Button
          disabled={!(person && spouse !== '')}
          onClick={handleSubmit}
        >
          Submit
        </Button>
      </ModalBody>
    </Modal>
  );
}

export default ModalAddSpouse;
