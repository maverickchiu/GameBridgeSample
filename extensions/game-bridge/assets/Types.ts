export enum GameUILayer {
    GameView = 'GameView',
}

export interface IGameBridge {
    joinGame(request: IJoinGameRequest): Promise<string>;
    getRanks(rankType: RankType): Promise<IRank[]>;
    findAccountInfo(nickname: string): Promise<IAccountInfo>;
    executeCommand(command: string, jsonString: string): Promise<string>;
}

export interface IJoinGameRequest {
    theme: number;
}

export interface IUserInfo {
    accountId: number;
    nickname: string;
    gameId: string;
    gameSupplier: number;
}

export interface IAccountInfo {
    accountId: number;
    nickname: string;
    [key: string]: unknown;
}

export enum RankType {
    WinAmount = 'win_amount',
    WinRate = 'win_rate',
}

export interface IRank {
    index: number;
    type: RankType;
    value: number;
    nickname: string;
}