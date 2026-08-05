import React, { useState, useEffect } from 'react';

export const UsersManager: React.FC<{ apiBaseUrl: string, authToken: string }> = ({ apiBaseUrl, authToken }) => {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // --- Create User Form State ---
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createForm, setCreateForm] = useState({ name: '', email: '', role: 'customer', phone: '' });
  const [submitting, setSubmitting] = useState(false);

  // --- Edit User Form State ---
  const [editUser, setEditUser] = useState<any | null>(null);
  const [editForm, setEditForm] = useState({ name: '', email: '', role: 'customer', phone: '' });
  const [updating, setUpdating] = useState(false);

  const fetchUsers = async () => {
    try {
      const res = await fetch(`${apiBaseUrl}/users`, {
        headers: { 'Authorization': `Bearer ${authToken}` }
      });
      if (res.ok) {
        setUsers(await res.json());
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchUsers(); }, [authToken]);

  const deleteUser = async (id: string, email: string) => {
    if (email === 'dflorezo1996@gmail.com') return alert('No puedes eliminar al SuperAdministrador.');
    if (!window.confirm('¿Estás seguro de eliminar a este usuario del sistema permanentemente?')) return;

    try {
      const res = await fetch(`${apiBaseUrl}/users/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${authToken}` }
      });
      if (res.ok) {
        fetchUsers();
      } else {
        const body = await res.json();
        alert(body.message);
      }
    } catch (e) { console.error(e); }
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!createForm.name || !createForm.email || !createForm.role) return;
    setSubmitting(true);
    try {
      const res = await fetch(`${apiBaseUrl}/users`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`
        },
        body: JSON.stringify(createForm)
      });
      if (res.ok) {
        alert('Usuario creado exitosamente ✅');
        setShowCreateModal(false);
        setCreateForm({ name: '', email: '', role: 'customer', phone: '' });
        fetchUsers();
      } else {
        const body = await res.json();
        alert(`Error al crear usuario: ${body.message}`);
      }
    } catch (err) {
      alert('Error de conexión');
    } finally {
      setSubmitting(false);
    }
  };

  const openEdit = (u: any) => {
    setEditUser(u);
    setEditForm({
      name: u.name,
      email: u.email,
      role: u.role,
      phone: u.phone || ''
    });
  };

  const closeEdit = () => {
    setEditUser(null);
  };

  const handleUpdateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editUser) return;
    setUpdating(true);
    try {
      const res = await fetch(`${apiBaseUrl}/users/${editUser.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`
        },
        body: JSON.stringify(editForm)
      });
      if (res.ok) {
        alert('Usuario actualizado correctamente ✅');
        closeEdit();
        fetchUsers();
      } else {
        const body = await res.json();
        alert(`Error al actualizar usuario: ${body.message}`);
      }
    } catch (err) {
      alert('Error de conexión');
    } finally {
      setUpdating(false);
    }
  };

  const styles: { [key: string]: React.CSSProperties | any } = {
    table: { width: '100%', borderCollapse: 'collapse' },
    th: { textAlign: 'left', padding: '1rem', background: '#FAFAFA', color: '#777', borderBottom: '1px solid #ddd' },
    td: { padding: '1rem', borderBottom: '1px solid #eee', color: '#444', verticalAlign: 'middle' },
    btnDel: { padding: '0.4rem 0.8rem', background: '#ffebee', color: '#c62828', border: '1px solid #ffcdd2', borderRadius: '4px', cursor: 'pointer', fontSize: '0.85rem' },
    btnEdit: { padding: '0.4rem 0.8rem', background: '#e8f4fd', color: '#1565c0', border: '1px solid #bbdefb', borderRadius: '4px', cursor: 'pointer', fontSize: '0.85rem', marginRight: '0.5rem' },
    btnAdd: { padding: '0.6rem 1.2rem', background: '#D4AF37', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 600, fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '0.4rem' },
    overlay: { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 9999, display: 'grid', placeItems: 'center', padding: '1rem' },
    modal: { background: '#fff', borderRadius: '16px', padding: '2rem', width: '100%', maxWidth: '420px', margin: 'auto', boxShadow: '0 24px 64px rgba(0,0,0,0.25)', position: 'relative', maxHeight: '88vh', overflowY: 'auto' },
    modalTitle: { margin: '0 0 1.5rem 0', fontSize: '1.25rem', color: '#333', fontWeight: 700 },
    modalClose: { position: 'absolute', top: '1rem', right: '1rem', background: 'none', border: 'none', fontSize: '1.4rem', cursor: 'pointer', color: '#999' },
    label: { display: 'block', marginBottom: '0.4rem', fontSize: '0.88rem', color: '#666', fontWeight: 500 },
    input: { width: '100%', padding: '0.75rem', border: '1px solid #ddd', borderRadius: '8px', fontSize: '0.95rem', boxSizing: 'border-box' },
    btnPrimary: { background: '#D4AF37', color: '#fff', border: 'none', padding: '0.8rem 1.5rem', borderRadius: '8px', cursor: 'pointer', fontWeight: 600, width: '100%', fontSize: '0.95rem' }
  };

  return (
    <div className="animate-fade-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h3 style={{ margin: 0, color: '#333', fontSize: '1.5rem' }}>Directorio de Usuarios</h3>
        <button style={styles.btnAdd} onClick={() => setShowCreateModal(true)}>
          ➕ Agregar Usuario
        </button>
      </div>

      {loading ? <p>Cargando lista de usuarios...</p> : (
        <table style={styles.table}>
          <thead>
            <tr>
              <th style={styles.th}>Nombre</th>
              <th style={styles.th}>Email</th>
              <th style={styles.th}>Teléfono</th>
              <th style={styles.th}>Rol</th>
              <th style={styles.th}>Gestión</th>
            </tr>
          </thead>
          <tbody>
            {users.map(u => (
              <tr key={u.id}>
                <td style={styles.td}>{u.name}</td>
                <td style={styles.td}>{u.email}</td>
                <td style={styles.td}>{u.phone || <em style={{ color: '#ccc' }}>No registrado</em>}</td>
                <td style={styles.td}>
                  <span style={{ padding: '0.2rem 0.6rem', background: u.role === 'admin' ? '#e3f2fd' : '#f5f5f5', color: u.role === 'admin' ? '#1565c0' : '#666', borderRadius: '4px', fontSize: '0.85rem' }}>{u.role.toUpperCase()}</span>
                </td>
                <td style={styles.td}>
                  <button style={styles.btnEdit} onClick={() => openEdit(u)}>✏️ Editar</button>
                  {u.email !== 'dflorezo1996@gmail.com' && (
                    <button style={styles.btnDel} onClick={() => deleteUser(u.id, u.email)}>🗑️ Eliminar</button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {/* --- Create User Modal --- */}
      {showCreateModal && (
        <div style={styles.overlay} onClick={e => { if (e.target === e.currentTarget) setShowCreateModal(false); }}>
          <div style={styles.modal}>
            <button style={styles.modalClose} onClick={() => setShowCreateModal(false)} title="Cerrar">×</button>
            <h4 style={styles.modalTitle}>👤 Registrar Nuevo Usuario</h4>

            <form onSubmit={handleCreateUser}>
              <div style={{ marginBottom: '1rem' }}>
                <label style={styles.label}>Nombre Completo</label>
                <input
                  style={styles.input}
                  type="text"
                  required
                  placeholder="Ej. Juan Pérez"
                  value={createForm.name}
                  onChange={e => setCreateForm({ ...createForm, name: e.target.value })}
                />
              </div>

              <div style={{ marginBottom: '1rem' }}>
                <label style={styles.label}>Correo Electrónico</label>
                <input
                  style={styles.input}
                  type="email"
                  required
                  placeholder="Ej. juan.perez@example.com"
                  value={createForm.email}
                  onChange={e => setCreateForm({ ...createForm, email: e.target.value })}
                />
              </div>

              <div style={{ marginBottom: '1rem' }}>
                <label style={styles.label}>Teléfono</label>
                <input
                  style={styles.input}
                  type="text"
                  placeholder="Ej. +57 300 123 4567"
                  value={createForm.phone}
                  onChange={e => setCreateForm({ ...createForm, phone: e.target.value })}
                />
              </div>

              <div style={{ marginBottom: '1.5rem' }}>
                <label style={styles.label}>Rol en la Plataforma</label>
                <select
                  style={styles.input}
                  value={createForm.role}
                  onChange={e => setCreateForm({ ...createForm, role: e.target.value })}
                >
                  <option value="customer">Cliente (Customer)</option>
                  <option value="admin">Administrador (Admin)</option>
                </select>
              </div>

              <button type="submit" style={{ ...styles.btnPrimary, opacity: submitting ? 0.7 : 1 }} disabled={submitting}>
                {submitting ? 'Registrando...' : 'Crear Usuario'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* --- Edit User Modal --- */}
      {editUser && (
        <div style={styles.overlay} onClick={e => { if (e.target === e.currentTarget) closeEdit(); }}>
          <div style={styles.modal}>
            <button style={styles.modalClose} onClick={closeEdit} title="Cerrar">×</button>
            <h4 style={styles.modalTitle}>✏️ Editar Datos de Usuario</h4>

            <form onSubmit={handleUpdateUser}>
              <div style={{ marginBottom: '1rem' }}>
                <label style={styles.label}>Nombre Completo</label>
                <input
                  style={styles.input}
                  type="text"
                  required
                  value={editForm.name}
                  onChange={e => setEditForm({ ...editForm, name: e.target.value })}
                />
              </div>

              <div style={{ marginBottom: '1rem' }}>
                <label style={styles.label}>Correo Electrónico</label>
                <input
                  style={styles.input}
                  type="email"
                  required
                  value={editForm.email}
                  onChange={e => setEditForm({ ...editForm, email: e.target.value })}
                />
              </div>

              <div style={{ marginBottom: '1rem' }}>
                <label style={styles.label}>Teléfono</label>
                <input
                  style={styles.input}
                  type="text"
                  placeholder="Ej. +57 300 123 4567"
                  value={editForm.phone}
                  onChange={e => setEditForm({ ...editForm, phone: e.target.value })}
                />
              </div>

              <div style={{ marginBottom: '1.5rem' }}>
                <label style={styles.label}>Rol en la Plataforma</label>
                <select
                  style={styles.input}
                  value={editForm.role}
                  onChange={e => setEditForm({ ...editForm, role: e.target.value })}
                  disabled={editUser.email === 'dflorezo1996@gmail.com'}
                >
                  <option value="customer">Cliente (Customer)</option>
                  <option value="admin">Administrador (Admin)</option>
                </select>
                {editUser.email === 'dflorezo1996@gmail.com' && (
                  <small style={{ color: '#aaa', display: 'block', marginTop: '0.25rem' }}>
                    * El SuperAdministrador debe conservar su rol de admin obligatoriamente.
                  </small>
                )}
              </div>

              <button type="submit" style={{ ...styles.btnPrimary, opacity: updating ? 0.7 : 1 }} disabled={updating}>
                {updating ? 'Guardando...' : 'Guardar Cambios ✅'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
