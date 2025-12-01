# 🗄️ Documentación de Base de Datos - Goalkeeper Training App

## 📋 Índice

1. [Configuración Inicial](#configuración-inicial)
2. [Estructura de Tablas](#estructura-de-tablas)
3. [Instalación](#instalación)
4. [Uso de la API](#uso-de-la-api)
5. [Modelos y Tipos](#modelos-y-tipos)

---

## 🚀 Configuración Inicial

### Requisitos Previos

- MySQL 8.0 o superior
- Node.js 18 o superior
- npm o yarn

### 1. Instalar MySQL

**Windows:**

```bash
# Descargar desde: https://dev.mysql.com/downloads/mysql/
# O usar Chocolatey:
choco install mysql
```

**Verificar instalación:**

```bash
mysql --version
```

### 2. Configurar Variables de Entorno

Copia el archivo `.env.example` a `.env.local` y configura tus credenciales:

```env
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=tu_password
DB_NAME=goalkeeper_training
JWT_SECRET=tu-super-secret-jwt-key-cambia-esto-en-produccion
```

### 3. Inicializar la Base de Datos

```bash
# Ejecutar el script de inicialización
node lib/db/init-db.js
```

Este script creará:

- ✅ Base de datos `goalkeeper_training`
- ✅ 13 tablas
- ✅ 3 vistas
- ✅ 1 procedimiento almacenado
- ✅ 1 trigger
- ✅ 2 usuarios de prueba

---

## 📊 Estructura de Tablas

### 1. **users** - Usuarios del Sistema

Almacena la información de los entrenadores y administradores.

```sql
CREATE TABLE users (
  id INT PRIMARY KEY AUTO_INCREMENT,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  name VARCHAR(255) NOT NULL,
  role ENUM('admin', 'coach', 'assistant'),
  avatar VARCHAR(500),
  is_active BOOLEAN DEFAULT TRUE,
  email_verified BOOLEAN DEFAULT FALSE,
  last_login TIMESTAMP NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

**Campos importantes:**

- `role`: Determina los permisos del usuario
- `is_active`: Permite desactivar usuarios sin eliminarlos
- `email_verified`: Para futuras funcionalidades de verificación de email

---

### 2. **teams** - Equipos

Gestión de equipos de fútbol.

```sql
CREATE TABLE teams (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(255) NOT NULL,
  category VARCHAR(100) NOT NULL,
  season VARCHAR(50) NOT NULL,
  description TEXT,
  color VARCHAR(7) DEFAULT '#2563eb',
  user_id INT NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  FOREIGN KEY (user_id) REFERENCES users(id)
);
```

**Ejemplos de categorías:**

- Sub-15, Sub-17, Sub-19, Sub-21
- Primera División, Segunda División
- Femenil, Varonil

---

### 3. **goalkeepers** - Porteros

Información detallada de cada portero.

```sql
CREATE TABLE goalkeepers (
  id INT PRIMARY KEY AUTO_INCREMENT,
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  date_of_birth DATE,
  height DECIMAL(5,2),
  weight DECIMAL(5,2),
  nationality VARCHAR(100),
  photo VARCHAR(500),
  dominant_hand ENUM('left', 'right', 'both'),
  team_id INT,
  jersey_number INT,
  notes TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  FOREIGN KEY (team_id) REFERENCES teams(id)
);
```

**Datos biométricos:**

- `height`: Altura en centímetros (ej: 185.50)
- `weight`: Peso en kilogramos (ej: 78.50)
- `dominant_hand`: Mano dominante para distribución

---

### 4. **tasks** - Tareas/Ejercicios

Biblioteca de ejercicios de entrenamiento.

```sql
CREATE TABLE tasks (
  id INT PRIMARY KEY AUTO_INCREMENT,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  category ENUM('technical', 'tactical', 'physical', 'psychological', 'goalkeeper_specific'),
  subcategory VARCHAR(100),
  duration INT COMMENT 'Duración en minutos',
  difficulty ENUM('beginner', 'intermediate', 'advanced'),
  objectives TEXT,
  materials TEXT,
  instructions TEXT,
  video_url VARCHAR(500),
  image_url VARCHAR(500),
  user_id INT NOT NULL,
  is_public BOOLEAN DEFAULT FALSE,
  FOREIGN KEY (user_id) REFERENCES users(id)
);
```

**Categorías de ejercicios:**

- `technical`: Técnica individual
- `tactical`: Aspectos tácticos
- `physical`: Preparación física
- `psychological`: Aspecto mental
- `goalkeeper_specific`: Específico de portero

---

### 5. **training_sessions** - Sesiones de Entrenamiento

Planificación y registro de entrenamientos.

```sql
CREATE TABLE training_sessions (
  id INT PRIMARY KEY AUTO_INCREMENT,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  session_date DATE NOT NULL,
  start_time TIME,
  end_time TIME,
  location VARCHAR(255),
  team_id INT NOT NULL,
  user_id INT NOT NULL,
  session_type ENUM('training', 'match', 'recovery', 'tactical', 'physical'),
  status ENUM('planned', 'completed', 'cancelled'),
  notes TEXT,
  weather VARCHAR(100),
  FOREIGN KEY (team_id) REFERENCES teams(id),
  FOREIGN KEY (user_id) REFERENCES users(id)
);
```

---

### 6. **session_tasks** - Tareas en Sesiones

Relación entre sesiones y tareas.

```sql
CREATE TABLE session_tasks (
  id INT PRIMARY KEY AUTO_INCREMENT,
  session_id INT NOT NULL,
  task_id INT NOT NULL,
  order_number INT NOT NULL,
  duration INT,
  intensity ENUM('low', 'medium', 'high', 'very_high'),
  notes TEXT,
  FOREIGN KEY (session_id) REFERENCES training_sessions(id),
  FOREIGN KEY (task_id) REFERENCES tasks(id)
);
```

---

### 7. **goalkeeper_attendance** - Asistencia

Control de asistencia de porteros a sesiones.

```sql
CREATE TABLE goalkeeper_attendance (
  id INT PRIMARY KEY AUTO_INCREMENT,
  session_id INT NOT NULL,
  goalkeeper_id INT NOT NULL,
  status ENUM('present', 'absent', 'late', 'injured', 'excused'),
  notes TEXT,
  FOREIGN KEY (session_id) REFERENCES training_sessions(id),
  FOREIGN KEY (goalkeeper_id) REFERENCES goalkeepers(id)
);
```

---

### 8. **penalties** - Scouting de Penaltis

Análisis detallado de penaltis.

```sql
CREATE TABLE penalties (
  id INT PRIMARY KEY AUTO_INCREMENT,
  goalkeeper_id INT NOT NULL,
  opponent_name VARCHAR(255) NOT NULL,
  match_date DATE,
  competition VARCHAR(255),
  penalty_taker VARCHAR(255) NOT NULL,
  taker_foot ENUM('left', 'right'),
  shot_direction ENUM('left', 'center', 'right'),
  shot_height ENUM('low', 'mid', 'high'),
  result ENUM('saved', 'goal', 'missed', 'post'),
  goalkeeper_direction ENUM('left', 'center', 'right', 'stayed'),
  notes TEXT,
  video_url VARCHAR(500),
  created_by INT NOT NULL,
  FOREIGN KEY (goalkeeper_id) REFERENCES goalkeepers(id),
  FOREIGN KEY (created_by) REFERENCES users(id)
);
```

---

### 9. **match_analysis** - Análisis de Partidos

Evaluación del rendimiento en partidos.

```sql
CREATE TABLE match_analysis (
  id INT PRIMARY KEY AUTO_INCREMENT,
  goalkeeper_id INT NOT NULL,
  match_date DATE NOT NULL,
  opponent VARCHAR(255) NOT NULL,
  competition VARCHAR(255),
  result VARCHAR(50),
  minutes_played INT,
  goals_conceded INT DEFAULT 0,
  saves INT DEFAULT 0,
  high_balls INT DEFAULT 0,
  crosses_caught INT DEFAULT 0,
  distribution_success_rate DECIMAL(5,2),
  rating DECIMAL(3,1),
  strengths TEXT,
  areas_for_improvement TEXT,
  notes TEXT,
  video_url VARCHAR(500),
  created_by INT NOT NULL,
  FOREIGN KEY (goalkeeper_id) REFERENCES goalkeepers(id)
);
```

---

### 10. **goalkeeper_statistics** - Estadísticas

Estadísticas acumuladas por temporada.

```sql
CREATE TABLE goalkeeper_statistics (
  id INT PRIMARY KEY AUTO_INCREMENT,
  goalkeeper_id INT NOT NULL,
  season VARCHAR(50) NOT NULL,
  matches_played INT DEFAULT 0,
  minutes_played INT DEFAULT 0,
  goals_conceded INT DEFAULT 0,
  clean_sheets INT DEFAULT 0,
  saves INT DEFAULT 0,
  penalties_saved INT DEFAULT 0,
  penalties_faced INT DEFAULT 0,
  yellow_cards INT DEFAULT 0,
  red_cards INT DEFAULT 0,
  FOREIGN KEY (goalkeeper_id) REFERENCES goalkeepers(id),
  UNIQUE (goalkeeper_id, season)
);
```

---

## 🔐 Usuarios de Prueba

La base de datos incluye 2 usuarios de prueba:

### Usuario 1 - Administrador

```
Email: admin@goalkeeper.com
Password: Admin123!
Role: admin
```

### Usuario 2 - Entrenador

```
Email: coach@goalkeeper.com
Password: Admin123!
Role: coach
```

---

## 🛠️ Uso de la API

### Autenticación

#### Login

```typescript
POST /api/auth/login
Content-Type: application/json

{
  "email": "coach@goalkeeper.com",
  "password": "Admin123!"
}

Response:
{
  "user": {
    "id": 2,
    "email": "coach@goalkeeper.com",
    "name": "Coach Demo",
    "role": "coach"
  },
  "token": "eyJhbGc..."
}
```

#### Registro

```typescript
POST /api/auth/register
Content-Type: application/json

{
  "email": "nuevo@coach.com",
  "password": "Password123",
  "name": "Nuevo Coach",
  "role": "coach"
}
```

### Equipos

#### Listar equipos

```typescript
GET /api/teams
Authorization: Bearer {token}

Response:
{
  "teams": [
    {
      "id": 1,
      "name": "Sub-17",
      "category": "Juvenil",
      "season": "2024/2025",
      "total_goalkeepers": 3
    }
  ]
}
```

#### Crear equipo

```typescript
POST /api/teams
Authorization: Bearer {token}
Content-Type: application/json

{
  "name": "Sub-19",
  "category": "Juvenil",
  "season": "2024/2025",
  "description": "Equipo Sub-19 temporada actual",
  "color": "#3b82f6"
}
```

### Porteros

#### Listar porteros

```typescript
GET /api/goalkeepers
Authorization: Bearer {token}

// Filtrar por equipo
GET /api/goalkeepers?team_id=1

// Buscar por nombre
GET /api/goalkeepers?search=Juan
```

#### Crear portero

```typescript
POST /api/goalkeepers
Authorization: Bearer {token}
Content-Type: application/json

{
  "first_name": "Juan",
  "last_name": "Pérez",
  "date_of_birth": "2005-03-15",
  "height": 185.5,
  "weight": 78.0,
  "nationality": "México",
  "dominant_hand": "right",
  "team_id": 1,
  "jersey_number": 1
}
```

---

## 📦 Modelos TypeScript

### UserModel

```typescript
import { UserModel } from '@/lib/db/models/UserModel'

// Crear usuario
const user = await UserModel.create({
  email: 'nuevo@coach.com',
  password: 'Password123',
  name: 'Nuevo Coach',
})

// Buscar por email
const user = await UserModel.findByEmail('coach@goalkeeper.com')

// Verificar contraseña
const isValid = await UserModel.verifyPassword(password, user.password_hash)

// Actualizar
await UserModel.update(userId, {
  name: 'Nombre Actualizado',
})
```

### TeamModel

```typescript
import { TeamModel } from '@/lib/db/models/TeamModel'

// Crear equipo
const team = await TeamModel.create(userId, {
  name: 'Sub-17',
  category: 'Juvenil',
  season: '2024/2025',
})

// Listar equipos del usuario
const teams = await TeamModel.findByUser(userId)

// Obtener con estadísticas
const teamsWithStats = await TeamModel.findWithStats(userId)
```

### GoalkeeperModel

```typescript
import { GoalkeeperModel } from '@/lib/db/models/GoalkeeperModel'

// Crear portero
const goalkeeper = await GoalkeeperModel.create({
  first_name: 'Juan',
  last_name: 'Pérez',
  team_id: 1,
})

// Listar por equipo
const goalkeepers = await GoalkeeperModel.findByTeam(teamId)

// Buscar por nombre
const results = await GoalkeeperModel.search(userId, 'Juan')
```

---

## 🔍 Vistas SQL Útiles

### vw_teams_summary

Vista con resumen de equipos y contador de porteros:

```sql
SELECT * FROM vw_teams_summary WHERE coach_name = 'Coach Demo';
```

### vw_goalkeeper_penalty_stats

Estadísticas de penaltis por portero:

```sql
SELECT * FROM vw_goalkeeper_penalty_stats WHERE goalkeeper_id = 1;
```

### vw_team_sessions_stats

Estadísticas de sesiones por equipo:

```sql
SELECT * FROM vw_team_sessions_stats;
```

---

## 📝 Notas Importantes

### Seguridad

- ✅ Las contraseñas se almacenan con bcrypt (hash)
- ✅ JWT para autenticación de API
- ✅ Validación de permisos en cada endpoint
- ⚠️ Cambiar `JWT_SECRET` en producción

### Rendimiento

- Índices creados en campos frecuentemente consultados
- Pool de conexiones configurado
- Transacciones para operaciones críticas

### Mantenimiento

- Soft deletes (is_active = FALSE)
- Timestamps automáticos (created_at, updated_at)
- Cascadas en claves foráneas

---

## 🐛 Solución de Problemas

### Error de conexión a MySQL

```bash
# Verificar que MySQL esté corriendo
mysql -u root -p

# Windows - Iniciar servicio
net start MySQL80

# Verificar puerto
netstat -an | findstr :3306
```

### Error: "Table doesn't exist"

```bash
# Reejecutar script de inicialización
node lib/db/init-db.js
```

### Error: "Access denied"

```bash
# Verificar credenciales en .env.local
# Crear usuario si es necesario:
mysql -u root -p
CREATE USER 'goalkeeper'@'localhost' IDENTIFIED BY 'password';
GRANT ALL PRIVILEGES ON goalkeeper_training.* TO 'goalkeeper'@'localhost';
FLUSH PRIVILEGES;
```

---

## 📚 Recursos Adicionales

- [MySQL Documentation](https://dev.mysql.com/doc/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Next.js API Routes](https://nextjs.org/docs/api-routes/introduction)

---

**¡Base de datos configurada y lista para usar! 🎉**
