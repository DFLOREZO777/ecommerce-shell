import React, { useState, useEffect, useRef } from 'react';
import { GoogleOAuthProvider, GoogleLogin } from '@react-oauth/google';
import { jwtDecode } from "jwt-decode";
import { OrdersManager } from './admin/OrdersManager';
import { UsersManager } from './admin/UsersManager';
import { ProductsManager } from './admin/ProductsManager';
import { OrdersDashboard } from './admin/OrdersDashboard';

interface AdminPanelProps {
  apiBaseUrl?: string;
}

const styles = {
  layout: { display: 'flex', height: '85vh', maxWidth: '1200px', margin: '2rem auto', background: '#fff', borderRadius: '16px', boxShadow: '0 10px 25px rgba(0,0,0,0.05)', overflow: 'hidden' },
  sidebar: { width: '250px', background: '#f8f9fa', borderRight: '1px solid #eee', padding: '2rem 1rem', display: 'flex', flexDirection: 'column' as const },
  content: { flex: 1, padding: '2rem 3rem', background: '#fff', overflowY: 'auto' as const },
  profileBox: { textAlign: 'center' as const, paddingBottom: '2rem', marginBottom: '2rem', borderBottom: '1px solid #ddd' },
  avatar: { width: '60px', height: '60px', borderRadius: '50%', background: '#D4AF37', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', fontWeight: 'bold' as const, margin: '0 auto 1rem' },
  tabBtn: (active: boolean) => ({
    width: '100%', textAlign: 'left' as const, padding: '1rem', background: active ? '#fff' : 'transparent', border: 'none',
    borderRadius: '8px', cursor: 'pointer', fontSize: '0.95rem', fontWeight: active ? 600 : 400, color: active ? '#D4AF37' : '#555',
    boxShadow: active ? '0 2px 5px rgba(0,0,0,0.05)' : 'none', marginBottom: '0.5rem', transition: 'all 0.2s'
  }),
  loginBox: { maxWidth: '400px', margin: '4rem auto', padding: '3rem', textAlign: 'center' as const, background: 'rgba(255, 255, 255, 0.85)', backdropFilter: 'blur(12px)', borderRadius: '16px', border: '1px solid rgba(255, 255, 255, 0.5)', boxShadow: '0 20px 40px rgba(0,0,0,0.08)' },
  logoutBtn: { marginTop: '2rem', padding: '1rem', background: '#ffebee', color: '#c62828', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 600 },
  btnPrimary: { background: '#D4AF37', color: '#fff', border: 'none', padding: '0.8rem 1.5rem', borderRadius: '8px', cursor: 'pointer', fontWeight: 600, width: '100%', fontSize: '0.95rem' },
  btnSecondary: { background: '#f5f5f5', color: '#666', border: '1px solid #ddd', padding: '0.8rem 1.5rem', borderRadius: '8px', cursor: 'pointer', fontWeight: 600, width: '100%', fontSize: '0.95rem', marginTop: '0.6rem' },
  label: { display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', color: '#666', fontWeight: 500 },
  mobileHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem', background: '#fff' },
  hamburgerBtn: { fontSize: '1.5rem', background: 'transparent', border: 'none', cursor: 'pointer' },
  mobileTitle: { fontSize: '1.2rem', margin: 0 },
  mobileMenuOverlay: { position: 'fixed' as const, top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center' },
  mobileMenu: { background: '#fff', padding: '2rem', borderRadius: '8px', width: '80%', maxWidth: '300px' }
};

export const AdminPanel: React.FC<AdminPanelProps> = ({ apiBaseUrl = 'https://mi-ecommerce-api.onrender.com/api' }) => {
  const [authToken, setAuthToken] = useState<string | null>(null);
  const [authError, setAuthError] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'orders' | 'users' | 'products' | 'dashboard'>('dashboard');
  const [adminName, setAdminName] = useState('');
  const [authStep, setAuthStep] = useState<'google' | 'otp'>('google');
  const [tempEmail, setTempEmail] = useState('');
  const [otp, setOtp] = useState<string[]>(new Array(6).fill(''));
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const clientId = "145102947023-ttdlu9ikuer0dp7j6lu9valg8o4u4a96.apps.googleusercontent.com";

  useEffect(() => {
    const savedToken = localStorage.getItem('admin_token');
    if (savedToken) {
      setAuthToken(savedToken);
      try {
        const decoded: any = jwtDecode(savedToken);
        setAdminName(decoded.name || 'Administrador');
      } catch (e) { }
    }
  }, []);

  const handleGoogleSuccess = async (credentialResponse: any) => {
    try {
      const decoded: any = jwtDecode(credentialResponse.credential);
      const email = decoded.email;

      const res = await fetch(`${apiBaseUrl}/auth/google`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Error autenticando');

      if (data.requireOtp) {
        setTempEmail(data.email);
        setAuthStep('otp');
        setAuthError('');
      } else {
        localStorage.setItem('admin_token', data.token);
        setAuthToken(data.token);
        setAuthError('');
        try {
          const decoded: any = jwtDecode(data.token);
          setAdminName(decoded.name || 'Administrador');
        } catch (e) { }
      }
    } catch (err: any) {
      setAuthError(err.message);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    const otpCode = otp.join('');
    try {
      const res = await fetch(`${apiBaseUrl}/auth/verify-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: tempEmail, otp: otpCode })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Error verificando OTP');

      localStorage.setItem('admin_token', data.token);
      setAuthToken(data.token);
      setAuthError('');
      try {
        const decoded: any = jwtDecode(data.token);
        setAdminName(decoded.name || 'Administrador');
      } catch (e) { }
    } catch (err: any) {
      setAuthError(err.message);
    }
  };

  const handleOtpChange = (element: HTMLInputElement, index: number) => {
    if (isNaN(Number(element.value))) return;

    const newOtp = [...otp];
    newOtp[index] = element.value;
    setOtp(newOtp);

    if (element.nextSibling && element.value !== '') {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, index: number) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('admin_token');
    setAuthToken(null);
  };

  useEffect(() => {
    let inactivityTimer: NodeJS.Timeout;

    const resetTimer = () => {
      clearTimeout(inactivityTimer);
      // 15 minutos de inactividad
      inactivityTimer = setTimeout(() => {
        if (authToken) {
          handleLogout();
        }
      }, 15 * 60 * 1000);
    };

    if (authToken) {
      // Iniciar el timer la primera vez
      resetTimer();

      // Escuchar eventos de actividad del usuario
      window.addEventListener('mousemove', resetTimer);
      window.addEventListener('keydown', resetTimer);
      window.addEventListener('click', resetTimer);
      window.addEventListener('scroll', resetTimer);
    }

    return () => {
      clearTimeout(inactivityTimer);
      window.removeEventListener('mousemove', resetTimer);
      window.removeEventListener('keydown', resetTimer);
      window.removeEventListener('click', resetTimer);
      window.removeEventListener('scroll', resetTimer);
    };
  }, [authToken]);

  const [isMobile, setIsMobile] = useState<boolean>(window.innerWidth <= 768);
  const [menuOpen, setMenuOpen] = useState<boolean>(false);
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  if (!authToken) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f5f5f5' }}>
        <div style={styles.loginBox}>
          {authStep === 'google' ? (
            <GoogleOAuthProvider clientId={clientId}>
              <h2 style={{ color: '#333', marginBottom: '0.5rem' }}>Bienvenido</h2>
              <p style={{ color: '#666', marginBottom: '2rem' }}>Inicia sesión para acceder al panel de administración.</p>
              <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1rem' }}>
                <GoogleLogin onSuccess={handleGoogleSuccess} onError={() => setAuthError('Falló el login.')} useOneTap />
              </div>
              {authError && <p style={{ color: 'red', marginTop: '1.5rem', fontSize: '0.9rem' }}>{authError}</p>}
            </GoogleOAuthProvider>
          ) : (
            <>
              <h2 style={{ color: '#333', marginBottom: '0.5rem' }}>Verificación 2FA</h2>
              <p style={{ color: '#666', marginBottom: '2rem' }}>Ingresa el código de 6 dígitos enviado a tu correo electrónico.</p>

              <form onSubmit={handleVerifyOtp}>
                <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center', marginBottom: '2rem' }}>
                  {otp.map((data, index) => (
                    <input
                      key={index}
                      type="text"
                      maxLength={1}
                      style={{
                        width: '40px', height: '50px', fontSize: '1.5rem', textAlign: 'center',
                        border: '1px solid #ddd', borderRadius: '8px', background: '#f8f9fa'
                      }}
                      value={data}
                      ref={(el) => { inputRefs.current[index] = el; }}
                      onChange={(e) => handleOtpChange(e.target, index)}
                      onKeyDown={(e) => handleOtpKeyDown(e, index)}
                      autoFocus={index === 0}
                    />
                  ))}
                </div>

                <button type="submit" style={styles.btnPrimary} disabled={otp.join('').length !== 6}>
                  Verificar Código
                </button>
                <button type="button" style={styles.btnSecondary} onClick={() => setAuthStep('google')}>
                  Volver
                </button>
              </form>
              {authError && <p style={{ color: 'red', marginTop: '1.5rem', fontSize: '0.9rem' }}>{authError}</p>}
            </>
          )}
        </div>
      </div>
    );
  }

  // Mobile top header with hamburger button
  const mobileHeader = (
    <div style={styles.mobileHeader}>
      <button style={styles.hamburgerBtn} onClick={() => setMenuOpen(!menuOpen)} aria-label="Menu">
        ☰
      </button>
      <h2 style={styles.mobileTitle}>Panel de Administración</h2>
      <div style={{ width: '24px' }} /> {/* placeholder for alignment */}
    </div>
  );

  // Mobile overlay menu
  const mobileMenuOverlay = menuOpen && (
    <div style={styles.mobileMenuOverlay} onClick={() => setMenuOpen(false)}>
      <div style={styles.mobileMenu} onClick={e => e.stopPropagation()}>
        <button style={styles.tabBtn(activeTab === 'orders')} onClick={() => { setActiveTab('orders'); setMenuOpen(false); }}>🛍️ Órdenes y Ventas</button>
        <button style={styles.tabBtn(activeTab === 'dashboard')} onClick={() => { setActiveTab('dashboard'); setMenuOpen(false); }}>📊 Pedidos</button>
        <button style={styles.tabBtn(activeTab === 'products')} onClick={() => { setActiveTab('products'); setMenuOpen(false); }}>🎁 Gestor Productos</button>
        <button style={styles.tabBtn(activeTab === 'users')} onClick={() => { setActiveTab('users'); setMenuOpen(false); }}>👥 Directorio Usuarios</button>
        <button style={styles.logoutBtn} onClick={handleLogout}>Cerrar Sesión 🔒</button>
      </div>
    </div>
  );

  return (
    <>
      {isMobile && mobileHeader}
      {isMobile && mobileMenuOverlay}
      <div style={styles.layout} className="animate-fade-in">
        {!isMobile && (
          <div style={styles.sidebar}>
            <div style={styles.profileBox}>
              <div style={styles.avatar}>{adminName.charAt(0).toUpperCase()}</div>
              <h4 style={{ margin: 0, color: '#333' }}>{adminName}</h4>
              <p style={{ margin: '0.2rem 0 0 0', fontSize: '0.8rem', color: '#888' }}>Super Administrador</p>
            </div>
            <button style={styles.tabBtn(activeTab === 'orders')} onClick={() => setActiveTab('orders')}>🛍️ Órdenes y Ventas</button>
            <button style={styles.tabBtn(activeTab === 'dashboard')} onClick={() => setActiveTab('dashboard')}>📊 Pedidos</button>
            <button style={styles.tabBtn(activeTab === 'products')} onClick={() => setActiveTab('products')}>🎁 Gestor Productos</button>
            <button style={styles.tabBtn(activeTab === 'users')} onClick={() => setActiveTab('users')}>👥 Directorio Usuarios</button>
            <button style={styles.logoutBtn} onClick={handleLogout}>Cerrar Sesión 🔒</button>
          </div>
        )}
        <div style={styles.content}>
          {activeTab === 'dashboard' && <OrdersDashboard apiBaseUrl={apiBaseUrl} authToken={authToken} />}
          {activeTab === 'orders' && <OrdersManager apiBaseUrl={apiBaseUrl} authToken={authToken} />}
          {activeTab === 'products' && <ProductsManager apiBaseUrl={apiBaseUrl} authToken={authToken} />}
          {activeTab === 'users' && <UsersManager apiBaseUrl={apiBaseUrl} authToken={authToken} />}
        </div>
      </div>
    </>
  );
};
