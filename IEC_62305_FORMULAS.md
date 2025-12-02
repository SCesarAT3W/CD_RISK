# Fórmulas IEC 62305-2 para Cálculo de Riesgo de Rayos

Documentación de las fórmulas de la norma IEC 62305-2 / UNE 21186 para implementación en CD-Risk.

## 1. TIPOS DE RIESGO

La norma define **4 tipos de riesgo**:

- **R1**: Riesgo de pérdida de vidas humanas (incluye lesiones permanentes)
- **R2**: Riesgo de pérdida de servicio al público
- **R3**: Riesgo de pérdida de patrimonio cultural
- **R4**: Riesgo de pérdida de valor económico

### Riesgo Tolerable (RT)

- **R1**: RT = 1×10⁻⁵ (1 en 100,000 por año)
- **R2**: RT = 1×10⁻³ (1 en 1,000 por año)
- **R3**: RT = 1×10⁻³ (1 en 1,000 por año)
- **R4**: No hay RT definido (se evalúa costo-beneficio)

**Criterio**: Si R > RT, se requiere protección contra rayos.

---

## 2. FÓRMULAS DE RIESGO

Cada riesgo es la suma de sus **componentes de riesgo**:

### R1 (Pérdida de vidas humanas)
```
R1 = RA1 + RB1 + RC1 + RM1 + RU1 + RV1 + RW1 + RZ1
```

### R2 (Pérdida de servicio público)
```
R2 = RB2 + RC2 + RM2 + RV2 + RW2 + RZ2
```

### R3 (Pérdida de patrimonio cultural)
```
R3 = RB3 + RV3
```

### R4 (Pérdida económica)
```
R4 = RA4 + RB4 + RC4 + RM4 + RU4 + RV4 + RW4 + RZ4
```

### Componentes de Riesgo (RX)

Cada componente sigue el patrón:
```
RX = NX × PX × LX
```

Donde:
- **N** = Frecuencia de eventos peligrosos (por año)
- **P** = Probabilidad de daño
- **L** = Factor de pérdida (consecuencia)

#### Significado de los subíndices:

**Letra (Tipo de evento):**
- **A**: Impacto directo en la estructura
- **B**: Impacto cerca de la estructura
- **C**: Impacto directo en línea eléctrica
- **M**: Impacto cerca de línea eléctrica
- **U**: Impacto directo en línea de telecomunicaciones
- **V**: Impacto cerca de línea de telecomunicaciones
- **W**: (Adicional para ciertas líneas)
- **Z**: (Adicional para ciertas líneas)

**Número (Tipo de pérdida):**
- **1**: Pérdida de vidas humanas
- **2**: Pérdida de servicio público
- **3**: Pérdida de patrimonio cultural
- **4**: Pérdida económica

---

## 3. FRECUENCIA DE EVENTOS (N)

### 3.1 Frecuencia de impactos directos en estructura (ND)
```
ND = Ng × Ad × Cd × 10⁻⁶
```

Donde:
- **Ng** = Densidad de rayos a tierra (rayos/km²/año) - depende de la región
- **Ad** = Área equivalente de colección (m²)
- **Cd** = Factor de localización (depende del entorno)

### 3.2 Área de Colección (Ad)

Para estructura aislada:
```
Ad = L×W + 6H(L + W) + 9πH²
```

Donde:
- **L** = Longitud de la estructura (m)
- **W** = Anchura de la estructura (m)
- **H** = Altura de la estructura (m)

**Desglose**:
1. `L×W` → Área base del edificio
2. `6H(L + W)` → Áreas laterales (efecto perímetro)
3. `9πH²` → Áreas de esquinas/bordes (≈ 28.27 × H²)

### 3.3 Factor de Localización (Cd)

Según la situación del edificio:

| Situación | Cd |
|-----------|-----|
| Estructura aislada | 2.0 |
| Rodeada de objetos más altos | 0.5 |
| Rodeada de objetos de altura similar | 1.0 |
| En centro urbano | 0.25 |

### 3.4 Frecuencia de impactos cercanos (NM)
```
NM = Ng × Am × 10⁻⁶
```

Donde **Am** es el área equivalente de colección para impactos cercanos.

### 3.5 Frecuencia para líneas eléctricas (NL, NI)
```
NL = Ng × Al × Cl × Ct × 10⁻⁶
NI = Ng × Ai × Ci × Ct × 10⁻⁶
```

Donde:
- **Al, Ai** = Áreas de colección de líneas
- **Cl, Ci** = Factores de instalación de líneas
- **Ct** = Factor de transformador (si aplica)

---

## 4. PROBABILIDAD DE DAÑO (P)

Las probabilidades dependen del tipo de protección implementada.

### 4.1 Probabilidad PA (Impacto directo en estructura)
```
PA = PTA × PB
```

Donde:
- **PTA** = Probabilidad de tensiones de paso/contacto (Tabla B.1 IEC)
- **PB** = Probabilidad según medidas de protección física (Tabla B.2 IEC)

### 4.2 Probabilidad PB (Impacto cerca de estructura)
```
PB = PSPD × PEB
```

Donde:
- **PSPD** = Probabilidad según SPD (Descargador de sobretensiones)
- **PEB** = Probabilidad según sistema equipotencial

### 4.3 Probabilidad PC (Impacto en línea eléctrica)
```
PC = PSPD × CLD × PEB
```

Donde **CLD** es el factor de coordinación del cableado.

### Valores típicos de probabilidad:

| Medida de Protección | Valor P |
|----------------------|---------|
| Sin protección | 1.0 |
| Nivel I (básico) | 0.2 |
| Nivel II | 0.1 |
| Nivel III | 0.05 |
| Nivel IV | 0.02 |

---

## 5. FACTOR DE PÉRDIDA (L)

Depende del tipo de estructura y consecuencias.

### 5.1 Para R1 (Pérdidas de vidas humanas)

**LA (Pérdida por tensiones de paso/contacto):**
```
LA = (rt × np) / (nt × 10⁻²)
```

Donde:
- **rt** = Factor de reducción (depende del tipo de superficie)
- **np** = Número de personas en peligro
- **nt** = Número total de personas en la estructura

**LB, LC, LM (Pérdida por daños físicos):**
```
LX = (rp × rf × hu × LT) / (nt × 10⁻²)
```

Donde:
- **rp** = Factor de reducción por protección contra fuego
- **rf** = Factor de reducción por riesgo de incendio
- **hu** = Factor de incremento por peligro especial (hospital, escuela, etc.)
- **LT** = Tipo de pérdida (valor entre 0 y 1)

### 5.2 Para R4 (Pérdidas económicas)

Se calcula como:
```
L4 = (ca × ct × ce) / ct_total
```

Donde:
- **ca** = Valor de animales en la estructura
- **ct** = Valor total de la estructura
- **ce** = Valor del contenido de la estructura

---

## 6. DETERMINACIÓN DEL NIVEL DE PROTECCIÓN

Una vez calculados los riesgos R1, R2, R3, R4, se determina el nivel de protección necesario:

### Tabla de Niveles de Protección (LPL)

| Nivel | Eficiencia | Radio de Protección (ejemplo para 60m) |
|-------|------------|----------------------------------------|
| I | 98% | 79m |
| II | 95% | 87m |
| III | 90% | 97m |
| IV | 80% | 107m |

**Criterio de selección**:
1. Calcular R sin protección
2. Si R > RT, implementar protección
3. Seleccionar nivel LPL
4. Recalcular R con protección
5. Verificar que R ≤ RT
6. Si no cumple, incrementar nivel de protección

---

## 7. VALORES DE REFERENCIA

### Densidad de rayos (Ng) por regiones de España:

| Región | Ng (rayos/km²/año) |
|--------|-------------------|
| Norte (Galicia, Asturias) | 1-2 |
| Centro (Madrid) | 2-3 |
| Levante (Valencia) | 3-5 |
| Sur (Andalucía) | 2-4 |
| Zona montañosa | 4-8 |

**Recomendación**: Aplicar factor de seguridad del 25% (multiplicar Ng × 1.25)

### Factor ambiental (Ce)

| Tipo de entorno | Ce |
|-----------------|-----|
| Urbano | 0.5 |
| Suburbano | 1.0 |
| Rural | 1.5 |
| Montañoso | 2.0 |

---

## 8. EJEMPLO DE CÁLCULO SIMPLIFICADO

Para un edificio:
- L = 80m, W = 50m, H = 20m
- Estructura aislada (Cd = 2.0)
- Región con Ng = 2.5 rayos/km²/año

### Paso 1: Calcular Ad
```
Ad = 80×50 + 6×20(80 + 50) + 9π×20²
Ad = 4000 + 15600 + 11310
Ad = 30,910 m²
```

### Paso 2: Calcular ND
```
ND = 2.5 × 30,910 × 2.0 × 10⁻⁶
ND = 0.154 impactos/año
```

### Paso 3: Calcular RA1 (sin protección)
```
RA1 = ND × PA × LA
RA1 = 0.154 × 1.0 × 0.01  (valores típicos)
RA1 = 0.00154 = 1.54×10⁻³
```

### Paso 4: Comparar con RT
```
R1 ≈ RA1 = 1.54×10⁻³
RT = 1×10⁻⁵

R1 > RT → SE NECESITA PROTECCIÓN
```

---

## 9. IMPLEMENTACIÓN EN CÓDIGO

### Estructura de archivos recomendada:

```
src/lib/calculations/
  ├── riskCalculations.ts      # Cálculos principales R1-R4
  ├── frequencyCalculations.ts # Cálculo de N (ND, NM, NL, NI)
  ├── probabilityCalculations.ts # Cálculo de P
  ├── lossFactors.ts           # Cálculo de L
  ├── collectionArea.ts        # Cálculo de Ad, Am, Al
  └── constants.ts             # Tablas de valores (Ng, Cd, factores)
```

### Interfaz TypeScript sugerida:

```typescript
interface RiskCalculationInput {
  // Dimensiones
  length: number
  width: number
  height: number

  // Ubicación
  location: {
    ng: number  // Densidad de rayos
    situation: 'isolated' | 'surrounded_higher' | 'surrounded_similar' | 'urban'
  }

  // Protección actual
  protection: {
    level?: 'I' | 'II' | 'III' | 'IV'
    hasSPD: boolean
    hasEquipotential: boolean
    hasFireProtection: boolean
  }

  // Tipo de estructura
  structure: {
    type: 'residential' | 'commercial' | 'industrial' | 'hospital' | 'school'
    occupants: number
    value: number
  }
}

interface RiskCalculationResult {
  R1: number  // Riesgo de pérdida de vidas
  R2: number  // Riesgo de pérdida de servicio
  R3: number  // Riesgo de pérdida de patrimonio
  R4: number  // Riesgo económico

  components: {
    RA1: number, RB1: number, RC1: number, // ...
  }

  needsProtection: boolean
  recommendedLevel: 'I' | 'II' | 'III' | 'IV' | 'none'

  // Detalles intermedios
  frequencies: {
    ND: number, NM: number, NL: number, NI: number
  }
  collectionArea: {
    Ad: number, Am: number
  }
}
```

---

## REFERENCIAS

- IEC 62305-2:2010 (Edition 2.0) - Protection against lightning – Part 2: Risk management
- UNE 21186:2011 - Protección contra el rayo
- BS EN 62305-2:2012 - British standard version
- Anexo A: Cálculo de frecuencias
- Anexo B: Tablas de probabilidades
- Anexo C: Factores de pérdida

---

**Nota**: Los valores en las tablas son valores típicos. Para un cálculo preciso, consultar las tablas completas en la norma IEC 62305-2 (Anexos A, B y C).
