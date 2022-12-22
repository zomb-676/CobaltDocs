# Shader

---

对应于`ShaderInstance`与`EffectInstance`  
前者即为`core shader`,后者为`Post Process Shader`  
对于两者的具体内容,可以参见

- [vanilla shader书写](https://docs.google.com/document/d/15TOAOVLgSNEoHGzpNlkez5cryH3hFF3awXL5Py81EMk/edit)  
- [core shader在游戏内用于渲染何物](https://github.com/ShockMicro/Minecraft-Shaders/wiki/Core-Shaders)  
- [vanilla uniforms](https://github.com/ShockMicro/Minecraft-Shaders/wiki/Uniforms)  

---

## Register

对于forge,可以使用`RegisterShadersEvent`  
对于fabric,fabric-api没有提供等价产物,可自行注入到在原版加载处后

## GlslPreprocessor

用于处理#moj_import<>并插入正确的[宏](https://www.khronos.org/opengl/wiki/Core_Language_(GLSL)##line_directive)使报错的行号信息正确  

> [!note]
> 如果对shader源码在运行时进行了修改,并防御性的进行编译测试  
> 由于GlslPreprocessor在ShaderInstance的匿名实现类,会记录已经处理过的#moj_import<>  
> 在测试后若仍使用同一个对象,切记清空import记录  

## Respect Mod's name space

对于forge,`ShaderInstance`在经过forge patch后存在一个使用`Resource Loaction`的构造函数,可以使用mod的name space  
同时,在forge这个[commit](https://github.com/MinecraftForge/MinecraftForge/commit/82026d11a4a0fde3fe524567552030a881648574)后#mj_import也支持了mod的name space  

fabric无

## New VertexFormatElement.Usage

**_mc对`glVertexAttribPointer`竟然是以枚举类实现的  
夏虫不可语冰!!!_**  
而这玩意儿还是一个该死的非公开静态内部类  
请使用AT/AW修改其访问修饰符并使用mixin来访问枚举类的构造函数来使得我们破除这个限制  

```java
import com.mojang.blaze3d.vertex.VertexFormatElement;
import org.spongepowered.asm.mixin.Mixin;
import org.spongepowered.asm.mixin.gen.Invoker;
import org.spongepowered.asm.mixin.injection.Coerce;

@Mixin(VertexFormatElement.Usage.class)
public interface VertexFormatElementUsageAccessor{
        @Invoker("<init>")
        static VertexFormatElement.Usage constructor(String enumName, int enumIndex, String name, VertexFormatElement.Usage.SetupState steup, @Coerce VertexFormatElement.Usage.ClearState clear){
            return null;
        }
}
```

## New VertexFormat
shader json内的attributes数组，其名与在构造VertexFormat时使用的Map的key的String一致  

## Correspond BufferBuilder
为了方便使用,我们还需要一个与其配套使用的BufferBuilder子类  

给出与原版实现风格一致的实现
```java
public BufferBuilder progress(float progress){
    var vertexformatelement = your_VertexFormatElement.Usage
    if (this.currentElement().getUsage() != vertexformatelement){
        return this;
    }else if(vertexformatelement.getType() == your_VertexFormatElement.Type && vertexformatelement.getCount() == your_num)
        this.putXXX(); //fill data, maybe multi line
        this.nextElement();
        return this;
    }else {
        throw new IllegalStateException();
    }
}
```

# Example

[逐顶点版本的ColorModulator](https://github.com/USS-Shenzhou/MadParticle/blob/master/src/main/java/cn/ussshenzhou/madparticle/particle/MadParticleShader.java)  
[消融效果实现](https://github.com/Low-Drag-MC/ShimmerFire/blob/main/src/main/java/com/lowdragmc/shimmerfire/client/renderer/MimicDissolveRender.java)  

最终效果:
![](../picture/shader/dissolve.gif)

[可参考的消融原理讲解视频](https://www.bilibili.com/video/BV1ue4y147SX/)