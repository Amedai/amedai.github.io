const defineScrollBarWidthCSSVar = () => {
  const outerElement = document.createElement('div')
  outerElement.style.visibility = 'hidden'
  outerElement.style.overflow = 'scroll'

  document.body.append(outerElement)

  const innerElement = document.createElement('div')

  outerElement.append(innerElement)
  console.log(window.innerWidth);
  console.log(document.documentElement.clientWidth);

  document.documentElement.style.setProperty(
    '--scrollbar-width',
    `${outerElement.offsetWidth - innerElement.offsetWidth}px`
  )

  outerElement.remove()
}

export default defineScrollBarWidthCSSVar
