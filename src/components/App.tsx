import { Button, Container, Form, FormGroup, Input, Label } from 'reactstrap';
import { useMemo, useState } from 'react';
import { stringify } from 'yaml';
import { Person } from '../family.interface';
import AppContext from './AppContext';
import Family from './Family';
import ModalAddChild from './ModalAddChild';
import ModalAddSpouse from './ModalAddSpouse';
import ModalAddTree from './ModalAddTree';
import ModalDeletePerson from './ModalDeletePerson';
import ModalEditYaml from './ModalEditYaml';
import { deletePerson, enrichTreeData, treesToRecord } from '../family.util';
import { useCache } from '../useCache';

interface AppProps {
  trees: Person[];
  split?: boolean;
}

function App(props: AppProps) {
  const [trees, setTreesValue] = useCache('trees', props.trees);

  const [split, setSplitValue] = useCache('split', !!props.split);
  const [showPersonCode, setShowCode] = useCache('showPersonCode', true);
  const [showSex, setShowSex] = useCache('showSex', false);
  const [showDeathdate, setShowDeathdate] = useCache('showDeathdate', false);
  const [editMode, setEditModeValue] = useState(false);

  const [modalPerson, setModalPerson] = useState(null as Person | null);
  const [modalSpouse, setModalSpouse] = useState(null as Person | null);
  const [treeYaml, setTreeYaml] = useState('');

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
    setTreeYaml(stringify(trees));
    setShowModalEditYaml(true);
  };

  const [showModalDeletePerson, setShowModalDeletePerson] = useState(false);
  const toggleModalDeletePerson = () =>
    setShowModalDeletePerson(!showModalDeletePerson);
  const openModalDeletePerson = () => {
    setModalPerson(null);
    setShowModalDeletePerson(true);
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
        showPersonCode,
        showSex,
        showDeathdate,
        treeMap,
        setTreesValue,
        upsertPerson,
        deletePerson: deleteTreePerson,
      }}
    >
      <Container className="d-print-none" fluid="sm">
        <Form>
          <FormGroup switch>
            <Input
              type="switch"
              checked={split}
              id="split-switch"
              onChange={() => setSplitValue(!split)}
            />
            <Label for="split-switch" check>
              Split family
            </Label>
          </FormGroup>
          <FormGroup switch>
            <Input
              type="switch"
              checked={showPersonCode}
              id="showPersonCode-switch"
              onChange={() => setShowCode(!showPersonCode)}
            />
            <Label for="showPersonCode-switch" check>
              Show person code
            </Label>
          </FormGroup>
          <FormGroup switch>
            <Input
              type="switch"
              checked={editMode || showSex}
              id="showSex-switch"
              disabled={editMode}
              onChange={() => setShowSex(!showSex)}
            />
            <Label for="showSex-switch" check>
              Show person sex
            </Label>
          </FormGroup>
          <FormGroup switch>
            <Input
              type="switch"
              checked={editMode || showDeathdate}
              id="showDeathdate-switch"
              disabled={editMode}
              onChange={() => setShowDeathdate(!showDeathdate)}
            />
            <Label for="showDeathdate-switch" check>
              Show person death date
            </Label>
          </FormGroup>
          <FormGroup switch>
            <Input
              type="switch"
              checked={editMode}
              id="editMode-switch"
              onChange={() => setEditModeValue(!editMode)}
            />
            <Label for="editMode-switch" check>
              Edit mode
            </Label>
          </FormGroup>
          <FormGroup>
            <Button size="sm" onClick={() => openModalAddTree()}>
              Add tree
            </Button>{' '}
            <Button size="sm" onClick={() => openModalAddChild(trees[0])}>
              Add child
            </Button>{' '}
            <Button size="sm" onClick={() => openModalAddSpouse(trees[0])}>
              Add spouse
            </Button>{' '}
            <Button
              size="sm"
              onClick={() => openModalEditYaml()}
              color="warning"
            >
              Edit tree
            </Button>{' '}
            <Button
              size="sm"
              onClick={() => openModalDeletePerson()}
              color="danger"
            >
              Delete person
            </Button>
          </FormGroup>
        </Form>
      </Container>

      <Container className="pb-3" fluid="sm">
        <Family trees={trees} />
      </Container>

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
    </AppContext.Provider>
  );
}

export default App;
