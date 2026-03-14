import {
  Alert,
  Button,
  FormFeedback,
  FormGroup,
  Input,
  Label,
  Modal,
  ModalBody,
  ModalFooter,
  ModalHeader,
} from 'reactstrap';
import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import Cropper from 'react-easy-crop';
import { Area } from 'react-easy-crop/types';
import {
  compressImage,
  convertToBase64,
  cropImage,
  isValidPhotoUrl,
  testLocalStorageWrite,
  checkStorageUsage,
  getMaxPhotoKB,
} from '../utils/photo';

interface PhotoUploadProps {
  photoData: string | null;
  onPhotoChange: (data: string | null) => void;
  show?: boolean;
}

const MAX_PHOTO_KB = getMaxPhotoKB();
const MAX_ZOOM = 6;

export default function PhotoUpload({
  photoData,
  onPhotoChange,
  show = true,
}: PhotoUploadProps) {
  const { t } = useTranslation();

  const [photoMethod, setPhotoMethod] = useState<'upload' | 'url'>('upload');
  const [photoUrl, setPhotoUrl] = useState('');
  const [photoUrlError, setPhotoUrlError] = useState('');
  const [photoError, setPhotoError] = useState('');
  const [showCropModal, setShowCropModal] = useState(false);
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);
  const [isProcessingPhoto, setIsProcessingPhoto] = useState(false);

  // Initialize UI state based on existing photo type
  useEffect(() => {
    if (photoData) {
      if (isValidPhotoUrl(photoData)) {
        setPhotoMethod('url');
        setPhotoUrl(photoData);
      } else {
        setPhotoMethod('upload');
      }
    }
  }, [photoData]);

  if (!show) return null;

  const handlePhotoMethodChange = (method: 'upload' | 'url') => {
    setPhotoMethod(method);
    setPhotoError('');
    setPhotoUrlError('');
  };

  const handleFileSelect = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Check storage before opening crop modal
    const storageInfo = await checkStorageUsage();
    if (storageInfo && storageInfo.usagePercent >= 80) {
      setPhotoError(
        t('photo.storageWarning', {
          percent: Math.round(storageInfo.usagePercent),
        })
      );
    }

    const reader = new FileReader();
    reader.onload = () => {
      setImageSrc(reader.result as string);
      setShowCropModal(true);
    };
    reader.readAsDataURL(file);
  };

  const onCropComplete = (_croppedArea: Area, croppedAreaPixels: Area) => {
    setCroppedAreaPixels(croppedAreaPixels);
  };

  const handleCropConfirm = async () => {
    if (!imageSrc || !croppedAreaPixels) return;

    setIsProcessingPhoto(true);
    setPhotoError('');

    try {
      const croppedBlob = await cropImage(imageSrc, croppedAreaPixels);
      const croppedFile = new File([croppedBlob], 'cropped.jpg', {
        type: 'image/jpeg',
      });
      const compressedBlob = await compressImage(croppedFile);
      const base64Data = await convertToBase64(compressedBlob);

      const testData = {
        testPhoto: base64Data,
        timestamp: Date.now(),
      };

      try {
        testLocalStorageWrite(testData);

        onPhotoChange(base64Data);
        setShowCropModal(false);
      } catch (error: any) {
        if (error.name === 'QuotaExceededError') {
          setPhotoError(t('error.photoStorageFull'));
        } else {
          setPhotoError(t('error.photoProcessing'));
        }
        setShowCropModal(false);
      }
    } catch (error) {
      console.error('Photo processing error:', error);
      setPhotoError(t('error.photoProcessing'));
      setShowCropModal(false);
    } finally {
      setIsProcessingPhoto(false);
    }
  };

  const handleCropCancel = () => {
    setShowCropModal(false);
    setImageSrc(null);
    setCroppedAreaPixels(null);
    setCrop({ x: 0, y: 0 });
    setZoom(1);
  };

  const handlePhotoUrlChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    setPhotoUrl(value);
    setPhotoUrlError('');

    if (value && !isValidPhotoUrl(value)) {
      setPhotoUrlError(t('photo.urlInvalid'));
    } else if (value) {
      onPhotoChange(value);
    } else {
      onPhotoChange(null);
    }
  };

  const handleRemovePhoto = () => {
    onPhotoChange(null);
    setPhotoUrl('');
    setPhotoError('');
    setPhotoUrlError('');
  };

  return (
    <>
      <FormGroup tag="fieldset">
        <legend className="col-form-label">
          {t('config.label.photo')} ({t('config.label.optional')})
        </legend>
        <FormGroup check>
          <Label check>
            <Input
              type="radio"
              name="photoMethod"
              title={t('photo.uploadOptionDesc', { MAX_PHOTO_KB })}
              checked={photoMethod === 'upload'}
              onChange={() => handlePhotoMethodChange('upload')}
            />{' '}
            {t('photo.uploadOption')}
          </Label>
        </FormGroup>
        <FormGroup check>
          <Label check>
            <Input
              type="radio"
              name="photoMethod"
              title={t('photo.urlOptionDesc')}
              checked={photoMethod === 'url'}
              onChange={() => handlePhotoMethodChange('url')}
            />{' '}
            {t('photo.urlOption')}
          </Label>
        </FormGroup>
      </FormGroup>

      {photoMethod === 'upload' && (
        <FormGroup>
          <Input
            type="file"
            accept="image/*"
            onChange={handleFileSelect}
            disabled={isProcessingPhoto}
          />
          {photoError && <Alert color="danger">{photoError}</Alert>}
        </FormGroup>
      )}

      {photoMethod === 'url' && (
        <FormGroup>
          <Input
            type="text"
            placeholder={t('photo.urlPlaceholder')}
            value={photoUrl}
            onChange={handlePhotoUrlChange}
            invalid={photoUrlError !== ''}
          />
          {photoUrlError && <FormFeedback>{photoUrlError}</FormFeedback>}
        </FormGroup>
      )}

      {photoData && (
        <FormGroup>
          <div className="d-flex align-items-center gap-2">
            <img
              src={photoData}
              alt="Preview"
              style={{
                width: '80px',
                height: '80px',
                objectFit: 'cover',
                borderRadius: '4px',
              }}
            />
            <Button
              size="sm"
              color="danger"
              outline
              onClick={handleRemovePhoto}
            >
              {t('config.deletePhoto')}
            </Button>
          </div>
        </FormGroup>
      )}

      <Modal
        isOpen={showCropModal}
        toggle={handleCropCancel}
        size="lg"
        unmountOnClose
      >
        <ModalHeader toggle={handleCropCancel}>
          {t('photo.cropTitle')}
        </ModalHeader>
        <ModalBody>
          <div
            style={{
              position: 'relative',
              width: '100%',
              height: '400px',
              backgroundColor: '#333',
            }}
          >
            {imageSrc && (
              <Cropper
                image={imageSrc}
                crop={crop}
                zoom={zoom}
                aspect={1}
                onCropChange={setCrop}
                onZoomChange={setZoom}
                onCropComplete={onCropComplete}
              />
            )}
          </div>
          <div className="mt-3">
            <Label for="zoom-slider">{t('photo.zoom')}</Label>
            <Input
              id="zoom-slider"
              type="range"
              min={1}
              max={MAX_ZOOM}
              step={0.1}
              value={zoom}
              onChange={e => setZoom(Number(e.target.value))}
            />
          </div>
        </ModalBody>
        <ModalFooter>
          <Button color="secondary" onClick={handleCropCancel}>
            {t('config.button.cancel')}
          </Button>
          <Button
            color="primary"
            onClick={handleCropConfirm}
            disabled={isProcessingPhoto}
          >
            {isProcessingPhoto
              ? t('photo.compressing')
              : t('config.button.confirm')}
          </Button>
        </ModalFooter>
      </Modal>
    </>
  );
}
