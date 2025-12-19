import { Module, DynamicModule, Global } from "@nestjs/common";
import { LoggerService } from "./logger.service";

@Global()
@Module({})
export class LoggerModule {
  static forRoot(context: { service: string }): DynamicModule {
    return {
      module: LoggerModule,
      providers: [
        {
          provide: "LOGGER_CONTEXT",
          useValue: context,
        },
        LoggerService,
      ],
      exports: [LoggerService],
    };
  }
}
