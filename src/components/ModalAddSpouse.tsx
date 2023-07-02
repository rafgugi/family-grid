import {
  Button,
  FormFeedback,
  FormGroup,
  Input,
  Label,
  Modal,
  ModalBody,
  ModalHeader,
} from 'reactstrap';
import { Dispatch, useState } from 'react';
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
  const [spouseError, setSpouseError] = useState('');

  const marriedPeople = Object.values(record).filter(
    person => person.marriages.length > 0
  );

  const handlePersonChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const person = record[event.target.value];
    setPerson(person || null);
    setSpouse('');
  };

  const handleSpouseChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    setSpouse(event.target.value);

    setSpouseError('');
    if (Object.keys(record).includes(value)) {
      setSpouseError(value + ' is already taken');
    }
  };

  const validForm = () => person && spouse && !spouseError;

  const handleSubmit = () => {
    if (!person || !validForm()) return;

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
    <Modal isOpen={props.isOpen} toggle={props.toggle} unmountOnClose>
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
            {marriedPeople.map(person => (
              <option key={person.id} value={person.id}>
                {person.id}
              </option>
            ))}
          </Input>
        </FormGroup>
        {person && (
          <FormGroup>
            <Label for="input-spouse">Spouse</Label>
            <Input
              id="input-spouse"
              type="text"
              placeholder="Insert spouse unique nickname"
              value={spouse}
              onChange={handleSpouseChange}
              invalid={spouseError !== ''}
            />
            {spouseError !== '' && <FormFeedback>{spouseError}</FormFeedback>}
          </FormGroup>
        )}
        <Button disabled={!validForm()} onClick={handleSubmit}>
          Submit
        </Button>
      </ModalBody>
    </Modal>
  );
}

export default ModalAddSpouse;
