import { Container } from 'reactstrap';

const Footer = () => {
  const repo_url = 'https://github.com/rafgugi/family-grid';
  const version = process.env.REACT_APP_VERSION as string;

  return (
    <footer className="d-print-none bg-dark text-light py-3 mt-5">
      <Container>
        <a href={repo_url} className="text-light mr-3">
          <i className="bi-github" /> family-grid {version}
        </a>
      </Container>
    </footer>
  );
};

export default Footer;
