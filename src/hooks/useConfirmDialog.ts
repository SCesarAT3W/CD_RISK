import { useState, useCallback } from 'react'

export interface ConfirmDialogState {
  isOpen: boolean
  title: string
  description: string
  onConfirm: () => void
  onCancel?: () => void
}

/**
 * Hook para manejar diálogos de confirmación de forma reactiva
 * Reemplaza window.confirm() con un Dialog de shadcn/ui
 */
export function useConfirmDialog() {
  const [dialogState, setDialogState] = useState<ConfirmDialogState>({
    isOpen: false,
    title: '',
    description: '',
    onConfirm: () => {},
  })

  const showConfirm = useCallback(
    (options: {
      title: string
      description: string
      onConfirm: () => void
      onCancel?: () => void
    }) => {
      setDialogState({
        isOpen: true,
        ...options,
      })
    },
    []
  )

  const handleConfirm = useCallback(() => {
    dialogState.onConfirm()
    setDialogState((prev) => ({ ...prev, isOpen: false }))
  }, [dialogState.onConfirm])

  const handleCancel = useCallback(() => {
    dialogState.onCancel?.()
    setDialogState((prev) => ({ ...prev, isOpen: false }))
  }, [dialogState.onCancel])

  return {
    dialogState,
    showConfirm,
    handleConfirm,
    handleCancel,
    closeDialog: () => setDialogState((prev) => ({ ...prev, isOpen: false })),
  }
}
