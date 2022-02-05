# 立即模式

---

`GLFW.glfwWindowShouldClose(window)`用于判断窗口是否需要关闭  
与他配套使用的是`GLFW.glfwPollEvents()`,用于处理所有待办事件 
例如窗口移动,调整窗口大小,窗口关闭  
也就是说,如果不调用`glfwPollEvents()`,`glfwWindwosShouldClose(window)`是不会返回的true的

`GL11.glBegin(mode)`和`GL11.glEnd()`成对调用
前者表示开始收集数据,后者表示停止收集

`GL11.glVertex2f(x,y)`和`GL11.glColor3f(r,g,b)`用于提交所谓的顶点数据  
顶点可以理解为空间中点的信息的集合,可以包含坐标,颜色等信息

有了点,又通过`GL11.glBegin(mode)`的mode指定的,就我们就得到了一个个的形状  
这一个个形状称之为`图元(primitive)`,将点变为图元的过程称之为`图元装配(shape assembly)`

绘制好后,我们需要调用GLFW.glfwSwapBuffers(window)  
将绘制好的内容交换到屏幕上显示出来  
因为画面不是一瞬间绘制出来的,通过双缓冲,可以避免图像闪烁

`GL11.glClear(GL11.GL_COLOR_BUFFER_BIT)`会清除画布上的内容
否则就会这样(色块感是因为gif只有256色)
![withoutGlClear](explainImmediateMode/withoutGlClear.gif)


>![!note]
> 有些内容暂且按下不表  
> 为何glVertex2f中传入的参数都在1\~1 (不严格)  
> 为何glColor3f中传入的参数为0\~1

从上我们不难发现绘制的过程可以这样表示,我们需要做的仅仅是其中的第一部分
````mmd
flowchart LR
    收集顶点数据 --> 图元装配 --> 绘制
````
这种绘制的流程称之为**立即模式(Immediate Mode)**
它的优点成为了它的缺点,它太过简单,也太缺乏灵活行(不可配置),我们无法控制其中的其他部分,也缺乏性能  
Stack Over Flow上[有篇](https://stackoverflow.com/questions/6733934/what-does-immediate-mode-mean-in-opengl)
相关内容