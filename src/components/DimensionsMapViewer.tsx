import { useEffect, useMemo, useRef, useState } from 'react'
import { Stage, Layer, Line, Rect } from 'react-konva'
import * as THREE from 'three'
import { Box, Grid2X2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { COLOR_TOKENS } from '@/lib/colorTokens'

type ViewMode = '2d' | '3d'

interface DimensionsMapViewerProps {
  length?: string
  width?: string
  height?: string
  offsetX?: string
  offsetZ?: string
  /** Punto de enfoque X de la cámara (hacia dónde mira en el eje X) */
  viewTargetX?: string
  /** Punto de enfoque Z de la cámara (hacia dónde mira en el eje Z) */
  viewTargetZ?: string
}

const DEFAULT_LENGTH = 80
const DEFAULT_WIDTH = 50
const DEFAULT_HEIGHT = 12

const GRID_COLOR = COLOR_TOKENS.gridLight
const BOX_STROKE = COLOR_TOKENS.boxStroke
const BOX_FILL = COLOR_TOKENS.boxFillAlpha

export function DimensionsMapViewer({
  length, width, height, offsetX, offsetZ, viewTargetX, viewTargetZ
}: DimensionsMapViewerProps) {
  const [viewMode, setViewMode] = useState<ViewMode>('2d')
  const containerRef = useRef<HTMLDivElement | null>(null)
  const threeContainerRef = useRef<HTMLDivElement | null>(null)
  const [canvasSize, setCanvasSize] = useState({ width: 0, height: 0 })

  const building = useMemo(() => {
    const parsedLength = parseFloat(length || '')
    const parsedWidth = parseFloat(width || '')
    const parsedHeight = parseFloat(height || '')
    const parsedOffsetX = parseFloat(offsetX || '')
    const parsedOffsetZ = parseFloat(offsetZ || '')
    const parsedViewTargetX = parseFloat(viewTargetX || '')
    const parsedViewTargetZ = parseFloat(viewTargetZ || '')

    return {
      length: Number.isFinite(parsedLength) && parsedLength > 0 ? parsedLength : DEFAULT_LENGTH,
      width: Number.isFinite(parsedWidth) && parsedWidth > 0 ? parsedWidth : DEFAULT_WIDTH,
      height: Number.isFinite(parsedHeight) && parsedHeight > 0 ? parsedHeight : DEFAULT_HEIGHT,
      offsetX: Number.isFinite(parsedOffsetX) ? parsedOffsetX : 0,
      offsetZ: Number.isFinite(parsedOffsetZ) ? parsedOffsetZ : 0,
      viewTargetX: Number.isFinite(parsedViewTargetX) ? parsedViewTargetX : 0,
      viewTargetZ: Number.isFinite(parsedViewTargetZ) ? parsedViewTargetZ : 0,
    }
  }, [length, width, height, offsetX, offsetZ, viewTargetX, viewTargetZ])

  useEffect(() => {
    if (!containerRef.current) return

    const element = containerRef.current
    const updateSize = () => {
      const { width: w, height: h } = element.getBoundingClientRect()
      setCanvasSize({ width: Math.max(240, w), height: Math.max(240, h) })
    }

    updateSize()
    const observer = new ResizeObserver(updateSize)
    observer.observe(element)

    return () => observer.disconnect()
  }, [])

  const gridLines = useMemo(() => {
    if (!canvasSize.width || !canvasSize.height) return []
    const spacing = Math.max(24, Math.round(Math.min(canvasSize.width, canvasSize.height) / 10))
    const lines: { points: number[] }[] = []

    for (let x = spacing; x < canvasSize.width; x += spacing) {
      lines.push({ points: [x, 0, x, canvasSize.height] })
    }

    for (let y = spacing; y < canvasSize.height; y += spacing) {
      lines.push({ points: [0, y, canvasSize.width, y] })
    }

    return lines
  }, [canvasSize.height, canvasSize.width])

  const box2d = useMemo(() => {
    if (!canvasSize.width || !canvasSize.height) return null
    // Padding grande para vista alejada
    const padding = 80
    const maxWidth = canvasSize.width - padding * 2
    const maxHeight = canvasSize.height - padding * 2
    const scale = Math.min(maxWidth / building.length, maxHeight / building.width) * 0.7

    const boxWidth = building.length * scale
    const boxHeight = building.width * scale
    // Aplicar offset (en metros) convertido a píxeles
    const x = (canvasSize.width - boxWidth) / 2 + building.offsetX * scale
    // Centrado verticalmente dentro del canvas + offset Z
    const y = (canvasSize.height - boxHeight) / 2 + building.offsetZ * scale

    return { x, y, width: boxWidth, height: boxHeight }
  }, [building.length, building.width, building.offsetX, building.offsetZ, canvasSize.height, canvasSize.width])

  const stats = useMemo(() => {
    const area = building.length * building.width
    const volume = area * building.height
    const perimeter = 2 * (building.length + building.width)
    const format = (value: number) =>
      value.toLocaleString('es-ES', { maximumFractionDigits: 0 })

    return {
      area: format(area),
      volume: format(volume),
      perimeter: format(perimeter),
    }
  }, [building.height, building.length, building.width])

  useEffect(() => {
    if (viewMode !== '3d' || !threeContainerRef.current || !canvasSize.width || !canvasSize.height) {
      return undefined
    }

    const container = threeContainerRef.current
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    renderer.setSize(canvasSize.width, canvasSize.height)
    renderer.setClearColor(0xffffff, 0)
    container.innerHTML = ''
    container.appendChild(renderer.domElement)

    const scene = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(45, canvasSize.width / canvasSize.height, 0.1, 2000)

    // Centro del edificio (hacia donde mira la cámara)
    const buildingCenterX = building.offsetX
    const buildingCenterY = building.height / 2
    const buildingCenterZ = building.offsetZ

    // Calcular distancia para que el edificio entre completo
    const maxDim = Math.max(building.length, building.width, building.height)
    const fov = THREE.MathUtils.degToRad(camera.fov)
    const fitDistance = (maxDim / 2) / Math.tan(fov / 2)
    const distance = fitDistance * 1.5

    // Posición diagonal de la cámara (vista isométrica)
    camera.position.set(
      buildingCenterX + distance * 0.7,  // Diagonal en X
      buildingCenterY + distance * 0.8,  // Altura para ver el tejado
      buildingCenterZ + distance * 0.7   // Diagonal en Z
    )
    camera.lookAt(buildingCenterX, buildingCenterY, buildingCenterZ)

    const ambient = new THREE.AmbientLight(0xffffff, 0.7)
    const directional = new THREE.DirectionalLight(0xffffff, 0.6)
    directional.position.set(10, 200, 160)
    scene.add(ambient, directional)

    const grid = new THREE.GridHelper(240, 20, 0xe5e7eb, 0xe5e7eb)
    grid.material.opacity = 0.6
    grid.material.transparent = true
    grid.position.set(0, 0, 0)
    scene.add(grid)

    // Ejes para ver el punto 0 (origen): Rojo=X, Verde=Y, Azul=Z
    const axesHelper = new THREE.AxesHelper(30)
    axesHelper.position.set(0, 0, 0)
    scene.add(axesHelper)

    const geometry = new THREE.BoxGeometry(building.length, building.height, building.width)
    const material = new THREE.MeshStandardMaterial({
      color: 0x3f4c6b,
      transparent: true,
      opacity: 0.35,
      metalness: 0.1,
      roughness: 0.6,
    })
    const mesh = new THREE.Mesh(geometry, material)
    mesh.position.set(building.offsetX, building.height / 2, building.offsetZ)
    scene.add(mesh)

    const edges = new THREE.LineSegments(
      new THREE.EdgesGeometry(geometry),
      new THREE.LineBasicMaterial({ color: 0x3f4c6b })
    )
    edges.position.copy(mesh.position)
    scene.add(edges)

    // Sin navegación - vista fija
    const animate = () => {
      renderer.render(scene, camera)
      requestAnimationFrame(animate)
    }

    animate()

    return () => {
      renderer.dispose()
      geometry.dispose()
      material.dispose()
      edges.geometry.dispose()
      ;(edges.material as THREE.Material).dispose()
      container.innerHTML = ''
    }
  }, [building.height, building.length, building.width, building.offsetX, building.offsetZ, canvasSize.height, canvasSize.width, viewMode])

  return (
    <div className="flex h-full flex-col">
      <div className="relative flex flex-1 flex-col overflow-hidden rounded-xl bg-card p-4 shadow-sm">
        <div className="absolute right-4 top-4 z-10 flex overflow-hidden rounded-lg border bg-muted shadow-sm">
          <button
            type="button"
            onClick={() => setViewMode('2d')}
            className={cn(
              'flex items-center gap-2 px-4 py-2 text-xs font-semibold transition-colors',
              viewMode === '2d'
                ? 'bg-card text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            )}
          >
            <Grid2X2 className="h-4 w-4" />
            2D Plano
          </button>
          <button
            type="button"
            onClick={() => setViewMode('3d')}
            className={cn(
              'flex items-center gap-2 px-4 py-2 text-xs font-semibold transition-colors',
              viewMode === '3d'
                ? 'bg-card text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            )}
          >
            <Box className="h-4 w-4" />
            3D Visor
          </button>
        </div>

        <div ref={containerRef} className="relative flex w-full flex-1 min-h-0 flex-col">
          {canvasSize.width > 0 && viewMode === '2d' && (
            <Stage width={canvasSize.width} height={canvasSize.height}>
              <Layer>
                {gridLines.map((line, index) => (
                  <Line
                    key={`grid-${index}`}
                    points={line.points}
                    stroke={GRID_COLOR}
                    strokeWidth={1}
                  />
                ))}

                {box2d && (
                  <Rect
                    x={box2d.x}
                    y={box2d.y}
                    width={box2d.width}
                    height={box2d.height}
                    fill={BOX_FILL}
                    stroke={BOX_STROKE}
                    strokeWidth={2}
                    cornerRadius={6}
                  />
                )}
              </Layer>
            </Stage>
          )}
          {viewMode === '3d' && (
            <div ref={threeContainerRef} className="h-full w-full" />
          )}
        </div>

        <div className="mt-3 flex items-center gap-4 text-xs text-muted-foreground">
          <span className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-slate-700" />
            Eje Z (Profundidad)
          </span>
          <span className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-rose-400" />
            Eje X (Anchura)
          </span>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-3 divide-x rounded-lg bg-card text-center">
        <div className="px-3 py-3 text-xs text-muted-foreground">
          <div className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
            Volumen
          </div>
          <div className="mt-1 text-base font-semibold text-foreground">
            {stats.volume}{' '}
            <span className="text-xs font-medium text-muted-foreground">m³</span>
          </div>
        </div>
        <div className="px-3 py-3 text-xs text-muted-foreground">
          <div className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
            Superficie
          </div>
          <div className="mt-1 text-base font-semibold text-foreground">
            {stats.area}{' '}
            <span className="text-xs font-medium text-muted-foreground">m²</span>
          </div>
        </div>
        <div className="px-3 py-3 text-xs text-muted-foreground">
          <div className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
            Perímetro
          </div>
          <div className="mt-1 text-base font-semibold text-foreground">
            {stats.perimeter}{' '}
            <span className="text-xs font-medium text-muted-foreground">m</span>
          </div>
        </div>
      </div>
    </div>
  )
}
