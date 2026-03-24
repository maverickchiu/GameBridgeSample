import { Shader } from "../scene";

let template: string = `CCEffect %{
    temporaries:
      b1: &b1
        targets:
        - blend: true
          blendSrc: src_alpha
          blendDst: one
          blendSrcAlpha: src_alpha
          blendDstAlpha: one
      b2: &b2
        targets:
        - blend: true
          blendSrc: src_alpha
          blendDst: one_minus_src_alpha
          blendSrcAlpha: zero
          blendDstAlpha: one
          blendAlphaEq: max
      b3: &b3
        targets:
        - blend: true
          blendSrc: dst_color
          blendDst: one
          blendSrcAlpha: zero
          blendDstAlpha: dst_alpha
      d1: &d1 { depthTest: true, depthWrite: false }
      r1: &r1 { cullMode: none }
      p1: &p1
        mainTiling_Offset:      { value: [1, 1, 0, 0]  }
        $properties
      p2: &p2
        <<: *p1
        tintColor:              { value: [0.5, 0.5, 0.5, 0.5], editor: { type: color } }
  
    techniques:
    - name: add
      passes:
      - vert: builtin/internal/particle-vs-legacy:lpvs_main
        frag: tinted-fs:add
        rasterizerState: *r1
        depthStencilState: *d1
        blendState: *b1
        properties: *p2
      - vert: builtin/internal/particle-vs-legacy:lpvs_main
        frag: tinted-fs:add
        phase: deferred-forward
        rasterizerState: *r1
        depthStencilState: *d1
        blendState: *b1
        propertyIndex: 0
    - name: alpha-blend
      passes:
      - vert: builtin/internal/particle-vs-legacy:lpvs_main
        frag: tinted-fs:add
        rasterizerState: *r1
        depthStencilState: *d1
        blendState: *b2
        properties: *p2
      - vert: builtin/internal/particle-vs-legacy:lpvs_main
        frag: tinted-fs:add
        phase: deferred-forward
        rasterizerState: *r1
        depthStencilState: *d1
        blendState: *b2
        propertyIndex: 0
    - name: add-multiply
      passes:
      - vert: builtin/internal/particle-vs-legacy:lpvs_main
        frag: tinted-fs:multiply
        rasterizerState: *r1
        depthStencilState: *d1
        blendState: *b3
        properties: *p2
      - vert: builtin/internal/particle-vs-legacy:lpvs_main
        frag: tinted-fs:multiply
        phase: deferred-forward
        rasterizerState: *r1
        depthStencilState: *d1
        blendState: *b3
        propertyIndex: 0
    - name: add-smooth
      passes:
      - vert: builtin/internal/particle-vs-legacy:lpvs_main
        frag: no-tint-fs:addSmooth
        rasterizerState: *r1
        depthStencilState: *d1
        blendState: *b1
        properties: *p1
      - vert: builtin/internal/particle-vs-legacy:lpvs_main
        frag: no-tint-fs:addSmooth
        phase: deferred-forward
        rasterizerState: *r1
        depthStencilState: *d1
        blendState: *b1
        propertyIndex: 0
    - name: premultiply-blend
      passes:
      - vert: builtin/internal/particle-vs-legacy:lpvs_main
        frag: no-tint-fs:premultiplied
        rasterizerState: *r1
        depthStencilState: *d1
        blendState: *b2
        properties: *p1
      - vert: builtin/internal/particle-vs-legacy:lpvs_main
        frag: no-tint-fs:premultiplied
        phase: deferred-forward
        rasterizerState: *r1
        depthStencilState: *d1
        blendState: *b2
        propertyIndex: 0
  }%
  
  // TODO: soft particle
  
CCProgram tinted-fs %{
    precision mediump float;
  
    in vec2 uv;
    in vec4 color;
  
    uniform FragConstants {
      vec4 tintColor;
    };

    $fs
  
    vec4 add () {
      vec4 col = 2.0 * tintColor * frag();
      return col;
    }
  
    vec4 multiply () {
      vec4 col;
      vec4 texColor = frag();
      col.rgb = tintColor.rgb * texColor.rgb * vec3(2.0);
      return col;
    }
  }%
  
CCProgram no-tint-fs %{
    precision mediump float;
  
    in vec2 uv;
    in vec4 color;
  
    $fs

    vec4 addSmooth () {
      vec4 col = frag();
      col.rgb *= col.a;
      return col;
    }
  
    vec4 premultiplied () {
      vec4 col = frag();
      return col;
    }
  }%
`
let propertyLines: string = "";
let convertedProperties: string[] = [];

export function generateBillBoardMaterial(shaders: Shader[], propertyMap: Map<string, string>): string {
    let fs: string = shaders[0].fs;  // 只需要user shader
    let effect: string = template;
    propertyLines = "";
    convertedProperties.length = 0;
    fs = removeLAYOUTBindings(fs);
    fs = removeLAYOUTLines(fs);
    fs = removeFragDeclaration(fs);
    fs = addDeclarationToFrag(fs);
    fs = checkAndAddCCTime(fs);
    effect = insertFragmentContents(effect, fs);
    effect = convertUniformName(effect, propertyMap);
    effect = convertTextureName(effect, propertyMap);
    effect = addCustomData(effect);
    addUVInversedUniform(effect);
    effect = addPropertyToShaderText(effect);
    return effect;
}

/**
 * 移除LAYOUT(binding)
 * @param shaderText shader文本
 * @returns 移除後的文本
 */
function removeLAYOUTBindings(shaderText: string) {
    return shaderText.replace(/LAYOUT\(binding = \d+\) /g, '');
}

/**
 * 移除整行LAYOUT()
 * @param shaderText shader文本
 * @returns 移除後的文本
 */
function removeLAYOUTLines(shaderText: string) {
  return shaderText.replace(/LAYOUT\(\d+\) in .+;\n/g, '');
}

/**
 * 移除frag的宣告
 * @param shaderText shader文本
 * @returns 移除後的文本
 */
function removeFragDeclaration(shaderText: string) {
  const functionIndex: number = shaderText.indexOf('frag()');
  const startIndex: number = shaderText.indexOf('{', functionIndex);
  const valIndex: number = shaderText.indexOf('val', startIndex);
  const endIndex: number = shaderText.lastIndexOf('\n\n', valIndex);
  return shaderText.slice(0, startIndex + 1) + shaderText.slice(endIndex);
}

/**
 * 加入particle的in變數宣告
 * @param shaderText shader文本
 * @returns 加入後的文本
 */
function addDeclarationToFrag(shaderText: string) {
  const functionIndex: number = shaderText.indexOf('frag()');
  const startIndex: number = shaderText.indexOf('{', functionIndex);
  const endIndex: number = shaderText.indexOf('}', functionIndex);
  const fragFunctionContent = shaderText.slice(startIndex + 1, endIndex);
  let additionalText = '\n  vec2 uv1 = uv;\n  vec4 vcolor = color;\n';
  let modifiedEffect: string = shaderText;

  // 預防萬一變數宣告有uv2
  if(fragFunctionContent.includes('uv2')) {
    additionalText += '  vec2 uv2 = uv;\n';
  }

  if (fragFunctionContent.includes('customData1')) {
    additionalText += '  vec2 customData1 = efk_customData1;\n';
  }

  if (fragFunctionContent.includes('customData2')) {
    additionalText += '  vec2 customData2 = efk_customData2;\n';
  }

  return modifiedEffect.slice(0, startIndex + 1) + additionalText + modifiedEffect.slice(startIndex + 1);
}

/**
 * 檢查是否有使用predefined_uniform.x，有的話加入cc-global引用，並將predefined_uniform.x改成cc_time.x
 * @param shaderText shader文本
 * @returns 調整後的文本
 */
function checkAndAddCCTime(shaderText: string) {
  if(shaderText.includes('predefined_uniform.x') == false) {
    return shaderText;
  }

  let modifiedEffect: string = shaderText.replace(/predefined_uniform\.x/g, 'cc_time.x');
  return '#include <builtin/uniforms/cc-global>\n' +  modifiedEffect;
}

/**
 * 加入fragment shader到effect中
 * @param shaderText template文本
 * @param fs fragment shader文本
 * @returns 加入後的文本
 */
function insertFragmentContents(shaderText: string, fs: string) {
    return shaderText.replace(/\$fs/g, fs);
}

/**
 * 將uniform的名字改回原本的名字
 * @param shaderText shader文本
 * @param propertyMap 屬性表
 * @returns 原本的名字
 */
function convertUniformName(shaderText: string, propertyMap: Map<string, string>) {
  const matches: string[] = shaderText.match(/efk_uniform_\d+/g)!;
  let modifiedEffect: string = shaderText;

  // 沒有uniform就不用處理
  if(matches == null || matches.length == 0) {
    return modifiedEffect;
  }

  matches.forEach((match) => {
      const originName: string = propertyMap.get(match)!;
      modifiedEffect = modifiedEffect.replace(match, originName);
      addProperty(originName, match);
  });
  return modifiedEffect;
}

/**
* 將texture的名字改回原本的名字
* @param shaderText shader文本
* @param propertyMap 屬性表
* @returns 原本的名字
*/
function convertTextureName(shaderText: string, propertyMap: Map<string, string>) {
  const matches: string[] = shaderText.match(/efk_texture_\d+/g)!;
  let modifiedEffect: string = shaderText;

  // 沒有texture就不用處理
  if(matches == null || matches.length == 0) {
    return modifiedEffect;
  }

  matches.forEach((match) => {
      const originName: string = propertyMap.get(match)!;
      modifiedEffect = modifiedEffect.replace(match, originName);
      addProperty(originName, match);
  });
  return modifiedEffect;
}

/**
 * 加入customData到uniform gradient中
 * @param shaderText shader文本
 * @returns 加入後的文本
 */
function addCustomData(shaderText: string) {
  let modifiedEffect: string = shaderText;
  if(shaderText.includes('efk_customData1')) {
    modifiedEffect = addToUniformGradient(modifiedEffect, 'vec2', 'efk_customData1');
    addProperty('efk_customData1', '');
  }

  if(shaderText.includes('efk_customData2')) {
    modifiedEffect = addToUniformGradient(modifiedEffect, 'vec2', 'efk_customData2');
    addProperty('efk_customData2', '');
  }
  return modifiedEffect;
}

/**
 * 加入UVInversed到uniform中
 * @param shaderText shader文本
 */
function addUVInversedUniform(shaderText: string) {
  if(shaderText.includes('mUVInversed;')) {
    addProperty('mUVInversed', '');
  }

  if(shaderText.includes('mUVInversedBack;')) {
    addProperty('mUVInversedBack', '');
  }
}

/**
 * 加入屬性
 * @param propertyName 屬性名
 * @param variableName 變數名
 */
function addProperty(propertyName: string, variableName: string) {
  let baseProperty: string = `\n        ${propertyName}:        { editor: { value: [0, 0, 0, 0] } }`;
  if(convertedProperties.includes(propertyName)) {
    return;
  }

  if(variableName.includes('texture')) {
    baseProperty = `\n        ${propertyName}:        { value: black }`;
  }

  if(propertyName.includes('Color') || propertyName.includes('color')) {
    baseProperty = baseProperty.replace("]", "], type: color");
  }

  if(propertyName.includes('efk_customData')) {
    baseProperty = `\n        ${propertyName}:        { editor: { value: [0, 0] } }`;
  }

  if(propertyName.includes('mUVInversed')) {
    baseProperty = baseProperty.replace("[0, 0, 0, 0]", "[0, 1, 0, 1]");
  }

  propertyLines += baseProperty;
  convertedProperties.push(propertyName)
}

/**
 * 加入uniform到gradient中
 * @param shaderText shader文本
 * @param type uniform類型
 * @param name uniform名
 * @returns 加入後的文本
 */
function addToUniformGradient(shaderText: string, type: string, name: string) {
  const blockStart: string = 'uniform EFK_UNIFORM_GRADIENT {';
  const blockEnd: string = '};';
  const uniformDeclaration: string = `  ${type} ${name};`;
  return shaderText.replace(new RegExp(`(${blockStart}[\\s\\S]*?)${blockEnd}`, 'gm'), `$1${uniformDeclaration}\n${blockEnd}`);
}

/**
 * 加入屬性到shader文本
 * @param shaderText shader文本
 * @returns 加入後的文本
 */
function addPropertyToShaderText(shaderText: string) {
  return shaderText.replace(/\s*\$properties/g, propertyLines);
}