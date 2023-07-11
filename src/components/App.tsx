import { Button, Container, Form, FormGroup, Input, Label } from 'reactstrap';
import { useMemo, useState } from 'react';
import { Person } from '../family.interface';
import AppContext from './AppContext';
import Family from './Family';
import ModalAddChild from './ModalAddChild';
import ModalAddSpouse from './ModalAddSpouse';
import ModalDeletePerson from './ModalDeletePerson';
import { deletePerson, enrichTreeData, treesToRecord } from '../family.util';
import ModalAddTree from './ModalAddTree';

interface AppProps {
  trees: Person[];
  split?: boolean;
}

function App(props: AppProps) {
  const [split, setSplitValue] = useState(!!props.split);
  const [editMode, setEditModeValue] = useState(false);
  const [hidePersonCode, setHidePersonCode] = useState(false);
  const [trees, setTreesValue] = useState(props.trees);

  const [modalPerson, setModalPerson] = useState(null as Person | null);
  const [modalSpouse, setModalSpouse] = useState(null as Person | null);

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

  const [showModalDeletePerson, setShowModalDeletePerson] = useState(false);
  const toggleModalDeletePerson = () =>
    setShowModalDeletePerson(!showModalDeletePerson);
  const openModalDeletePerson = () => {
    setModalPerson(null);
    setShowModalDeletePerson(true);
  };

  const treeMap = useMemo(() => treesToRecord(trees), [trees]);

  const addTree = (tree: Person) => {
    setTreesValue([...trees, tree]);
  };

  const setTreeValue = (person: Person) => {
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
        addTree,
        setTreeValue,
        deleteTreePerson,
        treeMap,
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
              Split Family
            </Label>
          </FormGroup>
          <FormGroup switch>
            <Input
              type="switch"
              checked={hidePersonCode}
              id="hidePersonCode-switch"
              onChange={() => setHidePersonCode(!hidePersonCode)}
            />
            <Label for="hidePersonCode-switch" check>
              Hide Code
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
              Edit Mode
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
