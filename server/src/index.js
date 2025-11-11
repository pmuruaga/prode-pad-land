import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRouter from './routes/auth.js';

dotenv.config();

const app = express();
const port = parseInt(process.env.API_PORT || '3000', 10);

const allowedOrigins = (process.env.API_ALLOWED_ORIGINS || '')
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);

app.use(
  cors({
    origin(origin, callback) {
      if (!origin || allowedOrigins.length === 0 || allowedOrigins.includes(origin)) {
        callback(null, origin);
      } else {
        callback(new Error('Origen no permitido por CORS'));
      }
    },
    credentials: true
  })
);

app.use(express.json());

app.get('/api/health', (_, res) => {
  res.json({ status: 'ok' });
});

app.use('/api/auth', authRouter);

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Endpoint no encontrado'
  });
});

// Manejador básico de errores
app.use((err, req, res, next) => {
  if (err?.message === 'Origen no permitido por CORS') {
    return res.status(403).json({ success: false, message: err.message });
  }

  console.error('Error no manejado:', err);
  return res.status(500).json({ success: false, message: 'Error interno del servidor' });
});

app.listen(port, () => {
  console.log(`API de ProdePad escuchando en http://localhost:${port}`);
});
