import { RouterModule } from "@nestjs/core";
import { AuthModule } from "src/features/auth/auth.module";

export default RouterModule.register([
  {
    path: '/learn',
    children: [
        {
            path: 'auth',
            module: AuthModule
        }
    ]
  }
])