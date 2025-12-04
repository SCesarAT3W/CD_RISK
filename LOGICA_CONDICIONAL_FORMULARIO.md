# Lógica Condicional del Formulario de Presupuestos

Este documento describe las reglas de visualización condicional del formulario de presupuestos de sistemas de protección contra rayos. Cada sección explica qué campos se muestran u ocultan según las selecciones del usuario.

---

## Índice
1. [Módulo de Cliente y Contacto](#módulo-de-cliente-y-contacto)
2. [Modelo de Pararrayos](#modelo-de-pararrayos)
3. [Normativa y Nivel de Protección](#normativa-y-nivel-de-protección)
4. [Datos del Edificio y Soporte](#datos-del-edificio-y-soporte)
5. [Anclajes](#anclajes)
6. [Material del Conductor](#material-del-conductor)
7. [Fijaciones](#fijaciones)
8. [Elementos Adicionales](#elementos-adicionales)
9. [Resumen de Dependencias](#resumen-de-dependencias)

---

## Módulo de Cliente y Contacto

### Regla 1: Selección de Contacto
**Condición**: Solo se puede seleccionar un contacto si primero se ha seleccionado un cliente.

**Comportamiento**:
- **Sin cliente seleccionado**:
  - El selector de contactos está deshabilitado
  - Muestra mensaje: "Primero seleccione un cliente"

- **Con cliente seleccionado**:
  - El selector de contactos se activa
  - Muestra solo los contactos asociados al cliente seleccionado
  - Al seleccionar un contacto, se autorellenan los campos de datos de contacto

**Campos autocompletados al seleccionar contacto**:
- Nombre del contacto
- Email
- Teléfono
- Móvil
- Cargo

---

## Modelo de Pararrayos

### Regla 2: Selección Jerárquica - Tipo y Variante
**Condición**: Primero se selecciona el tipo de pararrayos, luego aparecen las variantes disponibles.

**Comportamiento**:

**Paso 1: Selección del Tipo**
El usuario selecciona uno de los tipos disponibles:
- DAT CONTROLER REMOTE (01.01)
- DAT CONTROLER PLUS (01.02)
- FLASH CAPTOR (01.03)
- PUNTA FRANKLIN (01.04)

**Paso 2: Mostrar Variantes**
Una vez seleccionado el tipo, aparece una nueva sección con las variantes específicas:

| Tipo Seleccionado | Variantes Mostradas |
|-------------------|---------------------|
| DAT CONTROLER REMOTE | REMOTE 15, REMOTE 30, REMOTE 45, REMOTE 60 |
| DAT CONTROLER PLUS | PLUS 15, PLUS 30, PLUS 45, PLUS 60 |
| FLASH CAPTOR | FLASH 15, FLASH 30, FLASH 45, FLASH 60 |
| PUNTA FRANKLIN | FRANKLIN ACERO INOX, FRANKLIN COBRE |

**Estados**:
- Si no hay tipo seleccionado → No se muestran variantes
- Si hay tipo seleccionado → Se muestran solo las variantes de ese tipo
- Si se cambia de tipo → Se limpian las variantes anteriores y se muestran las nuevas

---

## Normativa y Nivel de Protección

### Regla 3: Selección Jerárquica - Normativa y Nivel
**Condición**: Primero se selecciona la normativa aplicable, luego aparecen los niveles de protección disponibles.

**Comportamiento**:

**Paso 1: Selección de Normativa**
El usuario selecciona una normativa:
- UNE 21.186:2011 (02.01)
- CTE SUA-8 (02.02)

**Paso 2: Mostrar Niveles**
Según la normativa seleccionada, se muestran los niveles correspondientes:

| Normativa Seleccionada | Niveles Mostrados |
|------------------------|-------------------|
| UNE 21.186:2011 | Nivel I, Nivel II, Nivel III, Nivel IV |
| CTE SUA-8 | Nivel 1, Nivel 2, Nivel 3, Nivel 4 |

**Estados**:
- Si no hay normativa seleccionada → No se muestran niveles
- Si hay normativa seleccionada → Se muestran solo los niveles de esa normativa
- Si se cambia de normativa → Se limpian los niveles anteriores y se muestran los nuevos

---

## Datos del Edificio y Soporte

### Regla 4: Selección de Tipo de Soporte y Altura
**Condición**: Primero se selecciona el tipo de soporte, luego se muestran las alturas disponibles para ese tipo.

**Comportamiento**:

**Paso 1: Selección del Tipo de Soporte**
El usuario selecciona uno de los tipos:
- Mástil (05.01)
- Torreta triangular (05.02)
- Torre cuadrada (05.03)
- Mástil autónomo (05.04)

**Paso 2: Mostrar Alturas Disponibles**
Según el tipo seleccionado, se muestran las alturas compatibles:

| Tipo de Soporte | Alturas Disponibles |
|-----------------|---------------------|
| Mástil | 2m, 3m, 4m, 6m, 8m |
| Torreta triangular | 5.5m, 8.5m, 11.5m, 14.5m, 17.5m, 20.5m, 23.5m, 26.5m |
| Torre cuadrada | 14m, 16m, 18m, 20m, 22m, 24m, 26m |
| Mástil autónomo | 6m, 8m, 10m, 12m, 15m, 18m, 20m, 25m, 30m, 40m |

**Estados**:
- Si no hay tipo de soporte seleccionado → No se muestran alturas
- Si hay tipo de soporte seleccionado → Se muestra selector de alturas con opciones específicas
- Si se cambia el tipo de soporte → Se limpia la altura anterior y se actualiza el selector

---

## Anclajes

### Regla 5: Visibilidad del Campo de Anclaje
**Condición**: El campo de anclaje SOLO se muestra si el tipo de soporte seleccionado es "Mástil" (05.01).

**Comportamiento**:

| Tipo de Soporte Seleccionado | ¿Se muestra el campo de Anclaje? |
|------------------------------|-----------------------------------|
| Mástil (05.01) | ✅ SÍ |
| Torreta triangular (05.02) | ❌ NO |
| Torre cuadrada (05.03) | ❌ NO |
| Mástil autónomo (05.04) | ❌ NO |

### Regla 6: Anclajes Compatibles con la Altura
**Condición**: Los anclajes mostrados dependen de la altura del mástil seleccionado.

**Comportamiento**:
- Si no se ha seleccionado altura → Selector de anclajes deshabilitado con mensaje "Seleccione soporte primero"
- Si se ha seleccionado altura → Se muestran solo los anclajes compatibles con esa altura

**Compatibilidad Altura-Anclaje**:

**Para Mástiles de 2m, 3m, 4m y 6m:**
- Anclaje tejado plano mast 3m (06.01.01) - Solo para 2m y 3m
- Anclaje tejado plano mast 6m (06.01.02) - Solo para 4m y 6m
- Anclaje en U 15cm (2-6m) (06.02.01)
- Anclaje en U 30cm (2-6m) (06.02.03)
- Anclaje en U 60cm (2-6m) (06.02.05)
- Anclaje ligero 30 cm (2-6m) (06.03.01)
- Anclaje doble brida H (2-6m) (06.04.01)
- Anclaje paralelo (2-6m) (06.05.01)
- Anclaje ajustable 60/80 (2-6m) (06.06.01)
- Anclaje barra 30cm (2-6m) (06.07.01)
- Anclaje barra 60cm (2-6m) (06.07.03)
- Anclaje barra 100cm (2-6m) (06.07.05)

**Para Mástil de 8m:**
- Anclaje en U 15cm (8m) (06.02.02)
- Anclaje en U 30cm (8m) (06.02.04)
- Anclaje en U 60cm (8m) (06.02.06)
- Anclaje ligero 30 cm (8m) (06.03.02)
- Anclaje doble brida H (8m) (06.04.02)
- Anclaje paralelo (8m) (06.05.02)
- Anclaje ajustable 60/80 (8m) (06.06.02)
- Anclaje barra 30cm (8m) (06.07.02)
- Anclaje barra 60cm (8m) (06.07.04)

**Estados**:
- Si se cambia la altura del soporte → Se limpia el anclaje seleccionado anteriormente
- El selector muestra solo los anclajes compatibles con la altura actual

---

## Material del Conductor

### Regla 7: Selección Jerárquica - Material y Naturaleza
**Condición**: Primero se selecciona el tipo de material, luego aparecen las naturalezas/variantes disponibles.

**Comportamiento**:

**Paso 1: Selección del Tipo de Material**
El usuario selecciona uno de los tipos:
- Pletina (07.01)
- Cable trenzado (07.02)
- Redondo (07.03)

**Paso 2: Mostrar Naturalezas**
Según el tipo de material seleccionado, se muestran las variantes:

| Tipo de Material | Naturalezas/Variantes Mostradas |
|------------------|----------------------------------|
| Pletina | Pletina cobre estañado 30x2mm, Pletina de aluminio 25x3mm |
| Cable trenzado | Cable Cu trenzado 50mm², Cable Cu trenzado 70mm² |
| Redondo | Redondo de cobre Ø8mm, Redondo aleación Al ø8mm |

**Estados**:
- Si no hay tipo de material seleccionado → No se muestran naturalezas
- Si hay tipo de material seleccionado → Se muestran solo las naturalezas de ese tipo
- Si se cambia el tipo de material → Se limpian las naturalezas anteriores y se actualizan las fijaciones

### Regla 8: Actualización Automática de Fijaciones
**Condición**: Al cambiar el material, se verifica si la fijación actual es compatible.

**Comportamiento**:
- Si la fijación seleccionada es compatible con el nuevo material → Se mantiene
- Si la fijación seleccionada NO es compatible con el nuevo material → Se limpia automáticamente

---

## Fijaciones

### Regla 9: Visibilidad del Campo de Fijaciones
**Condición**: El campo de fijaciones NO se muestra si el tipo de soporte es "Mástil autónomo" (05.04).

**Comportamiento**:

| Tipo de Soporte Seleccionado | ¿Se muestra el campo de Fijaciones? |
|------------------------------|-------------------------------------|
| Mástil (05.01) | ✅ SÍ |
| Torreta triangular (05.02) | ✅ SÍ |
| Torre cuadrada (05.03) | ✅ SÍ |
| Mástil autónomo (05.04) | ❌ NO |

**Razón**: Los mástiles autónomos no requieren fijaciones adicionales ya que son estructuras independientes.

### Regla 10: Fijaciones Compatibles con el Material
**Condición**: Las fijaciones mostradas dependen del material del conductor seleccionado.

**Comportamiento**:
- Si no hay material seleccionado → Se muestran todas las fijaciones
- Si hay material seleccionado → Se filtran y muestran solo las fijaciones compatibles

**Compatibilidad Material-Fijación**:

| Fijación | Compatible con estos Materiales |
|----------|----------------------------------|
| Grapa latón para cable Ø6-10mm | Cable Cu trenzado 50mm², Cable Cu trenzado 70mm², Redondo de cobre Ø8mm |
| Grapa nylon cable o pletina 17mm | Todas las variantes de Pletina, Cable trenzado y Redondo |
| Grapa inox para cable Ø6-10mm | Cable Cu trenzado 50mm², Cable Cu trenzado 70mm², Redondo de cobre Ø8mm, Redondo aleación Al ø8mm |
| Grapa hebilla inox 30x2-30x3.5mm | Pletina cobre estañado 30x2mm, Pletina de aluminio 25x3mm |

**Estados**:
- Si se cambia el material del conductor → Se actualizan las fijaciones disponibles
- Si la fijación actual no es compatible → Se limpia automáticamente
- Muestra indicador visual: "(Compatibles con [Tipo de Material])"

---

## Elementos Adicionales

### Regla 11: Panel de Opciones Adicionales
**Condición**: El panel de opciones adicionales se muestra dinámicamente según los elementos marcados.

**Comportamiento del Panel Lateral**:

**Estado Inicial (Ningún elemento marcado)**:
- Muestra mensaje: "Seleccione un elemento para ver opciones adicionales"
- El panel está visible pero vacío

**Cuando se marca "Contador de impactos" (09)**:
- Se activa sección: "Opciones de Contador"
- Aparecen opciones:
  - Contador electromecánico (09.01)
  - ATLOGGER (09.02)

**Cuando se marca "Vía chispas antena" (11)**:
- Se activa sección: "Opciones de Vía Chispas Antena"
- Aparecen campos:
  - Cantidad de antenas (11.01)
  - Distancia a unir (11.02)
  - Superficie: selector con opciones (Pared, Terraza, Teja) (11.03)

**Cuando se marca "Vía chispas tierras" (10)**:
- Se activa sección: "Opciones de Vía Chispas Tierras"
- Aparecen campos:
  - Cantidad de tierras (10.01)
  - Distancia a unir general (10.02)

**Estados del Panel**:
- Ningún elemento marcado → Mensaje de placeholder
- Uno o más elementos marcados → Secciones correspondientes visibles
- Las secciones se muestran en este orden: Contador, Vía chispas antena, Vía chispas tierras
- Cada sección tiene un separador visual

### Regla 12: Limpieza de Opciones Adicionales
**Condición**: Al desmarcar un elemento adicional, sus opciones se limpian automáticamente.

**Comportamiento**:
- Desmarcar "Contador" → Se limpian valores de 09.01 y 09.02
- Desmarcar "Vía chispas antena" → Se limpian valores de 11.01, 11.02, 11.03
- Desmarcar "Vía chispas tierras" → Se limpian valores de 10.01, 10.02

---

## Resumen de Dependencias

### Cadena de Dependencias por Módulo

```
CLIENTE Y CONTACTO
└── Cliente seleccionado
    └── ✅ Habilita selector de contacto
        └── Al seleccionar contacto → Autorellena datos

PARARRAYOS
└── Tipo de pararrayos seleccionado
    └── ✅ Muestra variantes del tipo

NORMATIVA
└── Normativa seleccionada
    └── ✅ Muestra niveles de protección

SOPORTE
└── Tipo de soporte seleccionado
    └── ✅ Muestra alturas disponibles
        └── Altura seleccionada
            ├── SI es Mástil (05.01)
            │   └── ✅ Muestra campo de anclaje
            │       └── ✅ Filtra anclajes según altura
            └── SI es Mástil autónomo (05.04)
                └── ❌ Oculta campo de fijaciones

MATERIAL
└── Tipo de material seleccionado
    └── ✅ Muestra naturalezas/variantes
        └── Material seleccionado
            ├── ✅ Filtra fijaciones compatibles
            └── ✅ Limpia fijación si no es compatible

FIJACIONES
├── Depende de: Material del conductor (filtrado)
└── Depende de: Tipo de soporte (visibilidad)

ELEMENTOS ADICIONALES
├── Contador de impactos (09)
│   └── ✅ Muestra opciones de contador
├── Vía chispas antena (11)
│   └── ✅ Muestra opciones de antena
└── Vía chispas tierras (10)
    └── ✅ Muestra opciones de tierras
```

### Operaciones de Limpieza Automática

Estas son las acciones que desencadenan limpieza automática de campos relacionados:

| Acción del Usuario | Campos que se Limpian Automáticamente |
|--------------------|----------------------------------------|
| Cambiar tipo de pararrayos | Variante de pararrayos anterior |
| Cambiar normativa | Nivel de protección anterior |
| Cambiar tipo de soporte | Altura, anclaje y (si es mástil autónomo) fijaciones |
| Cambiar altura de soporte | Anclaje anterior |
| Cambiar tipo de material | Naturaleza anterior y fijación (si no es compatible) |
| Cambiar material específico | Fijación (si no es compatible con el nuevo material) |
| Desmarcar contador | Opciones de contador (09.01, 09.02) |
| Desmarcar vía chispas antena | Cantidad antenas, distancia, superficie (11.01, 11.02, 11.03) |
| Desmarcar vía chispas tierras | Cantidad tierras, distancia (10.01, 10.02) |

---

## Notas Importantes

### Prioridad de Visualización
1. **Tipo/Categoría** siempre se muestra primero
2. **Variantes/Opciones** se muestran solo después de seleccionar tipo
3. **Campos dependientes** se ocultan hasta que se cumplan las condiciones

### Validación de Estados
- Los selectores deshabilitados muestran mensajes informativos
- Los campos condicionales tienen indicadores visuales de sus dependencias
- Las opciones filtradas incluyen texto explicativo: "(Compatibles con...)"

### Experiencia de Usuario
- Los cambios en campos padre limpian automáticamente campos hijo
- No se permiten selecciones inválidas (campos deshabilitados)
- Los filtros de compatibilidad son transparentes al usuario (solo ve opciones válidas)
- Los mensajes guían al usuario en el orden correcto de selección
