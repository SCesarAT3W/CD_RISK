import { useState } from 'react'
import { Label } from '@/components/ui/label'
import { Card, CardAction, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Button } from '@/components/ui/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { NumberStepper } from '@/components/ui/number-stepper'
import { Calculator, ShieldCheck } from 'lucide-react'

import type { InternalProtectionStepProps } from '@/types/stepProps'

/**
 * Paso 7: Materiales de protección interna
 * Basado en el diseño original de CD-Risk
 */
export function InternalProtectionStep({ data, onChange }: InternalProtectionStepProps) {
  const [showMaterialsTable, setShowMaterialsTable] = useState(false)

  const handleCalculateMaterials = () => {
    setShowMaterialsTable(true)
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        <Card className="flex-1">
          <CardHeader>
            <CardTitle className="text-primary flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-primary" />
              Materiales para protección interna
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-8">
            <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
              <span className="font-semibold text-foreground">Edificio:</span>
              <span className="font-semibold text-foreground">{data.buildingName || 'Edificio XXX'}</span>
              <span className="text-border">|</span>
              <span>Altura:</span>
              <span className="font-semibold text-foreground">{data.height ? `${data.height} m` : '—'}</span>
            </div>

            <div className="border-t" />

            <div className="space-y-8">
              <p className="text-[11px] font-semibold tracking-wide text-muted-foreground uppercase">
                Protección interna de líneas eléctricas
              </p>
              <div className="flex flex-wrap gap-x-8 gap-y-12">
                <div className="space-y-2">
                  <Label className="mb-1 block text-[11px] text-muted-foreground">
                    ¿Existe un diferencial general de 30 mA?
                  </Label>
                  <RadioGroup
                    value={data.diffGeneral30mA || ''}
                    onValueChange={(value) => onChange('diffGeneral30mA', value)}
                    className="flex gap-4 text-xs"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="Si" id="diffGeneralYes" />
                      <Label htmlFor="diffGeneralYes" className="text-xs">
                        Sí
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="No" id="diffGeneralNo" />
                      <Label htmlFor="diffGeneralNo" className="text-xs">
                        No
                      </Label>
                    </div>
                  </RadioGroup>
                </div>

                <div className="space-y-2">
                  <Label className="mb-1 block text-[11px] text-muted-foreground">
                    Intensidad nominal del interruptor general automático del mayor cuadro principal
                  </Label>
                  <RadioGroup
                    value={data.intensity || ''}
                    onValueChange={(value) => onChange('intensity', value)}
                    className="flex flex-wrap gap-3 text-xs"
                  >
                    {['25A', '32A', '40A', '50A', '63A', '80A', '100A', '125A', '>125A'].map((value) => (
                      <div key={value} className="flex items-center space-x-2">
                        <RadioGroupItem value={value} id={`intensity${value}`} />
                        <Label htmlFor={`intensity${value}`} className="text-xs">
                          {value}
                        </Label>
                      </div>
                    ))}
                  </RadioGroup>
                </div>
              </div>
            </div>

            <div className="border-t" />

            <div className="space-y-8">
              <p className="text-[11px] font-semibold tracking-wide text-muted-foreground uppercase">
                Cuadros principales
              </p>
              <Table className="text-xs">
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-[11px] font-semibold uppercase text-muted-foreground">Tensión</TableHead>
                    <TableHead className="text-[11px] font-semibold uppercase text-muted-foreground">Tipo</TableHead>
                    <TableHead className="text-[11px] font-semibold uppercase text-muted-foreground">
                      Cuadros a proteger
                    </TableHead>
                    <TableHead className="text-[11px] font-semibold uppercase text-muted-foreground">Neutro</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow>
                    <TableCell>400 v</TableCell>
                    <TableCell>Trifásico</TableCell>
                    <TableCell>
                      <NumberStepper
                        value={data.principalPanel400v || 0}
                        onChange={(nextValue) => onChange('principalPanel400v', nextValue)}
                        ariaLabelMinus="Disminuir cuadros 400v"
                        ariaLabelPlus="Aumentar cuadros 400v"
                      />
                    </TableCell>
                    <TableCell>
                      <RadioGroup
                        value={data.principalPanel400vNeutro || ''}
                        onValueChange={(value) => onChange('principalPanel400vNeutro', value)}
                        className="flex gap-3 text-xs"
                      >
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="si" id="panel400vNeutroSi" />
                          <Label htmlFor="panel400vNeutroSi" className="text-xs">
                            Sí
                          </Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="no" id="panel400vNeutroNo" />
                          <Label htmlFor="panel400vNeutroNo" className="text-xs">
                            No
                          </Label>
                        </div>
                      </RadioGroup>
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>230 v</TableCell>
                    <TableCell>Trifásico</TableCell>
                    <TableCell>
                      <NumberStepper
                        value={data.principalPanel230v || 0}
                        onChange={(nextValue) => onChange('principalPanel230v', nextValue)}
                        ariaLabelMinus="Disminuir cuadros 230v trifásico"
                        ariaLabelPlus="Aumentar cuadros 230v trifásico"
                      />
                    </TableCell>
                    <TableCell>
                      <RadioGroup
                        value={data.principalPanel230vNeutro || ''}
                        onValueChange={(value) => onChange('principalPanel230vNeutro', value)}
                        className="flex gap-3 text-xs"
                      >
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="si" id="panel230vNeutroSi" />
                          <Label htmlFor="panel230vNeutroSi" className="text-xs">
                            Sí
                          </Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="no" id="panel230vNeutroNo" />
                          <Label htmlFor="panel230vNeutroNo" className="text-xs">
                            No
                          </Label>
                        </div>
                      </RadioGroup>
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>230 v</TableCell>
                    <TableCell>Monofásico</TableCell>
                    <TableCell>
                      <NumberStepper
                        value={data.principalPanel230vM || 0}
                        onChange={(nextValue) => onChange('principalPanel230vM', nextValue)}
                        ariaLabelMinus="Disminuir cuadros 230v monofásico"
                        ariaLabelPlus="Aumentar cuadros 230v monofásico"
                      />
                    </TableCell>
                    <TableCell></TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>120 v</TableCell>
                    <TableCell>Monofásico</TableCell>
                    <TableCell>
                      <NumberStepper
                        value={data.principalPanel120vM || 0}
                        onChange={(nextValue) => onChange('principalPanel120vM', nextValue)}
                        ariaLabelMinus="Disminuir cuadros 120v monofásico"
                        ariaLabelPlus="Aumentar cuadros 120v monofásico"
                      />
                    </TableCell>
                    <TableCell></TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </div>

            <div className="border-t" />

            <div className="space-y-8">
              <p className="text-[11px] font-semibold tracking-wide text-muted-foreground uppercase">
                Cuadros secundarios
              </p>
              <Table className="text-xs">
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-[11px] font-semibold uppercase text-muted-foreground">Tensión</TableHead>
                    <TableHead className="text-[11px] font-semibold uppercase text-muted-foreground">Tipo</TableHead>
                    <TableHead className="text-[11px] font-semibold uppercase text-muted-foreground">
                      Cuadros a proteger
                    </TableHead>
                    <TableHead className="text-[11px] font-semibold uppercase text-muted-foreground">Neutro</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow>
                    <TableCell>400 v</TableCell>
                    <TableCell>Trifásico</TableCell>
                    <TableCell>
                      <NumberStepper
                        value={data.secondaryPanel400v || 0}
                        onChange={(nextValue) => onChange('secondaryPanel400v', nextValue)}
                        ariaLabelMinus="Disminuir cuadros secundarios 400v"
                        ariaLabelPlus="Aumentar cuadros secundarios 400v"
                      />
                    </TableCell>
                    <TableCell>
                      <RadioGroup
                        value={data.secondaryPanel400vNeutro || ''}
                        onValueChange={(value) => onChange('secondaryPanel400vNeutro', value)}
                        className="flex gap-3 text-xs"
                      >
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="si" id="secondaryPanel400vSi" />
                          <Label htmlFor="secondaryPanel400vSi" className="text-xs">
                            Sí
                          </Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="no" id="secondaryPanel400vNo" />
                          <Label htmlFor="secondaryPanel400vNo" className="text-xs">
                            No
                          </Label>
                        </div>
                      </RadioGroup>
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>230 v</TableCell>
                    <TableCell>Trifásico</TableCell>
                    <TableCell>
                      <NumberStepper
                        value={data.secondaryPanel230v || 0}
                        onChange={(nextValue) => onChange('secondaryPanel230v', nextValue)}
                        ariaLabelMinus="Disminuir cuadros secundarios 230v trifásico"
                        ariaLabelPlus="Aumentar cuadros secundarios 230v trifásico"
                      />
                    </TableCell>
                    <TableCell>
                      <RadioGroup
                        value={data.secondaryPanel230vNeutro || ''}
                        onValueChange={(value) => onChange('secondaryPanel230vNeutro', value)}
                        className="flex gap-3 text-xs"
                      >
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="si" id="secondaryPanel230vSi" />
                          <Label htmlFor="secondaryPanel230vSi" className="text-xs">
                            Sí
                          </Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="no" id="secondaryPanel230vNo" />
                          <Label htmlFor="secondaryPanel230vNo" className="text-xs">
                            No
                          </Label>
                        </div>
                      </RadioGroup>
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>230 v</TableCell>
                    <TableCell>Monofásico</TableCell>
                    <TableCell>
                      <NumberStepper
                        value={data.secondaryPanel230vM || 0}
                        onChange={(nextValue) => onChange('secondaryPanel230vM', nextValue)}
                        ariaLabelMinus="Disminuir cuadros secundarios 230v monofásico"
                        ariaLabelPlus="Aumentar cuadros secundarios 230v monofásico"
                      />
                    </TableCell>
                    <TableCell></TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>120 v</TableCell>
                    <TableCell>Monofásico</TableCell>
                    <TableCell>
                      <NumberStepper
                        value={data.secondaryPanel120vM || 0}
                        onChange={(nextValue) => onChange('secondaryPanel120vM', nextValue)}
                        ariaLabelMinus="Disminuir cuadros secundarios 120v monofásico"
                        ariaLabelPlus="Aumentar cuadros secundarios 120v monofásico"
                      />
                    </TableCell>
                    <TableCell></TableCell>
                  </TableRow>
                </TableBody>
              </Table>
              <p className="text-[11px] text-muted-foreground">
                En caso de que no exista una protección de igual o menor corriente nominal instalada aguas arriba del
                protector, se deberá prever la instalación de fusibles 125A gl / gG.
              </p>
            </div>

            <div className="border-t" />

            <div className="space-y-8">
              <p className="text-[11px] font-semibold tracking-wide text-muted-foreground uppercase">
                Protección de líneas telefónicas
              </p>
              <Table className="text-xs">
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-[11px] font-semibold uppercase text-muted-foreground">
                      Tipo de línea
                    </TableHead>
                    <TableHead className="text-[11px] font-semibold uppercase text-muted-foreground">
                      Cuadros a proteger
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow>
                    <TableCell>Líneas analógicas a proteger</TableCell>
                    <TableCell>
                      <NumberStepper
                        value={data.analogLinesNumber || 0}
                        onChange={(nextValue) => onChange('analogLinesNumber', nextValue)}
                        ariaLabelMinus="Disminuir líneas analógicas"
                        ariaLabelPlus="Aumentar líneas analógicas"
                      />
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>Líneas digitales a proteger</TableCell>
                    <TableCell>
                      <NumberStepper
                        value={data.digitalLinesNumber || 0}
                        onChange={(nextValue) => onChange('digitalLinesNumber', nextValue)}
                        ariaLabelMinus="Disminuir líneas digitales"
                        ariaLabelPlus="Aumentar líneas digitales"
                      />
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
              <div className="flex items-center justify-end gap-3 text-[11px]">
                <span className="font-semibold text-foreground">Total de líneas a proteger</span>
                <div className="flex h-8 w-20 items-center justify-center rounded-md border bg-muted text-sm font-semibold">
                  {(data.analogLinesNumber || 0) + (data.digitalLinesNumber || 0)}
                </div>
              </div>
            </div>

            <div className="border-t" />

            <div className="space-y-8">
              <p className="text-[11px] font-semibold tracking-wide text-muted-foreground uppercase">
                Protección de líneas informáticas de datos
              </p>
              <Table className="text-xs">
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-[11px] font-semibold uppercase text-muted-foreground">
                      Tipo de línea
                    </TableHead>
                    <TableHead className="text-[11px] font-semibold uppercase text-muted-foreground">
                      Cuadros a proteger
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow>
                    <TableCell>Líneas Ethernet (RJ45)</TableCell>
                    <TableCell>
                      <NumberStepper
                        value={data.ethernetLines || 0}
                        onChange={(nextValue) => onChange('ethernetLines', nextValue)}
                        ariaLabelMinus="Disminuir líneas ethernet"
                        ariaLabelPlus="Aumentar líneas ethernet"
                      />
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>Líneas de datos 5v</TableCell>
                    <TableCell>
                      <NumberStepper
                        value={data.busLines5v || 0}
                        onChange={(nextValue) => onChange('busLines5v', nextValue)}
                        ariaLabelMinus="Disminuir líneas de datos 5v"
                        ariaLabelPlus="Aumentar líneas de datos 5v"
                      />
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>Líneas de datos 12v</TableCell>
                    <TableCell>
                      <NumberStepper
                        value={data.serialLines12v || 0}
                        onChange={(nextValue) => onChange('serialLines12v', nextValue)}
                        ariaLabelMinus="Disminuir líneas de datos 12v"
                        ariaLabelPlus="Aumentar líneas de datos 12v"
                      />
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>Líneas de datos 24v</TableCell>
                    <TableCell>
                      <NumberStepper
                        value={data.controlLines24v || 0}
                        onChange={(nextValue) => onChange('controlLines24v', nextValue)}
                        ariaLabelMinus="Disminuir líneas de datos 24v"
                        ariaLabelPlus="Aumentar líneas de datos 24v"
                      />
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>Líneas de datos 48v</TableCell>
                    <TableCell>
                      <NumberStepper
                        value={data.controlLines48v || 0}
                        onChange={(nextValue) => onChange('controlLines48v', nextValue)}
                        ariaLabelMinus="Disminuir líneas de datos 48v"
                        ariaLabelPlus="Aumentar líneas de datos 48v"
                      />
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
              <div className="flex items-center justify-end gap-3 text-[11px]">
                <span className="font-semibold text-foreground">Total de líneas a proteger</span>
                <div className="flex h-8 w-20 items-center justify-center rounded-md border bg-muted text-sm font-semibold">
                  {(data.ethernetLines || 0) +
                    (data.busLines5v || 0) +
                    (data.serialLines12v || 0) +
                    (data.controlLines24v || 0) +
                    (data.controlLines48v || 0)}
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <Button onClick={handleCalculateMaterials} className="bg-primary hover:bg-primary/90">
                <Calculator className="mr-2 h-4 w-4" />
                Recalcular los materiales
              </Button>
            </div>
          </CardContent>
        </Card>

        <div className="flex flex-col gap-6">
          <Card className="rounded-2xl border border-border/60 bg-[var(--surface-muted)] shadow-[0px_6px_18px_0px_var(--shadow-6)]">
            <CardHeader className="border-b pb-4">
              <CardTitle hideIcon className="text-[11px] font-semibold uppercase text-muted-foreground">
                Vista previa del material
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-5">
              <div className="overflow-hidden rounded-xl border bg-card p-4 shadow-[0px_2px_6px_0px_var(--shadow-5)]">
                <img
                  src="/products/AT-2560_ANCHO.JPG"
                  alt="Protector interno"
                  className="h-44 w-full object-contain"
                />
                <div className="mt-3 flex items-center justify-between text-xs font-semibold text-primary">
                  <span>ATSUB-4P-NR-65TT</span>
                  <span className="rounded-full border px-2 py-1 text-[10px] text-muted-foreground">AT-8036</span>
                </div>
                <div className="mt-2 flex gap-2 text-[10px] text-muted-foreground">
                  <span className="rounded-full border px-2 py-1">Imax 65kA</span>
                  <span className="rounded-full border px-2 py-1">Up=230V</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-2xl border border-border/60 bg-[var(--surface-muted)] shadow-[0px_6px_18px_0px_var(--shadow-6)]">
            <CardHeader className="border-b pb-4">
              <CardTitle hideIcon className="text-[11px] font-semibold uppercase text-muted-foreground">
                Resumen materiales
              </CardTitle>
              <CardAction>
                <span className="rounded-full border px-2 py-1 text-[10px] text-muted-foreground">3 items</span>
              </CardAction>
            </CardHeader>
            <CardContent className="pt-5">
              {showMaterialsTable ? (
                <div className="overflow-hidden rounded-xl border bg-card">
                  <Table className="text-xs">
                    <TableHeader className="bg-card">
                      <TableRow>
                        <TableHead className="text-[11px] font-semibold uppercase text-muted-foreground">Ref.</TableHead>
                        <TableHead className="text-[11px] font-semibold uppercase text-muted-foreground">
                          Material
                        </TableHead>
                        <TableHead className="text-right text-[11px] font-semibold uppercase text-muted-foreground">
                          Cantidad
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      <TableRow>
                        <TableCell>AT-5578</TableCell>
                        <TableCell>ATSUB-4P-NR-65TT. Imax 65kA. Up=230V</TableCell>
                        <TableCell className="text-right">1</TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </div>
              ) : (
                <p className="text-xs text-muted-foreground">Sin materiales calculados.</p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
