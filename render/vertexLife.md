# Vertex's Life

---

在本节,我们将追溯顶点从产生到`draw call`的全部流程

在开始之前,我们梳理一下OpenGL中顶点的流程

```mmd
flowchart TB
raw[raw data in any collection] --> upload
subgraph upload[upload to graphic memory]
    direction LR
    subgraph vertexObject[Vertex Object]
        direction TB
        vertexArray[Object Buffer:attribute]
        indexArray[Object Buufer:index]
    end
    attribute[attribute setting]
end
upload --> any[...]
any --> drawCall
```

mojang对整个过程进行了封装,这里的容器被封装为`BufferBuilder`  
这里列出了`public`的函数,并且子类未展示父类函数,去除了所有`Balk`版本,去除了过长的  
`vertex(x, y, z, r, g, b, a, texU, texV, overlayUV, lightmapUV, normalX, normalY, normalZ) void`  
一个函数若同时拥有float/double和int类型的参数的重载,则表明其值范围不同
float/double表明参数需要`标准化/归一化`必须处于0~1,而int一般表明其值位于0~255  
接口`VertexConsumer`还继承自`IForgeVertexConsumer`,里面也是`balk`版本的函数

```mmd
classDiagram
direction LR
class BufferBuilder {
  + BufferBuilder(capacity)
  + building() boolean
  + begin(Mode, VertexFormat) void
  + getSortState() SortState
  + popNextBuffer() Pair~DrawState, ByteBuffer~
  + clear() void
  + discard() void
  + end() void
  + setQuadSortOrigin(sortX, sortY, sortZ) void
  + getVertexFormat() VertexFormat
  + restoreSortState(SortState) void
}
class BufferVertexConsumer {
<<Interface>>
  + nextElement() void
  + normalIntValue(num) byte
  + uvShort(u, sv, index) VertexConsumer
  + putShort(int, short) void
  + currentElement() VertexFormatElement
  + putByte(int, byte) void
  + putFloat(int, float) void
}
class DefaultedVertexConsumer {
  + unsetDefaultColor() void
}
class VertexConsumer {
<<Interface>>
  + uv2(u, v) VertexConsumer
  + defaultColor(defaultR, defaultG, defaultB, defaultA) void
  + overlayCoords(u, v) VertexConsumer
  + overlayCoords(overlayUV) VertexConsumer
  + color(colorARGB) VertexConsumer
  + uv2(LightmapUV) VertexConsumer
  + unsetDefaultColor() void
  + uv(u, v) VertexConsumer
  + vertex(x, y, z) VertexConsumer
  + color(r, g, b, a) VertexConsumer
  + normal(x, y, z) VertexConsumer
  + endVertex() void
  + normal(Matrix3f, x, y, z) VertexConsumer
  + vertex(Matrix4f, x, y, z) VertexConsumer
}

BufferBuilder  ..>  BufferVertexConsumer 
BufferBuilder  -->  DefaultedVertexConsumer 
BufferVertexConsumer  -->  VertexConsumer 
DefaultedVertexConsumer  ..>  VertexConsumer 

```

可以发现出于继承树顶层的`VertexConsumer`定义了存放了不同功能的顶点  
`BufferVertexConsumer`则具体定义了将具体类型的数据存放  
而`BufferBuilder`则是具体的实现者  
这里实现了对于`Render Type` `translucent`的顶点顺序排序  
`setQuadSortOrigin` `getSortState`等还透露了关于`Render Type`中`translucent`的特殊处理

那么我们该如何获取我们想要的`VertexBuilder`呢?

在这节,我们先不引入`RenderTye`
直接通过`Tesselator.getInstance().getBuilder()`或者直接使用`BufferBuilder`的构造函数  
在提交数据时候,前者通过`Tesselator#end`,后者需要`BufferBuilder#end`并且`BufferUploader.end(buffer)`

```kotlin
@EventBusSubscriber(Dist.CLIENT)
object VertexFill {

    private val buffer = BufferBuilder(256)

    @SubscribeEvent
    @JvmStatic
    fun renderLevelLastEvent(event: RenderLevelLastEvent) {
        if (Minecraft.getInstance().player!!.mainHandItem.item != Items.DIAMOND_BLOCK) {
            return
        }
        buffer.begin(VertexFormat.Mode.QUADS, DefaultVertexFormat.POSITION_COLOR)
        val stack = event.poseStack
        val cameraPos = Minecraft.getInstance().gameRenderer.mainCamera.position
        stack.translate(-cameraPos.x, -cameraPos.y, -cameraPos.z)
        val playerPos = Minecraft.getInstance().player!!.position()
        val x = floor(playerPos.x).toInt()
        val y = floor(playerPos.y).toInt()
        val z = floor(playerPos.z).toInt()
        val pos = BlockPos.MutableBlockPos()
        RenderSystem.setShader(GameRenderer::getPositionColorShader)
        RenderSystem.disableDepthTest()
        RenderSystem.enableBlend()
        RenderSystem.defaultBlendFunc()
        for (dx in (x - 15)..(x + 15)) {
            pos.x = dx
            for (dy in (y - 15)..(y + 15)) {
                pos.y = dy
                for (dz in (z - 15)..(z + 15)) {
                    pos.z = dz
                    val blockState = Minecraft.getInstance().level!!.getBlockState(pos)
                    if (blockState.block == Blocks.DIAMOND_BLOCK){
                        stack.pushPose()
                        stack.translate(pos.x.toDouble(),pos.y.toDouble(),pos.z.toDouble())
                        val lastPose = stack.last().pose()

                        buffer.vertex(lastPose,0f,0f,0f).color(1f,0f,0f,0.75f).endVertex()
                        buffer.vertex(lastPose,0f,1f,0f).color(0f,1f,0f,0.75f).endVertex()
                        buffer.vertex(lastPose,1f,1f,0f).color(1f,1f,1f,0.75f).endVertex()
                        buffer.vertex(lastPose,1f,0f,0f).color(1f,1f,1f,0.75f).endVertex()

//                        buffer.vertex(lastPose.pose(),1f,0f,0f).color(1f,1f,1f,1f).endVertex()
//                        buffer.vertex(lastPose.pose(),1f,1f,0f).color(1f,1f,1f,1f).endVertex()
//                        buffer.vertex(lastPose.pose(),0f,1f,0f).color(1f,1f,1f,1f).endVertex()
//                        buffer.vertex(lastPose.pose(),0f,0f,0f).color(1f,0f,0f,1f).endVertex()
                        stack.popPose()
                    }
                }
            }
        }
        buffer.end()
        BufferUploader.end(buffer)
        RenderSystem.enableDepthTest()
        RenderSystem.disableBlend()
    }
}
```

可以看到,首先我们首先调用了`begin(VertexFormat.Mode pMode, VertexFormat pFormat)`  
如下是`VertexFormat.Mode`的部分定义

| Name             | glMode            | primitiveLength | primitiveStride | indexCount(vertices) |
|------------------|-------------------|-----------------|-----------------|----------------------|
| LINES            | GL_TRIANGLES      | 2               | 2               | vertices/4*6         |
| LINE_STRIP       | GL_TRIANGLE_STRIP | 2               | 1               | vertices             |
| DEBUG_LINES      | GL_LINES          | 2               | 2               | vertices             |
| DEBUG_LINE_STRIP | GL_LINE_STRIP     | 2               | 1               | vertices             |
| TRIANGLES        | GL_TRIANGLES      | 3               | 3               | vertices             |
| TRIANGLE_STRIP   | GL_TRIANGLE_STRIP | 3               | 1               | vertices             |
| TRIANGLE_FAN     | GL_TRIANGLE_FAN   | 3               | 1               | vertices             |
| QUADS            | GL_TRIANGLES      | 4               | 4               | vertices/4*6         |

可以看到它与  
`void glDrawArrays(@NativeType("GLenum") int mode, @NativeType("GLint") int first, @NativeType("GLsizei") int count);`
和  
`void glDrawElements(@NativeType("GLenum") int mode, @NativeType("void const *") ShortBuffer indices)`
中的`mode`有关有关  
`glMode`即绘制的`图元模式`  
`primitiveLength`,在mc尚未使用,猜测单个图元所需顶点数目  
`primitiveStride`,只在顶点排序时有用到  
`int indexCount(int vertices)`是个函数,从顶点个数计算索引个数  
很神奇的是`LINES`使用的图元模式也是三角形,而计算索引个数的方式与`QUADS`一致  
在`BufferBuilder#endVertex`内

```java
public void endVertex() {
  if (this.elementIndex != 0) {
     throw new IllegalStateException("Not filled all elements of the vertex");
  } else {
     ++this.vertices;
     this.ensureVertexCapacity();
     if (this.mode == VertexFormat.Mode.LINES || this.mode == VertexFormat.Mode.LINE_STRIP) {
        int i = this.format.getVertexSize();
        this.buffer.position(this.nextElementByte);
        ByteBuffer bytebuffer = this.buffer.duplicate();
        bytebuffer.position(this.nextElementByte - i).limit(this.nextElementByte);
        this.buffer.put(bytebuffer);
        this.nextElementByte += i;
        ++this.vertices;
        this.ensureVertexCapacity();
     }

  }
}
```

顶点数据被`duplicate`了一份,所以绘制时仍只需传入两个顶点数据,具体可以查看`GLX#_renderCrosshair`

在看`VertexFormat`前,我们先查看枚举`VertexFormatElement.Type`

| name   | size | name           | glType            |
|--------|------|----------------|-------------------|
| FLOAT  | 4    | Float          | GL_FLOAT          |
| UBYTE  | 1    | Unsigned Byte  | GL_UNSIGNED_BYTE  |
| BYTE   | 1    | Byte           | GL_BYTE           |
| USHORT | 2    | Unsigned Short | GL_UNSIGNED_SHORT |
| SHORT  | 2    | Short          | GL_SHORT          |
| UINT   | 4    | Int            | GL_UNSIGNED_INT   |
| INT    | 4    | Int            | GL_INT            |

总之就是映射了类型名称,类型位宽,gl枚举

枚举`VertexFormatElement.Usage`  
每个枚举包含三个字段`String name`,`SetupState setupState`,`ClearState clearState`  
mc已定义了如下

| name         | setup                                                                                                                                                                            | clear                           |
|--------------|----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|---------------------------------|
| Position     | enableVertexAttribArray(stateIndex) vertexAttribPointer(index,size,type,normalized false,stride,pointer)                                                                         | disableVertexAttribArray(index) |
| Normal       | enableVertexAttribArray(stateIndex) vertexAttribPointer(index,size,type,normalized true,stride,pointer)                                                                          | disableVertexAttribArray(index) |
| Vertex Color | enableVertexAttribArray(stateIndex) vertexAttribPointer(index,size,type,normalized true,stride,pointer)                                                                          | disableVertexAttribArray(index) |
| UV           | enableVertexAttribArray(stateIndex) <br/>float:vertexAttribPointer(index,size,type,normalized false,stride,pointer)<br/>int:vertexAttribIPointer(index,size,type,stride,pointer) | disableVertexAttribArray(index) |
| Padding      |                                                                                                                                                                                  |                                 |
| Generic      | enableVertexAttribArray(stateIndex) vertexAttribPointer(index,size,type,normalized true,stride,pointer)                                                                          | disableVertexAttribArray(index) |

几乎就是定义了`attribute`设定的所有参数了

而`VertexFormatElement`则则更进一步,将attribute与type绑定
在类`DefaultVertexFormat`内可以查到所有的mc内定义的

| name             | index | type  | usage    | count |
|------------------|-------|-------|----------|-------|
| ELEMENT_POSITION | 0     | FLOAT | POSITION | 3     |
| ELEMENT_COLOR    | 0     | UBYTE | COLOR    | 4     |
| ELEMENT_UV0      | 0     | FLOAT | UV       | 2     |
| ELEMENT_UV1      | 1     | SHORT | UV       | 2     |
| ELEMENT_UV2      | 2     | SHORT | UV       | 2     |
| ELEMENT_NORMAL   | 0     | BYTE  | NORMAL   | 3     |
| ELEMENT_PADDING  | 0     | BYTE  | PADDING  | 1     |

还有一个`ELEMENT_UV`与`ELEMENT_UV0`一致

如下是`VertexForamt`的构造函数

```java
public VertexFormat(ImmutableMap<String, VertexFormatElement> pElementMapping) {
  this.elementMapping = pElementMapping;
  this.elements = pElementMapping.values().asList();
  int i = 0;

  for(VertexFormatElement vertexformatelement : pElementMapping.values()) {
     this.offsets.add(i);
     i += vertexformatelement.getByteSize();
  }

  this.vertexSize = i;
}
```

可以看到`VertexFormat`即多个命名的`VertexFormatElement`合集  
在类`DefaultVertexFormat`内可以查到所有的mc内定义的

| name                        | content(name/element is special)          |
|-----------------------------|-------------------------------------------|
| BLIT_SCREEN                 | Position,UV,Color                         |
| BLOCK                       | Position,Color,UV0,UV2,Normal,Padding     |
| NEW_ENTITY                  | Position,Color,UV0,UV1,UV2,Normal,Padding |
| PARTICLE                    | Position,UV0,Color,UV2                    |
| POSITION                    | Position                                  |
| POSITION_COLOR              | Position,Color                            |
| POSITION_COLOR_NORMAL       | Position,Color,Normal                     |
| POSITION_COLOR_LIGHTMAP     | Position,Color,UV2                        |
| POSITION_TEX                | Position,UV0                              |
| POSITION_COLOR_TEX          | Position,Color,UV0                        |
| POSITION_TEX_COLOR          | Position,UV0,Color                        |
| POSITION_COLOR_TEX_LIGHTMAP | Position,Color,UV0,UV2                    |
| POSITION_TEX_LIGHTMAP_COLOR | Position,UV0,UV2,Color                    |
| POSITION_TEX_COLOR_NORMAL   | Position,UV0,Color,Normal,Padding         |

我们在调用`BufferBuilder`的方法为每个顶点传递顶点数据时,应与后方的定义顺序一致.并在单个顶点所需内容全传递完成后,调用`BufferBuilder#endVertex`

调用`BufferBuilder#end`,将在其内部产生一个`DrawState`,并且存储该次的相关数据`Format`,`VertexCount`,`IndexCount`,`Mode`,`IndexType`,`IndexOnly`
,`SequentialIndex`

调用`BufferUploader.end(BufferBuilder)`,间接调用`BufferUploader.updateVertexSetup(VertexFormat)`  
其内部绑定了当前`Opengl context`的`VertexArrayObject`与`Buffer Object(存储顶点数据)`

