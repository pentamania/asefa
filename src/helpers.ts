import { AsepriteAnimationTag } from './types.aseprite'

/**
 * 与えられた引数値の間を整数補間した配列を返す
 *
 * @example
 * createInterpolatedArray(1, 3, 5) // => [1, 2, 3, 4, 5]
 * createInterpolatedArray(0, 2, -1) // => [0, 1, 2, 1, 0, -1]
 * createInterpolatedArray(0, 2, 2) // => [0, 1, 2]
 *
 * @param milestones
 */
function createInterpolatedArray(...milestones: number[]): number[] {
  return milestones.reduce<number[]>((acc, cur, i) => {
    const next: number | undefined = milestones[i + 1]

    // 次マイルストーン値が無い or 現在値と一緒ならスキップ
    if (next == null || cur === next) return acc

    if (cur < next) {
      // 正側step
      for (let j = cur; j < next; j++) {
        acc.push(j)
      }
    } else {
      // 負側step
      for (let j = cur; next < j; j--) {
        acc.push(j)
      }
    }
    return acc
  }, [])
}

/**
 * tagPropからフレーム順インデックス配列を返す
 *
 * @param tagProp
 */
export function createFramesByTagProperty(
  tagProp: AsepriteAnimationTag
): number[] {
  switch (tagProp.direction) {
    case 'pingpong':
      return createInterpolatedArray(tagProp.from, tagProp.to, tagProp.from - 1)

    case 'reverse':
      return createInterpolatedArray(tagProp.to, tagProp.from - 1)

    case 'forward':
    default:
      return createInterpolatedArray(tagProp.from, tagProp.to + 1)
  }
}
