import { Component } from '@angular/core';

@Component({
  selector: 'app-hero',
  standalone: true,
  template: `
    <div class="hero-container">
      <div class="hero-content animate-fade-in">
        <h1>Momentos Especiales, Entregados con Amor</h1>
        <p>Descubre nuestra colección premium de anchetas, desayunos sorpresa y detalles personalizados para enamorar y sorprender a las personas que más quieres.</p>
        <button class="btn-primary" (click)="scrollToCatalog()">Explorar Tienda</button>
      </div>
    </div>
  `,
  styles: [`
    .hero-container {
      width: 100%;
      height: 70vh;
      min-height: 500px;
      display: flex;
      align-items: center;
      justify-content: center;
      background: linear-gradient(135deg, rgba(230,200,100,0.3) 0%, rgba(255,182,193,0.4) 100%), url('https://images.unsplash.com/photo-1549465220-1a8b9238cd48?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80') center/cover;
      position: relative;
    }
    .hero-content {
      background: var(--glass-bg);
      backdrop-filter: blur(12px);
      padding: 3rem;
      border-radius: var(--radius-lg);
      text-align: center;
      max-width: 650px;
      box-shadow: var(--shadow-lg);
      border: var(--glass-border);
    }
    h1 {
      font-size: 2.8rem;
      color: #333;
      margin-bottom: 1rem;
      line-height: 1.2;
    }
    p {
      font-size: 1.15rem;
      color: #555;
      margin-bottom: 2rem;
    }
    @media (max-width: 768px) {
      .hero-container {
        min-height: 400px;
        height: auto;
        padding: 2rem 0;
      }
      h1 { font-size: 1.8rem; }
      p { font-size: 1rem; margin-bottom: 1.5rem; }
      .hero-content { margin: 1rem; padding: 1.5rem; }
    }
  `]
})
export class HeroComponent {
  scrollToCatalog() {
    document.getElementById('catalog-section')?.scrollIntoView({ behavior: 'smooth' });
  }
}
