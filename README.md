# ProdePad Landing

Landing page promocional para la app de pronósticos de pádel ProdePad.

Incluye una pantalla de login simple y un placeholder para la vista de apuestas.

## Base de datos

1. Ejecutá el script [`db/schema.sql`](db/schema.sql) sobre tu instancia de SQL Server 2018 (o superior). El script crea la
   base `ProdePad`, las tablas `Usuarios` y `Roles`, la `stored procedure` `dbo.AuthenticateUsuario` y un usuario de ejemplo
   (`demo.player` / `Demo1234!`).
2. Cuando necesites dar de alta nuevos jugadores podés replicar el insert del script ajustando el `HASHBYTES('SHA2_256',
   'tuPassword')` con la contraseña elegida.

## API de login

El proyecto incluye una API mínima en `server/` para validar credenciales contra SQL Server.

1. Copiá `server/.env.example` a `server/.env` y completá tus datos de conexión.
2. Instalá las dependencias desde la carpeta `server`:

   ```bash
   npm install
   ```

3. Iniciá el servidor (por defecto en `http://localhost:3000`):

   ```bash
   npm run dev
   ```

4. El endpoint de autenticación espera `POST /api/auth/login` con `{ username, password }` y responde el estado de la cuenta
   (`isActive`, `canBet`, `role`).

## Ejecutar

Abrí `index.html` en tu navegador preferido para ver la landing page.

Para probar el flujo de acceso manual:

1. Abrí `login.html` e ingresá las credenciales que cargues en tu backend.
2. El formulario realiza un `POST` a `/api/auth/login` (podés sobrescribir `window.PRODEPAD_API_BASE_URL` si exponés otro endpoint).
3. Si la respuesta indica que el usuario está activo y puede apostar, redirige a `apuestas.html`, una vista placeholder que después podrás completar.
