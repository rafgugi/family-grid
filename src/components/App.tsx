import { Container, Form, FormGroup, Input, Label } from 'reactstrap';
import { ChangeEvent, useState } from 'react';
import { Person } from '../family.interface';
import Family from './Family';
import { enrichTreeData } from '../family.util';

interface AppProps {
  trees: Person[];
  split?: boolean;
}

function App(props: AppProps) {
  const [split, setSplitValue] = useState(!!props.split);
  const [hidePersonCode, setHidePersonCode] = useState(false);
  const [trees, setTreesValue] = useState(props.trees);

  const handleHidePersonCodeChange = (event: ChangeEvent<any>) => {
    setHidePersonCode(event.target.checked);
  };

  const handleSplitChange = (event: ChangeEvent<any>) => {
    setSplitValue(event.target.checked);
  };

  const setTreeValue = function(person: Person) {
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
              onChange={handleSplitChange}
            />
            <Label check>Split Family</Label>
          </FormGroup>
          <FormGroup switch>
            <Input
              type="switch"
              checked={hidePersonCode}
              onChange={handleHidePersonCodeChange}
            />
            <Label check>Hide Code</Label>
          </FormGroup>
        </Form>

        <Family
          trees={trees}
          split={split}
          hideCode={hidePersonCode}
          setTreeValue={setTreeValue}
        />
      </Container>
    </div>
  );
}

export default App;
