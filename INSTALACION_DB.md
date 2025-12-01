# 🚀 Guía de Instalación Completa - Base de Datos

## ✅ Lo que se ha implementado

### Base de Datos MySQL2

- ✅ 13 tablas relacionales
- ✅ 3 vistas SQL optimizadas
- ✅ 1 procedimiento almacenado
- ✅ 1 trigger automático
- ✅ Índices para rendimiento
- ✅ Relaciones con integridad referencial

### API REST Completa

- ✅ Autenticación con JWT
- ✅ Endpoints para usuarios
- ✅ Endpoints para equipos
- ✅ Endpoints para porteros
- ✅ Middleware de autenticación
- ✅ Validación de permisos

### Modelos TypeScript

- ✅ UserModel
- ✅ TeamModel
- ✅ GoalkeeperModel
- ✅ Tipos e interfaces completas

---

## 📋 Pasos de Instalación

### 1️⃣ Instalar MySQL

**Opción A - Descarga directa:**

1. Ve a: https://dev.mysql.com/downloads/mysql/
2. Descarga MySQL Community Server
3. Instala con las opciones por defecto
4. Anota tu contraseña de root

**Opción B - Chocolatey (Windows):**

```bash
choco install mysql
```

**Verificar instalación:**

```bash
mysql --version
# Debe mostrar: mysql Ver 8.0.x
```

### 2️⃣ Iniciar el Servicio MySQL

**Windows:**

```bash
# Iniciar servicio
net start MySQL80

# O desde Servicios de Windows (services.msc)
```

**Verificar que MySQL está corriendo:**

```bash
# Conectarse a MySQL
mysql -u root -p
# Ingresar tu contraseña

# Si conecta exitosamente, estás listo!
# Salir con: exit
```

### 3️⃣ Configurar Variables de Entorno

1. Copia el archivo `.env.example` a `.env.local`:

```bash
copy .env.example .env.local
```

2. Edita `.env.local` con tus credenciales de MySQL:

```env
# Database Configuration - MySQL
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=TU_PASSWORD_AQUI
DB_NAME=goalkeeper_training

# JWT Secret (Cambia esto!)
JWT_SECRET=cambia-este-secreto-por-uno-seguro-y-aleatorio

# Next.js
NEXT_PUBLIC_API_URL=http://localhost:3000/api
```

### 4️⃣ Instalar Dependencias del Proyecto

```bash
npm install
```

Esto instalará:

- ✅ mysql2 - Driver de MySQL
- ✅ bcryptjs - Hash de contraseñas
- ✅ jsonwebtoken - Autenticación JWT
- ✅ dotenv - Variables de entorno

### 5️⃣ Inicializar la Base de Datos

```bash
npm run db:init
```

Este comando:

1. Conecta a MySQL
2. Crea la base de datos `goalkeeper_training`
3. Crea todas las tablas
4. Crea vistas, procedimientos y triggers
5. Inserta 2 usuarios de prueba

**Salida esperada:**

```
🔄 Conectando a MySQL...
✅ Conectado a MySQL
🔄 Ejecutando script SQL...
✅ Base de datos creada exitosamente

📊 Resumen:
   - Base de datos: goalkeeper_training
   - Tablas: 13 tablas creadas
   - Vistas: 3 vistas creadas
   - Procedimientos: 1 procedimiento almacenado
   - Triggers: 1 trigger
   - Usuarios demo creados: 2

👤 Usuarios de prueba:
   1. Email: admin@goalkeeper.com
      Password: Admin123!
      Role: admin

   2. Email: coach@goalkeeper.com
      Password: Admin123!
      Role: coach

✨ ¡Base de datos lista para usar!
```

### 6️⃣ Iniciar la Aplicación

```bash
npm run dev
```

La aplicación se iniciará en: http://localhost:3000

---

## 🧪 Probar la Instalación

### Opción 1: Desde el Login de la App

1. Ve a: http://localhost:3000
2. Inicia sesión con:
   - Email: `coach@goalkeeper.com`
   - Password: `Admin123!`
3. Si el login funciona, ¡todo está bien! 🎉

### Opción 2: Probar la API Directamente

**PowerShell:**

```powershell
# Test de login
$body = @{
    email = "coach@goalkeeper.com"
    password = "Admin123!"
} | ConvertTo-Json

$response = Invoke-RestMethod -Uri "http://localhost:3000/api/auth/login" -Method Post -Body $body -ContentType "application/json"

# Ver respuesta
$response

# Debe devolver:
# user    : @{id=2; email=coach@goalkeeper.com; name=Coach Demo; role=coach}
# token   : eyJhbGc...
```

### Opción 3: Verificar en MySQL

```bash
mysql -u root -p
```

```sql
USE goalkeeper_training;

-- Ver tablas
SHOW TABLES;

-- Ver usuarios
SELECT id, email, name, role FROM users;

-- Salir
exit;
```

---

## 🛠️ Scripts Disponibles

```bash
# Desarrollo
npm run dev              # Iniciar servidor de desarrollo

# Base de datos
npm run db:init          # Inicializar base de datos
npm run db:setup         # Setup completo (con mensaje)

# Producción
npm run build            # Compilar para producción
npm run start            # Iniciar servidor de producción

# Código
npm run lint             # Verificar código
```

---

## 📊 Estructura de la Base de Datos

### Tablas Principales

| Tabla                   | Descripción               | Registros |
| ----------------------- | ------------------------- | --------- |
| `users`                 | Usuarios del sistema      | 2 demo    |
| `teams`                 | Equipos de fútbol         | 0         |
| `goalkeepers`           | Porteros                  | 0         |
| `tasks`                 | Biblioteca de ejercicios  | 0         |
| `training_sessions`     | Sesiones de entrenamiento | 0         |
| `session_tasks`         | Tareas en sesiones        | 0         |
| `goalkeeper_attendance` | Asistencia                | 0         |
| `penalties`             | Scouting de penaltis      | 0         |
| `match_analysis`        | Análisis de partidos      | 0         |
| `goalkeeper_statistics` | Estadísticas              | 0         |
| `methodology_settings`  | Configuración             | 0         |
| `refresh_tokens`        | Tokens de sesión          | 0         |

### Vistas

| Vista                         | Descripción                      |
| ----------------------------- | -------------------------------- |
| `vw_teams_summary`            | Equipos con contador de porteros |
| `vw_team_sessions_stats`      | Estadísticas de sesiones         |
| `vw_goalkeeper_penalty_stats` | Estadísticas de penaltis         |

---

## 🔐 Seguridad

### Contraseñas

- ✅ Hasheadas con bcrypt (cost factor: 10)
- ✅ Nunca se devuelven en las respuestas de API
- ✅ Validación de longitud mínima

### JWT Tokens

- ✅ Expiración de 7 días
- ✅ Incluye información del usuario
- ✅ Verificación en cada request protegido

### API

- ✅ Autenticación requerida en endpoints protegidos
- ✅ Validación de permisos por rol
- ✅ Validación de entrada de datos

---

## 🐛 Solución de Problemas Comunes

### ❌ Error: "connect ECONNREFUSED"

**Problema:** MySQL no está corriendo

**Solución:**

```bash
# Windows
net start MySQL80

# Verificar
netstat -an | findstr :3306
```

### ❌ Error: "Access denied for user"

**Problema:** Credenciales incorrectas en .env.local

**Solución:**

1. Verifica tu contraseña de MySQL
2. Actualiza DB_PASSWORD en `.env.local`
3. Reinicia la app

### ❌ Error: "Database 'goalkeeper_training' doesn't exist"

**Problema:** Base de datos no inicializada

**Solución:**

```bash
npm run db:init
```

### ❌ Error: "Cannot find module 'mysql2'"

**Problema:** Dependencias no instaladas

**Solución:**

```bash
npm install
```

### ❌ Error: "Table 'users' already exists"

**Problema:** Base de datos ya existe

**Solución 1 - Eliminar y recrear:**

```sql
mysql -u root -p
DROP DATABASE goalkeeper_training;
exit;
npm run db:init
```

**Solución 2 - Continuar sin reinicializar:**
La base de datos ya está lista, no necesitas hacer nada.

---

## 📝 Próximos Pasos

Una vez que la base de datos esté funcionando:

1. ✅ **Login funciona** - Prueba con usuarios demo
2. ⏳ **Crear equipos** - Módulo de equipos
3. ⏳ **Agregar porteros** - Módulo de porteros
4. ⏳ **Planificar entrenamientos** - Módulo de sesiones
5. ⏳ **Biblioteca de tareas** - Módulo de ejercicios
6. ⏳ **Análisis** - Estadísticas y reportes

---

## 📞 Ayuda

Si encuentras problemas:

1. Verifica que MySQL esté corriendo
2. Verifica las credenciales en `.env.local`
3. Revisa los logs de la consola
4. Consulta `DATABASE.md` para documentación detallada

---

## ✨ ¡Listo!

Si seguiste todos los pasos, ahora tienes:

✅ Base de datos MySQL configurada  
✅ 13 tablas con relaciones  
✅ API REST funcional  
✅ Autenticación con JWT  
✅ Login funcionando con usuarios demo  
✅ Sistema listo para desarrollar módulos

**¡Comienza a crear tu app de gestión de porteros! 🥅⚽**
