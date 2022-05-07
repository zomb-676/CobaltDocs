# RenderSystem

---

对应`com.mojang.blaze3d.systems.RenderSystem`  
为`com.mojang.blaze3d.platform.GlStateManager`的封装  

大部分`OpenGL`操作都被封装在内,并且保证线程安全  
同时记录`OpenGL context`减小不必要的状态切换开销 