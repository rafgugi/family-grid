import {
  Button,
  ButtonGroup,
  Container,
  DropdownToggle,
  DropdownMenu,
  DropdownItem,
  Form,
  FormGroup,
  Input,
  Label,
  Alert,
  UncontrolledDropdown,
  UncontrolledTooltip,
} from 'reactstrap';
import { useEffect, useMemo, useState } from 'react';
import { parse, stringify } from 'yaml';
import { saveAs } from 'file-saver';
import { Person } from '../family.interface';
import AppContext from './AppContext';
import Family from './Family';
import ModalAddChild from './ModalAddChild';
import ModalAddSpouse from './ModalAddSpouse';
import ModalAddTree from './ModalAddTree';
import ModalDeletePerson from './ModalDeletePerson';
import ModalEditYaml from './ModalEditYaml';
import {
  deletePerson,
  enrichTreeData,
  getTopNPeopleIds,
  treesToRecord,
  unrichTreeData,
} from '../utils/family-tree';
import { importCsvToTree } from '../utils/csv.util';
import { useCache } from '../hooks/useCache';
import { useTranslation } from 'react-i18next';
import Footer from './Footer';
import ModalExportCsv from './ModalExportCsv';

interface AppProps {
  trees: Person[];
  split?: boolean;
}

function App(props: AppProps) {
  const [trees, setTreesValue] = useCache('trees', props.trees);

  const [split, setSplitValue] = useCache('split', !!props.split);
  const [hidePersonCode, setHideCode] = useCache('hideCode', false);
  const [hidePersonIg, setHideIg] = useCache('hideCode', false);
  const [editMode, setEditModeValue] = useState(false);

  const [modalPerson, setModalPerson] = useState(null as Person | null);
  const [modalSpouse, setModalSpouse] = useState(null as Person | null);
  const [treeYaml, setTreeYaml] = useState('');

  const { t, i18n } = useTranslation();
  const [language, setLanguage] = useCache('language', i18n.language);
  i18n.on('languageChanged', (lang: string) => setLanguage(lang));
  useEffect(() => {
    i18n.changeLanguage(language);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps
  const languages = i18n.languages ? [...i18n.languages].sort() : [];

  const [showModalAddTree, setShowModalAddTree] = useState(false);
  const toggleModalAddTree = () => setShowModalAddTree(!showModalAddTree);
  const openModalAddTree = () => {
    setShowModalAddTree(true);
  };

  const [showModalAddChild, setShowModalAddChild] = useState(false);
  const toggleModalAddChild = () => setShowModalAddChild(!showModalAddChild);
  const openModalAddChild = (person: Person) => {
    setModalPerson(person);
    setShowModalAddChild(true);
  };

  const [showModalAddSpouse, setShowModalAddSpouse] = useState(false);
  const toggleModalAddSpouse = () => setShowModalAddSpouse(!showModalAddSpouse);
  const openModalAddSpouse = (person: Person) => {
    setModalPerson(person);
    setShowModalAddSpouse(true);
  };

  const [showModalEditYaml, setShowModalEditYaml] = useState(false);
  const toggleModalEditYaml = () => setShowModalEditYaml(!showModalEditYaml);
  const openModalEditYaml = () => {
    setTreeYaml(stringify(unrichTreeData(trees)));
    setShowModalEditYaml(true);
  };

  const [showModalDeletePerson, setShowModalDeletePerson] = useState(false);
  const toggleModalDeletePerson = () =>
    setShowModalDeletePerson(!showModalDeletePerson);
  const openModalDeletePerson = () => {
    setModalPerson(null);
    setShowModalDeletePerson(true);
  };

  const [showCsvHelpModal, setShowCsvHelpModal] = useState(false);
  const toggleCsvHelpModal = () => setShowCsvHelpModal(!showCsvHelpModal);

  const [csvImportMessage, setCsvImportMessage] = useState<{
    type: 'success' | 'danger';
    message: string;
  } | null>(null);

  const handleExportYaml = () => {
    try {
      const unrichedTrees = unrichTreeData(trees);
      const topNPeople = getTopNPeopleIds(trees, 3);
      const treeYaml = stringify(unrichedTrees as {});
      const blob = new Blob([treeYaml], { type: 'text/yaml;charset=utf-8' });
      saveAs(blob, `family_${topNPeople}.yaml`);
    } catch (error) {
      console.error('Error saving YAML file:', error);
    }
  };

  const handleExportCsv = () => {
    setShowCsvHelpModal(true);
  };

  const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const extension = file.name.split('.').pop()?.toLowerCase();
    if (extension === 'yaml' || extension === 'yml') {
      const reader = new FileReader();
      reader.onload = () => {
        try {
          const treeYaml = reader.result as string;
          const rawFamilyData = parse(treeYaml);
          const trees = enrichTreeData(
            rawFamilyData?.trees,
            rawFamilyData?.people
          );

          const unrichedTrees = unrichTreeData(trees);
          setTreeYaml(stringify(unrichedTrees as {}));
          setShowModalEditYaml(true);
        } catch (error) {
          console.error('Error loading YAML file:', error);
          setCsvImportMessage({
            type: 'danger',
            message: `${t('csv.importFailed')}: ${error}`,
          });
        }
      };
      reader.readAsText(file);
    } else if (extension === 'csv') {
      const reader = new FileReader();
      reader.onload = () => {
        try {
          const csvContent = reader.result as string;
          const result = importCsvToTree(csvContent, trees);

          setTreesValue(result.trees);
          setCsvImportMessage({
            type: 'success',
            message: t('csv.importSuccess', { count: result.updatedCount }),
          });
        } catch (error) {
          console.error('Error loading CSV file:', error);
          setCsvImportMessage({
            type: 'danger',
            message: `${t('csv.importFailed')}: ${error}`,
          });
        }
      };
      reader.readAsText(file);
    }

    event.target.value = '';
  };

  const treeMap = useMemo(() => treesToRecord(trees), [trees]);

  const upsertPerson = (person: Person) => {
    const personData: Record<string, Person> = { [person.id]: person };
    setTreesValue(enrichTreeData(trees, personData));
  };

  const deleteTreePerson = (person: Person) => {
    setTreesValue(deletePerson(trees, person.id));
  };

  return (
    <AppContext.Provider
      value={{
        split,
        editMode,
        hidePersonCode,
        hidePersonIg,
        treeMap,
        setTreesValue,
        upsertPerson,
        deletePerson: deleteTreePerson,
      }}
    >
      <Container className="d-print-none" fluid="sm">
        <Form>
          <FormGroup>
            <ButtonGroup>
              {languages.map(lang => (
                <Button
                  outline
                  size="sm"
                  key={lang}
                  onClick={() => i18n.changeLanguage(lang)}
                  active={lang === i18n.language}
                >
                  {lang}
                </Button>
              ))}
            </ButtonGroup>
          </FormGroup>
          <FormGroup switch>
            <Input
              type="switch"
              checked={split}
              id="split-switch"
              onChange={() => setSplitValue(!split)}
            />
            <Label for="split-switch" check>
              {t('config.splitFamily')}
            </Label>
          </FormGroup>
          <FormGroup switch>
            <Input
              type="switch"
              checked={!hidePersonCode}
              id="hidePersonCode-switch"
              onChange={() => setHideCode(!hidePersonCode)}
            />
            <Label for="hidePersonCode-switch" check>
              {t('config.showCode')}
            </Label>
          </FormGroup>
          <FormGroup switch>
            <Input
              type="switch"
              checked={!hidePersonIg}
              id="hidePersonIg-switch"
              onChange={() => setHideIg(!hidePersonIg)}
            />
            <Label for="hidePersonIg-switch" check>
              {t('config.showIg')}
            </Label>
          </FormGroup>
          <FormGroup switch className="mb-3">
            <Input
              type="switch"
              checked={editMode}
              id="editMode-switch"
              onChange={() => setEditModeValue(!editMode)}
            />
            <Label for="editMode-switch" check>
              {t('config.editMode')}
            </Label>
          </FormGroup>
          <FormGroup>
            <Button size="sm" onClick={() => openModalAddTree()}>
              <i className="bi-person-plus-fill" /> {t('config.addTree')}
            </Button>{' '}
            <Button size="sm" onClick={() => openModalAddChild(trees[0])}>
              <i className="bi-person-plus-fill" /> {t('config.addChild')}
            </Button>{' '}
            <Button size="sm" onClick={() => openModalAddSpouse(trees[0])}>
              <i className="bi-person-plus-fill" /> {t('config.addSpouse')}
            </Button>{' '}
            <Button
              size="sm"
              onClick={() => openModalDeletePerson()}
              color="danger"
            >
              <i className="bi-person-dash-fill" /> {t('config.deletePerson')}
            </Button>
          </FormGroup>
          <FormGroup>
            <Button
              size="sm"
              onClick={() => openModalEditYaml()}
              color="warning"
            >
              <i className="bi-filetype-yml" /> {t('config.editTree')}
            </Button>{' '}
            <Button size="sm" tag="label" id="import-btn">
              <i className="bi-upload" /> {t('config.import')}
              <Input
                type="file"
                className="d-none"
                accept=".yaml, .yml, .csv"
                onChange={handleImport}
              />
            </Button>
            <UncontrolledTooltip placement="top" target="import-btn">
              {t('config.importTooltip')}
            </UncontrolledTooltip>{' '}
            <UncontrolledDropdown direction="down" group>
              <DropdownToggle caret size="sm">
                <i className="bi-download" /> {t('config.export')}
              </DropdownToggle>
              <DropdownMenu>
                <DropdownItem id="export-yaml-item" onClick={handleExportYaml}>
                  {t('config.exportYaml')}
                </DropdownItem>
                <UncontrolledTooltip
                  placement="right"
                  target="export-yaml-item"
                >
                  {t('config.exportYamlTooltip')}
                </UncontrolledTooltip>
                <DropdownItem id="export-csv-item" onClick={handleExportCsv}>
                  {t('config.exportCsv')}
                </DropdownItem>
                <UncontrolledTooltip placement="right" target="export-csv-item">
                  {t('config.exportCsvTooltip')}
                </UncontrolledTooltip>
              </DropdownMenu>
            </UncontrolledDropdown>
          </FormGroup>
          {csvImportMessage && (
            <Alert
              color={csvImportMessage.type}
              toggle={() => setCsvImportMessage(null)}
              style={{ whiteSpace: 'pre-line' }}
            >
              {csvImportMessage.message}
            </Alert>
          )}
        </Form>
      </Container>

      <Container className="pb-3" fluid="sm">
        <Family trees={trees} />
      </Container>

      <Footer />

      <ModalAddTree isOpen={showModalAddTree} toggle={toggleModalAddTree} />
      <ModalAddChild
        isOpen={showModalAddChild}
        toggle={toggleModalAddChild}
        person={modalPerson}
        setPerson={setModalPerson}
        spouse={modalSpouse}
        setSpouse={setModalSpouse}
      />
      <ModalAddSpouse
        isOpen={showModalAddSpouse}
        toggle={toggleModalAddSpouse}
        person={modalPerson}
        setPerson={setModalPerson}
      />
      <ModalEditYaml
        isOpen={showModalEditYaml}
        toggle={toggleModalEditYaml}
        treeYaml={treeYaml}
        setTreeYaml={setTreeYaml}
      />
      <ModalDeletePerson
        isOpen={showModalDeletePerson}
        toggle={toggleModalDeletePerson}
        person={modalPerson}
        setPerson={setModalPerson}
      />

      <ModalExportCsv trees={trees} isOpen={showCsvHelpModal} toggle={toggleCsvHelpModal} />
    </AppContext.Provider>
  );
}

export default App;
