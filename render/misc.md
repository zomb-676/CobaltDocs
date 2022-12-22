# misc

用于放置尚未分类的杂项    
单项长度不定  

---

## RenderChunk的缓存问题

`ChunkRenderDispatcher.RenderChunk`存在一个缓存机制,仅在内部变量`dirty`被设置后才会更新  
如果不依赖`BlockState`变化想要使用`BlockColor`会遇到无法即使更新的情况  
对单个方块进行`dirty`标记的方法为`LevelRender#setBlockDirty`如下

```java
public void setBlockDirty(BlockPos pPos, BlockState pOldState, BlockState pNewState) {
   if (this.minecraft.getModelManager().requiresRender(pOldState, pNewState)) {
      this.setBlocksDirty(pPos.getX(), pPos.getY(), pPos.getZ(), pPos.getX(), pPos.getY(), pPos.getZ());
   }
}
```
可以看到判断新旧`BlockState`所需的模型是否相等,在这里我们按照它的调用方式调用  
`setBlocksDirty(int pMinX, int pMinY, int pMinZ, int pMaxX, int pMaxY, int pMaxZ)`  
即可标记`dirty`

同理的还有`dirty` `section`的方法

## ChunkOffset和&15

有时你会看到BlockPos的各个坐标在被提交前,分别都与 15进行了按位&操作  
这是用于每个section的独立渲染,它们会被`ChunkOffset` `uniform`进行修正,其类型为`vec3`  
仅在mc按section渲染时被设置,其余时候各分量为0  

## PoseStack

`translate(double pX, double pY, double pZ)`平移  
`scale(float pX, float pY, float pZ)`缩放  
`mulPose(Quaternion pQuaternion)`用于旋转,其中的四元数可通过  
`Quaternion.fromXYZ/YXZ/XYZ(flaot,float,flaot)`,注意为弧度制  
或者`Vector3f`下的`XN` `XP` `YN` `YP` `ZN` `ZP`,`N/P`为`negative/positive`  
下有方法`rotation/rotationDegrees(float)`,前者为弧度制,后者为角度制  

内部有一个`Deque<PoseStack.Pose>`用于存储存储数据,`push`压入,`pop`弹出,`last`拿到队列顶部元素     
每个`PoseStack.Pose`,内有`Matrix4f`的`pose`,和`Matrix3f`的`normal`  

## Selected Text

glLogicOp使用GL_OR_REVERSE

## Fog in liquid

直接使用`EntityViewRenderEvent.FogColors`
