import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Building2, Download, Eye, FileCheck, FileText, Image as ImageIcon, MapPin, Ruler } from 'lucide-react'

import type { QuoteRequestStepProps } from '@/types/stepProps'
import type { RiskFormData } from '@/hooks/useRiskForm'

// === TIPOS Y DATOS ===

interface Material {
  ref: string
  description: string
  quantity: string
}

interface NormativeItem {
  label: string
  value?: string
  getValue?: (data: RiskFormData) => string
}

// Materiales externos estimados
const EXTERNAL_MATERIALS: Material[] = [
  { ref: 'AT-1560', description: 'DAT CONTROLER® REMOTE 60', quantity: '1,00' },
  { ref: 'AT-010A', description: 'Pieza adaptación, latón, para mástil PVC o cable o pletina', quantity: '1,00' },
  { ref: 'AT-056A', description: 'Mástil de Ø60 x 6m, galvanizado (2 tramos)', quantity: '1,00' },
  { ref: 'AT-023B', description: 'Anclaje en U 30cm atornillable (2 sop.), galvanizado', quantity: '1,00' },
  { ref: 'AT-184E', description: 'Soporte cónico esmaltado de 30 a 2mm', quantity: '1,00' },
  { ref: 'AT-052D', description: 'Pletina de cobre para cable o pletina (lleno)', quantity: '56,00' },
  { ref: 'AT-240E', description: 'Grapa helice de inox para pletina', quantity: '72,00' },
  { ref: 'AT-034G', description: 'Contador electromecánico de rayos', quantity: '1,00' },
  { ref: 'AT-060G', description: 'Tubo de protección de acero galvanizado de 2m para pletina', quantity: '2,00' },
  { ref: 'AT-010H', description: 'Arqueta de polipropileno 250x250x300mm', quantity: '1,00' },
  { ref: 'AT-020H', description: 'Puente de comprobación de latón para arqueta', quantity: '2,00' },
  { ref: 'AT-055H', description: 'Conjunto de piquetas con manguito AT-090H', quantity: '2,00' },
  { ref: 'AT-050K', description: 'Vía de chispas para unión de tierras', quantity: '2,00' },
  { ref: 'AT-020F', description: 'Manguito cuadrado de latón para cable y pletina', quantity: '2,00' },
  { ref: 'AT-060F', description: 'Vía de chispas para mástil de antena', quantity: '1,00' },
]

// Materiales internos estimados
const INTERNAL_MATERIALS: Material[] = [
  { ref: 'AT-B036', description: 'ATSUB-4P-NR-65TT. Imax 65kA. Up=230V', quantity: '1,00' },
  { ref: 'AT-9079', description: 'IGA TEST I 125 D', quantity: '1,00' },
  { ref: 'AT-9200', description: 'ATSUB-DM IIDN. Imax=15kA. Up=1,5kV. 2P', quantity: '2,00' },
]

// === COMPONENTES ===

/**
 * Componente para renderizar tabla de materiales
 */
interface MaterialsTableProps {
  materials: Material[]
}

function MaterialsTable({ materials }: MaterialsTableProps) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Ref.</TableHead>
          <TableHead>Materiales</TableHead>
          <TableHead className="text-right">Cantidad</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {materials.map((material) => (
          <TableRow key={material.ref}>
            <TableCell>{material.ref}</TableCell>
            <TableCell>{material.description}</TableCell>
            <TableCell className="text-right">{material.quantity}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}

/**
 * Paso 8: Solicitar Presupuesto / Resumen y Documentación
 * Basado en el diseño original de CD-Risk
 */
export function QuoteRequestStep({ data, onChange }: QuoteRequestStepProps) {
  const [showExternalMaterials, setShowExternalMaterials] = useState(false)
  const [showInternalMaterials, setShowInternalMaterials] = useState(false)
  const [showSchemeModal, setShowSchemeModal] = useState(false)

  const totalBajantes = data.externalProtectionZones?.reduce((sum, zone) => {
    return sum + (zone.bajantesNumber || 0)
  }, 0) || 0

  // Datos normativos
  const normativeData: NormativeItem[] = [
    {
      label: 'Normativa aplicada',
      value: 'UNE 21186:2011',
    },
    {
      label: 'Nivel de protección',
      getValue: (data) => data.protectionLevel ? `NIVEL ${data.protectionLevel}` : 'NIVEL III',
    },
    {
      label: 'Clase de SPD necesaria',
      getValue: (data) => data.internalProtection || 'Protección coordinada',
    },
  ]

  return (
    <div className="flex flex-col gap-6">
      <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        <Card>
          <CardHeader>
            <CardTitle className="text-primary flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Resumen del proyecto
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-8">
            <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
              <span className="font-semibold text-foreground">Nombre del edificio:</span>
              <span className="font-semibold text-foreground">{data.projectName || 'Edificio'}</span>
            </div>

            <div className="flex flex-wrap gap-2">
              <span className="inline-flex items-center gap-2 rounded-full border bg-muted/40 px-3 py-1 text-xs text-muted-foreground">
                <MapPin className="h-3 w-3 text-primary" />
                {data.projectAddress || 'C/ Calle edificio nº8, 00000, España'}
              </span>
              <span className="inline-flex items-center gap-2 rounded-full border bg-muted/40 px-3 py-1 text-xs text-muted-foreground">
                <Ruler className="h-3 w-3 text-primary" />
                {data.height ? `${data.height} m` : 'Altura --'}
              </span>
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              <div className="rounded-lg border bg-muted/30 p-3">
                <p className="text-[11px] text-muted-foreground">Instalaciones:</p>
                <p className="text-sm font-semibold text-foreground">{data.buildingsToProtect || '1'}</p>
              </div>
              <div className="rounded-lg border bg-muted/30 p-3">
                <p className="text-[11px] text-muted-foreground">Nº de bajantes:</p>
                <p className="text-sm font-semibold text-foreground">
                  {totalBajantes > 0 ? totalBajantes : (data.externalProtectionZones?.length || 0)}
                </p>
              </div>
              <div className="rounded-lg border bg-muted/30 p-3">
                <p className="text-[11px] text-muted-foreground">Tipo de instalación:</p>
                <p className="text-sm font-semibold text-foreground">Instalación xxx</p>
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowExternalMaterials(true)}
                className="border-primary text-primary hover:bg-primary hover:text-primary-foreground"
              >
                <Eye className="mr-2 h-4 w-4" />
                Ver materiales externos
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowInternalMaterials(true)}
                className="border-primary text-primary hover:bg-primary hover:text-primary-foreground"
              >
                <Eye className="mr-2 h-4 w-4" />
                Ver materiales internos
              </Button>
            </div>

            <p className="text-xs text-muted-foreground">
              Estos datos son una estimación inicial. Para un cálculo preciso, genere el informe completo.
            </p>

            <div className="border-t pt-4 space-y-8">
              <div className="flex items-center gap-2 text-sm font-semibold text-primary">
                <Building2 className="h-4 w-4" />
                Reenviar a...
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="confirmedName">Nombre</Label>
                  <Input
                    id="confirmedName"
                    value={data.clientName || ''}
                    onChange={(e) => onChange('clientName', e.target.value)}
                    placeholder="Nombre"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirmedEmail">Email</Label>
                  <Input
                    id="confirmedEmail"
                    value={data.clientEmail || ''}
                    onChange={(e) => onChange('clientEmail', e.target.value)}
                    placeholder="correo@ejemplo.com"
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-primary">Datos normativos</CardTitle>
          </CardHeader>
          <CardContent className="space-y-8">
            <div className="space-y-8 text-sm">
              {normativeData.map((item, index) => (
                <div key={index} className="flex items-center justify-between border-b pb-2 last:border-b-0">
                  <span className="text-muted-foreground">{item.label}</span>
                  <span className="font-semibold text-foreground">
                    {item.getValue ? item.getValue(data) : item.value}
                  </span>
                </div>
              ))}
              <p className="text-xs text-muted-foreground">
                Para detalles completos, consulte la documentación generada.
              </p>
            </div>

            <div className="border-t pt-4 space-y-8">
              <h4 className="text-sm font-semibold text-primary">Generar y descargar documentación</h4>
              <div className="grid gap-2 sm:grid-cols-3">
                <Button
                  className="bg-primary hover:bg-primary/90"
                  size="sm"
                  onClick={() => setShowSchemeModal(true)}
                >
                  <FileText className="mr-2 h-4 w-4" />
                  Documentación (PDF)
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowSchemeModal(true)}
                >
                  <Download className="mr-2 h-4 w-4" />
                  Estudio/proyecto
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowSchemeModal(true)}
                >
                  <FileCheck className="mr-2 h-4 w-4" />
                  Fichas técnicas
                </Button>
              </div>
            </div>

            <div className="border-t pt-4 space-y-8">
              <h6 className="text-sm font-semibold text-primary">Verificación y consentimiento</h6>
              <div className="space-y-8">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="captchaCheck"
                    checked={data.captchaCheck || false}
                    onCheckedChange={(checked) => onChange('captchaCheck', checked === true)}
                  />
                  <Label htmlFor="captchaCheck" className="cursor-pointer">
                    No soy un robot
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="termsConsent"
                    checked={data.termsConsent || false}
                    onCheckedChange={(checked) => onChange('termsConsent', checked === true)}
                  />
                  <Label htmlFor="termsConsent" className="cursor-pointer text-sm">
                    Acepto los{' '}
                    <a href="#" className="text-primary underline">
                      términos y condiciones
                    </a>{' '}
                    y la{' '}
                    <a href="#" className="text-primary underline">
                      política de privacidad
                    </a>
                    .
                  </Label>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Modal de Materiales Externos */}
      <Dialog open={showExternalMaterials} onOpenChange={setShowExternalMaterials}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-auto">
          <DialogHeader>
            <DialogTitle className="text-primary">Listado Detallado de Materiales Externos</DialogTitle>
          </DialogHeader>
          <MaterialsTable materials={EXTERNAL_MATERIALS} />
          <DialogFooter>
            <Button variant="secondary" onClick={() => setShowExternalMaterials(false)}>
              Cerrar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal de Materiales Internos */}
      <Dialog open={showInternalMaterials} onOpenChange={setShowInternalMaterials}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-auto">
          <DialogHeader>
            <DialogTitle className="text-primary">Listado Detallado de Materiales Internos</DialogTitle>
          </DialogHeader>
          <MaterialsTable materials={INTERNAL_MATERIALS} />
          <DialogFooter>
            <Button variant="secondary" onClick={() => setShowInternalMaterials(false)}>
              Cerrar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal del Esquema de Protección - Se muestra al generar documentación */}
      <Dialog open={showSchemeModal} onOpenChange={setShowSchemeModal}>
        <DialogContent className="max-w-5xl max-h-[90vh] overflow-auto">
          <DialogHeader>
            <DialogTitle className="text-primary">Esquema de Protección - Vista Final</DialogTitle>
          </DialogHeader>
          <div className="space-y-8">
            {data.schemeImage ? (
              <>
                <div className="rounded-lg border bg-muted/50 p-4">
                  <img
                    src={data.schemeImage}
                    alt="Esquema de protección final"
                    className="w-full h-auto rounded"
                  />
                </div>
                <p className="text-sm text-muted-foreground text-center">
                  Capturado el {data.schemeImageTimestamp ? new Date(data.schemeImageTimestamp).toLocaleString('es-ES') : 'fecha desconocida'}
                </p>
              </>
            ) : (
              <div className="rounded-lg border border-dashed bg-muted/30 p-8 text-center">
                <ImageIcon className="mx-auto h-12 w-12 text-muted-foreground mb-3" />
                <p className="text-muted-foreground">
                  No hay esquema de protección capturado
                </p>
                <p className="text-sm text-muted-foreground mt-2">
                  Por favor, complete el Paso 5 (Esquema de Protección) para generar el esquema
                </p>
              </div>
            )}
          </div>
          <DialogFooter className="gap-2">
            <Button variant="secondary" onClick={() => setShowSchemeModal(false)}>
              Cerrar
            </Button>
            {data.schemeImage && (
              <Button
                className="bg-primary hover:bg-primary/90"
                onClick={() => {
                  const link = document.createElement('a')
                  link.download = `esquema-proteccion-${data.schemeImageTimestamp || Date.now()}.png`
                  link.href = data.schemeImage!
                  document.body.appendChild(link)
                  link.click()
                  document.body.removeChild(link)
                }}
              >
                <ImageIcon className="mr-2 h-4 w-4" />
                Descargar Esquema
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
