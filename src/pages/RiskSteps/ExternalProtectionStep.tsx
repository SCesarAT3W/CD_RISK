import { useState } from 'react'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Button } from '@/components/ui/button'
import { Slider } from '@/components/ui/slider'
import { Calculator, Sparkles } from 'lucide-react'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'

import type { ExternalProtectionStepProps } from '@/types/stepProps'

const isDev = import.meta.env.DEV

const generateMockExternalProtection = () => {
  const random = (arr: string[]) => arr[Math.floor(Math.random() * arr.length)]
  const randomNum = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min

  return {
    externalCabezal: random([
      'DAT CONTROLER PLUS 15',
      'DAT CONTROLER PLUS 30',
      'DAT CONTROLER PLUS 45',
      'DAT CONTROLER REMOTE 60',
    ]),
    conductorType: random(['Cable', 'Varilla', 'Tubo']),
    conductorMaterial: random(['Cobre', 'Aluminio', 'Acero inoxidable']),
    fixingType: random(['Abrazaderas', 'Grapa', 'Soldadura']),
    useOtherBajantes: random(['Si', 'No']),
    bajantesNumber: randomNum(2, 8).toString(),
    totalLength: randomNum(20, 100).toString(),
    distanceGroundLevel: randomNum(5, 20).toString(),
    groundType: random(['Pica', 'Anillo', 'Mallado']),
    groundMaterial: random(['Cobre', 'Acero galvanizado']),
    generalGround: random(['Si', 'No']),
    generalGroundConductor: randomNum(20, 100).toString(),
    antenasNumber: randomNum(0, 5).toString(),
    antenasLength: randomNum(10, 50).toString(),
    useNaturalComponents: random(['Si', 'No']),
  }
}

/**
 * Paso 6: Materiales para protección externa
 * Basado en el diseño original de CD-Risk
 */
export function ExternalProtectionStep({ data, onChange, onBulkChange }: ExternalProtectionStepProps) {
  const handleAutofill = () => {
    if (onBulkChange) {
      onBulkChange(generateMockExternalProtection())
    }
  }
  const [showMaterialsTable, setShowMaterialsTable] = useState(false)
  const [extraMargin, setExtraMargin] = useState(15)

  const handleCalculateMaterials = () => {
    setShowMaterialsTable(true)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-primary">Materiales para protección externa</h2>
        {isDev && (
          <Button onClick={handleAutofill} variant="outline" size="sm" className="gap-2">
            <Sparkles className="h-4 w-4" />
            Autorellenar
          </Button>
        )}
      </div>

      {/* Datos del edificio */}
      <Card>
        <CardHeader>
          <CardTitle className="text-primary">DATOS DEL EDIFICIO</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4">
            <div className="flex items-center gap-2">
              <Label>Edificio:</Label>
              <Input value={data.buildingName || 'EDIFICIO PRODUCCIÓN'} readOnly className="bg-muted" />
            </div>
            <div className="flex items-center gap-2">
              <Label>Altura del Edificio:</Label>
              <Input value={data.height ? `${data.height} m` : '20.00 m'} readOnly className="bg-muted" />
            </div>
            <div className="flex items-center gap-2">
              <Label>PARARRAYOS:</Label>
              <Input value="1" readOnly className="w-16 bg-muted text-center" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* CAPTACIÓN */}
      <Card>
        <CardHeader>
          <CardTitle className="text-primary">CAPTACIÓN</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label>Cabezal captador</Label>
              <Select
                value={data.externalCabezal || 'DAT CONTROLER REMOTE 60'}
                onValueChange={(value) => onChange('externalCabezal', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="DAT CONTROLER PLUS 15">DAT CONTROLER PLUS 15</SelectItem>
                  <SelectItem value="DAT CONTROLER PLUS 30">DAT CONTROLER PLUS 30</SelectItem>
                  <SelectItem value="DAT CONTROLER PLUS 45">DAT CONTROLER PLUS 45</SelectItem>
                  <SelectItem value="DAT CONTROLER REMOTE 60">DAT CONTROLER REMOTE 60</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Nivel de protección</Label>
              <Input value="NIVEL III" readOnly className="bg-muted" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* BAJANTES */}
      <Card>
        <CardHeader>
          <CardTitle className="text-primary">BAJANTES</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-5 items-center gap-4">
            <Label className="col-span-3">Tipo de conductor a presupuestar</Label>
            <div className="col-span-2">
              <Select
                value={data.conductorType || ''}
                onValueChange={(value) => onChange('conductorType', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="--Por favor, elige una opción--" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Cable">Cable</SelectItem>
                  <SelectItem value="Pletina">Pletina</SelectItem>
                  <SelectItem value="Redondo">Redondo</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-5 items-center gap-4">
            <Label className="col-span-3">Material del conductor a presupuestar</Label>
            <div className="col-span-2">
              <Select
                value={data.conductorMaterial || ''}
                onValueChange={(value) => onChange('conductorMaterial', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="--Por favor, elige una opción--" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Cobre">Cobre</SelectItem>
                  <SelectItem value="Aluminio">Aluminio</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-5 items-center gap-4">
            <Label className="col-span-3">Tipo de fijaciones para el conductor</Label>
            <div className="col-span-2">
              <Select
                value={data.fixingType || ''}
                onValueChange={(value) => onChange('fixingType', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="--Por favor, elige una opción--" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Fijacion1">Grapa de latón a pared</SelectItem>
                  <SelectItem value="Fijacion2">Grapa de latón a estructura</SelectItem>
                  <SelectItem value="Fijacion3">Grapa de nylon</SelectItem>
                  <SelectItem value="Fijacion4">Grapa ligera</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-5 items-center gap-4">
            <Label className="col-span-3">¿Se utilizarán bajantes de otros pararrayos como bajada?</Label>
            <div className="col-span-2">
              <RadioGroup
                value={data.useOtherBajantes || 'No'}
                onValueChange={(value) => onChange('useOtherBajantes', value)}
                className="flex gap-4"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="Si" id="otherBajantesYes" />
                  <Label htmlFor="otherBajantesYes">Sí</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="No" id="otherBajantesNo" />
                  <Label htmlFor="otherBajantesNo">No</Label>
                </div>
              </RadioGroup>
            </div>
          </div>

          {/* Campos condicionales si useOtherBajantes === "Si" */}
          {data.useOtherBajantes === 'Si' && (
            <>
              <div className="grid grid-cols-5 items-center gap-4">
                <Label className="col-span-3 text-right">Introduzca número de metros de conductor a utilizar</Label>
                <div className="col-span-2">
                  <Input
                    type="number"
                    min="0"
                    value={data.metrosConductor || '0'}
                    onChange={(e) => onChange('metrosConductor', e.target.value)}
                  />
                </div>
              </div>

              <div className="grid grid-cols-5 items-center gap-4">
                <Label className="col-span-3 text-right">Tipo de cubierta</Label>
                <div className="col-span-2">
                  <Select
                    value={data.tipoCubierta || ''}
                    onValueChange={(value) => onChange('tipoCubierta', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="--Por favor, elige una opción--" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Pared">Pared</SelectItem>
                      <SelectItem value="Terraza">Terraza</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </>
          )}

          <div className="grid grid-cols-5 items-center gap-4">
            <Label className="col-span-3">¿Se utilizan componentes naturales como bajadas?</Label>
            <div className="col-span-2">
              <RadioGroup
                value={data.useNaturalComponents || 'No'}
                onValueChange={(value) => onChange('useNaturalComponents', value)}
                className="flex gap-4"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="Si" id="naturalYes" />
                  <Label htmlFor="naturalYes">Sí</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="No" id="naturalNo" />
                  <Label htmlFor="naturalNo">No</Label>
                </div>
              </RadioGroup>
            </div>
          </div>

          <div className="grid grid-cols-5 items-center gap-4">
            <Label className="col-span-3">Indique el número de bajantes a presupuestar</Label>
            <div className="col-span-2">
              <Input
                type="number"
                value={data.bajantesNumber || '2'}
                onChange={(e) => onChange('bajantesNumber', e.target.value)}
              />
            </div>
          </div>

          <div className="grid grid-cols-5 items-center gap-4">
            <Label className="col-span-3">Recorrido horizontal total</Label>
            <div className="col-span-2">
              <Input
                value={data.totalLength || '10,00 m'}
                onChange={(e) => onChange('totalLength', e.target.value)}
              />
            </div>
          </div>

          <div className="grid grid-cols-5 items-center gap-4">
            <Label className="col-span-3">Distancia entre las bajantes a nivel suelo</Label>
            <div className="col-span-2">
              <Input
                value={data.distanceGroundLevel || '6.00 m'}
                onChange={(e) => onChange('distanceGroundLevel', e.target.value)}
              />
            </div>
          </div>

          <div className="grid grid-cols-5 items-center gap-4">
            <Label className="col-span-3">¿Desea añadir un margen extra de materiales?</Label>
            <div className="col-span-2 flex items-center gap-2">
              <Slider
                min={0}
                max={100}
                step={1}
                value={[extraMargin]}
                onValueChange={(value) => setExtraMargin(value[0] ?? 0)}
                className="flex-1"
              />
              <span className="w-12 text-sm">{extraMargin}%</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* TOMA DE TIERRA */}
      <Card>
        <CardHeader>
          <CardTitle className="text-primary">TOMA DE TIERRA</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-5 items-center gap-4">
            <Label className="col-span-3">Tipo de toma de tierra</Label>
            <div className="col-span-2">
              <Select
                value={data.groundType || ''}
                onValueChange={(value) => onChange('groundType', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="--Por favor, elige una opción--" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Tierratriangulos">Disposición en triángulo</SelectItem>
                  <SelectItem value="Tierraenlinea">Disposición en línea</SelectItem>
                  <SelectItem value="Patadeganso">Pata de ganso</SelectItem>
                  <SelectItem value="Enanillo">En anillo</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-5 items-center gap-4">
            <Label className="col-span-3">Material de toma de tierra</Label>
            <div className="col-span-2">
              <Select
                value={data.groundMaterial || ''}
                onValueChange={(value) => onChange('groundMaterial', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="--Por favor, elige una opción--" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ElectrodosCobrizados">Electrodos Cobrizados</SelectItem>
                  <SelectItem value="PlacasdeTT">Placas de cobre</SelectItem>
                  <SelectItem value="ElectrodosDinamicos">Electrodos dinámicos</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-5 items-center gap-4">
            <Label className="col-span-3">¿La toma de tierra se unirá a la tierra general?</Label>
            <div className="col-span-2">
              <RadioGroup
                value={data.generalGround || 'No'}
                onValueChange={(value) => onChange('generalGround', value)}
                className="flex gap-4"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="Si" id="generalGroundYes" />
                  <Label htmlFor="generalGroundYes">Sí</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="No" id="generalGroundNo" />
                  <Label htmlFor="generalGroundNo">No</Label>
                </div>
              </RadioGroup>
            </div>
          </div>

          <div className="grid grid-cols-5 items-center gap-4">
            <Label className="col-span-3">Conductor enterrado para unión a tierra general</Label>
            <div className="col-span-2">
              <Input
                type="number"
                value={data.generalGroundConductor || ''}
                onChange={(e) => onChange('generalGroundConductor', e.target.value)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ANTENAS */}
      <Card>
        <CardHeader>
          <CardTitle className="text-primary">ANTENAS</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-5 items-center gap-4">
            <Label className="col-span-3">Número de antenas en el tejado</Label>
            <div className="col-span-2">
              <Input
                type="number"
                value={data.antenasNumber || ''}
                onChange={(e) => onChange('antenasNumber', e.target.value)}
              />
            </div>
          </div>

          <div className="grid grid-cols-5 items-center gap-4">
            <Label className="col-span-3">Conductor para unir las antenas a la bajante</Label>
            <div className="col-span-2">
              <Input
                value={data.antenasLength || '0,00m'}
                onChange={(e) => onChange('antenasLength', e.target.value)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Botón para calcular materiales */}
      <div>
        <Button onClick={handleCalculateMaterials} className="bg-primary hover:bg-primary/90">
          <Calculator className="mr-2 h-5 w-5" />
          Calcular los materiales
        </Button>
      </div>

      {/* Tabla de materiales calculados */}
      {showMaterialsTable && (
        <Card>
          <CardHeader>
            <CardTitle className="text-primary">MATERIALES CALCULADOS</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Ref.</TableHead>
                  <TableHead>Materiales</TableHead>
                  <TableHead className="text-right">Cantidad</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow>
                  <TableCell>AT-1560</TableCell>
                  <TableCell>DAT CONTROLER® REMOTE 60</TableCell>
                  <TableCell className="text-right">1,00</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>AT-010A</TableCell>
                  <TableCell>Pieza adaptación, latón, para mástil PVC o cable o pletina</TableCell>
                  <TableCell className="text-right">1,00</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>AT-056A</TableCell>
                  <TableCell>Mástil de Ø60 x 6m, galvanizado (2 tramos)</TableCell>
                  <TableCell className="text-right">1,00</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>AT-023B</TableCell>
                  <TableCell>Anclaje en U 30cm atornillable (2 sop.), galvanizado</TableCell>
                  <TableCell className="text-right">1,00</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>AT-184E</TableCell>
                  <TableCell>Soporte cónico esmaltado de 30 a 2mm</TableCell>
                  <TableCell className="text-right">1,00</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>AT-052D</TableCell>
                  <TableCell>Pletina de cobre para cable o pletina (lleno)</TableCell>
                  <TableCell className="text-right">56,00</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>AT-240E</TableCell>
                  <TableCell>Grapa helice de inox para pletina</TableCell>
                  <TableCell className="text-right">72,00</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
