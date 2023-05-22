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
              onChange={() => setSplitValue(!split)}
            />
            <Label check>Split Family</Label>
          </FormGroup>
          <FormGroup switch>
            <Input
              type="switch"
              checked={hidePersonCode}
              onChange={() => setHidePersonCode(!hidePersonCode)}
            />
            <Label check>Hide Code</Label>
          </FormGroup>
          <FormGroup switch>
            <Input
              type="switch"
              checked={editMode}
              onChange={() => setEditModeValue(!editMode)}
            />
            <Label check>Edit Mode</Label>
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
