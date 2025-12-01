const mysql = require('mysql2/promise');
require('dotenv').config({ path: '.env.local' });

const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  port: parseInt(process.env.DB_PORT || '3306'),
  multipleStatements: true
};

async function initializeDatabase() {
  let connection;
  
  try {
    console.log('🔄 Conectando a MySQL...');
    connection = await mysql.createConnection(dbConfig);
    console.log('✅ Conectado a MySQL');

    // Leer el archivo SQL
    const fs = require('fs');
    const path = require('path');
    const sqlPath = path.join(__dirname, 'schema.sql');
    const sql = fs.readFileSync(sqlPath, 'utf8');

    console.log('🔄 Ejecutando script SQL...');
    await connection.query(sql);
    console.log('✅ Base de datos creada exitosamente');

    console.log('\n📊 Resumen:');
    console.log('   - Base de datos: goalkeeper_training');
    console.log('   - Tablas: 13 tablas creadas');
    console.log('   - Vistas: 3 vistas creadas');
    console.log('   - Procedimientos: 1 procedimiento almacenado');
    console.log('   - Triggers: 1 trigger');
    console.log('   - Usuarios demo creados: 2');
    console.log('\n👤 Usuarios de prueba:');
    console.log('   1. Email: admin@goalkeeper.com');
    console.log('      Password: Admin123!');
    console.log('      Role: admin');
    console.log('\n   2. Email: coach@goalkeeper.com');
    console.log('      Password: Admin123!');
    console.log('      Role: coach');
    console.log('\n✨ ¡Base de datos lista para usar!');

  } catch (error) {
    console.error('❌ Error al inicializar la base de datos:', error);
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

// Ejecutar
initializeDatabase();
