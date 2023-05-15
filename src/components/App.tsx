import { Container } from 'reactstrap';
import { Person } from '../family.interface';
import Family from './Family';

interface AppProps {
  trees: Person[];
}

function App({ trees }: AppProps) {
  const split = true;

  return (
    <div className="App">
      <Container fluid="sm">
        <Family trees={trees} split={split} />
      </Container>
    </div>
  );
}

export default App;
