import { format, transports } from "winston";

export function buildWinstonConfig(service: string) {
  return {
    level: process.env.LOG_LEVEL ?? "info",
    format: format.combine(
      format.timestamp(),
      format.json(),
      format.metadata({ fillExcept: ["message", "level", "timestamp"] })
    ),
    defaultMeta: {
      service,
    },
    transports: [new transports.Console()],
  };
}
