import { Component, Vec3, _decorator } from "cc";

const { ccclass, property } = _decorator;

@ccclass('RotateComp')
export class RotateComp extends Component {
    @property
    speed: number = 180;
    
    protected update(dt: number): void {
        this.node.eulerAngles = new Vec3(0, 0, this.node.eulerAngles.z + this.speed * dt);
    }
}