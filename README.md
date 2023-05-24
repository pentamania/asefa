# asefa

js library to manage aseprite exported json spritesheet frame animation

## Install

`npm i asefa`

## Example (ESM & canvas)

See exec result: https://codesandbox.io/s/asefa-canvas-example-ix01gf?file=/src/index.js:0-1557

```js
import { Spritesheet, FrameAnimator } from 'asefa'
import { loadImg } from './helpers'

const ssImageSrc = 'path/to/your/spritesheet.png'
const ssJsonSrc = 'path/to/your/spritesheet.json'

;(async () => {
  // Set up canvas
  const canvas = document.querySelector('#screen')
  const ctx = canvas.getContext('2d')

  // Load spritesheet-image & spritesheet-json
  const [asess, ssImage] = await Promise.all([
    new Spritesheet().load(ssJsonSrc),
    loadImg(ssImageSrc),
  ])

  // Let all animations loop
  Object.values(asess.animations).forEach(anim => {
    anim.loop = true
  })

  // Create animator
  const animator = new FrameAnimator(asess)

  // Setup loop
  {
    let _last = 0
    const loop = now => {
      // Update animation
      animator.update(now - _last)

      // Clear canvas
      ctx.fillStyle = 'white'
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      // Use frame to draw sprite
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
      _last = now
      requestAnimationFrame(loop)
    }
    loop(0)
  }

  // Play animation
  animator.gotoAndPlay('walk_front')
})()
```

## Example (Browser & CSS sprite)

```html
<body>
  <main>
    <div id="ss-display" class="sprite"></div>
  </main>

  <script src="path/to/asefa.js"></script>
  <script defer>
    ;(async () => {
      // Load ss-json
      const asess = await new asefa.Spritesheet().load(
        'path/to/your-cool-ss.json'
      )

      // Set up DOM to show sprite
      const el = document.getElementById('ss-display')
      el.style.background = `url(${'path/to/your-cool-ss.png'})`
      el.style.imageRendering = 'pixelated' // Assuming pixel-art (not necessary)

      // Update DOM to match frame
      const frame = asess.frames[1]
      el.style.width = `${frame.width}px`
      el.style.height = `${frame.height}px`
      el.style.backgroundPosition = `-${frame.x}px -${frame.y}px`
    })()
  </script>
</body>
```

See [examples](examples) for more.

## Documentation

TODO

## Development

### Setup

`npm install`

### Build

- Dev build: `npm run dev` or `npm start`
- Production build: `npm run build`
- Package: `npm run pack`

### Test

`npm run test`

### Prerequisites

- Tested aseprite version: v1.2.3-x64
