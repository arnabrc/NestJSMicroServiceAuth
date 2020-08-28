import { Controller, UseGuards, Post, Req, Request, Logger, UseFilters, UnauthorizedException } from '@nestjs/common';
import { AuthService } from '../../services/auth/auth.service';
import { LocalAuthGuard } from '../../guards/local-auth.guard';
import { MessagePattern } from '@nestjs/microservices';
import { HttpExceptionFilter } from '../../filters/http-exception.filter';
import { LocalStrategy } from '../../strategies/local.strategy';

@Controller('auth')
@UseFilters(new HttpExceptionFilter())
export class AuthController {
    constructor(
        private readonly authService: AuthService
    ) { }

    @UseGuards(LocalAuthGuard)
    @Post('login')
    async login(@Request() req) {
        console.log('req: ', req.body);
        return this.authService.login(req.body);
    }

    @MessagePattern({ role: 'auth', cmd: 'check' })
    async loggedIn(data) {
        try {
            const res = this.authService.validateToken(data.jwt);
            return res;
        } catch (e) {
            Logger.log(e);
            return false;
        }
    }

    /*
        @Post('logout')
    @UseInterceptors(AuthorizeInterceptor)
    async logout(@ReqUser() user: User): Promise<{ status: number }> {
        return this.authService.logout(user) as any;
    }

    @Post('signin')
    async signin(@Body() user: signinRequest): Promise<any> {
        return this.authService.changePassword(user);
    }

    @UseInterceptors(GetUserAuthenticatedInterceptor)
    @Get('getUserAuthenticated')
    async getUserAuthenticated(@ReqUser() user: User): Promise<User> {
        return user;
    }
    */
}
