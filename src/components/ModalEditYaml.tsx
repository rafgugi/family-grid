import {
  useContext,
  useDeferredValue,
  useEffect,
  useMemo,
  useState,
} from 'react';
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
import { enrichTreeData } from '../family.util';
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

function ModalEditYaml({
  treeYaml,
  setTreeYaml,
  isOpen,
  toggle,
}: ModalDeletePersonProps) {
  const { setTreesValue } = useContext(AppContext);
  const [yamlError, setYamlError] = useState('');
  const deferredTreeYaml = useDeferredValue(treeYaml);
  const loading = deferredTreeYaml !== treeYaml;

  const validForm = treeYaml && !yamlError;

  const treesFromYaml = (yaml: string) => {
    const rawFamilyData = parse(yaml);
    return enrichTreeData(rawFamilyData?.trees, rawFamilyData?.people);
  };
  useEffect(() => {
    try {
      // test parsing the yaml
      treesFromYaml(deferredTreeYaml);
      setYamlError('');
    } catch (e: any) {
      setYamlError(e.message);
    }
  }, [deferredTreeYaml]);

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
    if (loading || !validForm) return;

    const trees = treesFromYaml(treeYaml);
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
            invalid={!validForm}
          />
          {yamlError !== '' && (
            <FormFeedback>
              <pre>{yamlError}</pre>
            </FormFeedback>
          )}
        </FormGroup>
      </ModalBody>
      <ModalFooter>
        <Button color="warning" disabled={!validForm} onClick={handleSubmit}>
          Update!
        </Button>
      </ModalFooter>
    </Modal>
  );
}

export default ModalEditYaml;
