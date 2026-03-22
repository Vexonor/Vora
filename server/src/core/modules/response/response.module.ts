import { Global, Module } from "@nestjs/common";
import { ResponseHelper } from "src/core/helpers/response.helper";

@Global()
@Module({
  providers: [ResponseHelper],
  exports: [ResponseHelper]
})
export class ResponseModule {}