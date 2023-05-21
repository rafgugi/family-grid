import { Container, Form, FormGroup, Input, Label } from 'reactstrap';
import { ChangeEvent, useState } from 'react';
import { Person } from '../family.interface';
import Family from './Family';

interface AppProps {
  trees: Person[];
  split?: boolean;
}

function App({ trees, ...props }: AppProps) {
  const [split, setSplitValue] = useState(!!props.split);
  const [hidePeronCode, setHidePeronCode] = useState(false);

  const handleHidePersonCodeChange = (event: ChangeEvent<any>) => {
    setHidePeronCode(event.target.checked);
  };

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
              checked={split}
              onChange={handleSplitChange}
            />
            <Label check>Split Family</Label>
          </FormGroup>
          <FormGroup switch>
            <Input
              type="switch"
              checked={hidePeronCode}
              onChange={handleHidePersonCodeChange}
            />
            <Label check>Hide Code</Label>
          </FormGroup>
        </Form>

        <Family trees={trees} split={split} hideCode={hidePeronCode} />
      </Container>
    </div>
  );
}

export default App;
