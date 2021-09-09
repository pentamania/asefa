import {
  AsepriteExportedJson,
  AsepriteAnimationTag,
  AsepriteSliceData,
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
 * Core Spritesheet class setup from Aseprite exported json
 *
 * @example
 * // create directly
 * const ssjson = {"frames": [ {someFramedata} ], meta: {...}};
 * const ass = AsepriteSpriteSheet.create(ssjson)
 *
 * // or create from file path (via browser fetch)
 * const ass = await fetch("path/to/file.json")
 *   .then((res) => res.json())
 *   .then((ssjson) => AsepriteSpriteSheet.create(ssjson)));
 *
 * ass.getFrame(0); // {someFramedata}
 */
export class Spritesheet {
  /** Reference to the original aseprite JSON data */
  public data?: AsepriteExportedJson

  /** All frames parsed from AsepriteExportedJson.frames */
  public frames: FrameData[] = []

  /** All animations parsed from AsepriteExportedJson.meta.frameTags */
  public animations: Record<string, AnimationData> = Object.create(null)

  /** All slices parsed from AsepriteExportedJson.meta.slices */
  public slices: { [k: string]: AsepriteSliceData } = Object.create(null)

  /**
   * @param json optional
   */
  constructor(json?: AsepriteExportedJson) {
    if (json != null) this.setup(json)
  }

  /**
   * Load and parse aseprite json file
   *
   * (Only for browser, unavailable in node.js)
   *
   * @example
   * async function init() {
   *   const ss = await new asefa.AsepriteSpriteSheet().load('assets/fighter-ss.json')
   * }
   *
   * @param srcPathOrJson
   * URL of aseprite json file, or aseprite JSON object
   */
  load(srcPathOrJson: string | AsepriteExportedJson): Promise<this> {
    return new Promise(resolve => {
      if (typeof srcPathOrJson === 'string') {
        // src is filepath
        // TODO: XHRをfetchで置き換える？
        const xml = new XMLHttpRequest()
        xml.open('GET', srcPathOrJson)
        xml.onreadystatechange = () => {
          if (xml.readyState === 4) {
            if ([200, 201, 0].indexOf(xml.status) !== -1) {
              this.setup(JSON.parse(xml.responseText))
              resolve(this)
            }
          }
        }
        xml.send(null)
      } else {
        // src is already parsed json object
        this.setup(srcPathOrJson)
        resolve(this)
      }
    })
  }

  /**
   * [en]
   * Sets up frames, animations, etc. from Aseprite-exported JSON data
   *
   * [jp]
   * JSONデータからフレーム・アニメーションを組み立てる
   *
   * @param params
   */
  public setup(params: AsepriteExportedJson): this {
    this.data = params

    this._resetFrames(params.frames)
    this._resetAnimations(params.meta.frameTags)

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
   * Reset frames(frame-rect list) from asepriteJson `frames` data
   *
   * @param rawFrames
   */
  protected _resetFrames(rawFrames: AsepriteExportedJson['frames']) {
    this.frames.length = 0

    // Use Object.entries to support both "Hashmap" and "Array" type
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
  }

  /**
   * Reset animation dictionary from aseprite animation tags
   *
   * @param frameTags
   */
  protected _resetAnimations(frameTags: AsepriteAnimationTag[]) {
    this.animations = Object.create(null)
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

  /**
   * Number of frames
   */
  get maxFrameCount() {
    return this.frames.length
  }
}
