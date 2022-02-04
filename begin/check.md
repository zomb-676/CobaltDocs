# 开始前的检验
---
下面将有一些常见的java方面的问题  
请确保你知晓其中的绝大多数

好的,让我们开始吧

1. `throw`和`throws`有何区别?

> throw用于抛出异常,出现于代码块中  
> throws用于声明函数会抛出的checked异常

2. Daemon Thread的Daemon指什么

> 即守护线程(后台线程),进程的终止不需要Daemon Thread运行结束

3. Thread类下,start还是run用于启动一个新的线程

> start

4. 请用简写一下代码

````java
Thread Thread = new Thread(new Runnable(){
    @Override
    public void run() {
    //
    }
 });
````

> var Thread = new Thread(() -> {});

5. XXX::new 与 new XXX()有何区别

> XXX::new代表任意构造函数  
> 可能为Supplier<XXX>,Function<A,XXX>,BiFunction<A,B,XXX>或其他
>
> new XXX()只代表调用无参构
> 不太恰当的说,相当于Supplier<XXX>.get()

6. 下列两个函数声明可否共存

````javas
public int FunA(int parameter);
public long FunB(int parameter);
````

> 不可,java在语法层面并不允许返回值重载

7. 下列两个函数声明可否共存

````javas
public String FunA(List<Int> parameter);
public String FunB(List<Boolean> parameter);
````

> 不可,在valhalla落地前,java的泛型会被擦除,例中两者都会被擦除为(Ljava/util/List;)Ljava/lang/String;  
> 且前者的泛型参数Int为原始类型,不可作为   
> 泛型参数,若使用应用其包装类Integer

8.@FunctionalInterface(函数式接口)是什么

> 配合lambda使用,若有  
> 接口  
> @FunctionalInterface  
> Interface I{A invoke(B p);}  
> 函数  
> void Fun(Function<B,A>);  
> void Fun(I);  
> 都可通过  
> Fun((p)->{/**/})调用

