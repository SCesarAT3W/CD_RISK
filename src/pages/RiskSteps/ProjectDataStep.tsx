import { memo } from 'react'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

import type { ProjectDataStepProps } from '@/types/stepProps'
import { COUNTRIES, NORMATIVES } from '@/config/formConfig'

/**
 * Paso 1: Datos del Proyecto
 * Basado en el diseño original de CD-Risk
 */
function ProjectDataStepInner({ data, onChange, onBulkChange }: ProjectDataStepProps) {
  return (
    <div className="space-y-6">
      {/* Título */}
      <p className="text-lg font-bold text-muted-foreground">
        Cálculo de riesgo según norma IEC 62305-2, UNE 21186, NFC 17102, NP 4426 y equivalentes.
      </p>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Columna izquierda: Datos del Proyecto */}
        <Card>
          <CardHeader>
            <CardTitle className="text-primary">DATOS DEL PROYECTO</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Nombre Proyecto */}
            <div className="space-y-2">
              <Label htmlFor="projectName">
                Nombre Proyecto <span className="text-destructive">*</span>
              </Label>
              <Input
                id="projectName"
                value={data.projectName || ''}
                onChange={(e) => onChange('projectName', e.target.value)}
                placeholder="Ingresa el nombre del proyecto"
              />
              {!data.projectName && (
                <p className="text-xs text-destructive">Este campo es requerido</p>
              )}
            </div>

            {/* Dirección */}
            <div className="space-y-2">
              <Label htmlFor="projectAddress">
                Dirección
              </Label>
              <Input
                id="projectAddress"
                value={data.projectAddress || ''}
                onChange={(e) => onChange('projectAddress', e.target.value)}
              />
            </div>

            {/* País + Población + Provincia en la misma fila */}
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="projectCountry">País</Label>
                <Select
                  value={data.projectCountry || ''}
                  onValueChange={(value) => onChange('projectCountry', value)}
                >
                  <SelectTrigger id="projectCountry">
                    <SelectValue placeholder="Selecciona un país" />
                  </SelectTrigger>
                  <SelectContent>
                    {COUNTRIES.map((country) => (
                      <SelectItem key={country.value} value={country.value}>
                        {country.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="projectTown">
                  Población
                </Label>
                <Input
                  id="projectTown"
                  value={data.projectTown || ''}
                  onChange={(e) => onChange('projectTown', e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="projectProvince">
                  Provincia
                </Label>
                <Input
                  id="projectProvince"
                  value={data.projectProvince || ''}
                  onChange={(e) => onChange('projectProvince', e.target.value)}
                />
              </div>
            </div>

            {/* Edificios a proteger */}
            <div className="space-y-2">
              <Label htmlFor="buildingsToProtect">
                Edificios a proteger <span className="text-destructive">*</span>
              </Label>
              <Input
                id="buildingsToProtect"
                value={data.buildingsToProtect || 1}
                readOnly
                className="bg-muted"
              />
            </div>

            {/* Casos particulares */}
            <div className="mt-4">
              <Label className="mb-2 block">Casos particulares</Label>
              <div className="space-y-3 rounded-md border p-4">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="newConstruction"
                    checked={data.newConstruction || false}
                    onCheckedChange={(checked) => onChange('newConstruction', checked === true)}
                  />
                  <Label htmlFor="newConstruction" className="cursor-pointer">
                    Obra nueva
                  </Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="workplace"
                    checked={data.workplace || false}
                    onCheckedChange={(checked) => onChange('workplace', checked === true)}
                  />
                  <Label htmlFor="workplace" className="cursor-pointer">
                    Se utiliza como centro de trabajo
                  </Label>
                </div>

                {/* Solo para España */}
                {data.projectCountry === 'ES' && (
                  <>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="protectedArea"
                        checked={data.protectedArea || false}
                        onCheckedChange={(checked) => onChange('protectedArea', checked === true)}
                      />
                      <Label htmlFor="protectedArea" className="cursor-pointer">
                        Es una pirotécnia
                      </Label>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="touristCamp"
                        checked={data.touristCamp || false}
                        onCheckedChange={(checked) => onChange('touristCamp', checked === true)}
                      />
                      <Label htmlFor="touristCamp" className="cursor-pointer">
                        Es un campamento de turismo
                      </Label>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Normativa para el cálculo - Solo para España */}
            {data.projectCountry === 'ES' && (
              <div className="mt-4 space-y-2">
                <Label>
                  Normativa para el cálculo
                  <span className="ml-2 text-xs text-destructive font-normal">
                    (Solo para proyectos en ESPAÑA)
                  </span>
                </Label>
                <RadioGroup
                  value={data.calculationNormative || 'lightning'}
                  onValueChange={(value) => onChange('calculationNormative', value as 'lightning' | 'cte')}
                >
                  {NORMATIVES.map((option) => (
                    <div key={option.value} className="flex items-center space-x-2">
                      <RadioGroupItem value={option.value} id={`normative-${option.value}`} />
                      <Label htmlFor={`normative-${option.value}`} className="cursor-pointer font-normal">
                        {option.label}
                      </Label>
                    </div>
                  ))}
                </RadioGroup>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Columna derecha: Datos Proyectista */}
        <Card>
          <CardHeader>
            <CardTitle className="text-primary">DATOS PROYECTISTA</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Empresa/Nombre */}
            <div className="space-y-2">
              <Label htmlFor="clientName">
                Nombre
              </Label>
              <Input
                id="clientName"
                value={data.clientName || ''}
                onChange={(e) => onChange('clientName', e.target.value)}
              />
            </div>

            {/* CIF */}
            <div className="space-y-2">
              <Label htmlFor="clientCIF">
                CIF
              </Label>
              <Input
                id="clientCIF"
                value={data.clientCIF || ''}
                onChange={(e) => onChange('clientCIF', e.target.value)}
              />
            </div>

            {/* Dirección */}
            <div className="space-y-2">
              <Label htmlFor="clientAddress">
                Dirección
              </Label>
              <Input
                id="clientAddress"
                value={data.clientAddress || ''}
                onChange={(e) => onChange('clientAddress', e.target.value)}
              />
            </div>

            {/* Población + Provincia en la misma fila */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="clientTown">
                  Población
                </Label>
                <Input
                  id="clientTown"
                  value={data.clientTown || ''}
                  onChange={(e) => onChange('clientTown', e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="clientProvince">
                  Provincia
                </Label>
                <Input
                  id="clientProvince"
                  value={data.clientProvince || ''}
                  onChange={(e) => onChange('clientProvince', e.target.value)}
                />
              </div>
            </div>

            {/* Teléfono + E-mail en la misma fila */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="clientPhone">
                  Teléfono
                </Label>
                <Input
                  id="clientPhone"
                  type="tel"
                  value={data.clientPhone || ''}
                  onChange={(e) => onChange('clientPhone', e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="clientEmail">
                  E-mail
                </Label>
                <Input
                  id="clientEmail"
                  type="email"
                  value={data.clientEmail || ''}
                  onChange={(e) => onChange('clientEmail', e.target.value)}
                />
              </div>
            </div>

            {/* Separador para sección Contacto */}
            <div className="my-4 space-y-4 border-t pt-4">
              {/* Nombre del contacto */}
              <div className="space-y-2">
                <Label htmlFor="contactName">
                  Contacto
                </Label>
                <Input
                  id="contactName"
                  type="text"
                  value={data.contactName || ''}
                  onChange={(e) => onChange('contactName', e.target.value)}
                  placeholder="Nombre del contacto"
                />
              </div>

              {/* Móvil + E-mail de contacto en la misma fila */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="contactPhone">
                    Móvil
                  </Label>
                  <Input
                    id="contactPhone"
                    type="tel"
                    value={data.contactPhone || ''}
                    onChange={(e) => onChange('contactPhone', e.target.value)}
                    placeholder="+34 600 000 000"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="contactEmail">
                    E-mail de contacto
                  </Label>
                  <Input
                    id="contactEmail"
                    type="email"
                    value={data.contactEmail || ''}
                    onChange={(e) => onChange('contactEmail', e.target.value)}
                    placeholder="contacto@ejemplo.com"
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export const ProjectDataStep = memo(ProjectDataStepInner)
