# ProdePad Landing

Landing page promocional para la app de pronósticos de pádel ProdePad.

Incluye una pantalla de login simple y un placeholder para la vista de apuestas.

## Ejecutar

Abrí `index.html` en tu navegador preferido para ver la landing page.

Para probar el flujo de acceso manual:

1. Abrí `login.html` e ingresá las credenciales que cargues en tu backend.
2. El formulario realiza un `POST` a `/api/auth/login` (podés sobrescribir `window.PRODEPAD_API_BASE_URL` si exponés otro endpoint).
3. Si la respuesta indica que el usuario está activo y puede apostar, redirige a `apuestas.html`, una vista placeholder que después podrás completar.
