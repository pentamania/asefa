/** global asefa:false, PIXI:false */
const ssJsonSrc = '../assets/fox-animate.json'
const ssImageSrc = '../assets/fox-animate.png'

// Setting for crisp pixel image
// https://github.com/pixijs/pixijs/issues/5613#issuecomment-485753685
PIXI.settings.SCALE_MODE = PIXI.SCALE_MODES.NEAREST

/** Makeshift async pixi-texture loader */
async function loadPixiTexture(src) {
  const loader = new PIXI.Loader()
  loader.add('tempKey', src)
  return new Promise(res => {
    loader.load((_loader, resources) => {
      res(resources['tempKey'].texture)
    })
  })
}

/**
 * Helper: Sprite frame setter
 * @param {PIXI.Sprite} pixiSprite
 * @param {{x:number, y: number, width: number, height: number}} frame
 */
function setSpriteFrame(pixiSprite, frame) {
  pixiSprite.texture.frame.copyFrom(frame)
  pixiSprite.texture.updateUvs()
}

// Main
;(async () => {
  // Create app
  const app = new PIXI.Application({
    view: document.getElementById('screen'),
    width: 512,
    height: 512,
    backgroundColor: 0xff9999,
  })

  // Stage Set up
  {
    // Set up Sprite
    const txt = await loadPixiTexture(ssImageSrc)
    const sprite = PIXI.Sprite.from(txt)
    sprite.anchor.set(0.5, 0.5)
    sprite.position.set(app.view.width / 2, app.view.height / 2)
    sprite.scale.set(8)

    // Set up animator
    const asess = await new asefa.Spritesheet().load(ssJsonSrc)
    const animKeys = Object.keys(asess.animations)

    // Create animator
    const animator = new asefa.FrameAnimator(asess)

    // Let all animations loop
    animKeys.forEach(animKey => animator.loopAnimation(animKey))

    // Set Temporary frame
    setSpriteFrame(sprite, animator.ss.getFrame(0))

    // Set up animator ticking callback
    app.ticker.add(() => animator.update(app.ticker.deltaMS))
    animator.setFrameUpdateCallback(f => setSpriteFrame(sprite, f))

    // Add sprite to stage
    app.stage.addChild(sprite)

    // Setup animation select element
    {
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
    }

    // Play!
    animator.gotoAndPlay(animKeys[0])
  }
})()
