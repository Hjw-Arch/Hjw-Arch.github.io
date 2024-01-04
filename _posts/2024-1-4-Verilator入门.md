---
title: Verilator简单入门
date: 2024-01-04 16:00:00 +0800
categories: [数字电路, Verilator]
tags: [数字电路, Verilog, Verilator, 教程]
---
## Verilator简介
Verilator 是一款开源的支持 **Verilog** 和 **SystemVerilog** 仿真工具。它能够将给定的电路设计翻译成 **C++** 或者 **SystemC** 的库等中间文件，最后使用 **C/C++** 编写激励测试，去调用前面生成的中间文件，由 **C/C++** 编译器编译执行，来完成仿真。此外，它也具有静态代码分析的功能。

## 一个简单的例子
来自[官方网站](https://verilator.org/guide/latest/example_cc.html)
```shell
mkdir test_dir
cd test_dir
```
将以下的**verilog**代码写入文件`top.v`:

```verilog
module top;
    initial begin
	$display("Hello World");
	$finish;
    end
endmodule
```

将以下的**C++**代码写入文件`sim_main.cpp`:

```c++
#include "Vour.h" // Verilator生成的头文件 （此时还未生成)
#include "verilated.h" // Verilator常见的例程
    int main(int argc, char** argv) {
	VerilatedContext* contextp = new VerilatedContext; // 构造 VerilatedContext 来保存模拟时间等
	// 传递参数，以便已验证的代码可以看到它们，例如 $value$plusargs。
	//  在创建任何模型之前，需要调用此函数
	contextp->commandArgs(argc, argv); 

	// 从Verilating生成的Vtop.h构建Verilated模型
	Vour* top = new Vour{contextp};

	while (!contextp->gotFinish()) { 
	    top->eval();  //更新电路状态
	}
	delete top; // 清除模型
	delete contextp;
	return 0;
}
```

使用下面的命令来运行Verilator:

```shell
verilator --cc --exe --build -j 0 -Wall sim_main.cpp our.v
```

**说明**
* --cc：指定将 **Verilog** 代码转化为 **C++** 代码；
* --exe：指定生成目标为可执行文件；
* --build：直接编译生成目标文件；
* -j 0：用机器支持的尽可能多的线程去运行
* -Wall 显示所有警告
* --trace：导出波形文件时需要添加此选项；
* --top-module <top-module>：指定 **Verilog** 顶层模块；
* --Mdir <build-dir>：指定生成文件的目录；
* -CFLAGS <c-flags>：指定一个 GCC 的编译选项；
* -I <include-path>：可以指定一个包含路径。

可以看到`test_dir`目录下出现了目录`obj_dir`，里面包含了一些过程文件，转换后的`cpp`文件，以及`makefile`文件等。
现在可以使用`./obj_dir/Vtop`来运行Verilator生成的可执行程序，出现输出：

```text
Hello World
- top.v:2: Verilog finish
```


## 一个稍复杂的例子（生成波形文件）
### 在**C++**代码中设置跟踪，创建波形文件
创建`top.v`并编写如下代码：

```verilog
module top (
    input a,
    input b,
    output f
);
    assign f = a ^ b;
endmodule
```

创建`main.cpp`并编写如下代码:

```c++
#include <stdio.h>
#include <stdlib.h>
#include <memory.h>
#include <assert.h>
#include "verilated_vcd_c.h" // 生成vcd文件使用
#include "Vtop.h"
#include "verilated.h"

int main (int argc, char **argv) {
    if (false && argc && argv) {}
    const std::unique_ptr<VerilatedContext> contextp{new VerilatedContext};
    std::unique_ptr<Vtop> top{new Vtop{contextp.get()}};
    contextp->commandArgs(argc, argv);
    contextp->traceEverOn(true); // 生成波形文件使用，打开追踪功能
    VerilatedVcdC* ftp = new VerilatedVcdC; // vcd对象指针
    top->trace(ftp, 0); // 0层
    ftp->open("wave.vcd"); //设置输出的文件wave.vcd

    int flag = 0;

    while (!contextp->gotFinish() && ++flag < 20) {
        int a = rand() & 1;
        int b = rand() & 1;
        top->a = a;
        top->b = b;
        top->eval();
        printf("a = %d, b = %d, f = %d\n", a, b, top->f);
        assert(top->f == (a ^ b));

        contextp->timeInc(1); // 时间+1，推动仿真时间
 
        ftp->dump(contextp->time()); // dump wave
    }

    top->final();

    ftp->close(); // 必须有

    return 0;
}
```

使用如下命令：

```shell
verilator --cc --exe --build -Wall --trace top.v main.cpp
```

然后执行`./obj_dir/Vtop`，即可发现vcd文件`wave.vcd`

### 在verilog代码中设置跟踪，创建波形文件
修改上面的**Verilog**代码

```verilog
module top (
    input a,
    input b,
    output f
);
    assign f = a ^ b;

initial begin
      if ($test$plusargs("trace") != 0) begin
         $display("[%0t] Tracing to wave.vcd...\n", $time);
         $dumpfile("wave.vcd");
         $dumpvars();
      end
      $display("[%0t] Model running...\n", $time);
   end

endmodule
```

**C++**代码则改为：

```c++
#include <stdio.h>
#include <stdlib.h>
#include <memory.h>
#include <assert.h>
#include "Vtop.h"
#include "verilated.h"

int main (int argc, char **argv) {
    if (false && argc && argv) {}
    const std::unique_ptr<VerilatedContext> contextp{new VerilatedContext};
    std::unique_ptr<Vtop> top{new Vtop{contextp.get()}};
    contextp->commandArgs(argc, argv);
    contextp->traceEverOn(true); // 生成波形文件使用，打开追踪功能

    int flag = 0;

    while (!contextp->gotFinish() && ++flag < 20) {
        int a = rand() & 1;
        int b = rand() & 1;
        top->a = a;
        top->b = b;
        top->eval();
        printf("a = %d, b = %d, f = %d\n", a, b, top->f);
        assert(top->f == (a ^ b));

        contextp->timeInc(1); // 时间+1，推动仿真时间
    }

    top->final();

    return 0;
}
```

同样使用上述命令：
```shell
verilator --cc --exe --build -Wall --trace top.v main.cpp
```
再次运行可执行文件，即可生成`.vcd`文件，可以gtkwave来查看波形：

```shell
gtkwave wave.vcd
```

END

























