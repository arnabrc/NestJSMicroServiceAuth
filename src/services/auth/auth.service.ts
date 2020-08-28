import { timeout, catchError } from 'rxjs/internal/operators';
import { JwtService } from '@nestjs/jwt';
import { ClientProxy } from '@nestjs/microservices';
import { Inject, RequestTimeoutException, Logger, Injectable, UnauthorizedException } from '@nestjs/common';
import { TimeoutError, throwError } from 'rxjs';
import { compareSync, hash } from 'bcrypt';

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
            
            // if (compareSync(password, user?.password)) {
            if (user && (password === user[0].password)) {
                return user;
            } else {
                return null;
            }
        } catch (e) {
            Logger.log(e);
            throw e;
        }
    }

    async login(user) {
        // const payload = { user, sub: user.id };
        // const password = await hash(user.password, 10);
        const validUser = await this.validateUser(user.username, user.password);
        if (!validUser) {
            throw new UnauthorizedException();
        } else {
            const payload = { username: user.username, password: user.password };

            return {
                // accessToken: this.jwtService.sign(payload),
                userId: validUser[0]._id,
                idToken: this.jwtService.sign(payload),
                expiresIn: 30,
                userRole: validUser[0].role,
            };
        }
    }

    validateToken(jwt: string) {
        return this.jwtService.verify(jwt);
    }
}