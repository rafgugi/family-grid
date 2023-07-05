import {
  Button,
  FormGroup,
  Input,
  Label,
  Modal,
  ModalBody,
  ModalFooter,
  ModalHeader,
} from 'reactstrap';
import { Dispatch } from 'react';
import { Person } from '../family.interface';

interface ModalDeletePersonProps {
  person: Person | null;
  setPerson: Dispatch<any>;
  isOpen: boolean;
  toggle: () => void;
  record: Record<string, Person>;
  deleteTreePerson: (person: Person) => void;
}

function ModalDeletePerson({
  person,
  setPerson,
  isOpen,
  toggle,
  record,
  deleteTreePerson,
}: ModalDeletePersonProps) {
  const people = Object.values(record);

  const handlePersonChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const person = record[event.target.value];
    setPerson(person || null);
  };

  const handleSubmit = () => {
    if (!person) return;

    deleteTreePerson(person);
    setPerson(null);
    toggle();
  };

  return (
    <Modal isOpen={isOpen} toggle={toggle} unmountOnClose>
      <ModalHeader toggle={toggle}>Delete a person</ModalHeader>
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
            {people.map(person => (
              <option key={person.id} value={person.id}>
                {person.id}
              </option>
            ))}
          </Input>
        </FormGroup>
      </ModalBody>
      <ModalFooter>
        <Button color="danger" disabled={!person} onClick={handleSubmit}>
          Delete!
        </Button>
      </ModalFooter>
    </Modal>
  );
}

export default ModalDeletePerson;
