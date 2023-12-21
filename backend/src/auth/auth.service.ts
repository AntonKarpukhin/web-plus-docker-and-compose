import { ConflictException, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { HashService } from '../hash/hash.service';
import { User } from '../users/entities/user.entity';

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly usersService: UsersService,
    private readonly hashService: HashService,
  ) {}

  async create(createUserDto: CreateUserDto) {
    const userByName = await this.usersService.findOne(
      'username',
      createUserDto.username,
    );

    const userByEmail = await this.usersService.findOne(
      'email',
      createUserDto.email,
    );

    if (userByName || userByEmail)
      throw new ConflictException('Пользователь уже зарегистрирован');

    return this.usersService.createUser(createUserDto);
  }

  async validateUser(username: string, password: string): Promise<User> {
    const existUser = await this.usersService.findOne('username', username);

    if (!existUser) return null;

    return existUser;
  }

  async login(user: User) {
    const { id, username, email } = user;
    return {
      id,
      username,
      email,
      access_token: this.jwtService.sign({
        id: user.id,
        username: user.username,
      }),
    };
  }
}
