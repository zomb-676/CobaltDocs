# Overview

---

在`net.minecraft.client.Minecraft#runTick`下,仅列出部分逻辑
```mmd
flowchart TB
    begin[Minecraft#runTick]-->gameRender
    subgraph gameRender[GameRender#render]
        direction TB
        viewPoer[set view port] -->
        renderLevel[GameRender#renderLevel] -->
        tryTakeScreen[try take screenshoot]
    end
    gameRender --> toast[render toasts]
    toast --> postRender[post render]
    
```