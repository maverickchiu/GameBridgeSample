import { _decorator, Component } from "cc";
import { IGameBridge, IRank, IAccountInfo, RankType, IUserInfo, IJoinGameRequest } from "./Types";

const { ccclass } = _decorator;

@ccclass('GameEntryBase')
export abstract class GameEntryBase extends Component {
    private _userInfo: IUserInfo;
    private _impl: IGameBridge;

    protected onLoad(): void {
        console.log('GameEntryBase onLoad');
    }

    setup(userInfo: IUserInfo, impl: IGameBridge): void {
        console.log('GameEntryBase setup', userInfo, impl);
        this._userInfo = userInfo;
        this._impl = impl;
        this.onSetup();
    }

    protected abstract onSetup(): void;

    getUserInfo(): IUserInfo {
        return this._userInfo;
    }

    joinGame(request: IJoinGameRequest): Promise<string> {
        if(!this._impl) {
            return Promise.reject(new Error('GameBridge not setup'));
        }
        return this._impl.joinGame(request);
    }

    getRanks(rankType: RankType): Promise<IRank[]> {
        if(!this._impl) {
            return Promise.reject(new Error('GameBridge not setup'));
        }
        return this._impl.getRanks(rankType);
    }

    findAccountInfo(nickname: string): Promise<IAccountInfo> {
        if(!this._impl) {
            return Promise.reject(new Error('GameBridge not setup'));
        }
        return this._impl.findAccountInfo(nickname);
    }
}