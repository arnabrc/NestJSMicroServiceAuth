import {PassportStrategy} from '@nestjs/passport';
import { Injectable, UnauthorizedException } from "@nestjs/common";
import { Strategy } from 'passport-local';
import { AuthService } from '../services/auth/auth.service';
import { ModuleRef } from '@nestjs/core';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
    constructor(private readonly authService: AuthService, private moduleRef: ModuleRef) {
        super();
    }

    async validate(username: string, password: string): Promise<any> {
        console.log('validate: ', username);
        const user = await this.authService.validateUser(username, password);

        if (!user) {
            throw new UnauthorizedException();
        }

        return user;
    }
}