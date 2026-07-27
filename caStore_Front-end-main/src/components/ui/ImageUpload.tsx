import React, { useRef, useState, useEffect } from 'react';
import clsx from 'clsx';
import { UploadCloud, X } from 'lucide-react';
import styles from './ImageUpload.module.css';

interface ImageUploadProps {
  label?: string;
  error?: string;
  onChange: (file: string | null) => void;
  value?: string | null;
}

export function ImageUpload({ label, error, onChange, value }: ImageUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(value ?? null);
  const [localError, setLocalError] = useState<string | null>(null);

  useEffect(() => {
    setPreview(value ?? null);
  }, [value]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    setLocalError(null);

    if (!file) return;

    // Validate type
    const validTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      setLocalError('Formato no válido. Usa JPG, PNG o WEBP.');
      return;
    }

    // Validate size (2MB)
    if (file.size > 2 * 1024 * 1024) {
      setLocalError('El archivo es muy pesado. Máximo 2MB.');
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      const result = reader.result as string;
      setPreview(result);
      onChange(result); // In a real app we might pass the File object
    };
    reader.readAsDataURL(file);
  };

  const handleRemove = (e: React.MouseEvent) => {
    e.stopPropagation();
    setPreview(null);
    setLocalError(null);
    onChange(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const displayError = localError || error;

  return (
    <div className={styles.wrapper}>
      {label && <label className={styles.label}>{label}</label>}
      
      <div 
        className={clsx(styles.dropzone, { 
          [styles.hasError]: !!displayError,
          [styles.hasPreview]: !!preview
        })}
        onClick={() => fileInputRef.current?.click()}
      >
        <input 
          type="file" 
          ref={fileInputRef} 
          className={styles.hiddenInput} 
          accept=".jpg,.jpeg,.png,.webp"
          onChange={handleFileChange}
        />
        
        {preview ? (
          <div className={styles.previewContainer}>
            <img src={preview} alt="Preview" className={styles.previewImage} />
            <button type="button" className={styles.removeBtn} onClick={handleRemove} aria-label="Eliminar imagen">
              <X size={16} />
            </button>
          </div>
        ) : (
          <div className={styles.placeholder}>
            <UploadCloud size={32} className={styles.icon} />
            <p className={styles.text}>Haz clic para seleccionar una imagen</p>
            <p className={styles.hint}>JPG, PNG o WEBP (Máx. 2MB)</p>
          </div>
        )}
      </div>

      {displayError && <span className={styles.errorText}>{displayError}</span>}
    </div>
  );
}
