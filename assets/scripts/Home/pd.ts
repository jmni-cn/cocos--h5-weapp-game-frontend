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
import { luanchOptions } from '../lib/tool';
import State from '../utils/state';

@ccclass
export default class HomePD extends cc.Component {
    /**
     * 弹窗
     */
    @property(cc.Prefab) popupPrefab: cc.Prefab = null;
    /**
     * 创建房间资源
     */
    @property(cc.Prefab) createRoomPrefab: cc.Prefab = null;
    /**
     * 滚动消息条
     */
    @property(cc.Node) MessageBox: cc.Node = null;
    /**
     * 滚动消息内容
     */
    @property(cc.Label) MessageContent: cc.Label = null;
    /**
     * 房间的切换按钮
     */
    @property(cc.Node) roomNode: cc.Node = null;
    /**
     * 世界的切换按钮
     */
    @property(cc.Node) worldNode: cc.Node = null;

    @property(cc.PageView) PageView: cc.PageView = null;
    /**
     * 滚动消息列表
     */
    messageList: Array<{ id: number; content: string; }> = [];
    /**
     * 当前消息ID
     */
    messageId: number = 0;


    start() {
        axios.api('get_home_message').then(messageList => this.messageList = messageList);
        if (State.IS_WECHAT) {
            wx.onShow(this.wxShow.bind(this));
        }
        // 加入房间检测
        this.joinUserRoom();
    }


    /**
     * 销毁时
     */
    onDestroy() {
        if (State.IS_WECHAT) {
            wx.offShow(this.wxShow.bind(this));
        }
    }


    /**
     * 显示为前台时
     * @param option 参数
     */
    wxShow(option) {
        luanchOptions.query = option.query;
        this.joinUserRoom();
    }


    /**
     * 加入用户房间检测
     */
    joinUserRoom() {
        if (luanchOptions.query.fn === 'joinRoom' && luanchOptions.query.roomCode) {
            this.joinRoomEvent(luanchOptions.query.roomCode);
            luanchOptions.query = {};
        }
    }


    /**
     * 加入房间
     */
    joinRoom() {
        const that = this;
        cc.loader.loadRes('prefab/subpack/keyboard', cc.Prefab, (err, prefab) => {
            if (err) {
                cc.log(err);
            } else {
                const joinRoomPopup = cc.instantiate(prefab);
                cc.director.getScene().addChild(joinRoomPopup);
                joinRoomPopup && (joinRoomPopup.getComponent('keyboard').parentClass = {
                    emit: that.joinRoomEvent,
                });
            }
        });
    }


    /**
     * 加入房间事件
     * @param roomCode 房间号
     */
    joinRoomEvent(roomCode: number) {
        axios.api('room_join', {
            data: {
                roomCode,
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


    /**
     * 切换PD事件
     */
    togglePdModelEvent() {
        const index = this.PageView.getCurrentPageIndex();
        this.worldNode.getComponent(cc.Button).interactable = !!index;
        this.roomNode.getComponent(cc.Button).interactable = !index;
    }


    /**
     * 切换pageview
     * @param pageIndex page下标
     */
    togglePdSet(pageIndex: number) {
        this.PageView.scrollToPage(pageIndex, 1);
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
        if (typeof gameName === 'string') {
            setTimeout(async () => {
                createRoom.listItems[gameName].onClick();
                const popup = await createRoom.onCreateRoom();
                setTimeout(() => {
                    popup.success();
                }, 200);
            }, 500);
        }
        // createRoomPrefab.getComponent('keyboard').parentClass = {
        //     emit(data) {
        //         console.log(data);
        //     }
        // }
    }


    update() {
        const { messageId, messageList, MessageContent } = this;
        const MessageBoxWidth = this.MessageBox.width;
        if (messageList[messageId]) {
            //  如果完全超出最右方
            if (MessageContent.node.x < -MessageContent.node.width) {
                MessageContent.string = messageList[messageId].content;
                MessageContent.node.x = MessageBoxWidth;
                this.messageId++;
            } else {
                MessageContent.node.x -= 1;
            }
        } else {
            this.messageId = 0;
        }
    }
}
