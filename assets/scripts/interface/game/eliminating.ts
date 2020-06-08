import EliminatingBlock from '../../Games/eliminating/script/EliminatingBlock';

namespace Eliminating {


  /**
   * 方块资源信息
   */
  export interface Block extends Point {
    w: number;
    h: number;
    script: EliminatingBlock;
    index: string;
  }

  /**
   * 位置信息
   */
  export interface Point {
    x: number;
    y: number;
  }

  /**
   * 移动信息[布尔]
   */
  export interface MoveBoolean {
    bottom: boolean;
    left: boolean;
    right: boolean;
    top: boolean;
  }

  /**
   * 移动定位
   */
  export interface MoveBooleanPoint extends MoveBoolean {
    x: number;
    y: number;
  }
}

export default Eliminating;