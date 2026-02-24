# 🚀 Cómo Ejecutar Migraciones SQL

## ❓ ¿Puedo ejecutar migraciones desde aquí?

**Respuesta corta:** No directamente, pero te facilitamos el proceso.

## 🔍 ¿Por qué?

Supabase **no permite ejecutar SQL arbitrario** desde el cliente JavaScript por seguridad. Las operaciones DDL (CREATE TABLE, ALTER TABLE, etc.) requieren ejecutarse desde:
- El SQL Editor de Supabase (recomendado)
- Una función RPC creada específicamente
- El REST API con Service Role Key (avanzado)

## ✅ Opción 1: SQL Editor (Recomendado - Más Fácil)

### Pasos:

1. **Abre Supabase Dashboard**
   - Ve a https://supabase.com/dashboard
   - Inicia sesión
   - Selecciona tu proyecto

2. **Abre SQL Editor**
   - En el menú lateral, haz clic en "SQL Editor"
   - O ve directamente a: `https://supabase.com/dashboard/project/[tu-proyecto]/sql`

3. **Crea nueva query**
   - Haz clic en "New query"
   - O usa el botón "+"

4. **Copia el SQL**
   - Abre el archivo `sql/migration_perfil_aprendizaje.sql`
   - Copia todo el contenido (Ctrl+A, Ctrl+C)

5. **Pega y ejecuta**
   - Pega el SQL en el editor
   - Haz clic en "Run" o presiona `Ctrl+Enter` (Windows) / `Cmd+Enter` (Mac)

6. **Verifica**
   - Deberías ver "Success" en verde
   - La tabla `perfil_aprendizaje` debería estar creada

### 🎯 Comando Rápido (Windows PowerShell)

```powershell
# Copiar SQL al portapapeles
Get-Content sql/migration_perfil_aprendizaje.sql | Set-Clipboard
```

Luego solo pega en el SQL Editor.

## ⚙️ Opción 2: Script Helper (Muestra el SQL)

Ejecuta:

```bash
npm run migrate-perfil
```

Este script:
- ✅ Lee el archivo SQL
- ✅ Muestra el contenido
- ✅ Te da instrucciones paso a paso
- ⚠️ No puede ejecutarlo automáticamente (limitación de Supabase)

## 🔧 Opción 3: Service Role Key (Avanzado - No Recomendado)

Si realmente necesitas ejecutar desde código:

1. **Obtén tu Service Role Key:**
   - Ve a Settings > API
   - Copia la "service_role" key (⚠️ NUNCA la expongas en el cliente)

2. **Agrégala a .env:**
   ```
   SUPABASE_SERVICE_ROLE_KEY=tu_service_role_key
   ```

3. **Crea una función RPC en Supabase:**
   ```sql
   CREATE OR REPLACE FUNCTION exec_sql(sql_query text)
   RETURNS void
   LANGUAGE plpgsql
   SECURITY DEFINER
   AS $$
   BEGIN
     EXECUTE sql_query;
   END;
   $$;
   ```

4. **Usa el script:**
   ```bash
   npx ts-node scripts/ejecutar-migracion-perfil-service.ts
   ```

⚠️ **ADVERTENCIA:** Esta opción es avanzada y requiere configurar seguridad adicional. No recomendada para producción.

## 📋 Resumen de Opciones

| Opción | Facilidad | Seguridad | Recomendado |
|--------|-----------|-----------|-------------|
| SQL Editor | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ✅ Sí |
| Script Helper | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ✅ Sí (para ver SQL) |
| Service Role | ⭐⭐ | ⭐⭐ | ❌ Solo avanzados |

## 🎯 Recomendación

**Usa el SQL Editor de Supabase.** Es:
- ✅ Más seguro
- ✅ Más fácil
- ✅ Tiene validación de sintaxis
- ✅ Muestra errores claros
- ✅ Permite guardar queries

## 💡 Tip Pro

Puedes crear un "snippet" en Supabase SQL Editor:
1. Ejecuta la migración una vez
2. Guarda la query como "Migration: perfil_aprendizaje"
3. La próxima vez, solo busca y ejecuta

## ❓ ¿Por qué no hay un MCP real?

Lo que creamos antes fue:
- ✅ Contexto para Cursor (`.cursorrules`)
- ✅ Scripts de exploración
- ✅ Documentación

Pero **NO** un servidor MCP real que ejecute SQL, porque:
- Supabase no expone ejecución SQL arbitraria por seguridad
- Requeriría Service Role Key (riesgo de seguridad)
- El SQL Editor es la forma oficial y segura

## 🚀 Próximos Pasos

1. Ejecuta la migración usando el SQL Editor
2. Verifica que la tabla se creó:
   ```sql
   SELECT * FROM perfil_aprendizaje LIMIT 1;
   ```
3. ¡Listo! Ya puedes usar el onboarding
