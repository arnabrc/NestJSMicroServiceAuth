import { Injectable } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { Strategy } from "passport-local";
import { ExtractJwt } from "passport-jwt";
import { ConfigService } from "@nestjs/config";
import constants from "../constants/constants";

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(configService: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: constants.jwtSecret
    });
  }

  async validate(payload) {
    console.log('payload: ', payload);
    // return { id: payload.sub, user: payload.user};
    return { username: payload.username, password: payload.password };
  }
}