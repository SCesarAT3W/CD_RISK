import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { FileText, Download, FileCheck, Eye, Image as ImageIcon } from 'lucide-react'

import type { QuoteRequestStepProps } from '@/types/stepProps'
import type { RiskFormData } from '@/hooks/useRiskForm'

// === TIPOS Y DATOS ===

interface Material {
  ref: string
  description: string
  quantity: string
}

interface ProjectSummaryItem {
  label: string
  value: string | number | React.ReactNode
  getValue?: (data: RiskFormData) => string | number | React.ReactNode
}

interface NormativeItem {
  label: string
  value: string
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
 * Componente para items del resumen del proyecto
 */
interface SummaryItemProps {
  label: string
  value: string | number | React.ReactNode
}

function SummaryItem({ label, value }: SummaryItemProps) {
  return (
    <li className="flex justify-between border-b pb-2">
      <span>{label}:</span>
      <span className="font-bold">{value}</span>
    </li>
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

  // Datos del resumen del proyecto
  const projectSummary: ProjectSummaryItem[] = [
    {
      label: 'Nombre del edificio',
      getValue: (data) => data.projectName || 'EDIFICIO PRODUCCIÓN',
    },
    {
      label: 'Dirección',
      getValue: (data) => data.projectAddress || 'AVENIDA DE LA INDUSTRIA 32',
    },
    {
      label: 'Tipo de Instalación',
      value: 'Instalación sobre el edificio a proteger',
    },
    {
      label: 'Altura del Edificio',
      getValue: (data) => `${data.height || '20.00'} m`,
    },
    {
      label: 'Cantidad de instalaciones',
      getValue: (data) => data.buildingsToProtect || '1',
    },
    {
      label: 'Nº de Bajantes',
      getValue: (data) => data.bajantesNumber || '2',
    },
    {
      label: 'Materiales Externos Estimados',
      value: (
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowExternalMaterials(true)}
          className="border-primary text-primary hover:bg-primary hover:text-primary-foreground"
        >
          <Eye className="mr-2 h-4 w-4" />
          Ver listado detallado
        </Button>
      ),
    },
    {
      label: 'Materiales Internos Estimados',
      value: (
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowInternalMaterials(true)}
          className="border-primary text-primary hover:bg-primary hover:text-primary-foreground"
        >
          <Eye className="mr-2 h-4 w-4" />
          Ver listado detallado
        </Button>
      ),
    },
  ]

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
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-primary">Resumen y Documentación del Proyecto</h2>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Columna izquierda: Resumen del proyecto */}
        <div className="flex flex-col space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-primary">RESUMEN DEL PROYECTO</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="mb-4 text-sm text-muted-foreground">
                Aquí mostrará un resumen de los datos principales y los resultados clave del proyecto.
              </p>
              <ul className="space-y-2">
                {projectSummary.map((item, index) => (
                  <SummaryItem
                    key={index}
                    label={item.label}
                    value={item.getValue ? item.getValue(data) : item.value}
                  />
                ))}
              </ul>
              <p className="mt-4 text-sm text-muted-foreground">
                Estos datos son una estimación inicial. Para un cálculo preciso, genere el informe completo.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-primary">Datos de Contacto</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="confirmedName">Nombre</Label>
                <Input
                  id="confirmedName"
                  value={data.clientName || '[Nombre del Usuario]'}
                  readOnly
                  className="bg-muted"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmedEmail">Correo Electrónico</Label>
                <Input
                  id="confirmedEmail"
                  value={data.clientEmail || '[correo.usuario@ejemplo.com]'}
                  readOnly
                  className="bg-muted"
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Columna derecha: Datos normativos y descargas */}
        <div className="flex flex-col space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-primary">DATOS NORMATIVOS</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="mb-4 text-sm text-muted-foreground">
                Principales normativas y estándares aplicados:
              </p>
              <ul className="space-y-2">
                {normativeData.map((item, index) => (
                  <SummaryItem
                    key={index}
                    label={item.label}
                    value={item.getValue ? item.getValue(data) : item.value}
                  />
                ))}
              </ul>
              <p className="mt-4 text-sm text-muted-foreground">
                Para detalles completos, consulte la documentación generada.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-primary">GENERAR Y DESCARGAR DOCUMENTACIÓN</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button
                className="w-full bg-primary hover:bg-primary/90"
                size="lg"
                onClick={() => setShowSchemeModal(true)}
              >
                <FileText className="mr-2 h-5 w-5" />
                Generar Documentación (PDF)
              </Button>
              <Button
                className="w-full"
                variant="outline"
                size="lg"
                onClick={() => setShowSchemeModal(true)}
              >
                <Download className="mr-2 h-5 w-5" />
                Descargar Estudio / Proyecto
              </Button>
              <Button
                className="w-full"
                variant="outline"
                size="lg"
                onClick={() => setShowSchemeModal(true)}
              >
                <FileCheck className="mr-2 h-5 w-5" />
                Descargar Fichas Técnicas
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-primary">Verificación y Consentimiento</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <h6 className="font-semibold text-primary">Verificación de Seguridad</h6>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="captchaCheck"
                    checked={data.captchaCheck || false}
                    onCheckedChange={(checked) => onChange('captchaCheck', checked)}
                  />
                  <Label htmlFor="captchaCheck" className="cursor-pointer">
                    No soy un robot
                  </Label>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="termsConsent"
                  checked={data.termsConsent || false}
                  onCheckedChange={(checked) => onChange('termsConsent', checked)}
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
            </CardContent>
          </Card>
        </div>
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
          <div className="space-y-4">
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
