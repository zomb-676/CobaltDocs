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

利用`RenderType`简化上次的代码

```kotlin
@Mod.EventBusSubscriber(Dist.CLIENT)
object TryRenderType {

    private class RenderTypeHolder : RenderType("any", DefaultVertexFormat.POSITION_COLOR, VertexFormat.Mode.QUADS, 256, false, false, {}, {}) {
        companion object {
            @Suppress("INACCESSIBLE_TYPE")
            val renderType: RenderType = create(
                "posColorRenderType", DefaultVertexFormat.POSITION_COLOR, VertexFormat.Mode.QUADS, 256, false, false,
                CompositeState.builder()
                    .setShaderState(POSITION_COLOR_SHADER)
                    .setCullState(NO_CULL)
                    .setDepthTestState(NO_DEPTH_TEST)
                    .setTransparencyState(TRANSLUCENT_TRANSPARENCY)
                    .createCompositeState(false)
            )
        }
    }

    @SubscribeEvent
    @JvmStatic
    fun renderLevelLastEvent(event: RenderLevelLastEvent) {
        if (Minecraft.getInstance().player!!.mainHandItem.item != Items.ANVIL) {
            return
        }
        val bufferSource = Minecraft.getInstance().renderBuffers().bufferSource()
        val buffer = bufferSource.getBuffer(RenderTypeHolder.renderType)
        val stack = event.poseStack
        val cameraPos = Minecraft.getInstance().gameRenderer.mainCamera.position
        stack.translate(-cameraPos.x, -cameraPos.y, -cameraPos.z)
        val playerPos = Minecraft.getInstance().player!!.position()
        val x = floor(playerPos.x).toInt()
        val y = floor(playerPos.y).toInt()
        val z = floor(playerPos.z).toInt()
        val pos = BlockPos.MutableBlockPos()
        for (dx in (x - 15)..(x + 15)) {
            pos.x = dx
            for (dy in (y - 15)..(y + 15)) {
                pos.y = dy
                for (dz in (z - 15)..(z + 15)) {
                    pos.z = dz
                    val blockState = Minecraft.getInstance().level!!.getBlockState(pos)
                    if (blockState.block == Blocks.ANVIL) {
                        stack.pushPose()
                        stack.translate(pos.x.toDouble(), pos.y.toDouble(), pos.z.toDouble())
                        val lastPose = stack.last().pose()

                        buffer.vertex(lastPose, 0f, 0f, 0f).color(1f, 0f, 0f, 0.75f).endVertex()
                        buffer.vertex(lastPose, 0f, 1f, 0f).color(0f, 1f, 0f, 0.75f).endVertex()
                        buffer.vertex(lastPose, 1f, 1f, 0f).color(1f, 1f, 1f, 0.75f).endVertex()
                        buffer.vertex(lastPose, 1f, 0f, 0f).color(1f, 1f, 1f, 0.75f).endVertex()

//                        buffer.vertex(lastPose.pose(),1f,0f,0f).color(1f,1f,1f,1f).endVertex()
//                        buffer.vertex(lastPose.pose(),1f,1f,0f).color(1f,1f,1f,1f).endVertex()
//                        buffer.vertex(lastPose.pose(),0f,1f,0f).color(1f,1f,1f,1f).endVertex()
//                        buffer.vertex(lastPose.pose(),0f,0f,0f).color(1f,0f,0f,1f).endVertex()
                        stack.popPose()
                    }
                }
            }
        }
        RenderSystem.disableDepthTest()
        bufferSource.endBatch(RenderTypeHolder.renderType)
    }
}
```

>[!note]
> 这里我们使用一个`RenderTypeHolder`  
> 是因为许多需要使用的字段访问级别仅为`protected`  
> 通过继承父类来暴露`protected`  
> 所以`holder`并不会被构造  

可以看到,还是简洁了不少  
请无视最后的`RenderSystem.disableDepthTest()`,为什么有这个我折叠了,正常是不需要的

<details>
<summary>为什么呢</summary>

```java
public static class DepthTestStateShard extends RenderStateShard {
    private final String functionName;

    public DepthTestStateShard(String pFunctionName, int pDepthFunc) {
        super("depth_test",/*setupState*/ () -> {
            if (pDepthFunc != GL_ALWAYS) {
                RenderSystem.enableDepthTest();
                RenderSystem.depthFunc(pDepthFunc);
            }

        }, /*clearState*/ () -> {
            if (pDepthFunc != GL_ALWAYS) {
                RenderSystem.disableDepthTest();
                RenderSystem.depthFunc(GL_LEQUAL);
            }
        });
        this.functionName = pFunctionName;
    }

    public String toString() {
       return this.name + "[" + this.functionName + "]";
    }
}

protected static final RenderStateShard.DepthTestStateShard NO_DEPTH_TEST 
    = new RenderStateShard.DepthTestStateShard("always", GL_ALWAYS);

```
可以看到,对于`NO_DEPTH_TEST`,实际上就是...什么都不做  
这就导致`DisableDepthTest`的调用,完全取决于使用`RenderType`或者在手动调用`enable`后再次`disable`  
然后在笔者所处的环境中...mj没有配对的调用`disable`,只能手动添加

</details>
