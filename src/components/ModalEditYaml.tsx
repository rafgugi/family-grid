import {
  useContext,
  useDeferredValue,
  useEffect,
  useMemo,
  useState,
} from 'react';
import {
  Button,
  Card,
  CardBody,
  FormFeedback,
  FormGroup,
  Input,
  Label,
  Modal,
  ModalBody,
  ModalFooter,
  ModalHeader,
} from 'reactstrap';
import { Person } from '../family.interface';
import { enrichTreeData } from '../family.util';
import { parse } from 'yaml';
import { useTranslation } from 'react-i18next';
import AppContext from './AppContext';
import FamilyDiagram from './FamilyDiagram';

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
  const [trees, setTrees] = useState([] as Person[]);
  const { t } = useTranslation();
  const deferredTree = useDeferredValue(trees);
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
      const trees = treesFromYaml(deferredTreeYaml);
      setTrees(trees);
      setYamlError('');
    } catch (e: any) {
      setYamlError(e.message);
    }
  }, [deferredTreeYaml]);

  const rows = useMemo(() => {
    const lines = treeYaml.split('\n').length;
    return Math.min(Math.max(lines, MIN_ROW), MAX_ROW);
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
      <ModalHeader toggle={toggle}>{t('config.edit_tree')}</ModalHeader>
      <ModalBody>
        <FormGroup>
          <span className="mb-2 d-inline-block">
            {t('config.label.tree_preview')}
          </span>
          <Card outline color={validForm ? '' : 'danger'}>
            <CardBody style={{ opacity: validForm ? 1 : 0.3 }}>
              <FamilyDiagram trees={deferredTree} />
            </CardBody>
          </Card>
        </FormGroup>
        <FormGroup>
          <Label for="edit-tree">{t('config.label.edit_tree')}</Label>
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
          {t('config.button.apply')}
        </Button>
      </ModalFooter>
    </Modal>
  );
}

export default ModalEditYaml;
