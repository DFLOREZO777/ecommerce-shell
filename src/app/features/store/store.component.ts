import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { HeroComponent } from './hero/hero.component';
import { ApiService } from '../../core/services/api.service';
import { Product } from '../../core/models/Product';
import { CartItem } from '../../react-host/components/ShoppingCart';

interface Category {
  id: string;
  name: string;
  icon: string;
  image: string;
  hasGenderSub: boolean;
}

interface GenderSub {
  id: string;
  name: string;
  icon: string;
  children?: { id: string; name: string; icon: string }[];
}

@Component({
  selector: 'app-store',
  standalone: true,
  imports: [CommonModule, HeroComponent, FormsModule],
  template: `
    <app-hero></app-hero>

    <div class="social-bar-container">
      <div class="social-nav-size">
        <!-- URL de Facebook: -->
        <a href="#" class="social-icon" target="_blank" aria-label="Facebook">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 512" fill="currentColor">
            <path d="M279.14 288l14.22-92.66h-88.91v-60.13c0-25.35 12.42-50.06 52.24-50.06h40.42V6.26S260.43 0 225.36 0c-73.22 0-121.08 44.38-121.08 124.72v70.62H22.89V288h81.39v224h100.17V288z"/>
          </svg>
        </a>
        <a href="">@sorpresasmagicas</a>
        <!-- URL de Instagram: -->
        <a href="#" class="social-icon" target="_blank" aria-label="Instagram">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512" fill="currentColor">
            <path d="M224.1 141c-63.6 0-114.9 51.3-114.9 114.9s51.3 114.9 114.9 114.9S339 319.5 339 255.9 287.7 141 224.1 141zm0 189.6c-41.1 0-74.7-33.5-74.7-74.7s33.5-74.7 74.7-74.7 74.7 33.5 74.7 74.7-33.6 74.7-74.7 74.7zm146.4-194.3c0 14.9-12 26.8-26.8 26.8-14.9 0-26.8-12-26.8-26.8s12-26.8 26.8-26.8 26.8 12 26.8 26.8zm76.1 27.2c-1.7-35.9-9.9-67.7-36.2-93.9-26.2-26.2-58-34.4-93.9-36.2-37-2.1-147.9-2.1-184.9 0-35.8 1.7-67.6 9.9-93.9 36.1s-34.4 58-36.2 93.9c-2.1 37-2.1 147.9 0 184.9 1.7 35.9 9.9 67.7 36.2 93.9s58 34.4 93.9 36.2c37 2.1 147.9 2.1 184.9 0 35.9-1.7 67.7-9.9 93.9-36.2 26.2-26.2 34.4-58 36.2-93.9 2.1-37 2.1-147.8 0-184.8zM398.8 388c-7.8 19.6-22.9 34.7-42.6 42.6-29.5 11.7-99.5 9-132.1 9s-102.7 2.6-132.1-9c-19.6-7.8-34.7-22.9-42.6-42.6-11.7-29.5-9-99.5-9-132.1s-2.6-102.7 9-132.1c7.8-19.6 22.9-34.7 42.6-42.6 29.5-11.7 99.5-9 132.1-9s102.7-2.6 132.1 9c19.6 7.8 34.7 22.9 42.6 42.6 11.7 29.5 9 99.5 9 132.1s2.7 102.7-9 132.1z"/>
          </svg>
        </a>
        <a href="">@sorpresasmagicas</a>
        <!-- URL de TikTok: -->
        <a href="#" class="social-icon" target="_blank" aria-label="TikTok">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512" fill="currentColor">
            <path d="M448,209.91a210.06,210.06,0,0,1-122.77-39.25V349.38A162.55,162.55,0,1,1,185,188.31V278.2a74.62,74.62,0,1,0,52.23,71.18V0l88,0a121.18,121.18,0,0,0,1.86,22.17h0A122.18,122.18,0,0,0,381,102.39a121.43,121.43,0,0,0,67,20.14Z"/>
          </svg>
        </a>
        <a href="">@sorpresasmagicas</a>
      </div>
    </div>

    <div id="catalog-section" class="container" style="padding-top: 5rem; padding-bottom: 5rem;">
      <h2 class="section-title">Nuestro Catálogo Premium</h2>

      <!-- ===== CATEGORY SELECTOR (top cards) ===== -->
      <div class="category-grid" *ngIf="!selectedCategory">
        <div
          class="category-card"
          *ngFor="let cat of categories; let i = index"
          (click)="selectCategory(cat)"
          [style.animation-delay]="(i * 0.08) + 's'"
        >
          <img class="cat-img" [src]="cat.image" [alt]="cat.name" />
          <div class="cat-overlay">
            <span class="cat-name">{{ cat.name }}</span>
            <span class="cat-arrow">Explorar →</span>
          </div>
        </div>
      </div>

      <!-- ===== CATEGORY VIEW (sidebar + products) ===== -->
      <div *ngIf="selectedCategory" class="category-view-wrapper animate-slide-in">
        <!-- Back button -->
        <button class="back-btn glass-panel" (click)="goBack()">
          <span class="back-icon">←</span> Categorías
        </button>

        <h3 class="category-title">
          <img class="cat-title-img" [src]="selectedCategory.image" [alt]="selectedCategory.name" />
          {{ selectedCategory.name }}
          <span *ngIf="activeGenderSub" class="breadcrumb-sub">
            / {{ activeGenderSub.name }}
            <span *ngIf="activeAgeSub"> / {{ activeAgeSub.name }}</span>
          </span>
        </h3>

        <div class="category-layout">
          <!-- VERTICAL SIDEBAR (gender + age subcategories) -->
          <aside class="sidebar glass-panel" *ngIf="selectedCategory.hasGenderSub">
            <h4 class="sidebar-title">Filtrar por</h4>

            <div *ngFor="let g of genderSubs" class="sidebar-group">
              <button
                class="sidebar-btn"
                [class.active]="activeGenderSub?.id === g.id"
                (click)="selectGender(g)"
              >
                <span class="sb-icon">{{ g.icon }}</span>
                {{ g.name }}
                <span class="sb-chevron" [class.open]="activeGenderSub?.id === g.id">▸</span>
              </button>

              <!-- Age sub-items -->
              <div class="sub-items" *ngIf="activeGenderSub?.id === g.id && g.children">
                <button
                  *ngFor="let age of g.children"
                  class="sub-item-btn"
                  [class.active]="activeAgeSub?.id === age.id"
                  (click)="selectAge(age)"
                >
                  <span class="si-icon">{{ age.icon }}</span>
                  {{ age.name }}
                </button>
              </div>
            </div>

            <!-- Clear filters -->
            <button class="clear-btn" *ngIf="activeGenderSub" (click)="clearFilters()">
              ✕ Limpiar filtros
            </button>
          </aside>

          <!-- PRODUCTS GRID -->
          <div class="products-area">
            <div *ngIf="loading" class="loading-msg">Cargando maravillas... ✨</div>

            <div class="product-grid" *ngIf="!loading">
              <div class="product-card glass-panel" *ngFor="let p of filteredProducts">
                <div class="img-wrapper" (click)="openLightbox(p.imageUrl)">
                  <img [src]="p.imageUrl || defaultImg" alt="{{p.name}}" />
                  <span class="category-badge">{{ p.category || 'Ancheta' }}</span>
                </div>
                <div class="card-content">
                  <h3>{{ p.name }}</h3>
                  <p class="desc">{{ p.description || 'Un hermoso detalle creado para sorprender a esa persona tan especial.' }}</p>
                  <div class="price-row">
                    <span class="price">{{ p.price | currency:'COP':'symbol':'1.0-0' }}</span>
                    <button class="btn-primary btn-sm" (click)="addToCart(p)">Añadir 🛒</button>
                  </div>
                </div>
              </div>

              <div *ngIf="filteredProducts.length === 0" class="empty-state">
                <span class="empty-icon">🎁</span>
                <p>No hay productos disponibles en esta categoría.</p>
                <p class="sub-msg">Comunícate con nosotros para reservar un pedido especial.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Lightbox Modal -->
    <div class="lightbox" *ngIf="selectedImage" (click)="closeLightbox()">
      <div class="lightbox-content" (click)="$event.stopPropagation()">
        <button class="close-btn" (click)="closeLightbox()">&times;</button>
        <img [src]="selectedImage" alt="Zoom">
      </div>
    </div>

    <!-- Custom Message Modal -->
    <div class="lightbox" *ngIf="customMessageModal !== 'closed'" (click)="closeMessageModal()">
      <div class="lightbox-content msg-modal-content" (click)="$event.stopPropagation()">
        <h3 style="margin-bottom: 1rem; color: #333;">Mensaje Personalizado</h3>
        
        <div *ngIf="customMessageModal === 'ask'">
          <p style="color: #666; margin-bottom: 1.5rem;">¿Deseas incluir un mensaje personalizado para este producto?</p>
          <div class="modal-actions" style="display: flex; gap: 1rem; justify-content: flex-end;">
            <button class="btn-primary btn-sm" style="background: #e0e0e0; color: #333;" (click)="handleMessageChoice(false)">No</button>
            <button class="btn-primary btn-sm" (click)="handleMessageChoice(true)">Sí</button>
          </div>
        </div>

        <div *ngIf="customMessageModal === 'input'">
          <p style="color: #666; margin-bottom: 1rem;">Escribe tu mensaje (máx. 50 caracteres):</p>
          <textarea 
            [(ngModel)]="customMessageText" 
            maxlength="50"
            style="width: 100%; padding: 0.75rem; border-radius: 8px; border: 1px solid #ccc; font-family: inherit; resize: none; font-size: 1rem;"
            rows="3"
            placeholder="Escribe aquí tu mensaje..."
          ></textarea>
          <div class="modal-actions" style="margin-top: 1.5rem; display: flex; gap: 1rem; justify-content: flex-end;">
            <button class="btn-primary btn-sm" (click)="submitCustomMessage()">Aceptar</button>
          </div>
        </div>
      </div>
    </div>

    <!-- ===== Floating Cart Bubble ===== -->
    <button
      class="cart-fab"
      [class.cart-fab-pulse]="cartPulse"
      (click)="toggleMiniCart($event)"
      id="floating-cart-btn"
    >
      <svg class="cart-fab-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/>
        <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
      </svg>
      <span class="cart-fab-badge" *ngIf="cartTotalItems > 0">{{ cartTotalItems }}</span>
    </button>

    <!-- End of cart FAB -->

    <!-- WhatsApp Floating Button -->
    <button class="whatsapp-fab" (click)="openWhatsApp()" aria-label="WhatsApp">
      <svg class="whatsapp-fab-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M20.52 3.48A11.93 11.93 0 0 0 12 0C5.37 0 .01 5.37.01 12c0 2.12.56 4.18 1.61 5.99L0 24l6.28-1.64a11.9 11.9 0 0 0 5.72 1.45c6.63 0 12-5.37 12-12 0-3.2-1.25-6.22-3.48-8.33zM12 21.5a9.53 9.53 0 0 1-4.87-1.32l-.35-.2-3.73 1 1-3.63-.22-.36A9.53 9.53 0 0 1 2.5 12c0-5.25 4.25-9.5 9.5-9.5s9.5 4.25 9.5 9.5-4.25 9.5-9.5 9.5z"/>
        <path d="M17.92 14.68c-.24-.12-1.41-.7-1.63-.78-.22-.08-.38-.12-.54.12-.16.24-.62.78-.76.94-.14.16-.28.18-.52.06-.24-.12-1.02-.38-1.94-1.22-.72-.64-1.2-1.43-1.34-1.66-.14-.24-.02-.37.1-.49.1-.1.24-.26.36-.39.12-.12.16-.21.24-.35.08-.14.04-.26-.02-.38-.06-.12-.54-1.3-.74-1.78-.19-.46-.38-.4-.54-.4-.14 0-.3-.02-.46-.02-.16 0-.42.06-.64.28-.22.22-.86.84-.86 2.05 0 1.2.88 2.36 1 2.52.12.16 1.74 2.68 4.22 3.76.59.25 1.05.4 1.41.51.59.19 1.13.16 1.56.1.48-.07 1.41-.58 1.61-1.14.2-.56.2-1.04.14-1.14-.06-.1-.22-.16-.46-.28z"/>
      </svg>
    </button>

    <!-- ===== Mini Cart Popup ===== -->
    <div class="mini-cart-backdrop" *ngIf="showMiniCart" (click)="showMiniCart = false"></div>
    <div class="mini-cart" *ngIf="showMiniCart" (click)="$event.stopPropagation()">
      <div class="mini-cart-header">
        <h4>🛒 Mi Carrito</h4>
        <button class="mini-cart-close" (click)="showMiniCart = false">&times;</button>
      </div>

      <div class="mini-cart-body" *ngIf="cartItems.length > 0">
        <div class="mini-cart-item" *ngFor="let item of cartItems">
          <img [src]="item.imageUrl || defaultImg" [alt]="item.name" class="mini-cart-item-img" />
          <div class="mini-cart-item-info">
            <span class="mini-cart-item-name">{{ item.name }}</span>
            <span class="mini-cart-item-price">\{{ item.price | currency:'COP':'symbol':'1.0-0' }}</span>
          </div>
          <div class="mini-cart-item-controls">
            <button class="qty-btn qty-minus" (click)="updateCartQty(item, -1)">−</button>
            <span class="qty-value">{{ item.quantity }}</span>
            <button class="qty-btn qty-plus" (click)="updateCartQty(item, +1)">+</button>
          </div>
        </div>
      </div>

      <div class="mini-cart-empty" *ngIf="cartItems.length === 0">
        <span class="mini-cart-empty-icon">🛒</span>
        <p>Tu carrito está vacío</p>
      </div>

      <div class="mini-cart-footer" *ngIf="cartItems.length > 0">
        <div class="mini-cart-total">
          <span>Total</span>
          <span class="mini-cart-total-price">\{{ cartTotal | currency:'COP':'symbol':'1.0-0' }}</span>
        </div>
        <button class="mini-cart-checkout-btn" (click)="goToCheckout()">
          Realizar Compra →
        </button>
      </div>
    </div>
  `,
  styles: [`
    /* ===== Section Title ===== */
    .section-title {
      text-align: center;
      font-size: 2.5rem;
      color: var(--color-primary-hover);
      margin-bottom: 3rem;
    }

    /* ===== Social Media Bar ===== */
    .social-bar-container {
      width: 100%;
      background: linear-gradient(135deg, rgba(212,175,55,0.08), rgba(255,182,193,0.06));
      border-bottom: 1px solid rgba(0,0,0,0.05);
      border-top: 1px solid rgba(0,0,0,0.05);
      display: flex;
      justify-content: center;
      align-items: center;
      height: 70px;
      margin-bottom: -5rem;
      position: relative;
      z-index: 10;
    }
    .social-nav-size {
      display: flex;
      gap: 2rem;
      align-items: center;
    }
    .social-icon {
      color: var(--color-text);
      transition: all 0.3s ease;
      display: flex;
      align-items: center;
      justify-content: center;
      width: 44px;
      height: 44px;
      border-radius: 50%;
      background: #fff;
      box-shadow: 0 4px 10px rgba(0,0,0,0.08);
      text-decoration: none;
    }
    .social-icon svg {
      width: 22px;
      height: 22px;
    }
    .social-icon:hover {
      transform: translateY(-3px) scale(1.05);
      color: var(--color-primary);
      box-shadow: 0 8px 18px rgba(212,175,55,0.25);
    }

    /* ===== Category Grid ===== */
    .category-grid {
      display: flex;
      flex-wrap: wrap;
      justify-content: center;
      gap: 1.8rem;
      max-width: 1000px;
      margin: 0 auto;
    }

    .category-card {
      width: calc(33.333% - 1.2rem);
      min-width: 250px;
      position: relative;
      border-radius: var(--radius-lg);
      overflow: hidden;
      cursor: pointer;
      aspect-ratio: 4 / 3;
      animation: fadeInUp 0.5s ease both;
      box-shadow: var(--shadow-md);
      transition: transform var(--transition-normal), box-shadow var(--transition-normal);
    }
    .category-card:hover {
      transform: translateY(-8px) scale(1.03);
      box-shadow: 0 20px 40px rgba(0,0,0,0.18);
    }
    .cat-img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      transition: transform 0.6s ease;
    }
    .category-card:hover .cat-img {
      transform: scale(1.1);
    }
    .cat-overlay {
      position: absolute;
      inset: 0;
      background: linear-gradient(to top, rgba(0,0,0,0.65) 0%, rgba(0,0,0,0.1) 50%, transparent 100%);
      display: flex;
      flex-direction: column;
      justify-content: flex-end;
      padding: 1.5rem;
      transition: background 0.3s ease;
    }
    .category-card:hover .cat-overlay {
      background: linear-gradient(to top, rgba(0,0,0,0.75) 0%, rgba(0,0,0,0.2) 60%, transparent 100%);
    }
    .cat-name {
      font-size: 1.3rem;
      font-weight: 700;
      color: #fff;
      text-shadow: 0 2px 8px rgba(0,0,0,0.3);
    }
    .cat-arrow {
      font-size: 0.9rem;
      color: var(--color-primary);
      font-weight: 500;
      opacity: 0;
      transform: translateY(8px);
      transition: all 0.3s ease;
      margin-top: 0.3rem;
    }
    .category-card:hover .cat-arrow {
      opacity: 1;
      transform: translateY(0);
    }

    /* ===== Back Button ===== */
    .back-btn {
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.6rem 1.3rem;
      border: none;
      border-radius: var(--radius-pill);
      cursor: pointer;
      font-weight: 500;
      font-size: 0.95rem;
      color: var(--color-text);
      margin-bottom: 1.5rem;
      transition: all var(--transition-normal);
    }
    .back-btn:hover {
      transform: translateX(-4px);
      box-shadow: var(--shadow-md);
      color: var(--color-primary);
    }
    .back-icon { font-size: 1.3rem; }

    /* ===== Category Title ===== */
    .category-title {
      font-size: 1.8rem;
      color: var(--color-text);
      margin-bottom: 2rem;
      display: flex;
      align-items: center;
      gap: 0.6rem;
      flex-wrap: wrap;
    }
    .cat-title-img {
      width: 40px;
      height: 40px;
      border-radius: var(--radius-sm);
      object-fit: cover;
      box-shadow: var(--shadow-sm);
    }
    .breadcrumb-sub {
      font-size: 1.1rem;
      color: var(--color-primary);
      font-weight: 400;
    }

    /* ===== Category Layout ===== */
    .category-layout {
      display: flex;
      gap: 2rem;
      align-items: flex-start;
    }

    /* ===== Sidebar ===== */
    .sidebar {
      flex: 0 0 220px;
      padding: 1.5rem;
      border-radius: var(--radius-lg);
      position: sticky;
      top: 100px;
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }
    .sidebar-title {
      font-size: 0.85rem;
      text-transform: uppercase;
      letter-spacing: 1.5px;
      color: var(--color-text-light);
      margin-bottom: 0.5rem;
    }
    .sidebar-group {
      display: flex;
      flex-direction: column;
    }
    .sidebar-btn {
      display: flex;
      align-items: center;
      gap: 0.6rem;
      width: 100%;
      padding: 0.75rem 1rem;
      border: none;
      background: transparent;
      border-radius: var(--radius-sm);
      cursor: pointer;
      font-size: 0.95rem;
      font-weight: 500;
      color: var(--color-text);
      transition: all 0.2s ease;
      text-align: left;
    }
    .sidebar-btn:hover {
      background: rgba(212,175,55,0.08);
      color: var(--color-primary-hover);
    }
    .sidebar-btn.active {
      background: linear-gradient(135deg, rgba(212,175,55,0.15), rgba(255,182,193,0.1));
      color: var(--color-primary-hover);
      font-weight: 600;
    }
    .sb-icon { font-size: 1.2rem; }
    .sb-chevron {
      margin-left: auto;
      font-size: 0.85rem;
      transition: transform 0.25s ease;
      color: var(--color-text-light);
    }
    .sb-chevron.open { transform: rotate(90deg); color: var(--color-primary); }

    /* Sub items */
    .sub-items {
      display: flex;
      flex-direction: column;
      padding-left: 1rem;
      overflow: hidden;
      animation: slideDown 0.3s ease;
    }
    .sub-item-btn {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.55rem 1rem;
      border: none;
      background: transparent;
      border-radius: var(--radius-sm);
      cursor: pointer;
      font-size: 0.9rem;
      color: var(--color-text-light);
      transition: all 0.2s ease;
      text-align: left;
    }
    .sub-item-btn:hover {
      background: rgba(212,175,55,0.06);
      color: var(--color-primary);
    }
    .sub-item-btn.active {
      color: var(--color-primary-hover);
      font-weight: 600;
      background: rgba(212,175,55,0.1);
    }
    .si-icon { font-size: 1rem; }

    .clear-btn {
      margin-top: 0.75rem;
      padding: 0.5rem 1rem;
      border: 1px dashed var(--color-text-light);
      background: transparent;
      border-radius: var(--radius-pill);
      cursor: pointer;
      font-size: 0.8rem;
      color: var(--color-text-light);
      transition: all 0.2s ease;
      text-align: center;
    }
    .clear-btn:hover {
      border-color: var(--color-primary);
      color: var(--color-primary);
    }

    /* ===== Products Area ===== */
    .products-area { flex: 1; min-width: 0; }

    .loading-msg {
      text-align: center;
      color: var(--color-text-light);
      font-size: 1.5rem;
      padding: 3rem;
    }

    .product-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
      gap: 2rem;
    }
    .product-card {
      overflow: hidden;
      display: flex;
      flex-direction: column;
      transition: transform var(--transition-normal), box-shadow var(--transition-normal);
      border-radius: var(--radius-lg);
      animation: fadeInUp 0.4s ease both;
    }
    .product-card:hover {
      transform: translateY(-8px);
      box-shadow: var(--shadow-lg);
    }
    .img-wrapper {
      position: relative;
      width: 100%;
      height: 250px;
      overflow: hidden;
      cursor: zoom-in;
    }
    .img-wrapper img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      transition: transform 0.6s ease;
    }
    .product-card:hover .img-wrapper img {
      transform: scale(1.08);
    }
    .category-badge {
      position: absolute;
      top: 1rem;
      right: 1rem;
      background: var(--glass-bg);
      backdrop-filter: blur(8px);
      padding: 0.4rem 1rem;
      border-radius: var(--radius-pill);
      font-size: 0.85rem;
      font-weight: 600;
      color: var(--color-primary-hover);
      box-shadow: var(--shadow-sm);
    }
    .card-content {
      padding: 1.5rem;
      display: flex;
      flex-direction: column;
      flex: 1;
    }
    h3 {
      font-size: 1.35rem;
      margin-bottom: 0.5rem;
      color: #333;
    }
    .desc {
      color: var(--color-text-light);
      font-size: 0.95rem;
      margin-bottom: 1.5rem;
      flex: 1;
    }
    .price-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .price {
      font-size: 1.6rem;
      font-weight: 700;
      color: var(--color-primary);
    }
    .btn-sm {
      padding: 0.6rem 1.2rem;
      font-size: 0.95rem;
    }

    /* ===== Empty State ===== */
    .empty-state {
      grid-column: 1 / -1;
      text-align: center;
      padding: 4rem 2rem;
    }
    .empty-icon { font-size: 3.5rem; display: block; margin-bottom: 1rem; }
    .empty-state p { font-size: 1.15rem; color: #888; }
    .sub-msg { font-size: 0.95rem !important; color: #aaa !important; margin-top: 0.5rem; }

    /* ===== Lightbox ===== */
    .lightbox {
      position: fixed;
      top: 0;
      left: 0;
      width: 100vw;
      height: 100vh;
      background: rgba(0,0,0,0.85);
      backdrop-filter: blur(8px);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 10000;
      padding: 2rem;
      animation: fadeIn 0.3s ease;
    }
    .lightbox-content {
      position: relative;
      max-width: 90%;
      max-height: 90%;
      box-shadow: 0 0 50px rgba(0,0,0,0.5);
    }
    .lightbox-content img {
      max-width: 100%;
      max-height: 90vh;
      border-radius: 12px;
      display: block;
      object-fit: contain;
    }
    .close-btn {
      position: absolute;
      top: -40px;
      right: -40px;
      background: none;
      border: none;
      color: #fff;
      font-size: 2.5rem;
      cursor: pointer;
    }
    
    .msg-modal-content {
      background: #fff;
      padding: 2.5rem;
      border-radius: var(--radius-lg);
      width: 400px;
      max-width: 90vw;
      box-shadow: var(--shadow-lg);
    }

    /* ===== Animations ===== */
    @keyframes fadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }
    @keyframes fadeInUp {
      from { opacity: 0; transform: translateY(20px); }
      to { opacity: 1; transform: translateY(0); }
    }
    @keyframes slideDown {
      from { max-height: 0; opacity: 0; }
      to { max-height: 200px; opacity: 1; }
    }
    .animate-slide-in {
      animation: fadeInUp 0.4s ease both;
    }

    /* ===== Responsive ===== */
    @media (max-width: 768px) {
      .category-grid {
        gap: 1rem;
      }
      .category-card { 
        width: calc(50% - 0.5rem);
        min-width: 150px;
        aspect-ratio: 3 / 2; 
      }

      .category-layout {
        flex-direction: column;
      }
      .sidebar {
        flex: none;
        width: 100%;
        flex-direction: row;
        flex-wrap: wrap;
        gap: 0.5rem;
        position: static;
        padding: 1rem;
      }
      .sidebar-title { width: 100%; }
      .sidebar-group { width: auto; }
      .sub-items {
        padding-left: 0;
        flex-direction: row;
        flex-wrap: wrap;
        gap: 0.3rem;
      }
      .product-grid {
        grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
        gap: 1.5rem;
      }
    }

    @media (max-width: 480px) {
      .category-card { width: 100%; }
      .section-title { font-size: 1.8rem; }
      .category-title { font-size: 1.4rem; }
    }

    /* ===== Floating Cart Bubble (FAB) ===== */
    .cart-fab {
      position: fixed;
      bottom: 2rem;
      right: 2rem;
      width: 60px;
      height: 60px;
      border-radius: 50%;
      border: none;
      background: linear-gradient(135deg, #D4AF37 0%, #F5D76E 100%);
      color: #fff;
      cursor: pointer;
      box-shadow: 0 6px 24px rgba(212, 175, 55, 0.45), 0 2px 8px rgba(0,0,0,0.15);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 9000;
      transition: transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1), box-shadow 0.3s ease;
    }
    .cart-fab:hover {
      transform: scale(1.12);
      box-shadow: 0 8px 32px rgba(212, 175, 55, 0.55), 0 4px 12px rgba(0,0,0,0.2);
    }
    .cart-fab:active {
      transform: scale(0.95);
    }
    .cart-fab-icon {
      width: 26px;
      height: 26px;
    }
    .cart-fab-badge {
      position: absolute;
      top: -4px;
      right: -4px;
      background: linear-gradient(135deg, #FF6B6B, #EE5A24);
      color: #fff;
      font-size: 0.72rem;
      font-weight: 700;
      width: 22px;
      height: 22px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      border: 2px solid #fff;
      box-shadow: 0 2px 8px rgba(238, 90, 36, 0.4);
      animation: badgePop 0.35s cubic-bezier(0.34, 1.56, 0.64, 1);
    }
    /* ===== Floating Cart Bubble (FAB) ===== */
    .cart-fab {
      position: fixed;
      bottom: 2rem;
      right: 2rem;
      width: 60px;
      height: 60px;
      border-radius: 50%;
      border: none;
      background: linear-gradient(135deg, #D4AF37 0%, #F5D76E 100%);
      color: #fff;
      cursor: pointer;
      box-shadow: 0 6px 24px rgba(212, 175, 55, 0.45), 0 2px 8px rgba(0,0,0,0.15);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 9000;
      transition: transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1), box-shadow 0.3s ease;
    }
    .cart-fab:hover {
      transform: scale(1.12);
      box-shadow: 0 8px 32px rgba(212, 175, 55, 0.55), 0 4px 12px rgba(0,0,0,0.2);
    }
    .cart-fab:active {
      transform: scale(0.95);
    }
    .cart-fab-icon {
      width: 26px;
      height: 26px;
    }
    .cart-fab-badge {
      position: absolute;
      top: -4px;
      right: -4px;
      background: linear-gradient(135deg, #FF6B6B, #EE5A24);
      color: #fff;
      font-size: 0.72rem;
      font-weight: 700;
      width: 22px;
      height: 22px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      border: 2px solid #fff;
      box-shadow: 0 2px 8px rgba(238, 90, 36, 0.4);
      animation: badgePop 0.35s cubic-bezier(0.34, 1.56, 0.64, 1);
    }
    .cart-fab-pulse {
      animation: fabPulse 0.5s ease;
    }
/* ===== WhatsApp Floating Button ===== */
    .whatsapp-fab {
      position: fixed;
      bottom: 6.5rem; /* directly above the cart FAB */
      right: 2rem;
      width: 60px;
      height: 60px;
      border-radius: 50%;
      border: none;
      background: linear-gradient(135deg, #25D366 0%, #128C7E 100%);
      color: #fff;
      cursor: pointer;
      box-shadow: 0 6px 24px rgba(37, 211, 102, 0.45), 0 2px 8px rgba(0,0,0,0.15);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 9000;
      transition: transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1), box-shadow 0.3s ease;
      overflow: hidden;
    }
    .whatsapp-fab:hover {
      transform: scale(1.12);
      box-shadow: 0 8px 32px rgba(37, 211, 102, 0.55), 0 4px 12px rgba(0,0,0,0.2);
    }
    .whatsapp-fab:active {
      transform: scale(0.95);
    }
    .whatsapp-fab-icon {
      width: 60%;
      height: 60%;
      object-fit: contain;
    }
    .cart-fab-pulse {
      animation: fabPulse 0.5s ease;
    }

    @keyframes fabPulse {
      0%   { transform: scale(1); }
      30%  { transform: scale(1.25); }
      60%  { transform: scale(0.95); }
      100% { transform: scale(1); }
    }
    @keyframes badgePop {
      0%   { transform: scale(0); }
      100% { transform: scale(1); }
    }

    /* ===== Mini Cart Backdrop ===== */
    .mini-cart-backdrop {
      position: fixed;
      inset: 0;
      background: rgba(0, 0, 0, 0.25);
      backdrop-filter: blur(2px);
      z-index: 9001;
      animation: fadeIn 0.2s ease;
    }

    /* ===== Mini Cart Popup ===== */
    .mini-cart {
      position: fixed;
      bottom: 6.5rem;
      right: 2rem;
      width: 370px;
      max-height: 480px;
      background: rgba(255, 255, 255, 0.95);
      backdrop-filter: blur(20px);
      -webkit-backdrop-filter: blur(20px);
      border-radius: 20px;
      box-shadow: 0 20px 60px rgba(0, 0, 0, 0.18), 0 0 0 1px rgba(255,255,255,0.3) inset;
      z-index: 9002;
      display: flex;
      flex-direction: column;
      overflow: hidden;
      animation: miniCartSlideUp 0.35s cubic-bezier(0.34, 1.56, 0.64, 1);
    }
    @keyframes miniCartSlideUp {
      from { opacity: 0; transform: translateY(20px) scale(0.95); }
      to   { opacity: 1; transform: translateY(0) scale(1); }
    }

    .mini-cart-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 1.1rem 1.3rem;
      border-bottom: 1px solid rgba(0,0,0,0.06);
      background: linear-gradient(135deg, rgba(212,175,55,0.08), rgba(255,182,193,0.06));
    }
    .mini-cart-header h4 {
      margin: 0;
      font-size: 1.15rem;
      font-weight: 700;
      color: #333;
    }
    .mini-cart-close {
      background: none;
      border: none;
      font-size: 1.6rem;
      color: #999;
      cursor: pointer;
      line-height: 1;
      padding: 0;
      transition: color 0.2s, transform 0.2s;
    }
    .mini-cart-close:hover {
      color: #EE5A24;
      transform: scale(1.2);
    }

    /* ===== Cart Body (scrollable items) ===== */
    .mini-cart-body {
      flex: 1;
      overflow-y: auto;
      padding: 0.75rem 1.1rem;
      max-height: 260px;
    }
    .mini-cart-body::-webkit-scrollbar {
      width: 5px;
    }
    .mini-cart-body::-webkit-scrollbar-thumb {
      background: rgba(212,175,55,0.3);
      border-radius: 10px;
    }

    .mini-cart-item {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      padding: 0.65rem 0;
      border-bottom: 1px solid rgba(0,0,0,0.05);
      animation: fadeInUp 0.3s ease both;
    }
    .mini-cart-item:last-child {
      border-bottom: none;
    }
    .mini-cart-item-img {
      width: 48px;
      height: 48px;
      border-radius: 10px;
      object-fit: cover;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
      flex-shrink: 0;
    }
    .mini-cart-item-info {
      flex: 1;
      min-width: 0;
      display: flex;
      flex-direction: column;
      gap: 0.15rem;
    }
    .mini-cart-item-name {
      font-size: 0.9rem;
      font-weight: 600;
      color: #333;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    .mini-cart-item-price {
      font-size: 0.82rem;
      color: #D4AF37;
      font-weight: 600;
    }
    .mini-cart-item-controls {
      display: flex;
      align-items: center;
      gap: 0.4rem;
      flex-shrink: 0;
    }
    .qty-btn {
      width: 26px;
      height: 26px;
      border-radius: 50%;
      border: none;
      cursor: pointer;
      font-size: 0.9rem;
      font-weight: 700;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.2s ease;
      line-height: 1;
    }
    .qty-minus {
      background: #fde8e8;
      color: #e74c3c;
    }
    .qty-minus:hover {
      background: #e74c3c;
      color: #fff;
    }
    .qty-plus {
      background: rgba(212,175,55,0.15);
      color: #D4AF37;
    }
    .qty-plus:hover {
      background: #D4AF37;
      color: #fff;
    }
    .qty-value {
      font-size: 0.9rem;
      font-weight: 700;
      color: #333;
      min-width: 20px;
      text-align: center;
    }

    /* ===== Empty state ===== */
    .mini-cart-empty {
      padding: 2.5rem 1.5rem;
      text-align: center;
    }
    .mini-cart-empty-icon {
      font-size: 2.5rem;
      display: block;
      margin-bottom: 0.5rem;
      opacity: 0.5;
    }
    .mini-cart-empty p {
      color: #999;
      font-size: 0.95rem;
      margin: 0;
    }

    /* ===== Footer (total + checkout) ===== */
    .mini-cart-footer {
      border-top: 1px solid rgba(0,0,0,0.06);
      padding: 1rem 1.3rem 1.2rem;
      background: linear-gradient(135deg, rgba(212,175,55,0.04), rgba(255,182,193,0.03));
    }
    .mini-cart-total {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 0.85rem;
    }
    .mini-cart-total span:first-child {
      font-size: 0.95rem;
      font-weight: 500;
      color: #666;
    }
    .mini-cart-total-price {
      font-size: 1.35rem;
      font-weight: 800;
      color: #D4AF37;
    }
    .mini-cart-checkout-btn {
      width: 100%;
      padding: 0.8rem 1.5rem;
      border: none;
      border-radius: 999px;
      background: linear-gradient(135deg, #D4AF37 0%, #C5A028 100%);
      color: #fff;
      font-size: 1rem;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.3s ease;
      box-shadow: 0 4px 16px rgba(212,175,55,0.35);
      letter-spacing: 0.02em;
    }
    .mini-cart-checkout-btn:hover {
      transform: translateY(-2px);
      box-shadow: 0 6px 24px rgba(212,175,55,0.5);
      background: linear-gradient(135deg, #C5A028 0%, #D4AF37 100%);
    }
    .mini-cart-checkout-btn:active {
      transform: translateY(0);
    }

    @media (max-width: 768px) {
      .category-layout {
        flex-direction: column;
      }
      .sidebar {
        flex: none;
        width: 100%;
        position: static;
        margin-bottom: 1rem;
      }
      .social-nav-size {
        gap: 1rem;
      }
      .category-card {
        width: calc(50% - 0.9rem);
        min-width: 150px;
      }
    }

    @media (max-width: 480px) {
      .mini-cart {
        width: calc(100vw - 2rem);
        right: 1rem;
        bottom: 5.5rem;
      }
      .cart-fab {
        bottom: 1.2rem;
        right: 1.2rem;
        width: 54px;
        height: 54px;
      }
      .whatsapp-fab {
        bottom: 5.2rem;
        right: 1.2rem;
        width: 54px;
        height: 54px;
      }
      .category-card {
        width: 100%;
      }
    }
  `]
})
export class StoreComponent implements OnInit {
  readonly defaultImg = 'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?q=80&w=600';

  products: Product[] = [];
  filteredProducts: Product[] = [];
  loading = true;
  selectedImage: string | null = null;

  /* ----- Modal State ----- */
  customMessageModal: 'closed' | 'ask' | 'input' = 'closed';
  productToAdd: Product | null = null;
  customMessageText: string = '';

  /* ----- Category data ----- */
  categories: Category[] = [
    { id: 'anchetas', name: 'Anchetas', icon: '🧺', image: 'categories/anchetas.png', hasGenderSub: true },
    { id: 'ramos', name: 'Ramos', icon: '💐', image: 'categories/ramos.png', hasGenderSub: false },
    { id: 'desayunos', name: 'Desayunos', icon: '🥞', image: 'categories/desayunos.png', hasGenderSub: true },
    { id: 'decoraciones', name: 'Decoraciones', icon: '🎈', image: 'categories/decoraciones.png', hasGenderSub: true },
    { id: 'detallitos', name: 'Detallitos', icon: '🎁', image: 'categories/detallitos.png', hasGenderSub: true },
  ];

  genderSubs: GenderSub[] = [
    {
      id: 'hombre',
      name: 'Hombre',
      icon: '👨',
      children: [
        { id: 'adulto', name: 'Adulto', icon: '🧔' },
        { id: 'nino', name: 'Niño', icon: '👦' },
      ]
    },
    {
      id: 'mujer',
      name: 'Mujer',
      icon: '👩',
      children: [
        { id: 'mujer_adulta', name: 'Adulta', icon: '👩‍🦱' },
        { id: 'nina', name: 'Niña', icon: '👧' },
      ]
    }
  ];

  selectedCategory: Category | null = null;
  activeGenderSub: GenderSub | null = null;
  activeAgeSub: { id: string; name: string; icon: string } | null = null;

  /* ----- Cart State ----- */
  cartItems: CartItem[] = [];
  showMiniCart = false;
  cartPulse = false;
  // WhatsApp integration
  // COLOCAR AQUÍ EL NÚMERO DE WHATSAPP PREDETERMINADO (incluir código de país sin el '+', ej. '573001234567')
  whatsappNumber: string = 'colocar numero'; // TODO: set actual WhatsApp number


  get cartTotalItems(): number {
    return this.cartItems.reduce((sum, i) => sum + i.quantity, 0);
  }

  get cartTotal(): number {
    return this.cartItems.reduce((sum, i) => sum + i.price * i.quantity, 0);
  }

  constructor(private api: ApiService, private router: Router) { }

  ngOnInit() {
    this.loadCart();

    this.api.getProducts().subscribe({
      next: (data) => {
        this.products = data.filter(p => p.isActive !== false);
        this.loading = false;
      },
      error: () => {
        this.loading = false;
        console.error('Error al cargar los productos');
      }
    });
  }

  /* ----- Cart helpers ----- */
  private loadCart() {
    const saved = localStorage.getItem('ecommerce_cart');
    if (saved) {
      try { this.cartItems = JSON.parse(saved); } catch (e) { }
    }
  }

  private saveCart() {
    localStorage.setItem('ecommerce_cart', JSON.stringify(this.cartItems));
  }

  private triggerPulse() {
    this.cartPulse = false;
    setTimeout(() => { this.cartPulse = true; });
    setTimeout(() => { this.cartPulse = false; }, 600);
  }

  toggleMiniCart(event: Event) {
    event.stopPropagation();
    this.showMiniCart = !this.showMiniCart;
  }

  updateCartQty(item: CartItem, delta: number) {
    const newQty = item.quantity + delta;
    if (newQty <= 0) {
      this.cartItems = this.cartItems.filter(i => i !== item);
    } else {
      item.quantity = newQty;
    }
    this.saveCart();
  }

  goToCheckout() {
    this.showMiniCart = false;
    this.router.navigate(['/cart']);
  }

  // Opens WhatsApp chat with predefined number
  openWhatsApp(): void {
    const url = `https://wa.me/${this.whatsappNumber}`;
    window.open(url, '_blank');
  }


  /* ----- Category navigation ----- */
  selectCategory(cat: Category) {
    this.selectedCategory = cat;
    this.activeGenderSub = null;
    this.activeAgeSub = null;
    this.applyFilters();
  }

  selectGender(g: GenderSub) {
    if (this.activeGenderSub?.id === g.id) {
      // Toggle off
      this.activeGenderSub = null;
      this.activeAgeSub = null;
    } else {
      this.activeGenderSub = g;
      this.activeAgeSub = null;
    }
    this.applyFilters();
  }

  selectAge(age: { id: string; name: string; icon: string }) {
    this.activeAgeSub = this.activeAgeSub?.id === age.id ? null : age;
    this.applyFilters();
  }

  clearFilters() {
    this.activeGenderSub = null;
    this.activeAgeSub = null;
    this.applyFilters();
  }

  goBack() {
    this.selectedCategory = null;
    this.activeGenderSub = null;
    this.activeAgeSub = null;
    this.filteredProducts = [];
  }

  /* ----- Filtering logic ----- */
  private applyFilters() {
    if (!this.selectedCategory) {
      this.filteredProducts = [];
      return;
    }

    // Filter by main category
    let result = this.products.filter(p =>
      (p.category || '').toLowerCase() === this.selectedCategory!.id.toLowerCase()
    );

    // Filter by gender subcategories if applicable
    if (this.selectedCategory.hasGenderSub) {
      if (this.activeAgeSub) {
        // Filter by specific subcategory (e.g. 'adulto', 'nino', 'mujer_adulta', 'nina')
        result = result.filter(p => p.gender === this.activeAgeSub!.id);
      } else if (this.activeGenderSub) {
        // Filter by gender group ('hombre' / 'mujer')
        if (this.activeGenderSub.id === 'hombre') {
          result = result.filter(p => p.gender === 'adulto' || p.gender === 'nino');
        } else if (this.activeGenderSub.id === 'mujer') {
          result = result.filter(p => p.gender === 'mujer_adulta' || p.gender === 'nina');
        }
      }
    }

    this.filteredProducts = result;
  }

  /* ----- Lightbox ----- */
  openLightbox(url: string | undefined) {
    if (url) this.selectedImage = url;
  }

  closeLightbox() {
    this.selectedImage = null;
  }

  /* ----- Cart & Modal ----- */
  addToCart(product: Product) {
    this.productToAdd = product;
    this.customMessageModal = 'ask';
    this.customMessageText = '';
  }

  closeMessageModal() {
    this.customMessageModal = 'closed';
    this.productToAdd = null;
  }

  handleMessageChoice(wantsMessage: boolean) {
    if (wantsMessage) {
      this.customMessageModal = 'input';
    } else {
      this.finalizeAddToCart(undefined);
    }
  }

  submitCustomMessage() {
    this.finalizeAddToCart(this.customMessageText);
  }

  finalizeAddToCart(message?: string) {
    if (!this.productToAdd) return;
    const product = this.productToAdd;

    this.closeMessageModal();

    const cartItem: CartItem = {
      id: product.id,
      name: product.name,
      price: product.price,
      quantity: 1,
      imageUrl: product.imageUrl || this.defaultImg,
      customMessage: message
    };

    const existing = this.cartItems.find(i => i.id === cartItem.id && i.customMessage === cartItem.customMessage);
    if (existing) {
      existing.quantity += 1;
    } else {
      this.cartItems = [...this.cartItems, cartItem];
    }

    this.saveCart();
    this.triggerPulse();
  }
}
