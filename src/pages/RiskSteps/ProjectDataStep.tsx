import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Sparkles } from 'lucide-react'

import type { ProjectDataStepProps } from '@/types/stepProps'
import { COUNTRIES, NORMATIVES } from '@/config/formConfig'

const isDev = import.meta.env.DEV

// Generadores de datos aleatorios
const randomProjectNames = [
  'Edificio Corporativo Central',
  'Torre Empresarial Norte',
  'Centro Comercial Plaza',
  'Complejo Industrial Este',
  'Residencial Las Flores',
  'Hospital General San José',
]

const randomCities = ['Madrid', 'Barcelona', 'Valencia', 'Sevilla', 'Bilbao', 'Málaga']
const randomStreets = [
  'Calle Mayor',
  'Avenida Principal',
  'Paseo de la Reforma',
  'Calle del Sol',
  'Avenida Europa',
]
const randomCompanies = [
  'Construcciones Iberia S.L.',
  'Proyectos Técnicos SA',
  'Ingeniería y Desarrollo SL',
  'Arquitectura Moderna SA',
]

const randomContactNames = [
  'Juan García',
  'María López',
  'Carlos Fernández',
  'Ana Martínez',
  'Pedro Sánchez',
  'Laura Rodríguez',
]

const generateMockData = () => {
  const random = (arr: string[]) => arr[Math.floor(Math.random() * arr.length)]
  const randomNum = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min
  const randomLetter = () => String.fromCharCode(65 + Math.floor(Math.random() * 26))

  return {
    projectName: random(randomProjectNames),
    projectCountry: 'ES',
    projectAddress: `${random(randomStreets)} ${randomNum(1, 999)}`,
    projectTown: random(randomCities),
    projectProvince: random(randomCities),
    buildingsToProtect: 1,
    newConstruction: Math.random() > 0.5,
    workplace: Math.random() > 0.5,
    calculationNormative: 'lightning' as const,
    clientName: random(randomCompanies),
    clientCIF: `${randomLetter()}${randomNum(10000000, 99999999)}`,
    clientAddress: `${random(randomStreets)} ${randomNum(100, 999)}`,
    clientTown: random(randomCities),
    clientProvince: random(randomCities),
    clientPhone: `+34 ${randomNum(600, 999)} ${randomNum(100, 999)} ${randomNum(100, 999)}`,
    clientEmail: `contacto${randomNum(1, 999)}@ejemplo.com`,
    contactName: random(randomContactNames),
    contactPhone: `+34 ${randomNum(600, 999)} ${randomNum(100, 999)} ${randomNum(100, 999)}`,
    contactEmail: `referente${randomNum(1, 999)}@ejemplo.com`,
  }
}

/**
 * Paso 1: Datos del Proyecto
 * Basado en el diseño original de CD-Risk
 */
export function ProjectDataStep({ data, onChange, onBulkChange }: ProjectDataStepProps) {
  const handleAutofill = () => {
    if (onBulkChange) {
      onBulkChange(generateMockData())
    }
  }

  return (
    <div className="space-y-6">
      {/* Título */}
      <div className="flex items-center justify-between">
        <p className="text-lg font-bold text-muted-foreground">
          Cálculo de riesgo según norma IEC 62305-2, UNE 21186, NFC 17102, NP 4426 y equivalentes.
        </p>

        {isDev && (
          <Button onClick={handleAutofill} variant="outline" size="sm" className="gap-2">
            <Sparkles className="h-4 w-4" />
            Autorellenar
          </Button>
        )}
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Columna izquierda: Datos del Proyecto */}
        <Card>
          <CardHeader>
            <CardTitle className="text-primary">DATOS DEL PROYECTO</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Nombre Proyecto */}
            <div className="space-y-1">
              <div className="grid grid-cols-5 items-center gap-4">
                <Label htmlFor="projectName" className="col-span-2">
                  Nombre Proyecto <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="projectName"
                  value={data.projectName || ''}
                  onChange={(e) => onChange('projectName', e.target.value)}
                  className="col-span-3"
                  placeholder="Ingresa el nombre del proyecto"
                />
              </div>
              {!data.projectName && (
                <p className="col-span-5 text-xs text-destructive">Este campo es requerido</p>
              )}
            </div>

            {/* País */}
            <div className="grid grid-cols-5 items-center gap-4">
              <Label htmlFor="projectCountry" className="col-span-2">
                País
              </Label>
              <div className="col-span-3">
                <Select
                  value={data.projectCountry || ''}
                  onValueChange={(value) => onChange('projectCountry', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="--Por favor, elige una opción--" />
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
            </div>

            {/* Dirección */}
            <div className="grid grid-cols-5 items-center gap-4">
              <Label htmlFor="projectAddress" className="col-span-2">
                Dirección
              </Label>
              <Input
                id="projectAddress"
                value={data.projectAddress || ''}
                onChange={(e) => onChange('projectAddress', e.target.value)}
                className="col-span-3"
              />
            </div>

            {/* Población */}
            <div className="grid grid-cols-5 items-center gap-4">
              <Label htmlFor="projectTown" className="col-span-2">
                Población
              </Label>
              <Input
                id="projectTown"
                value={data.projectTown || ''}
                onChange={(e) => onChange('projectTown', e.target.value)}
                className="col-span-3"
              />
            </div>

            {/* Provincia */}
            <div className="grid grid-cols-5 items-center gap-4">
              <Label htmlFor="projectProvince" className="col-span-2">
                Provincia
              </Label>
              <Input
                id="projectProvince"
                value={data.projectProvince || ''}
                onChange={(e) => onChange('projectProvince', e.target.value)}
                className="col-span-3"
              />
            </div>

            {/* Edificios a proteger */}
            <div className="grid grid-cols-5 items-center gap-4">
              <Label htmlFor="buildingsToProtect" className="col-span-2">
                Edificios a proteger <span className="text-destructive">*</span>
              </Label>
              <Input
                id="buildingsToProtect"
                type="number"
                value={data.buildingsToProtect || 1}
                readOnly
                className="col-span-3 bg-muted"
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
              <div className="mt-4">
                <Label className="mb-2 block">
                  Normativa para el cálculo
                  <span className="ml-2 text-xs text-destructive font-normal">
                    (Solo para proyectos en ESPAÑA)
                  </span>
                </Label>
                <div className="space-y-3 rounded-md border p-4">
                  <RadioGroup
                    value={data.calculationNormative || 'lightning'}
                    onValueChange={(value) => onChange('calculationNormative', value as 'lightning' | 'cte')}
                  >
                    {NORMATIVES.map((normative) => (
                      <div key={normative.value} className="flex items-center space-x-2">
                        <RadioGroupItem value={normative.value} id={`normative${normative.value}`} />
                        <Label htmlFor={`normative${normative.value}`} className="cursor-pointer">
                          {normative.label}
                        </Label>
                      </div>
                    ))}
                  </RadioGroup>
                </div>
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
            <div className="grid grid-cols-5 items-center gap-4">
              <Label htmlFor="clientName" className="col-span-2">
                Nombre
              </Label>
              <Input
                id="clientName"
                value={data.clientName || ''}
                onChange={(e) => onChange('clientName', e.target.value)}
                className="col-span-3"
              />
            </div>

            {/* CIF */}
            <div className="grid grid-cols-5 items-center gap-4">
              <Label htmlFor="clientCIF" className="col-span-2">
                CIF
              </Label>
              <Input
                id="clientCIF"
                value={data.clientCIF || ''}
                onChange={(e) => onChange('clientCIF', e.target.value)}
                className="col-span-3"
              />
            </div>

            {/* Dirección */}
            <div className="grid grid-cols-5 items-center gap-4">
              <Label htmlFor="clientAddress" className="col-span-2">
                Dirección
              </Label>
              <Input
                id="clientAddress"
                value={data.clientAddress || ''}
                onChange={(e) => onChange('clientAddress', e.target.value)}
                className="col-span-3"
              />
            </div>

            {/* Población */}
            <div className="grid grid-cols-5 items-center gap-4">
              <Label htmlFor="clientTown" className="col-span-2">
                Población
              </Label>
              <Input
                id="clientTown"
                value={data.clientTown || ''}
                onChange={(e) => onChange('clientTown', e.target.value)}
                className="col-span-3"
              />
            </div>

            {/* Provincia */}
            <div className="grid grid-cols-5 items-center gap-4">
              <Label htmlFor="clientProvince" className="col-span-2">
                Provincia
              </Label>
              <Input
                id="clientProvince"
                value={data.clientProvince || ''}
                onChange={(e) => onChange('clientProvince', e.target.value)}
                className="col-span-3"
              />
            </div>

            {/* Teléfono */}
            <div className="grid grid-cols-5 items-center gap-4">
              <Label htmlFor="clientPhone" className="col-span-2">
                Teléfono
              </Label>
              <Input
                id="clientPhone"
                type="tel"
                value={data.clientPhone || ''}
                onChange={(e) => onChange('clientPhone', e.target.value)}
                className="col-span-3"
              />
            </div>

            {/* E-mail */}
            <div className="grid grid-cols-5 items-center gap-4">
              <Label htmlFor="clientEmail" className="col-span-2">
                E-mail
              </Label>
              <Input
                id="clientEmail"
                type="email"
                value={data.clientEmail || ''}
                onChange={(e) => onChange('clientEmail', e.target.value)}
                className="col-span-3"
              />
            </div>

            {/* Separador para sección Contacto */}
            <div className="my-4 border-t pt-4">
       

              {/* Nombre del contacto */}
              <div className="mb-4 grid grid-cols-5 items-center gap-4">
                <Label htmlFor="contactName" className="col-span-2">
                  Contacto
                </Label>
                <Input
                  id="contactName"
                  type="text"
                  value={data.contactName || ''}
                  onChange={(e) => onChange('contactName', e.target.value)}
                  className="col-span-3"
                  placeholder="Nombre del contacto"
                />
              </div>

              {/* Móvil de contacto */}
              <div className="mb-4 grid grid-cols-5 items-center gap-4">
                <Label htmlFor="contactPhone" className="col-span-2">
                  Móvil
                </Label>
                <Input
                  id="contactPhone"
                  type="tel"
                  value={data.contactPhone || ''}
                  onChange={(e) => onChange('contactPhone', e.target.value)}
                  className="col-span-3"
                  placeholder="+34 600 000 000"
                />
              </div>

              {/* E-mail de contacto */}
              <div className="grid grid-cols-5 items-center gap-4">
                <Label htmlFor="contactEmail" className="col-span-2">
                  E-mail de contacto
                </Label>
                <Input
                  id="contactEmail"
                  type="email"
                  value={data.contactEmail || ''}
                  onChange={(e) => onChange('contactEmail', e.target.value)}
                  className="col-span-3"
                  placeholder="contacto@ejemplo.com"
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
