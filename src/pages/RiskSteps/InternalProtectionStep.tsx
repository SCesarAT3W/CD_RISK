import { useState } from 'react'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Button } from '@/components/ui/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Calculator, Sparkles } from 'lucide-react'

import type { InternalProtectionStepProps } from '@/types/stepProps'

const isDev = import.meta.env.DEV

const generateMockInternalProtection = () => {
  const random = (arr: string[]) => arr[Math.floor(Math.random() * arr.length)]
  const randomNum = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min

  return {
    diffGeneral30mA: random(['Si', 'No']),
    intensity: random(['25A', '40A', '63A', '100A']),
    principalPanel400v: randomNum(0, 10).toString(),
    principalPanel400vNeutro: random(['L-N', 'L-L', 'L-L-N']),
    principalPanel230v: randomNum(0, 10).toString(),
    principalPanel230vNeutro: random(['L-N', 'L-L']),
    principalPanel230vM: randomNum(0, 5).toString(),
    principalPanel120vM: randomNum(0, 5).toString(),
    secondaryPanel400v: randomNum(0, 10).toString(),
    secondaryPanel400vNeutro: random(['L-N', 'L-L', 'L-L-N']),
    secondaryPanel230v: randomNum(0, 10).toString(),
    secondaryPanel230vNeutro: random(['L-N', 'L-L']),
    secondaryPanel230vM: randomNum(0, 5).toString(),
    secondaryPanel120vM: randomNum(0, 5).toString(),
    analogLinesNumber: randomNum(0, 20).toString(),
    digitalLinesNumber: randomNum(0, 20).toString(),
    ethernetLines: randomNum(0, 10).toString(),
    busLines5v: randomNum(0, 10).toString(),
    serialLines12v: randomNum(0, 10).toString(),
    controlLines24v: randomNum(0, 10).toString(),
    controlLines48v: randomNum(0, 10).toString(),
  }
}

/**
 * Paso 7: Materiales de protección interna
 * Basado en el diseño original de CD-Risk
 */
export function InternalProtectionStep({ data, onChange, onBulkChange }: InternalProtectionStepProps) {
  const handleAutofill = () => {
    if (onBulkChange) {
      onBulkChange(generateMockInternalProtection())
    }
  }
  const [showMaterialsTable, setShowMaterialsTable] = useState(false)

  const handleCalculateMaterials = () => {
    setShowMaterialsTable(true)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-primary">Materiales de protección interna</h2>
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
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center gap-2">
              <Label>Edificio:</Label>
              <Input value={data.buildingName || 'EDIFICIO PRODUCCIÓN'} readOnly className="bg-muted" />
            </div>
            <div className="flex items-center gap-2">
              <Label>Altura del Edificio:</Label>
              <Input value={data.height ? `${data.height} m` : '20.00 m'} readOnly className="bg-muted" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* PROTECCIÓN INTERNA DE LÍNEAS ELÉCTRICAS */}
      <Card>
        <CardHeader>
          <CardTitle className="text-primary">PROTECCIÓN INTERNA DE LÍNEAS ELÉCTRICAS</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Diferencial general */}
          <div>
            <Label className="mb-2 block">¿Existe un diferencial general de 30 mA?</Label>
            <RadioGroup
              value={data.diffGeneral30mA || 'No'}
              onValueChange={(value) => onChange('diffGeneral30mA', value)}
              className="flex gap-4"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="Si" id="diffGeneralYes" />
                <Label htmlFor="diffGeneralYes">Sí</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="No" id="diffGeneralNo" />
                <Label htmlFor="diffGeneralNo">No</Label>
              </div>
            </RadioGroup>
          </div>

          {/* Intensidad nominal */}
          <div>
            <Label className="mb-2 block">
              Intensidad nominal del interruptor general automático del mayor cuadro principal
            </Label>
            <RadioGroup
              value={data.intensity || '25A'}
              onValueChange={(value) => onChange('intensity', value)}
              className="flex flex-wrap gap-2"
            >
              {['25A', '32A', '40A', '50A', '63A', '80A', '100A', '125A', '>125A'].map((value) => (
                <div key={value} className="flex items-center space-x-2">
                  <RadioGroupItem value={value} id={`intensity${value}`} />
                  <Label htmlFor={`intensity${value}`}>{value}</Label>
                </div>
              ))}
            </RadioGroup>
          </div>
        </CardContent>
      </Card>

      {/* CUADROS PRINCIPALES */}
      <Card>
        <CardHeader>
          <CardTitle className="text-primary">CUADROS PRINCIPALES</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Tensión</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Cuadros a proteger</TableHead>
                <TableHead>Neutro</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell>400 v</TableCell>
                <TableCell>Trifásico</TableCell>
                <TableCell>
                  <Input
                    type="number"
                    value={data.principalPanel400v || '0'}
                    onChange={(e) => onChange('principalPanel400v', e.target.value)}
                    className="w-20"
                  />
                </TableCell>
                <TableCell>
                  <RadioGroup
                    value={data.principalPanel400vNeutro || 'si'}
                    onValueChange={(value) => onChange('principalPanel400vNeutro', value)}
                    className="flex gap-2"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="si" id="panel400vNeutroSi" />
                      <Label htmlFor="panel400vNeutroSi">Sí</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="no" id="panel400vNeutroNo" />
                      <Label htmlFor="panel400vNeutroNo">No</Label>
                    </div>
                  </RadioGroup>
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell>230 v</TableCell>
                <TableCell>Trifásico</TableCell>
                <TableCell>
                  <Input
                    type="number"
                    value={data.principalPanel230v || '0'}
                    onChange={(e) => onChange('principalPanel230v', e.target.value)}
                    className="w-20"
                  />
                </TableCell>
                <TableCell>
                  <RadioGroup
                    value={data.principalPanel230vNeutro || 'no'}
                    onValueChange={(value) => onChange('principalPanel230vNeutro', value)}
                    className="flex gap-2"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="si" id="panel230vNeutroSi" />
                      <Label htmlFor="panel230vNeutroSi">Sí</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="no" id="panel230vNeutroNo" />
                      <Label htmlFor="panel230vNeutroNo">No</Label>
                    </div>
                  </RadioGroup>
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell>230 v</TableCell>
                <TableCell>Monofásico</TableCell>
                <TableCell>
                  <Input
                    type="number"
                    value={data.principalPanel230vM || '0'}
                    onChange={(e) => onChange('principalPanel230vM', e.target.value)}
                    className="w-20"
                  />
                </TableCell>
                <TableCell></TableCell>
              </TableRow>
              <TableRow>
                <TableCell>120 v</TableCell>
                <TableCell>Monofásico</TableCell>
                <TableCell>
                  <Input
                    type="number"
                    value={data.principalPanel120vM || '0'}
                    onChange={(e) => onChange('principalPanel120vM', e.target.value)}
                    className="w-20"
                  />
                </TableCell>
                <TableCell></TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* CUADROS SECUNDARIOS */}
      <Card>
        <CardHeader>
          <CardTitle className="text-primary">CUADROS SECUNDARIOS</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Tensión</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Cuadros a proteger</TableHead>
                <TableHead>Neutro</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell>400 v</TableCell>
                <TableCell>Trifásico</TableCell>
                <TableCell>
                  <Input
                    type="number"
                    value={data.secondaryPanel400v || '0'}
                    onChange={(e) => onChange('secondaryPanel400v', e.target.value)}
                    className="w-20"
                  />
                </TableCell>
                <TableCell>
                  <RadioGroup
                    value={data.secondaryPanel400vNeutro || 'no'}
                    onValueChange={(value) => onChange('secondaryPanel400vNeutro', value)}
                    className="flex gap-2"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="si" id="secondaryPanel400vSi" />
                      <Label htmlFor="secondaryPanel400vSi">Sí</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="no" id="secondaryPanel400vNo" />
                      <Label htmlFor="secondaryPanel400vNo">No</Label>
                    </div>
                  </RadioGroup>
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell>230 v</TableCell>
                <TableCell>Trifásico</TableCell>
                <TableCell>
                  <Input
                    type="number"
                    value={data.secondaryPanel230v || '0'}
                    onChange={(e) => onChange('secondaryPanel230v', e.target.value)}
                    className="w-20"
                  />
                </TableCell>
                <TableCell>
                  <RadioGroup
                    value={data.secondaryPanel230vNeutro || 'no'}
                    onValueChange={(value) => onChange('secondaryPanel230vNeutro', value)}
                    className="flex gap-2"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="si" id="secondaryPanel230vSi" />
                      <Label htmlFor="secondaryPanel230vSi">Sí</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="no" id="secondaryPanel230vNo" />
                      <Label htmlFor="secondaryPanel230vNo">No</Label>
                    </div>
                  </RadioGroup>
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell>230 v</TableCell>
                <TableCell>Monofásico</TableCell>
                <TableCell>
                  <Input
                    type="number"
                    value={data.secondaryPanel230vM || '0'}
                    onChange={(e) => onChange('secondaryPanel230vM', e.target.value)}
                    className="w-20"
                  />
                </TableCell>
                <TableCell></TableCell>
              </TableRow>
              <TableRow>
                <TableCell>120 v</TableCell>
                <TableCell>Monofásico</TableCell>
                <TableCell>
                  <Input
                    type="number"
                    value={data.secondaryPanel120vM || '0'}
                    onChange={(e) => onChange('secondaryPanel120vM', e.target.value)}
                    className="w-20"
                  />
                </TableCell>
                <TableCell></TableCell>
              </TableRow>
            </TableBody>
          </Table>
          <p className="mt-4 text-sm text-primary">
            En caso de que no exista una protección de igual o menor corriente nominal instalada aguas arriba del
            protector, se deberá prever la instalación de fusibles 125A gl / gG.
          </p>
        </CardContent>
      </Card>

      {/* PROTECCIÓN DE LÍNEAS TELEFÓNICAS */}
      <Card>
        <CardHeader>
          <CardTitle className="text-primary">PROTECCIÓN DE LÍNEAS TELEFÓNICAS</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Tipo de Línea</TableHead>
                <TableHead>Cantidad a proteger</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell>Líneas analógicas a proteger</TableCell>
                <TableCell>
                  <Input
                    type="number"
                    value={data.analogLinesNumber || '0'}
                    onChange={(e) => onChange('analogLinesNumber', e.target.value)}
                    className="w-28"
                  />
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Líneas digitales a proteger</TableCell>
                <TableCell>
                  <Input
                    type="number"
                    value={data.digitalLinesNumber || '0'}
                    onChange={(e) => onChange('digitalLinesNumber', e.target.value)}
                    className="w-28"
                  />
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
          <div className="mt-4 flex items-center justify-between">
            <Label className="font-bold">Número total de líneas a proteger</Label>
            <Input
              type="number"
              value={
                (parseInt(data.analogLinesNumber) || 0) + (parseInt(data.digitalLinesNumber) || 0)
              }
              readOnly
              className="w-28 bg-muted"
            />
          </div>
        </CardContent>
      </Card>

      {/* PROTECCIÓN DE LÍNEAS INFORMÁTICAS DE DATOS */}
      <Card>
        <CardHeader>
          <CardTitle className="text-primary">PROTECCIÓN DE LÍNEAS INFORMÁTICAS DE DATOS</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Tipo de Línea</TableHead>
                <TableHead>Cantidad a proteger</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell>Líneas Ethernet (RJ45)</TableCell>
                <TableCell>
                  <Input
                    type="number"
                    value={data.ethernetLines || '0'}
                    onChange={(e) => onChange('ethernetLines', e.target.value)}
                    className="w-28"
                  />
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Líneas de datos 5v</TableCell>
                <TableCell>
                  <Input
                    type="number"
                    value={data.busLines5v || '0'}
                    onChange={(e) => onChange('busLines5v', e.target.value)}
                    className="w-28"
                  />
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Líneas de datos 12v</TableCell>
                <TableCell>
                  <Input
                    type="number"
                    value={data.serialLines12v || '0'}
                    onChange={(e) => onChange('serialLines12v', e.target.value)}
                    className="w-28"
                  />
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Líneas de datos 24v</TableCell>
                <TableCell>
                  <Input
                    type="number"
                    value={data.controlLines24v || '0'}
                    onChange={(e) => onChange('controlLines24v', e.target.value)}
                    className="w-28"
                  />
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Líneas de datos 48v</TableCell>
                <TableCell>
                  <Input
                    type="number"
                    value={data.controlLines48v || '0'}
                    onChange={(e) => onChange('controlLines48v', e.target.value)}
                    className="w-28"
                  />
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
          <div className="mt-4 flex items-center justify-between">
            <Label className="font-bold">Número total de líneas a proteger</Label>
            <Input
              type="number"
              value={
                (parseInt(data.ethernetLines) || 0) +
                (parseInt(data.busLines5v) || 0) +
                (parseInt(data.serialLines12v) || 0) +
                (parseInt(data.controlLines24v) || 0) +
                (parseInt(data.controlLines48v) || 0)
              }
              readOnly
              className="w-28 bg-muted"
            />
          </div>
        </CardContent>
      </Card>

      {/* Botón para calcular materiales */}
      <div>
        <Button onClick={handleCalculateMaterials} className="bg-primary hover:bg-primary/90">
          <Calculator className="mr-2 h-5 w-5" />
          CALCULAR LOS MATERIALES
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
                  <TableCell>AT-B036</TableCell>
                  <TableCell>ATSUB-4P-NR-65TT. Imax 65kA. Up=230V</TableCell>
                  <TableCell className="text-right">1,00</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>AT-9079</TableCell>
                  <TableCell>IGA TEST I 125 D</TableCell>
                  <TableCell className="text-right">1,00</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>AT-9200</TableCell>
                  <TableCell>ATSUB-DM IIDN. Imax=15kA. Up=1,5kV. 2P</TableCell>
                  <TableCell className="text-right">2,00</TableCell>
                </TableRow>
              </TableBody>
            </Table>
            <p className="mt-4 text-sm text-primary">
              Para confeccionar el presupuesto para la protección interna, indique los elementos a proteger por cada
              edificio.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
