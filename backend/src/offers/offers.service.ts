import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateOfferDto } from './dto/create-offer.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Offer } from './entities/offer.entity';
import { Repository } from 'typeorm';
import { WishesService } from '../wishes/wishes.service';
import { User } from '../users/entities/user.entity';

@Injectable()
export class OffersService {
  constructor(
    @InjectRepository(Offer)
    private offerRepository: Repository<Offer>,
    private readonly wishesService: WishesService,
  ) {}

  async createOffer(
    createOfferDto: CreateOfferDto,
    user: User,
  ): Promise<Offer> {
    const wishes = await this.wishesService.findOneWish(createOfferDto.itemId);
    const wish = await this.wishesService.findOneWish(wishes.id);
    const sum = wish.price - wish.raised;
    const newRise = Number(wish.raised) + Number(createOfferDto.amount);

    if (wish.owner.id === user.id) {
      throw new ForbiddenException('Поддержка своих подарков не возможна');
    }
    if (createOfferDto.amount > wish.price) {
      throw new ForbiddenException('Стоимость подарка ниже суммы поддержки');
    }

    if (createOfferDto.amount > sum) {
      throw new ForbiddenException(
        'Сумма поддержки превышает оставшуюся сумму',
      );
    }

    if (wish.raised === wish.price) {
      throw new ForbiddenException('Сумма на подарок собрана');
    }

    await this.wishesService.updateRise(createOfferDto.itemId, newRise);
    const offerDto = { ...createOfferDto, user: user, item: wish };
    return await this.offerRepository.save(offerDto);
  }

  async findOneOffer(id: number): Promise<Offer> {
    const offer = await this.offerRepository.findOneBy({ id });
    if (!offer) {
      throw new NotFoundException(`Не удалось найти заявку с id: ${id}`);
    }
    return offer;
  }

  async findManyOffer(): Promise<Offer[]> {
    return await this.offerRepository.find();
  }
}
