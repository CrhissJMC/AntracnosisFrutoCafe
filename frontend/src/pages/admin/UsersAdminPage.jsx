import { useState } from 'react';
import { Avatar, Badge, Select } from '../../components/atoms';
import { Alert, ConfirmButton } from '../../components/molecules';
import { DataTable } from '../../components/organisms';
import { AdminLayout } from '../../components/templates';
import { useAuth } from '../../context/AuthContext.jsx';
import { useAsync } from '../../hooks/useAsync.js';
import { api } from '../../lib/api.js';
import { formatDate } from '../../lib/format.js';
import { PROFILES } from '../../lib/modulo.js';

export function UsersAdminPage() {
  const { user: me } = useAuth();
  const [actionError, setActionError] = useState('');
  const { data, error, setData } = useAsync(() => api.get('/admin/users?limit=100').then((d) => d.users), []);

  const update = async (u, changes) => {
    setActionError('');
    try {
      const { user } = await api.patch(`/admin/users/${u.id}`, changes);
      setData((list) => list.map((x) => (x.id === u.id ? { ...x, role: user.role, perfil: user.perfil } : x)));
    } catch (err) {
      setActionError(err.message);
    }
  };
  const changeRole = (u, role) => update(u, { role });
  const changeProfile = (u, perfil) => update(u, { perfil });

  const remove = async (id) => {
    setActionError('');
    try {
      await api.del(`/admin/users/${id}`);
      setData((list) => list.filter((u) => u.id !== id));
    } catch (err) {
      setActionError(err.message);
    }
  };

  const columns = [
    {
      key: 'name',
      label: 'Usuario',
      className: 'col-wide',
      render: (u) => (
        <div style={{ display: 'flex', gap: 'var(--space-3)', alignItems: 'center' }}>
          <Avatar name={u.name} size={32} />
          <div>
            <p className="cell-title">
              {u.name} {u.id === me?.id && <Badge>Tú</Badge>}
            </p>
            <p className="cell-sub">{u.email}</p>
          </div>
        </div>
      ),
    },
    {
      key: 'role',
      label: 'Rol',
      render: (u) =>
        u.id === me?.id ? (
          <Badge tone="brand">Administrador</Badge>
        ) : (
          <Select value={u.role} onChange={(e) => changeRole(u, e.target.value)} aria-label={`Rol de ${u.name}`} style={{ minWidth: 150 }}>
            <option value="user">Usuario</option>
            <option value="admin">Administrador</option>
          </Select>
        ),
    },
    {
      key: 'perfil',
      label: 'Perfil del módulo',
      render: (u) => (
        <Select
          value={u.perfil ?? ''}
          onChange={(e) => changeProfile(u, e.target.value)}
          aria-label={`Perfil del módulo de ${u.name}`}
          style={{ minWidth: 150 }}
        >
          <option value="">Sin perfil</option>
          {PROFILES.map((p) => (
            <option key={p.id} value={p.id}>
              {p.label}
            </option>
          ))}
        </Select>
      ),
    },
    { key: 'comment_count', label: 'Coment.', className: 'col-num' },
    { key: 'created_at', label: 'Registro', render: (u) => formatDate(u.created_at) },
    {
      key: 'actions',
      label: 'Acciones',
      className: 'col-actions',
      render: (u) =>
        u.id === me?.id ? null : (
          <div>
            <ConfirmButton icon="trash" confirmText="¿Eliminar cuenta?" onConfirm={() => remove(u.id)}>
              Eliminar
            </ConfirmButton>
          </div>
        ),
    },
  ];

  return (
    <AdminLayout
      title="Usuarios"
      description="Personas registradas. Puedes otorgar el rol de administrador, asignar el perfil del módulo de diagnóstico (solo los especialistas validan) o eliminar cuentas (y sus comentarios)."
    >
      {(error || actionError) && (
        <div style={{ marginBottom: 'var(--space-4)' }}>
          <Alert tone="error">{actionError || error.message}</Alert>
        </div>
      )}
      {data && <DataTable columns={columns} rows={data} empty="No hay usuarios" caption="Usuarios" />}
    </AdminLayout>
  );
}
