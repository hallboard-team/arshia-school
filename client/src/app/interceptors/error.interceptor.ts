import { isPlatformBrowser } from '@angular/common';
import { HttpErrorResponse, HttpInterceptorFn, HttpContextToken } from '@angular/common/http';
import { PLATFORM_ID, inject } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { NavigationExtras, Router } from '@angular/router';
import { catchError } from 'rxjs';

export const SKIP_ERROR_SNACKBAR = new HttpContextToken<boolean>(() => false);

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);
  const platformId = inject(PLATFORM_ID);
  const snack = inject(MatSnackBar);

  const isLoginCall = /\/account\/login$/i.test(req.url);

  return next(req).pipe(
    catchError((err: HttpErrorResponse) => {
      if (err) {
        const skip = req.context.get(SKIP_ERROR_SNACKBAR) || isLoginCall;

        switch (err.status) {
          case 400: {
            if (err.error?.errors) {
              const modelStateErrors: string[] = [];
              for (const key in err.error.errors) modelStateErrors.push(err.error.errors[key]);
              throw modelStateErrors;
            } else {
              if (!skip) {
                const msg = toFa(err);
                snack.open(msg, 'باشه', { horizontalPosition: 'center', verticalPosition: 'top', duration: 4000, panelClass: ['snack-error'], direction: 'rtl' });
              }
            }
            break;
          }

          case 401: {
            if (!skip) {
              const msg = toFa(err);
              snack.open(msg, 'باشه', { horizontalPosition: 'center', verticalPosition: 'top', duration: 4000, panelClass: ['snack-error'], direction: 'rtl' });
            }

            if (!isLoginCall) {
              if (isPlatformBrowser(platformId)) localStorage.clear();
              router.navigate(['account/login']);
            }
            break;
          }

          case 403:
            router.navigate(['/no-access']);
            break;

          case 404:
            router.navigate(['/not-found']);
            break;

          case 500: {
            const navigationExtras: NavigationExtras = { state: { error: err.error } };
            router.navigate(['/server-error'], navigationExtras);
            break;
          }

          default: {
            if (!skip) {
              const msg = toFa(err);
              snack.open(msg, 'باشه', { horizontalPosition: 'center', verticalPosition: 'top', duration: 4000, panelClass: ['snack-error'], direction: 'rtl' });
            }
            console.log(err);
            break;
          }
        }
      }
      throw err;
    })
  );
};

function toFa(err: HttpErrorResponse): string {
  const status = err?.status;

  let rawStr = '';
  const e = err?.error;
  if (typeof e === 'string') {
    rawStr = e;
  } else if (e && typeof e === 'object') {
    rawStr = (e as any).message || (e as any).title || (e as any).detail || (e as any).error || '';
  }
  if (!rawStr) {
    rawStr = err?.message || '';
  }
  const raw = rawStr.toLowerCase();

  // مپ وضعیت‌ها
  if (status === 0) return 'عدم دسترسی به سرور. اینترنت خود را بررسی کنید.';
  if (status === 401) return 'ایمیل یا رمز عبور نادرست است';
  if (status === 403) return 'اجازه دسترسی ندارید.';
  if (status === 404) return 'موردی یافت نشد.';
  if (status === 409) return 'این ایمیل قبلاً ثبت شده است.';
  if (status === 422) return 'اطلاعات واردشده معتبر نیست.';

  // مپ متن‌های رایج
  if (raw.includes('wrong email or password')) return 'ایمیل یا رمز عبور نادرست است';
  if (raw.includes('e11000') || raw.includes('duplicate') || raw.includes('unique') || (raw.includes('email') && raw.includes('exist')))
    return 'این ایمیل قبلاً ثبت شده است.';
  if (raw.includes('invalid') && raw.includes('email')) return 'ایمیل معتبر نیست.';

  return 'خطا رخ داد. لطفاً دوباره تلاش کنید.';
}