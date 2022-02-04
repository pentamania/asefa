import { Spritesheet, AnimationData, FrameData } from './SpriteSheet'
import { CommonKeyType } from './types.common'

/**
 * フレーム更新時のコールバック関数型
 * 引数の`frame`は更新後のフレームデータ
 */
type FrameUpdateCallback = (frame: FrameData) => any

/**
 * AspriteのFrameAnimationクラス
 */
export class FrameAnimator<AT extends CommonKeyType = string> {
  protected ss: Spritesheet<AT>
  private _elapsedTime: number = 0
  private _finished: boolean = false
  paused: boolean = true
  private _currentFrameData?: FrameData
  protected _currentFrameIndex: number = 0
  protected _currentAnimationName?: AT
  protected _currentAnimationData?: AnimationData<AT>
  private _frameUpdateCallback?: FrameUpdateCallback

  /**
   * @param ss
   */
  constructor(ss: Spritesheet<AT> = new Spritesheet()) {
    this.ss = ss
  }

  /**
   * spritesheetオブジェクトをセット
   *
   * @param ss
   */
  setSpriteSheet(ss: Spritesheet<AT>) {
    this.ss = ss
    return this
  }

  /**
   * フレーム更新時のコールバック処理を設定
   *
   * @param cb
   */
  setFrameUpdateCallback(cb: FrameUpdateCallback) {
    this._frameUpdateCallback = cb
  }

  /**
   * Tick frame animation.
   * Usually run every frame
   *
   * @param deltaTime
   */
  update(deltaTime: number) {
    if (this.paused) return

    if (this._finished) {
      this._finished = false
      this._currentFrameIndex = 0
      return
    }

    // 経過時間によるフレーム更新
    this._elapsedTime += deltaTime
    if (this._currentFrameData && this._currentFrameData.duration != null) {
      if (this._currentFrameData.duration <= this._elapsedTime) {
        ++this._currentFrameIndex
        this._updateFrame()
        this._elapsedTime = 0 // 経過時間リセット
      }
    }
  }

  /**
   * Updates frame data, i.e. progress animation view
   * Run via {@link FrameAnimator.update}
   */
  protected _updateFrame() {
    const anim = this._currentAnimationData
    if (!anim) return

    // アニメーション終了時処理
    if (this._currentFrameIndex >= anim.frames.length) {
      if (anim.loop) {
        this.gotoAndPlay(this._currentAnimationName!)
      } else if (anim.next) {
        this.gotoAndPlay((anim.next as unknown) as AT)
      } else {
        this.paused = true
        this._finished = true
        // TODO： イベント発火？コールバック実行？
      }
      return
    }

    const index = anim.frames[this._currentFrameIndex]
    const frame = this.ss.getFrame(index)

    // Frame更新コールバック実行
    if (frame && this._frameUpdateCallback) this._frameUpdateCallback(frame)

    this._currentFrameData = frame
  }

  /**
   * Play specified Animation
   * 指定アニメーションを再生
   *
   * @param name アニメーション名(存在しない場合は何もしない)
   * @param keepAnimation 指定アニメーションがすでに再生中なら何もしない（デフォルト：true）
   */
  gotoAndPlay(name: AT, keepAnimation: boolean = true): this {
    // 同名アニメーションが再生中、かつkeepフラグが立っているときは何もしない
    if (
      keepAnimation &&
      name === this._currentAnimationName &&
      this._currentAnimationData != null &&
      this._currentFrameIndex < this._currentAnimationData.frames.length &&
      !this.paused
    ) {
      return this
    }

    const anim = this.ss.getAnimation(name)

    // アニメーションが存在しない場合は何もしない
    if (!anim) return this

    // 現在のアニメーション名記録
    this._currentAnimationName = name

    this._currentFrameIndex = 0
    this._currentAnimationData = anim
    this._updateFrame()

    this.paused = false

    return this
  }

  /**
   * **Experimental: method name might change**
   *
   * Set animation after some animation
   * 指定アニメーションの次のアニメーションを設定
   *
   * @param animTag
   * @param nextAnimTag
   */
  setNext(animTag: AT, nextAnimTag: AT) {
    const anim = this.ss.getAnimation(animTag)
    if (!anim) {
      if (process.env.NODE_ENV === 'development')
        console.warn(`Animation ${animTag} doesn't exists`)
      return this
    }
    anim.next = nextAnimTag
    return this
  }

  /**
   * Enable/Disable looping for specified animation
   * 指定アニメーションのループ設定を行う
   *
   * @param animTag アニメーション名
   * If no tag is specified, all animation-loop is enabled/disabled
   *
   * @param flag ループ設定
   */
  loopAnimation(animTag?: AT, flag: boolean = true) {
    if (animTag) {
      const anim = this.ss.getAnimation(animTag)
      if (!anim) {
        if (process.env.NODE_ENV === 'development')
          console.warn(`Animation ${animTag} doesn't exists`)
        return
      }
      anim.loop = flag
    } else {
      // Set all animation
      ;(Object.keys(this.ss.animations) as AT[]).forEach(animKey => {
        this.loopAnimation(animKey, flag)
      })
    }
  }

  get spritesheet() {
    return this.ss
  }

  get currentFrame() {
    return this._currentFrameData
  }
}
