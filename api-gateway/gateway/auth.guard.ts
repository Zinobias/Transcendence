import {
  Injectable,
  CanActivate,
  ExecutionContext,
  Inject,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { FrontEndDTO } from './src/api.gateway';
import { Auth } from './src/auth.service';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(@Inject(Auth) private auth: Auth) {}

  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const request = context.switchToHttp().getRequest();
    return this.validateRequest(request);
  }

  validateRequest(request: FrontEndDTO): boolean {
    return this.auth.checkAuth(request.userId, request.token);
  }
}
