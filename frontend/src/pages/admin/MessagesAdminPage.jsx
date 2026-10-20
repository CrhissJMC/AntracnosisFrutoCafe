import { Badge, Button, Icon } from '../../components/atoms';
import { Alert, ConfirmButton } from '../../components/molecules';
import { DataTable } from '../../components/organisms';
import { AdminLayout } from '../../components/templates';
import { useAsync } from '../../hooks/useAsync.js';
import { api } from '../../lib/api.js';
import { formatDateTime } from '../../lib/format.js';

export function MessagesAdminPage() {
  const { data, error, setData } = useAsync(() => api.get('/messages?limit=100').then((d) => d.messages), []);

  const toggleRead = async (m) => {
    const { message } = await api.patch(`/messages/${m.id}`, { is_read: !m.is_read });
    setData((list) => list.map((x) => (x.id === m.id ? { ...x, is_read: message.is_read } : x)));
  };

  const remove = async (id) => {
    await api.del(`/messages/${id}`);
    setData((list) => list.filter((m) => m.id !== id));
  };

  const columns = [
    {
      key: 'from',
      label: 'Remitente',
      render: (m) => (
        <div>
          <p className="cell-title">{m.name}</p>
          <a className="cell-sub" href={`mailto:${m.email}`}>
            {m.email}
          </a>
        </div>
      ),
    },
    { key: 'message', label: 'Mensaje', className: 'col-wide', render: (m) => <p className="cell-clamp">{m.message}</p> },
    { key: 'created_at', label: 'Fecha', render: (m) => formatDateTime(m.created_at) },
    { key: 'is_read', label: 'Estado', render: (m) => (m.is_read ? <Badge>Leído</Badge> : <Badge tone="brand">Nuevo</Badge>) },
    {
      key: 'actions',
      label: 'Acciones',
      className: 'col-actions',
      render: (m) => (
        <div>
          <Button variant="secondary" size="sm" onClick={() => toggleRead(m)}>
            <Icon name="check" size={15} /> {m.is_read ? 'Marcar no leído' : 'Marcar leído'}
          </Button>
          <ConfirmButton icon="trash" confirmText="¿Eliminar?" onConfirm={() => remove(m.id)} aria-label="Eliminar mensaje">
            <span className="visually-hidden">Eliminar</span>
          </ConfirmButton>
        </div>
      ),
    },
  ];

  return (
    <AdminLayout title="Mensajes" description="Consultas recibidas desde el formulario de contacto.">
      {error && <Alert tone="error">{error.message}</Alert>}
      {data && <DataTable columns={columns} rows={data} empty="No hay mensajes" caption="Mensajes de contacto" />}
    </AdminLayout>
  );
}
