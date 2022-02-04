# 简要的Kt说明

---

变量声明  
>var mutable_parameter : Type = variable  
>val immutable_parameter : Type = variable  
> : Type可选会自动推断

构造对象  
> java:new XX(p1,p2)  
> kotlin:XX(p1,p2)

lambda
>java:function((p1,(p2,p3)->/*do xxx*/)  
>kotlin:  
> <=>function(p1,{p2,p3->/*do xxx*/})  
> <=>function(p1){p2,p3->/*do xxx*/}
>>特殊  
>>function({p1,p2->/*do xxx*/})<=>function{p1,p2->/*do xxx*/}  
> function{p1->p1.funA()}<=>function{it.funcA()}

解构
>val map = mapOf("A" to 1)  
>val (key , value ) = map.iterator().next()  
>key为"A",value为1