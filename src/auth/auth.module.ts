import { Module } from "@nestjs/common";
import { ClientsModule, Transport } from "@nestjs/microservices";
import { JwtModule } from '@nestjs/jwt';
import constants from "../constants/constants";
import { ConfigModule } from '@nestjs/config';
import { JwtStrategy } from "../strategies/jwt.strategy";
import { AuthController } from "../controllers/auth/auth.controller";
import { AuthService } from "../services/auth/auth.service";
import { LocalStrategy } from "../strategies/local.strategy";
import { APP_FILTER } from "@nestjs/core";
import { HttpExceptionFilter } from "../filters/http-exception.filter";
import { PassportModule } from "@nestjs/passport";

@Module({
    imports: [
        ConfigModule.forRoot(),
        ClientsModule.register([{
        name: 'USER_CLIENT',
        transport: Transport.TCP,
        options: {
            host: 'localhost',
            port: 4010,
        }
    }]), 
    PassportModule,
    /* PassportModule.register({
        defaultStrategy: 'jwt',
        property: 'user',
        session: false, 
    }), */
    JwtModule.register({
        secret: constants.jwtSecret,
        signOptions: { expiresIn: '30s' }
    })],
    providers: [
        AuthService,
        LocalStrategy,
        JwtStrategy,
        {
            provide: APP_FILTER,
            useClass: HttpExceptionFilter,
        }
    ],
    controllers: [AuthController],
})
export class AuthModule { }