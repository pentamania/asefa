import {
  AsepriteExportedJson,
  AspriteAnimationTag,
  AspriteSliceData,
  AsepriteSliceKey,
} from './types.aseprite'
import { createFramesByTagProperty } from './helpers'

export interface FrameData {
  x: number
  y: number
  width: number
  height: number
  duration: number
}

export interface AnimationData {
  frames: number[]
  next?: string
  loop?: boolean
}

/**
 * Core spritesheet class parsing Aseprite exported json
 *
 * @example
 * // create directly
 * const ssjson = {"frames": [ {someFramedata} ], meta: {...}};
 * const ass = AsepriteSpriteSheet.create(ssjson)
 *
 * // or create from file path (in browser)
 * const ass = await fetch("path/to/file.json")
 *   .then((res) => res.json())
 *   .then((ssjson) => AsepriteSpriteSheet.create(ssjson)));
 *
 * ass.getFrame(0); // {someFramedata}
 */
export class AsepriteSpriteSheet {
  src: string | AsepriteExportedJson = ''
  frames: FrameData[] = []
  animations: {
    default: AnimationData
    [k: string]: AnimationData
  } = Object.create(null)
  slices: { [k: string]: AspriteSliceData } = Object.create(null)
  private _maxFrameCount: number = 0

  /**
   * @param json optional
   */
  constructor(json?: AsepriteExportedJson) {
    if (json != null) this.setup(json)
  }

  /**
   * Load file
   *
   * @param srcPath URL of aseprite json file, or aseprite json object
   */
  load(srcPath: string | AsepriteExportedJson) {
    this.src = srcPath
    return new Promise(this._load.bind(this))
  }

  /**
   * @param resolve
   */
  private _load(resolve: Function) {
    var self = this

    if (typeof this.src === 'string') {
      // src is filepath
      // TODO: XHRをfetchで置き換える？
      var xml = new XMLHttpRequest()
      xml.open('GET', this.src)
      xml.onreadystatechange = function () {
        if (xml.readyState === 4) {
          if ([200, 201, 0].indexOf(xml.status) !== -1) {
            var data = xml.responseText
            var json: AsepriteExportedJson = JSON.parse(data)

            self.setup(json)

            resolve(self)
          }
        }
      }
      xml.send(null)
    } else {
      // src is already parsed json object
      this.setup(this.src)
      resolve(self)
    }
  }

  /**
   * JSONデータからフレーム・アニメーションを組み立てる
   *
   * @param params
   */
  protected setup(params: AsepriteExportedJson): this {
    this._setupFrames(params.frames)
    this._setupAnimations(params.meta.frameTags)

    // Parse slices (if exists)
    this.slices = Object.create(null)
    if (params.meta.slices) {
      params.meta.slices.forEach(sliceProp => {
        this.slices[sliceProp.name] = sliceProp
      })
    }

    return this
  }

  /**
   * Setup frame-rect list from aseprite frames
   *
   * @param rawFrames
   */
  protected _setupFrames(rawFrames: AsepriteExportedJson['frames']) {
    this.frames.length = 0

    // Supporting both types: Hashmap and Array
    for (const [_key, val] of Object.entries(rawFrames)) {
      const f = val.frame
      this.frames.push({
        x: f.x,
        y: f.y,
        width: f.w,
        height: f.h,
        duration: val.duration,
      })
    }
    this._maxFrameCount = this.frames.length
  }

  /**
   * Setup animation dictionary from aseprite animation tags
   *
   * @param frameTags
   */
  protected _setupAnimations(frameTags: AspriteAnimationTag[]) {
    this.animations = Object.create(null)

    // Add "default" animation
    this.animations['default'] = {
      frames: Array.from({ length: this._maxFrameCount }, (_v, k) => k),
      // frames: [].range(0, this._maxFrameCount),
      // next: "default",
      // frequency: 1,
    }

    frameTags.forEach(tag => {
      this.animations[tag.name] = {
        frames: createFramesByTagProperty(tag),
      }
    })
  }

  /**
   * Returns frame by index
   *
   * @param index
   * @returns
   */
  public getFrame(index: number): FrameData | undefined {
    return this.frames[index]
  }

  /**
   * Returns AnimationData by name
   *
   * @param name
   * @returns
   */
  public getAnimation(name: string): AnimationData | undefined {
    return this.animations[name]
  }

  /**
   * Returns aseprite slice data
   *
   * @param name name of slice
   * @param index keys index
   */
  public getSliceData(
    name: string | number,
    index = 0
  ): AsepriteSliceKey | null {
    if (!this.slices[name]) {
      if (process.env.NODE_ENV === 'development') {
        console.warn("[asefa]: Slice name '" + name + "' doesn't exist.")
      }
      return null
    }
    if (this.slices[name].keys) {
      return this.slices[name].keys![index]
    } else {
      return null
    }
  }

  /**
   * Create instance from Aseprite exported json
   *
   * @static
   * @param json
   */
  static create(json: AsepriteExportedJson) {
    return new this(json)
  }

  get maxFrameCount() {
    return this._maxFrameCount
  }
}
