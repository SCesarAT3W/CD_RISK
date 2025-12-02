# Algoritmos Complejos - CD-Risk

Este documento explica los algoritmos clave utilizados en el sistema de cálculo de riesgo y protección contra rayos.

---

## 1. Ray Casting Algorithm (Punto en Polígono)

### Propósito
Determinar si un punto (x, y) está dentro de un polígono definido por una serie de vértices.

### Ubicación
- `src/hooks/canvas/useProtectionZones.ts` - función `isPointInPolygon()`

### Explicación del Algoritmo

El algoritmo de **ray casting** (lanzamiento de rayos) funciona trazando una línea imaginaria desde el punto en cuestión hacia el infinito en cualquier dirección (típicamente horizontal hacia la derecha) y contando cuántas veces esta línea intersecta los bordes del polígono.

#### Regla básica:
- **Número impar de intersecciones** → El punto está **dentro** del polígono
- **Número par de intersecciones** → El punto está **fuera** del polígono

### Implementación

```typescript
const isPointInPolygon = (point: Point, polygonPoints: number[]): boolean => {
  const x = point.x
  const y = point.y
  let inside = false

  // Iterar sobre cada borde del polígono
  for (let i = 0, j = polygonPoints.length - 2; i < polygonPoints.length; i += 2) {
    const xi = polygonPoints[i]      // x del vértice actual
    const yi = polygonPoints[i + 1]  // y del vértice actual
    const xj = polygonPoints[j]      // x del vértice anterior
    const yj = polygonPoints[j + 1]  // y del vértice anterior

    // Verificar si el rayo horizontal desde el punto intersecta este borde
    const intersect =
      yi > y !== yj > y &&  // El borde cruza la línea horizontal del punto
      x < ((xj - xi) * (y - yi)) / (yj - yi) + xi  // El punto está a la izquierda de la intersección

    if (intersect) inside = !inside  // Alternar estado

    j = i  // Avanzar al siguiente borde
  }

  return inside
}
```

### Visualización

```
    Punto dentro                 Punto fuera

    +-------+                   +-------+
    |       |                   |       |
    |   •   | → intersecciones: 1   •   |  → intersecciones: 0
    |       |    (impar = dentro)  |       | (par = fuera)
    +-------+                   +-------+
```

### Casos Especiales

1. **Punto en el borde**: Puede dar falsos positivos/negativos
2. **Vértices**: Requiere manejo especial cuando el rayo pasa exactamente por un vértice
3. **Polígonos cóncavos**: El algoritmo funciona correctamente para cualquier polígono simple

### Complejidad
- **Tiempo**: O(n) donde n es el número de vértices
- **Espacio**: O(1) - no requiere memoria adicional

---

## 2. Coverage Calculation (Cálculo de Cobertura)

### Propósito
Calcular el porcentaje del área de un edificio que está cubierto por los radios de protección de los pararrayos instalados.

### Ubicación
- `src/hooks/canvas/useCoverageCalculation.ts` - función `calculateCoverage()`

### Algoritmo

El algoritmo utiliza un enfoque de **grid sampling** (muestreo en cuadrícula) para aproximar la cobertura:

#### Pasos:

1. **Calcular bounding box** del área del edificio
   ```typescript
   const xCoords = area.points.filter((_, i) => i % 2 === 0)
   const yCoords = area.points.filter((_, i) => i % 2 === 1)
   const minX = Math.min(...xCoords)
   const maxX = Math.max(...xCoords)
   const minY = Math.min(...yCoords)
   const maxY = Math.max(...yCoords)
   ```

2. **Crear cuadrícula de puntos de muestra**
   ```
   gridSpacing = 20 píxeles

   +--+--+--+--+--+
   |  |  |  |  |  |
   +--+--+--+--+--+
   |  |  |  |  |  |  ← Puntos de muestra
   +--+--+--+--+--+
   |  |  |  |  |  |
   +--+--+--+--+--+
   ```

3. **Para cada punto de la cuadrícula**:
   - Verificar si está dentro del área del edificio (ray casting)
   - Si está dentro, verificar si está cubierto por algún pararrayos
   - Contar puntos cubiertos y totales

4. **Calcular porcentaje**:
   ```typescript
   coverage = (coveredPoints / totalPoints) * 100
   ```

### Implementación

```typescript
const calculateCoverage = (): { coverage: number; uncoveredPoints: Point[] } => {
  const gridSpacing = 20 // píxeles entre puntos de muestra
  let totalPoints = 0
  let coveredPoints = 0
  const uncoveredPoints: Point[] = []

  for (let x = minX; x <= maxX; x += gridSpacing) {
    for (let y = minY; y <= maxY; y += gridSpacing) {
      const point = { x, y }

      if (isPointInPolygon(point, area.points)) {
        totalPoints++

        if (isPointCovered(point, protectionZones)) {
          coveredPoints++
        } else {
          uncoveredPoints.push(point)
        }
      }
    }
  }

  return {
    coverage: totalPoints > 0 ? (coveredPoints / totalPoints) * 100 : 0,
    uncoveredPoints
  }
}
```

### Detección de Punto Cubierto

Un punto está cubierto si la distancia euclidiana al centro de algún pararrayos es menor o igual al radio de protección:

```typescript
const isPointCovered = (point: Point, zones: ProtectionZone[]): boolean => {
  return zones.some((zone) => {
    const distance = Math.sqrt(
      Math.pow(point.x - zone.x, 2) + Math.pow(point.y - zone.y, 2)
    )
    return distance <= zone.radius
  })
}
```

### Visualización

```
Área del edificio con 1 pararrayos:

+-------------------+
|  ·  ·  ·  ·  ·   |
|  ·  ·  ·  ·  ·   |  · = Punto de muestra
|  ·  · ●──────┐   |  ● = Pararrayos
|  ·  ·│⚡     │   |  ─ = Radio de protección
|  ·  ·└──────┘   |
|  ·  ·  ·  ·  ·   |
+-------------------+

Puntos rojos = No cubiertos
Puntos verdes = Cubiertos
```

### Precisión vs Performance

- **gridSpacing = 10**: Mayor precisión, más lento
- **gridSpacing = 20**: Balance óptimo (usado por defecto)
- **gridSpacing = 50**: Menor precisión, más rápido

### Optimización con useMemo

```typescript
const coverageData = useMemo(() => {
  return calculateCoverage()
}, [areas, protectionZones])
```

Solo recalcula cuando cambian las áreas o las zonas de protección.

### Complejidad
- **Tiempo**: O(w × h × n) donde:
  - w, h = dimensiones del bounding box en unidades de gridSpacing
  - n = número de pararrayos
- **Espacio**: O(u) donde u = puntos no cubiertos

---

## 3. Optimization Algorithm (Clustering de Centroides)

### Propósito
Colocar automáticamente pararrayos adicionales para alcanzar una cobertura mínima del 95%.

### Ubicación
- `src/hooks/canvas/useCoverageCalculation.ts` - función `optimizeParrays()`

### Algoritmo

Utiliza un enfoque iterativo de **clustering por centroides**:

#### Pseudocódigo:

```
MIENTRAS haya puntos sin cubrir Y iteraciones < máximo:
  1. Calcular centroide de puntos no cubiertos
  2. Si centroide está fuera del área, usar primer punto no cubierto
  3. Colocar nuevo pararrayos en ese punto
  4. Eliminar todos los puntos ahora cubiertos por el nuevo pararrayos
  5. Incrementar contador
FIN MIENTRAS
```

### Implementación

```typescript
const optimizeParrays = (): ProtectionZone[] => {
  const radius = getProtectionRadius(cabezalModel, protectionLevel)
  const newZones: ProtectionZone[] = [...currentZones]
  let remainingPoints = [...uncoveredPoints]
  let iterations = 0
  const maxIterations = 10

  while (remainingPoints.length > 0 && iterations < maxIterations) {
    // 1. Calcular centroide
    const sumX = remainingPoints.reduce((sum, p) => sum + p.x, 0)
    const sumY = remainingPoints.reduce((sum, p) => sum + p.y, 0)
    const centroid = {
      x: sumX / remainingPoints.length,
      y: sumY / remainingPoints.length,
    }

    // 2. Validar que esté dentro del área
    if (!isPointInPolygon(centroid, areas[0].points)) {
      centroid.x = remainingPoints[0].x
      centroid.y = remainingPoints[0].y
    }

    // 3. Añadir nuevo pararrayos
    newZones.push({
      id: `zone-auto-${Date.now()}-${iterations}`,
      x: centroid.x,
      y: centroid.y,
      radius,
      model: cabezalModel,
      level: protectionLevel,
    })

    // 4. Filtrar puntos cubiertos
    remainingPoints = remainingPoints.filter((point) => {
      const distance = Math.sqrt(
        Math.pow(point.x - centroid.x, 2) + Math.pow(point.y - centroid.y, 2)
      )
      return distance > radius
    })

    iterations++
  }

  return newZones
}
```

### Visualización del Proceso

```
Iteración 1:                Iteración 2:
+----------------+          +----------------+
|  ●  ●  ●      |          |  ●  ●  ●      |
|  ●  ●  ●      |          |  ○  ○  ○      |
|  ●  ● ⚡───┐  |  →       |  ○  ○ ⚡───┐  |
|     ●  └───┘  |          |  ●  ● │    │  |
|     ●  ●      |          |  ● ⚡─┼────┘  |
|     ●  ●      |          |    └─┼───┘    |
+----------------+          +----------------+

● = Punto no cubierto      ○ = Ahora cubierto
⚡ = Pararrayos             ─ = Radio
```

### Ventajas del Algoritmo

1. **Greedy Approach**: Siempre coloca el pararrayos donde más impacto tendrá
2. **Iterativo**: Se adapta a la geometría del edificio
3. **Limitado**: `maxIterations` evita loops infinitos
4. **Práctico**: Funciona bien para formas regulares e irregulares

### Limitaciones

- No garantiza la solución óptima (mínimo número de pararrayos)
- Puede colocar pararrayos muy cerca entre sí
- No considera costos o restricciones físicas

### Complejidad
- **Tiempo**: O(k × u × n) donde:
  - k = número de iteraciones (≤ 10)
  - u = puntos no cubiertos
  - n = número de pararrayos
- **Espacio**: O(k) para nuevos pararrayos

---

## 4. Drag Validation (Validación de Arrastre)

### Propósito
Garantizar que los pararrayos no puedan ser arrastrados fuera del área del edificio.

### Ubicación
- `src/hooks/canvas/useProtectionZones.ts` - función `handleZoneDrag()`

### Algoritmo

```typescript
const handleZoneDrag = (zoneId: string, newX: number, newY: number, isEnd: boolean) => {
  const newPoint = { x: newX, y: newY }

  if (isEnd) {
    // Al finalizar drag, verificar si está dentro del área
    const isInside = isPointInAnyArea(newPoint)

    if (!isInside && areas.length > 0) {
      alert('⚠️ El pararrayos debe estar dentro del área del edificio')
      return false // Indicar que debe revertir a posición original
    }
  }

  // Actualizar posición (temporal durante drag, definitiva al final)
  const newZones = protectionZones.map((z) =>
    z.id === zoneId ? { ...z, x: newX, y: newY } : z
  )
  setProtectionZones(newZones)

  return true // Posición válida
}
```

### Estados del Drag

1. **onDragMove**: Actualización temporal, sin validación
2. **onDragEnd**: Validación final + reversión si está fuera

---

## Referencias

- **Ray Casting**: [Wikipedia - Point in Polygon](https://en.wikipedia.org/wiki/Point_in_polygon)
- **Grid Sampling**: Técnica de Monte Carlo para aproximación de áreas
- **Centroid Clustering**: K-means simplificado para una sola iteración

---

## Pruebas

Los tests para estos algoritmos están en:
- `src/hooks/canvas/__tests__/useCanvasDrawing.test.ts`
- `src/lib/validations/__tests__/riskFormSchemas.test.ts`

Ejecutar con:
```bash
npm run test
```
