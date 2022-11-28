import {CanActivate, ExecutionContext, Inject, Injectable, Logger,} from '@nestjs/common';
import {Observable} from 'rxjs';
import {TwoFactorAuthService} from './2fa.service';
import {FrontEndDTO} from './api.gateway';
import {Auth} from './auth.service';

@Injectable()
export class AuthGuard implements CanActivate {
    private logger = new Logger('AuthGuard');

    constructor(
        @Inject(Auth) private auth: Auth,
        @Inject(TwoFactorAuthService) private TFA: TwoFactorAuthService) {
    }

    canActivate(context: ExecutionContext): boolean | Promise<boolean> | Observable<boolean> {
        const request = context.switchToWs().getData();
        this.logger.debug(`Auth request data: [${request.userId}], [${request.authToken}]`);

        return this.validateRequest(request);
    }

    validateRequest(request: FrontEndDTO): boolean {
        if (request.userId === undefined || request.authToken === undefined)
            return false;
        let validateResult = this.auth.validate(request.userId, request.authToken);
        this.logger.debug(`Validate result is: [${validateResult}]`);
        // TODO : implement this TFA stuff.
        // if (this.TFA.hasTwoFA === true) {
        // 	this.TFA.verify(request.userId, request.TFAToken);
        // }

        return validateResult;
    }
}
