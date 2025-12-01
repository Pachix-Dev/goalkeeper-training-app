# 📋 Plan de Implementación - Editor Táctico de Entrenamientos

## 🔍 Análisis de la App Actual (GKCoachApp)

### Tecnología Actual

- **Librería**: Konva.js
- **Problema**: Interfaz visual anticuada, UX poco intuitiva

### Funcionalidades Existentes

1. **Elementos de cancha**: Portero, aros, balones, porterías, cajón, escalera, cono, pica, vallas, bossu, muñeco, lona, reboteador
2. **Gestos del entrenador**: Posición de base, despejes, desvío, blocaje, golpeo, salto
3. **Gestos del portero**: Saque con la mano, correr, saque de semivolea, prolongación
4. **Vistas de cancha**: Diferentes ángulos y perspectivas
5. **Herramientas**: Rotar, cambiar colores, zoom, pantalla completa, duplicar elementos
6. **Fondos**: Múltiples opciones de césped y porterías

---

## 🎯 Comparativa de Librerías Modernas

### 1. **Konva.js** (Actual)

| Aspecto              | Evaluación                              |
| -------------------- | --------------------------------------- |
| Stars GitHub         | ⭐ 13.8k                                |
| Última actualización | ✅ Activa (v10.0.12)                    |
| TypeScript           | ✅ Nativo                               |
| React Integration    | ✅ react-konva                          |
| Curva de aprendizaje | 🟡 Media                                |
| Performance          | 🟢 Excelente (Canvas 2D nativo)         |
| Drag & Drop          | ✅ Built-in                             |
| Transformaciones     | ✅ Escala, rotación, sesgo              |
| Eventos              | ✅ Completo                             |
| Filtros/Efectos      | ✅ 20+ filtros                          |
| Exportación          | ✅ PNG, JPG, Data URL                   |
| Mobile               | ✅ Touch events                         |
| **Veredicto**        | ✅ **RECOMENDADO** - Sólido y confiable |

### 2. **Fabric.js** (v6.9.0)

| Aspecto              | Evaluación                                         |
| -------------------- | -------------------------------------------------- |
| Stars GitHub         | ⭐ 30.6k                                           |
| Última actualización | ✅ Muy activa                                      |
| TypeScript           | ✅ Reescrito en TS (v6)                            |
| React Integration    | 🟡 Necesita wrapper custom                         |
| Curva de aprendizaje | 🟢 Fácil                                           |
| Performance          | 🟢 Excelente                                       |
| Drag & Drop          | ✅ Built-in avanzado                               |
| Transformaciones     | ✅ Muy completo                                    |
| Eventos              | ✅ Sistema robusto                                 |
| Filtros/Efectos      | ✅ WebGL + Canvas2D                                |
| Exportación          | ✅ SVG, PNG, JSON                                  |
| SVG Import/Export    | ✅ **Mejor del mercado**                           |
| Mobile               | ✅ Excelente soporte                               |
| Edición de texto     | ✅ Rico y complejo                                 |
| **Veredicto**        | ✅ **MÁS POTENTE** - Mejor para editores complejos |

### 3. **Excalidraw** (Open Source)

| Aspecto              | Evaluación                                                           |
| -------------------- | -------------------------------------------------------------------- |
| Stars GitHub         | ⭐ 112k                                                              |
| Última actualización | ✅ Muy activa                                                        |
| TypeScript           | ✅ Nativo                                                            |
| React Integration    | ✅ Componente React                                                  |
| Curva de aprendizaje | 🟢 Muy fácil                                                         |
| Performance          | 🟢 Excelente                                                         |
| Estilo visual        | 🎨 Hand-drawn (único)                                                |
| Drag & Drop          | ✅ Intuitivo                                                         |
| Colaboración         | ✅ Real-time built-in                                                |
| Exportación          | ✅ PNG, SVG, Excalidraw                                              |
| Mobile               | ✅ PWA                                                               |
| **Limitación**       | ❌ Estilo fijo (hand-drawn)                                          |
| **Veredicto**        | 🤔 **NO RECOMENDADO** - Estilo no profesional para táctica deportiva |

### 4. **tldraw** (Alternativa moderna)

| Aspecto              | Evaluación                                   |
| -------------------- | -------------------------------------------- |
| Stars GitHub         | ⭐ 40k+                                      |
| Última actualización | ✅ Muy activa                                |
| TypeScript           | ✅ Nativo                                    |
| React Integration    | ✅ SDK completo                              |
| Curva de aprendizaje | 🟢 Fácil                                     |
| Performance          | 🟢 Excelente (Canvas optimizado)             |
| Estilo visual        | 🎨 Profesional moderno                       |
| Customización        | ✅ Shapes y tools custom                     |
| Colaboración         | ✅ Multiplayer built-in                      |
| Exportación          | ✅ SVG, PNG, JSON                            |
| **Veredicto**        | ⭐ **OPCIÓN MODERNA** - Excelente para 2025+ |

---

## 🏆 Recomendación Final

### **Opción 1: Fabric.js v6 + React** (RECOMENDADO)

**Por qué:**

- ✅ La más madura y robusta para editores profesionales
- ✅ TypeScript nativo en v6 (reescrita completamente)
- ✅ Mejor manejo de SVG (importar iconos de elementos)
- ✅ Sistema de controles altamente customizable
- ✅ Filtros WebGL para efectos visuales
- ✅ Exportación a múltiples formatos
- ✅ Usado por empresas como Meta, Microsoft, Zazzle

**Desventajas:**

- 🟡 Requiere wrapper para React (pero hay ejemplos)
- 🟡 Bundle size más grande que Konva

### **Opción 2: Konva.js + react-konva** (Conservador)

**Por qué:**

- ✅ Si ya conoces Konva, es más rápido
- ✅ react-konva es oficial y bien mantenido
- ✅ Bundle size más pequeño
- ✅ Performance excelente
- ✅ Documentación muy completa

**Desventajas:**

- 🔴 La interfaz seguirá siendo básica si no inviertes en UX/UI
- 🟡 Menos features avanzados que Fabric

### **Opción 3: tldraw SDK** (Innovador)

**Por qué:**

- ✅ UI/UX moderna y profesional out-of-the-box
- ✅ Colaboración real-time incluida
- ✅ Muy fácil de customizar
- ✅ Activamente desarrollado (2024-2025)

**Desventajas:**

- 🔴 Menos maduro que Fabric/Konva
- 🔴 Documentación aún en desarrollo
- 🔴 Comunidad más pequeña

---

## 💡 Propuesta de Solución

### **Stack Tecnológico Recomendado**

```typescript
// Stack principal
- Next.js 16 (App Router) ✅ Ya implementado
- TypeScript 5 ✅ Ya implementado
- Fabric.js v6.9.0 (Nueva)
- Tailwind CSS 4 ✅ Ya implementado
- Zustand (State management para el editor)
- react-beautiful-dnd o dnd-kit (Drag & drop de elementos)
```

### **Arquitectura del Editor**

```
app/[locale]/editor/
├── page.tsx                    # Página principal del editor
├── layout.tsx                  # Layout con toolbar
└── components/
    ├── Canvas.tsx              # Componente Fabric.js wrapper
    ├── Toolbar.tsx             # Barra de herramientas superior
    ├── ElementsPalette.tsx     # Paleta lateral de elementos
    ├── PropertiesPanel.tsx     # Panel de propiedades del objeto seleccionado
    ├── FieldTemplates.tsx      # Selector de vistas de cancha
    ├── ContextMenu.tsx         # Menú contextual (click derecho)
    └── elements/
        ├── GoalkeeperElement.tsx
        ├── ConeElement.tsx
        ├── BallElement.tsx
        └── ... (cada elemento deportivo)

lib/editor/
├── fabric-manager.ts           # Clase para manejar Fabric canvas
├── elements-library.ts         # Definición de todos los elementos
├── templates.ts                # Plantillas de canchas
├── export-manager.ts           # Exportar a PNG/PDF/JSON
└── types.ts                    # TypeScript interfaces

public/editor/
├── icons/                      # SVG de elementos deportivos
│   ├── goalkeeper.svg
│   ├── cone.svg
│   ├── ball.svg
│   └── ...
└── fields/                     # Imágenes de canchas
    ├── full-field.png
    ├── half-field.png
    └── goal-area.png
```

---

## 🎨 Diseño UX/UI Moderno

### Inspiración de diseño:

1. **Figma** - Toolbar y propiedades
2. **Canva** - Paleta de elementos lateral
3. **Miro** - Zoom y navegación
4. **Polotno** (usa Konva) - Editor de diseño profesional

### Características clave:

- ✅ Toolbar flotante con acciones principales
- ✅ Sidebar izquierdo con categorías de elementos (plegable)
- ✅ Panel derecho con propiedades del objeto seleccionado
- ✅ Minimap en esquina inferior derecha
- ✅ Shortcuts de teclado (Ctrl+Z, Ctrl+C, Del, etc.)
- ✅ Atajos de mouse (rueda para zoom, arrastrar para pan)
- ✅ Guías de alineación (snap to grid)
- ✅ Capas (layers) para organizar elementos
- ✅ Dark mode

---

## 📦 Elementos Deportivos

### Categorías de elementos:

#### 1. **Materiales** (10 elementos)

```typescript
const materials = [
  { id: 'cone', name: 'Cono', icon: 'cone.svg', color: '#FF6B00' },
  { id: 'pole', name: 'Pica', icon: 'pole.svg', color: '#FFD700' },
  { id: 'hurdle', name: 'Valla', icon: 'hurdle.svg', color: '#4CAF50' },
  { id: 'hoop', name: 'Aro', icon: 'hoop.svg', color: '#2196F3' },
  { id: 'ladder', name: 'Escalera', icon: 'ladder.svg', color: '#9C27B0' },
  { id: 'box', name: 'Cajón', icon: 'box.svg', color: '#795548' },
  { id: 'bossu', name: 'Bossu', icon: 'bossu.svg', color: '#00BCD4' },
  { id: 'dummy', name: 'Muñeco', icon: 'dummy.svg', color: '#FF5722' },
  { id: 'canvas', name: 'Lona', icon: 'canvas.svg', color: '#607D8B' },
  {
    id: 'rebounder',
    name: 'Reboteador',
    icon: 'rebounder.svg',
    color: '#009688',
  },
]
```

#### 2. **Jugadores** (2 elementos)

```typescript
const players = [
  {
    id: 'goalkeeper',
    name: 'Portero',
    icon: 'goalkeeper.svg',
    color: '#FFC107',
  },
  { id: 'coach', name: 'Entrenador', icon: 'coach.svg', color: '#3F51B5' },
]
```

#### 3. **Porterías y balones** (3 elementos)

```typescript
const equipment = [
  { id: 'goal-full', name: 'Portería completa', icon: 'goal-full.svg' },
  { id: 'goal-small', name: 'Portería pequeña', icon: 'goal-small.svg' },
  { id: 'ball', name: 'Balón', icon: 'ball.svg', color: '#FFFFFF' },
]
```

#### 4. **Gestos del Portero** (6 gestos)

```typescript
const goalkeeperGestures = [
  { id: 'base-position', name: 'Posición de base', icon: 'gesture-base.svg' },
  { id: 'clearance', name: 'Despeje', icon: 'gesture-clearance.svg' },
  { id: 'deflection', name: 'Desvío', icon: 'gesture-deflection.svg' },
  { id: 'catch', name: 'Blocaje', icon: 'gesture-catch.svg' },
  { id: 'punch', name: 'Golpeo', icon: 'gesture-punch.svg' },
  { id: 'jump', name: 'Salto', icon: 'gesture-jump.svg' },
]
```

#### 5. **Acciones del Portero** (4 acciones)

```typescript
const goalkeeperActions = [
  { id: 'hand-throw', name: 'Saque con la mano', icon: 'action-throw.svg' },
  { id: 'run', name: 'Correr', icon: 'action-run.svg' },
  {
    id: 'half-volley',
    name: 'Saque de semivolea',
    icon: 'action-halfvolley.svg',
  },
  { id: 'extension', name: 'Prolongación', icon: 'action-extension.svg' },
]
```

#### 6. **Herramientas de dibujo** (5 tools)

```typescript
const drawingTools = [
  { id: 'arrow', name: 'Flecha', icon: 'arrow.svg' },
  { id: 'line', name: 'Línea', icon: 'line.svg' },
  { id: 'text', name: 'Texto', icon: 'text.svg' },
  { id: 'rect', name: 'Rectángulo', icon: 'rect.svg' },
  { id: 'circle', name: 'Círculo', icon: 'circle.svg' },
]
```

---

## 🛠️ Implementación Fase por Fase

### **Fase 1: Setup Básico** (Semana 1)

- [ ] Instalar Fabric.js v6
- [ ] Crear página `/[locale]/editor`
- [ ] Implementar Canvas básico con Fabric
- [ ] Toolbar superior con acciones básicas (zoom, pan, reset)
- [ ] Crear SVGs de 5 elementos básicos (portero, cono, balón, portería, aro)

### **Fase 2: Elementos y Drag & Drop** (Semana 2)

- [ ] Paleta lateral de elementos
- [ ] Drag & drop desde paleta al canvas
- [ ] Selección, mover, escalar, rotar elementos
- [ ] Duplicar elementos (Ctrl+D)
- [ ] Eliminar elementos (Del)
- [ ] Cambiar colores de elementos

### **Fase 3: Plantillas de Cancha** (Semana 3)

- [ ] Selector de vista de cancha (full, half, goal area)
- [ ] Diferentes ángulos de cámara
- [ ] Fondo de césped customizable
- [ ] Grid/cuadrícula opcional

### **Fase 4: Herramientas Avanzadas** (Semana 4)

- [ ] Flechas y líneas para movimientos
- [ ] Texto para anotaciones
- [ ] Capas (layers)
- [ ] Menú contextual (click derecho)
- [ ] Panel de propiedades (sidebar derecho)

### **Fase 5: Exportación y Guardado** (Semana 5)

- [ ] Exportar a PNG/JPG
- [ ] Exportar a PDF
- [ ] Guardar en base de datos (JSON)
- [ ] Cargar entrenamientos guardados
- [ ] Compartir por link

### **Fase 6: Features Extras** (Semana 6)

- [ ] Undo/Redo (Ctrl+Z/Ctrl+Y)
- [ ] Copiar/Pegar (Ctrl+C/Ctrl+V)
- [ ] Agrupar elementos
- [ ] Bloquear elementos
- [ ] Shortcuts de teclado
- [ ] Dark mode

---

## 💰 Comparativa de Costos

| Opción          | Licencia  | Costo                      | Notas                          |
| --------------- | --------- | -------------------------- | ------------------------------ |
| **Fabric.js**   | MIT       | Gratis                     | ✅ Open source                 |
| **Konva.js**    | MIT       | Gratis                     | ✅ Open source                 |
| **tldraw**      | MIT       | Gratis                     | ✅ Open source, con opción Pro |
| **Polotno SDK** | Dual      | $299/mes o gratis limitado | 🔴 Caro para empezar           |
| **KonvaJS Pro** | Comercial | $99/año                    | 🟡 Features extras             |

**Recomendación:** Fabric.js (Gratis, MIT)

---

## 🎯 Conclusión y Siguiente Paso

### **Decisión Final: Fabric.js v6 + React**

**Razones:**

1. ✅ La más robusta para editores profesionales
2. ✅ TypeScript nativo (v6)
3. ✅ Mejor manejo de SVG
4. ✅ Comunidad muy activa (30k stars)
5. ✅ Usado por empresas Fortune 500
6. ✅ Gratis y open source (MIT)
7. ✅ Documentación completa

### **Próximo Paso:**

1. ¿Te gusta esta propuesta?
2. ¿Quieres que empiece con la Fase 1 (Setup Básico)?
3. ¿Necesitas ver un prototipo rápido primero?

**Puedo:**

- Crear un prototipo funcional en 1-2 horas
- Implementar la Fase 1 completa
- Crear todos los SVGs de elementos
- Diseñar el UI/UX en Figma primero (opcional)

**¿Qué prefieres?** 🤔
