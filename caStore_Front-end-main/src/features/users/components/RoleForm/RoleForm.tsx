'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  ArrowLeft,
  FilePlus,
  Shield,
  ShieldAlert,
  ShieldCheck,
  LayoutDashboard,
  Package,
  Bell,
  ArrowLeftRight,
  Building2,
  Users,
  FolderTree,
  MapPin,
  AlertTriangle,
  Info,
} from 'lucide-react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import clsx from 'clsx';
import { Role, ModuleId, PermissionSet, mockRoles } from '../../mockData';
import { roleSchema, RoleFormData } from '../../schemas/user.schema';
import { PermissionMatrix } from './PermissionMatrix';
import { RoleCard } from '../RolesList/RoleCard';
import { Button } from '../../../../components/ui/Button';
import { Input } from '../../../../components/ui/Input';
import { useToast } from '../../../../components/ui/Toast';
import { useCreateRole, useUpdateRole } from '@/src/features/roles/hooks/useRoles';
import { formDataToCreateDto } from '@/src/features/roles/types/roles.types';
import { rolesService, getRoleErrorMessage } from '@/src/services/roles.service';
import styles from './RoleForm.module.css';

interface RoleFormProps {
  initialData?: Role;
  isEdit?: boolean;
  /** ID del rol en edición (requerido cuando isEdit es true para llamar a PATCH). */
  roleId?: string;
}

const TEMPLATES = [
  { 
    id: 'scratch', 
    name: 'Desde cero', 
    icon: FilePlus, 
    description: 'Sin ningún permiso seleccionado' 
  },
  { 
    id: 'role-admin', 
    name: 'Clonar Administrador', 
    icon: ShieldCheck, 
    description: 'Todos los permisos activos' 
  },
  { 
    id: 'role-supervisor', 
    name: 'Clonar Supervisor', 
    icon: Shield, 
    description: 'Sin eliminar críticos' 
  },
  { 
    id: 'role-operator', 
    name: 'Clonar Operador', 
    icon: ShieldAlert, 
    description: 'Solo lectura y movimientos' 
  }
];

const SIDEBAR_ITEMS = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'products', label: 'Productos', icon: Package },
  { id: 'categories', label: 'Categorías', icon: FolderTree },
  { id: 'movements', label: 'Movimientos', icon: ArrowLeftRight },
  { id: 'alerts', label: 'Alertas', icon: Bell },
  { id: 'suppliers', label: 'Proveedores', icon: Building2 },
  { id: 'users', label: 'Usuarios', icon: Users },
  { id: 'locations', label: 'Ubicaciones', icon: MapPin },
];

const DEBOUNCE_MS = 500;

export function RoleForm({ initialData, isEdit = false, roleId }: RoleFormProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { showToast } = useToast();
  const [selectedTemplate, setSelectedTemplate] = useState('scratch');
  const createRole = useCreateRole();
  const updateRole = useUpdateRole();
  const isSystemRole = Boolean(isEdit && initialData?.type === 'system');
  const isLoading = createRole.isPending || updateRole.isPending;

  const defaultValues = useMemo(() => {
    // Check if cloning from URL (from CloneRoleModal)
    const cloneId = searchParams.get('cloneFrom');
    const cloneName = searchParams.get('name');
    
    if (initialData) return initialData;
    
    if (cloneId) {
      const source = mockRoles.find(r => r.id === cloneId);
      if (source) {
        return {
          ...source,
          id: undefined,
          name: cloneName || `Copia de ${source.name}`,
          type: 'custom',
          userCount: 0
        };
      }
    }

    const perms: any = {};
    SIDEBAR_ITEMS.forEach(m => {
      perms[m.id] = { consult: false, create: false, update: false, delete: false };
    });
    return { name: '', description: '', permissions: perms };
  }, [initialData, searchParams]);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    setError,
    clearErrors,
    formState: { errors },
  } = useForm<RoleFormData>({
    resolver: zodResolver(roleSchema),
    defaultValues: defaultValues as RoleFormData,
    mode: 'onChange',
  });

  const watchedPermissions = watch('permissions');
  const watchedName = watch('name');
  const watchedDesc = watch('description');

  // Validación de nombre único con debounce 500 ms
  useEffect(() => {
    const name = typeof watchedName === 'string' ? watchedName.trim() : '';
    if (name.length < 2) {
      clearErrors('name');
      return;
    }
    const t = setTimeout(async () => {
      const result = await rolesService.getRoles({ search: name, limit: 20 });
      if (!result?.data) return;
      const exists = result.data.some(
        (r) => r.name.toLowerCase() === name.toLowerCase() && (!isEdit || r.id !== roleId)
      );
      if (exists) {
        setError('name', { type: 'manual', message: 'Ya existe un rol con ese nombre' });
      } else {
        clearErrors('name');
      }
    }, DEBOUNCE_MS);
    return () => clearTimeout(t);
  }, [watchedName, isEdit, roleId, setError, clearErrors]);

  const applyTemplate = (templateId: string) => {
    setSelectedTemplate(templateId);
    let targetPerms: Record<string, PermissionSet> = {};
    
    if (templateId === 'scratch') {
      SIDEBAR_ITEMS.forEach(m => {
        targetPerms[m.id] = { consult: false, create: false, update: false, delete: false };
      });
    } else {
      const source = mockRoles.find(r => r.id === templateId);
      if (source) targetPerms = JSON.parse(JSON.stringify(source.permissions));
    }

    setValue('permissions', targetPerms, { shouldValidate: true });
  };

  const handlePermissionChange = (moduleId: ModuleId, action: keyof PermissionSet, value: boolean) => {
    setValue(`permissions.${moduleId}.${action}` as any, value, { shouldValidate: true });
  };

  const naturalSummary = useMemo(() => {
    const modules = Object.values(watchedPermissions || {}) as PermissionSet[];
    const full = modules.filter(m => Object.values(m).filter(Boolean).length === 4).length;
    const none = modules.filter(m => Object.values(m).filter(Boolean).length === 0).length;
    const partial = modules.length - full - none;

    return {
      text: `Este rol tendrá acceso completo a ${full} módulos, acceso parcial a ${partial} módulos y sin acceso a ${none} módulos.`,
      counts: { full, partial, none }
    };
  }, [watchedPermissions]);

  const onSubmit = useCallback(
    async (data: RoleFormData) => {
      const dto = formDataToCreateDto(
        data.permissions as Record<string, PermissionSet>,
        data.name,
        data.description
      );
      try {
        if (isEdit && roleId) {
          await updateRole.mutateAsync({ id: roleId, dto });
          showToast({ message: 'Rol actualizado correctamente', type: 'success' });
        } else {
          await createRole.mutateAsync(dto);
          showToast({ message: 'Rol creado correctamente', type: 'success' });
        }
        router.push('/roles');
      } catch (err) {
        showToast({ message: getRoleErrorMessage(err), type: 'error' });
      }
    },
    [isEdit, roleId, createRole, updateRole, showToast, router]
  );

  const previewRole: Role = {
    id: 'preview',
    name: watchedName || 'Nombre del rol',
    description: watchedDesc || '',
    type: 'custom',
    userCount: 0,
    createdAt: new Date().toISOString(),
    permissions: watchedPermissions
  };

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div className={styles.titleStack}>
          <h1 className={styles.title}>{isEdit ? 'Editar rol' : 'Crear rol personalizado'}</h1>
          <p className={styles.subtitle}>
            {isEdit ? `Modificando: ${initialData?.name}` : 'Define un nuevo nivel de acceso para tu equipo.'}
          </p>
        </div>
        <Button variant="secondary" onClick={() => router.push('/roles')}>
          <ArrowLeft size={18} />
          Volver
        </Button>
      </header>

      {isSystemRole && (
        <div className={styles.errorBanner}>
          <AlertTriangle size={18} />
          <span>Los roles del sistema no pueden modificarse. Puedes clonar este rol para crear una copia editable.</span>
        </div>
      )}

      {isEdit && initialData?.userCount && initialData.userCount > 0 && !isSystemRole && (
        <div className={styles.bannerInfo}>
          <Info size={18} />
          <span>
            Este rol tiene <strong>{initialData.userCount} usuarios</strong> asignados.
            Los cambios se aplicarán inmediatamente. <Link href={`/users?role=${initialData.id}`}>Ver usuarios afectados →</Link>
          </span>
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className={styles.layoutBody}>
        <div className={styles.formCol}>
          {/* Identity Section */}
          <section className={styles.formSection}>
            <h2 className={styles.sectionTitle}>Identidad del rol</h2>
            <div className={styles.fieldGrid}>
              <div className={styles.fieldGroup}>
                <Input
                  label="Nombre del rol"
                  {...register('name')}
                  error={errors.name?.message as string}
                  required
                  placeholder="Ej: Auditor Externo"
                  disabled={isSystemRole}
                />
                <div className={styles.badgePreviewRow}>
                   <span className={styles.previewLabel}>Vista previa badge:</span>
                   <span className={styles.roleBadge}>{watchedName || '...'}</span>
                </div>
              </div>
              <div className={styles.fieldGroup}>
                <label className={styles.fieldLabel}>Descripción (Opcional)</label>
                <textarea
                  className={clsx(styles.textarea, { [styles.errorArea]: errors.description })}
                  {...register('description')}
                  placeholder="Ej: Acceso de lectura para auditores externos"
                  maxLength={200}
                  disabled={isSystemRole}
                />
                <div className={styles.counter}>{watchedDesc?.length || 0}/200</div>
                {errors.description && <span className={styles.errorText}>{errors.description.message as string}</span>}
              </div>
            </div>
          </section>

          {/* Template Section (Only on create) */}
          {!isEdit && (
            <section className={styles.formSection}>
              <div className={styles.sectionHeader}>
                <h2 className={styles.sectionTitle}>¿Desde dónde quieres partir?</h2>
                <p className={styles.sectionSubtitle}>Elige una plantilla como punto de partida o empieza desde cero.</p>
              </div>
              <div className={styles.templateGrid}>
                {TEMPLATES.map(template => {
                  const Icon = template.icon;
                    return (
                    <button
                      key={template.id}
                      type="button"
                      className={clsx(styles.templateCard, { [styles.selectedTemplate]: selectedTemplate === template.id })}
                      onClick={() => applyTemplate(template.id)}
                      disabled={isSystemRole}
                    >
                      <div className={styles.templateIcon}><Icon size={20} /></div>
                      <div className={styles.templateInfo}>
                        <span className={styles.templateName}>{template.name}</span>
                        <span className={styles.templateDesc}>{template.description}</span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </section>
          )}

          {/* Matrix Section */}
          <section className={styles.formSection}>
             <h2 className={styles.sectionTitle}>Permisos detallados</h2>
             <PermissionMatrix
               permissions={watchedPermissions}
               onChange={handlePermissionChange}
               readonly={isSystemRole}
             />
             {naturalSummary.counts.full === 0 && naturalSummary.counts.partial === 0 && (
               <div className={styles.errorBanner}>
                 <AlertTriangle size={18} />
                 <span>Un rol sin ningún permiso no tiene sentido. Agrega al menos un permiso de consulta.</span>
               </div>
             )}
          </section>

          <footer className={styles.formFooter}>
            <Button variant="secondary" type="button" onClick={() => router.push('/roles')}>Cancelar</Button>
            <Button
              type="submit"
              isLoading={isLoading}
              disabled={isSystemRole || (naturalSummary.counts.full === 0 && naturalSummary.counts.partial === 0)}
            >
              {isEdit ? 'Guardar cambios' : 'Crear rol'}
            </Button>
          </footer>
        </div>

        {/* Preview Sticky Column */}
        <aside className={styles.previewCol}>
          <div className={styles.stickyContent}>
            <div className={styles.previewHeader}>
              <h3 className={styles.previewTitle}>Vista previa del rol</h3>
              <p className={styles.previewSubtitle}>Así se verá en el sistema en tiempo real.</p>
            </div>

            <div className={styles.previewCardBox}>
               <RoleCard role={previewRole} onDelete={() => {}} onClone={() => {}} />
            </div>

            <div className={styles.previewSummary}>
              <p className={styles.summaryText}>{naturalSummary.text}</p>
            </div>

            <div className={styles.simulatorSection}>
               <h4 className={styles.simulatorTitle}>Sidebar Simulator</h4>
               <p className={styles.simulatorDesc}>Módulos visibles según permisos de consulta.</p>
               <div className={styles.miniSidebar}>
                  {SIDEBAR_ITEMS.map(item => {
                    const hasConsult = watchedPermissions?.[item.id]?.consult;
                    const Icon = item.icon;
                    return (
                      <div key={item.id} className={clsx(styles.sidebarItem, { [styles.sidebarDisabled]: !hasConsult })}>
                        <Icon size={14} />
                        <span>{item.label}</span>
                        {!hasConsult && <div className={styles.lineThrough} />}
                      </div>
                    );
                  })}
               </div>
            </div>
          </div>
        </aside>
      </form>
    </div>
  );
}
