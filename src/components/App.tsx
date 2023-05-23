import { Container, Form, FormGroup, Input, Label } from 'reactstrap';
import { useState } from 'react';
import { Person } from '../family.interface';
import Family from './Family';
import { enrichTreeData } from '../family.util';

interface AppProps {
  trees: Person[];
  split?: boolean;
}

function App(props: AppProps) {
  const [split, setSplitValue] = useState(!!props.split);
  const [editMode, setEditModeValue] = useState(false);
  const [hidePersonCode, setHidePersonCode] = useState(false);
  const [trees, setTreesValue] = useState(props.trees);

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
