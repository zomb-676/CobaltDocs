# State Store

---

在出现[DSA(Direct State Access)](https://www.khronos.org/opengl/wiki/Direct_State_Access)前,OpenGL一直都几乎仅有基于状态机设计的API  
可惜直到OpenGL4.5才正式进入规范,而mc的要求仅式OpenGL3.2  
如果是mod是Sodium/Rubidium的附属,则可以无视这点,此mod以要求OpenGL4.5,参见[此](https://github.com/CaffeineMC/sodium-fabric/commit/01321b0082cea08316b74eff374227d12bb50645)  

因此,为了减少GUP-CPU通信及状态切换的开销,在cpu侧会对当前状态进行缓存,并在每次尝试调用前检查缓存以提高性能。

minecraft对此的实现有如下

> [!tip]
> 并不是每一个被存储的类型,都会核实是否需要更新，有些仅起了记录的作用

## GlStateManager

* BLEND
* DEPTH
* CULL
* POLY_OFFSET
* COLOR_LOGIC
* STENCIL
* SCISSOR
* activeTexture
* TEXTURES(TextureState)
* COLOR_MASK

## RenderSystem

mc的常用uniform
* inverseViewRotationMatrix
* projectionMatrix
* savedProjectionMatrix
* modelViewStack
* modelViewMatrix
* textureMatrix
* shaderColor
* shaderFogStart
* shaderFogEnd
* shaderFogColor
* shaderFogShape
* shaderLightDirections
* shaderGameTime
* shaderTextures(int)
---
* shaderLineWidth

## BufferUploader

* lastVertexArrayObject
* lastVertexBufferObject
* lastIndexBufferObject
* lastFormat

## BlendMode

> [!tip]与上文不同,这是给`ShaderInstance`和`EffectInstance` 使用的  
> 非干涉情况下,BlendMode的优先级更高,更晚被设置

* BlendMode lastApplied
* int srcColorFactor
* int srcAlphaFactor
* int dstColorFactor
* int dstAlphaFactor
* int blendFunc
* boolean separateBlend
* boolean opaque


> [!warning]
> mc对于BlendMode和全局GlStateManager.BLEND混合使用的情况极大可能有异常  
> 如果渲染上出现了混合错误,请尝以下方案  

```java
import com.mojang.blaze3d.shaders.BlendMode;
import org.spongepowered.asm.mixin.Mixin;
import org.spongepowered.asm.mixin.gen.Accessor;

@Mixin(BlendMode.class)
public interface BlendModeMixin {
    @Accessor
    static void setLastApplied(BlendMode mode) {}
    @Accessor
    static BlendMode getLastApplied() { return null;}
}

// warp your render call during getLastApplied and setLastApplied
```
