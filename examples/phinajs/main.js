/** global asefa:false, phina:false */

// Expand modules
const { FrameAnimator, Spritesheet: AsefaSpriteSheet } = asefa
const { Sprite, DisplayScene } = phina.display
const { GameApp } = phina.game
const { AssetManager, AssetLoader } = phina.asset

const ssJsonSrc = '../assets/fox-animate.json'
const ssImageSrc = '../assets/fox-animate.png'
const AseSSAssetTypeLabel = 'asepritespritesheet'
const playerAssetKey = 'player'

// Extend phina asset loader
AssetLoader.register(AseSSAssetTypeLabel, (_key, pathOrJson) => {
  return new Promise(resolve => {
    if (typeof pathOrJson === 'string') {
      new AsefaSpriteSheet().load(pathOrJson).then(ss => {
        resolve(ss)
      })
    } else {
      resolve(AsefaSpriteSheet.create(pathOrJson))
    }
  })
})

/**
 * phinaのFrameAnimation仕様に合わせたFrameAnimatorを拡張
 */
class PhinaAnimator extends FrameAnimator {
  /** @type {phina.display.Sprite} */
  target = undefined

  /** @type {boolean} */
  fit = true

  /**
   * @param {string|Spritesheet} ss
   * @param {phina.display.Sprite} target
   */
  constructor(ss, target) {
    super()

    // Setup ss
    if (typeof ss === 'string') ss = AssetManager.get(AseSSAssetTypeLabel, ss)
    this.setSpriteSheet(ss)

    if (target) this.setTarget(target)

    // アニメーションフレーム更新時にtarget更新
    this.setFrameUpdateCallback(frame => {
      if (!this.target) return

      this.target.srcRect.set(frame.x, frame.y, frame.width, frame.height)
      if (this.fit) {
        this.target.width = frame.width
        this.target.height = frame.height
      }
    })
  }

  /**
   * @param {phina.display.Sprite} target
   */
  setTarget(target, autoUpdate = true) {
    this.target = target

    // 毎ゲームtick実行処理
    if (autoUpdate) {
      this.target.on('enterframe', e => {
        this.update(e.app.deltaTime)
      })
    }

    return this
  }
}

// Define/Register example MainScene
phina.define('MainScene', {
  superClass: DisplayScene,

  init(options) {
    this.superInit(options)

    // Let draw Crisp pixel
    this.canvas.context.imageSmoothingEnabled = false

    const gx = this.gridX
    const gy = this.gridY

    // Set Sprite & Animator
    const playerSprite = new Sprite(playerAssetKey)
      .setScale(4)
      .setPosition(gx.center(), gy.center())
      .addChildTo(this)
    const animController = new PhinaAnimator(playerAssetKey, playerSprite)

    const animKeys = Object.keys(animController.ss.animations)

    // Loop all animation
    animKeys.forEach(animKey => {
      animController.loopAnimation(animKey)
    })

    // Play
    animController.gotoAndPlay('walk_side')

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
        animController.gotoAndPlay(e.target.value)
      })
    }
  },
})

// Main
;(async () => {
  // Create app & run
  const app = new GameApp({
    query: '#screen',
    width: 256,
    height: 256,
    backgroundColor: 'skyblue',
    fit: false,
    assets: {
      [AseSSAssetTypeLabel]: {
        [playerAssetKey]: ssJsonSrc,
      },
      image: {
        [playerAssetKey]: ssImageSrc,
      },
    },
    startLabel: 'main',
  })

  app.run()
})()
