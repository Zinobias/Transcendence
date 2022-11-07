import {
  Injectable,
  CanActivate,
  ExecutionContext,
  Inject,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { FrontEndDTO } from './api.gateway';
import { Auth } from './auth.service';


@Injectable()
export class AuthGuard implements CanActivate {
  constructor(@Inject(Auth) private auth: Auth) {}

  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const request = context.switchToWs().getData();
	console.log(request);
	console.log("Went through auth");
	console.log("Request data : {" + request.msg + "}");
    return this.validateRequest(request);
  }

  validateRequest(request: FrontEndDTO): boolean {
    return this.auth.checkAuth(request.userId, request.token);
  }
}
