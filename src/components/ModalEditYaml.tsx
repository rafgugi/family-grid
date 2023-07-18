import { useContext, useMemo } from 'react';
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
import { parse } from 'yaml';
import AppContext from './AppContext';

interface ModalDeletePersonProps {
  treeYaml: string;
  setTreeYaml: (treeYaml: string) => void;
  isOpen: boolean;
  toggle: () => void;
}

const MIN_ROW = 3;
const MAX_ROW = 20;

function ModalDeletePerson({
  treeYaml,
  setTreeYaml,
  isOpen,
  toggle,
}: ModalDeletePersonProps) {
  const { setTreesValue } = useContext(AppContext);

  const rows = useMemo(() => {
    const lines = treeYaml.split('\n').length;
    if (lines < MIN_ROW) return MIN_ROW;
    if (lines > MAX_ROW) return MAX_ROW;
    return lines;
  }, [treeYaml]);
  const handleTreeYamlChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const treeYaml = event.target.value;
    setTreeYaml(treeYaml);
  };

  const handleSubmit = () => {
    const trees = parse(treeYaml);
    setTreesValue(trees);
    toggle();
  };

  return (
    <Modal size="xl" isOpen={isOpen} toggle={toggle} unmountOnClose>
      <ModalHeader toggle={toggle}>Edit tree</ModalHeader>
      <ModalBody>
        <FormGroup>
          <Label for="edit-tree">Tree</Label>
          <Input
            type="textarea"
            id="edit-tree"
            value={treeYaml}
            onChange={handleTreeYamlChange}
            rows={rows}
            style={{ fontFamily: 'monospace' }}
          />
        </FormGroup>
      </ModalBody>
      <ModalFooter>
        <Button color="warning" disabled={!treeYaml} onClick={handleSubmit}>
          Update!
        </Button>
      </ModalFooter>
    </Modal>
  );
}

export default ModalDeletePerson;
