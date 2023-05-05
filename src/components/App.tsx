import { Container, Table } from 'reactstrap';
import { Family } from './Family';
import { Person } from '../family.interface';
import FamilyDiagram from './FamilyDiagram';

interface AppProps {
  trees: Person[];
}

function App({ trees }: AppProps) {
  const families = trees.map((person: Person) =>
    <Family key={person.id} person={person} code="P" />
  );

  return (
    <div className="App">
      <Container fluid="sm">
        <h1>Family Grid</h1>
        <FamilyDiagram trees={trees} />
        <Table size="sm" bordered hover responsive>
          <thead></thead>
          <tbody>
            {families}
          </tbody>
        </Table>
      </Container>
    </div>
  );
}

export default App;
