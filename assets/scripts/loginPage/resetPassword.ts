// Learn TypeScript:
//  - https://docs.cocos.com/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html

const {ccclass, property} = cc._decorator;

@ccclass
export default class NewClass extends cc.Component {

    start () {

    }


    /**
     * 点击登录事件
     */
    onLogingEvent() {

    }


    /**
     * 关闭登录按钮
     */
    onClose() {
        this.node.destroy();
    }

    // update (dt) {}
}