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
import { useTranslation } from 'react-i18next';
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
  const { t } = useTranslation();
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
      <ModalHeader toggle={toggle}>
        {t('config.label.deletePerson')}
      </ModalHeader>
      <ModalBody>
        <FormGroup>
          <Label for="select-person">{t('config.label.person')}</Label>
          <Input
            type="select"
            id="select-person"
            value={person ? person.id : ''}
            onChange={handlePersonChange}
          >
            <option value="">{t('config.label.selectPerson')}</option>
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
          {t('config.button.delete')}
        </Button>
      </ModalFooter>
    </Modal>
  );
}

export default ModalDeletePerson;
