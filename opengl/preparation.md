# 准备工作

---
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