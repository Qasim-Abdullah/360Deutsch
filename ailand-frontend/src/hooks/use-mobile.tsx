import * as React from 'react'

const MOBILE_BREAKPOINT = 768
/** Same as Navbar fixed bar: use Sheet/burger layout on phone and tablet (e.g. iPad). */
export const TOUCH_LAYOUT_MAX_WIDTH = 1024

export function useIsMobile() {
  
  const [isMobile, setIsMobile] = React.useState(false)

  React.useEffect(() => {
    const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`)
    const onChange = () => {
      setIsMobile(window.innerWidth < MOBILE_BREAKPOINT)
    }
    setIsMobile(window.innerWidth < MOBILE_BREAKPOINT)
    mql.addEventListener("change", onChange)
    return () => mql.removeEventListener("change", onChange)
  }, [])

  return isMobile
}

export function useIsTouchLayout() {
  const [isTouchLayout, setIsTouchLayout] = React.useState(false)

  React.useEffect(() => {
    const mql = window.matchMedia(`(max-width: ${TOUCH_LAYOUT_MAX_WIDTH}px)`)
    const onChange = () => {
      setIsTouchLayout(window.innerWidth <= TOUCH_LAYOUT_MAX_WIDTH)
    }
    setIsTouchLayout(window.innerWidth <= TOUCH_LAYOUT_MAX_WIDTH)
    mql.addEventListener("change", onChange)
    return () => mql.removeEventListener("change", onChange)
  }, [])

  return isTouchLayout
}
