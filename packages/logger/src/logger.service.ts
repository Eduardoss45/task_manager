import { Inject, Injectable, LoggerService as NestLoggerService } from "@nestjs/common";
import { createLogger, Logger } from "winston";
import { buildWinstonConfig } from "./winston.config";

@Injectable()
export class LoggerService implements NestLoggerService {
  private readonly logger: Logger;

  constructor(
    @Inject("LOGGER_CONTEXT")
    private readonly context?: { service: string }
  ) {
    const service = this.context?.service ?? "unknown";
    this.logger = createLogger(buildWinstonConfig(service));
  }

  log(message: any, ...optionalParams: any[]) {
    this.logger.info(message, {
      context: optionalParams?.[0],
    });
  }

  error(message: any, trace?: string, context?: string) {
    this.logger.error(message, {
      context,
      trace,
    });
  }

  warn(message: any, context?: string) {
    this.logger.warn(message, { context });
  }

  debug(message: any, context?: string) {
    this.logger.debug(message, { context });
  }

  verbose(message: any, context?: string) {
    this.logger.verbose(message, { context });
  }

  info(message: string, meta?: any) {
    this.logger.info(message, meta);
  }
}
