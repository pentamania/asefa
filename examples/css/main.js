/** global asefa:false */
const asefa = window.asefa
const ssJsonSrc = '../assets/fox-animate.json'
const ssImageSrc = '../assets/fox-animate.png'

/**
 * Sample CSSFrameAnimator class
 */
class CSSFrameAnimator extends asefa.FrameAnimator {
  /** @type {number | undefined} */
  _rafId = undefined

  /** @type {'width' | 'height' | undefined} */
  fitTo = 'width'

  /**
   * @param {HTMLElement} el Element used to show animation
   * @param {asefa.Spritesheet} ss Spritesheet data object
   * @param {string} ssImgsrc Spritesheet image path
   */
  constructor(el, ss, ssImgsrc) {
    super(ss)

    // Initialize element
    el.style.display = 'inine-block'
    el.style.overflow = `hidden`
    el.style.background = `url(${ssImgsrc})`
    el.style.backgroundRepeat = `no-repeat`
    el.style.imageRendering = `no-repeat`

    // Updating frame rect
    const setFrameFunc = frame => {
      if (this.fitTo) {
        // Fit to element width/height by setting backgroundSize
        const r = el.getBoundingClientRect()
        let sizeRatio
        switch (this.fitTo) {
          case 'width':
            sizeRatio = r.width / frame.width
          case 'height':
            sizeRatio = r.height / frame.height
          default:
            el.style.backgroundSize = `${sizeRatio * this.ss.width}px auto`
            el.style.backgroundPosition = `-${frame.x * sizeRatio}px -${
              frame.y * sizeRatio
            }px`
        }
      } else {
        // Resize element size to frame-rect
        el.style.width = `${frame.width}px`
        el.style.height = `${frame.height}px`
        el.style.backgroundPosition = `-${frame.x}px -${frame.y}px`
      }
    }
    // Update css-style via frame update
    this.setFrameUpdateCallback(setFrameFunc)

    // Init frame
    setFrameFunc(ss.frames[0])

    // Start loop
    this.start()
  }

  start() {
    let last = 0
    /** @type {FrameRequestCallback} */
    const loopCB = now => {
      // First loop
      if (!last) last = now

      // Update Animator using delta-time
      this.update(now - last)

      // Update vars for next loop
      last = now
      this._rafId = requestAnimationFrame(loopCB)
    }

    // Trigger loop
    loopCB(0)
  }

  stop() {
    if (this._rafId != null) cancelAnimationFrame(this._rafId)
  }
}

// Main
;(async () => {
  // Load spritesheet json & create asefa.Spritesheet object
  const asefaSS = await new asefa.Spritesheet().load(ssJsonSrc)
  const animKeys = Object.keys(asefaSS.animations)

  // Create animator
  const animController = new CSSFrameAnimator(
    document.getElementById('player'),
    asefaSS,
    ssImageSrc
  )

  // Let all animations loop
  animKeys.forEach(animKey => {
    animController.loopAnimation(animKey)
  })

  // Setup animation select element
  const selectEl = /** @type {HTMLSelectElement} */ (document.getElementById(
    'animation-list'
  ))
  animKeys.forEach(animKey => {
    const opt = document.createElement('option')
    opt.value = opt.innerText = animKey
    selectEl.appendChild(opt)
  })
  selectEl.addEventListener('change', e => {
    animController.gotoAndPlay(e.target.value)
  })

  // Play animation!
  const defaultAnim = animKeys[4]
  animController.gotoAndPlay(defaultAnim)
  selectEl.selectedIndex = animKeys.findIndex(v => v === defaultAnim)
})()
