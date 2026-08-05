import { HttpInterceptorFn, HttpRequest, HttpHandlerFn } from '@angular/common/http'
import { Observable } from 'rxjs'
import { HttpEvent } from '@angular/common/http'

export const jwtInterceptor: HttpInterceptorFn = (
  req: HttpRequest<unknown>,
  next: HttpHandlerFn
): Observable<HttpEvent<unknown>> => {

  const token = localStorage.getItem('token')

  if (token) {
    const authReq = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    })
    return next(authReq)
  }

  return next(req)
}