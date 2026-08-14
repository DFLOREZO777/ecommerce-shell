import React, { useState, useEffect } from 'react';

export interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  imageUrl?: string;
  customMessage?: string;
}

interface ShoppingCartProps {
  onCheckoutSuccess?: (trackingCode: string) => void;
  apiBaseUrl?: string;
}

export const ShoppingCart: React.FC<ShoppingCartProps> = ({ onCheckoutSuccess, apiBaseUrl = 'https://ecommerce-api-nameless-brook-1050.fly.dev/api' }) => {
  const [items, setItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [customerInfo, setCustomerInfo] = useState({ name: '', email: '', phone: '', address: '', deliveryDate: '' });
  const [showPaymentScreen, setShowPaymentScreen] = useState(false);
  const [orderConfirmationData, setOrderConfirmationData] = useState<{ id: string, trackingCode: string, total: number, items: CartItem[] } | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<'nequi' | 'breb'>('nequi');
  const [nequiPhone, setNequiPhone] = useState('');
  const [paymentConfirmed, setPaymentConfirmed] = useState(false);

  // Persistence: Load from LocalStorage
  useEffect(() => {
    const saved = localStorage.getItem('ecommerce_cart');
    if (saved) {
      try {
        setItems(JSON.parse(saved));
      } catch (e) {
        console.error('Error al procesar los datos del carrito');
      }
    }
  }, []);

  // Persistence: Save to LocalStorage
  useEffect(() => {
    localStorage.setItem('ecommerce_cart', JSON.stringify(items));
  }, [items]);

  const updateQuantity = (id: string, customMessage: string | undefined, delta: number) => {
    setItems(current => {
      return current.map(item => {
        if (item.id === id && item.customMessage === customMessage) {
          const newQ = Math.max(0, item.quantity + delta);
          return { ...item, quantity: newQ };
        }
        return item;
      }).filter(item => item.quantity > 0);
    });
  };

  const calculateTotal = () => {
    return items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  };

  const handleCheckout = (e: React.FormEvent) => {
    e.preventDefault();
    if (items.length === 0) return setError('Tu carrito está vacío');
    if (!customerInfo.name || !customerInfo.phone || !customerInfo.address || !customerInfo.deliveryDate) return setError('Por favor ingresa todos los datos obligatorios');
    setError('');
    setShowPaymentScreen(true);
  };

  const handleConfirmPaymentAndCreateOrder = async (method: 'nequi' | 'breb') => {
    if (items.length === 0) return setError('Tu carrito está vacío');
    setLoading(true);
    setError('');
    try {
      const payload = {
        customerName: customerInfo.name,
        customerEmail: customerInfo.email || 'no-email@example.com',
        customerPhone: customerInfo.phone,
        customerAddress: customerInfo.address,
        deliveryDate: customerInfo.deliveryDate,
        items: items.map(i => ({
          productId: i.id,
          quantity: i.quantity,
          customMessage: i.customMessage
        })),
        paymentMethod: method === 'nequi' ? 'Nequi' : 'BRE-B',
        paymentStatus: 'Pendiente'
      };

      const res = await fetch(`${apiBaseUrl}/orders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!res.ok) throw new Error('Error al enviar la orden');

      const data = await res.json();
      const orderTotal = calculateTotal();
      const orderItems = [...items];

      // Open WhatsApp
      const cleanPhone = customerInfo.phone.replace(/\D/g, '');
      const finalPhone = '573505172277'; // Target merchant phone
      let message = '';
      if (method === 'nequi') {
        message = `Hola, ya realicé el pago por Nequi.\nCódigo: ${data.trackingCode}\nMonto: ${orderTotal.toLocaleString('es-CO', { style: 'currency', currency: 'COP' })}\nMi Nequi: ${nequiPhone}`;
      } else {
        message = `Hola, ya realicé la transferencia por BRE-B.\nCódigo: ${data.trackingCode}\nMonto: ${orderTotal.toLocaleString('es-CO', { style: 'currency', currency: 'COP' })}`;
      }
      window.open(`https://wa.me/${finalPhone}?text=${encodeURIComponent(message)}`, '_blank');

      // Clear cart
      setItems([]);
      setShowPaymentScreen(false);

      if (onCheckoutSuccess) {
        onCheckoutSuccess(data.trackingCode);
      } else {
        setOrderConfirmationData({ id: data.orderId, trackingCode: data.trackingCode, total: orderTotal, items: orderItems });
      }
    } catch (err: any) {
      setError(err.message || 'Error al procesar el pago y crear la orden');
    } finally {
      setLoading(false);
    }
  };

  const styles: { [key: string]: React.CSSProperties } = {
    container: { padding: '2rem', maxWidth: '800px', margin: '2rem auto', background: '#FAFAFA', borderRadius: '16px' },
    header: { fontSize: '2rem', color: '#333', marginBottom: '1.5rem', fontWeight: 600, borderBottom: '2px solid #D4AF37', paddingBottom: '0.5rem' },
    itemRow: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1rem', background: '#fff', borderRadius: '8px', marginBottom: '1rem', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' },
    img: { width: '60px', height: '60px', objectFit: 'cover', borderRadius: '8px' as const },
    details: { flex: 1, marginLeft: '1rem' },
    itemName: { fontSize: '1.1rem', fontWeight: 500, margin: 0, color: '#333' },
    itemPrice: { color: '#777', margin: '0.2rem 0 0 0' },
    controls: { display: 'flex', alignItems: 'center', gap: '1rem' },
    controlBtn: { background: '#FFB6C1', color: '#fff', border: 'none', borderRadius: '50%', width: '30px', height: '30px', cursor: 'pointer', fontWeight: 'bold' as const },
    total: { fontSize: '1.5rem', fontWeight: 600, color: '#D4AF37', textAlign: 'right' as const, marginTop: '2rem' },
    form: { display: 'flex', flexDirection: 'column' as const, gap: '1rem', marginTop: '2rem', background: '#fff', padding: '1.5rem', borderRadius: '8px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' },
    input: { padding: '0.75rem', borderRadius: '8px', border: '1px solid #ddd', fontSize: '1rem', fontFamily: 'inherit' },
    checkoutBtn: { background: '#D4AF37', color: '#fff', padding: '1rem', border: 'none', borderRadius: '999px', fontSize: '1.1rem', fontWeight: 500, cursor: 'pointer', marginTop: '1rem', transition: 'all 0.3s' },
    error: { color: 'red', background: '#fee', padding: '0.75rem', borderRadius: '8px', marginTop: '1rem' }
  };

  if (orderConfirmationData) {
    return (
      <div style={styles.container} className="glass-panel animate-fade-in">
        <h2 style={{ ...styles.header, color: '#D4AF37' }}>🎉 ¡Pedido Confirmado!</h2>
        <div style={{ background: '#fff', padding: '1.5rem', borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.04)', marginBottom: '1.5rem', textAlign: 'center' }}>
          <h3 style={{ color: '#137333', fontSize: '1.4rem', marginBottom: '1rem' }}>¡Gracias por tu compra!</h3>
          <p style={{ color: '#555', fontSize: '1rem', lineHeight: '1.6' }}>
            Tu pago está siendo verificado. Te contactaremos pronto para coordinar la entrega.
          </p>
          <div style={{ margin: '2rem 0', padding: '1.5rem', background: '#FAFAFA', borderRadius: '8px', border: '1px dashed #D4AF37' }}>
            <p style={{ margin: '0 0 0.5rem 0', color: '#888' }}>Tu código de seguimiento:</p>
            <p style={{ margin: 0, fontSize: '1.8rem', fontWeight: 'bold', color: '#D4AF37', letterSpacing: '1px' }}>{orderConfirmationData.trackingCode}</p>
          </div>
          <button
            onClick={() => setOrderConfirmationData(null)}
            style={{ ...styles.checkoutBtn, background: '#D4AF37', width: '200px' }}
          >
            Volver a la Tienda
          </button>
        </div>
      </div>
    );
  }

  if (showPaymentScreen) {
    const orderTotal = calculateTotal();
    return (
      <div style={styles.container} className="glass-panel animate-fade-in">
        <h2 style={{ ...styles.header, color: '#D4AF37' }}>💳 Pago de tu Pedido</h2>

        {/* ── Resumen de la compra ── */}
        <div style={{ background: '#fff', padding: '1.5rem', borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.04)', marginBottom: '1.5rem' }}>
          <h3 style={{ margin: '0 0 1rem 0', color: '#333', fontSize: '1.1rem' }}>📋 Resumen de tu Compra</h3>
          <div style={{ borderTop: '1px solid #eee', paddingTop: '0.75rem' }}>
            {items.map((item, idx) => (
              <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.5rem 0', borderBottom: '1px dashed #f0f0f0' }}>
                <div>
                  <span style={{ fontWeight: 500, color: '#333' }}>{item.name}</span>
                  <span style={{ color: '#999', marginLeft: '0.5rem', fontSize: '0.9rem' }}>x{item.quantity}</span>
                </div>
                <span style={{ fontWeight: 600, color: '#555' }}>{(item.price * item.quantity).toLocaleString('es-CO', { style: 'currency', currency: 'COP' })}</span>
              </div>
            ))}
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '1rem', paddingTop: '1rem', borderTop: '2px solid #D4AF37' }}>
            <span style={{ fontSize: '1.2rem', fontWeight: 700, color: '#333' }}>Total a Pagar:</span>
            <span style={{ fontSize: '1.4rem', fontWeight: 800, color: '#D4AF37' }}>{orderTotal.toLocaleString('es-CO', { style: 'currency', currency: 'COP' })}</span>
          </div>
        </div>

        {/* ── Selector de método de pago ── */}
        <div style={{ background: '#fff', padding: '1.5rem', borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.04)' }}>
          <h3 style={{ margin: '0 0 1.2rem 0', color: '#333', fontSize: '1.1rem' }}>Selecciona tu método de pago</h3>

          {/* Tabs */}
          <div style={{ display: 'flex', gap: '0', marginBottom: '1.5rem', borderRadius: '10px', overflow: 'hidden', border: '2px solid #eee' }}>
            <button
              type="button"
              onClick={() => setPaymentMethod('nequi')}
              style={{
                flex: 1, padding: '1rem', border: 'none', cursor: 'pointer', fontSize: '1rem', fontWeight: 600, transition: 'all 0.3s',
                background: paymentMethod === 'nequi' ? '#E11C60' : '#fff',
                color: paymentMethod === 'nequi' ? '#fff' : '#555',
              }}
            >
              📱 Nequi
            </button>
            <button
              type="button"
              onClick={() => setPaymentMethod('breb')}
              style={{
                flex: 1, padding: '1rem', border: 'none', cursor: 'pointer', fontSize: '1rem', fontWeight: 600, transition: 'all 0.3s',
                background: paymentMethod === 'breb' ? '#00529B' : '#fff',
                color: paymentMethod === 'breb' ? '#fff' : '#555',
              }}
            >
              🏦 BRE-B
            </button>
          </div>

          {/* ── Nequi Panel ── */}
          {paymentMethod === 'nequi' && (
            <div style={{ border: '2px solid #E11C60', borderRadius: '12px', padding: '2rem', background: 'linear-gradient(135deg, #fff5f8 0%, #fff 100%)' }}>
              <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
                <h4 style={{ color: '#E11C60', margin: '0 0 0.3rem 0', fontSize: '1.3rem' }}>Pago con Nequi</h4>
                <p style={{ color: '#888', margin: 0, fontSize: '0.9rem' }}>Envía el dinero al siguiente número</p>
              </div>

              <div style={{ textAlign: 'center', background: '#fff', padding: '1.2rem', borderRadius: '8px', marginBottom: '1.5rem', border: '1px solid #f0d0db' }}>
                <p style={{ margin: '0 0 0.3rem 0', color: '#888', fontSize: '0.85rem' }}>Número Nequi destino:</p>
                <p style={{ margin: '0 0 0.3rem 0', fontSize: '1.8rem', fontWeight: 800, color: '#E11C60', letterSpacing: '2px' }}>350 517 2277</p>
                <p style={{ margin: 0, color: '#aaa', fontSize: '0.85rem' }}>Titular: <strong>Sorpresas Mágicas</strong></p>
              </div>

              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', color: '#555', fontWeight: 500 }}>
                  Tu número Nequi (desde donde pagarás):
                </label>
                <input
                  type="tel"
                  placeholder="Ej: 310 456 7890"
                  value={nequiPhone}
                  onChange={e => setNequiPhone(e.target.value.replace(/[^\d\s]/g, ''))}
                  style={{
                    ...styles.input, width: '100%', boxSizing: 'border-box' as const,
                    border: '2px solid #E11C60', textAlign: 'center', fontSize: '1.2rem', fontWeight: 600, letterSpacing: '1px'
                  }}
                />
              </div>

              <div style={{ background: '#fff5f8', padding: '1rem', borderRadius: '8px', marginBottom: '1.5rem', fontSize: '0.9rem', color: '#666', lineHeight: '1.5' }}>
                <strong>Pasos:</strong><br />
                1. Abre tu app de <strong>Nequi</strong><br />
                2. Ve a "Enviar Dinero" → "A un Nequi"<br />
                3. Ingresa el número <strong>350 517 2277</strong><br />
                4. Envía <strong>{orderTotal.toLocaleString('es-CO', { style: 'currency', currency: 'COP' })}</strong><br />
                5. Toma captura del comprobante y envíalo por WhatsApp
              </div>

              <button
                style={{
                  ...styles.checkoutBtn, width: '100%', background: '#E11C60',
                  opacity: (loading || !nequiPhone || nequiPhone.replace(/\s/g, '').length < 10) ? 0.5 : 1,
                }}
                disabled={loading || !nequiPhone || nequiPhone.replace(/\s/g, '').length < 10}
                onClick={() => handleConfirmPaymentAndCreateOrder('nequi')}
              >
                {loading ? 'Confirmando...' : '✅ Ya Pagué – Enviar Comprobante por WhatsApp'}
              </button>
            </div>
          )}

          {/* ── BRE-B Panel ── */}
          {paymentMethod === 'breb' && (
            <div style={{ border: '2px solid #00529B', borderRadius: '12px', padding: '2rem', background: 'linear-gradient(135deg, #f0f6ff 0%, #fff 100%)' }}>
              <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
                <h4 style={{ color: '#00529B', margin: '0 0 0.3rem 0', fontSize: '1.3rem' }}>Transferencia BRE-B</h4>
                <p style={{ color: '#888', margin: 0, fontSize: '0.9rem' }}>Consignación por llave bancaria desde cualquier banco</p>
              </div>

              <div style={{ textAlign: 'center', background: '#fff', padding: '1.2rem', borderRadius: '8px', marginBottom: '1.5rem', border: '1px solid #c8ddf0' }}>
                <p style={{ margin: '0 0 0.3rem 0', color: '#888', fontSize: '0.85rem' }}>Llave BRE-B:</p>
                <p style={{ margin: '0 0 0.3rem 0', fontSize: '1.6rem', fontWeight: 800, color: '#00529B', letterSpacing: '1px' }}>sorpresasmagicas</p>
                <p style={{ margin: 0, color: '#aaa', fontSize: '0.85rem' }}>NIT / Documento oficial</p>
              </div>

              <div style={{ background: '#f0f6ff', padding: '1rem', borderRadius: '8px', marginBottom: '1.5rem', fontSize: '0.9rem', color: '#666', lineHeight: '1.5' }}>
                <strong>Pasos:</strong><br />
                1. Ingresa a la app de tu banco<br />
                2. Selecciona "Transferir" → "A otros bancos" / "BRE-B"<br />
                3. Busca por llave: <strong>sorpresasmagicas</strong><br />
                4. Transfiere <strong>{orderTotal.toLocaleString('es-CO', { style: 'currency', currency: 'COP' })}</strong><br />
                5. Toma captura del comprobante y envíalo por WhatsApp
              </div>

              <button
                style={{
                  ...styles.checkoutBtn, width: '100%', background: '#00529B',
                  opacity: loading ? 0.5 : 1
                }}
                disabled={loading}
                onClick={() => handleConfirmPaymentAndCreateOrder('breb')}
              >
                {loading ? 'Confirmando...' : '✅ Ya Transferí – Enviar Comprobante por WhatsApp'}
              </button>
            </div>
          )}

          {error && <div style={styles.error}>{error}</div>}

          <button
            type="button"
            style={{
              ...styles.checkoutBtn,
              width: '100%',
              background: '#f5f5f5',
              color: '#666',
              border: '1px solid #ddd',
              marginTop: '1.5rem'
            }}
            onClick={() => {
              setError('');
              setShowPaymentScreen(false);
            }}
          >
            ⬅️ Volver y Modificar Carrito
          </button>
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div style={styles.container}>
        <h2 style={styles.header}>Tu Carrito (React)</h2>
        <p style={{ textAlign: 'center', padding: '2rem', color: '#777' }}>Tu carrito está vacío. ¡Regresa a la tienda a buscar un hermoso detalle!</p>
      </div>
    );
  }

  return (
    <div style={styles.container} className="glass-panel animate-fade-in">
      <h2 style={styles.header}>Tu Carrito de Regalos</h2>

      <div>
        {items.map(item => (
          <div key={item.id} style={styles.itemRow}>
            {item.imageUrl ? <img src={item.imageUrl} alt={item.name} style={styles.img} /> : <div style={{ ...styles.img, background: '#eee' }} />}
            <div style={styles.details}>
              <h4 style={styles.itemName}>{item.name}</h4>
              <p style={styles.itemPrice}>${item.price.toLocaleString('es-CO', { style: 'currency', currency: 'COP' })}</p>
              <p style={{ fontSize: '0.85rem', color: '#666', marginTop: '0.3rem', margin: '0.3rem 0 0 0' }}>
                Mensaje personalizado: {item.customMessage ? 'Sí' : 'No'}
              </p>
            </div>
            <div style={styles.controls}>
              <button style={styles.controlBtn} onClick={() => updateQuantity(item.id, item.customMessage, -1)}>-</button>
              <span>{item.quantity}</span>
              <button style={{ ...styles.controlBtn, background: '#D4AF37' }} onClick={() => updateQuantity(item.id, item.customMessage, +1)}>+</button>
            </div>
          </div>
        ))}
      </div>

      <div style={styles.total}>
        Total: {calculateTotal().toLocaleString('es-CO', { style: 'currency', currency: 'COP' })}
      </div>

      <form onSubmit={handleCheckout} style={styles.form}>
        <h3>Datos de Entrega</h3>
        {error && <div style={styles.error}>{error}</div>}
        <input
          style={styles.input}
          type="text"
          placeholder="Nombre del destinatario"
          value={customerInfo.name}
          onChange={e => setCustomerInfo({ ...customerInfo, name: e.target.value })}
          required
        />
        <input
          style={styles.input}
          type="tel"
          placeholder="Teléfono"
          value={customerInfo.phone || ''}
          onChange={e => setCustomerInfo({ ...customerInfo, phone: e.target.value })}
          required
        />
        <input
          style={styles.input}
          type="text"
          placeholder="Dirección de entrega"
          value={customerInfo.address || ''}
          onChange={e => setCustomerInfo({ ...customerInfo, address: e.target.value })}
          required
        />
        <input
          style={styles.input}
          type="date"
          placeholder="Fecha de entrega"
          value={customerInfo.deliveryDate || ''}
          onChange={e => setCustomerInfo({ ...customerInfo, deliveryDate: e.target.value })}
          required
        />
        <input
          style={styles.input}
          type="email"
          placeholder="Correo Electrónico para recibo (opcional)"
          value={customerInfo.email}
          onChange={e => setCustomerInfo({ ...customerInfo, email: e.target.value })}
        />

        <button
          type="submit"
          style={{ ...styles.checkoutBtn, opacity: loading ? 0.7 : 1 }}
          disabled={loading}
        >
          {loading ? 'Procesando Orden...' : 'Finalizar Compra Segura'}
        </button>
      </form>
    </div>
  );
};
