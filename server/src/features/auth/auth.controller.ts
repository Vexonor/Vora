import { Body, Controller, Get, Patch, Post, Request, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from 'src/core/guards/jwt-auth.guard';
import { LocalAuthGuard } from 'src/core/guards/local-auth.guard';
import { JoiValidationPipe } from 'src/core/validators/joi-validation.pipe';
import { AuthService } from './auth.service';
import { ChangePasswordDto } from './dto/change-password.dto';
import { CreateUserDto } from './dto/create-user.dto';
import { changePasswordSchema } from './validations/request/change-password.request';
import { registerSchema } from './validations/request/register.request';

@Controller()
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @UseGuards(LocalAuthGuard)
  @Post('login')
  login(@Request() req) {
    return this.authService.login(req.user);
  }

  @UseGuards(JwtAuthGuard)
  @Post('register')
  register(
    @Body(new JoiValidationPipe(registerSchema)) createUserDto: CreateUserDto,
    @Request() req,
  ) {
    return this.authService.register(createUserDto, req.user);
  }

  @UseGuards(JwtAuthGuard)
  @Get('me')
  getMe(@Request() req) {
    return this.authService.getMe(req.user);
  }

  @UseGuards(JwtAuthGuard)
  @Patch('change-password')
  changePassword(
    @Body(new JoiValidationPipe(changePasswordSchema)) dto: ChangePasswordDto,
    @Request() req,
  ) {
    return this.authService.changePassword(dto, req.user);
  }
}
