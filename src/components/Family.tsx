import { Fragment, useContext } from 'react';
import { Person } from '../family.interface';
import AppContext from './AppContext';
import FamilyGrid from './FamilyGrid';
import FamilyDiagram from './FamilyDiagram';
import { explodeTrees, idAsNickName } from '../family.util';
import { useTranslation } from 'react-i18next';

interface FamilyProps {
  trees: Person[];
}

export default function Family(props: FamilyProps) {
  const { split } = useContext(AppContext);
  return split ? <SplitFamilies {...props} /> : <BigFamily {...props} />;
}

function SplitFamilies({ trees, ...props }: FamilyProps) {
  const { t } = useTranslation();
  const people = explodeTrees(trees).filter(
    person => person.marriages.length !== 0
  );
  const getName = (p: Person) => p.name ?? idAsNickName(p.id);

  return (
    <>
      {people.map(tree => (
        <Fragment key={tree.id}>
          <hr className="d-print-none" />
          <h3 className="text-center">
            {t('header.family', { name: getName(tree) })}
          </h3>
          <FamilyDiagram trees={[tree]} depth={2} />
          <FamilyGrid {...props} trees={[tree]} />
        </Fragment>
      ))}
    </>
  );
}

function BigFamily({ trees, ...props }: FamilyProps) {
  const { t } = useTranslation();

  return (
    <Fragment>
      <hr className="d-print-none" />
      <h3 className="text-center">{t('header.family_general')}</h3>
      <FamilyDiagram trees={trees} />
      <FamilyGrid {...props} trees={trees} />
    </Fragment>
  );
}
