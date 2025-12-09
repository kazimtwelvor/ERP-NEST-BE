import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../../user/entities/user.entity';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private configService: ConfigService,
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get('JWT_SECRET') || 'secret',
    });
  }

  async validate(payload: any) {
    // Load user with role and permissions
    const user = await this.userRepository.findOne({
      where: { id: payload.sub },
      relations: ['role', 'role.permissions', 'department'],
      select: [
        'id',
        'email',
        'firstName',
        'lastName',
        'status',
        'isEmailVerified',
        'role',
        'department',
      ],
    });

    if (!user) {
      return null;
    }

    // Extract permission names from role
    const permissions = user.role?.permissions?.map((p) => p.name) || [];

    return {
      userId: user.id,
      email: user.email,
      user,
      permissions,
    };
  }
}