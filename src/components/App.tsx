import { Container } from 'reactstrap';
import { Person } from '../family.interface';
import Family from './Family';

interface AppProps {
  trees: Person[];
}

function App({ trees }: AppProps) {
  return (
    <div className="App">
      <Container fluid="sm">
        <Family trees={trees} />
      </Container>
    </div>
  );
}

export default App;
