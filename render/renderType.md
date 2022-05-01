# RenderType

---

`RenderType`可以说是mc渲染中最为重要的一部分,而它实际上是一些列对于`OpenGL context`操作的合集

```mmd
flowchart RL
BooleanStateShard
CompositeRenderType
CullStateShard
DepthTestStateShard
EmptyTextureStateShard
LayeringStateShard
LightmapStateShard
LineStateShard
MultiTextureStateShard
OffsetTexturingStateShard
OutputStateShard
OverlayStateShard
RenderType
ShaderStateShard
TextureStateShard
TexturingStateShard
TransparencyStateShard
WriteMaskStateShard
RenderStateShard

BooleanStateShard  -->  RenderStateShard 
CompositeRenderType  -->  RenderType 
CullStateShard  -->  BooleanStateShard 
DepthTestStateShard  -->  RenderStateShard 
EmptyTextureStateShard  -->  RenderStateShard 
LayeringStateShard  -->  RenderStateShard 
LightmapStateShard  -->  BooleanStateShard 
LineStateShard  -->  RenderStateShard 
MultiTextureStateShard  -->  EmptyTextureStateShard 
OffsetTexturingStateShard  -->  TexturingStateShard 
OutputStateShard  -->  RenderStateShard 
OverlayStateShard  -->  BooleanStateShard 
RenderType  -->  RenderStateShard 
ShaderStateShard  -->  RenderStateShard 
TextureStateShard  -->  EmptyTextureStateShard 
TexturingStateShard  -->  RenderStateShard 
TransparencyStateShard  -->  RenderStateShard 
WriteMaskStateShard  -->  RenderStateShard 
```

处于继承树顶层的`RenderStateShard`拥有三个字段,`String name`,`Runnable setupState`,`Runnable clearState`  
其他的派生类只是对所需改变上下文所需字段的特化

| class/instance name        | name                     | extra/comment                                                                                     |
|----------------------------|--------------------------|---------------------------------------------------------------------------------------------------|
| **DepthTestStateShard**    | **depth_test**           | **String functionName**                                                                           |
| NO_DEPTH_TEST              |                          | functionName:always                                                                               |
| EQUAL_DEPTH_TEST           |                          | functionName:==                                                                                   |
| LEQUAL_DEPTH_TEST          |                          | functionName:<=                                                                                   |
| **LineStateShard**         | **line_width**           | **OptionalDouble width**                                                                          |
| DEFAULT_LINE               |                          | width:1.0                                                                                         |
| **ShaderStateShard**       | **shader**               | **Optional<Supplier<ShaderInstance>> shader**                                                     |
| **TransparencyStateShard** |                          |                                                                                                   |
| NO_TRANSPARENCY            | no_transparency          |                                                                                                   |
| ADDITIVE_TRANSPARENCY      | additive_transparency    | blendFunc(SRC.ONE,DEST.ONE)                                                                       |
| LIGHTNING_TRANSPARENCY     | lightning_transparency   | blendFunc(SRC.SRC_ALPHA,DEST.ONE)                                                                 |
| GLINT_TRANSPARENCY         | glint_transparency       | blendFuncSeparate<br/>SRC.SRC_COLOR,DEST.ONE<br/>SRC.ZERO,DEST.ONE                                |
| CRUMBLING_TRANSPARENCY     | crumbling_transparency   | blendFuncSeparate<br/>DEST.DST_COLOR,DEST.PME<br/>SRC.ONE,DEST.ZERO                               |
| TRANSLUCENT_TRANSPARENCY   | translucent_transparency | blendFuncSeparate<br/>SRC.SRC_ALPHA,DEST.ONE_MINUS_SRC_ALPHA<br/>SRC.ONE,DEST.ONE_MINUS_SRC_ALPHA |
| **WriteMaskStateShard**    | **write_mask_state**     | **boolean writeColor<br>boolean writeDepth**                                                      |
| COLOR_DEPTH_WRITE          |                          | writeColor:true<br/>writeDepth:true                                                               |
| COLOR_WRITE                |                          | writeColor:true<br/>writeDepth:false                                                              |
| DEPTH_WRITE                |                          | writeColor:false<br/>writeDepth:true                                                              |
| **OutputStateShard**       |                          |                                                                                                   |
| MAIN_TARGET                | main_target              | getMainRenderTarget()                                                                             |
| OUTLINE_TARGET             | outline_target           | levelRenderer.entityTarget()                                                                      |
| TRANSLUCENT_TARGET         | translucent_target       | levelRenderer.getTranslucentTarget()                                                              |
| PARTICLES_TARGET           | particles_target         | levelRenderer.getParticlesTarget()                                                                |
| WEATHER_TARGET             | weather_target           | levelRenderer.getWeatherTarget()                                                                  |
| CLOUDS_TARGET              | clouds_target            | levelRenderer.getCloudsTarget()                                                                   |
| ITEM_ENTITY_TARGET         | item_entity_target       | levelRenderer.getItemEntityTarget()                                                               |
| **LayeringStateShard**     |                          |                                                                                                   |
| NO_LAYERING                | no_layering              |                                                                                                   |
| POLYGON_OFFSET_LAYERING    | polygon_offset_layering  | polygonOffset(factor:-1.0F,units:-10.0F)                                                          |
| VIEW_OFFSET_Z_LAYERING     | view_offset_z_layering   | scale(x:0.99975586F,y:0.99975586F,z:0.99975586F)                                                  |
| **EmptyTextureStateShard** | **texture**              | **Optional<ResourceLocation> cutoutTexture()**                                                    |
| NO_TEXTURE                 |                          |                                                                                                   |
| **MultiTextureStateShard** |                          |                                                                                                   |
| **TextureStateShard**      |                          | **Optional<ResourceLocation> texture<br/>boolean blur<br/>boolean mipmap**                        |
| BLOCK_SHEET_MIPPED         |                          | texture:TextureAtlas.LOCATION_BLOCKS<br/>blur:false<br/>mipmap:true                               |
| BLOCK_SHEET                |                          | texture:TextureAtlas.LOCATION_BLOCKS<br/>blur:false<br/>mipmap:false                              |
| **TexturingStateShard**    |                          |                                                                                                   |
| DEFAULT_TEXTURING          | default_texturing        |                                                                                                   |
| GLINT_TEXTURING            | glint_texturing          | setupGlintTexturing(8.0F);                                                                        |
| ENTITY_GLINT_TEXTURING     | entity_glint_texturing   | setupGlintTexturing(0.16F);                                                                       |
| OffsetTexturingStateShard  | offset_texturing         |                                                                                                   |
| **BooleanStateShard**      |                          | **bool enabled**                                                                                  |
| **CullStateShard**         | **cull**                 | **bool useCull**                                                                                  |
| CULL                       |                          | useCull:true                                                                                      |
| NO_CULL                    |                          | useCull:false                                                                                     |
| **LightmapStateShard**     | **lightmap**             | **bool useLightMap**                                                                              |
| LIGHTMAP                   |                          | useLightMap:true                                                                                  |
| NO_LIGHTMAP                |                          | useLightMap:false                                                                                 |
| **OverlayStateShard**      | **overlay**              | **bool useLightmap**                                                                              |
| OVERLAY                    | overlay                  | useLightmap:true                                                                                  |
| NO_OVERLAY                 | overlay                  | useLightmap:false                                                                                 |

`CompositeState`正是每种`RenderStateShard`合集,mj还提供了`CompositeStateBuilder`用`Builder模式`来构造对象  
而`RenderType`则是`VertexFormat`,`bufferSize`,`CompositeState`的合集