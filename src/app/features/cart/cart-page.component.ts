import { Component } from '@angular/core';
import { ReactWrapperComponent } from '../../react-host/react-wrapper.component';
import { ShoppingCart } from '../../react-host/components/ShoppingCart';

@Component({
  selector: 'app-cart-page',
  standalone: true,
  imports: [ReactWrapperComponent],
  template: `
    <div style="padding-top: 2rem;">
      <app-react-host 
        [reactComponent]="ShoppingCartComponent" 
        [props]="{ apiBaseUrl: 'https://mi-ecommerce-api.onrender.com/api' }">
      </app-react-host>
    </div>
  `
})
export class CartPageComponent {
  ShoppingCartComponent = ShoppingCart;
}
