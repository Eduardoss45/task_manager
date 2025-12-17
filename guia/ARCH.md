# Processo

Tenho no maximo 3 dias para fazer isso, caso não de tempo salte.

## Organizar

```bash
api-gateway -> auth-service -> task-service -> notifications-service
```

## Implemente

- Winston
- Testes Unitários
- Swagger/OpenAPI (**dtos, controllers**)
- Docker

## Diretórios

```bash
modules/
└── tasks/
├── tasks.module.ts
├── controllers/
├── services/
├── repositories/
└── entities/
```

## Nomes de arquivos

```bash
auth.controller.ts
auth.service.ts
password-reset.service.ts
user.repository.ts
password-reset.entity.ts
```

## Dtos + Controllers

```js
@Post('change-password')
changePassword(
  @Body() dto: ChangePasswordDto,
  @Req() req: any,
) {
  const command: ChangePasswordCommand = {
    userId: req.user.id,
    oldPassword: dto.oldPassword,
    newPassword: dto.newPassword,
  };

  return this.authService.changePassword(command);
}
```

## Interfaces

```js
export interface ChangePasswordCommand {
  userId: string;
  oldPassword: string;
  newPassword: string;
}
```

## Services

```js
@Injectable()
export class AuthService {
    ...
  async changePassword(command: ChangePasswordCommand) {
    const { userId, oldPassword, newPassword } = command;
    ...
}
```

### Documentar

- Melhorias:
  - Validação de Variáveis de Ambiente com Joi
  - Nodemailer ou similares para envio de emails
  - Redis para armazenar cache
  - Sistema de calendario no frontend- Contexto por módulo / caso de uso (logs)
  - CorrelationId por request (logs)
  - Integração com observabilidade (ELK / Loki) (logs)

- Informações:
  - Fluxo de health-checks