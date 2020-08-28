import { timeout, catchError } from 'rxjs/internal/operators';
import { JwtService } from '@nestjs/jwt';
import { ClientProxy } from '@nestjs/microservices';
import { Inject, RequestTimeoutException, Logger, Injectable, UnauthorizedException } from '@nestjs/common';
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
            console.log('try user: ', user);
            
            if (user && compareSync(password, user.password)) {
                return user;
            }

            return null;
        } catch (e) {
            Logger.log(e);
            throw e;
        }
    }

    async login(user) {
        // const payload = { user, sub: user.id };
        console.log('user: ', user.username);
        const validUser = this.validateUser(user.username, user.password);
        console.log('validUser: ', validUser);
        if (!validUser) {
            console.log('No: ', validUser);
            throw new UnauthorizedException();
        } else {
            console.log('Yes: ', validUser);
            const payload = { username: user.username, password: user.password };

            return {
                // userId: user.id,
                // accessToken: this.jwtService.sign(payload),
                idToken: this.jwtService.sign(payload),
                expiresIn: 30
            };
        }
    }

    validateToken(jwt: string) {
        return this.jwtService.verify(jwt);
    }
}