import { Button, Container, Form, FormGroup, Input, Label } from 'reactstrap';
import { useMemo, useState } from 'react';
import { Person } from '../family.interface';
import Family from './Family';
import ModalAddChild from './ModalAddChild';
import ModalAddSpouse from './ModalAddSpouse';
import ModalDeletePerson from './ModalDeletePerson';
import { deletePerson, enrichTreeData, treesToRecord } from '../family.util';

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

  const [showModalChild, setShowModalChild] = useState(false);
  const toggleModalChild = () => setShowModalChild(!showModalChild);
  const openModalChild = (person: Person) => {
    setModalPerson(person);
    setShowModalChild(true);
  };

  const [showModalAddSpouse, setShowModalAddSpouse] = useState(false);
  const toggleModalAddSpouse = () => setShowModalAddSpouse(!showModalAddSpouse);
  const openModalAddSpouse = (person: Person) => {
    setModalPerson(person);
    setShowModalAddSpouse(true);
  };

  const [showModalDeletePerson, setShowModalDeletePerson] = useState(false);
  const toggleModalDeletePerson = () => setShowModalDeletePerson(!showModalDeletePerson);
  const openModalDeletePerson = () => {
    setModalPerson(null);
    setShowModalDeletePerson(true);
  };

  const record = useMemo(() => treesToRecord(trees), [trees]);

  const setTreeValue = function (person: Person) {
    const personData: Record<string, Person> = { [person.id]: person };
    setTreesValue(enrichTreeData(trees, personData));
  };

  const deleteTreePerson = (person: Person) => {
    setTreesValue(deletePerson(trees, person.id));
  };

  return (
    <div className="App">
      <Container fluid="sm">
        <Form className="d-print-none">
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
            <Button size="sm" onClick={() => openModalChild(trees[0])}>
              Add child
            </Button>
            {' '}
            <Button size="sm" onClick={() => openModalAddSpouse(trees[0])}>
              Add spouse
            </Button>
            {' '}
            <Button size="sm" onClick={() => openModalDeletePerson()} color="danger">
              Delete person
            </Button>
          </FormGroup>
        </Form>

        <Family
          trees={trees}
          split={split}
          editMode={editMode}
          hideCode={hidePersonCode}
          setTreeValue={setTreeValue}
        />
      </Container>
      <ModalAddChild
        isOpen={showModalChild}
        toggle={toggleModalChild}
        record={record}
        person={modalPerson}
        setPerson={setModalPerson}
        spouse={modalSpouse}
        setSpouse={setModalSpouse}
        setTreeValue={setTreeValue}
      />
      <ModalAddSpouse
        isOpen={showModalAddSpouse}
        toggle={toggleModalAddSpouse}
        record={record}
        person={modalPerson}
        setPerson={setModalPerson}
        setTreeValue={setTreeValue}
      />
      <ModalDeletePerson
        isOpen={showModalDeletePerson}
        toggle={toggleModalDeletePerson}
        record={record}
        person={modalPerson}
        setPerson={setModalPerson}
        deleteTreePerson={deleteTreePerson}
      />
    </div>
  );
}

export default App;
