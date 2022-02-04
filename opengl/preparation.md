# 准备工作

---

## FAQ

> 为什么从opengl讲起而不是直接从mc的代码入手?  
> mc配上forge已有一层抽象层,难以直接从底层入手

> 为什么用kotlin不用java  
> 用法简洁好用<option>我乐意</option>且内联函数很有用

> 为什么使用imgui,它的作用是什么  
> imgui是一个立即模式的UI编写库,写一些需要交互的操作会很方便

## 参考资料

1. [learnOpenGL CN](https://learnopengl-cn.github.io/)
2. Cherno的opengl教程
    1. [国内搬运](https://www.bilibili.com/video/BV1MJ411u7Bc)
    2. 国外原地址
        1. [opengl](https://www.youtube.com/watch?v=W3gAzLwfIP0)
        2. [Batch Rendering](https://www.youtube.com/watch?v=Th4huqR77rI)
3. [docs.gl](https://docs.gl/)
4. [opengl wiki](https://www.khronos.org/opengl/wiki/)

> [!warning]
> 内容与参考资料相似度可能过高


> [!note]
> 所有上述除learn opengl cn都为英文
> 所有上述都为cpp编写

## 依赖项目

### LWJGL

[lwjgl仓库](https://github.com/LWJGL/lwjgl3)    
本文编写时候lwjgl版本号为3.3.0  
[自定义配置地址](https://www.lwjgl.org/customize)   
下面的runtimeOnly配置不可省,否则ide内运行时会找不到native library

### Imgui

Java的binging在
[官方链接](https://github.com/ocornut/imgui/wiki/Bindings)
上有两个  
本文选择的是   
https://github.com/SpaiR/imgui-java

### Kotlin标准库

[Maven中心仓库](https://mvnrepository.com/artifact/org.jetbrains.kotlin/kotlin-stdlib)

### Kotlin协程库

[Maven中心仓库](https://mvnrepository.com/artifact/org.jetbrains.kotlinx/kotlinx-coroutines-core
)