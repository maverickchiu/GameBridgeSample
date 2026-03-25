
import fs from "fs"
import path from "path"
import { IBuildResult, IBuildTaskOption } from "../@types/packages/builder/@types";

export async function load() { }

const patch_cpp = function (src: string, local: string, after: boolean, key: string, value: string) {
    const begin_cpp = `\n//BEGIN ${key}`;
    const end_cpp = `//END ${key}\n`;

    const begin = src.indexOf(begin_cpp);
    const end = src.indexOf(end_cpp);

    // remove old part; handle malformed block without END marker too
    if (begin >= 0 && end >= 0 && end > begin) {
        src = src.substring(0, begin) + src.substring(end + end_cpp.length);
    } else if (begin >= 0) {
        const nextBegin = src.indexOf("\n//BEGIN ", begin + begin_cpp.length);
        const cutEnd = nextBegin >= 0 ? nextBegin : src.length;
        src = src.substring(0, begin) + src.substring(cutEnd);
    }

    let pos = src.indexOf(`${local}`);
    if (after) {
        pos += (`${local}`).length;
    }

    let newsrc = src.substring(0, pos);
    newsrc += begin_cpp;
    newsrc += value;
    newsrc += end_cpp;
    newsrc += src.substring(pos);

    return newsrc;
}

const patch_cmake = function (src: string, local: string | null, after: boolean, key: string, value: string) {
    const begin_marker = `#BEGIN ${key}`;
    const end_marker = `#END ${key}`;

    // 1. 溫和清理：只移除標記區塊，但前後保留換行確保結構不崩壞
    // 使用 [\\s]* 來吸收標記前後可能殘留的空白
    const cleanup_regex = new RegExp(`\\n?[\\s]*${begin_marker}[\\s\\S]*?${end_marker}[\\s]*`, 'g');
    src = src.replace(cleanup_regex, "\n");

    // 2. 決定插入位置
    let pos = src.length;
    if (local) {
        // 去除 local 可能帶有的首尾空白再找，增加匹配成功率
        const foundPos = src.indexOf(local);
        if (foundPos !== -1) {
            pos = after ? foundPos + local.length : foundPos;
        } else {
            // 如果找不到定位點，回退到文件末尾（安全做法）
            pos = src.length;
        }
    }

    // 3. 分割並組合
    const prefix = src.substring(0, pos);
    const suffix = src.substring(pos);

    // 組合時強加換行，並對內容進行 trim 處理，防止多重換行堆疊
    const block = `\n\n${begin_marker}\n${value.trim()}\n${end_marker}`;

    return (prefix + block + suffix).replace(/\n{3,}/g, "\n\n").trim() + '\n';
}

export async function onBeforeBuild(options: IBuildTaskOption, result: IBuildResult) {
    const from = path.join(Editor.Project.path, "extensions/effekseer/engine/native");
    const to = path.join(path.dirname(Editor.App.path), "resources/3d/engine/native");

    var copy_files = function (src: string, dst: string) {
        let names = fs.readdirSync(src);
        names.forEach(function (name: string) {
            var name_src = path.join(src, name);
            var name_dst = path.join(dst, name);
            var stat = fs.statSync(name_src);
            if (stat.isFile()) {
                let readable = fs.createReadStream(name_src);
                let writable = fs.createWriteStream(name_dst);
                readable.pipe(writable);
            } else if (stat.isDirectory()) {
                try {
                    fs.accessSync(name_dst, fs.constants.F_OK);
                } catch (error) {
                    fs.mkdirSync(name_dst);
                }
                copy_files(name_src, name_dst);
            }
        });
    }
    copy_files(from, to);

    const cmakeFile = path.join(path.dirname(Editor.App.path), "resources/3d/engine/native/CMakeLists.txt");
    let cmakeBody: string = fs.readFileSync(cmakeFile).toString();

    // After engine's cc_set_if_undefined(USE_EFFEKSEER OFF), force native Effekseer ON so
    // -I effekseer and CC_USE_EFFEKSEER=1 match project that uses this extension (avoids efk_render.h not found).
    cmakeBody = patch_cmake(cmakeBody, 'cc_set_if_undefined(USE_GAMEPAD              ON)', false, 'EFFEKSEER_FORCE_ON', `
cc_set_if_undefined(USE_EFFEKSEER            ON)
`);

    cmakeBody = patch_cmake(cmakeBody, '$<IF:$<BOOL:${USE_GAMEPAD}>,CC_USE_GAMEPAD=1,CC_USE_GAMEPAD=0>', false, 'IF_CC_USE_EFFEKSEER',
        '\n$<IF:$<BOOL:${USE_EFFEKSEER}>,CC_USE_EFFEKSEER=1,CC_USE_EFFEKSEER=0>\n\n'
    );


    cmakeBody = patch_cmake(cmakeBody, '### generate source files', false, 'EFFEKSEER_PART_0', `
if(USE_EFFEKSEER)
cocos_source_files(
    effekseer/Effekseer/Effekseer/Effekseer.Color.cpp
    effekseer/Effekseer/Effekseer/Effekseer.CurveLoader.cpp
    effekseer/Effekseer/Effekseer/Effekseer.DefaultEffectLoader.cpp
    effekseer/Effekseer/Effekseer/Effekseer.DefaultFile.cpp
    effekseer/Effekseer/Effekseer/Effekseer.Effect.cpp
    effekseer/Effekseer/Effekseer/Effekseer.EffectNode.cpp
    effekseer/Effekseer/Effekseer/Effekseer.EffectNodeModel.cpp
    effekseer/Effekseer/Effekseer/Effekseer.EffectNodeRibbon.cpp
    effekseer/Effekseer/Effekseer/Effekseer.EffectNodeRing.cpp
    effekseer/Effekseer/Effekseer/Effekseer.EffectNodeRoot.cpp
    effekseer/Effekseer/Effekseer/Effekseer.EffectNodeSprite.cpp
    effekseer/Effekseer/Effekseer/Effekseer.EffectNodeTrack.cpp
    effekseer/Effekseer/Effekseer/Effekseer.FCurves.cpp
    effekseer/Effekseer/Effekseer/Effekseer.Instance.cpp
    effekseer/Effekseer/Effekseer/Effekseer.InstanceChunk.cpp
    effekseer/Effekseer/Effekseer/Effekseer.InstanceContainer.cpp
    effekseer/Effekseer/Effekseer/Effekseer.InstanceGlobal.cpp
    effekseer/Effekseer/Effekseer/Effekseer.InstanceGroup.cpp
    effekseer/Effekseer/Effekseer/Effekseer.InternalScript.cpp
    effekseer/Effekseer/Effekseer/Effekseer.Manager.cpp
    effekseer/Effekseer/Effekseer/Effekseer.Matrix43.cpp
    effekseer/Effekseer/Effekseer/Effekseer.Matrix44.cpp
    effekseer/Effekseer/Effekseer/Effekseer.Random.cpp
    effekseer/Effekseer/Effekseer/Effekseer.RectF.cpp
    effekseer/Effekseer/Effekseer/Effekseer.Resource.cpp
    effekseer/Effekseer/Effekseer/Effekseer.ResourceManager.cpp
    effekseer/Effekseer/Effekseer/Effekseer.Setting.cpp
    effekseer/Effekseer/Effekseer/Effekseer.Vector2D.cpp
    effekseer/Effekseer/Effekseer/Effekseer.Vector3D.cpp
    effekseer/Effekseer/Effekseer/Effekseer.WorkerThread.cpp
    effekseer/Effekseer/Effekseer/Material/Effekseer.MaterialFile.cpp
    effekseer/Effekseer/Effekseer/Material/Effekseer.CompiledMaterial.cpp
    effekseer/Effekseer/Effekseer/Material/Effekseer.MaterialCompiler.cpp
    effekseer/Effekseer/Effekseer/IO/Effekseer.EfkEfcFactory.cpp
    effekseer/Effekseer/Effekseer/Parameter/Easing.cpp
    effekseer/Effekseer/Effekseer/Parameter/Effekseer.Parameters.cpp
    effekseer/Effekseer/Effekseer/Parameter/Rotation.cpp
    effekseer/Effekseer/Effekseer/Utils/Effekseer.CustomAllocator.cpp
    effekseer/Effekseer/Effekseer/SIMD/Mat43f.cpp
    effekseer/Effekseer/Effekseer/SIMD/Mat44f.cpp
    effekseer/Effekseer/Effekseer/SIMD/Utils.cpp
    effekseer/Effekseer/Effekseer/Noise/CurlNoise.cpp
    effekseer/Effekseer/Effekseer/ForceField/ForceFields.cpp
    effekseer/Effekseer/Effekseer/Model/ProceduralModelGenerator.cpp
    effekseer/Effekseer/Effekseer/Model/Model.cpp
    effekseer/Effekseer/Effekseer/Model/ModelLoader.cpp
    effekseer/Effekseer/Effekseer/Model/SplineGenerator.cpp
    effekseer/Effekseer/Effekseer/Network/Effekseer.Client.cpp
    effekseer/Effekseer/Effekseer/Network/Effekseer.Server.cpp
    effekseer/Effekseer/Effekseer/Network/Effekseer.Session.cpp
    effekseer/Effekseer/Effekseer/Network/Effekseer.Socket.cpp
)

cocos_source_files(
    effekseer/EffekseerRendererCommon/EffekseerRenderer.CommonUtils.cpp
    effekseer/EffekseerRendererCommon/EffekseerRenderer.ModelRendererBase.cpp
    effekseer/EffekseerRendererCommon/EffekseerRenderer.RenderStateBase.cpp
    effekseer/EffekseerRendererCommon/EffekseerRenderer.SpriteRendererBase.cpp
    effekseer/EffekseerRendererCommon/ModelLoader.cpp
    effekseer/EffekseerRendererCommon/EffekseerRenderer.DDSTextureLoader.cpp
    effekseer/EffekseerRendererCommon/EffekseerRenderer.Renderer.cpp
    effekseer/EffekseerRendererCommon/EffekseerRenderer.RibbonRendererBase.cpp
    effekseer/EffekseerRendererCommon/EffekseerRenderer.TrackRendererBase.cpp
    effekseer/EffekseerRendererCommon/EffekseerRenderer.IndexBufferBase.cpp
    effekseer/EffekseerRendererCommon/EffekseerRenderer.Renderer_Impl.cpp
    effekseer/EffekseerRendererCommon/EffekseerRenderer.RingRendererBase.cpp
    effekseer/EffekseerRendererCommon/EffekseerRenderer.VertexBufferBase.cpp
)

cocos_source_files(
    effekseer/EffekseerCocosCreator/effekseer.cpp
    effekseer/EffekseerCocosCreator/loader/common.cpp
    effekseer/EffekseerCocosCreator/loader/curve.cpp
    effekseer/EffekseerCocosCreator/loader/material.cpp
    effekseer/EffekseerCocosCreator/loader/model.cpp
    effekseer/EffekseerCocosCreator/loader/sound.cpp
    effekseer/EffekseerCocosCreator/loader/texture.cpp
    effekseer/EffekseerCocosCreator/loader/vfile.cpp
    effekseer/EffekseerCocosCreator/renderer/graphics.cpp
    effekseer/EffekseerCocosCreator/renderer/renderer.cpp
    effekseer/EffekseerCocosCreator/renderer/renderstate.cpp
    effekseer/EffekseerCocosCreator/renderer/vertexbuffer.cpp
    effekseer/EffekseerCocosCreator/framework/efk_material.cpp
    effekseer/EffekseerCocosCreator/framework/efk_model.cpp
    effekseer/EffekseerCocosCreator/framework/efk_render.cpp
)

cocos_source_files(
    cocos/bindings/manual/jsb_effekseer_manual.cpp
    cocos/bindings/manual/jsb_effekseer_manual.h
)
endif()
`);

    cmakeBody = patch_cmake(cmakeBody, null, false, 'EFFEKSEER_PART_1', `
if(USE_EFFEKSEER)
target_include_directories(\${ENGINE_NAME} PRIVATE 
    \${CWD}/effekseer
    \${CWD}/effekseer/Effekseer
    \${CWD}/effekseer/EffekseerCocosCreator
    \${CWD}/effekseer/EffekseerRendererCommon
)

target_compile_definitions(\${ENGINE_NAME} PRIVATE
    __EFFEKSEER_RENDERER_GLES3__
    __EFFEKSEER_USE_LIBPNG__
)
endif()
`);

    cmakeBody = patch_cmake(cmakeBody, "add_library(ccgeometry ${ccgeometry_SOURCE_LIST})", true, 'EFFEKSEER_PART_4', `
if(USE_EFFEKSEER)
target_include_directories(ccbindings PRIVATE
    \${CWD}/effekseer
    \${CWD}/effekseer/Effekseer
    \${CWD}/effekseer/EffekseerCocosCreator
    \${CWD}/effekseer/EffekseerRendererCommon
)
endif()
`);

    fs.writeFileSync(cmakeFile, cmakeBody);

    const cppFile = path.join(path.dirname(Editor.App.path), "resources/3d/engine/native/cocos/bindings/manual/jsb_module_register.cpp");
    let cppBody: string = fs.readFileSync(cppFile).toString();

    cppBody = patch_cpp(cppBody, '#include "cocos/bindings/manual/jsb_xmlhttprequest.h"', true, 'EFFEKSEER_PART_2', `
#include "cocos/bindings/manual/jsb_effekseer_manual.h"
`);

    cppBody = patch_cpp(cppBody, 'se->addRegisterCallback(register_all_native2d);', true, 'EFFEKSEER_PART_3', `
    se->addRegisterCallback(register_all_effekseer);
`);

    fs.writeFileSync(cppFile, cppBody);
}

export function unload() {
    // console.warn(`[${PACKAGE_NAME}] Unload cocos plugin example in builder.`);
}
