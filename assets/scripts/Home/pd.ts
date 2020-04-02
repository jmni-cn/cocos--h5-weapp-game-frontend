// Learn TypeScript:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/typescript.html
//  - [English] http://www.cocos2d-x.org/docs/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/reference/attributes.html
//  - [English] http://www.cocos2d-x.org/docs/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/life-cycle-callbacks.html
//  - [English] http://www.cocos2d-x.org/docs/creator/manual/en/scripting/life-cycle-callbacks.html

const {ccclass, property} = cc._decorator;
import axios from '../utils/axiosUtils';

@ccclass
export default class HomePD extends cc.Component {
    /**
     * 键盘资源
     */
    @property(cc.Prefab) keyboard: cc.Prefab = null;
    /**
     * 创建房间资源
     */
    @property(cc.Prefab) createRoomPrefab: cc.Prefab = null;
    /**
     * 弹窗
     */
    @property(cc.Prefab) popupPrefab: cc.Prefab = null;
    /**
     * 加入房间
     */
    joinRoom() {
        const joinRoomPopup = cc.instantiate(this.keyboard);
        cc.director.getScene().addChild(joinRoomPopup);

        // cc.loader.loadRes('弹窗', cc.Prefab, (err, prefab) => {
        //     if (err) {
        //         cc.log(err);
        //     } else {
        //         console.log(prefab);
        //     }
        // });
        joinRoomPopup && (joinRoomPopup.getComponent('keyboard').parentClass = {
            emit: (data) => {
                axios.api('room_join', {
                    data: {
                        roomCode: data,
                    },
                }).then(({ status, msg }) => {
                    if (status && msg && msg.scene) {
                        cc.director.loadScene(msg.scene);
                    } else {
                        const popup = cc.instantiate(this.popupPrefab);
                        cc.director.getScene().addChild(popup);
                        const scriptPopup = popup.getComponent('popup');
                        scriptPopup.init('加入房间失败!\n' + msg);
                        scriptPopup.setEvent('close', () => {});
                    }
                });
            }
        });
    }


    /**
     * 随机加入房间
     */
    roomRandom() {
        axios.api('room_random').then(({ status, msg }) => {
            if (status && msg && msg.scene) {
                cc.director.loadScene(msg.scene);
            } else {
                const popup = cc.instantiate(this.popupPrefab);
                cc.director.getScene().addChild(popup);
                const scriptPopup = popup.getComponent('popup');
                scriptPopup.init('加入房间失败!\n' + msg);
                scriptPopup.setEvent('close', () => {});
            }
        });
    }


    /**
     * 创建房间点击事件
     */
    showCreateRoomPopup(_e, gameName?: string) {
        const createRoomPrefab = cc.instantiate(this.createRoomPrefab);
        cc.director.getScene().addChild(createRoomPrefab);
        const createRoom = createRoomPrefab.getComponent('createRoom');
        console.log(gameName);
        if (typeof gameName === 'string') {
            setTimeout(async () => {
                createRoom.listItems[gameName].onClick();
                const popup = await createRoom.onCreateRoom();
                popup.success();
            }, 100);
        }
        // createRoomPrefab.getComponent('keyboard').parentClass = {
        //     emit(data) {
        //         console.log(data);
        //     }
        // }
    }
}
