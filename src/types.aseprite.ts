import { CommonKeyType } from './types.common'

type AsepriteAnimationDirection = 'forward' | 'reverse' | 'pingpong'

interface Size {
  w: number
  h: number
}

interface FrameRect extends Size {
  x: number
  y: number
}

export interface AsepriteSliceKey {
  frame: number
  bounds: FrameRect
  pivot: { x: number; y: number }
}

export interface AsepriteSliceData {
  /**
   * Name of slice set in Aseprite
   */
  name: string
  color: string // "#0000ffff";
  keys?: AsepriteSliceKey[]
}

export interface AsepriteFrameData {
  filename: string
  frame: FrameRect
  rotated: boolean
  trimmed: boolean
  spriteSourceSize: FrameRect
  sourceSize: Size
  duration: number
}

export interface AsepriteFrameMap {
  [id: string]: AsepriteFrameData
}

export interface AsepriteAnimationTag<AT = CommonKeyType> {
  /**
   * Animation Tag name
   */
  name: AT
  /**
   * アニメーション開始フレーム番号
   * Animation starting frame No.
   */
  from: number
  /**
   * アニメーション終了フレーム番号
   * Animation ending frame No.
   */
  to: number
  /**
   * フレーム番号の進め方
   * How to progress frame count
   */
  direction: AsepriteAnimationDirection
}

export interface AsepriteExportedJson<AT = CommonKeyType> {
  /**
   * Frames.
   * Typing depends on your aseprite export setting
   */
  frames: AsepriteFrameData[] | AsepriteFrameMap

  /**
   * Aseprite meta data
   */
  meta: {
    /**
     * App link
     * Usually `http://www.aseprite.org/`
     */
    app: string

    /**
     * Aseprite version
     * @example "1.2.9-x64"
     */
    version: string

    /**
     * Absolute path to the spritesheet image
     * @example
     * "C:\\Users\\foo\\projects\\bar\\src\\assets\\fighter.png"
     */
    image: string

    /**
     * Color format
     * @example "RGBA8888"
     */
    format: string

    /**
     * Size of spritesheet
     */
    size: Size

    /**
     * Scale
     * @example "1"
     */
    scale: string

    /**
     * Animation tags
     * @example
     * [{ name: "swing"; from: 0; to: 3; direction: "pingpong" }];
     */
    frameTags: AsepriteAnimationTag<AT>[]

    /**
     * Array of slice data
     */
    slices: AsepriteSliceData[]
  }
}
