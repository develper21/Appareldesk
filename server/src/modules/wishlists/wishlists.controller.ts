import { Body, Controller, Delete, Get, HttpCode, Param, Post, UseGuards } from '@nestjs/common';
import { WishlistsService } from './wishlists.service';
import { AddWishlistItemDto } from './dto/wishlist.dto';
import { JwtAuthGuard, JwtPayload } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@Controller('wishlist')
@UseGuards(JwtAuthGuard)
export class WishlistsController {
  constructor(private readonly wishlistsService: WishlistsService) {}

  /** Full wishlist for the signed-in user, with product details populated */
  @Get()
  findMyWishlist(@CurrentUser() user: JwtPayload) {
    return this.wishlistsService.findAllFor(user.sub);
  }

  /** Add (idempotent upsert) */
  @Post()
  add(@CurrentUser() user: JwtPayload, @Body() dto: AddWishlistItemDto) {
    return this.wishlistsService.add(user.sub, dto);
  }

  /** Heart toggle — add or remove, returns the new state */
  @Post('toggle')
  @HttpCode(200)
  toggle(@CurrentUser() user: JwtPayload, @Body() dto: AddWishlistItemDto) {
    return this.wishlistsService.toggle(user.sub, dto);
  }

  /** Remove a single product from the wishlist */
  @Delete(':productId')
  @HttpCode(200)
  remove(@CurrentUser() user: JwtPayload, @Param('productId') productId: string) {
    return this.wishlistsService.remove(user.sub, productId);
  }

  /** Empty the whole wishlist */
  @Delete()
  clear(@CurrentUser() user: JwtPayload) {
    return this.wishlistsService.clear(user.sub);
  }
}
