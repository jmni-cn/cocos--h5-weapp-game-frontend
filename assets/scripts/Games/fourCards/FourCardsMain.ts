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
import axios from '../../utils/axiosUtils';
import State from '../../utils/state';

const CardItem = cc.Class({
    name: 'cardItem',
    properties: {
        plum: [ cc.SpriteFrame ],
        heart: [ cc.SpriteFrame ],
        block: [ cc.SpriteFrame ],
        Spade: [ cc.SpriteFrame ],
        joker: [ cc.SpriteFrame ],
    }
});
let clock = null; // 计时器

@ccclass
export default class FourCardsGame extends cc.Component {

    @property(CardItem)
    Card = {
        /**
         * 梅花
         */
        plum: [],
        /**
         * 红心
         */
        heart: [],
        /**
         * 方块
         */
        block: [],
        /**
         * 黑桃
         */
        Spade: [],
        /**
         * 大小王
         */
        joker: [],
    };

    // 已有扑克牌
    cardList = [];

    // 加入事件容器
    roomJoinEvent = () => this.fetchRoomInfo();
    // 下棋事件容器
    roomDataEevent = (data) => this.roomData(data);
    // 离开事件容器
    roomExitEevent = (data) => this.rommleave(data);

    // LIFE-CYCLE CALLBACKS:

    onLoad () {
        // 创建房间伪逻辑
        axios.api('create_room', {
            params: {
                gameName: 'fourCards',
            },
            data: {
                people: 4,
                frequency: 1,
                payType: 0,
                pwdType: 0,
            },
        }).then((res) => {
            console.log(res);
            if (res.status) {
                this.fetchRoomInfo();
            }
        });
        State.io.on('rommjoin', this.roomJoinEvent);
        State.io.on('room/data', this.roomDataEevent);
        State.io.on('rommleave', this.roomExitEevent);
        State.observer.on('socketConnect', this.onSocketConnect.bind(this))
    }


    /**
     * 开始游戏
     * @param cardData - 卡牌数组
     */
    gameStart (cardData: Array<{ [key: number]: number }>[]) {
        // // 随机的卡牌
        // const randomCard = [];
        const { Card } = this;
        const CardKey = Object.keys(Card);

        // // 随机牌
        // for (let i = 0; i < 54; i++) {
        //     let randomMain = Math.random() * 5 | 0;
        //     const randomChild = Math.random() * Card[CardKey[randomMain]].length | 0;

        //     // 如果非大小王
        //     if (randomMain === 4) {
        //         randomMain = 13;
        //     }
        //     if (!randomCard[randomChild]) randomCard[randomChild] = {};
        //     const cardIndex = randomCard[randomChild];
        //     if (!cardIndex[randomMain]) cardIndex[randomMain] = 0;
        //     cardIndex[randomMain]++;
        // }
        // console.log(randomCard);

        // 模拟发牌
        const { node, cardList } = this;
        const screenWidth = node.width;
        const screenHeight = node.height;
        // 断点行
        let startX = 0;
        // 扑克牌当前张数
        let cardCount = 0;
        // 排序
        const sortCard = [];
        for (let num = 0; num < 13; num++) {
            sortCard[num] = [];
            for (let row = 0; row < cardData.length - 1; row++) {
                const targetCard = cardData[row][num];
                targetCard && sortCard[num].push(...Array(targetCard).fill(row))
            }
        }
        // 大小王
        if (cardData[4]) {
            sortCard.unshift([]);
            Object.values(cardData[4]).forEach((num, index) => {
                cardData[4][index] && sortCard[0].push(...Array(num).fill(index))
            })
        }
        console.log(sortCard);

        

        for (let row = 0; row < sortCard.length; row++) {
            const rowItem = sortCard[row];
            for (let col = 0; col < rowItem.length; col++) {
                // 主颜色
                let mainColor = row !== 0 ? rowItem[col] : 4;
                // 子颜色
                let mainChildColor = row !== 0 ? row - 1 : rowItem[col];
                // 当前颜色的扑克牌张数
                const targetFrame = this.Card[CardKey[mainColor]][mainChildColor];
                const newNode = new cc.Node();
                const nodeSprice = newNode.addComponent(cc.Sprite);
                nodeSprice.spriteFrame = targetFrame;
                let x, y = 0;
                // 30: 每张牌可见距离， 0.5: 屏幕左侧开始  100: 安全距离
                x = cardCount * 30 - (screenWidth * .5) + 150;
                y -= (screenHeight * .3 - (newNode.height * .5));
    
                // 一行占满 换行判断
                if (x >= screenWidth * .5 - 150) {
                    // 断点开始换行
                    if (!startX) startX = cardCount;
                    x -= startX * 30;
                    // 80为往下
                    y -= 80;
                    // 三行判断
                    if (x >= screenWidth * .5 - 150) {
                        x -= startX * 30;
                        y -= 80;
                    }
                }
                
                // 三行判断
                this.node.addChild(newNode);
                var clickEventHandler = new cc.Component.EventHandler();
                //这个 node 节点是你的事件处理代码组件所属的节点
                clickEventHandler.target = this.node; 

                //这个是代码文件名
                clickEventHandler.component = "FourCardsMain";
                clickEventHandler.handler = "onClickCard";
                clickEventHandler.customEventData = cardCount.toString();
                const newButton = newNode.addComponent(cc.Button);
                newButton.clickEvents.push(clickEventHandler);

                // 放置到屏幕最上方
                newNode.y = newNode.height + screenHeight / 2;

                // 显示数字
                if (col === 0 && row !== 0) {
                    const labelNode = new cc.Node();
                    const label = labelNode.addComponent(cc.Label);
                    label.string = rowItem.length;
                    labelNode.x = -((newNode.width / 2) - 20);
                    labelNode.y += 20;
                    labelNode.color = cc.color(63, 110, 146);
                    label.fontSize = 30;
                    newNode.addChild(labelNode);
                }

                cardList.push({
                    node: newNode,
                    x,
                    y,
                });
                cardCount++;
            }
        }

        let updatePoint = 0;
        let clock = setInterval(() => {
            const target = cardList[updatePoint];
            if (target && updatePoint < cardList.length) {
                target.node.x = target.x;
                target.node.y = target.y;
                // target.node.x = target.x - 60;
                // target.node.runAction(cc.moveTo(.03, target.x, target.y));
                updatePoint++;
            } else {
                console.log(updatePoint);
                clearInterval(clock);
            }
        }, 50);

    }


    /**
     * 扑克牌点击事件
     * @param _e        - 事件体
     * @param cardIndex - 扑克牌下标
     */
    onClickCard(_e, cardIndex: string) {
        console.log(cardIndex);
    }


    /**
     * Socket 连接时[通常情况下为重连]
     */
    onSocketConnect() {
        this.node.removeAllChildren();
        this.onLoad();
    }


    /**
     * 游戏场景销毁时
     */
    onDestroy() {
        // 接触IM玩家加入房间事件绑定
        State.io.off('rommjoin', this.roomJoinEvent);
        State.io.off('room/data', this.roomDataEevent);
        State.io.off('rommleave', this.roomExitEevent);
        clock && clearInterval(clock);
    }

    
    /**
     * 当玩家加入房间时
     */
    private fetchRoomInfo() {
        axios.api('room_info').then(res => {
            console.log(res);
            // 检测是否已经开始游戏
            if (res.isStart && res.gameData && res.gameData.card) {
                this.gameStart(res.gameData.card[0]);
            }
        });
    }


    /**
     * 房间内接收到数据时
     * @param data - 房间内数据
     */
    private roomData(data) {
        console.log(data);
    }


    /**
     * 玩家离开游戏时
     * @param data - 数据
     */
    private rommleave(data) {
        console.log(data);
    }
    // update (dt) {}
}
