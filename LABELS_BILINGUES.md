# Sistema de Labels Bilingües

Este proyecto ahora soporta labels bilingües (español/inglés) de forma automática y transparente para los componentes.

## Cómo funciona

### 1. Idioma por defecto
- **En modo desarrollo**: Usa español (`es`) por defecto
- **En producción**: El idioma vendrá del sistema de login/autenticación

### 2. Formato de labels en formConfig.ts

Los labels ahora pueden ser strings simples O objetos bilingües:

```typescript
// Label simple (solo español)
{ value: 'option1', label: 'Opción 1' }

// Label bilingüe (español e inglés)
{
  value: 'Mastil',
  label: { es: 'Mástil', en: 'Mast' }
}
```

### 3. Uso en componentes

Los componentes NO necesitan preocuparse por el idioma. Simplemente usan `getTranslatedOptions`:

```typescript
import { MAST_TYPES, getTranslatedOptions } from '@/config/formConfig'

function MiComponente() {
  // Obtener opciones traducidas automáticamente
  const translatedMastTypes = useMemo(() => getTranslatedOptions(MAST_TYPES), [])

  return (
    <CardSelect
      options={translatedMastTypes}  // ← Usa las opciones traducidas
      // ... otras props
    />
  )
}
```

## Cómo migrar opciones existentes

### Paso 1: Convertir labels a formato bilingüe

En `formConfig.ts`, cambia de esto:

```typescript
export const MIS_OPCIONES: SelectOption[] = [
  { value: 'opcion1', label: 'Mi opción' },
]
```

A esto:

```typescript
export const MIS_OPCIONES: SelectOption[] = [
  {
    value: 'opcion1',
    label: { es: 'Mi opción', en: 'My option' }
  },
]
```

### Paso 2: Actualizar el componente

En tu componente:

```typescript
// Antes
<CardSelect options={MIS_OPCIONES} />

// Después
const translatedOptions = useMemo(() => getTranslatedOptions(MIS_OPCIONES), [])
<CardSelect options={translatedOptions} />
```

## Ejemplos actuales

### MAST_TYPES (ya migrado)

```typescript
export const MAST_TYPES: SelectOption[] = [
  {
    value: 'Mastil',
    label: { es: 'Mástil', en: 'Mast' }
  },
  {
    value: 'TCelosia',
    label: { es: 'Torreta triangular', en: 'Triangular Tower' }
  },
]
```

Usado en `ProtectionSchemeStep.tsx`:

```typescript
const translatedMastTypes = useMemo(() => getTranslatedOptions(MAST_TYPES), [])

<CardSelect
  options={translatedMastTypes}
  // ...
/>
```

## Funciones disponibles

### `getTranslatedOptions(options)`
Transforma un array de opciones con labels bilingües a opciones con labels traducidos según el idioma actual.

```typescript
const translatedOptions = getTranslatedOptions(MAST_TYPES)
// Resultado en español: [{ value: 'Mastil', label: 'Mástil' }, ...]
// Resultado en inglés:  [{ value: 'Mastil', label: 'Mast' }, ...]
```

### `getOptionLabel(options, value)`
Obtiene el label traducido de una opción específica por su valor.

```typescript
const label = getOptionLabel(MAST_TYPES, 'Mastil')
// Resultado en español: 'Mástil'
// Resultado en inglés:  'Mast'
```

### `transformLabel(label)`
Transforma un label bilingüe individual a string según el idioma actual.

```typescript
const label = transformLabel({ es: 'Mástil', en: 'Mast' })
// Resultado en español: 'Mástil'
// Resultado en inglés:  'Mast'
```

## Ventajas

1. **Código más limpio**: Los componentes no se preocupan por el idioma
2. **Fácil mantenimiento**: Todas las traducciones están en `formConfig.ts`
3. **Type-safe**: TypeScript valida que los labels tengan ambos idiomas
4. **Retrocompatible**: Soporta labels simples (string) y bilingües
5. **Rendimiento**: Las traducciones se calculan una sola vez con `useMemo`

## Próximos pasos

Para completar la migración del proyecto:

1. Convertir todas las constantes de opciones en `formConfig.ts` a formato bilingüe
2. Actualizar todos los componentes para usar `getTranslatedOptions`
3. Conectar el idioma con el sistema de autenticación/login
