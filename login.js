const loginForm = document.querySelector('#login-form');
const messageBox = document.querySelector('[data-auth-message]');
const submitButton = loginForm?.querySelector('button[type="submit"]');

const API_BASE_URL = window.PRODEPAD_API_BASE_URL || '/api';

function setMessage(type, text) {
  if (!messageBox) return;
  messageBox.textContent = text;
  messageBox.classList.remove('auth__message--error', 'auth__message--success');
  if (type) {
    messageBox.classList.add(type === 'success' ? 'auth__message--success' : 'auth__message--error');
  }
}

async function handleLogin(event) {
  event.preventDefault();
  if (!loginForm || !submitButton) return;

  const formData = new FormData(loginForm);
  const username = formData.get('username')?.toString().trim();
  const password = formData.get('password')?.toString();

  if (!username || !password) {
    setMessage('error', 'Completá tu usuario y contraseña para continuar.');
    return;
  }

  submitButton.disabled = true;
  const originalLabel = submitButton.textContent;
  submitButton.textContent = 'Ingresando...';
  setMessage('', '');

  try {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ username, password }),
    });

    if (!response.ok) {
      const errorPayload = await response.json().catch(() => ({}));
      const errorMessage = errorPayload.message || 'No pudimos validar tus datos. Revisá el usuario o la contraseña.';
      throw new Error(errorMessage);
    }

    const result = await response.json();

    if (!result || typeof result !== 'object') {
      throw new Error('Respuesta inesperada del servidor. Intentá nuevamente.');
    }

    const { success, isActive, canBet, message } = result;

    if (!success) {
      throw new Error(message || 'Usuario o contraseña incorrectos.');
    }

    if (!isActive) {
      setMessage('error', 'Tu usuario todavía no está activo. Contactanos para habilitarlo.');
      return;
    }

    if (!canBet) {
      setMessage('error', 'Tu cuenta está activa pero aún no habilitada para apostar.');
      return;
    }

    setMessage('success', 'Ingreso correcto, redirigiendo a tus apuestas...');
    window.location.href = 'apuestas.html';
  } catch (error) {
    setMessage('error', error.message || 'Ocurrió un error inesperado. Intentá de nuevo.');
  } finally {
    if (submitButton) {
      submitButton.disabled = false;
      submitButton.textContent = originalLabel;
    }
  }
}

if (loginForm) {
  loginForm.addEventListener('submit', handleLogin);
}
