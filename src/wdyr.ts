import React from 'react'

if (import.meta.env.DEV) {
  const whyDidYouRender = await import('@welldone-software/why-did-you-render')

  // @ts-expect-error - whyDidYouRender no tiene tipos completos
  whyDidYouRender.default(React, {
    // Desactivamos trackHooks porque altera el orden de hooks en ForwardRef (Radix) y rompe el render
    trackHooks: false,
    trackAllPureComponents: false,
    logOnDifferentValues: true,
    collapseGroups: true,
    include: [
      // Regex para matchear componentes por nombre
      /.*Step.*/, // Todos los componentes que contengan "Step"
      /CardSelect/, // El componente CardSelect
      /CorporateFooter/, // El footer corporativo
      /CorporateHeader/, // El header corporativo
      /CorporateLayout/, // El layout corporativo
    ],
  })

  console.log('🔍 Why Did You Render activado - Los re-renders se mostrarán en la consola')
}
