'use client';

import React, { useMemo } from 'react';
import { 
  LayoutDashboard, 
  Package, 
  Bell, 
  ArrowLeftRight, 
  Building2, 
  Users, 
  FolderTree, 
  MapPin,
  CheckCircle2,
  AlertCircle,
  MinusCircle,
  HelpCircle
} from 'lucide-react';
import clsx from 'clsx';
import { CustomCheckbox } from '../../../../components/ui/CustomCheckbox';
import { ModuleId, PermissionSet } from '../../mockData';
import styles from './PermissionMatrix.module.css';

const MODULES: { id: ModuleId; name: string; icon: any; description: string }[] = [
  { id: 'dashboard', name: 'Dashboard', icon: LayoutDashboard, description: 'Resumen de métricas y estados críticos.' },
  { id: 'products', name: 'Productos', icon: Package, description: 'Gestión del catálogo maestro de partes.' },
  { id: 'categories', name: 'Categorías', icon: FolderTree, description: 'Organización jerárquica del inventario.' },
  { id: 'movements', name: 'Movimientos', icon: ArrowLeftRight, description: 'Registro de entradas, salidas y transferencias.' },
  { id: 'alerts', name: 'Alertas', icon: Bell, description: 'Configuración de avisos de stock y vencimiento.' },
  { id: 'suppliers', name: 'Proveedores', icon: Building2, description: 'Directorio legal y comercial de aliados.' },
  { id: 'users', name: 'Usuarios', icon: Users, description: 'Control de acceso y perfiles del personal.' },
  { id: 'locations', name: 'Ubicaciones', icon: MapPin, description: 'Gestión de bodegas, estantes y niveles.' }
];

const ACTIONS = [
  { id: 'consult', label: 'Consultar', tooltip: 'Puede ver la información del módulo' },
  { id: 'create', label: 'Crear', tooltip: 'Puede agregar nuevos registros' },
  { id: 'update', label: 'Actualizar', tooltip: 'Puede modificar registros existentes' },
  { id: 'delete', label: 'Eliminar', tooltip: 'Puede eliminar registros permanentemente' }
] as const;

interface PermissionMatrixProps {
  permissions: Record<ModuleId, PermissionSet>;
  onChange?: (moduleId: ModuleId, action: keyof PermissionSet, value: boolean) => void;
  readonly?: boolean;
}

export function PermissionMatrix({ 
  permissions, 
  onChange, 
  readonly = false 
}: PermissionMatrixProps) {
  
  const getAccessLevel = (module: PermissionSet) => {
    const activeCount = Object.values(module).filter(Boolean).length;
    if (activeCount === 4) return { label: 'Completo', color: 'success', icon: CheckCircle2 };
    if (activeCount > 0) return { label: `Parcial (${activeCount})`, color: 'warning', icon: AlertCircle };
    return { label: 'Sin acceso', color: 'muted', icon: MinusCircle };
  };

  const handleActionClick = (moduleId: ModuleId, action: keyof PermissionSet, current: boolean) => {
    if (readonly || !onChange) return;

    const newValue = !current;
    
    // Dependency Logic:
    // 1. If turning on Create/Update/Delete, ensure Consult is ON
    if (newValue && action !== 'consult') {
       onChange(moduleId, action, true);
       if (!permissions[moduleId].consult) {
         onChange(moduleId, 'consult', true);
       }
    } 
    // 2. If turning off Consult, turn off EVERYTHING else
    else if (!newValue && action === 'consult') {
       onChange(moduleId, 'consult', false);
       onChange(moduleId, 'create', false);
       onChange(moduleId, 'update', false);
       onChange(moduleId, 'delete', false);
    }
    // 3. Simple toggle for others
    else {
      onChange(moduleId, action, newValue);
    }
  };

  const toggleAllAction = (action: keyof PermissionSet, value: boolean) => {
    if (readonly || !onChange) return;
    MODULES.forEach(m => {
      // Logic applies here too
      if (value && action !== 'consult') {
        onChange(m.id, action, true);
        onChange(m.id, 'consult', true);
      } else if (!value && action === 'consult') {
        onChange(m.id, 'consult', false);
        onChange(m.id, 'create', false);
        onChange(m.id, 'update', false);
        onChange(m.id, 'delete', false);
      } else {
        onChange(m.id, action, value);
      }
    });
  };

  return (
    <div className={styles.tableWrapper}>
      <table className={styles.table}>
        <thead className={styles.thead}>
          <tr>
            <th className={styles.moduleHeader}>Módulo</th>
            {ACTIONS.map(action => (
              <th key={action.id} className={styles.actionHeader}>
                <div className={styles.actionHeaderContent}>
                  <span className={styles.actionLabel}>{action.label}</span>
                  <div className={styles.tooltipIcon}>
                    <HelpCircle size={14} />
                    <div className={styles.tooltip}>{action.tooltip}</div>
                  </div>
                </div>
                {!readonly && (
                  <div className={styles.headerSelection}>
                    <button 
                      type="button"
                      className={styles.bulkBtn}
                      onClick={() => toggleAllAction(action.id, true)}
                    >
                      Todos
                    </button>
                    <button 
                       type="button"
                       className={styles.bulkBtn}
                       onClick={() => toggleAllAction(action.id, false)}
                    >
                      Nada
                    </button>
                  </div>
                )}
              </th>
            ))}
            <th className={styles.statusHeader}>Estado</th>
          </tr>
        </thead>
        <tbody className={styles.tbody}>
          {MODULES.map(module => {
            const level = getAccessLevel(permissions[module.id]);
            const Icon = module.icon;
            const StatusIcon = level.icon;

            return (
              <tr key={module.id} className={styles.row}>
                <td className={styles.moduleCell}>
                  <div className={styles.moduleInfo}>
                    <div className={styles.iconBox}><Icon size={18} /></div>
                    <div className={styles.moduleNameStack}>
                      <span className={styles.moduleName}>{module.name}</span>
                      <span className={styles.moduleDesc}>{module.description}</span>
                    </div>
                  </div>
                </td>
                
                {ACTIONS.map(action => (
                  <td key={action.id} className={styles.checkboxCell}>
                    {readonly ? (
                      <div className={clsx(styles.readonlyCheck, { [styles.active]: permissions[module.id][action.id] })}>
                        {permissions[module.id][action.id] ? <CheckCircle2 size={18} /> : <span>—</span>}
                      </div>
                    ) : (
                      <CustomCheckbox 
                        checked={permissions[module.id][action.id]}
                        onChange={() => handleActionClick(module.id, action.id, permissions[module.id][action.id])}
                      />
                    )}
                  </td>
                ))}

                <td className={styles.statusCell}>
                  <div className={clsx(styles.statusBadge, styles[level.color])}>
                    <StatusIcon size={14} />
                    <span>{level.label}</span>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
