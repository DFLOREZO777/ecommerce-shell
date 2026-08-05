import { Routes } from '@angular/router';
import { StoreComponent } from './features/store/store.component';
import { CartPageComponent } from './features/cart/cart-page.component';
import { AdminPageComponent } from './features/admin/admin-page.component';

export const routes: Routes = [
  { path: '', component: StoreComponent },
  { path: 'cart', component: CartPageComponent },
  { path: 'admin', component: AdminPageComponent },
  { path: '**', redirectTo: '' }
];
