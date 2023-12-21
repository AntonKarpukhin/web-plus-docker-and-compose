import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Like, Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { HashService } from '../hash/hash.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { TUser } from '../utils/base.types';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
    private readonly hashService: HashService,
  ) {}

  async findOne(key: string, param: any): Promise<User> {
    return await this.usersRepository.findOneBy({ [key]: param });
  }

  async findProfile(username: string): Promise<User> {
    return await this.usersRepository.findOne({
      where: {
        username: username,
      },
    });
  }

  async findEmail(email: string): Promise<User> {
    return await this.usersRepository.findOneBy({ email });
  }

  async createUser(createUserDto: CreateUserDto): Promise<User> {
    const username = await this.findProfile(createUserDto.username);
    const email = await this.findEmail(createUserDto.email);
    if (username !== null) {
      throw new ForbiddenException(
        'Пользователь с таким именем уже существует',
      );
    }
    if (email) {
      throw new ForbiddenException(
        'Пользователь с таким e-mail уже существует',
      );
    }
    createUserDto.password = this.hashService.getHash(createUserDto?.password);
    const user = this.usersRepository.create(createUserDto);
    return await this.usersRepository.save(user);
  }

  async updateUser(user: User, updateUserDto: UpdateUserDto): Promise<TUser> {
    const { id } = user;
    const { email, username } = updateUserDto;
    if (updateUserDto.password) {
      updateUserDto.password = this.hashService.getHash(updateUserDto.password);
    }
    const isExist = !!(await this.usersRepository.findOne({
      where: [{ email }, { username }],
    }));
    if (isExist) {
      throw new ConflictException(
        'Пользователь с таким email или username уже зарегистрирован',
      );
    }
    try {
      await this.usersRepository.update(id, updateUserDto);
      const { password, ...updUser } = await this.usersRepository.findOneBy({
        id,
      });
      return updUser;
    } catch (err) {
      throw new BadRequestException(
        'Пользователь может редактировать только свой профиль',
      );
    }
  }

  async findWishes(id: number): Promise<User[]> {
    return await this.usersRepository.find({
      relations: { wishes: true },
      where: { id },
    });
  }

  async findMany(query: string): Promise<User[]> {
    return await this.usersRepository.find({
      where: [{ email: Like(`%${query}%`) }, { username: Like(`%${query}%`) }],
    });
  }
}
