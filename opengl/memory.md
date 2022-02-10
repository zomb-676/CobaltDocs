# 内存

---

> [!note]
> 如果没有接触过c式的部分内存概念可能会有上手障碍  
> 有相关经验者可直接跳过本章  
> 本章与[LWJGL的介绍](https://github.com\/LWJGL/lwjgl3-wiki/wiki/1.3.-Memory-FAQ)几乎一致

由于lwjgl是一个java库,而glfw是一个c库  
所以lwjgl提供了一些方法让我们能够使用堆外内存

# stack memory

````java
int vbo;
try (MemoryStack stack = stackPush()) {
    IntBuffer ip = stack.callocInt(1);
    glGenBuffers(ip);
    vbo = ip.get(0);
} // stack automatically popped, ip memory automatically reclaimed
````

在kt中,我们可以这样

````kotlin
inline fun memoryStack(function:MemoryStack.()->Unit){
    MemoryStack.stackPush().use {
        function.invoke(it)
    }
}
````

# heap memory (manually)

分配内存  
`ByteBuffer = MemoryUtil.memAlloc(int size)`
以及各式的
`IBuffer=MemoryUtil.memAllocI(int size)`  
I可以代表`int` `long` `short` `double` `float`以及 `point`
用完用`MemoryUtil.memFree(buffer)`释放

当然还有
`MemoryUtil.memRealloc(point,size)`重分配内存  
point可以用  
`MemoryUtil.memAddress(buffer)`拿到  
`buffer memDuplicate(buffer)`复制一份

等等

# heap memory (gc)

`IBuffer BufferUtils.createIBuffer(capacity)`,I与上文类似

这样获取的内存会被GC管理,但是需要两次GC

---

# 总结

| 方法                            | 适用对象    |
|-------------------------------|---------|
| org.lwjgl.system.MemoryStack  | 小且短周期对象 |
| org.lwjgl.system.MemoryUtil   | 生命周期已知  |
| org.lwjgl.BufferUtil          | 生命周期未知  |
