# React + Vite

## Password reset email

The API sends password reset links through SMTP. Configure these values for the API process using .NET environment variables or user secrets (double underscores map to configuration sections):

- `Email__SmtpHost`
- `Email__Port` (typically `587`)
- `Email__EnableSsl` (`true`)
- `Email__Username`
- `Email__Password`
- `Email__From`
- `Email__FrontendBaseUrl` (for local development, `http://localhost:5173`)

For local development, from `Whistleblowing.Api`, set the SMTP values with `dotnet user-secrets set "Email:SmtpHost" "your-smtp-host"` and the corresponding `Email:Port`, `Email:EnableSsl`, `Email:Username`, `Email:Password`, `Email:From`, and `Email:FrontendBaseUrl` keys. Use an app password where the mail provider requires one. Keep SMTP credentials out of source control. The API reports an explicit configuration/send error when delivery is unavailable; failed reset links are invalidated, and successful links expire after 30 minutes and can only be used once.

This template provides a minimal setup to get React working in Vite with HMR and some Oxlint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the Oxlint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and Oxlint's TypeScript related rules in your project.
