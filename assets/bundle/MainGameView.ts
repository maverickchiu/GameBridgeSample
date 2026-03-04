import { Button, Component, Label, _decorator } from "cc";
const { ccclass, property } = _decorator;

@ccclass('MainGameView')
export class MainGameView extends Component {
    @property(Label)
    label: Label = null;
    @property(Label)
    labelResult: Label = null;
    @property(Button)
    buttonRoll: Button = null;

    protected onLoad(): void {
        this.buttonRoll.node.on(Button.EventType.CLICK, this.onButtonRollClick, this);
    }

    protected onDestroy(): void {
        this.label.string = '尚未設置';
    }

    setup(gameId: string) {
        this.label.string = '已設置\nGame ID: ' + gameId;
    }

    private onButtonRollClick(): void {
        const random = Math.floor(Math.random() * 6) + 1;
        this.labelResult.string = 'Rolling... ' + random;
    }
}