const defineScrollBarWidthCSSVar = () => {
  console.log(document.documentElement.clientWidth);
  console.log(window.innerWidth);

  document.documentElement.style.setProperty(
    '--scrollbar-width',
    `${window.innerWidth - document.documentElement.clientWidth}px`
  )

}

export default defineScrollBarWidthCSSVar
