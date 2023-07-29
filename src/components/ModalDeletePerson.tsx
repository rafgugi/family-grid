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
import { useContext } from 'react';
import { Person } from '../family.interface';
import AppContext from './AppContext';

interface ModalDeletePersonProps {
  person: Person | null;
  setPerson: (p: Person | null) => void;
  isOpen: boolean;
  toggle: () => void;
}

function ModalDeletePerson({
  person,
  setPerson,
  isOpen,
  toggle,
}: ModalDeletePersonProps) {
  const { treeMap, deletePerson } = useContext(AppContext);
  const people = Object.values(treeMap);

  const handlePersonChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const person = treeMap[event.target.value];
    setPerson(person || null);
  };

  const handleSubmit = () => {
    if (!person) return;

    deletePerson(person);
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
