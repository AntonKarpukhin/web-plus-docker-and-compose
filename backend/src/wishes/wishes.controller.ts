import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Req,
} from '@nestjs/common';
import { WishesService } from './wishes.service';
import { CreateWishDto } from './dto/create-wish.dto';
import { UpdateWishDto } from './dto/update-wish.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { Wish } from './entities/wish.entity';

@Controller('wishes')
export class WishesController {
  constructor(private readonly wishesService: WishesService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  async create(
    @Body() createWishDto: CreateWishDto,
    @Req() req,
  ): Promise<Wish> {
    return this.wishesService.createWish(createWishDto, req?.user);
  }

  @Get('last')
  async getLast(): Promise<Wish[]> {
    return this.wishesService.findWish({ createdAt: 'DESC' }, 40);
  }

  @Get('top')
  async getTop(): Promise<Wish[]> {
    return this.wishesService.findWish({ copied: 'DESC' }, 20);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  async get(@Param('id') id: number): Promise<Wish> {
    return this.wishesService.findOneWish(id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  async update(
    @Param('id') id: number,
    @Body() updateWishDto: UpdateWishDto,
    @Req() req,
  ): Promise<Wish[]> {
    return this.wishesService.updateWish(id, updateWishDto, req.user.id);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  async delete(@Param('id') id: number, @Req() req): Promise<Wish> {
    return this.wishesService.deleteWish(id, req.user.id);
  }

  @Post(':id/copy')
  @UseGuards(JwtAuthGuard)
  async copy(@Param('id') id: number, @Req() req): Promise<Wish> {
    return this.wishesService.copyWish(id, req.user);
  }
}
