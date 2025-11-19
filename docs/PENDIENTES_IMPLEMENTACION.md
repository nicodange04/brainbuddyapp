# 📋 PENDIENTES DE IMPLEMENTACIÓN - Brain Buddy MVP

## ✅ LO QUE YA ESTÁ IMPLEMENTADO

### Autenticación
- ✅ Login
- ✅ Registro (Alumno y Padre)
- ✅ Avatar automático (iniciales + color)
- ✅ Código de vinculación generado
- ❌ **FALTA: Recuperar contraseña** (hay botón pero no funcional)

### Navegación
- ✅ 4 Tabs: Home, Calendario, Progreso, Perfil
- ✅ Stack navigation para pantallas modales

### Home
- ✅ Próxima sesión
- ✅ Próximos exámenes
- ✅ Navegación a otras secciones

### Calendario
- ✅ Vista mensual con dots de colores
- ✅ Sesiones por día
- ✅ Navegación a sesión de estudio

### Disponibilidad
- ✅ Configurar días y turnos

### Crear Examen
- ✅ Wizard 4 pasos
- ✅ Subida de archivos
- ✅ Generación automática con IA (background)
- ✅ Distribución de sesiones

### Sesión de Estudio
- ✅ Fase 1: Teoría (carousel de cards)
- ✅ Fase 2: Descanso (timer)
- ✅ Fase 3: Quiz (estilo Duolingo con vidas)
- ✅ Fase 4: Resultados
- ❌ **FALTA: Botón "Ver respuestas" en resultados**

### Progreso
- ✅ Métricas principales
- ✅ Gráfico de horas por día
- ✅ Progreso por examen
- ✅ Trofeos
- ❌ **FALTA: Timeline de últimas 10 actividades**

### Perfil
- ✅ Avatar, nombre, estadísticas
- ✅ Trofeos
- ✅ Código de vinculación
- ✅ Editar perfil
- ✅ Cambiar contraseña
- ✅ Notificaciones

---

## ❌ LO QUE FALTA IMPLEMENTAR

### 1. RECUPERAR CONTRASEÑA 🔴 **ALTA PRIORIDAD**

**Ubicación:** `app/login.tsx` (botón existe pero no funcional)

**Requisitos:**
- Pantalla para ingresar email
- Enviar email de recuperación usando Supabase Auth
- Mensaje de confirmación

**Implementación sugerida:**
```typescript
// app/recuperar-contrasena.tsx
// Usar: supabase.auth.resetPasswordForEmail(email)
```

---

### 2. PANEL DE PADRE 🔴 **ALTA PRIORIDAD**

**Estado actual:** Los padres pueden registrarse, pero no hay vista específica para ellos.

**Requisitos según `requirements.md`:**
- Dashboard idéntico al del alumno (solo lectura)
- Ver progreso, puntos, sesiones, estadísticas, racha
- Selector si tiene múltiples hijos vinculados
- No puede crear exámenes ni estudiar sesiones

**Implementación necesaria:**

1. **Servicio para obtener hijos vinculados:**
   ```typescript
   // services/padre.ts
   - getHijosVinculados(padreId: string)
   - cambiarHijoActivo(hijoId: string)
   ```

2. **Modificar pantallas existentes para modo "solo lectura":**
   - `app/(tabs)/index.tsx` - Ocultar botones de acción si es padre
   - `app/(tabs)/calendario.tsx` - Solo visualización
   - `app/(tabs)/progreso.tsx` - Mostrar datos del hijo seleccionado
   - `app/(tabs)/perfil.tsx` - Mostrar perfil del hijo

3. **Selector de hijo en header:**
   - Si tiene múltiples hijos, mostrar dropdown/selector
   - Si tiene 1 hijo, mostrar directamente

4. **Ocultar funcionalidades:**
   - Botón "Agregar examen" en Home
   - Botón "Comenzar sesión" (o deshabilitarlo)
   - Botón "Configurar disponibilidad" en Calendario
   - Editar perfil (o mostrar perfil del hijo)

---

### 3. TIMELINE DE ACTIVIDADES EN PROGRESO 🟡 **MEDIA PRIORIDAD**

**Ubicación:** `app/(tabs)/progreso.tsx`

**Requisitos:**
- Mostrar últimas 10 actividades
- Formato: "Completó sesión X del examen Y - 2 días atrás"
- Incluir: sesiones completadas, trofeos obtenidos, exámenes creados

**Implementación:**
```typescript
// services/progreso.ts
export async function getTimelineActividades(alumnoId: string): Promise<Actividad[]> {
  // Obtener últimas 10 actividades ordenadas por fecha
  // Combinar: sesiones completadas, trofeos, exámenes creados
}
```

---

### 4. BOTÓN "VER RESPUESTAS" EN RESULTADOS DEL QUIZ 🟡 **MEDIA PRIORIDAD**

**Ubicación:** `app/sesion-estudio.tsx` (Fase 4: Resultados)

**Requisitos:**
- Botón "Ver respuestas" en pantalla de resultados
- Mostrar todas las preguntas con:
  - Respuesta seleccionada por el usuario
  - Respuesta correcta
  - Explicación de cada pregunta

**Implementación:**
- Nueva fase o modal: `'verRespuestas'`
- Mostrar lista de preguntas con estado (correcta/incorrecta)
- Scrollable con todas las respuestas

---

### 5. VISTA DETALLADA POR EXAMEN EN PROGRESO 🟢 **BAJA PRIORIDAD**

**Estado actual:** Hay cards de progreso por examen, pero no hay vista detallada.

**Requisitos:**
- Al tocar un examen en Progreso, mostrar:
  - Lista de todas las sesiones del examen
  - Estado de cada sesión (Completada/NoCompletada)
  - Puntajes obtenidos
  - Fechas programadas vs completadas

**Implementación:**
- Nueva pantalla: `app/detalle-examen.tsx`
- Navegar desde `ExamProgressCard` al tocar

---

### 6. MEJORAS MENORES 🟢 **BAJA PRIORIDAD**

#### 6.1. Validación de Admin
- Si un admin intenta acceder, mostrar mensaje: "Usar versión web"
- Actualmente no hay validación

#### 6.2. Recordatorio de disponibilidad
- Si el alumno no tiene disponibilidad configurada, mostrar alerta
- Sugerir configurar antes de crear examen

#### 6.3. Mejoras en Home
- El botón "Comenzar sesión" debería estar deshabilitado si:
  - La sesión es futura
  - La sesión ya está completada
- Actualmente solo verifica si existe

#### 6.4. Mejoras en Calendario
- Los colores de los dots deberían ser más consistentes:
  - 🟢 Verde: Completada
  - 🟡 Amarillo: Hoy/mañana
  - 🔴 Rojo: Atrasada (fecha pasada, no completada)
  - 🔵 Azul: Futura

---

## 📊 RESUMEN DE PRIORIDADES

### 🔴 ALTA PRIORIDAD (Crítico para MVP)
1. **Recuperar contraseña** - Funcionalidad básica de autenticación
2. **Panel de Padre** - Feature principal según requisitos

### 🟡 MEDIA PRIORIDAD (Mejora UX)
3. **Timeline de actividades** - Mencionado en requisitos
4. **Ver respuestas del quiz** - Mencionado en requisitos

### 🟢 BAJA PRIORIDAD (Nice to have)
5. Vista detallada por examen
6. Validación de admin
7. Mejoras menores en UX

---

## 🎯 ESTIMACIÓN DE TIEMPO

| Feature | Tiempo Estimado |
|---------|----------------|
| Recuperar contraseña | 2-3 horas |
| Panel de Padre (completo) | 1-2 días |
| Timeline de actividades | 3-4 horas |
| Ver respuestas quiz | 2-3 horas |
| Vista detalle examen | 3-4 horas |
| Mejoras menores | 2-3 horas |

**Total estimado:** ~2-3 días de desarrollo

---

## 📝 NOTAS ADICIONALES

### Migraciones SQL pendientes
- ✅ `migration_agregar_material_generado.sql` - HECHO
- ✅ `migration_preferencias_notificaciones.sql` - CREADA (pendiente ejecutar)

### Servicios que podrían necesitarse
- `services/padre.ts` - Para gestionar hijos vinculados
- `services/timeline.ts` - Para obtener timeline de actividades
- `services/password.ts` - Ya existe, solo falta la UI de recuperación

### Componentes que podrían necesitarse
- `components/SelectorHijo.tsx` - Para padres con múltiples hijos
- `components/TimelineActividad.tsx` - Para mostrar actividades
- `components/VerRespuestas.tsx` - Para mostrar respuestas del quiz

---

## ✅ CHECKLIST FINAL

- [ ] Recuperar contraseña implementado
- [ ] Panel de Padre funcional
- [ ] Selector de hijo para padres múltiples
- [ ] Timeline de actividades en Progreso
- [ ] Botón "Ver respuestas" en resultados del quiz
- [ ] Vista detallada por examen (opcional)
- [ ] Validación de admin (opcional)
- [ ] Mejoras menores de UX (opcional)





