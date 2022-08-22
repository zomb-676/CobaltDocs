# Vertex's Lifetime

---

在本节,我们将追溯顶点从产生到`draw call`的全部流程

## flow

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

## bufferBuilder

mojang对整个过程进行了封装,这里的容器被封装为`BufferBuilder`  
这里列出了`public`的函数,并且子类未展示父类函数,去除了所有`Balk`版本,去除了过长的  
`vertex(x, y, z, r, g, b, a, texU, texV, overlayUV, lightmapUV, normalX, normalY, normalZ) void`  
一个函数若同时拥有float/double和int类型的参数的重载,则表明其值范围不同
float/double表明参数需要`标准化/归一化`必须处于0-1,而int一般表明其值位于0-255  
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

可以发现位于继承树顶层的`VertexConsumer`定义了存放了不同功能的顶点数据  
`BufferVertexConsumer`则具体定义了将具体类型的数据存放  
而`BufferBuilder`则是具体的实现者  
这里实现了对于`Render Type` `translucent`的顶点顺序排序  
`setQuadSortOrigin` `getSortState`等还透露了关于`Render Type`中`translucent`的特殊处理

那么我们该如何获取我们想要的`VertexBuilder`呢?

在这节,我们先不引入`RenderType`
直接通过`Tesselator.getInstance().getBuilder()`或者直接使用`BufferBuilder`的构造函数  
在提交数据时候,前者通过`Tesselator#end`,后者需要`BufferBuilder#end`和`BufferUploader.end(buffer)`

## example

<!-- tabs:start -->
#### **by buffer**

```kotlin-s
@Suppress("unused")
@EventBusSubscriber(Dist.CLIENT)
object VertexFillByBuffer {

    private val buffer = BufferBuilder(/*pCapacity*/ 256)

    @SubscribeEvent
    @JvmStatic
    fun renderLevelLastEvent(event: RenderLevelLastEvent) {
        if (Minecraft.getInstance().player!!.mainHandItem.item != Items.DIAMOND_BLOCK) {
            return
        }
        buffer.begin(VertexFormat.Mode.QUADS, DefaultVertexFormat.POSITION_COLOR)
        RenderSystem.setShader(GameRenderer::getPositionColorShader)
        RenderSystem.disableDepthTest()
        RenderSystem.enableBlend()
        RenderSystem.defaultBlendFunc()
        dataFill(event, buffer, Blocks.DIAMOND_BLOCK)
        buffer.end()
        BufferUploader.end(buffer)
        RenderSystem.enableDepthTest()
        RenderSystem.disableBlend()
    }
    
}
```

```java-s
@Suppress("unused")
@EventBusSubscriber(Dist.CLIENT)
class VertexFillByBuffer {

    private static BufferBuilder buffer = new BufferBuilder(/*pCapacity*/ 256);

    @SubscribeEvent
    public static void renderLevelLastEvent(RenderLevelLastEvent event) {
        if (Minecraft.getInstance().player.mainHandItem.item != Items.DIAMOND_BLOCK) {
            return;
        }
        buffer.begin(VertexFormat.Mode.QUADS, DefaultVertexFormat.POSITION_COLOR);
        RenderSystem.setShader(GameRenderer::getPositionColorShader);
        RenderSystem.disableDepthTest();
        RenderSystem.enableBlend();
        RenderSystem.defaultBlendFunc();
        dataFill(event, buffer, Blocks.DIAMOND_BLOCK);
        buffer.end();
        BufferUploader.end(buffer);
        RenderSystem.enableDepthTest();
        RenderSystem.disableBlend();
    }
    
}
```

#### **by tesselator**

```kotlin-s
@Suppress("unused")
@EventBusSubscriber(Dist.CLIENT)
object VertexFillByTesselator {
    @SubscribeEvent
    @JvmStatic
    fun renderLevelLastEvent(event: RenderLevelLastEvent) {
        if (Minecraft.getInstance().player!!.mainHandItem.item != Items.IRON_BLOCK) {
            return
        }
        val tesselator = Tesselator.getInstance()
        val buffer = tesselator.builder
        buffer.begin(VertexFormat.Mode.QUADS, DefaultVertexFormat.POSITION_COLOR)
        RenderSystem.setShader(GameRenderer::getPositionColorShader)
        RenderSystem.disableDepthTest()
        RenderSystem.enableBlend()
        RenderSystem.defaultBlendFunc()
        dataFill(event, buffer, Blocks.IRON_BLOCK)
        tesselator.end()
        RenderSystem.enableDepthTest()
        RenderSystem.disableBlend()
    }
}
```

```java-s
@Suppress("unused")
@EventBusSubscriber(Dist.CLIENT)
class VertexFillByTesselator {
    @SubscribeEvent
    public static void renderLevelLastEvent(RenderLevelLastEvent event) {
        if (Minecraft.getInstance().player.mainHandItem.item != Items.IRON_BLOCK) {
            return;
        }
        var tesselator = Tesselator.getInstance();
        var buffer = tesselator.builder;
        buffer.begin(VertexFormat.Mode.QUADS, DefaultVertexFormat.POSITION_COLOR);
        RenderSystem.setShader(GameRenderer::getPositionColorShader);
        RenderSystem.disableDepthTest();
        RenderSystem.enableBlend();
        RenderSystem.defaultBlendFunc();
        dataFill(event, buffer, Blocks.IRON_BLOCK);
        tesselator.end();
        RenderSystem.enableDepthTest();
        RenderSystem.disableBlend();
    }
}
```

#### **dataFill fun**

```kotlin-s
fun dataFill(event: RenderLevelLastEvent, buffer: VertexConsumer, block:Block) {
    val stack = event.poseStack
    val cameraPos = Minecraft.getInstance().gameRenderer.mainCamera.position
    stack.translate(-cameraPos.x, -cameraPos.y, -cameraPos.z)
    val playerPos = Minecraft.getInstance().player!!.blockPosition()
    val x = playerPos.x
    val y = playerPos.y
    val z = playerPos.z
    val pos = BlockPos.MutableBlockPos()
    for (dx in (x - 15)..(x + 15)) {
        pos.x = dx
        for (dy in (y - 15)..(y + 15)) {
            pos.y = dy
            for (dz in (z - 15)..(z + 15)) {
                pos.z = dz
                val blockState = Minecraft.getInstance().level!!.getBlockState(pos)
                if (blockState.block == block) {
                    stack.pushPose()
                    stack.translate(pos.x.toDouble(), pos.y.toDouble(), pos.z.toDouble())
                    val lastPose = stack.last().pose()

                    buffer.vertex(lastPose, 0f, 0f, 0f).color(1f, 0f, 0f, 0.75f).endVertex()
                    buffer.vertex(lastPose, 0f, 1f, 0f).color(0f, 1f, 0f, 0.75f).endVertex()
                    buffer.vertex(lastPose, 1f, 1f, 0f).color(1f, 1f, 1f, 0.75f).endVertex()
                    buffer.vertex(lastPose, 1f, 0f, 0f).color(1f, 1f, 1f, 0.75f).endVertex()

                    stack.popPose()
                }
            }
        }
    }
}
```

```java-s
public static void dataFill(RenderLevelLastEvent event, VertexConsumer, Block block) {
    var stack = event.poseStack;
    var cameraPos = Minecraft.getInstance().gameRenderer.mainCamera.position;
    stack.translate(-cameraPos.x, -cameraPos.y, -cameraPos.z);
    var playerPos = Minecraft.getInstance().player.blockPosition();
    var x = playerPos.x;
    var y = playerPos.y;
    var z = playerPos.z;
    var pos = BlockPos.MutableBlockPos();
    for (var dx = x - 15; dx < x + 15 ; dx++) {
        pos.x = dx;
        for (var dy = y - 15; dy< y + 15 ; dy++) {
            pos.y = dy;
            for (var dz = z - 15;dz <z + 15); dz++) {
                pos.z = dz;
                var blockState = Minecraft.getInstance().level.getBlockState(pos);
                if (blockState.block == block) {
                    stack.pushPose();
                    stack.translate(pos.x.toDouble(), pos.y.toDouble(), pos.z.toDouble());
                    val lastPose = stack.last().pose();

                    buffer.vertex(lastPose, 0f, 0f, 0f).color(1f, 0f, 0f, 0.75f).endVertex();
                    buffer.vertex(lastPose, 0f, 1f, 0f).color(0f, 1f, 0f, 0.75f).endVertex();
                    buffer.vertex(lastPose, 1f, 1f, 0f).color(1f, 1f, 1f, 0.75f).endVertex();
                    buffer.vertex(lastPose, 1f, 0f, 0f).color(1f, 1f, 1f, 0.75f).endVertex();

                    stack.popPose();
                }
            }
        }
    }
}
```
<!-- tabs:end -->


## VertexFormat.Mode

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

## VertexFormatElement.Type

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

这个`Padding`并不会占用实际的内存,在`BufferBuilder`内,会直接跳过
```java
public void nextElement() {
  ImmutableList<VertexFormatElement> immutablelist = this.format.getElements();
  this.elementIndex = (this.elementIndex + 1) % immutablelist.size();
  this.nextElementByte += this.currentElement.getByteSize();
  VertexFormatElement vertexformatelement = immutablelist.get(this.elementIndex);
  this.currentElement = vertexformatelement;
  if (vertexformatelement.getUsage() == VertexFormatElement.Usage.PADDING) { //!!看这
     this.nextElement();
  }

  if (this.defaultColorSet && this.currentElement.getUsage() == VertexFormatElement.Usage.COLOR) {
     BufferVertexConsumer.super.color(this.defaultR, this.defaultG, this.defaultB, this.defaultA);
  }
}
```

## VertexFormatElement

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

## upload vertex

我们在调用`BufferBuilder`的方法为每个顶点传递顶点数据时,应与后方的定义顺序一致.并在单个顶点所需内容全传递完成后,调用`BufferBuilder#endVertex`

调用`BufferBuilder#end`,将在其内部产生一个`DrawState`,并且存储该次的相关数据`Format`,`VertexCount`,`IndexCount`,`Mode`,`IndexType`,`IndexOnly`
,`SequentialIndex`

调用`BufferUploader.end(BufferBuilder)`,间接调用`BufferUploader.updateVertexSetup(VertexFormat)`  
其内部绑定了当前`Opengl context`的`VertexArrayObject`与`Buffer Object(存储顶点数据)`  
又调用了`glBufferData`与`drawElements`,完成一切的工作

## upload index

至于`Buffer Object(存储顶点索引数据)`则是由`AutoStorageIndexBuffer`完成的

截取自`BufferUploader#_end`
```java
int i = pVertexCount * pFormat.getVertexSize();
if (pSequentialIndex) {
   RenderSystem.AutoStorageIndexBuffer rendersystem$autostorageindexbuffer = RenderSystem.getSequentialBuffer(pMode, pIndexCount);
   int indexBufferName = rendersystem$autostorageindexbuffer.name();
   if (indexBufferName != lastIndexBufferObject) {
      GlStateManager._glBindBuffer(GL_ELEMENT_ARRAY_BUFFER, indexBufferName);
      lastIndexBufferObject = indexBufferName;
   }
} else {
   int indexBufferName = pFormat.getOrCreateIndexBufferObject();
   if (indexBufferName != lastIndexBufferObject) {
      GlStateManager._glBindBuffer(GL_ELEMENT_ARRAY_BUFFER, indexBufferName);
      lastIndexBufferObject = indexBufferName;
   }
   pBuffer.position(i);
   pBuffer.limit(i + pIndexCount * pIndexType.bytes);
   GlStateManager._glBufferData(GL_ELEMENT_ARRAY_BUFFER, pBuffer, GL_DYNAMIC_DRAW);
}
```

上面那块,即if判断为true的时候执行的代码块(pSequentialIndex指的是在bufferBuilder时,有无指定过sortingPoints,没有则为true)

而那段`RenderSystem.getSequentialBuffer(pMode, pIndexCount)`
```java
public static RenderSystem.AutoStorageIndexBuffer getSequentialBuffer(VertexFormat.Mode pFormatMode, int pNeededIndexCount) {
   assertOnRenderThread();
   RenderSystem.AutoStorageIndexBuffer rendersystem$autostorageindexbuffer;
   if (pFormatMode == VertexFormat.Mode.QUADS) {
      rendersystem$autostorageindexbuffer = sharedSequentialQuad;
   } else if (pFormatMode == VertexFormat.Mode.LINES) {
      rendersystem$autostorageindexbuffer = sharedSequentialLines;
   } else {
      rendersystem$autostorageindexbuffer = sharedSequential;
   }

   rendersystem$autostorageindexbuffer.ensureStorage(pNeededIndexCount);
   return rendersystem$autostorageindexbuffer;
}
```
这里可能返回的三个值分别定义为  
```java
private static final RenderSystem.AutoStorageIndexBuffer sharedSequential 
    = new RenderSystem.AutoStorageIndexBuffer(/*pVertexStride*/ 1,/*pIndexStride*/ 1, IntConsumer::accept);
private static final RenderSystem.AutoStorageIndexBuffer sharedSequentialQuad 
    = new RenderSystem.AutoStorageIndexBuffer(4, 6, (IntConsumer pConsumer, int pIndex) -> {
       pConsumer.accept(pIndex + 0);
       pConsumer.accept(pIndex + 1);
       pConsumer.accept(pIndex + 2);
       pConsumer.accept(pIndex + 2);
       pConsumer.accept(pIndex + 3);
       pConsumer.accept(pIndex + 0);
    });
private static final RenderSystem.AutoStorageIndexBuffer sharedSequentialLines 
    = new RenderSystem.AutoStorageIndexBuffer(4, 6,/*pGenerator*/ (pConsumer, pIndex) -> {
       pConsumer.accept(pIndex + 0);
       pConsumer.accept(pIndex + 1);
       pConsumer.accept(pIndex + 2);
       pConsumer.accept(pIndex + 3);
       pConsumer.accept(pIndex + 2);
       pConsumer.accept(pIndex + 1);
    });
```

lambda在这里调用
```java
void ensureStorage(int pNeededIndexCount) {
   if (pNeededIndexCount > this.indexCount) {
      pNeededIndexCount = Mth.roundToward(pNeededIndexCount * 2, this.indexStride);
      RenderSystem.LOGGER.debug("Growing IndexBuffer: Old limit {}, new limit {}.", this.indexCount, pNeededIndexCount);
      if (this.name == 0) {
         this.name = GlStateManager._glGenBuffers();
      }

      VertexFormat.IndexType vertexformat$indextype = VertexFormat.IndexType.least(pNeededIndexCount);
      int i = Mth.roundToward(pNeededIndexCount * vertexformat$indextype.bytes, 4);
      GlStateManager._glBindBuffer(34963, this.name);
      GlStateManager._glBufferData(34963, (long)i, 35048);
      ByteBuffer bytebuffer = GlStateManager._glMapBuffer(34963, 35001);
      if (bytebuffer == null) {
         throw new RuntimeException("Failed to map GL buffer");
      } else {
         this.type = vertexformat$indextype;
         it.unimi.dsi.fastutil.ints.IntConsumer intconsumer = this.intConsumer(bytebuffer);

         for(int j = 0; j < pNeededIndexCount; j += this.indexStride) {
            this.generator.accept(intconsumer, j * this.vertexStride / this.indexStride); //there
         }

         GlStateManager._glUnmapBuffer(34963);
         GlStateManager._glBindBuffer(34963, 0);
         this.indexCount = pNeededIndexCount;
         BufferUploader.invalidateElementArrayBufferBinding();
      }
   }
}
```

`this.indexCount`为该`AutoStorageIndexBuffer`已缓存的`index`数据,只有当有必要,即当前需要提交的  
`Buffer Object(顶点数据)`所需的`index`数量大于已缓存的数量前,才会重新生成,刷新,提交  
所以函数名起`ensure`还算比较恰当?

>[!note]
> 如果你想要手动验证其中的内容  
> 注意数据访问的方式  
> 例如`(0 .. 100 step 2).map { bytebuffer.getShort(it) }`  
> 注意写入的数据类型和读取方式  
> 可查看`AutoStorageIndexBuffer#intConsumer`  

## sort

对于Sorted的`BufferBuilder`,自身在调用`end`时,还会调用`putSortedQuadIndices`  

```java
private void putSortedQuadIndices(VertexFormat.IndexType pIndexType) {
   float[] afloat = new float[this.sortingPoints.length];
   int[] aint = new int[this.sortingPoints.length];

   for(int i = 0; i < this.sortingPoints.length; aint[i] = i++) {
      float f = this.sortingPoints[i].x() - this.sortX;
      float f1 = this.sortingPoints[i].y() - this.sortY;
      float f2 = this.sortingPoints[i].z() - this.sortZ;
      afloat[i] = f * f + f1 * f1 + f2 * f2;
   }

   IntArrays.mergeSort(aint, (p_166784_, p_166785_) -> {
      return Floats.compare(afloat[p_166785_], afloat[p_166784_]);
   });
   IntConsumer intconsumer = this.intConsumer(pIndexType);
   //intConsumer是对自身持有的ByteBuffer的包装,与上文的index相似
   this.buffer.position(this.nextElementByte);

   for(int j : aint) {
      intconsumer.accept(j * this.mode.primitiveStride + 0);
      intconsumer.accept(j * this.mode.primitiveStride + 1);
      intconsumer.accept(j * this.mode.primitiveStride + 2);
      intconsumer.accept(j * this.mode.primitiveStride + 2);
      intconsumer.accept(j * this.mode.primitiveStride + 3);
      intconsumer.accept(j * this.mode.primitiveStride + 0);
   }

}
```
没错,`index`数据与`vertex`数据写入了同一个`ByteBuffer`