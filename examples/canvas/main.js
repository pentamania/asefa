/** global asefa:false */

/**
 * Async image loading helper
 * @param {string} src
 * @returns {Promise<HTMLImageElement>}
 */
async function loadImg(src) {
  return new Promise(resolve => {
    const img = new Image()
    img.src = src
    img.onload = () => resolve(img)
  })
}

const ssJsonSrc = '../assets/fox-animate.json'
const ssImageSrc = '../assets/fox-animate.png'

;(async () => {
  // Load spritesheet-image & spritesheet-json
  const [asess, ssImage] = await Promise.all([
    new asefa.Spritesheet().load(ssJsonSrc),
    loadImg(ssImageSrc),
  ])
  const animKeys = Object.keys(asess.animations)

  // Create animator
  const animator = new asefa.FrameAnimator(asess)

  // Let all animations loop
  animKeys.forEach(animKey => {
    animator.loopAnimation(animKey)
  })

  // Set up canvas
  const canvas = /** @type {HTMLCanvasElement} */ (document.querySelector(
    '#screen'
  ))
  const ctx = canvas.getContext('2d')

  // Disable image-smoothing for crisp pixel image
  ctx.imageSmoothingEnabled = false

  // Set up update/draw loop and run
  {
    let last = 0
    /** @type {FrameRequestCallback} */
    const loop = now => {
      // Update SS animation
      animator.update(now - last)

      // Draw: clear canvas
      ctx.fillStyle = 'white'
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      // Draw: sprite
      const frameRect = animator.currentFrame
      if (frameRect) {
        ctx.drawImage(
          ssImage,

          frameRect.x,
          frameRect.y,
          frameRect.width,
          frameRect.height,

          0,
          0,
          canvas.width,
          canvas.height
        )
      }

      // Update vars for next loop
      last = now
      requestAnimationFrame(loop)
    }
    loop(0)
  }

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
    animator.gotoAndPlay(e.target.value)
  })

  // Play default animation!
  const defaultAnim = animKeys[0]
  animator.gotoAndPlay(defaultAnim)
  selectEl.selectedIndex = animKeys.findIndex(v => v === defaultAnim)
})()
