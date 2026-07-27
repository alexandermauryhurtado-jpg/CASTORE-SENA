import React, { useEffect, useRef } from 'react';
import clsx from 'clsx';
import { X } from 'lucide-react';

import styles from './Modal.module.css';

const FOCUSABLE_SELECTOR =
  'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

export type ModalVariant = 'default' | 'warning' | 'danger' | 'success';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  variant?: ModalVariant;
}

export function Modal({
  isOpen,
  onClose,
  title,
  children,
  footer,
  variant = 'default',
}: ModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
      if (e.key === 'Tab' && modalRef.current) {
        const focusable = modalRef.current.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR);
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (e.shiftKey) {
          if (document.activeElement === first && last) {
            e.preventDefault();
            last.focus();
          }
        } else {
          if (document.activeElement === last && first) {
            e.preventDefault();
            first.focus();
          }
        }
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  useEffect(() => {
    if (isOpen && modalRef.current) {
      const focusable = modalRef.current.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR);
      const first = focusable[0];
      if (first) {
        first.focus();
      }
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const variantKey = variant.charAt(0).toUpperCase() + variant.slice(1);
  const headerClass = clsx(
    styles.header,
    variant !== 'default' && styles[`header${variantKey}`]
  );
  const titleClass = clsx(
    styles.title,
    variant === 'default' ? styles.titleDefault : styles[`title${variantKey}`]
  );
  const closeBtnClass = clsx(
    styles.closeBtn,
    variant !== 'default' && styles[`closeBtn${variantKey}`]
  );

  return (
    <div className={styles.overlay}>
      <div className={styles.backdrop} onClick={onClose} aria-hidden />
      <div
        ref={modalRef}
        className={styles.modal}
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
        onClick={(e) => e.stopPropagation()}
      >
        <div className={headerClass}>
          <h2 id="modal-title" className={titleClass}>
            {title}
          </h2>
          <button
            type="button"
            className={closeBtnClass}
            onClick={onClose}
            aria-label="Cerrar"
          >
            <X size={20} />
          </button>
        </div>
        <div className={styles.content}>{children}</div>
        {footer && <div className={styles.footer}>{footer}</div>}
      </div>
    </div>
  );
}
