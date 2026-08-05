import { Component } from '@angular/core';
import { ReactWrapperComponent } from '../../react-host/react-wrapper.component';
import { AdminPanel } from '../../react-host/components/AdminPanel';

@Component({
  selector: 'app-admin-page',
  standalone: true,
  imports: [ReactWrapperComponent],
  template: `
    <div style="padding-top: 2rem; min-height: 80vh; background: #f0f2f5;">
      <app-react-host 
        [reactComponent]="AdminPanelComponent" 
        [props]="{ apiBaseUrl: 'https://mi-ecommerce-api.onrender.com/api' }">
      </app-react-host>
    </div>
  `
})
export class AdminPageComponent {
  AdminPanelComponent = AdminPanel;
}
