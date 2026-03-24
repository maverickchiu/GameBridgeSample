let propertyMap: Map<string, string> = new Map<string, string>();

export function convertToSpriteMaterial(effect: string, propertyMap: Map<string, string>): string {
    effect = removeModelTechnique(effect);
    effect = removeModelVertexShader(effect);
    effect = setUniformToVec4(effect);
    effect = moveUniformsToFirst(effect);
    effect = setTextureProperty(effect);
    effect = convertToCCTime(effect);
    effect = includeCCGlobalAndCCLocal(effect);
    effect = changeInProperties(effect);
    effect = modifyVert(effect);
    effect = convertUIInversedVariables(effect);
    effect = convertUniformName(effect, propertyMap);
    effect = convertTextureName(effect, propertyMap);
    effect = convertToColorType(effect);
    effect = convertCustomDataToUniform(effect);
    return effect;
}

/**
 * 移除ModelTechnique
 * @param effect shader文本
 * @returns 移除後的文本
 */
function removeModelTechnique(effect: string): string {
    const modelIndex: number = effect.indexOf("- name: model");
    const lineStart: number = effect.lastIndexOf("\n", modelIndex);  // 整行刪除，刪乾淨
    const propertyEndIndex: number = effect.indexOf("}%", modelIndex);
    const modifiedEffect = effect.slice(0, lineStart) + effect.slice(propertyEndIndex - 1);
    return modifiedEffect;
}

/**
 * 移除Model的Vertex Shader文本
 * @param effect shader文本
 * @returns 移除後的文本
 */
function removeModelVertexShader(effect: string): string {
    const vertexShaderIndex: number = effect.indexOf("CCProgram model_vs %{");
    const userShaderEndIndex: number = effect.lastIndexOf("}%", vertexShaderIndex);
    const modifiedEffect = effect.slice(0, userShaderEndIndex + 2);  // 從前一個shader的結尾開始刪，刪乾淨
    return modifiedEffect;
}

/**
 * 將uniform的visible改vec4
 * @param effect shader文本
 * @returns 轉換後的文本
 */
function setUniformToVec4(effect: string) {
    const modifiedEffect: string = effect.replace(/(efk_uniform_\d+: \{ editor: \{) visible: false \}/g, '$1 value: [0, 0, 0, 0] }');
    return modifiedEffect;
}



/**
 * 將uniform移到properties的最前面
 * @param effect shader文本
 * @returns 轉換後的文本
 */
function moveUniformsToFirst(effect: string): string {
    const matches: string[] = effect.match(/(^\s*efk_uniform_\d+: \{ editor: \{ value: \[0, 0, 0, 0\] \} \}\n)/gm)!;

    // 沒有uniform就不用動
    if(matches == null || matches.length == 0) {
        return effect;
    }

    const efkUniforms: string = matches.join('');
    let modifiedEffect: string = effect.replace(/(^\s*efk_uniform_\d+: \{ editor: \{ value: \[0, 0, 0, 0\] \} \}\n)/gm, '');
    modifiedEffect = modifiedEffect.replace('properties: &props\n', 'properties: &props\n' + efkUniforms);
    return modifiedEffect;
}

/**
 * 設定texture的property
 * @param effect shader文本
 * @returns 轉換後的文本
 */
function setTextureProperty(effect: string): string {
    const matches: string[] = effect.match(/LAYOUT\(binding = \d+\) uniform sampler2D (efk_texture_\d+);/g)!;
    const firstVisibleFalseIndex: number = effect.search(/^\s*\w+: \{ editor: \{ visible: false \} \}$/m);

    // 沒有texture就不用動
    if(matches == null || matches.length == 0) {
        return effect;
    }

    let modifiedEffect: string = effect;
    let textureProperties: string[] = [];
    matches.forEach(match => {
        const textureName: string = match.match(/(efk_texture_\d+)/)![0];
        if(textureProperties.includes(textureName)) {
            return;
        }
        modifiedEffect = modifiedEffect.replace(match, `uniform sampler2D ${textureName};`);
        modifiedEffect = modifiedEffect.slice(0, firstVisibleFalseIndex) + `        ${textureName}: { editor: { value: black } }\n` + modifiedEffect.slice(firstVisibleFalseIndex);
        textureProperties.push(textureName);
    });
    return modifiedEffect;
}

/**
 * 將predefined_uniform.x改成cc_time.x
 * @param effect shader文本
 * @returns 轉換後的文本
 */
function convertToCCTime(effect: string): string {
    return effect.replace(/predefined_uniform\.x/g, 'cc_time.x');
}

/**
 * 引用cc-global和cc-local到vertex shader跟fragment shader中
 * @param effect shader文本
 * @returns 轉換後的文本
 */
function includeCCGlobalAndCCLocal(effect: string): string {
    let modifiedEffect: string = effect.replace('CCProgram user_vs %{', 'CCProgram user_vs %{\n  #include <builtin/uniforms/cc-global>\n  #if USE_LOCAL\n    #include <builtin/uniforms/cc-local>\n  #endif');
    modifiedEffect = modifiedEffect.replace('CCProgram user_fs %{', 'CCProgram user_fs %{\n  #include <builtin/uniforms/cc-global>');
    return modifiedEffect;
}

/**
 * 轉換成cocos內建的參數
 * @param effect shader文本
 * @returns 轉換後的文本
 */
function changeInProperties(effect: string) {
    const matches: string[] = effect.match(/LAYOUT\(\d+\) in vec\d+ \w+;\n/g)!;
    const firstMatchIndex: number = effect.indexOf(matches[0]);
    let modifiedEffect: string = effect;
    matches.forEach((match) => {
        modifiedEffect = modifiedEffect.replace(match, '');
    });

    const before: string = modifiedEffect.slice(0, firstMatchIndex - 1);  // -1是為了刪掉換行符號
    const after: string = modifiedEffect.slice(firstMatchIndex);
    modifiedEffect = before + 'in vec3 a_position;\nin vec2 a_texCoord;\nin vec4 a_color;\n' + after;

    return modifiedEffect;
}

/**
 * 修改vert function成單純的position轉換
 * @param effect shader文本
 * @returns 轉換後的文本
 */
const vertFunctionContent: string = `
  vec4 pos = vec4(a_position, 1);
  #if CC_USE_SKINNING
    CCSkin(pos);
  #endif
  v_WorldN_PX.w = pos.x;
  v_WorldB_PY.w = pos.y;
  v_WorldT_PZ.w = pos.z;
    
  #if USE_LOCAL
    pos = cc_matWorld * pos;
  #endif

  pos = cc_matViewProj * pos;

  v_UV1 = a_texCoord;
  v_UV2 = a_texCoord;

  v_VColor = a_color;
  
  return pos;
`;
/**
 * 修改vert define區塊替換的內容
 * @param effect shader文本
 * @returns 轉換後的文本
 */
const vertDefineContent: string = `
#if CC_USE_SKINNING
  #include <legacy/decode-base>
  #include <legacy/skinning>
#else
  in vec3 a_position;
  in vec2 a_texCoord;
#endif
`;
function modifyVert(effect: string) {
    let modifiedEffect: string = effect;
    modifiedEffect = modifiedEffect.replace(/in vec3 a_position;[^]*?in vec2 a_texCoord;/, vertDefineContent);

    const vertFunction: RegExp = /vec4 vert\(\) \{[^]*?\}/g;
    modifiedEffect = modifiedEffect.replace(vertFunction, `vec4 vert() {${vertFunctionContent}}`);
    return modifiedEffect;
}

/**
 * 把UVInversed的參數值改成[0, 1, 0, 1]
 * @param effect shader文本
 * @returns 轉換後的文本
 */
const UVInversedVariables: string[] = ['mUVInversedBack', 'mUVInversed'];
function convertUIInversedVariables(effect: string) {
    let modifiedEffect: string = effect;
    const firstVisibleFalseIndex: number = effect.search(/^\s*\w+: \{ editor: \{ visible: false \} \}$/m);
    UVInversedVariables.forEach((variable) => {
        const regex: RegExp = new RegExp(`(\\s*)${variable}: \\{ editor: \\{ visible: false \\} \\}`, 'g');
        modifiedEffect = modifiedEffect.replace(regex, '');
        modifiedEffect = modifiedEffect.slice(0, firstVisibleFalseIndex) + `        ${variable}: { [0, 1, 0, 1] }\n` + modifiedEffect.slice(firstVisibleFalseIndex);
    });
    return modifiedEffect;
}

/**
 * 將uniform的名字改回原本的名字
 * @param effect shader文本
 * @param propertyMap 屬性表
 * @returns 原本的名字
 */
function convertUniformName(effect: string, propertyMap: Map<string, string>) {
    const matches: string[] = effect.match(/efk_uniform_\d+/g)!;
    let modifiedEffect: string = effect;

    // 沒有uniform就不用動
    if(matches == null || matches.length == 0) {
        return effect;
    }

    matches.forEach((match) => {
        const originName: string = propertyMap.get(match)!;
        modifiedEffect = modifiedEffect.replace(match, originName);
    });
    return modifiedEffect;
}

/**
 * 將texture的名字改回原本的名字
 * @param effect shader文本
 * @param propertyMap 屬性表
 * @returns 原本的名字
 */
function convertTextureName(effect: string, propertyMap: Map<string, string>) {
    const matches: string[] = effect.match(/efk_texture_\d+/g)!;
    let modifiedEffect: string = effect;

    // 沒有texture就不用動
    if(matches == null || matches.length == 0) {
        return effect;
    }

    matches.forEach((match) => {
        const originName: string = propertyMap.get(match)!;
        modifiedEffect = modifiedEffect.replace(match, originName);
    });
    return modifiedEffect;
}

/**
 * 將effect的術性顯示轉換成顏色類型
 * @param effect shader文本
 * @returns 轉換後的文本
 */
function convertToColorType(effect: string) {
    const matches: string[] = effect.match(/\w+: \{ editor: \{ value: \[0, 0, 0, 0\] \} \}/g)!;
    let modifiedEffect: string = effect;
    if(matches == null) {
        return modifiedEffect;
    }

    matches.forEach((match) => {
        if((match.includes('Color') || match.includes('color')) == false) {
            return;
        }

        const colorTypeUniform: string = match.replace("]", "], type: color")
        modifiedEffect = modifiedEffect.replace(match, colorTypeUniform);
    })
    return modifiedEffect;
}

/**
 * 將自定義的custom data轉換成uniform
 * @param effect shader文本
 * @returns 轉換後的文本
 */
function convertCustomDataToUniform(effect: string) {
    let modifiedEffect: string = effect;
    let regexIn: RegExp = /LAYOUT\(\d+\) in mediump vec2 v_CustomData\d+;\n/g;
    let regexOut: RegExp = /LAYOUT\(\d+\) out mediump vec2 v_CustomData\d+;\n/g;
    const matches: string[] | null = modifiedEffect.match(regexIn);
    if (matches == null || matches.length == 0) {
        return effect;
    }

    // vs uniform custom data
    const matchesCount: number = matches.length;
    let shaderStartIndex: number = modifiedEffect.indexOf('CCProgram user_vs %{')!;
    let gradientIndex: number = modifiedEffect.indexOf('EFK_UNIFORM_GRADIENT', shaderStartIndex);
    let startIndex: number = modifiedEffect.indexOf('{', gradientIndex);
    let endIndex: number = modifiedEffect.indexOf('}', gradientIndex);
    let gradientBlock: string = modifiedEffect.slice(startIndex + 1, endIndex);

    for(let i = 1; i <= matchesCount; i++) {
        const customDataUniform = `  vec2 v_CustomData${i};`;
        gradientBlock += `${customDataUniform}\n`;
    }
    modifiedEffect = modifiedEffect.slice(0, startIndex + 1) + gradientBlock + modifiedEffect.slice(endIndex);

    // fs uniform custom data
    shaderStartIndex = modifiedEffect.indexOf('CCProgram user_fs %{')!;
    gradientIndex = modifiedEffect.indexOf('EFK_UNIFORM_GRADIENT', shaderStartIndex);
    startIndex = modifiedEffect.indexOf('{', gradientIndex);
    endIndex = modifiedEffect.indexOf('}', gradientIndex);
    gradientBlock = modifiedEffect.slice(startIndex + 1, endIndex);
    
    for(let i = 1; i <= matchesCount; i++) {
        const customDataUniform = `  vec2 v_CustomData${i};`;
        gradientBlock += `${customDataUniform}\n`;
    }
    modifiedEffect = modifiedEffect.slice(0, startIndex + 1) + gradientBlock + modifiedEffect.slice(endIndex);

    // custom data in properties
    let customDataProperties: string = '';
    for(let i = 1; i <= matchesCount; i++) {
        const customDataUniformName = `v_CustomData${i}`;
        customDataProperties += `\n        ${customDataUniformName}: { editor: { value: [0, 0] } }`;
    }
    modifiedEffect = modifiedEffect.replace('mUVInversedBack: { [0, 1, 0, 1] }', `mUVInversedBack: { [0, 1, 0, 1] }${customDataProperties}`);

    // 移除in custom data
    modifiedEffect = modifiedEffect.replace(regexIn, '');
    modifiedEffect = modifiedEffect.replace(regexOut, '');
    return modifiedEffect;
}