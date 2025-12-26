declare module '*.css' {
  const css: { [className: string]: string } | string
  export default css
}
declare module '*.scss' {
  const css: { [className: string]: string } | string
  export default css
}
declare module '*.module.css' {
  const classes: { readonly [className: string]: string }
  export default classes
}
declare module '*.module.scss' {
  const classes: { readonly [className: string]: string }
  export default classes
}
declare module '*.svg' {
  import * as React from 'react'
  const ReactComponent: React.FunctionComponent<React.SVGProps<SVGSVGElement> & { title?: string }>
  export default ReactComponent
}