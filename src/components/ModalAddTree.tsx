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

interface ModalAddTreeProps {
  isOpen: boolean;
  toggle: () => void;
}

function ModalAddTree({ isOpen, toggle }: ModalAddTreeProps) {
  const { treeMap, upsertPerson } = useContext(AppContext);
  const [child, setChild] = useState('');
  const [childError, setChildError] = useState('');
  const { t } = useTranslation();

  const handleChildChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    setChild(value);

    setChildError('');
    if (Object.keys(treeMap).includes(value)) {
      setChildError(t('error.already_taken', { value: value }));
    }
  };

  const validForm = child && !childError;

  const handleSubmit = () => {
    if (!validForm) return;

    const tree: Person = {
      id: child,
      code: '',
      marriages: [] as Marriage[],
    };

    upsertPerson(tree);
    setChild('');
    toggle();
  };

  return (
    <Modal isOpen={isOpen} toggle={toggle} unmountOnClose>
      <ModalHeader toggle={toggle}>{t('config.label.add_tree')}</ModalHeader>
      <ModalBody>
        <FormGroup>
          <Label for="input-tree">{t('config.label.person')}</Label>
          <Input
            id="input-tree"
            type="text"
            placeholder={t('config.placeholder.person')}
            value={child}
            onChange={handleChildChange}
            invalid={childError !== ''}
          />
          {childError !== '' && <FormFeedback>{childError}</FormFeedback>}
        </FormGroup>
      </ModalBody>
      <ModalFooter>
        <Button disabled={!validForm} onClick={handleSubmit}>
          {t('config.button.apply')}
        </Button>
      </ModalFooter>
    </Modal>
  );
}

export default ModalAddTree;
