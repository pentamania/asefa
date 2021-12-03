# asefa

js library to manage aseprite exported json spritesheet frame animation

## Install

`npm i asefa`

## Usage (Browser CSS sprite)

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

`npm install`

TODO

### Test

`npm run test`

### Prerequisites

- Tested aseprite version: v1.2.3-x64
