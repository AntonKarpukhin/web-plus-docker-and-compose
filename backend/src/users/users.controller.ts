import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Req,
  UseGuards,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { WishesService } from '../wishes/wishes.service';
import { TUser } from '../utils/base.types';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { Wish } from '../wishes/entities/wish.entity';

@Controller('users')
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    private readonly wishesService: WishesService,
  ) {}

  @Get('me')
  @UseGuards(JwtAuthGuard)
  async getOneMe(@Req() req): Promise<TUser> {
    const { password, ...rest } = await this.usersService.findOne(
      'id',
      req.user.id,
    );
    return rest;
  }

  @Patch('me')
  @UseGuards(JwtAuthGuard)
  async update(@Req() req, @Body() body): Promise<TUser> {
    return this.usersService.updateUser(req.user, body);
  }

  @Get('me/wishes')
  @UseGuards(JwtAuthGuard)
  async getOneWishes(@Req() req): Promise<Wish[]> {
    const users = await this.usersService.findWishes(req.user.id);
    const wishes = users.map((user) => user.wishes);
    return wishes[0];
  }

  @Get(':username/wishes')
  @UseGuards(JwtAuthGuard)
  async getUsersWishes(@Param('username') username): Promise<Wish[]> {
    return this.wishesService.findMany('owner', { username });
  }

  @Get(':username')
  @UseGuards(JwtAuthGuard)
  async getUser(@Param('username') username): Promise<TUser> {
    return this.usersService.findOne('username', username);
  }

  @Post('find')
  @UseGuards(JwtAuthGuard)
  async findMany(@Body('query') query: string): Promise<TUser[]> {
    return this.usersService.findMany(query);
  }
}
