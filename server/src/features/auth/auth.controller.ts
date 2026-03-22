import { Body, Controller, Post, Request, UseGuards } from '@nestjs/common';
import { LocalAuthGuard } from 'src/core/guards/local-auth.guard';
import { JoiValidationPipe } from 'src/core/validators/joi-validation-pipe.param';
import { AuthService } from './auth.service';
import { CreateUserDto } from './dto/create-user.dto';
import { registerSchema } from './validations/request/register.request';

@Controller()
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @UseGuards(LocalAuthGuard)
  @Post('login')
  login(@Request() req) {
    return this.authService.login(req.user)
  }


  @Post('register')
  register(@Body(new JoiValidationPipe(registerSchema)) createUserDto: CreateUserDto) {
    return this.authService.register(createUserDto);
  }
}
