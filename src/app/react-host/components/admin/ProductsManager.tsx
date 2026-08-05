import React, { useState, useEffect } from 'react';

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  imageUrl?: string;
  gender?: string;
  isActive?: boolean;
}

export const ProductsManager: React.FC<{ apiBaseUrl: string, authToken: string }> = ({ apiBaseUrl, authToken }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [nameFilter, setNameFilter] = useState('');
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'activo' | 'inhabilitado'>('activo');

  // --- Create form state ---
  const [formData, setFormData] = useState({ name: '', description: '', price: '', category: 'Anchetas', gender: '' });
  const [file, setFile] = useState<File | null>(null);

  // --- Edit modal state ---
  const [editProduct, setEditProduct] = useState<Product | null>(null);
  const [editForm, setEditForm] = useState({ name: '', description: '', price: '', category: 'Anchetas', gender: '' });
  const [editFile, setEditFile] = useState<File | null>(null);
  const [updating, setUpdating] = useState(false);

  const fetchProds = async () => {
    try {
      const res = await fetch(`${apiBaseUrl}/products`);
      if (res.ok) setProducts(await res.json());
    } catch (e) { } finally { setLoading(false); }
  };

  useEffect(() => { fetchProds(); }, []);

  // --- Create product ---
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const fd = new FormData();
      fd.append('name', formData.name);
      fd.append('description', formData.description);
      fd.append('price', formData.price);
      fd.append('category', formData.category);
      fd.append('gender', formData.category === 'Ramos' ? '' : formData.gender);
      if (file) fd.append('image', file);

      const res = await fetch(`${apiBaseUrl}/products`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${authToken}` },
        body: fd
      });

      if (res.ok) {
        alert('Producto Creado Exitosamente ✨');
        fetchProds();
        setFormData({ name: '', description: '', price: '', category: 'Anchetas', gender: '' });
        setFile(null);
        const fileInput = document.getElementById('file-upload') as HTMLInputElement;
        if (fileInput) fileInput.value = '';
      } else {
        alert('Error al crear. (Recuerda configurar tus credenciales de Cloudinary en el archivo .env del backend)');
      }
    } catch (e) {
      alert('Error de conexión');
    } finally { setSubmitting(false); }
  };

  // --- Delete product ---
  const deleteProd = async (id: string) => {
    if (!window.confirm('¿Seguro de remover este producto de la tienda pública?')) return;
    try {
      await fetch(`${apiBaseUrl}/products/${id}`, { method: 'DELETE', headers: { 'Authorization': `Bearer ${authToken}` } });
      fetchProds();
    } catch (e) { }
  };

  // --- Enable product ---
  const enableProd = async (id: string) => {
    try {
      const res = await fetch(`${apiBaseUrl}/products/${id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ isActive: true })
      });
      if (res.ok) {
        alert('Producto Habilitado Exitosamente ✅');
        fetchProds();
      } else {
        alert('Error al habilitar el producto');
      }
    } catch (e) {
      alert('Error de conexión');
    }
  };

  // --- Open edit modal ---
  const openEdit = (p: Product) => {
    setEditProduct(p);
    setEditForm({ name: p.name, description: p.description, price: String(p.price), category: p.category, gender: p.gender || '' });
    setEditFile(null);
  };

  const closeEdit = () => {
    setEditProduct(null);
    setEditFile(null);
  };

  // --- Update product ---
  const updateProd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editProduct) return;
    setUpdating(true);
    try {
      const fd = new FormData();
      fd.append('name', editForm.name);
      fd.append('description', editForm.description);
      fd.append('price', editForm.price);
      fd.append('category', editForm.category);
      fd.append('gender', editForm.category === 'Ramos' ? '' : editForm.gender);
      if (editFile) fd.append('image', editFile);

      const res = await fetch(`${apiBaseUrl}/products/${editProduct.id}`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${authToken}` },
        body: fd
      });

      if (res.ok) {
        alert('Producto actualizado correctamente ✅');
        closeEdit();
        fetchProds();
      } else {
        const err = await res.json().catch(() => ({}));
        alert(`Error al actualizar: ${err.message || res.statusText}`);
      }
    } catch (e) {
      alert('Error de conexión al actualizar');
    } finally { setUpdating(false); }
  };

  const styles: { [key: string]: React.CSSProperties } = {
    formBox: { padding: '1.5rem', background: '#FAFAFA', border: '1px solid #eee', borderRadius: '12px', marginBottom: '3rem', boxShadow: '0 4px 6px rgba(0,0,0,0.02)' },
    input: { width: '100%', padding: '0.75rem', marginBottom: '1rem', border: '1px solid #ddd', borderRadius: '8px', fontSize: '0.95rem', boxSizing: 'border-box' },
    row: { display: 'flex', gap: '1rem' },
    table: { width: '100%', borderCollapse: 'collapse' },
    th: { textAlign: 'left', padding: '1rem', background: '#FAFAFA', color: '#777', borderBottom: '1px solid #ddd', position: 'sticky', top: 0, zIndex: 10 },
    td: { padding: '1rem', borderBottom: '1px solid #eee', color: '#444', verticalAlign: 'middle' },
    btnPrimary: { background: '#D4AF37', color: '#fff', border: 'none', padding: '0.8rem 1.5rem', borderRadius: '8px', cursor: 'pointer', fontWeight: 600, display: 'block', width: '100%' },
    btnDel: { padding: '0.3rem 0.7rem', background: '#ffebee', color: '#c62828', border: '1px solid #ffcdd2', borderRadius: '4px', cursor: 'pointer', fontSize: '0.85rem' },
    btnEdit: { padding: '0.3rem 0.7rem', background: '#e8f4fd', color: '#1565c0', border: '1px solid #bbdefb', borderRadius: '4px', cursor: 'pointer', fontSize: '0.85rem', marginRight: '0.4rem' },
    // Modal
    overlay: { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 9999, display: 'grid', placeItems: 'center', padding: '1rem' },
    modal: { background: '#fff', borderRadius: '16px', padding: '2rem', width: '100%', maxWidth: '520px', margin: 'auto', boxShadow: '0 24px 64px rgba(0,0,0,0.25)', position: 'relative', maxHeight: '88vh', overflowY: 'auto' },
    modalTitle: { marginBottom: '1.2rem', fontSize: '1.2rem', color: '#333', fontWeight: 700 },
    modalClose: { position: 'absolute', top: '1rem', right: '1rem', background: 'none', border: 'none', fontSize: '1.4rem', cursor: 'pointer', color: '#999' },
    btnUpdate: { background: '#D4AF37', color: '#fff', border: 'none', padding: '0.8rem 1.5rem', borderRadius: '8px', cursor: 'pointer', fontWeight: 600, width: '100%' },
    currentImg: { width: '80px', height: '80px', objectFit: 'cover', borderRadius: '8px', border: '1px solid #ddd', display: 'block', marginBottom: '0.5rem' },
    label: { display: 'block', marginBottom: '0.4rem', fontSize: '0.88rem', color: '#666', fontWeight: 500 },
  };

  return (
    <div className="animate-fade-in">
      <h3 style={{ marginBottom: '1.5rem', color: '#333', fontSize: '1.5rem' }}>Inventario y Productos</h3>

      {/* ── Create Form ── */}
      <div style={styles.formBox}>
        <h4 style={{ marginBottom: '1rem', color: '#555' }}>Añadir Nuevo Artículo</h4>
        <form onSubmit={handleSubmit}>
          <input style={styles.input} type="text" placeholder="Nombre (Ej. Cajita Mágica)" required value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} />
          <textarea style={{ ...styles.input, resize: 'vertical', minHeight: '80px' }} placeholder="Descripción emotiva del detalle..." required value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} />

          <div style={styles.row}>
            <input
              style={styles.input}
              type="text"
              placeholder="Precio (COP)"
              required
              value={formData.price}
              onChange={e => {
                // Keep only digits and optional decimal point
                const cleaned = e.target.value.replace(/[^\d.]/g, '');
                setFormData({ ...formData, price: cleaned });
              }}
            />
            {formData.price && (
              <div style={{ marginLeft: '0.5rem', fontWeight: 600, color: '#D4AF37' }}>
                {Number(formData.price).toLocaleString('es-CO', { style: 'currency', currency: 'COP' })}
              </div>
            )}
            <select style={styles.input} value={formData.category} onChange={e => setFormData({ ...formData, category: e.target.value })}>
              <option value="Anchetas">Anchetas</option>
              <option value="Ramos">Ramos</option>
              <option value="Desayunos">Desayunos sorpresa</option>
              <option value="Decoraciones">Decoraciones</option>
              <option value="Detallitos">Detallitos</option>
            </select>
          </div>

          {formData.category !== 'Ramos' && (
            <div style={{ marginBottom: '1rem' }}>
              <label style={styles.label}>Género / Subcategoría</label>
              <select style={styles.input} value={formData.gender} onChange={e => setFormData({ ...formData, gender: e.target.value })}>
                <option value="">Selecciona una opción (opcional)</option>
                <option value="adulto">Adulto</option>
                <option value="nino">Niño</option>
                <option value="mujer_adulta">Adulta</option>
                <option value="nina">Niña</option>
              </select>
            </div>
          )}

          <div style={{ marginBottom: '1.5rem' }}>
            <label style={styles.label}>Subir Fotografía (JPG, PNG)</label>
            <input id="file-upload" style={{ ...styles.input, padding: '0.5rem' }} type="file" accept="image/*" onChange={e => { if (e.target.files) setFile(e.target.files[0]); }} />
            <small style={{ color: '#999' }}>* Se guardará en la nube con Cloudinary.</small>
          </div>

          <button type="submit" style={{ ...styles.btnPrimary, opacity: submitting ? 0.7 : 1 }} disabled={submitting}>
            {submitting ? 'Creando y Subiendo...' : 'Publicar Producto 📤'}
          </button>
        </form>
      </div>

      {/* ── Products List Section ── */}
      <div style={{ position: 'relative', border: '1px solid #ddd', borderRadius: '12px', background: '#fff', overflow: 'hidden' }}>
        
        {/* Header & Search */}
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          padding: '1.5rem',
          borderBottom: '1px solid #eee',
          background: '#fff',
          zIndex: 20,
          flexWrap: 'wrap',
          gap: '1rem'
        }}>
          <div style={{ display: 'flex', gap: '1rem' }}>
            <button
              onClick={() => setActiveTab('activo')}
              style={{
                background: 'none',
                border: 'none',
                fontSize: '1.2rem',
                fontWeight: activeTab === 'activo' ? 'bold' : 'normal',
                color: activeTab === 'activo' ? '#D4AF37' : '#777',
                borderBottom: activeTab === 'activo' ? '3px solid #D4AF37' : 'none',
                paddingBottom: '0.25rem',
                cursor: 'pointer'
              }}
            >
              Catálogo Público
            </button>
            <button
              onClick={() => setActiveTab('inhabilitado')}
              style={{
                background: 'none',
                border: 'none',
                fontSize: '1.2rem',
                fontWeight: activeTab === 'inhabilitado' ? 'bold' : 'normal',
                color: activeTab === 'inhabilitado' ? '#D4AF37' : '#777',
                borderBottom: activeTab === 'inhabilitado' ? '3px solid #D4AF37' : 'none',
                paddingBottom: '0.25rem',
                cursor: 'pointer'
              }}
            >
              Inhabilitados
            </button>
          </div>
          <div style={{ position: 'relative' }}>
            <svg style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', width: '18px', height: '18px', fill: '#999' }} viewBox="0 0 24 24">
              <path d="M15.5 14h-.79l-.28-.27A6.471 6.471 0 0 0 16 9.5 6.5 6.5 0 1 0 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/>
            </svg>
            <input 
              type="text" 
              placeholder="Buscar por nombre..." 
              value={nameFilter}
              onChange={(e) => setNameFilter(e.target.value)}
              style={{ 
                padding: '0.7rem 1rem 0.7rem 2.5rem', 
                borderRadius: '8px', 
                border: '1px solid #ddd', 
                width: '260px', 
                outline: 'none',
                fontSize: '0.95rem',
                transition: 'all 0.2s',
                boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.05)'
              }}
              onFocus={(e) => e.target.style.borderColor = '#D4AF37'}
              onBlur={(e) => e.target.style.borderColor = '#ddd'}
            />
          </div>
        </div>

        {/* Scrollable Table Container */}
        <div style={{ maxHeight: '450px', overflowY: 'auto' }}>
          {loading ? <p style={{ padding: '1.5rem' }}>Cargando vitrina...</p> : (
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.th}>Foto</th>
                  <th style={styles.th}>Nombre</th>
                  <th style={styles.th}>Categ.</th>
                  <th style={styles.th}>Precio</th>
                  <th style={styles.th}>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {products.filter(p => (p.name || '').toLowerCase().includes(nameFilter.toLowerCase()) && (activeTab === 'activo' ? p.isActive !== false : p.isActive === false)).map(p => (
                  <tr key={p.id}>
                    <td style={styles.td}>
                      {p.imageUrl
                        ? <img 
                            src={p.imageUrl} 
                            width="45" 
                            height="45" 
                            style={{ borderRadius: '8px', objectFit: 'cover', border: '1px solid #ddd', cursor: 'pointer', transition: 'transform 0.2s' }} 
                            alt={p.name} 
                            onClick={() => setSelectedImage(p.imageUrl || null)}
                            onMouseOver={e => e.currentTarget.style.transform = 'scale(1.15)'}
                            onMouseOut={e => e.currentTarget.style.transform = 'scale(1)'}
                          />
                        : <div style={{ width: '45px', height: '45px', background: '#eee', borderRadius: '8px' }} />
                      }
                    </td>
                    <td style={styles.td}><strong>{p.name}</strong></td>
                    <td style={styles.td}>
                      <span style={{ color: '#888', fontSize: '0.9rem' }}>{p.category}</span>
                      {p.gender && (
                        <div style={{ fontSize: '0.75rem', color: '#B47C00', fontWeight: 600, marginTop: '0.2rem' }}>
                          🚻 {p.gender === 'adulto' ? 'Adulto' : p.gender === 'nino' ? 'Niño' : p.gender === 'mujer_adulta' ? 'Adulta' : p.gender === 'nina' ? 'Niña' : p.gender}
                        </div>
                      )}
                    </td>
                    <td style={styles.td}>{p.price.toLocaleString('es-CO', { style: 'currency', currency: 'COP' })}</td>
                    <td style={styles.td}>
                      <button style={styles.btnEdit} onClick={() => openEdit(p)}>✏️ Editar</button>
                      {activeTab === 'activo' ? (
                        <button style={styles.btnDel} onClick={() => deleteProd(p.id)}>Eliminar</button>
                      ) : (
                        <button style={{ ...styles.btnEdit, background: '#e8f5e9', color: '#2e7d32', border: '1px solid #c8e6c9', marginRight: 0 }} onClick={() => enableProd(p.id)}>Habilitar</button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Image Viewer Constrained */}
        {selectedImage && (
          <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.85)', zIndex: 999, display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '2rem' }} onClick={() => setSelectedImage(null)}>
            <button 
              style={{ position: 'absolute', top: '15px', right: '20px', background: 'none', border: 'none', color: '#fff', fontSize: '2rem', cursor: 'pointer', zIndex: 1000 }} 
              onClick={() => setSelectedImage(null)}
              title="Cerrar"
            >×</button>
            <img 
              src={selectedImage} 
              alt="Ampliado" 
              style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain', borderRadius: '8px', boxShadow: '0 10px 40px rgba(0,0,0,0.5)' }} 
              onClick={e => e.stopPropagation()}
            />
          </div>
        )}
      </div>

      {/* ── Edit Modal ── */}
      {editProduct && (
        <div style={styles.overlay} onClick={e => { if (e.target === e.currentTarget) closeEdit(); }}>
          <div style={styles.modal}>
            <button style={styles.modalClose} onClick={closeEdit} title="Cerrar">×</button>
            <p style={styles.modalTitle}>✏️ Editar Producto</p>

            <form onSubmit={updateProd}>
              <label style={styles.label}>Nombre</label>
              <input style={styles.input} type="text" required value={editForm.name} onChange={e => setEditForm({ ...editForm, name: e.target.value })} />

              <label style={styles.label}>Descripción</label>
              <textarea style={{ ...styles.input, resize: 'vertical', minHeight: '80px' }} required value={editForm.description} onChange={e => setEditForm({ ...editForm, description: e.target.value })} />

              <div style={styles.row}>
                <div style={{ flex: 1 }}>
                  <label style={styles.label}>Precio ($)</label>
                  <input style={styles.input} type="number" required value={editForm.price} onChange={e => setEditForm({ ...editForm, price: e.target.value })} />
                </div>
                <div style={{ flex: 1 }}>
                  <label style={styles.label}>Categoría</label>
                  <select style={styles.input} value={editForm.category} onChange={e => setEditForm({ ...editForm, category: e.target.value })}>
                    <option value="Anchetas">Anchetas</option>
                    <option value="Ramos">Ramos</option>
                    <option value="Desayunos">Desayunos sorpresa</option>
                    <option value="Decoraciones">Decoraciones</option>
                    <option value="Detallitos">Detallitos</option>
                  </select>
                </div>
              </div>

              {editForm.category !== 'Ramos' && (
                <div style={{ marginBottom: '1rem' }}>
                  <label style={styles.label}>Género / Subcategoría</label>
                  <select style={styles.input} value={editForm.gender} onChange={e => setEditForm({ ...editForm, gender: e.target.value })}>
                    <option value="">Selecciona una opción (opcional)</option>
                    <option value="adulto">Adulto</option>
                    <option value="nino">Niño</option>
                    <option value="mujer_adulta">Adulta</option>
                    <option value="nina">Niña</option>
                  </select>
                </div>
              )}

              <label style={styles.label}>Imagen actual</label>
              {editProduct.imageUrl
                ? <img src={editProduct.imageUrl} alt="actual" style={styles.currentImg} />
                : <div style={{ ...styles.currentImg, background: '#eee' }} />
              }

              <label style={styles.label}>Reemplazar imagen (opcional)</label>
              <input
                id="edit-file-upload"
                style={{ ...styles.input, padding: '0.5rem' }}
                type="file"
                accept="image/*"
                onChange={e => { if (e.target.files) setEditFile(e.target.files[0]); }}
              />
              <small style={{ color: '#999', display: 'block', marginBottom: '1.2rem' }}>
                * Si no seleccionas una nueva imagen, se conserva la actual.
              </small>

              <button type="submit" style={{ ...styles.btnUpdate, opacity: updating ? 0.7 : 1 }} disabled={updating}>
                {updating ? 'Guardando cambios...' : 'Guardar Cambios ✅'}
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
