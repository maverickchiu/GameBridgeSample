import { _decorator, Asset, ModelRenderer, renderer, Node, Texture2D, Prefab } from "cc";
import { EFKRender } from "./efk_render";
import { EDITOR } from "cc/env";

const { ccclass, property, executeInEditMode } = _decorator;

@ccclass('EFKComponent')
@executeInEditMode(true)
export class EFKComponent extends ModelRenderer {

    @property({ type: Asset, serializable: true })
    _efk: Asset = null!;

    @property({ type: Asset, readonly: true })
    set efk(efk: Asset) {
        this._efk = efk;
        this.onChange();
    }
    get efk() {
        return this._efk;
    }

    @property({ type: Asset, readonly: true })
    efkModels: Asset[] = [];

    @property({ type: [Texture2D], readonly: true })
    efkTextures: Texture2D[] = [];

    @property({ type: Asset, readonly: true })
    efkMats: Asset[] = [];

    @property({ type: Prefab, readonly: true })
    efkConfig: Prefab = null!;

    @property({
        tooltip: '播放結束後, 自動銷毀該節點'
    })
    autoDestroy: boolean = false;

    @property({
        tooltip: '是否重複播放 efk 特效'
    })
    set efkRepeat(b: boolean) {
        this.setRpeat(b);
    }
    get efkRepeat() {
        return this._repeat;
    }

    @property({ serializable: true })
    private _repeat: boolean = false;

    @property({
        tooltip: '是否開啟更新特效的優先級, 用於特效的深度排序'
    })
    set enableUpdatePriority(b: boolean) {
        this._enableUpdatePriority = b;
    }
    get enableUpdatePriority() {
        return this._enableUpdatePriority;
    }

    @property({ serializable: true })
    private _enableUpdatePriority: boolean = false;

    @property({
        tooltip: '是否開啟使用model順序作為特效的優先級'
    })
    set enableModelPriority(b: boolean) {
        this._enableModelPriority = b;
    }
    get enableModelPriority() {
        return this._enableModelPriority;
    }

    @property({ serializable: true })
    private _enableModelPriority: boolean = false;

    private _frameCount: number = 0;

    private _enableInLowLevelDevice: boolean = true;
    set enableInLowLevelDevice(b: boolean) {
        this._enableInLowLevelDevice = b;
    }
    get enableInLowLevelDevice() {
        return this._enableInLowLevelDevice;
    }

    public play() {
        this._frameCount = EFKRender.play(this);
        // 回傳無效值代表沒有play, 直接觸發 efk_remove
        if (this._frameCount == undefined) {
            this.scheduleOnce(()=> this.node.emit('efk_remove'), 0);
            this._frameCount = 0;
            return;
        }
        EFKRender.setWorldMatrix(this);
    }

    public stop() {
        EFKRender.stop(this);

        this.node.off(Node.EventType.TRANSFORM_CHANGED, this._updateEfkWorldMatrix, this);
        this._detachFromScene();
    }

    public setSpeed(v: number) {
        EFKRender.setSpeed(this, v);
    }

    public setPause(b: boolean) {
        EFKRender.setPause(this, b);
    }

    public setStepMode(b: boolean) {
        EFKRender.setStepMode(b);
    }

    public setRpeat(b: boolean) {
        this._repeat = b;
        if (EDITOR && b) {
            this.play();
        }
    }

    public getFrameCount(): number {
        return this._frameCount;
    }

    public setFramePosition(n: number) {
        EFKRender.setFrame(this, n);
    }

    public lateUpdate() {
        EFKRender.setWorldMatrix(this);
        this._detachFromScene();
    }

    public onRestore() {
        if (this.enabledInHierarchy) {
            this._attachToScene();
        }
    }

    protected onRemovingCallback() {
        this.scheduleOnce(() => {
            if (this._repeat) {
                this.play();
            }
            else {
                this.node.emit('efk_remove');
            }
        });
    }

    protected onChange() {
        if (this.node.active && this.enabled) {
            this._frameCount = EFKRender.play(this);
            EFKRender.setWorldMatrix(this);
        }
    }

    protected onLoad() {
        EFKRender.load(this);

        if (!EDITOR) {
            if (this.autoDestroy === true) {
                this.node.once('efk_remove', () => this.node.destroy());
            }
        }
    }

    protected onEnable() {
        this._frameCount = EFKRender.play(this);
        EFKRender.setWorldMatrix(this);

        this.node.on(Node.EventType.TRANSFORM_CHANGED, this._updateEfkWorldMatrix, this);
        this._attachToScene();
    }

    protected onDisable() {
        EFKRender.stop(this);

        this.node.off(Node.EventType.TRANSFORM_CHANGED, this._updateEfkWorldMatrix, this);
        this._detachFromScene();
    }

    protected onDestroy() {
        EFKRender.unload(this.efk.name);
        this._detachFromScene();
    }

    protected _updateEfkWorldMatrix() {
        EFKRender.setWorldMatrix(this);
    }

    protected _addModel(model: renderer.scene.Model) {
        if (!model) return;
        model.node = model.transform = this.node;
        model.visFlags = this.visibility;
        this._models.push(model);
        if (this._enableUpdatePriority)
            this._updatePriority();

        // 設定 model 的 priority 要在 _updatePriority 之後, 否則會被重設
        if (this._enableModelPriority)
            model.priority = this._models.length;

        const renderScene = this._getRenderScene();
        renderScene.addModel(model);
    }

    protected _attachToScene() {
        // const renderScene = this._getRenderScene();
        // this._models.forEach((model) => {
        //     renderScene.addModel(model);
        // });
    }

    protected _detachFromScene() {
        const renderScene = this._getRenderScene();
        this._models.forEach((model) => {
            renderScene.removeModel(model);
        });
        this._models.length = 0;
    }

}
