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

interface ModalAddChildProps {
  person: Person | null;
  setPerson: (p: Person | null) => void;
  spouse: Person | null;
  setSpouse: (p: Person | null) => void;
  isOpen: boolean;
  toggle: () => void;
}

function ModalAddChild({
  person,
  setPerson,
  spouse,
  setSpouse,
  isOpen,
  toggle,
}: ModalAddChildProps) {
  const { treeMap, upsertPerson } = useContext(AppContext);
  const [child, setChild] = useState('');
  const [childError, setChildError] = useState('');
  const { t } = useTranslation();

  const marriedPeople = Object.values(treeMap).filter(
    person => person.marriages.length > 0
  );

  const handlePersonChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const person = treeMap[event.target.value];
    setPerson(person || null);
    setSpouse(null);
    if (person.marriages.length === 1) {
      setSpouse(person.marriages[0].spouse);
    }
    setChild('');
  };

  const handleSpouseChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const spouse = treeMap[event.target.value];
    setSpouse(spouse || null);
    setChild('');
  };

  const handleChildChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    setChild(value);

    setChildError('');
    if (Object.keys(treeMap).includes(value)) {
      setChildError(t('error.alreadyTaken', { value: value }));
    }
  };

  const validForm = person && spouse && child && !childError;

  const handleSubmit = () => {
    if (!person || !spouse || !validForm) return;

    const marriage = person.marriages.find(
      (m: Marriage) => m.spouse.id === spouse.id
    );
    if (!marriage) return;

    const childPerson: Person = {
      id: child,
      code: '',
      marriages: [] as Marriage[],
    };
    marriage.children.push(childPerson);

    upsertPerson(person);
    setPerson(null);
    setSpouse(null);
    setChild('');
    toggle();
  };

  return (
    <Modal isOpen={isOpen} toggle={toggle} unmountOnClose>
      <ModalHeader toggle={toggle}>{t('config.label.addChild')}</ModalHeader>
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
            {marriedPeople.map(person => (
              <option key={person.id} value={person.id}>
                {person.id}
              </option>
            ))}
          </Input>
        </FormGroup>
        {person && (
          <FormGroup>
            <Label for="select-spouse">{t('config.label.spouse')}</Label>
            <Input
              type="select"
              id="select-spouse"
              value={spouse ? spouse.id : ''}
              onChange={handleSpouseChange}
            >
              <option value="">{t('config.label.selectSpouse')}</option>
              {person.marriages.map(marriage => (
                <option key={marriage.spouse.id} value={marriage.spouse.id}>
                  {marriage.spouse.id}
                </option>
              ))}
            </Input>
          </FormGroup>
        )}
        {person && spouse && (
          <FormGroup>
            <Label for="input-child">{t('config.label.child')}</Label>
            <Input
              id="input-child"
              type="text"
              placeholder={t('config.placeholder.child')}
              value={child}
              onChange={handleChildChange}
              invalid={childError !== ''}
            />
            {childError !== '' && <FormFeedback>{childError}</FormFeedback>}
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

export default ModalAddChild;
