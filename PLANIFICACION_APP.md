📊 Análisis del Schema y Planificación de Módulos
He analizado tu schema completo. Tienes una base de datos muy bien estructurada con 13 tablas y 3 vistas. Aquí está la planificación de módulos:

✅ Módulos Completados
Autenticación ✅

Login, registro, verificación email, recuperación contraseña
Tablas: users, refresh_tokens, verification_tokens
Editor Táctico ✅

Diseño de ejercicios con canvas
Tabla: training_designs
📋 Módulos por Desarrollar (Orden de Prioridad)
FASE 1: Gestión Base (Fundamentos)

1. Módulo de Equipos 🔵 Alta Prioridad
   Tabla: teams

Funcionalidades:
CRUD de equipos (crear, listar, editar, eliminar)
Asignar coach (user_id)
Filtros por temporada/categoría
Vista: vw_teams_summary
Páginas:
/teams - Listado con cards
/teams/new - Crear equipo
/teams/[id] - Detalles y edición
/teams/[id]/goalkeepers - Porteros del equipo

2. Módulo de Porteros 🔵 Alta Prioridad
   Tabla: goalkeepers

Funcionalidades:
CRUD de porteros
Asignar a equipos
Perfil completo (foto, stats físicas, notas)
Buscador con filtros
Páginas:
/goalkeepers - Listado con filtros
/goalkeepers/new - Agregar portero
/goalkeepers/[id] - Perfil del portero
/goalkeepers/[id]/stats - Estadísticas

FASE 2: Planificación de Entrenamientos

3. Módulo de Tareas/Ejercicios 🟢 Media Prioridad
   Tabla: tasks

Funcionalidades:
Biblioteca de ejercicios
Categorías: técnico, táctico, físico, psicológico, específico portero
Compartir ejercicios (is_public)
Búsqueda con FULLTEXT
Adjuntar videos/imágenes
Páginas:
/tasks - Biblioteca de ejercicios
/tasks/new - Crear ejercicio
/tasks/[id] - Detalles del ejercicio
/tasks/categories - Filtrar por categoría

4. Módulo de Sesiones de Entrenamiento 🟢 Media Prioridad
   Tablas: training_sessions, session_tasks

Funcionalidades:
Planificar sesiones
Agregar tareas a sesiones (orden, duración, intensidad)
Calendario mensual/semanal
Estados: planificado, completado, cancelado
Vincular con training_designs (editor táctico)
Páginas:
/sessions - Calendario de sesiones
/sessions/new - Crear sesión
/sessions/[id] - Detalles y edición
/sessions/[id]/tasks - Gestionar tareas de la sesión

5. Módulo de Asistencia 🟡 Media-Baja Prioridad
   Tabla: goalkeeper_attendance

Funcionalidades:
Registrar asistencia por sesión
Estados: presente, ausente, tarde, lesionado, justificado
Reportes de asistencia por portero/equipo
Páginas:
/sessions/[id]/attendance - Tomar asistencia
/goalkeepers/[id]/attendance - Historial de asistencia
FASE 3: Análisis y Estadísticas

6. Módulo de Penaltis 🟡 Media Prioridad
   Tabla: penalties

Funcionalidades:
Registrar penaltis (dirección, altura, resultado)
Análisis de tendencias de lanzadores
Estadísticas por portero
Vista: vw_goalkeeper_penalty_stats
Páginas:
/penalties - Listado de penaltis
/penalties/new - Registrar penalti
/penalties/analysis - Análisis de tendencias
/goalkeepers/[id]/penalties - Penaltis por portero

7. Módulo de Análisis de Partidos 🟡 Media Prioridad
   Tabla: match_analysis

Funcionalidades:
Análisis post-partido
Métricas: paradas, goles, balones aéreos, cruces
Fortalezas y áreas de mejora
Adjuntar videos
Páginas:
/matches - Listado de partidos analizados
/matches/new - Crear análisis
/matches/[id] - Ver análisis completo
/goalkeepers/[id]/matches - Partidos por portero

8. Módulo de Estadísticas 🟢 Media Prioridad
   Tabla: goalkeeper_statistics

Funcionalidades:
Estadísticas por temporada
Comparativas entre porteros
Gráficas de evolución
Exportar reportes PDF
Páginas:
/statistics - Dashboard general
/statistics/goalkeeper/[id] - Stats individuales
/statistics/team/[id] - Stats por equipo
/statistics/compare - Comparar porteros
FASE 4: Configuración y Extras

9. Módulo de Metodología ⚪ Baja Prioridad
   Tabla: methodology_settings

Funcionalidades:
Configuraciones personalizadas del coach
Filosofía de entrenamiento
Plantillas de sesiones
Páginas:
/settings/methodology - Configurar metodología
/settings/templates - Plantillas guardadas

10. Dashboard Principal 🔵 Alta Prioridad (Transversal)
    Funcionalidades:
    Resumen de equipos activos
    Próximas sesiones
    Estadísticas rápidas
    Accesos rápidos
    Usar las 3 vistas creadas
    Página:
    /dashboard - Panel principal
    🎯 Recomendación de Orden de Desarrollo
    🛠️ Componentes Técnicos Necesarios
    Para cada módulo necesitarás:

Model (lib/db/models/XxxModel.ts) - CRUD con la DB
API Routes (route.ts) - Endpoints REST
Pages (page.tsx) - UI del módulo
Components (components/xxx/) - Componentes reutilizables
Types (database.ts) - Interfaces TypeScript
Validations (lib/validations/xxx.ts) - Schemas Zod
Translations (es.json, en.json) - i18n
