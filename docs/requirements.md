 Brain Buddy - PRD Mobile MVP (Versión Resumida)

1. RESUMEN EJECUTIVO
¿Qué es Brain Buddy?
App móvil gamificada que ayuda a estudiantes de secundaria a estudiar para exámenes mediante:
Planificación automática de estudio con IA
Sesiones interactivas (teoría + quiz estilo Duolingo)
Sistema de puntos, trofeos y rachas
Seguimiento para padres
Problema → Solución
❌ Alumnos desorganizados, sin motivación, no saben cómo estudiar ✅ App genera plan automático, gamifica el estudio, hace seguimiento

2. USUARIOS Y ROLES
Rol
Funcionalidades
Alumno
Crear exámenes, estudiar sesiones, ver progreso, ganar puntos
Padre
Ver progreso del hijo (solo lectura) mediante código de vinculación
Admin
No disponible en mobile (mensaje: "Usar versión web")


3. FLUJO PRINCIPAL DEL ALUMNO
1. REGISTRO → Crear cuenta (nombre, email, password, fecha nacimiento)
   ↓
2. AVATAR AUTO → Se genera avatar con iniciales + color aleatorio
   ↓
3. CÓDIGO → Recibe código de 6 dígitos para compartir con padres
   ↓
4. DISPONIBILIDAD → Marca días que puede estudiar (Lun/Mar/etc + Mañana/Tarde/Noche)
   ↓
5. CREAR EXAMEN → Wizard 4 pasos:
   - Nombre, materia, fecha
   - Temario (lista de temas)
   - Material (PDFs/docs opcionales)
   - Confirmar
   ↓
6. IA GENERA TODO → Contenido teórico + quizzes + calendario de sesiones
   ↓
7. ESTUDIAR SESIONES → 45 min: Teoría (30) + Descanso (5) + Quiz (10)
   ↓
8. GANAR PUNTOS → Completa quiz → Suma puntos → Desbloquea trofeos
   ↓
9. VER PROGRESO → Estadísticas, calendario, puntos, racha de días
```

---

## 4. FUNCIONALIDADES CLAVE

### 4.1 Autenticación (Simplificada)

**Registro Alumno:**
- Campos: Nombre, email, password, confirmar password, fecha nacimiento
- Avatar automático: Iniciales + color aleatorio (5 colores: azul, verde, morado, naranja, rosa)
- Sin onboarding de perfil de aprendizaje ❌
- Código de 6 dígitos generado automáticamente

**Registro Padre:**
- Igual que alumno pero sin fecha nacimiento
- Vinculación con código de 6 dígitos

**Login:**
- Email + password
- Redirección automática según rol

---

### 4.2 Disponibilidad Horaria

**Pantalla simple:**
```
☑️ Lunes      [Tarde]
☐ Martes
☑️ Miércoles  [Mañana] [Tarde]
☑️ Jueves     [Noche]
```
- Solo días + turno (no horarios específicos)
- Se usa para distribuir sesiones

---

### 4.3 Crear Examen (Wizard 4 pasos)

| Paso | Inputs | Validaciones |
|------|--------|-------------|
| 1. Info Básica | Nombre, materia, fecha | Fecha futura |
| 2. Temario | Lista de temas (1 por línea) | Mínimo 1 tema |
| 3. Material | PDFs/Docs (opcional) | Max 5 archivos, 10MB c/u |
| 4. Confirmar | Resumen visual | - |

**Al confirmar:**
- Loading: "Generando tu plan..."
- Backend llama a OpenAI
- Crea sesiones distribuidas en calendario
- Modal: "¡Examen creado! 🎉"

---

### 4.4 Generación con IA (Backend)

**Proceso automático:**

1. **Extrae texto** de archivos subidos (si los hay)
2. **Por cada tema → OpenAI genera:**
   - Contenido teórico: 5-6 secciones con texto + tips
   - Quiz: 10 preguntas opción múltiple
3. **Distribuye sesiones** en calendario según disponibilidad
   - Algoritmo simple: 1 tema por día disponible
   - Si hay más temas que días: múltiples en mismo día

**Prompt IA (simplificado):**
- Nivel secundaria, lenguaje claro
- Sin personalización de perfil ❌
- Genérico pero didáctico

**Tiempo:** ~30 segundos por tema

---

### 4.5 Calendario

**Vista mensual con dots de colores:**
- 🟢 Verde: Completada
- 🟡 Amarillo: Hoy/mañana
- 🔴 Rojo: No completada (pasada)
- 🔵 Azul: Futura

**Tap en día → Modal con sesiones del día**

---

### 4.6 Sesión de Estudio (45 min)

**Flujo fijo:**
```
FASE 1: TEORÍA (30 min)
├─ Carousel de cards con contenido teórico
├─ Swipe izq/der para navegar
├─ Tips destacados en amarillo
└─ Timer 30:00 (no bloqueante)

↓

FASE 2: DESCANSO (5 min)
├─ Pantalla relajante
├─ Timer 05:00
├─ Tips: "Tomá agua", "Estirá las piernas"
└─ Opción: Saltar descanso

↓

FASE 3: QUIZ (10 min)
├─ 10 preguntas opción múltiple
├─ 3 vidas ❤️❤️❤️
├─ 10 pts por correcta
├─ Feedback inmediato (verde ✅ / rojo ❌)
├─ Sistema de racha 🔥
└─ Pantalla final con puntaje
```

**Quiz estilo Duolingo:**
- HUD: Vidas | Pregunta X/10 | Puntos
- Respuesta correcta → +10 pts, sonido, animación
- Respuesta incorrecta → -1 vida, muestra correcta
- 0 vidas → Desaprobado (puede reintentar)

---

### 4.7 Home (Pantalla Principal)

**Layout:**
```
┌────────────────────────────────┐
│ 👤 JP    320 pts ⭐   🔥 14    │ ← Header
├────────────────────────────────┤
│ TU PRÓXIMA SESIÓN              │
│ ┌──────────────────────────┐   │
│ │ Sesión 3: Rev. Francesa  │   │
│ │ 📚 Historia              │   │
│ │ 📅 Hoy                   │   │
│ │ ████████░░ 2/5           │   │
│ │ [Comenzar sesión]        │   │
│ └──────────────────────────┘   │
├────────────────────────────────┤
│ PRÓXIMOS EXÁMENES              │
│ [Card 1] [Card 2] [Card 3] →   │
├────────────────────────────────┤
│ [Ver calendario]               │
│ [Agregar examen]               │
│ [Mi progreso]                  │
└────────────────────────────────┘
```

---

### 4.8 Progreso y Gamificación

**Sistema de puntos:**
- +70-100 pts por sesión completada (según puntaje quiz)
- Acumulativo

**Trofeos (ejemplos):**
- 🎯 Primera Sesión
- 🔥 Racha 7 días
- ⭐ Quiz Perfecto (100/100)
- 🏃 10 sesiones en 1 semana

**Racha:** Días consecutivos estudiando

**Dashboard:**
- Gráfico: Horas de estudio por semana
- Métricas: Sesiones completadas, promedio puntaje, racha
- Timeline: Últimas 10 actividades

---

### 4.9 Panel de Padre

**Vinculación:**
- Input código de 6 dígitos
- Puede vincular múltiples hijos

**Vista:**
- Dashboard idéntico al del alumno
- Solo lectura (no puede crear exámenes ni estudiar)
- Ve progreso, puntos, sesiones, estadísticas

---

## 5. NAVEGACIÓN (Tabs)
```
┌─────┬─────┬─────┬─────┐
│ 🏠  │ 📅  │ 📊  │ 👤  │
│Home │ Cal │Prog │Perf │
└─────┴─────┴─────┴─────┘
```

1. **Home:** Próxima sesión + exámenes + accesos rápidos
2. **Calendario:** Vista mensual con sesiones
3. **Progreso:** Estadísticas + gráficos + trofeos
4. **Perfil:** Avatar + puntos + racha + trofeos + config

---

## 6. STACK TECNOLÓGICO
```
Frontend:  React Native + Expo
Backend:   Supabase (DB + Auth + Storage)
IA:        OpenAI API (GPT-3.5 o GPT-4)
Libs:      
  - React Navigation (navegación)
  - react-native-calendars (calendario)
  - expo-document-picker (subir archivos)
```

---

## 7. SIMPLIFICACIONES DEL MVP

| Feature | Estado MVP | Versión Futura |
|---------|-----------|----------------|
| Onboarding perfil aprendizaje | ❌ Eliminado | ✅ Quiz opcional |
| Personalización avatar | ❌ Solo iniciales + color | ✅ Skins desbloqueables |
| Horarios específicos | ❌ Solo días + turno | ✅ Hora inicio/fin |
| Algoritmo scheduling | ⚠️ Distribución uniforme | ✅ Optimización avanzada |
| Contenido IA personalizado | ⚠️ Genérico nivel secundaria | ✅ Según perfil alumno |
| Notificaciones push | ❌ No | ✅ Recordatorios |
| Ranking social | ❌ No | ✅ Amigos + leaderboard |
| Generación imágenes IA | ❌ No | ✅ Diagramas automáticos |

---

## 8. RESUMEN TÉCNICO

### Base de Datos (Supabase)
**Tablas principales:**
- `usuario` (alumnos, padres, admins)
- `examen` (info de exámenes)
- `sesionestudio` (sesiones con fecha y estado)
- `material` (contenido teórico generado)
- `miniquiz` (preguntas en JSON)
- `disponibilidad` (días/turnos del alumno)
- `padre_alumno` (vinculación)
- `avatar_trofeo` (trofeos desbloqueados)

### Flujo de Datos
```
Usuario crea examen
  ↓
Backend: Upload archivos a Storage
  ↓
Backend: Extrae texto con pdf-parse/mammoth
  ↓
Backend: Llama OpenAI (2 prompts por tema)
  ↓
Backend: Guarda material + quiz en DB
  ↓
Backend: Crea sesiones en tabla sesionestudio
  ↓
Frontend: Actualiza calendario
Algoritmo de Distribución (Simplificado)
javascript
// MVP: Distribuir uniformemente
function distribuirSesiones(temas, disponibilidad, fechaExamen) {
  const diasDisponibles = calcularDiasEntre(hoy, fechaExamen, disponibilidad);
  
  return temas.map((tema, i) => ({
    tema,
    fecha: diasDisponibles[i % diasDisponibles.length],
    estado: 'NoCompletada'
  }));
}
```

---

## 9. TIEMPO ESTIMADO DE DESARROLLO

| Etapa | Duración | Descripción |
|-------|----------|-------------|
| 0. Setup | 1-2 días | Config proyecto, Supabase, navegación |
| 1. Auth | 2-3 días | Login, registro (alumno/padre) |
| 2. Avatar simple | 1 día | Iniciales + color aleatorio |
| 3. Home/Navegación | 2 días | Tabs + pantalla principal |
| 4. Disponibilidad | 1 día | Pantalla de días/turnos |
| 5. Crear examen UI | 2-3 días | Wizard 4 pasos |
| 6. Calendario | 2 días | Vista mensual con dots |
| 7. Sesión teoría | 3 días | Carousel de cards + timer |
| 8. Quiz | 3-4 días | Mecánica Duolingo completa |
| 9. Progreso | 2 días | Dashboard + trofeos |
| 10. Panel padre | 1 día | Vista solo lectura |
| **11. Supabase** | **4-5 días** | **Integración backend** |
| **12. OpenAI** | **3-4 días** | **Generación contenido** |
| 13. Pulido | 2-3 días | Loading states, errores, animaciones |

**TOTAL: ~30-35 días** (1-1.5 meses full-time)

---

## 10. PROMPTS PARA CURSOR (Resumen)

**Cuando empieces cada etapa, usá estos prompts:**

### Etapa 0: Setup
```
Configurar proyecto React Native + Expo con:
- React Navigation (Stack + Bottom Tabs)
- Supabase (@supabase/supabase-js)
- TypeScript
- Estructura: /app, /components, /services, /constants

Crear 4 tabs: Home, Calendario, Progreso, Perfil
```

### Etapa 1-2: Auth + Avatar
```
Crear pantallas de registro (alumno/padre) y login.
Avatar automático: círculo con iniciales + color aleatorio (5 colores).
Generar código de 6 dígitos alfanumérico.
Sin onboarding de perfil.
```

### Etapa 5: Wizard Examen
```
Wizard de 4 pasos para crear examen:
1. Nombre, materia, fecha
2. TextArea temario (1 tema por línea)
3. Upload archivos (expo-document-picker)
4. Resumen + confirmar
```

### Etapa 11: Supabase
```
Integrar Supabase:
- Auth (signUp, signIn, signOut)
- CRUD exámenes
- Upload archivos a Storage
- Guardar sesiones, quizzes
- Actualizar puntos/trofeos
```

### Etapa 12: OpenAI
```
Servicio OpenAI para generar:
1. Contenido teórico (5-6 secciones JSON)
2. Quiz (10 preguntas JSON)

Prompt genérico nivel secundaria (sin personalización).
Manejo de errores + retry.

11. PRÓXIMOS PASOS
¿Empezamos?
✅ Instalá Node.js, Expo CLI → HECHO
✅ Creaste proyecto MiApp → HECHO
🔜 Ejecutá: npx expo start y escaneá QR
🔜 Abrí proyecto en Cursor
🔜 Arrancamos con Etapa 0: Setup inicial

¿Te quedó claro? ¿Arrancamos con la Etapa 0 ahora? 🚀
Reintentar
Claude aún no tiene la capacidad de ejecutar el código que genera.
📱 FASE 2: MVP MOBILE Alcance del MVP Mobile Objetivo: App funcional con registro/login, organizador de exámenes, sesiones de estudio con IA, progreso gamificado. 2.1 Autenticación Mobile Registro de Usuario Tipos de registro: Registro como Alumno (flujo completo con onboarding) Registro co
pasted
N
Te pedi lsor equermientos de la app, algo como esto queiro "" pero claamtne con todo loq ue te pedi que tenga, no tenga y que se amas sencillo solo als cosas que te pedi
📱 Brain Buddy - Documento de Requerimientos (MVP Mobile)

1. INFORMACIÓN DEL PROYECTO
Nombre
Brain Buddy
¿Qué es?
App móvil de estudio gamificada que ayuda a estudiantes de secundaria a prepararse para exámenes mediante inteligencia artificial.
Problema
Estudiantes de secundaria (13-18 años) con bajo rendimiento que:
No saben cómo organizarse para estudiar
Les falta motivación
No tienen métodos de estudio efectivos
No reciben seguimiento personalizado
Solución
Brain Buddy automatiza todo el proceso:
El alumno carga un examen (fecha + temas)
La IA genera automáticamente un plan de estudio completo
Gamifica el proceso con puntos, trofeos y rachas
Los padres pueden ver el progreso

2. USUARIOS
Alumno (Principal)
Estudiante que usa la app para estudiar.
Puede:
Registrarse y crear cuenta
Configurar qué días puede estudiar
Agregar exámenes (nombre, materia, fecha, temas, archivos)
Estudiar sesiones (teoría + quiz)
Ganar puntos y desbloquear trofeos
Ver su progreso y estadísticas
Generar código para que sus padres lo sigan
Padre (Secundario)
Familiar que monitorea el progreso del alumno.
Puede:
Registrarse con código del hijo
Ver progreso del hijo (sesiones, puntos, racha, estadísticas)
No puede:
Crear exámenes
Estudiar sesiones
Modificar nada
Admin
No disponible en mobile. Si intenta acceder: mensaje "Usar versión web".

3. FLUJO COMPLETO (HAPPY PATH)
1. REGISTRO
   Alumno se registra → Recibe avatar automático (iniciales + color)
   → Recibe código de 6 dígitos para padres
   ↓

2. DISPONIBILIDAD
   Marca días que puede estudiar (Lun/Mar/Mié...)
   Por cada día: selecciona Mañana/Tarde/Noche
   ↓

3. CREAR EXAMEN (Wizard 4 pasos)
   Paso 1: Nombre, materia, fecha del examen
   Paso 2: Lista de temas (ej: "Revolución Francesa", "Napoleón"...)
   Paso 3: (Opcional) Sube archivos PDF/Word
   Paso 4: Confirma
   ↓

4. IA GENERA TODO AUTOMÁTICAMENTE (30-60 segundos)
   ✓ Extrae texto de archivos (si los hay)
   ✓ Genera contenido teórico por cada tema
   ✓ Genera 10 preguntas de quiz por cada tema
   ✓ Crea sesiones y las distribuye en el calendario
   ↓

5. CALENDARIO LISTO
   Aparecen todas las sesiones asignadas a fechas
   Colores: 🟢 Completada | 🟡 Hoy/mañana | 🔴 Atrasada | 🔵 Futura
   ↓

6. ESTUDIAR SESIÓN (45 minutos)
   Fase 1: Teoría (30 min) → Lee contenido en cards deslizables
   Fase 2: Descanso (5 min) → Relax con countdown
   Fase 3: Quiz (10 min) → 10 preguntas, 3 vidas, estilo Duolingo
   ↓

7. RESULTADOS
   ✓ Puntaje del quiz (ej: 80/100)
   ✓ Suma puntos a su cuenta
   ✓ Desbloquea trofeos (si aplica)
   ✓ Actualiza racha de días
   ↓

8. PROGRESO
   Ve estadísticas: horas de estudio, sesiones, promedio, racha
   Ve trofeos desbloqueados
   
9. PADRE VE TODO
   Ingresa código → Ve mismo dashboard del hijo (solo lectura)
```

---

## 4. FUNCIONALIDADES PRINCIPALES

### 4.1 Autenticación

**Registro Alumno:**
- Nombre, email, password, confirmar password, fecha nacimiento
- Avatar automático: círculo con iniciales + color aleatorio
- Código de 6 dígitos generado automáticamente
- **NO hay onboarding de perfil** ❌
- **NO hay selección de avatar personalizado** ❌

**Registro Padre:**
- Nombre, email, password, confirmar password
- Sin fecha nacimiento
- Vinculación con código de 6 dígitos

**Login:**
- Email + password
- Checkbox "Recordarme"
- Recuperar contraseña por email
- Redirección automática según tipo de usuario

---

### 4.2 Disponibilidad Horaria

**Pantalla:**
```
¿Cuándo podés estudiar?

☑️ Lunes      [Tarde]
☐ Martes
☑️ Miércoles  [Mañana] [Tarde]
☑️ Jueves     [Noche]
☐ Viernes
☑️ Sábado     [Mañana]
☐ Domingo

[Guardar]
```

**Importante:**
- Solo días + turno (Mañana/Tarde/Noche)
- **NO hay horarios específicos** (ej: 16:00-18:00) ❌
- Se usa para distribuir sesiones en el calendario

---

### 4.3 Agregar Examen (Wizard)

**Paso 1: Info Básica**
- Nombre del examen
- Materia
- Fecha del examen (date picker, debe ser futura)

**Paso 2: Temario**
- Campo de texto multi-línea
- 1 tema por línea (ej: "Revolución Francesa")
- Mínimo 1 tema requerido

**Paso 3: Material (Opcional)**
- Upload de archivos: PDF, Word, imágenes
- Máximo 5 archivos, 10MB cada uno
- Aclaración: "Si no subís material, la IA usará su conocimiento"

**Paso 4: Confirmar**
- Resumen visual de todo
- Botón: "Crear examen"

**Al confirmar:**
- Pantalla loading: "Generando tu plan de estudio..."
- Backend procesa todo con IA
- Modal éxito: "¡Examen creado! 🎉"

---

### 4.4 Generación Automática (Backend + IA)

**Proceso:**

1. **Subir archivos** a Supabase Storage (si los hay)

2. **Extraer texto** de PDFs/Word (si los hay)

3. **Por cada tema → Llamar OpenAI:**
   
   **Prompt 1:** Generar contenido teórico
   - 5-6 secciones con texto + tips
   - Nivel secundaria, lenguaje claro
   - **SIN personalización de perfil** (fue eliminado)
   - Output: JSON con estructura definida
   
   **Prompt 2:** Generar quiz
   - 10 preguntas opción múltiple
   - 3 fáciles, 4 medias, 3 difíciles
   - Output: JSON con preguntas + respuestas

4. **Distribuir sesiones en calendario:**
   - Algoritmo simple: 1 tema por día disponible
   - Si hay más temas que días: múltiples en mismo día
   - Se asignan fechas según disponibilidad del alumno

5. **Guardar todo en base de datos:**
   - Examen
   - Material generado
   - Quizzes
   - Sesiones con fechas asignadas

**Tiempo estimado:** 30-60 segundos para examen de 3 temas

---

### 4.5 Calendario

**Vista mensual** con dots de colores:
- 🟢 Verde: Sesión completada
- 🟡 Amarillo: Sesión próxima (hoy o mañana)
- 🔴 Rojo: Sesión no completada (fecha pasada)
- 🔵 Azul: Sesión futura

**Interacción:**
- Tap en día → Modal con sesiones de ese día
- Tap en sesión → Ver detalle
- Botón "Comenzar" si está disponible

---

### 4.6 Home (Pantalla Principal)

**Layout:**
```
┌──────────────────────────────┐
│ [Avatar] Juan    320 pts 🔥14│  ← Header
├──────────────────────────────┤
│ TU PRÓXIMA SESIÓN            │
│ ┌────────────────────────┐   │
│ │ Sesión 3: Rev. Francesa│   │
│ │ Historia               │   │
│ │ Hoy                    │   │
│ │ ██████░░░░ 2/5         │   │
│ │ [Comenzar sesión]      │   │
│ └────────────────────────┘   │
├──────────────────────────────┤
│ PRÓXIMOS EXÁMENES            │
│ [Card][Card][Card] →         │
├──────────────────────────────┤
│ [Ver calendario]             │
│ [Agregar examen]             │
│ [Mi progreso]                │
└──────────────────────────────┘
```

**Botón "Comenzar sesión":**
- Solo habilitado si es hoy o fecha pasada
- Deshabilitado si es futura o ya completada

---

### 4.7 Sesión de Estudio (45 min)

**Estructura fija:**
```
FASE 1: TEORÍA (30 minutos)
├─ Pantalla inicio: "¡Vamos a estudiar [Tema]!"
├─ Carousel de cards (swipe horizontal)
│  ├─ Cada card: Título + Texto + Tip destacado
│  └─ Progress: "Card 3 de 6"
├─ Timer: 30:00 (no bloqueante)
└─ Al terminar: "¡Tomá un descanso!"

↓

FASE 2: DESCANSO (5 minutos)
├─ Ilustración relajante
├─ Timer: 05:00
├─ Tips: "Tomá agua", "Estirá"
└─ Botón: "Saltar descanso"

↓

FASE 3: QUIZ (10 minutos)
├─ Pantalla intro: "10 preguntas, 3 vidas"
├─ Por cada pregunta:
│  ├─ HUD: ❤️❤️❤️ | Pregunta X/10 | Puntos
│  ├─ Texto pregunta + 4 opciones
│  ├─ Feedback inmediato:
│  │  ├─ Correcta → Verde ✅ +10 pts
│  │  └─ Incorrecta → Roja ❌ -1 vida
│  └─ Sistema de racha 🔥
├─ Si 0 vidas → "Desaprobado, reintentar"
└─ Si completa → Pantalla resultados
```

**Pantalla de Resultados:**
```
¡Quiz completado! 🎉

Puntaje: 80/100
Vidas: ❤️❤️
Racha máxima: 🔥 x7

[Ver respuestas] [Continuar]
```

**Recompensas:**
- Puntos se suman a la cuenta
- Se actualiza racha de días
- Se revisan condiciones de trofeos
- Estado sesión → "Completada"

---

### 4.8 Progreso y Gamificación

**Pantalla Perfil:**
- Avatar (iniciales + color)
- Nombre
- Puntos totales + barra progreso
- Racha de días: 🔥 x14
- Grid de trofeos (obtenidos y bloqueados)
- Estadísticas: sesiones, horas, promedio

**Dashboard Progreso:**
- Gráfico: Horas de estudio por semana
- Métricas:
  - Sesiones completadas: X/Y
  - Promedio puntaje: 82/100
  - Racha actual: 🔥 14 días
- Timeline: Últimas 10 actividades
- Vista por examen (detalle de cada examen)

**Trofeos (ejemplos):**
- 🎯 Primera Sesión
- 🔥 Racha 7 días consecutivos
- ⭐ Quiz Perfecto (100/100)
- 🏃 10 sesiones en 1 semana
- 📚 5 materias diferentes
- 💪 10 horas acumuladas

---

### 4.9 Panel de Padre

**Vinculación:**
- Input código de 6 dígitos
- Puede vincular múltiples hijos

**Dashboard:**
- Idéntico al dashboard del alumno
- Solo visualización (no puede editar nada)
- Ve: progreso, puntos, sesiones, estadísticas, racha
- Selector si tiene múltiples hijos

---

## 5. NAVEGACIÓN (4 TABS)
```
┌────────┬────────┬────────┬────────┐
│   🏠   │   📅   │   📊   │   👤   │
│  Home  │  Cal.  │ Progr. │ Perfil │
└────────┴────────┴────────┴────────┘
```

1. **Home:** Próxima sesión + exámenes próximos + accesos rápidos
2. **Calendario:** Vista mensual con sesiones
3. **Progreso:** Estadísticas + gráficos + trofeos
4. **Perfil:** Avatar + puntos + racha + configuración

---

## 6. TECNOLOGÍAS

| Componente | Tecnología |
|------------|------------|
| Frontend | React Native + Expo |
| Backend | Supabase (DB + Auth + Storage) |
| IA | OpenAI API (GPT-3.5 o GPT-4) |
| Navegación | React Navigation |
| Calendario | react-native-calendars |
| Archivos | expo-document-picker |
| Extracción texto | pdf-parse, mammoth |

---

## 7. SIMPLIFICACIONES DEL MVP

| Feature | Estado | Notas |
|---------|--------|-------|
| Onboarding perfil aprendizaje | ❌ **Eliminado** | IA genera contenido genérico |
| Avatar personalizado | ❌ **Simplificado** | Solo iniciales + color aleatorio |
| Horarios específicos | ❌ **Solo días + turno** | Futuro: hora inicio/fin |
| Algoritmo scheduling avanzado | ❌ **Distribución uniforme** | Futuro: optimización |
| Personalización contenido IA | ❌ **Genérico secundaria** | Futuro: según perfil |
| Notificaciones push | ❌ **No** | Futuro: recordatorios |
| Ranking social | ❌ **No** | Futuro: amigos + leaderboard |
| Generación imágenes IA | ❌ **No** | Futuro: diagramas |

---

## 8. BASE DE DATOS (PRINCIPALES TABLAS)
```
usuario
├─ id, nombre, email, password, rol, fecha_nacimiento
└─ codigo_vinculacion (para padres)

examen
├─ id, usuario_id, nombre, materia, fecha
└─ estado

sesionestudio
├─ id, examen_id, nombre, tema, fecha
├─ estado (NoCompletada/Completada)
└─ material_id, quiz_id

material
├─ id, tipo (teorico_generado)
└─ contenido_json (secciones con texto)

miniquiz
├─ id, sesion_id
├─ preguntas_json (10 preguntas)
└─ puntaje_maximo (100)

disponibilidad
├─ id, usuario_id
├─ dia_semana, turno
└─ (hora_inicio, hora_fin para futuro)

padre_alumno
├─ padre_id, alumno_id
└─ (vinculación)

avatar_trofeo
├─ usuario_id, trofeo_id
└─ fecha_obtencion

9. ALGORITMO DE DISTRIBUCIÓN (SIMPLIFICADO)
javascript
// MVP: Distribuir uniformemente
function distribuirSesiones(temas, disponibilidad, fechaExamen) {
  // 1. Calcular días disponibles entre hoy y fecha examen
  const diasDisponibles = obtenerDiasDisponibles(
    disponibilidad, 
    fechaExamen
  );
  
  // 2. Asignar 1 tema por día disponible
  return temas.map((tema, index) => ({
    tema: tema,
    fecha: diasDisponibles[index % diasDisponibles.length],
    estado: 'NoCompletada'
  }));
}
```

**Ejemplo:**
```
Examen: 20 octubre
Hoy: 15 octubre
Disponibilidad: Lunes, Miércoles, Sábado
Temas: ["Rev. Francesa", "Napoleón", "Restauración"]

Días disponibles hasta 20/10:
- Lunes 16/10
- Miércoles 18/10
- (Sábado 21/10 descartado, es después del examen)

Resultado:
✓ Sesión 1: Rev. Francesa → Lunes 16/10
✓ Sesión 2: Napoleón → Miércoles 18/10
✓ Sesión 3: Restauración → Miércoles 18/10 (cicla)