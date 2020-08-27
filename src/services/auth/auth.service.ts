import { timeout, catchError } from 'rxjs/internal/operators';
import { JwtService } from '@nestjs/jwt';
import { ClientProxy } from '@nestjs/microservices';
import { Inject, RequestTimeoutException, Logger, Injectable } from '@nestjs/common';
import { TimeoutError, throwError } from 'rxjs';
import { compareSync } from 'bcrypt';

@Injectable()
export class AuthService {
    
    constructor(
        @Inject('USER_CLIENT') private readonly client: ClientProxy,
        private readonly jwtService: JwtService
    ) { }

    async validateUser(username: string, password: string): Promise<any> {
        try {
            const user = await this.client.send({ role: 'user', cmd: 'get login' }, { username })
                .pipe(
                    timeout(5000),
                    catchError(err => {
                        if (err instanceof TimeoutError) {
                            return throwError(new RequestTimeoutException());
                        }
                        return throwError(err);
                    }), )
                .toPromise();
            
            if (compareSync(password, user?.password)) {
                return user;
            }

            return null;
        } catch (e) {
            Logger.log(e);
            throw e;
        }
    }

    async login(user) {
        const payload = { user, sub: user.id };
        
        return {
            // userId: user.id,
            // accessToken: this.jwtService.sign(payload),
            idToken: this.jwtService.sign(payload),
            expiresIn: 30
        };
    }

    validateToken(jwt: string) {
        return this.jwtService.verify(jwt);
    }
}