import { MenuItem } from "electron";
import { AssetInfo } from "../@types/packages/asset-db/@types/public";
import { ExecuteSceneScriptMethodOptions } from "../@types/packages/scene/@types/public";

import * as path from "path"

export enum ShaderType {
    NONE,
    UI,
    PARTICLE_BILLBOARD
}

const Layers = new Map<string, number>([
    ["NO_RENDERING", 1 << 0],
    ["Common", 1 << 19],
    ["IGNORE_RAYCAST", 1 << 20],
    ["GIZMOS", 1 << 21],
    ["EDITOR", 1 << 22],
    ["UI_3D", 1 << 23],
    ["SCENE_GIZMO", 1 << 24],
    ["UI_2D", 1 << 25],
    ["PROFILER", 1 << 28],
    ["DEFAULT", 1 << 30],
]);

export function onAssetMenu(info: AssetInfo) {
    if (path.extname(info.name) != '.efkefc' && path.extname(info.name) != '.efk') {
        return [];
    }
    const ret = [{
        label: "导入 efk 特效",
        submenu: new Array<Partial<MenuItem>>(),
    },
    {
        label: "导入 efk 特效(含UI用的shader檔)",
        submenu: new Array<Partial<MenuItem>>(),
    },
    {
        label: "导入 efk 特效(含particle billboard用的shader檔)",
        submenu: new Array<Partial<MenuItem>>(),
    }];
    Layers.forEach((layer, name) => {
        ret[0].submenu.push({
            label: name,
            click: onClick.bind(null, info, layer, ShaderType.NONE)
        });
        ret[1].submenu.push({
            label: name,
            click: onClick.bind(null, info, layer, ShaderType.UI)
        });
        ret[2].submenu.push({
            label: name,
            click: onClick.bind(null, info, layer, ShaderType.PARTICLE_BILLBOARD)
        });
    })
    return ret;
}

async function onClick(info: AssetInfo, layer: number, extraShaderType: ShaderType) {
    const options: ExecuteSceneScriptMethodOptions = {
        name: "effekseer",
        method: 'efk_new',
        args: [
            info.uuid,
            info.name,
            info.file,
            info.url,
            layer,
            extraShaderType
        ]
    };

    return await Editor.Message.request('scene', 'execute-scene-script', options);
}