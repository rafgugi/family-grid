import {
  Button,
  FormFeedback,
  FormGroup,
  Input,
  Label,
  Modal,
  ModalBody,
  ModalFooter,
  ModalHeader,
} from 'reactstrap';
import { useContext, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Marriage, Person } from '../family.interface';
import AppContext from './AppContext';

interface ModalAddSpouseProps {
  person: Person | null;
  setPerson: (p: Person | null) => void;
  isOpen: boolean;
  toggle: () => void;
}

function ModalAddSpouse({
  person,
  setPerson,
  isOpen,
  toggle,
}: ModalAddSpouseProps) {
  const { treeMap, upsertPerson } = useContext(AppContext);
  const [spouse, setSpouse] = useState('');
  const [spouseError, setSpouseError] = useState('');
  const { t } = useTranslation();

  const people = Object.values(treeMap);

  const handlePersonChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const person = treeMap[event.target.value];
    setPerson(person || null);
    setSpouse('');
  };

  const handleSpouseChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    setSpouse(event.target.value);

    setSpouseError('');
    if (Object.keys(treeMap).includes(value)) {
      setSpouseError(t('error.alreadyTaken', { value: value }));
    }
  };

  const validForm = person && spouse && !spouseError;

  const handleSubmit = () => {
    if (!person || !validForm) return;

    const spousePerson: Person = {
      id: spouse,
      code: '',
      marriages: [] as Marriage[],
    };
    person.marriages.push({
      spouse: spousePerson,
      children: [],
    });

    upsertPerson(person);
    setPerson(null);
    setSpouse('');
    toggle();
  };

  return (
    <Modal isOpen={isOpen} toggle={toggle} unmountOnClose>
      <ModalHeader toggle={toggle}>Add a spouse</ModalHeader>
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
        {person && (
          <FormGroup>
            <Label for="input-spouse">Spouse</Label>
            <Input
              id="input-spouse"
              type="text"
              placeholder={t('config.placeholder.spouse')}
              value={spouse}
              onChange={handleSpouseChange}
              invalid={spouseError !== ''}
            />
            {spouseError !== '' && <FormFeedback>{spouseError}</FormFeedback>}
          </FormGroup>
        )}
      </ModalBody>
      <ModalFooter>
        <Button disabled={!validForm} onClick={handleSubmit}>
          {t('config.button.submit')}
        </Button>
      </ModalFooter>
    </Modal>
  );
}

export default ModalAddSpouse;
