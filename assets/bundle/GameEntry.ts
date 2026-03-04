import { _decorator, Component, director, instantiate, Node, Prefab } from 'cc';
import { GameEntryBase } from 'db://game-bridge/GameEntryBase';
import { MainGameView } from './MainGameView';
const { ccclass, property } = _decorator;

@ccclass('GameEntry')
export class GameEntry extends GameEntryBase {
    @property(MainGameView)
    gameView: MainGameView = null;
    @property(Prefab)
    gameScenePrefab: Prefab = null;

    private _gameScene: Node = null;

    protected onSetup(): void {
        this.joinGame({
            theme: 1,
        }).then((gameId) => {
            this.gameView.setup(gameId);

            const gameScene = instantiate(this.gameScenePrefab);
            director.getScene().addChild(gameScene);
            this._gameScene = gameScene;
        });
    }

    protected onDestroy(): void {
        if(this._gameScene) {
            this._gameScene.destroy();
            this._gameScene = null;
        }
    }
}


