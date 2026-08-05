import React, { useState, useEffect } from 'react';

export const OrdersManager: React.FC<{ apiBaseUrl: string, authToken: string }> = ({ apiBaseUrl, authToken }) => {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [trackingFilter, setTrackingFilter] = useState('');
  const [paymentFilter, setPaymentFilter] = useState('');

  const fetchOrders = async () => {
    try {
      const res = await fetch(`${apiBaseUrl}/orders`, {
        headers: { 'Authorization': `Bearer ${authToken}` }
      });
      if (res.ok) {
        const data = await res.json();
        setOrders(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [authToken]);

  const updateStatus = async (id: string, newStatus: string) => {
    try {
      await fetch(`${apiBaseUrl}/orders/${id}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${authToken}` },
        body: JSON.stringify({ status: newStatus })
      });
      fetchOrders();
    } catch (err) {
      console.error(err);
    }
  };

  const updatePaymentStatus = async (id: string, newPaymentStatus: string, phone?: string) => {
    try {
      await fetch(`${apiBaseUrl}/orders/${id}/payment`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${authToken}` },
        body: JSON.stringify({ paymentStatus: newPaymentStatus })
      });
      fetchOrders();

      if (phone) {
        const cleanPhone = phone.replace(/\D/g, '');
        const finalPhone = cleanPhone.startsWith('57') || cleanPhone.length > 10 ? cleanPhone : '57' + cleanPhone;

        if (newPaymentStatus === 'Pagado') {
          const message = 'el pago a sido verificado y es exitoso, su orden ya se encuentra en gestion, muchas gracias por preferirnos';
          window.open(`https://wa.me/${finalPhone}?text=${encodeURIComponent(message)}`, '_blank');
        } else if (newPaymentStatus === 'No pagado') {
          const message = 'El pago no fue exitoso o su transacción fue cancelada ';
          window.open(`https://wa.me/${finalPhone}?text=${encodeURIComponent(message)}`, '_blank');
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  const styles: { [key: string]: React.CSSProperties | any } = {
    table: { width: '100%', borderCollapse: 'collapse' },
    th: { textAlign: 'left', padding: '1rem', background: '#FAFAFA', color: '#777', borderBottom: '1px solid #ddd', position: 'sticky', top: '4.1rem', zIndex: 10 },
    td: { padding: '1rem', borderBottom: '1px solid #eee', color: '#444' },
    select: { padding: '0.5rem', borderRadius: '4px', border: '1px solid #ddd', background: '#fff' },
    statusBadge: (status: string, paymentStatus: string) => {
      const isNullState = ['No pagado', 'Pendiente'].includes(paymentStatus || 'Pendiente');
      if (isNullState) {
        return { padding: '0.25rem 0.75rem', borderRadius: '999px', fontSize: '0.85rem', fontWeight: 600, background: '#f0f0f0', color: '#888' };
      }
      return {
        padding: '0.25rem 0.75rem', borderRadius: '999px', fontSize: '0.85rem', fontWeight: 600,
        background: status === 'Entregado' ? '#e6f4ea' : status === 'En proceso' ? '#fef7e0' : '#fce8e6',
        color: status === 'Entregado' ? '#137333' : status === 'En proceso' ? '#b06000' : '#c5221f'
      };
    }
  };

  const filteredOrders = orders.filter(o => {
    const matchesTracking = (o.trackingCode || '').toLowerCase().includes(trackingFilter.toLowerCase());
    const matchesPayment = paymentFilter ? o.paymentStatus === paymentFilter : true;
    return matchesTracking && matchesPayment;
  });

  return (
    <div className="animate-fade-in">
      <div style={{
        position: 'sticky',
        top: '-2rem',
        zIndex: 20,
        background: '#fff',
        padding: '2rem 0 1.5rem 0',
        margin: '-2rem 0 0 0',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderBottom: '1px solid #eee'
      }}>
        <h3 style={{ margin: 0, color: '#333', fontSize: '1.5rem' }}>Gestión de Órdenes</h3>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <select
            value={paymentFilter}
            onChange={(e) => setPaymentFilter(e.target.value)}
            style={{ ...styles.select, width: '160px', borderColor: '#ddd' }}
          >
            <option value="">Todos los pagos</option>
            <option value="Pendiente">Pendiente</option>
            <option value="Pagado">Pagado</option>
            <option value="No pagado">No pagado</option>
          </select>
          <div style={{ position: 'relative' }}>
            <svg style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', width: '18px', height: '18px', fill: '#999' }} viewBox="0 0 24 24">
              <path d="M15.5 14h-.79l-.28-.27A6.471 6.471 0 0 0 16 9.5 6.5 6.5 0 1 0 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z" />
            </svg>
            <input
              type="text"
              placeholder="Buscar tracking..."
              value={trackingFilter}
              onChange={(e) => setTrackingFilter(e.target.value)}
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
      </div>
      {loading ? <p>Cargando órdenes...</p> : (
        <table style={styles.table}>
          <thead>
            <tr>
              <th style={styles.th}>Cliente / Productos</th>
              <th style={styles.th}>Fecha y Hora</th>
              <th style={styles.th}>Tracking</th>
              <th style={styles.th}>Total</th>
              <th style={styles.th}>Pago</th>
            </tr>
          </thead>
          <tbody>
            {filteredOrders.map(o => (
              <tr key={o.id}>
                <td style={styles.td}>
                  <strong>{o.customerName}</strong><br />
                  <small style={{ color: '#888' }}>
                    {o.customerEmail}<br />
                    {o.customerPhone && <><span style={{ fontWeight: 600 }}>Tel:</span> {o.customerPhone}<br /></>}
                    {o.customerAddress && <><span style={{ fontWeight: 600 }}>Dir:</span> {o.customerAddress}<br /></>}
                    {o.deliveryDate && <><span style={{ fontWeight: 600 }}>Entrega:</span> {o.deliveryDate}</>}
                  </small>
                  {o.items && o.items.length > 0 && (
                    <div style={{ marginTop: '0.5rem', borderTop: '1px dashed #eee', paddingTop: '0.5rem' }}>
                      <span style={{ fontSize: '0.8rem', color: '#777', fontWeight: 600 }}>Detalles del pedido:</span>
                      <ul style={{ margin: '0.2rem 0 0 0', paddingLeft: '1.2rem', fontSize: '0.8rem', color: '#555', listStyleType: 'disc' }}>
                        {o.items.map((item: any) => (
                          <li key={item.id} style={{ marginBottom: '0.25rem' }}>
                            <strong>{item.Product?.name || 'Producto'}</strong> (x{item.quantity})
                            {item.customMessage ? (
                              <div style={{ color: '#D4AF37', fontStyle: 'italic', marginTop: '0.1rem', paddingLeft: '0.5rem', borderLeft: '2px solid #D4AF37' }}>
                                💬 "{item.customMessage}"
                              </div>
                            ) : (
                              <span style={{ color: '#aaa', marginLeft: '0.5rem', fontSize: '0.75rem' }}>(Sin mensaje)</span>
                            )}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </td>
                <td style={styles.td}>
                  {new Date(o.createdAt).toLocaleString('es-CO', {
                    year: 'numeric',
                    month: '2-digit',
                    day: '2-digit',
                    hour: '2-digit',
                    minute: '2-digit',
                    hour12: true
                  })}
                </td>
                <td style={styles.td}>{o.trackingCode}</td>
                <td style={styles.td}>{parseFloat(o.totalPrice).toLocaleString('es-CO', { style: 'currency', currency: 'COP' })}</td>
                <td style={styles.td}>
                  <div style={{ marginBottom: '0.5rem', fontSize: '0.85rem', color: '#555' }}>
                    <strong>Método:</strong> {o.paymentMethod || 'No seleccionado'}
                  </div>
                  <select
                    style={{
                      ...styles.select,
                      borderColor: (o.paymentStatus || 'Pendiente') === 'Pagado' ? '#137333' : (o.paymentStatus === 'No pagado' ? '#c5221f' : '#b06000'),
                      color: (o.paymentStatus || 'Pendiente') === 'Pagado' ? '#137333' : (o.paymentStatus === 'No pagado' ? '#c5221f' : '#b06000'),
                      fontWeight: 600
                    }}
                    value={o.paymentStatus || 'Pendiente'}
                    onChange={e => updatePaymentStatus(o.id, e.target.value, o.customerPhone)}
                  >
                    <option value="Pendiente">Pendiente</option>
                    <option value="Pagado">Pagado</option>
                    <option value="No pagado">No pagado</option>
                  </select>
                </td>

              </tr>
            ))}
            {filteredOrders.length === 0 && <tr><td colSpan={7} style={{ ...styles.td, textAlign: 'center' }}>No se encontraron órdenes</td></tr>}
          </tbody>
        </table>
      )}
    </div>
  );
};
