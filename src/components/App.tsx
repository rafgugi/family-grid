import { Container, Form, FormGroup, Input, Label } from 'reactstrap';
import { ChangeEvent, useState } from 'react';
import { Person } from '../family.interface';
import Family from './Family';

interface AppProps {
  trees: Person[];
  split?: boolean;
}

function App({ trees, split }: AppProps) {
  const [splitValue, setSplitValue] = useState(split!!);

  const handleSplitChange = (event: ChangeEvent<any>) => {
    setSplitValue(event.target.checked);
  };

  return (
    <div className="App">
      <Container fluid="sm">
        <Form className="d-print-none">
          <FormGroup switch>
            <Input
              type="switch"
              checked={splitValue}
              onChange={handleSplitChange}
            />
            <Label check>Split Family</Label>
          </FormGroup>
        </Form>

        <Family trees={trees} split={splitValue} />
      </Container>
    </div>
  );
}

export default App;
