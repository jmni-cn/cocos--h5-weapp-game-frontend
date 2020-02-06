// Learn TypeScript:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/typescript.html
//  - [English] http://www.cocos2d-x.org/docs/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/reference/attributes.html
//  - [English] http://www.cocos2d-x.org/docs/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/life-cycle-callbacks.html
//  - [English] http://www.cocos2d-x.org/docs/creator/manual/en/scripting/life-cycle-callbacks.html

import State from './utils/state';
const {ccclass, property} = cc._decorator;

@ccclass
export default class NewClass extends cc.Component {

    @property(cc.Node)
    ActivityNode: cc.Node = null;

    onLoad () {
        const userInfo = localStorage.getItem('userInfo');
        if (!userInfo) {
            console.log(userInfo);
            cc.director.loadScene('loginPage');
        }
        State.userInfo = JSON.parse(userInfo);
    }

    start () {
        // console.log(this.ActivityNode.getComponent('Activity'));
        // this.ActivityNode.getComponent('Activity').activityPopupShow();
    }

    // update (dt) {}
}
