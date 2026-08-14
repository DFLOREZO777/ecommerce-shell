import { Component, OnInit } from '@angular/core';
import { RouterOutlet, RouterModule } from '@angular/router';
import { ApiService } from './core/services/api.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, RouterModule],
  templateUrl: './app.component.html',
  styles: [`
    .premium-nav {
      background: var(--glass-bg);
      backdrop-filter: blur(15px);
      -webkit-backdrop-filter: blur(15px);
      border-bottom: var(--glass-border);
      position: sticky;
      top: 0;
      z-index: 1000;
      box-shadow: var(--shadow-sm);
    }
    .nav-container {
      max-width: 1200px;
      margin: 0 auto;
      padding: 1rem 2rem;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .logo {
      font-size: 1.5rem;
      font-weight: 700;
      color: var(--color-primary);
    }
    .logo .icon { margin-right: 0.5rem; }
    .nav-links {
      display: flex;
      gap: 1.5rem;
      align-items: center;
    }
    .nav-links a {
      font-weight: 500;
      color: var(--color-text);
      padding: 0.5rem 0.8rem;
      border-radius: var(--radius-sm);
    }
    .nav-links a.active {
      color: var(--color-primary-hover);
      background: rgba(212, 175, 55, 0.1);
    }
    .admin-link {
      font-size: 0.85rem;
      border: 1px solid #ddd;
    }
    .main-content {
      min-height: calc(100vh - 140px);
    }
    .premium-footer {
      text-align: center;
      padding: 2rem;
      background: #333;
      color: #ccc;
      font-size: 0.9rem;
    }
  `]
})
export class AppComponent implements OnInit {
  title = 'ecommerce-shell';

  constructor(private api: ApiService) {}

  ngOnInit() {
    // Despertar la base de datos Neon al ingresar a la página.
    // Esto envía un SELECT 1 ligero para que la DB esté lista
    // cuando se carguen los productos del catálogo.
    this.api.wakeDb().subscribe({
      next: () => console.log('✅ Base de datos Neon despertada exitosamente'),
      error: (err) => console.warn('⚠️ Wake-up de DB falló (se reintentará con la carga de productos):', err.message)
    });
  }
}