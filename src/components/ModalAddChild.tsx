import { Button, FormGroup, Input, Label, Modal, ModalBody, ModalHeader } from 'reactstrap';
import { Dispatch, useEffect, useState } from 'react';
import { Marriage, Person } from '../family.interface';

interface ModalAddChildProps {
  person: Person | null;
  setPerson: Dispatch<any>;
  spouse: Person | null;
  setSpouse: Dispatch<any>;
  isOpen: boolean;
  toggle: () => void;
  record: Record<string, Person>;
  setTreeValue: (p: Person) => void;
}

function ModalAddChild(props: ModalAddChildProps) {
  const person = props.person;
  const setPerson = props.setPerson;
  const spouse = props.spouse;
  const setSpouse = props.setSpouse;
  const record = props.record;
  const [child, setChild] = useState('');

  // this is for debgging performance only
  useEffect(() => {
    console.log("useEffect of ModalAddChild");
  });

  const marriedPeople = Object.values(record).filter(
    (person) => person.marriages.length > 0
  );

  const handlePersonChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const person = record[event.target.value];
    setPerson(person || null);
    setSpouse(null);
    if (person.marriages.length === 1) {
      setSpouse(person.marriages[0].spouse);
    }
    setChild('');
  };

  const handleSpouseChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const spouse = record[event.target.value];
    setSpouse(spouse || null);
    setChild('');
  };

  const handleChildChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setChild(event.target.value);
  };

  const handleSubmit = () => {
    if (!person || !spouse || !child) return;

    if (Object.keys(record).includes(child)) {
      console.log(child + ' is already exist');
      return;
    }

    const marriage = person.marriages.find((m: Marriage) =>
      m.spouse.id === spouse.id
    );
    if (!marriage) return;

    const childPerson: Person = {
      id: child,
      code: '',
      marriages: [] as Marriage[],
    };
    marriage.children.push(childPerson);

    props.setTreeValue(person);
    setPerson(null);
    setSpouse(null);
    setChild('');
    props.toggle();
  };

  return (
    <Modal
      isOpen={props.isOpen}
      toggle={props.toggle}
      unmountOnClose={true}
    >
      <ModalHeader toggle={props.toggle}>Add a child</ModalHeader>
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
            <Label for="select-spouse">Spouse</Label>
            <Input
              type="select"
              id="select-spouse"
              value={spouse ? spouse.id : ''}
              onChange={handleSpouseChange}
            >
              <option value="">Select a spouse</option>
              {person.marriages.map((marriage) => (
                <option key={marriage.spouse.id} value={marriage.spouse.id}>
                  {marriage.spouse.id}
                </option>
              ))}
            </Input>
          </FormGroup>
        )}
        {person && spouse && (
          <FormGroup>
            <Label for="input-child">
              Child
            </Label>
            <Input
              id="input-child"
              placeholder=""
              type="text"
              value={child}
              onChange={handleChildChange}
            />
          </FormGroup>
        )}
        <Button
          disabled={!(person && spouse && child !== '')}
          onClick={handleSubmit}
        >
          Submit
        </Button>
      </ModalBody>
    </Modal>
  );
}

export default ModalAddChild;
