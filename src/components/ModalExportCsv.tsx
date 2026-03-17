import {
  Button,
  Modal,
  ModalBody,
  ModalFooter,
  ModalHeader,
} from 'reactstrap';
import { useTranslation } from 'react-i18next';
import saveAs from 'file-saver';
import { getTopNPeopleIds } from '../utils/family-tree';
import { exportTreeToCsv } from '../utils/csv.util';
import { Person } from '../family.interface';

interface ModalExportCsvProps {
  trees: Person[];
  isOpen: boolean;
  toggle: () => void;
}

function ModalExportCsv({ trees, isOpen, toggle }: ModalExportCsvProps) {
  const { t } = useTranslation();

  const handleConfirmExportCsv = () => {
    try {
      const csvContent = exportTreeToCsv(trees);
      const topNPeople = getTopNPeopleIds(trees, 3);
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8' });
      saveAs(blob, `family_${topNPeople}.csv`);
      toggle();
    } catch (error) {
      console.error('Error saving CSV file:', error);
    }
  };

  return (
    <Modal isOpen={isOpen} toggle={toggle} unmountOnClose>
      <ModalHeader toggle={toggle}>
        {t('csv.helpTitle')}
      </ModalHeader>
      <ModalBody>
        <p>{t('csv.helpText')}</p>
        <ul>
          <li>{t('csv.field.id')}</li>
          <li>{t('csv.field.code')}</li>
          <li>{t('csv.field.name')}</li>
          <li>{t('csv.field.sex')}</li>
          <li>{t('csv.field.birthplace')}</li>
          <li>{t('csv.field.birthdate')}</li>
          <li>{t('csv.field.deathdate')}</li>
          <li>{t('csv.field.phone')}</li>
          <li>{t('csv.field.email')}</li>
          <li>{t('csv.field.ig')}</li>
          <li>{t('csv.field.address')}</li>
        </ul>
        <p className="fst-italic">
          {t('csv.note')}
        </p>
      </ModalBody>
      <ModalFooter>
        <Button color="primary" onClick={handleConfirmExportCsv}>
          {t('config.export')}!
        </Button>
      </ModalFooter>
    </Modal>
  );
}

export default ModalExportCsv;
