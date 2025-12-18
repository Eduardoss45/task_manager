| Endpoint              | Use DTO? | Comentário                    |
| --------------------- | -------- | ----------------------------- |
| POST /register        | ✅        | Já usa `RegisterDto`          |
| POST /login           | ✅        | Já usa `LoginDto`             |
| POST /forgot-password | ✅        | Criar `ForgotPasswordDto`     |
| POST /reset-password  | ✅        | Criar `ResetPasswordDto`      |
| GET /users            | ❌        | Não precisa de DTO            |
| POST /refresh         | ❌        | Input vem do cookie, não body |
