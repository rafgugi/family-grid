import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './components/App';
import { Person } from './family.interface';
import { enrichTreeData } from './family.util';
import rawFamilyData from './data.yml';
import './i18n';

import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.min.css';

let familyData = [] as Person[];
if (typeof rawFamilyData === 'object') {
  familyData = enrichTreeData(rawFamilyData.trees, rawFamilyData.people);
}

const root = createRoot(document.getElementById('root') as HTMLElement);
root.render(
  <StrictMode>
    <App trees={familyData} />
  </StrictMode>
);
