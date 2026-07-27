'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Search, Package, Calendar, Settings, Image as ImageIcon } from 'lucide-react';
import clsx from 'clsx';
import { alertConfigSchema, AlertConfigFormData } from '../../schemas/alertConfig.schema';
import styles from './AlertConfig.module.css';
import { Button } from '../../../../components/ui/Button';
import { Input } from '../../../../components/ui/Input';
import { Switch } from '../../../../components/ui/Switch';
import { useToast } from '../../../../components/ui/Toast';
import { mockProducts } from '../../../products/mockData';

export function AlertConfig() {
  const router = useRouter();
  const { showToast } = useToast();
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  
  const searchRef = useRef<HTMLDivElement>(null);

  const { control, handleSubmit, watch, setValue, formState: { errors } } = useForm<AlertConfigFormData>({
    resolver: zodResolver(alertConfigSchema) as any,
    defaultValues: {
      productId: '',
      alertType: 'low_stock',
      minStock: 5,
      expirationDays: [],
      emailNotification: false,
    }
  });

  const selectedProductId = watch('productId');
  const selectedAlertType = watch('alertType');
  const expirationDays = watch('expirationDays') || [];

  const selectedProduct = mockProducts.find(p => p.id === selectedProductId);

  const searchResults = mockProducts.filter(p => 
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    p.sku.toLowerCase().includes(searchQuery.toLowerCase())
  ).slice(0, 5);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [searchRef]);

  const handleProductSelect = (id: string) => {
    setValue('productId', id, { shouldValidate: true });
    setShowDropdown(false);
    setSearchQuery('');
  };

  const toggleExpirationDay = (day: number) => {
    if (expirationDays.includes(day)) {
      setValue('expirationDays', expirationDays.filter(d => d !== day), { shouldValidate: true });
    } else {
      setValue('expirationDays', [...expirationDays, day], { shouldValidate: true });
    }
  };

  const onSubmit = async (data: AlertConfigFormData) => {
    setIsSubmitting(true);
    // Simulate API save
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    setIsSubmitting(false);
    showToast({
      message: 'Configuración de alerta guardada exitosamente.',
      type: 'success'
    });
    router.push('/alerts');
  };

  return (
    <form className={styles.formContainer} onSubmit={handleSubmit(onSubmit)}>
      
      {/* 1. SECCIÓN DE PRODUCTO */}
      <section className={styles.section}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>1. Selección de producto</h2>
          <p className={styles.sectionDesc}>Busca y selecciona el producto que deseas monitorear.</p>
        </div>
        
        <div className={styles.productSelectionContainer}>
          
          <div className={styles.searchContainer} ref={searchRef}>
            <Input
              placeholder="Buscar por SKU o Nombre..."
              icon={Search}
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setShowDropdown(true);
              }}
              onFocus={() => setShowDropdown(true)}
              error={errors.productId?.message}
            />
            
            {showDropdown && searchQuery && (
              <div className={styles.dropdownMenu}>
                {searchResults.length > 0 ? (
                  searchResults.map(p => (
                    <div 
                      key={p.id} 
                      className={styles.dropdownItem}
                      onClick={() => handleProductSelect(p.id)}
                    >
                      <div className={styles.dropdownItemInfo}>
                        <span className={styles.dropdownName}>{p.name}</span>
                        <span className={styles.dropdownSku}>{p.sku}</span>
                      </div>
                      <span className={styles.dropdownStock}>Stock: {p.stock}</span>
                    </div>
                  ))
                ) : (
                  <div className={styles.dropdownEmpty}>No se encontraron resultados</div>
                )}
              </div>
            )}
          </div>

          {/* Selected Product Card */}
          {selectedProduct && (
            <div className={styles.selectedProductCard}>
              <div className={styles.productImage}>
                {selectedProduct.image ? (
                  <img src={selectedProduct.image} alt={selectedProduct.name} />
                ) : (
                  <ImageIcon size={24} className={styles.placeholderIcon} />
                )}
              </div>
              <div className={styles.productDetails}>
                <h3 className={styles.productTitle}>{selectedProduct.name}</h3>
                <div className={styles.productMeta}>
                  <span className={styles.badgeSku}>{selectedProduct.sku}</span>
                  <span className={styles.badgeCat}>{selectedProduct.categoryName}</span>
                </div>
              </div>
              <div className={styles.productStats}>
                <div className={styles.statItem}>
                  <span className={styles.statLabel}>Stock actual:</span>
                  <span className={styles.statValueHighlight}>{selectedProduct.stock} uds.</span>
                </div>
                <div className={styles.statItem}>
                  <span className={styles.statLabel}>Min. Configurado:</span>
                  <span className={styles.statValue}>{selectedProduct.minStock} uds.</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      <div className={styles.divider} />

      {/* 2. SECCIÓN TIPO DE ALERTA */}
      <section className={styles.section}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>2. Tipo de condición de alerta</h2>
          <p className={styles.sectionDesc}>Configura cuándo debe activarse la alerta para este producto.</p>
        </div>

        <div className={styles.cardsGrid}>
          
          {/* Card: Stock Bajo */}
          <div 
            className={clsx(styles.typeCard, { [styles.typeCardActive]: selectedAlertType === 'low_stock' })}
            onClick={() => setValue('alertType', 'low_stock', { shouldValidate: true })}
          >
            <div className={styles.cardHeader}>
              <div className={styles.iconBox}>
                <Package size={20} />
              </div>
              <h3 className={styles.cardTitle}>Alerta de stock bajo</h3>
            </div>
            <p className={styles.cardDesc}>Se activa cuando el stock llega al límite configurado.</p>
            
            {selectedAlertType === 'low_stock' && (
              <div className={styles.cardContent} onClick={(e) => e.stopPropagation()}>
                <Controller
                  name="minStock"
                  control={control}
                  render={({ field }) => (
                    <Input
                      label="Stock mínimo para alerta"
                      type="number"
                      min={1}
                      {...field}
                      onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                      error={errors.minStock?.message}
                      hint="Se generará una alerta cuando el stock sea menor o igual a este valor"
                    />
                  )}
                />
              </div>
            )}
          </div>

          {/* Card: Vencimiento */}
          <div 
            className={clsx(styles.typeCard, { [styles.typeCardActive]: selectedAlertType === 'expiration' })}
            onClick={() => setValue('alertType', 'expiration', { shouldValidate: true })}
          >
            <div className={styles.cardHeader}>
              <div className={styles.iconBoxOrange}>
                <Calendar size={20} />
              </div>
              <h3 className={styles.cardTitle}>Alerta de vencimiento</h3>
            </div>
            <p className={styles.cardDesc}>Se activa días antes de la fecha de vencimiento.</p>
            
            {selectedAlertType === 'expiration' && (
              <div className={styles.cardContent} onClick={(e) => e.stopPropagation()}>
                <label className={styles.checkboxGroupLabel}>Notificar con antelación de:</label>
                {errors.expirationDays && <span className={styles.errorText}>{errors.expirationDays.message}</span>}
                
                <div className={styles.checkboxList}>
                  {[30, 15, 7].map(days => (
                    <label key={days} className={styles.checkboxOption}>
                      <input 
                        type="checkbox" 
                        checked={expirationDays.includes(days)}
                        onChange={() => toggleExpirationDay(days)}
                      />
                      <span>{days} días</span>
                    </label>
                  ))}
                </div>
              </div>
            )}
          </div>

        </div>
      </section>

      <div className={styles.divider} />

      {/* 3. SECCIÓN NOTIFICACIÓN */}
      <section className={styles.section}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>3. Notificaciones adicionales</h2>
        </div>
        
        <div className={styles.toggleRow}>
          <div className={styles.toggleInfo}>
            <h4 className={styles.toggleTitle}>Enviar correo electrónico automático</h4>
            <p className={styles.toggleDesc}>
              Se enviará un correo a los usuarios con permisos administrativos cuando la alerta se detone.
            </p>
          </div>
          <Controller
            name="emailNotification"
            control={control}
            render={({ field: { value, onChange, ...field } }) => (
              <Switch 
                checked={value}
                onChange={onChange}
              />
            )}
          />
        </div>
      </section>

      <div className={styles.formFooter}>
        <Button 
          type="submit" 
          isLoading={isSubmitting} 
          disabled={!selectedProductId}
        >
          Guardar configuración
        </Button>
      </div>
    </form>
  );
}
