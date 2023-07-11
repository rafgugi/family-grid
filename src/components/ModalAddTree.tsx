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
import { Marriage, Person } from '../family.interface';
import AppContext from './AppContext';

interface ModalAddTreeProps {
  isOpen: boolean;
  toggle: () => void;
}

function ModalAddTree({ isOpen, toggle }: ModalAddTreeProps) {
  const { treeMap, setTreeValue } = useContext(AppContext);
  const [child, setChild] = useState('');
  const [childError, setChildError] = useState('');

  const handleChildChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    setChild(value);

    setChildError('');
    if (Object.keys(treeMap).includes(value)) {
      setChildError(value + ' is already taken');
    }
  };

  const validForm = () => child && !childError;

  const handleSubmit = () => {
    if (!validForm()) return;

    const tree: Person = {
      id: child,
      code: '',
      marriages: [] as Marriage[],
    };

    setTreeValue(tree);
    setChild('');
    toggle();
  };

  return (
    <Modal isOpen={isOpen} toggle={toggle} unmountOnClose>
      <ModalHeader toggle={toggle}>Add a tree</ModalHeader>
      <ModalBody>
        <FormGroup>
          <Label for="input-child">Child</Label>
          <Input
            id="input-tree"
            type="text"
            placeholder="Insert tree nickname"
            value={child}
            onChange={handleChildChange}
            invalid={childError !== ''}
          />
          {childError !== '' && <FormFeedback>{childError}</FormFeedback>}
        </FormGroup>
      </ModalBody>
      <ModalFooter>
        <Button disabled={!validForm()} onClick={handleSubmit}>
          Submit
        </Button>
      </ModalFooter>
    </Modal>
  );
}

export default ModalAddTree;
