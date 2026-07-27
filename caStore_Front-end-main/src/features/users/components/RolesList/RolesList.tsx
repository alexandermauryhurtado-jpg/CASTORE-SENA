'use client';

import React, { useState, useMemo } from 'react';
import { Search, Plus, X, Shield, Lock, ShieldCheck, AlertCircle } from 'lucide-react';
import Link from 'next/link';
import styles from './RolesList.module.css';
import { RoleCard } from './RoleCard';
import { Button } from '../../../../components/ui/Button';
import { Input } from '../../../../components/ui/Input';
import { Select } from '../../../../components/ui/Select';
import { mockRoles } from '../../mockData';
import { CloneRoleModal } from './CloneRoleModal';

export function RolesList() {
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [cloningRole, setCloningRole] = useState<any>(null);

  const filteredRoles = useMemo(() => {
    return mockRoles.filter(role => {
      const matchesSearch = role.name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesType = typeFilter === 'all' || role.type === typeFilter;
      return matchesSearch && matchesType;
    });
  }, [searchTerm, typeFilter]);

  const systemRoles = filteredRoles.filter(r => r.type === 'system');
  const customRoles = filteredRoles.filter(r => r.type === 'custom');

  return (
    <div className={styles.container}>
      {/* Top Header Actions (placed correctly via PageWrapper integration) */}
      <div className={styles.topActions}>
        <Link href="/roles/new">
          <Button>
            <Plus size={20} />
            <span>Crear rol</span>
          </Button>
        </Link>
      </div>

      <div className={styles.summarySection}>
        <div className={styles.summaryCard}>
          <div className={clsx(styles.summaryIcon, styles.orange)}>
            <Shield size={24} />
          </div>
          <div className={styles.summaryInfo}>
            <span className={styles.summaryValue}>{mockRoles.length}</span>
            <span className={styles.summaryLabel}>Total de roles</span>
          </div>
        </div>

        <div className={styles.summaryCard}>
          <div className={clsx(styles.summaryIcon, styles.blue)}>
            <Lock size={24} />
            <div className={styles.tooltip}>Los roles del sistema no pueden modificarse ni eliminarse</div>
          </div>
          <div className={styles.summaryInfo}>
            <span className={styles.summaryValue}>{mockRoles.filter(r => r.type === 'system').length}</span>
            <span className={styles.summaryLabel}>Roles del sistema</span>
          </div>
        </div>

        <div className={styles.summaryCard}>
          <div className={clsx(styles.summaryIcon, styles.green)}>
            <ShieldCheck size={24} />
          </div>
          <div className={styles.summaryInfo}>
            <span className={styles.summaryValue}>{mockRoles.filter(r => r.type === 'custom').length}</span>
            <span className={styles.summaryLabel}>Roles personalizados</span>
          </div>
        </div>
      </div>

      <div className={styles.filterBar}>
        <div className={styles.searchBox}>
          <Search size={18} className={styles.searchIcon} />
          <input 
            type="text" 
            placeholder="Buscar por nombre de rol..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={styles.searchInput}
          />
        </div>

        <div className={styles.filters}>
          <Select 
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className={styles.typeSelect}
          >
            <option value="all">Todos los tipos</option>
            <option value="system">Del sistema</option>
            <option value="custom">Personalizados</option>
          </Select>
        </div>
      </div>

      <div className={styles.rolesGridSection}>
        {systemRoles.length > 0 && (
          <div className={styles.groupContainer}>
            <div className={styles.groupHeader}>
              <h2 className={styles.groupTitle}>Roles del sistema</h2>
              <div className={styles.groupLine} />
            </div>
            <div className={styles.grid}>
              {systemRoles.map(role => (
                <RoleCard 
                  key={role.id} 
                  role={role} 
                  onDelete={() => {}} 
                  onClone={(r) => setCloningRole(r)}
                />
              ))}
            </div>
          </div>
        )}

        {customRoles.length > 0 && (
          <div className={styles.groupContainer}>
            <div className={styles.groupHeader}>
              <h2 className={styles.groupTitle}>Roles personalizados</h2>
              <div className={styles.groupLine} />
            </div>
            <div className={styles.grid}>
              {customRoles.map(role => (
                <RoleCard 
                  key={role.id} 
                  role={role} 
                  onDelete={(id) => console.log('Delete', id)} 
                  onClone={(r) => setCloningRole(r)}
                />
              ))}
            </div>
          </div>
        )}

        {filteredRoles.length === 0 && (
          <div className={styles.emptyState}>
            <AlertCircle size={48} />
            <h3>No se encontraron roles</h3>
            <p>Ajusta los filtros para ver otros resultados.</p>
          </div>
        )}
      </div>

      {cloningRole && (
        <CloneRoleModal 
          role={cloningRole} 
          onClose={() => setCloningRole(null)} 
        />
      )}
    </div>
  );
}

// Helper for clsx style usage in this file
function clsx(...args: any[]) {
  return args.filter(Boolean).join(' ');
}
