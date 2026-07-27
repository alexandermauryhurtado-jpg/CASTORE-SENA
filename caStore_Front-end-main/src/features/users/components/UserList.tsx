'use client';

import React from 'react';
import { User } from '../types/users.types';
import styles from './UserList.module.css';

export function UserList({ users }: { users: User[] }) {
  return (
    <div className={styles.container}>
       <table className={styles.table}>
        <thead>
          <tr>
            <th>Usuario</th>
            <th>Email</th>
            <th>Rol</th>
            <th>Estado</th>
          </tr>
        </thead>
        <tbody>
          {users.map((u) => (
            <tr key={u.id}>
              <td>{u.fullName}</td>
              <td>{u.email}</td>
              <td>{u.roleName}</td>
              <td>
                <span className={u.status === 'active' ? styles.active : styles.inactive}>
                  {u.status}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
