import { Button, Container, Form, FormGroup, Input, Label } from 'reactstrap';
import { useMemo, useState } from 'react';
import { Person } from '../family.interface';
import Family from './Family';
import ModalAddChild from './ModalAddChild';
import { enrichTreeData, treesToRecord } from '../family.util';

interface AppProps {
  trees: Person[];
  split?: boolean;
}

function App(props: AppProps) {
  const [split, setSplitValue] = useState(!!props.split);
  const [editMode, setEditModeValue] = useState(false);
  const [hidePersonCode, setHidePersonCode] = useState(false);
  const [trees, setTreesValue] = useState(props.trees);

  const [modalPerson, setModalPerson] = useState(null as (Person | null));
  const [modalSpouse, setModalSpouse] = useState(null as (Person | null));

  const [showModalChild, setShowModalChild] = useState(false);
  const toggleModalChild = () => setShowModalChild(!showModalChild);
  const openModalChild = (person: Person) => {
    setModalPerson(person);
    setShowModalChild(true);
  };

  const record = useMemo(() => treesToRecord(trees), [trees]);

  const setTreeValue = function (person: Person) {
    const personData: Record<string, Person> = { [person.id]: person };
    setTreesValue(enrichTreeData(trees, personData));
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
            <Label for="split-switch" check>Split Family</Label>
          </FormGroup>
          <FormGroup switch>
            <Input
              type="switch"
              checked={hidePersonCode}
              id="hidePersonCode-switch"
              onChange={() => setHidePersonCode(!hidePersonCode)}
            />
            <Label for="hidePersonCode-switch" check>Hide Code</Label>
          </FormGroup>
          <FormGroup switch>
            <Input
              type="switch"
              checked={editMode}
              id="editMode-switch"
              onChange={() => setEditModeValue(!editMode)}
            />
            <Label for="editMode-switch" check>Edit Mode</Label>
          </FormGroup>
          <FormGroup>
            <Button onClick={() => openModalChild(trees[0])} >
              Add child
            </Button>
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
    </div>
  );
}

export default App;
