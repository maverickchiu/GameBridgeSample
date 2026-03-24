# Effekseer For Cocos Creator 插件系統

## 原生系統導入

1. 加入下方圖片中的資料夾與檔案
    - 對資料夾右鍵選擇Add file to “專案名稱” ⇒ 選擇資料夾或檔案 ⇒ 選擇Reference files in place ⇒ finish
    - effekseer資料夾的路徑在engine\native\effekseer
    - jsb_effekseer_manual的路徑放在engine\native\cocos\bindings\manual

    ![image_2025-09-11_10-39-53.png](./.github/assets/image_2025-09-11_10-39-53.png)

    ![image.png](./.github/assets/image.png)

2. 將CC_USE_EFFEKSEER旗標設定為1

    a . 在xcode的在Build Settings 中設定

    - 注意TARGETS要選擇的是cocos_engine才有效

    ![image_2025-09-11_10-40-54.png](./.github/assets/image_2025-09-11_10-40-54.png)

3. 於jsb_module_register.cpp中兩處新增jsb bind 如下圖

    ![image_2025-09-11_10-41-29.png](./.github/assets/image_2025-09-11_10-41-29.png)

    ```cpp
    #if CC_USE_EFFEKSEER
    	#include "cocos/bindings/manual/jsb_effekseer_manual.h"
    #endif
    ```

    ![image_2025-09-11_10-41-40.png](./.github/assets/image_2025-09-11_10-41-40.png)

    ```cpp
    #if CC_USE_EFFEKSEER
    	se->addRegisterCallback(register_all_effekseer);
    #endif
        se->addAfterCleanupHook([]() {
            cc::DeferredReleasePool::clear();
            JSBClassType::cleanup();
        });
        return true;
    }
    ```

4. 於engine/native/CMakeList.txt新增

    ![image_2025-09-11_10-41-58.png](./.github/assets/image_2025-09-11_10-41-58.png)

    ```makefile
    cc_set_if_undefined(USE_EFFEKSEER            OFF)
    ```

    ![image_2025-09-11_10-42-11.png](./.github/assets/image_2025-09-11_10-42-11.png)

    ```makefile
    if (USE_EFFEKSEER)
        cocos_source_files(
    					cocos/bindings/manual/jsb_effekseer_manual.cpp
        )
    endif()
    ```

    ![image_2025-09-11_10-42-23.png](./.github/assets/image_2025-09-11_10-42-23.png)

    ```makefile
    ### EFK BEGIN
    
    if(USE_EFFEKSEER)
    cocos_source_files(
    	effekseer/Effekseer/Effekseer.h
    	effekseer/Effekseer/Effekseer.Modules.h
    	effekseer/Effekseer/Effekseer.SIMD.h
    	effekseer/Effekseer/Effekseer/Backend
    	effekseer/Effekseer/Effekseer/Effekseer.Base.h
    	effekseer/Effekseer/Effekseer/Effekseer.Base.Pre.h
    	effekseer/Effekseer/Effekseer/Effekseer.Color.cpp
    	effekseer/Effekseer/Effekseer/Effekseer.Color.h
    	effekseer/Effekseer/Effekseer/Effekseer.Curve.h
    	effekseer/Effekseer/Effekseer/Effekseer.CurveLoader.cpp
    	effekseer/Effekseer/Effekseer/Effekseer.CurveLoader.h
    	effekseer/Effekseer/Effekseer/Effekseer.DefaultEffectLoader.cpp
    	effekseer/Effekseer/Effekseer/Effekseer.DefaultEffectLoader.h
    	effekseer/Effekseer/Effekseer/Effekseer.DefaultFile.cpp
    	effekseer/Effekseer/Effekseer/Effekseer.DefaultFile.h
    	effekseer/Effekseer/Effekseer/Effekseer.Effect.cpp
    	effekseer/Effekseer/Effekseer/Effekseer.Effect.h
    	effekseer/Effekseer/Effekseer/Effekseer.EffectImplemented.h
    	effekseer/Effekseer/Effekseer/Effekseer.EffectLoader.h
    	effekseer/Effekseer/Effekseer/Effekseer.EffectNode.cpp
    	effekseer/Effekseer/Effekseer/Effekseer.EffectNode.h
    	effekseer/Effekseer/Effekseer/Effekseer.EffectNodeModel.cpp
    	effekseer/Effekseer/Effekseer/Effekseer.EffectNodeModel.h
    	effekseer/Effekseer/Effekseer/Effekseer.EffectNodeRibbon.cpp
    	effekseer/Effekseer/Effekseer/Effekseer.EffectNodeRibbon.h
    	effekseer/Effekseer/Effekseer/Effekseer.EffectNodeRing.cpp
    	effekseer/Effekseer/Effekseer/Effekseer.EffectNodeRing.h
    	effekseer/Effekseer/Effekseer/Effekseer.EffectNodeRoot.cpp
    	effekseer/Effekseer/Effekseer/Effekseer.EffectNodeRoot.h
    	effekseer/Effekseer/Effekseer/Effekseer.EffectNodeSprite.cpp
    	effekseer/Effekseer/Effekseer/Effekseer.EffectNodeSprite.h
    	effekseer/Effekseer/Effekseer/Effekseer.EffectNodeTrack.cpp
    	effekseer/Effekseer/Effekseer/Effekseer.EffectNodeTrack.h
    	effekseer/Effekseer/Effekseer/Effekseer.FCurves.cpp
    	effekseer/Effekseer/Effekseer/Effekseer.FCurves.h
    	effekseer/Effekseer/Effekseer/Effekseer.File.h
    	effekseer/Effekseer/Effekseer/Effekseer.Instance.cpp
    	effekseer/Effekseer/Effekseer/Effekseer.Instance.h
    	effekseer/Effekseer/Effekseer/Effekseer.InstanceChunk.cpp
    	effekseer/Effekseer/Effekseer/Effekseer.InstanceChunk.h
    	effekseer/Effekseer/Effekseer/Effekseer.InstanceContainer.cpp
    	effekseer/Effekseer/Effekseer/Effekseer.InstanceContainer.h
    	effekseer/Effekseer/Effekseer/Effekseer.InstanceGlobal.cpp
    	effekseer/Effekseer/Effekseer/Effekseer.InstanceGlobal.h
    	effekseer/Effekseer/Effekseer/Effekseer.InstanceGroup.cpp
    	effekseer/Effekseer/Effekseer/Effekseer.InstanceGroup.h
    	effekseer/Effekseer/Effekseer/Effekseer.InternalScript.cpp
    	effekseer/Effekseer/Effekseer/Effekseer.InternalScript.h
    	effekseer/Effekseer/Effekseer/Effekseer.InternalStruct.h
    	effekseer/Effekseer/Effekseer/Effekseer.IntrusiveList.cpp
    	effekseer/Effekseer/Effekseer/Effekseer.IntrusiveList.h
    	effekseer/Effekseer/Effekseer/Effekseer.Manager.cpp
    	effekseer/Effekseer/Effekseer/Effekseer.Manager.h
    	effekseer/Effekseer/Effekseer/Effekseer.ManagerImplemented.h
    	effekseer/Effekseer/Effekseer/Effekseer.MaterialLoader.h
    	effekseer/Effekseer/Effekseer/Effekseer.Math.h
    	effekseer/Effekseer/Effekseer/Effekseer.Matrix43.cpp
    	effekseer/Effekseer/Effekseer/Effekseer.Matrix43.h
    	effekseer/Effekseer/Effekseer/Effekseer.Matrix44.cpp
    	effekseer/Effekseer/Effekseer/Effekseer.Matrix44.h
    	effekseer/Effekseer/Effekseer/Effekseer.Random.cpp
    	effekseer/Effekseer/Effekseer/Effekseer.Random.h
    	effekseer/Effekseer/Effekseer/Effekseer.RectF.cpp
    	effekseer/Effekseer/Effekseer/Effekseer.RectF.h
    	effekseer/Effekseer/Effekseer/Effekseer.Resource.cpp
    	effekseer/Effekseer/Effekseer/Effekseer.Resource.h
    	effekseer/Effekseer/Effekseer/Effekseer.ResourceManager.cpp
    	effekseer/Effekseer/Effekseer/Effekseer.ResourceManager.h
    	effekseer/Effekseer/Effekseer/Effekseer.Setting.cpp
    	effekseer/Effekseer/Effekseer/Effekseer.Setting.h
    	effekseer/Effekseer/Effekseer/Effekseer.SoundLoader.h
    	effekseer/Effekseer/Effekseer/Effekseer.TextureLoader.h
    	effekseer/Effekseer/Effekseer/Effekseer.Vector2D.cpp
    	effekseer/Effekseer/Effekseer/Effekseer.Vector2D.h
    	effekseer/Effekseer/Effekseer/Effekseer.Vector3D.cpp
    	effekseer/Effekseer/Effekseer/Effekseer.Vector3D.h
    	effekseer/Effekseer/Effekseer/Effekseer.WorkerThread.cpp
    	effekseer/Effekseer/Effekseer/Effekseer.WorkerThread.h
    	effekseer/Effekseer/Effekseer/Backend/GraphicsDevice.h
    	effekseer/Effekseer/Effekseer/ForceField/ForceFields.cpp
    	effekseer/Effekseer/Effekseer/ForceField/ForceFields.h
    	effekseer/Effekseer/Effekseer/Geometry/GeometryUtility.h
    	effekseer/Effekseer/Effekseer/IO/Effekseer.EfkEfcFactory.cpp
    	effekseer/Effekseer/Effekseer/IO/Effekseer.EfkEfcFactory.h
    	effekseer/Effekseer/Effekseer/Material/Effekseer.CompiledMaterial.cpp
    	effekseer/Effekseer/Effekseer/Material/Effekseer.CompiledMaterial.h
    	effekseer/Effekseer/Effekseer/Material/Effekseer.MaterialCompiler.cpp
    	effekseer/Effekseer/Effekseer/Material/Effekseer.MaterialCompiler.h
    	effekseer/Effekseer/Effekseer/Material/Effekseer.MaterialFile.cpp
    	effekseer/Effekseer/Effekseer/Material/Effekseer.MaterialFile.h
    	effekseer/Effekseer/Effekseer/Model/Model.cpp
    	effekseer/Effekseer/Effekseer/Model/Model.h
    	effekseer/Effekseer/Effekseer/Model/ModelLoader.cpp
    	effekseer/Effekseer/Effekseer/Model/ModelLoader.h
    	effekseer/Effekseer/Effekseer/Model/ProceduralModelGenerator.cpp
    	effekseer/Effekseer/Effekseer/Model/ProceduralModelGenerator.h
    	effekseer/Effekseer/Effekseer/Model/ProceduralModelParameter.h
    	effekseer/Effekseer/Effekseer/Model/SplineGenerator.cpp
    	effekseer/Effekseer/Effekseer/Model/SplineGenerator.h
    	effekseer/Effekseer/Effekseer/Network/Effekseer.Client.cpp
    	effekseer/Effekseer/Effekseer/Network/Effekseer.Client.h
    	effekseer/Effekseer/Effekseer/Network/Effekseer.ClientImplemented.h
    	effekseer/Effekseer/Effekseer/Network/Effekseer.Server.cpp
    	effekseer/Effekseer/Effekseer/Network/Effekseer.Server.h
    	effekseer/Effekseer/Effekseer/Network/Effekseer.ServerImplemented.h
    	effekseer/Effekseer/Effekseer/Network/Effekseer.Session.cpp
    	effekseer/Effekseer/Effekseer/Network/Effekseer.Session.h
    	effekseer/Effekseer/Effekseer/Network/Effekseer.Socket.cpp
    	effekseer/Effekseer/Effekseer/Network/Effekseer.Socket.h
    	effekseer/Effekseer/Effekseer/Network/data/reload_generated.h
    	effekseer/Effekseer/Effekseer/Noise/CurlNoise.cpp
    	effekseer/Effekseer/Effekseer/Noise/CurlNoise.h
    	effekseer/Effekseer/Effekseer/Noise/PerlinNoise.h
    	effekseer/Effekseer/Effekseer/Parameter/AllTypeColor.h
    	effekseer/Effekseer/Effekseer/Parameter/AlphaCutoff.h
    	effekseer/Effekseer/Effekseer/Parameter/BasicSettings.h
    	effekseer/Effekseer/Effekseer/Parameter/CustomData.h
    	effekseer/Effekseer/Effekseer/Parameter/DepthParameter.h
    	effekseer/Effekseer/Effekseer/Parameter/DynamicParameter.h
    	effekseer/Effekseer/Effekseer/Parameter/Easing.cpp
    	effekseer/Effekseer/Effekseer/Parameter/Easing.h
    	effekseer/Effekseer/Effekseer/Parameter/Effekseer.Parameters.cpp
    	effekseer/Effekseer/Effekseer/Parameter/Effekseer.Parameters.h
    	effekseer/Effekseer/Effekseer/Parameter/KillRules.h
    	effekseer/Effekseer/Effekseer/Parameter/LOD.h
    	effekseer/Effekseer/Effekseer/Parameter/Rotation.cpp
    	effekseer/Effekseer/Effekseer/Parameter/Rotation.h
    	effekseer/Effekseer/Effekseer/Parameter/Scaling.h
    	effekseer/Effekseer/Effekseer/Parameter/Sound.h
    	effekseer/Effekseer/Effekseer/Parameter/SpawnMethod.h
    	effekseer/Effekseer/Effekseer/Parameter/Translation.h
    	effekseer/Effekseer/Effekseer/Parameter/UV.h
    	effekseer/Effekseer/Effekseer/Renderer/Effekseer.ModelRenderer.h
    	effekseer/Effekseer/Effekseer/Renderer/Effekseer.ParticleRenderer.h
    	effekseer/Effekseer/Effekseer/Renderer/Effekseer.RibbonRenderer.h
    	effekseer/Effekseer/Effekseer/Renderer/Effekseer.RingRenderer.h
    	effekseer/Effekseer/Effekseer/Renderer/Effekseer.SpriteRenderer.h
    	effekseer/Effekseer/Effekseer/Renderer/Effekseer.TrackRenderer.h
    	effekseer/Effekseer/Effekseer/SIMD/Base.h
    	effekseer/Effekseer/Effekseer/SIMD/Bridge.h
    	effekseer/Effekseer/Effekseer/SIMD/Bridge_Gen.h
    	effekseer/Effekseer/Effekseer/SIMD/Bridge_NEON.h
    	effekseer/Effekseer/Effekseer/SIMD/Bridge_SSE.h
    	effekseer/Effekseer/Effekseer/SIMD/Float4.h
    	effekseer/Effekseer/Effekseer/SIMD/Float4_Gen.h
    	effekseer/Effekseer/Effekseer/SIMD/Float4_NEON.h
    	effekseer/Effekseer/Effekseer/SIMD/Float4_SSE.h
    	effekseer/Effekseer/Effekseer/SIMD/Int4.h
    	effekseer/Effekseer/Effekseer/SIMD/Int4_Gen.h
    	effekseer/Effekseer/Effekseer/SIMD/Int4_NEON.h
    	effekseer/Effekseer/Effekseer/SIMD/Int4_SSE.h
    	effekseer/Effekseer/Effekseer/SIMD/Mat43f.cpp
    	effekseer/Effekseer/Effekseer/SIMD/Mat43f.h
    	effekseer/Effekseer/Effekseer/SIMD/Mat44f.cpp
    	effekseer/Effekseer/Effekseer/SIMD/Mat44f.h
    	effekseer/Effekseer/Effekseer/SIMD/Quaternionf.h
    	effekseer/Effekseer/Effekseer/SIMD/Utils.cpp
    	effekseer/Effekseer/Effekseer/SIMD/Utils.h
    	effekseer/Effekseer/Effekseer/SIMD/Vec2f.h
    	effekseer/Effekseer/Effekseer/SIMD/Vec3f.h
    	effekseer/Effekseer/Effekseer/SIMD/Vec4f.h
    	effekseer/Effekseer/Effekseer/Sound/Effekseer.SoundPlayer.h
    	effekseer/Effekseer/Effekseer/Utils/BinaryVersion.h
    	effekseer/Effekseer/Effekseer/Utils/Compatiblity.h
    	effekseer/Effekseer/Effekseer/Utils/Effekseer.BinaryReader.h
    	effekseer/Effekseer/Effekseer/Utils/Effekseer.CustomAllocator.cpp
    	effekseer/Effekseer/Effekseer/Utils/Effekseer.CustomAllocator.h
    	effekseer/Effekseer/Effekseer/Utils/Profiler.h
    	effekseer/EffekseerCocosCreator/framework/efk_material.cpp
    	effekseer/EffekseerCocosCreator/framework/efk_material.h
    	effekseer/EffekseerCocosCreator/framework/efk_model.cpp
    	effekseer/EffekseerCocosCreator/framework/efk_model.h
    	effekseer/EffekseerCocosCreator/framework/efk_render.cpp
    	effekseer/EffekseerCocosCreator/framework/efk_render.h
    	effekseer/EffekseerCocosCreator/effekseer.cpp
    	effekseer/EffekseerCocosCreator/effekseer.h
    	effekseer/EffekseerCocosCreator/loader/common.cpp
    	effekseer/EffekseerCocosCreator/loader/common.h
    	effekseer/EffekseerCocosCreator/loader/curve.cpp
    	effekseer/EffekseerCocosCreator/loader/curve.h
    	effekseer/EffekseerCocosCreator/loader/material.cpp
    	effekseer/EffekseerCocosCreator/loader/material.h
    	effekseer/EffekseerCocosCreator/loader/model.cpp
    	effekseer/EffekseerCocosCreator/loader/model.h
    	effekseer/EffekseerCocosCreator/loader/sound.cpp
    	effekseer/EffekseerCocosCreator/loader/sound.h
    	effekseer/EffekseerCocosCreator/loader/texture.cpp
    	effekseer/EffekseerCocosCreator/loader/texture.h
    	effekseer/EffekseerCocosCreator/loader/vfile.cpp
    	effekseer/EffekseerCocosCreator/loader/vfile.h
    	effekseer/EffekseerCocosCreator/renderer/graphics.cpp
    	effekseer/EffekseerCocosCreator/renderer/graphics.h
    	effekseer/EffekseerCocosCreator/renderer/renderer.cpp
    	effekseer/EffekseerCocosCreator/renderer/renderer.h
    	effekseer/EffekseerCocosCreator/renderer/renderstate.cpp
    	effekseer/EffekseerCocosCreator/renderer/renderstate.h
    	effekseer/EffekseerCocosCreator/renderer/vertexbuffer.cpp
    	effekseer/EffekseerCocosCreator/renderer/vertexbuffer.h
    	effekseer/EffekseerRendererCommon/EffekseerRenderer.CommonUtils.cpp
    	effekseer/EffekseerRendererCommon/EffekseerRenderer.CommonUtils.h
    	effekseer/EffekseerRendererCommon/EffekseerRenderer.DDSTextureLoader.cpp
    	effekseer/EffekseerRendererCommon/EffekseerRenderer.DDSTextureLoader.h
    	effekseer/EffekseerRendererCommon/EffekseerRenderer.IndexBufferBase.cpp
    	effekseer/EffekseerRendererCommon/EffekseerRenderer.IndexBufferBase.h
    	effekseer/EffekseerRendererCommon/EffekseerRenderer.ModelRendererBase.cpp
    	effekseer/EffekseerRendererCommon/EffekseerRenderer.ModelRendererBase.h
    	effekseer/EffekseerRendererCommon/EffekseerRenderer.Renderer.cpp
    	effekseer/EffekseerRendererCommon/EffekseerRenderer.Renderer.h
    	effekseer/EffekseerRendererCommon/EffekseerRenderer.Renderer_Impl.cpp
    	effekseer/EffekseerRendererCommon/EffekseerRenderer.Renderer_Impl.h
    	effekseer/EffekseerRendererCommon/EffekseerRenderer.RenderStateBase.cpp
    	effekseer/EffekseerRendererCommon/EffekseerRenderer.RenderStateBase.h
    	effekseer/EffekseerRendererCommon/EffekseerRenderer.RibbonRendererBase.cpp
    	effekseer/EffekseerRendererCommon/EffekseerRenderer.RibbonRendererBase.h
    	effekseer/EffekseerRendererCommon/EffekseerRenderer.RingRendererBase.cpp
    	effekseer/EffekseerRendererCommon/EffekseerRenderer.RingRendererBase.h
    	effekseer/EffekseerRendererCommon/EffekseerRenderer.ShaderBase.h
    	effekseer/EffekseerRendererCommon/EffekseerRenderer.SpriteRendererBase.cpp
    	effekseer/EffekseerRendererCommon/EffekseerRenderer.SpriteRendererBase.h
    	effekseer/EffekseerRendererCommon/EffekseerRenderer.StandardRenderer.h
    	effekseer/EffekseerRendererCommon/EffekseerRenderer.TrackRendererBase.cpp
    	effekseer/EffekseerRendererCommon/EffekseerRenderer.TrackRendererBase.h
    	effekseer/EffekseerRendererCommon/EffekseerRenderer.VertexBufferBase.cpp
    	effekseer/EffekseerRendererCommon/EffekseerRenderer.VertexBufferBase.h
    	effekseer/EffekseerRendererCommon/ModelLoader.cpp
    	effekseer/EffekseerRendererCommon/ModelLoader.h
    )
    endif()
    
    ### EFK END
    ```

    ![image_2025-09-11_10-42-35.png](./.github/assets/image_2025-09-11_10-42-35.png)

    ```makefile
    if(USE_EFFEKSEER)
          target_include_directories(ccbindings PRIVATE
              ${CWD}/effekseer/Effekseer
              ${CWD}/effekseer/EffekseerCocosCreator
              ${CWD}/effekseer/EffekseerRendererCommon
          )
    endif()
    ```

    ![image_2025-09-11_10-42-43.png](./.github/assets/image_2025-09-11_10-42-43.png)

    ```makefile
    $<IF:$<BOOL:${USE_EFFEKSEER}>,CC_USE_EFFEKSEER=1,CC_USE_EFFEKSEER=0>
    ```

    ![image_2025-09-11_10-42-56.png](./.github/assets/image_2025-09-11_10-42-56.png)

    ```makefile
    if(USE_EFFEKSEER)
        target_include_directories(${ENGINE_NAME} PUBLIC
            ${CWD}/effekseer
            ${CWD}/effekseer/Effekseer
            ${CWD}/effekseer/EffekseerCocosCreator
            ${CWD}/effekseer/EffekseerRendererCommon
        )
    	
    	target_compile_definitions(${ENGINE_NAME} PRIVATE
    		__EFFEKSEER_RENDERER_GLES3__
    		__EFFEKSEER_USE_LIBPNG__
    	)
    endif()
    ```
