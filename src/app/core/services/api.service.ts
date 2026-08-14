import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Product } from '../models/Product';
import { Order } from '../models/Order';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private baseUrl = 'https://ecommerce-api-nameless-brook-1050.fly.dev/api';

  constructor(private http: HttpClient) { }

  // Productos
  getProducts(): Observable<Product[]> {
    return this.http.get<Product[]>(`${this.baseUrl}/products`);
  }

  // Ordenes
  createOrder(orderData: any): Observable<{ message: string, orderId: string, trackingCode: string }> {
    return this.http.post<any>(`${this.baseUrl}/orders`, orderData);
  }

  trackOrder(code: string): Observable<Order> {
    return this.http.get<Order>(`${this.baseUrl}/orders/track/${code}`);
  }

  getAllOrders(): Observable<Order[]> {
    return this.http.get<Order[]>(`${this.baseUrl}/orders`);
  }

  updateOrderStatus(id: string, status: string): Observable<Order> {
    return this.http.put<Order>(`${this.baseUrl}/orders/${id}/status`, { status });
  }
}
