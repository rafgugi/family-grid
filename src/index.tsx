import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './components/App';
import { Person } from './family.interface';
import { enrichTreeData } from './family.util';
import rawFamilyData from './data.yml';
import './App.css';

import 'bootstrap/dist/css/bootstrap.css';

let familyData = [] as Person[];
if (typeof rawFamilyData === 'object') {
  familyData = enrichTreeData(rawFamilyData.trees, rawFamilyData.people)
}

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);
root.render(
  <React.StrictMode>
    <App trees={familyData} />
  </React.StrictMode>
);
