import { describe, it, expect, beforeEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useCanvasDrawing } from '../useCanvasDrawing'

describe('useCanvasDrawing', () => {
  const defaultProps = {
    buildingLength: 80,
    buildingWidth: 50,
  }

  beforeEach(() => {
    // Reset any global state
  })

  describe('Initialization', () => {
    it('should initialize with default values', () => {
      const { result } = renderHook(() => useCanvasDrawing(defaultProps))

      expect(result.current.drawingMode).toBe('none')
      expect(result.current.currentArea).toEqual([])
      expect(result.current.areas).toEqual([])
      expect(result.current.customDistances).toEqual({})
    })

    it('should have PIXELS_PER_METER constant set to 3', () => {
      const { result } = renderHook(() => useCanvasDrawing(defaultProps))

      expect(result.current.PIXELS_PER_METER).toBe(3)
    })
  })

  describe('Drawing Mode', () => {
    it('should allow changing drawing mode', () => {
      const { result } = renderHook(() => useCanvasDrawing(defaultProps))

      act(() => {
        result.current.setDrawingMode('area')
      })

      expect(result.current.drawingMode).toBe('area')
    })
  })

  describe('Stage Click Handling', () => {
    it('should add point to currentArea when in drawing mode', () => {
      const { result } = renderHook(() => useCanvasDrawing(defaultProps))

      act(() => {
        result.current.setDrawingMode('area')
      })

      act(() => {
        result.current.handleStageClick({ x: 100, y: 100 })
      })

      expect(result.current.currentArea).toHaveLength(1)
      expect(result.current.currentArea[0]).toEqual({ x: 100, y: 100 })
    })

    it('should not add point when not in drawing mode', () => {
      const { result } = renderHook(() => useCanvasDrawing(defaultProps))

      act(() => {
        result.current.handleStageClick({ x: 100, y: 100 })
      })

      expect(result.current.currentArea).toHaveLength(0)
    })

    it('should add multiple points to create a polygon', () => {
      const { result } = renderHook(() => useCanvasDrawing(defaultProps))

      act(() => {
        result.current.setDrawingMode('area')
      })

      act(() => {
        result.current.handleStageClick({ x: 100, y: 100 })
        result.current.handleStageClick({ x: 200, y: 100 })
        result.current.handleStageClick({ x: 200, y: 200 })
      })

      expect(result.current.currentArea).toHaveLength(3)
    })
  })

  describe('Closing Area', () => {
    it('should close area when there are more than 2 points', () => {
      const { result } = renderHook(() => useCanvasDrawing(defaultProps))

      act(() => {
        result.current.setDrawingMode('area')
        result.current.setCurrentArea([
          { x: 100, y: 100 },
          { x: 200, y: 100 },
          { x: 200, y: 200 },
        ])
      })

      act(() => {
        result.current.closeCurrentArea()
      })

      expect(result.current.areas).toHaveLength(1)
      expect(result.current.areas[0].closed).toBe(true)
      expect(result.current.currentArea).toHaveLength(0)
      expect(result.current.drawingMode).toBe('none')
    })

    it('should not close area with less than 3 points', () => {
      const { result } = renderHook(() => useCanvasDrawing(defaultProps))

      act(() => {
        result.current.setDrawingMode('area')
        result.current.setCurrentArea([
          { x: 100, y: 100 },
          { x: 200, y: 100 },
        ])
      })

      act(() => {
        result.current.closeCurrentArea()
      })

      expect(result.current.areas).toHaveLength(0)
    })

    it('should convert points to flat array when closing', () => {
      const { result } = renderHook(() => useCanvasDrawing(defaultProps))

      act(() => {
        result.current.setDrawingMode('area')
        result.current.setCurrentArea([
          { x: 100, y: 100 },
          { x: 200, y: 100 },
          { x: 200, y: 200 },
        ])
      })

      act(() => {
        result.current.closeCurrentArea()
      })

      expect(result.current.areas[0].points).toEqual([100, 100, 200, 100, 200, 200])
    })
  })

  describe('Near First Point Detection', () => {
    it('should detect when click is near first point', () => {
      const { result } = renderHook(() => useCanvasDrawing(defaultProps))

      act(() => {
        result.current.setCurrentArea([
          { x: 100, y: 100 },
          { x: 200, y: 100 },
          { x: 200, y: 200 },
        ])
      })

      const isNear = result.current.isNearFirstPoint({ x: 105, y: 105 })
      expect(isNear).toBe(true)
    })

    it('should return false when click is far from first point', () => {
      const { result } = renderHook(() => useCanvasDrawing(defaultProps))

      act(() => {
        result.current.setCurrentArea([
          { x: 100, y: 100 },
          { x: 200, y: 100 },
          { x: 200, y: 200 },
        ])
      })

      const isNear = result.current.isNearFirstPoint({ x: 300, y: 300 })
      expect(isNear).toBe(false)
    })

    it('should return false when there are less than 3 points', () => {
      const { result } = renderHook(() => useCanvasDrawing(defaultProps))

      act(() => {
        result.current.setCurrentArea([
          { x: 100, y: 100 },
          { x: 200, y: 100 },
        ])
      })

      const isNear = result.current.isNearFirstPoint({ x: 105, y: 105 })
      expect(isNear).toBe(false)
    })
  })

  describe('Delete Area', () => {
    it('should delete the last area', () => {
      const { result } = renderHook(() => useCanvasDrawing(defaultProps))

      act(() => {
        result.current.setAreas([
          { id: 'area-1', points: [100, 100, 200, 100, 200, 200], closed: true },
          { id: 'area-2', points: [300, 300, 400, 300, 400, 400], closed: true },
        ])
      })

      act(() => {
        result.current.handleDeleteArea()
      })

      expect(result.current.areas).toHaveLength(1)
      expect(result.current.areas[0].id).toBe('area-1')
    })

    it('should do nothing when there are no areas', () => {
      const { result } = renderHook(() => useCanvasDrawing(defaultProps))

      act(() => {
        result.current.handleDeleteArea()
      })

      expect(result.current.areas).toHaveLength(0)
    })
  })

  describe('Auto Generate Area', () => {
    it('should generate rectangular area based on building dimensions', () => {
      const { result } = renderHook(() => useCanvasDrawing(defaultProps))

      act(() => {
        result.current.handleAutoGenerateArea(800, 500)
      })

      expect(result.current.areas).toHaveLength(1)
      expect(result.current.areas[0].closed).toBe(true)
      expect(result.current.areas[0].points).toHaveLength(8) // 4 corners × 2 coordinates
    })

    it('should center the rectangle on stage', () => {
      const { result } = renderHook(() => useCanvasDrawing(defaultProps))

      const stageWidth = 800
      const stageHeight = 500

      act(() => {
        result.current.handleAutoGenerateArea(stageWidth, stageHeight)
      })

      const points = result.current.areas[0].points
      const lengthPx = defaultProps.buildingLength * 3 // PIXELS_PER_METER = 3
      const widthPx = defaultProps.buildingWidth * 3

      const expectedX1 = stageWidth / 2 - lengthPx / 2
      const expectedY1 = stageHeight / 2 - widthPx / 2

      expect(points[0]).toBe(expectedX1)
      expect(points[1]).toBe(expectedY1)
    })
  })

  describe('Custom Distances', () => {
    it('should not set custom distance without panel input', () => {
      const { result } = renderHook(() => useCanvasDrawing(defaultProps))

      act(() => {
        result.current.handleEditDistance('area-1', 0, 30)
      })

      expect(result.current.customDistances['area-1-0']).toBeUndefined()
    })
  })
})
