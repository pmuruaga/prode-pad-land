import sql from 'mssql';

const sqlConfig = {
  server: process.env.SQL_SERVER || 'localhost',
  database: process.env.SQL_DATABASE || 'ProdePad',
  user: process.env.SQL_USER,
  password: process.env.SQL_PASSWORD,
  port: parseInt(process.env.SQL_PORT || '1433', 10),
  options: {
    encrypt: process.env.SQL_ENCRYPT === 'true',
    trustServerCertificate: process.env.SQL_TRUST_SERVER_CERT === 'true'
  },
  pool: {
    min: 0,
    max: 10,
    idleTimeoutMillis: 30000
  }
};

const pool = new sql.ConnectionPool(sqlConfig);
const poolConnect = pool
  .connect()
  .then(() => console.log('Pool de conexiones SQL inicializado'))
  .catch((error) => {
    console.error('No se pudo inicializar el pool de conexiones SQL:', error);
    throw error;
  });

export async function getPool() {
  await poolConnect;
  return pool;
}

export { sql };

const gracefulShutdown = async () => {
  try {
    await pool.close();
  } catch (error) {
    console.error('Error al cerrar el pool SQL:', error);
  } finally {
    process.exit(0);
  }
};

process.on('SIGINT', gracefulShutdown);
process.on('SIGTERM', gracefulShutdown);
