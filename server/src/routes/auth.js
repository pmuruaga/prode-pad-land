import { Router } from 'express';
import crypto from 'node:crypto';
import { getPool, sql } from '../db.js';

const router = Router();

function hashPassword(password) {
  return crypto.createHash('sha256').update(password, 'utf8').digest();
}

router.post('/login', async (req, res) => {
  const username = req.body?.username?.trim();
  const password = req.body?.password;

  if (!username || !password) {
    return res.status(400).json({
      success: false,
      message: 'Debés ingresar usuario y contraseña.'
    });
  }

  try {
    const pool = await getPool();
    const result = await pool
      .request()
      .input('Username', sql.NVarChar(100), username)
      .execute('dbo.AuthenticateUsuario');

    const record = result.recordset?.[0];

    if (!record) {
      return res.status(401).json({
        success: false,
        message: 'Usuario o contraseña incorrectos.'
      });
    }

    const passwordHash = record.PasswordHash;
    const providedHash = hashPassword(password);

    if (!passwordHash || !Buffer.isBuffer(passwordHash) || !passwordHash.equals(providedHash)) {
      return res.status(401).json({
        success: false,
        message: 'Usuario o contraseña incorrectos.'
      });
    }

    const responsePayload = {
      success: true,
      username: record.Username,
      role: record.RoleName,
      isActive: Boolean(record.IsActive),
      canBet: Boolean(record.CanBet),
      message: undefined,
      token: undefined
    };

    if (!responsePayload.isActive) {
      responsePayload.message = 'Tu usuario todavía no está activo. Contactá al administrador para habilitarlo.';
      return res.json(responsePayload);
    }

    if (!responsePayload.canBet) {
      responsePayload.message = 'Tu cuenta está activa pero no tiene permiso para apostar aún.';
      return res.json(responsePayload);
    }

    const sessionToken = crypto.randomBytes(32).toString('hex');
    responsePayload.token = sessionToken;
    responsePayload.message = 'Ingreso correcto.';

    await pool
      .request()
      .input('UsuarioId', sql.Int, record.UsuarioId)
      .query('UPDATE dbo.Usuarios SET LastLoginAt = SYSUTCDATETIME() WHERE UsuarioId = @UsuarioId;');

    res.json(responsePayload);
  } catch (error) {
    console.error('Error en login:', error);
    res.status(500).json({
      success: false,
      message: 'Ocurrió un error inesperado. Intentalo nuevamente.'
    });
  }
});

export default router;
