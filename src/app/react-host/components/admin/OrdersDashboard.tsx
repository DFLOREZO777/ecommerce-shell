import React, { useState, useEffect } from 'react';

export const OrdersDashboard: React.FC<{ apiBaseUrl: string; authToken: string }> = ({ apiBaseUrl, authToken }) => {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [activeTooltip, setActiveTooltip] = useState<string | null>(null);
  const [showNearExpiryPopover, setShowNearExpiryPopover] = useState(false);
  const [showOnTimePopover, setShowOnTimePopover] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<any | null>(null);
  const [zoomedImage, setZoomedImage] = useState<string | null>(null);
  const [selectedMonth, setSelectedMonth] = useState<number>(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());

  // Clock effect: updates every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentDate(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

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

  useEffect(() => {
    fetchOrders();
  }, [authToken]);

  // Filter only paid orders
  const paidOrders = orders.filter(o => o.paymentStatus === 'Pagado');

  // Compare helper to check if a date is today
  const isToday = (dateString: string) => {
    const orderDate = new Date(dateString);
    return (
      orderDate.getDate() === currentDate.getDate() &&
      orderDate.getMonth() === currentDate.getMonth() &&
      orderDate.getFullYear() === currentDate.getFullYear()
    );
  };

  // Paid orders today
  const paidOrdersToday = paidOrders.filter(o => isToday(o.createdAt));

  // Filter paid orders by selected month and year
  const filteredPaidOrders = paidOrders.filter(o => {
    const orderDate = new Date(o.createdAt);
    return orderDate.getMonth() === selectedMonth && orderDate.getFullYear() === selectedYear;
  });

  // Calculations
  const totalRevenue = paidOrders.reduce((sum, o) => sum + parseFloat(o.totalPrice || 0), 0);
  const totalRevenueFiltered = filteredPaidOrders.reduce((sum, o) => sum + parseFloat(o.totalPrice || 0), 0);
  const todayRevenue = paidOrdersToday.reduce((sum, o) => sum + parseFloat(o.totalPrice || 0), 0);

  // Orders in 'En proceso' or 'Recibido' with delivery dates (only paid orders)
  const statusOrders = paidOrders.filter(o =>
    (o.status === 'En proceso' || o.status === 'Recibido') && o.deliveryDate
  );

  const now = new Date();
  const nearExpiryOrders = statusOrders.filter(o => {
    const diffHours = (new Date(o.deliveryDate + 'T00:00:00').getTime() - now.getTime()) / (1000 * 60 * 60);
    return diffHours <= 48;
  });

  const onTimeOrders = statusOrders.filter(o => {
    const diffHours = (new Date(o.deliveryDate + 'T00:00:00').getTime() - now.getTime()) / (1000 * 60 * 60);
    return diffHours > 48;
  });

  const getHoursRemaining = (deliveryDate: string) => {
    const diff = (new Date(deliveryDate + 'T00:00:00').getTime() - now.getTime()) / (1000 * 60 * 60);
    return Math.round(diff);
  };

  const formatCurrency = (value: number) => {
    return value.toLocaleString('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 });
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('es-CO', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('es-CO', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true
    });
  };

  const styles: { [key: string]: React.CSSProperties | any } = {
    container: { padding: '1rem 0' },
    header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', borderBottom: '1px solid #eee', paddingBottom: '1rem' },
    title: { margin: 0, color: '#333', fontSize: '1.5rem', fontWeight: 600 },
    clockCard: { background: 'linear-gradient(135deg, #1e1e24 0%, #D4AF37 100%)', color: '#fff', padding: '1.5rem', borderRadius: '12px', boxShadow: '0 4px 15px rgba(0,0,0,0.1)', textAlign: 'right', minWidth: '280px' },
    clockTime: { fontSize: '1.8rem', fontWeight: 'bold', margin: '0 0 0.2rem 0', fontFamily: 'monospace' },
    clockDate: { fontSize: '0.9rem', opacity: 0.9, textTransform: 'capitalize' },
    grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.5rem', marginBottom: '2rem' },
    card: { background: '#fff', padding: '1.5rem', borderRadius: '12px', border: '1px solid #eee', boxShadow: '0 4px 6px rgba(0,0,0,0.02)', display: 'flex', flexDirection: 'column', transition: 'all 0.3s ease' },
    cardTitle: { fontSize: '0.85rem', color: '#888', textTransform: 'uppercase', fontWeight: 600, letterSpacing: '0.5px', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem', position: 'relative' },
    cardValue: { fontSize: '1.6rem', fontWeight: 'bold', color: '#333', margin: '0.2rem 0' },
    cardSub: { fontSize: '0.8rem', color: '#D4AF37', fontWeight: 500, marginTop: 'auto' },
    sectionTitle: { fontSize: '1.2rem', color: '#333', marginBottom: '1rem', fontWeight: 600 },
    table: { width: '100%', borderCollapse: 'collapse', marginTop: '1rem' },
    th: { textAlign: 'left', padding: '1rem', background: '#FAFAFA', color: '#777', borderBottom: '2px solid #eee', fontSize: '0.9rem', fontWeight: 600, position: 'sticky', top: 0, zIndex: 1 },
    td: { padding: '1rem', borderBottom: '1px solid #eee', color: '#444', fontSize: '0.9rem' },
    todayRow: { background: '#fffbeb', borderLeft: '4px solid #D4AF37' },
    tagToday: { background: '#D4AF37', color: '#fff', fontSize: '0.75rem', padding: '0.2rem 0.5rem', borderRadius: '4px', fontWeight: 600, marginLeft: '0.5rem' },
    badgePaid: { background: '#e6f4ea', color: '#137333', padding: '0.25rem 0.75rem', borderRadius: '999px', fontSize: '0.8rem', fontWeight: 600 },
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

  return (
    <div className="animate-fade-in" style={styles.container}>
      <div style={styles.header}>
        <div>
          <h3 style={styles.title}>Dashboard de Pedidos</h3>
          <p style={{ margin: '0.2rem 0 0 0', color: '#666', fontSize: '0.9rem' }}>Consulta y análisis de órdenes pagadas en tiempo real</p>
        </div>
        <div style={styles.clockCard}>
          <div style={styles.clockTime}>{formatTime(currentDate)}</div>
          <div style={styles.clockDate}>{formatDate(currentDate)}</div>
        </div>
      </div>


      {/* Comparative cards for warning/on-time orders */}
      <div style={{ ...styles.grid, gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', marginBottom: '2.5rem' }}>
        {/* Near expiry card with floating bubble */}
        <div style={{ ...styles.card, background: 'linear-gradient(135deg, #fff5f5 0%, #ffe3e3 100%)', border: '1px solid #ffa8a8', position: 'relative' }}>
          <span style={{ ...styles.cardTitle, color: '#c53030' }}>
            {'Próximos a vencer (≤48h)'}
            <span
              style={{ cursor: 'help', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '16px', height: '16px', borderRadius: '50%', background: '#ffc9c9', fontSize: '11px', color: '#c53030' }}
              onMouseEnter={() => setActiveTooltip('near')}
              onMouseLeave={() => setActiveTooltip(null)}
            >
              i
            </span>
            {activeTooltip === 'near' && (
              <span style={{ position: 'absolute', bottom: '130%', left: '0', background: '#333', color: '#fff', padding: '0.5rem', borderRadius: '6px', fontSize: '0.75rem', zIndex: 10, width: '220px', textTransform: 'none', fontWeight: 'normal', lineHeight: '1.2' }}>
                Órdenes en proceso o recibidas con fecha de entrega menor o igual a 48 horas desde la fecha actual.
              </span>
            )}
          </span>
          <span style={{ ...styles.cardValue, color: '#9b1c1c' }}>{nearExpiryOrders.length} ordenes</span>
          <span style={{ ...styles.cardSub, color: '#e53e3e' }}>Requieren atención inmediata</span>

          {/* Floating bubble button */}
          <button
            onClick={() => setShowNearExpiryPopover(!showNearExpiryPopover)}
            style={{
              position: 'absolute',
              bottom: '-14px',
              right: '16px',
              width: '36px',
              height: '36px',
              borderRadius: '50%',
              background: nearExpiryOrders.length > 0 ? 'linear-gradient(135deg, #c53030, #e53e3e)' : '#ccc',
              color: '#fff',
              border: 'none',
              cursor: nearExpiryOrders.length > 0 ? 'pointer' : 'default',
              boxShadow: '0 4px 12px rgba(197,48,48,0.4)',
              fontSize: '1.1rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'transform 0.2s',
              zIndex: 5,
            }}
            onMouseEnter={e => { if (nearExpiryOrders.length > 0) (e.target as HTMLElement).style.transform = 'scale(1.15)'; }}
            onMouseLeave={e => { (e.target as HTMLElement).style.transform = 'scale(1)'; }}
            title="Ver órdenes próximas a vencer"
          >
            🔔
          </button>

          {/* Popover list of near-expiry orders */}
          {showNearExpiryPopover && nearExpiryOrders.length > 0 && (
            <div style={{
              position: 'absolute',
              top: '100%',
              right: '0',
              marginTop: '1rem',
              width: '380px',
              maxHeight: '400px',
              overflowY: 'auto',
              background: '#fff',
              border: '1px solid #ffa8a8',
              borderRadius: '12px',
              boxShadow: '0 12px 40px rgba(0,0,0,0.15)',
              zIndex: 100,
              padding: '0',
            }}>
              <div style={{ padding: '1rem', borderBottom: '1px solid #eee', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <strong style={{ color: '#c53030', fontSize: '0.9rem' }}>⚠️ Órdenes próximas a vencer</strong>
                <button
                  onClick={() => setShowNearExpiryPopover(false)}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.2rem', color: '#999', lineHeight: 1 }}
                >
                  ✕
                </button>
              </div>
              {nearExpiryOrders.map(o => {
                const hoursLeft = getHoursRemaining(o.deliveryDate);
                return (
                  <div
                    key={o.id}
                    onClick={() => { setSelectedOrder(o); setShowNearExpiryPopover(false); }}
                    style={{
                      padding: '0.8rem 1rem',
                      borderBottom: '1px solid #f5f5f5',
                      cursor: 'pointer',
                      transition: 'background 0.15s',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.75rem',
                    }}
                    onMouseEnter={e => (e.currentTarget.style.background = '#fff5f5')}
                    onMouseLeave={e => (e.currentTarget.style.background = '#fff')}
                  >
                    {/* Thumbnail */}
                    <div style={{
                      width: '44px',
                      height: '44px',
                      borderRadius: '8px',
                      overflow: 'hidden',
                      background: '#f5f5f5',
                      flexShrink: 0,
                    }}>
                      {o.items && o.items.length > 0 && o.items[0].Product?.imageUrl ? (
                        <img src={o.items[0].Product.imageUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      ) : (
                        <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#bbb', fontSize: '1.2rem' }}>📦</div>
                      )}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontWeight: 600, color: '#333', fontSize: '0.85rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{o.customerName}</div>
                      <div style={{ fontSize: '0.75rem', color: '#888' }}>
                        {o.trackingCode} · {formatCurrency(parseFloat(o.totalPrice))}
                      </div>
                    </div>
                    <div style={{ textAlign: 'right', flexShrink: 0 }}>
                      <div style={{
                        fontSize: '0.75rem',
                        fontWeight: 700,
                        color: hoursLeft < 0 || hoursLeft <= 12 ? '#c53030' : '#b06000',
                        background: hoursLeft < 0 || hoursLeft <= 12 ? '#ffe5e5' : '#fef7e0',
                        padding: '0.15rem 0.5rem',
                        borderRadius: '4px',
                      }}>
                        {hoursLeft < 0 ? 'Fuera de tiempo' : `${hoursLeft}h restantes`}
                      </div>
                      <div style={{ fontSize: '0.7rem', color: '#999', marginTop: '2px' }}>{o.status}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div style={{ ...styles.card, background: 'linear-gradient(135deg, #f4fbf7 0%, #e6f4ea 100%)', border: '1px solid #b7ebc6', position: 'relative' }}>
          <span style={{ ...styles.cardTitle, color: '#1b5e20' }}>
            {'Se encuentra a tiempo (>48h)'}
            <span
              style={{ cursor: 'help', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '16px', height: '16px', borderRadius: '50%', background: '#c6edd2', fontSize: '11px', color: '#1b5e20' }}
              onMouseEnter={() => setActiveTooltip('ontime')}
              onMouseLeave={() => setActiveTooltip(null)}
            >
              i
            </span>
            {activeTooltip === 'ontime' && (
              <span style={{ position: 'absolute', bottom: '130%', left: '0', background: '#333', color: '#fff', padding: '0.5rem', borderRadius: '6px', fontSize: '0.75rem', zIndex: 10, width: '220px', textTransform: 'none', fontWeight: 'normal', lineHeight: '1.2' }}>
                Órdenes en proceso o recibidas con fecha de entrega mayor a 48 horas desde la fecha actual.
              </span>
            )}
          </span>
          <span style={{ ...styles.cardValue, color: '#137333' }}>{onTimeOrders.length} ordenes</span>
          <span style={{ ...styles.cardSub, color: '#2f855a' }}>Dentro del plazo establecido</span>

          {/* Floating bubble button */}
          <button
            onClick={() => setShowOnTimePopover(!showOnTimePopover)}
            style={{
              position: 'absolute',
              bottom: '-14px',
              right: '16px',
              width: '36px',
              height: '36px',
              borderRadius: '50%',
              background: onTimeOrders.length > 0 ? 'linear-gradient(135deg, #1b5e20, #2f855a)' : '#ccc',
              color: '#fff',
              border: 'none',
              cursor: onTimeOrders.length > 0 ? 'pointer' : 'default',
              boxShadow: '0 4px 12px rgba(27,94,32,0.4)',
              fontSize: '1.1rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'transform 0.2s',
              zIndex: 5,
            }}
            onMouseEnter={e => { if (onTimeOrders.length > 0) (e.target as HTMLElement).style.transform = 'scale(1.15)'; }}
            onMouseLeave={e => { (e.target as HTMLElement).style.transform = 'scale(1)'; }}
            title="Ver órdenes a tiempo"
          >
            🔔
          </button>

          {/* Popover list of on-time orders */}
          {showOnTimePopover && onTimeOrders.length > 0 && (
            <div style={{
              position: 'absolute',
              top: '100%',
              right: '0',
              marginTop: '1rem',
              width: '380px',
              maxHeight: '400px',
              overflowY: 'auto',
              background: '#fff',
              border: '1px solid #b7ebc6',
              borderRadius: '12px',
              boxShadow: '0 12px 40px rgba(0,0,0,0.15)',
              zIndex: 100,
              padding: '0',
            }}>
              <div style={{ padding: '1rem', borderBottom: '1px solid #eee', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <strong style={{ color: '#1b5e20', fontSize: '0.9rem' }}>✅ Órdenes a tiempo</strong>
                <button
                  onClick={() => setShowOnTimePopover(false)}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.2rem', color: '#999', lineHeight: 1 }}
                >
                  ✕
                </button>
              </div>
              {onTimeOrders.map(o => {
                const hoursLeft = getHoursRemaining(o.deliveryDate);
                return (
                  <div
                    key={o.id}
                    onClick={() => { setSelectedOrder(o); setShowOnTimePopover(false); }}
                    style={{
                      padding: '0.8rem 1rem',
                      borderBottom: '1px solid #f5f5f5',
                      cursor: 'pointer',
                      transition: 'background 0.15s',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.75rem',
                    }}
                    onMouseEnter={e => (e.currentTarget.style.background = '#f4fbf7')}
                    onMouseLeave={e => (e.currentTarget.style.background = '#fff')}
                  >
                    {/* Thumbnail */}
                    <div style={{
                      width: '44px',
                      height: '44px',
                      borderRadius: '8px',
                      overflow: 'hidden',
                      background: '#f5f5f5',
                      flexShrink: 0,
                    }}>
                      {o.items && o.items.length > 0 && o.items[0].Product?.imageUrl ? (
                        <img src={o.items[0].Product.imageUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      ) : (
                        <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#bbb', fontSize: '1.2rem' }}>📦</div>
                      )}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontWeight: 600, color: '#333', fontSize: '0.85rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{o.customerName}</div>
                      <div style={{ fontSize: '0.75rem', color: '#888' }}>
                        {o.trackingCode} · {formatCurrency(parseFloat(o.totalPrice))}
                      </div>
                    </div>
                    <div style={{ textAlign: 'right', flexShrink: 0 }}>
                      <div style={{
                        fontSize: '0.75rem',
                        fontWeight: 700,
                        color: '#137333',
                        background: '#e6f4ea',
                        padding: '0.15rem 0.5rem',
                        borderRadius: '4px',
                      }}>
                        {hoursLeft}h restantes
                      </div>
                      <div style={{ fontSize: '0.7rem', color: '#999', marginTop: '2px' }}>{o.status}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      <div style={styles.grid}>
        <div style={styles.card}>
          <span style={styles.cardTitle}>Total Ventas (Pagado)</span>
          <span style={styles.cardValue}>{formatCurrency(totalRevenueFiltered)}</span>
          <span style={styles.cardSub}>Acumulado de {filteredPaidOrders.length} ordenes pagadas</span>
        </div>

        <div style={styles.card}>
          <span style={styles.cardTitle}>Ventas de Hoy</span>
          <span style={styles.cardValue}>{formatCurrency(todayRevenue)}</span>
          <span style={{ ...styles.cardSub, color: paidOrdersToday.length > 0 ? '#137333' : '#888' }}>
            {paidOrdersToday.length} {paidOrdersToday.length === 1 ? 'orden' : 'ordenes'} hoy
          </span>
        </div>

        <div style={styles.card}>
          <span style={styles.cardTitle}>Participación de Hoy</span>
          <span style={styles.cardValue}>
            {totalRevenue > 0 ? ((todayRevenue / totalRevenue) * 100).toFixed(1) : '0.0'}%
          </span>
          <span style={styles.cardSub}>Porcentaje de ingresos diarios vs histórico</span>
        </div>
      </div>

      {/* Month and Year Filter Controls */}
      <div style={{
        display: 'flex',
        gap: '1.5rem',
        alignItems: 'center',
        background: '#d3cccca4',
        padding: '1.2rem 1.5rem',
        borderRadius: '12px',
        border: '1px solid #0c0c0cff',
        boxShadow: '0 4px 6px rgba(0,0,0,0.02)',
        marginBottom: '2rem',
        flexWrap: 'wrap'
      }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', flex: 1, minWidth: '150px' }}>
          <label style={{ fontSize: '0.85rem', color: '#0e0d0dff', fontWeight: 600 }}>Filtrar por Mes</label>
          <select
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(Number(e.target.value))}
            style={{
              padding: '0.6rem',
              borderRadius: '8px',
              border: '1px solid #ddd',
              fontSize: '0.95rem',
              color: '#333',
              outline: 'none',
              cursor: 'pointer'
            }}
          >
            <option value={0}>Enero</option>
            <option value={1}>Febrero</option>
            <option value={2}>Marzo</option>
            <option value={3}>Abril</option>
            <option value={4}>Mayo</option>
            <option value={5}>Junio</option>
            <option value={6}>Julio</option>
            <option value={7}>Agosto</option>
            <option value={8}>Septiembre</option>
            <option value={9}>Octubre</option>
            <option value={10}>Noviembre</option>
            <option value={11}>Diciembre</option>
          </select>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', flex: 1, minWidth: '150px' }}>
          <label style={{ fontSize: '0.85rem', color: '#0c0c0cff', fontWeight: 600 }}>Filtrar por Año</label>
          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(Number(e.target.value))}
            style={{
              padding: '0.6rem',
              borderRadius: '8px',
              border: '1px solid #ddd',
              fontSize: '0.95rem',
              color: '#333',
              outline: 'none',
              cursor: 'pointer'
            }}
          >
            {Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - 2 + i).map(yr => (
              <option key={yr} value={yr}>{yr}</option>
            ))}
          </select>
        </div>
      </div>
      <div>
        <h4 style={styles.sectionTitle}>Historial de Órdenes Pagadas</h4>
        {loading ? (
          <p>Cargando información del dashboard...</p>
        ) : filteredPaidOrders.length === 0 ? (
          <p style={{ color: '#888', fontStyle: 'italic' }}>No se registran órdenes pagadas en el sistema.</p>
        ) : (
          <div style={{ maxHeight: '400px', overflowY: 'auto', overflowX: 'auto', background: '#fff', borderRadius: '8px', border: '1px solid #eee' }}>
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.th}>Cliente / ID</th>
                  <th style={styles.th}>Fecha de Entrega</th>
                  <th style={styles.th}>Total</th>
                  <th style={styles.th}>Tracking</th>
                  <th style={styles.th}>Estado</th>
                  <th style={styles.th}>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filteredPaidOrders
                  .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
                  .map(o => {
                    const orderIsToday = isToday(o.createdAt);
                    return (
                      <tr key={o.id} style={orderIsToday ? styles.todayRow : {}}>
                        <td style={styles.td}>
                          <strong>{o.customerName}</strong> {orderIsToday && <span style={styles.tagToday}>Hoy</span>}
                          <br />
                          <small style={{ color: '#888' }}>{o.customerEmail}</small>
                        </td>
                        <td style={styles.td}>
                          {o.deliveryDate ? new Date(o.deliveryDate + 'T00:00:00').toLocaleDateString('es-CO', {
                            year: 'numeric',
                            month: '2-digit',
                            day: '2-digit'
                          }) : 'Pendiente'}
                        </td>
                        <td style={{ ...styles.td, fontWeight: 600 }}>
                          {formatCurrency(parseFloat(o.totalPrice))}
                        </td>
                        <td style={styles.td}>
                          <code style={{ background: '#f5f5f5', padding: '0.2rem 0.4rem', borderRadius: '4px', fontSize: '0.85rem' }}>
                            {o.trackingCode || 'Sin código'}
                          </code>
                        </td>
                        <td style={styles.td}>
                          <span style={styles.statusBadge(o.status, o.paymentStatus)}>
                            {['No pagado', 'Pendiente'].includes(o.paymentStatus || 'Pendiente') ? 'Nulo' : o.status}
                          </span>
                        </td>
                        <td style={styles.td}>
                          <select
                            style={{
                              ...styles.select,
                              opacity: ['No pagado', 'Pendiente'].includes(o.paymentStatus || 'Pendiente') ? 0.5 : 1,
                              cursor: ['No pagado', 'Pendiente'].includes(o.paymentStatus || 'Pendiente') ? 'not-allowed' : 'pointer'
                            }}
                            value={o.status}
                            onChange={e => updateStatus(o.id, e.target.value)}
                            disabled={['No pagado', 'Pendiente'].includes(o.paymentStatus || 'Pendiente')}
                          >
                            <option value="Recibido">Recibido</option>
                            <option value="En proceso">En proceso</option>
                            <option value="Entregado">Entregado</option>
                          </select>
                        </td>
                      </tr>
                    );
                  })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Order detail modal */}
      {selectedOrder && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0,0,0,0.6)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
            padding: '1rem',
            boxSizing: 'border-box',
          }}
          onClick={() => setSelectedOrder(null)}
        >
          <div
            onClick={e => e.stopPropagation()}
            style={{
              background: '#fff',
              borderRadius: '16px',
              width: '90%',
              maxWidth: '600px',
              maxHeight: '85vh',
              overflowY: 'auto',
              boxShadow: '0 20px 60px rgba(0,0,0,0.25)',
              animation: 'fadeInUp 0.25s ease',
            }}
          >
            {/* Modal header */}
            <div style={{
              padding: '1.5rem',
              borderBottom: '1px solid #eee',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'flex-start',
            }}>
              <div>
                <h3 style={{ margin: 0, color: '#333', fontSize: '1.2rem' }}>Detalle de Orden</h3>
                <code style={{ fontSize: '0.8rem', color: '#D4AF37' }}>{selectedOrder.trackingCode}</code>
              </div>
              <button
                onClick={() => setSelectedOrder(null)}
                style={{ background: '#f5f5f5', border: 'none', borderRadius: '8px', width: '32px', height: '32px', cursor: 'pointer', fontSize: '1rem', color: '#666', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              >
                ✕
              </button>
            </div>

            {/* Urgency banner */}
            {(() => {
              const hoursLeft = getHoursRemaining(selectedOrder.deliveryDate);
              return hoursLeft <= 48 ? (
                <div style={{
                  margin: '0 1.5rem',
                  marginTop: '1rem',
                  padding: '0.75rem 1rem',
                  background: hoursLeft < 0 || hoursLeft <= 12 ? '#ffe5e5' : '#fef7e0',
                  borderRadius: '8px',
                  border: `1px solid ${hoursLeft < 0 || hoursLeft <= 12 ? '#ffa8a8' : '#ffd97a'}`,
                  fontSize: '0.85rem',
                  fontWeight: 600,
                  color: hoursLeft < 0 || hoursLeft <= 12 ? '#c53030' : '#b06000',
                }}>
                  ⏰ {hoursLeft < 0 ? 'Fuera de tiempo (Fecha límite superada)' : `${hoursLeft}h restantes para la entrega – ${hoursLeft <= 12 ? '¡Urgente!' : 'Próximo a vencer'}`}
                </div>
              ) : null;
            })()}

            {/* Customer info */}
            <div style={{ padding: '1.5rem', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div>
                <div style={{ fontSize: '0.75rem', color: '#888', textTransform: 'uppercase', marginBottom: '0.25rem' }}>Cliente</div>
                <div style={{ fontWeight: 600, color: '#333' }}>{selectedOrder.customerName}</div>
              </div>
              <div>
                <div style={{ fontSize: '0.75rem', color: '#888', textTransform: 'uppercase', marginBottom: '0.25rem' }}>Email</div>
                <div style={{ color: '#555', fontSize: '0.9rem' }}>{selectedOrder.customerEmail}</div>
              </div>
              {selectedOrder.customerPhone && (
                <div>
                  <div style={{ fontSize: '0.75rem', color: '#888', textTransform: 'uppercase', marginBottom: '0.25rem' }}>Teléfono</div>
                  <div style={{ color: '#555', fontSize: '0.9rem' }}>{selectedOrder.customerPhone}</div>
                </div>
              )}
              {selectedOrder.customerAddress && (
                <div>
                  <div style={{ fontSize: '0.75rem', color: '#888', textTransform: 'uppercase', marginBottom: '0.25rem' }}>Dirección</div>
                  <div style={{ color: '#555', fontSize: '0.9rem' }}>{selectedOrder.customerAddress}</div>
                </div>
              )}
              <div>
                <div style={{ fontSize: '0.75rem', color: '#888', textTransform: 'uppercase', marginBottom: '0.25rem' }}>Fecha de Entrega</div>
                <div style={{ color: '#333', fontWeight: 600 }}>
                  {selectedOrder.deliveryDate
                    ? new Date(selectedOrder.deliveryDate + 'T00:00:00').toLocaleDateString('es-CO', { year: 'numeric', month: 'long', day: 'numeric' })
                    : 'Pendiente'}
                </div>
              </div>
              <div>
                <div style={{ fontSize: '0.75rem', color: '#888', textTransform: 'uppercase', marginBottom: '0.25rem' }}>Estado</div>
                <span style={styles.statusBadge(selectedOrder.status, selectedOrder.paymentStatus)}>
                  {selectedOrder.status}
                </span>
              </div>
              <div>
                <div style={{ fontSize: '0.75rem', color: '#888', textTransform: 'uppercase', marginBottom: '0.25rem' }}>Método de Pago</div>
                <div style={{ color: '#555', fontSize: '0.9rem' }}>{selectedOrder.paymentMethod || 'No seleccionado'}</div>
              </div>
              <div>
                <div style={{ fontSize: '0.75rem', color: '#888', textTransform: 'uppercase', marginBottom: '0.25rem' }}>Total</div>
                <div style={{ fontWeight: 700, color: '#333', fontSize: '1.1rem' }}>{formatCurrency(parseFloat(selectedOrder.totalPrice))}</div>
              </div>
            </div>

            {/* Products */}
            {selectedOrder.items && selectedOrder.items.length > 0 && (
              <div style={{ padding: '0 1.5rem 1.5rem' }}>
                <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#333', marginBottom: '0.75rem', borderTop: '1px solid #eee', paddingTop: '1rem' }}>
                  Productos ({selectedOrder.items.length})
                </div>
                {selectedOrder.items.map((item: any) => (
                  <div key={item.id} style={{
                    display: 'flex',
                    gap: '1rem',
                    padding: '0.75rem',
                    background: '#fafafa',
                    borderRadius: '10px',
                    marginBottom: '0.5rem',
                    border: '1px solid #f0f0f0',
                  }}>
                    {/* Product image */}
                    <div
                      style={{
                        width: '80px',
                        height: '80px',
                        borderRadius: '8px',
                        overflow: 'hidden',
                        background: '#eee',
                        flexShrink: 0,
                        cursor: item.Product?.imageUrl ? 'pointer' : 'default',
                      }}
                      onClick={() => {
                        if (item.Product?.imageUrl) {
                          setZoomedImage(item.Product.imageUrl);
                        }
                      }}
                    >
                      {item.Product?.imageUrl ? (
                        <img src={item.Product.imageUrl} alt={item.Product.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      ) : (
                        <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#bbb', fontSize: '2rem' }}>📦</div>
                      )}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 600, color: '#333', marginBottom: '0.25rem' }}>{item.Product?.name || 'Producto'}</div>
                      <div style={{ fontSize: '0.8rem', color: '#888' }}>
                        Cantidad: {item.quantity} · Precio: {formatCurrency(parseFloat(item.priceAtPurchase))}
                      </div>
                      {item.customMessage && (
                        <div style={{ marginTop: '0.3rem', fontSize: '0.8rem', color: '#D4AF37', fontStyle: 'italic', paddingLeft: '0.5rem', borderLeft: '2px solid #D4AF37' }}>
                          💬 &quot;{item.customMessage}&quot;
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Lightbox for product image */}
      {zoomedImage && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0,0,0,0.85)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 10000,
            cursor: 'zoom-out',
          }}
          onClick={() => setZoomedImage(null)}
        >
          <div style={{ position: 'relative', maxWidth: '90%', maxHeight: '90%' }} onClick={e => e.stopPropagation()}>
            <img
              src={zoomedImage}
              alt="Zoomed Product"
              style={{
                maxWidth: '100%',
                maxHeight: '90vh',
                borderRadius: '8px',
                boxShadow: '0 10px 30px rgba(0,0,0,0.5)',
              }}
            />
            <button
              onClick={() => setZoomedImage(null)}
              style={{
                position: 'absolute',
                top: '-45px',
                right: '0',
                background: 'rgba(255,255,255,0.2)',
                border: 'none',
                borderRadius: '50%',
                width: '36px',
                height: '36px',
                cursor: 'pointer',
                fontSize: '1.2rem',
                color: '#fff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'background 0.2s',
              }}
              onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.4)')}
              onMouseLeave={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.2)')}
            >
              ✕
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
