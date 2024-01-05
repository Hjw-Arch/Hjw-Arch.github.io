---
title: Makefile入门教程
date: 2024-01-05 20:20:00 +0800
categories: [计算机系统基础]
tags: [计算机系统基础, Makefile, 教程]
---

## Makefile是什么

Makefile 是一种自动化构建脚本，其包含若干目标和对应的依赖和构建规则。 只需要在 Makefile 的目录下执行如下命令：
```shell
make <target>
```
make就会根据Makefile中对应的目标依赖和构建规则一步一步构建出我们需要的目标。

## Makefile的规则
### 规则的形式
一个Makefile脚本文件的主体是规则。每条规则的形式如下：
```makefile
<target>: <prerequisites>
<tab><command>
<tab>Mcommand>
...
```
其中，各占位符的含义如下：
* **`target`**：需要构建的目标，可以是可执行文件，也可以是一个标签，用来指定一系列命令；
* **`prerequisites`**：生成目标所依赖的文件或目标。**如果依赖没有满足，那么会根据依赖项的构建规则去生成依赖项，然后再去生成目标**；
* **`command`**：是一个`shell`命令，每条规则可以有多条命令。**每条命令占一行。如果同一行有多条命令，那么需要使用`&&`分隔**；
* **`tab`**：`Makefile`规则的命令必须以`tab`字符开始。

一个Makefile规则实例：
```makefile
main.o : main.c
	gcc -c main.c -o main.o
```
这个规则表示：`main.o`依赖于`main.c`，若依赖满足，则执行`gcc -c main.c -o main.o`

### 使用通配符的规则
`Makefile`中使用**`%`**作为目标中的通配符。
例如：
```makefile
%.o : %.c
	gcc -c $< -o $@
```
这样的`makefile`规则就指定，对于`.o`作为后缀的目标文件，使用此条规则构建，所需要的依赖为同名的、以`.c`作为后缀名的文件。规则中的`$<`和`$@`是`Makefile`中的自动变量。  
通配符可以使我们不用关心具体的文件名，对同一类目标执行相同的构建命令。  
> 若要对同一类中的某一个目标执行不同的命令，也可书写一条新的规则，这条规则有着更高的优先级。例如：
```makefile
%.echo:
    @echo Hello, foo!

bar.echo:
    @echo Hello, bar!
```
执行`make foo.echo`和`make bar.echo`的输出是不同的：
```shell
$ make foo.echo
Hello, foo!
$ make bar.echo
Hello, bar!
```
{: .prompt-tip }

## Makefile的变量
### 变量的定义
`Makefile`中的变量可以用于存放命令、选项、文件名等。变量的定义格式如下：
```makefile
<var-name> <assignment> <var-value>
```
各占位符含义如下：
* **`var-name`**：变量名，可以由字符、数字和下划线组成，**但不能以数字开头**。
* **`assignment`**：赋值运算符
* **`var-value`**：变量名，可以由任意字符组成，如果变量值中包含了空格，那么需要用引用将变量值括起来。
其中，变量名与赋值运算符、赋值运算符与变量值之间可以有若干空格。

### 变量的使用

变量使用的格式有两种：
```makefile
$(<var-name>)
${<var-name>}
```
这两种格式的效果完全一致。

### 实例
下面给出一个使用`gcc`工具的Makefile使用示例：
```makefile
CC = gcc
CFLAGS = -Wall -g
MAIN_OBJS = main.o
$(MAIN_OBJS) : main.c
    $(CC) $(CFLAGS) -c main.c -o $(MAIN_OBJS)
```
这个 Makefile 中定义了两个变量 CC 和 CFLAGS，然后在目标规则中使用了这两个变量。 这样做的好处是，如果我们需要更换编译器或者编译选项，那么只需要修改变量的值即可，而不需要修改目标规则。 在多个目标规则共用同一编译策略的情况下其优势会进一步凸显。

> Makefile 中所有的变量本质上都是字符串，即使使用了整型或其它类型字面量对其赋值，其仍然会被当作字符串存储。 例如，使用如下方式定义一个 STRING 变量：
```makefile
STRING := "This is a string"
```
这`STRING`中的值为`"This is a string"`而不是`This is a string`。
{: .prompt-info }

> 请注意：在定义变量和赋值时，`Makefile`会裁剪掉运算符后面，变量前面的空格，但行尾的空格并不会被裁掉。
{: .prompt-warning }

## Makefile变量的赋值

`Makefile`中的赋值运算符有四种，分别是`=`、`:=`、`?=`和`+=`。其中`=`、`:=`、`?=`是覆盖变量值的赋值运算符，而`+=`则是用于给变量追加值的赋值运算符。  
此外，也可以在命令中指定环境变量和参数变量的值。

### `=`赋值运算符
`=`赋值运算符是最常用的赋值运算符，它的格式如下：
```makefile
<var-name> = <var-value>
```
这个赋值会在`Makefile`全部展开后进行，对于同一个变量的多次`=`运算会使得其值为最后一次所赋值的值。例如：
```makefile
CC = gcc
CC2 = $(CC)
CC = g++
```
这里的`CC2`的值为**`g++`**，而不是`gcc`。因为`CC2`的赋值运算时在`Makefile`全部展开后进行的，此时的`CC`值为`g++`。

### `:=`赋值运算符
`:=`赋值运算符的格式如下：
```makefile
<var-name> := <var-value>
```
这个赋值和其在`Makefile`中的位置有关，比较符合一边的赋值逻辑。例如：
```Makefile
CC := gcc
CC2 := $(CC)
CC := g++
```
`CC2`的赋值是在`Makefile`展开到当前时进行的，而此时的`CC`的值为`gcc`，故`CC2`被赋值为`gcc`。

### `?=`赋值运算符
`?=`赋值运算符的格式如下：
```makefile
<var-name> ?= <var-value>
```
这个赋值运算的特点是：如果变量已经被赋值，那么就不会被重复赋值。稍微有点类似`C`语言中的`const`。  
例如：
```makefile
CC ?= gcc
CC ?= g++
```
这里的第一条赋值会覆盖第二条赋值语句，最终`CC`的值为`gcc`。

### `+=`赋值运算符
`+=`赋值运算符的格式如下：
```makefile
<var-name> += <var-value>
```
这个赋值会将新的值拼接到旧值的后面，并在中间补空格。例如：
```makefile
CC = gcc
CC += -Wall
```
则`CC`的值为`gcc -Wall`。

### 在命令行中对环境变量和参数变量赋值
在命令行中对环境变量值的设定格式如下：
```shell
<env-var>=<value> make
```
与之相对地，设定参数变量值的格式如下：
```shell
make <arg-var>=<value>
```
例如，对于下面的`Makefile`：
```
all:
    @echo Hello, $(ENV-VAR) and $(ARG_VAR)!
```
在其所在目录下执行下列命令：
```shell
ENV-VAR=foo make ARG-VAR=bar
```
会输出：
```shell
Hello, foo and bar!
```
> 值得注意的是，在命令行中设定环境变量或参数变量的值时，若所赋的值中包含空格，则需要使用 `"` 包裹。
{: .prompt-info }

> 咋一看，环境变量和参数变量是完全一样的，只是在执行时处在命令的不同位置。 事实上，它们还是有一定的区别：两者的覆盖性不同。
例如以下的 Makefile：

```makefile
VAR := foo

all:
    @echo Hello, $(VAR)!
```

使用环境变量和使用参数变量对 VAR 赋值，输出的结果是不同的：

```shell
$ VAR=bar make
Hello, foo!
$ make VAR=bar
Hello, bar!
```

总体来说，可以将各种赋值方式按照覆盖性从高到低的顺序排列如下：  
参数变量赋值 > `=`/`:=`/`+=` 赋值 > 环境变量赋值 > `?=` 赋值  
通常的做法是，将需要使用命令行传入的参数使用 `?=` 赋值，并在命令行中使用环境变量修改为所需的值。
{: .prompt-tip }

## Makefile中的自动变量
为了简便地书写规则，Makefile提供了一些自动变量，常用的有`$#`、`$*`、`$<`、`$^`和`$?`。
### `$@`
`$@`表示构建目标，例如：

```makefile
main.o: main.c
    gcc -c main.c -o $@
```

此处的`$@`就表示`main.o`。

### `$*`

`$*`表示构建目标去掉后缀的部分，例如：
```makefile
main.o : main.c
	gcc -c $* -o $@
```
此处`$*`就表示`main.o`去掉后缀`.o`的部分，即`main`。

### `$<`

`$<`表示第一个依赖文件，例如
```makefile
main : main.o func.o
	gcc $< -o main
```
此处`$<`就表示第一个依赖文件，即`main.o`。

### `$^`

`$^`表示所有的依赖文件，例如：

```makefile
main : main.o func.o
	gcc $^ -o main
```
这里的`$^`就表示所有的依赖文件，即`main.o`和`func.o`。

### `$?`

`$?`表示比目标文件更新的所有依赖文件，例如：
```makefile
main : main.o func.o
	gcc $? -o main
```
这里的`$?`就表示比目标文件`main`更新的所有依赖文件。如`main.o`或者`func.o`比`main`的更新，则会被包含在`$?`中。

## Makefile函数
`Makefile`中的函数提供了丰富多样的功能，函数的格式如下：
```makefile
$(<func-name> <arg1>, <arg2>, ...)
```
其中，函数名和第一个参数之间用空格分隔，参数之间使用逗号分隔。   
下面将介绍一些 Makefile 中常用的函数：

### `abspath`函数
`abspath`函数用于取绝对路径，例如：

```makefile
BUILD_DIR := $(abspath ./build)
```

这里的`$(abspath ./build)`表示取`./build`的绝对路径。这个函数的主要用途是避免在不同位置使用同一个 Makefile 时，找不到目录或文件的问题。

### `addprefix`函数

`addprefix`函数用于给一系列字符串添加前缀，例如：
```makefile
OBJS := main.o func.o
BUILD_DIR := ./build
BUILD_OBJS := $(addprefix $(BUILD_DIR)/, $(OBJS))
```

这里的 `$(addprefix $(BUILD_DIR)/, $(OBJS))` 表示给`OBJS`中的每个字符串都添加前缀 `$(BUILD_DIR)/`，结果为 `./build/main.o ./build/func.o`。

### `addsuffix`函数
`addsuffix`函数用于给一系列字符串添加后缀，例如：
```makefile
OBJS := main func
BUILD_OBJS := $(addsuffix .o, $(OBJS))
```
这里的 `$(addsuffix .o, $(OBJS))` 表示给`OBJS`中的每个字符串都添加后缀 `.o`，结果为 `main.o func.o`。

### `basename`函数

`basename`函数用于去掉文件名中的后缀名，例如：
```makefile
OBJS = ./build/main.o ./build/func.o
BASE_OBJS = $(basename $(OBJS))
```

这里的 `$(basename $(OBJS))` 表示去除 `OBJS` 中每个文件名的后缀名，结果为 `./build/main ./build/func`。

### `dir`函数

`dir`函数用于获取文件名的目录部分，例如：
```makefile
OBJS = ./build/main.o ./build/func.o
DIR_OBJS = $(dir $(OBJS))
```

这里的 `$(dir $(OBJS))` 表示获取 `OBJS` 中每个字符串的目录部分，即 `./build/ ./build/`。

`nodir`函数

`nodir`函数用于获取文件名中非目录部分，例如：

```makefile
OBJS = ./build/main.o ./build/func.o
NOTDIR_OBJS = $(notdir $(OBJS))
```
这里的 `$(notdir \$(OBJS))` 表示获取 `OBJS` 中每个字符串的非目录部分，即 `main.o func.o`。

### `shell`函数
`shell`函数用于执行Shell命令，例如：

```shell
CWD = $(shell pwd)
```

这里的 `$(shell pwd)` 表示执行 `pwd` 命令，其结果为 `pwd` 命令输出的当前工作目录。

### `wildcard`函数

`wildcard`函数用于获取符合通配符的所有文件，例如：
```makefile
CFILES = $(wildcard *.c)
```

这里的  `$(wildcard *.c)` 表示获取当前目录下的所有后缀名为 `.c` 的文件。

## Makefile的条件分支
我们可以使用`ifeq`、`ifneq`、`ifdef`等关键字来控制`Makefile`的条件分支，例如：
```makefile
ifeq ($(CC), gcc)
    LIBS = $(LIBS_FOR_GCC)
else
    LIBS = $(NORMAL_LIBS)
endif
```

此处的 `ifeq (\$(CC), gcc)` 表示如果 `CC` 的值等于 `gcc`，那么就执行此分支的语句，否则执行 `else` 分支的语句。 与 `C` 语言不同的是，我们需要使用 `endif` 表示结束 `if` 语句。

## Makefile的互相包含

Makefile 可以互相包含，这样可以将一些常用的规则写在一个 Makefile 中，然后在其他 Makefile 中包含这个 Makefile，以提升代码的复用性。Makefile 的包含格式如下：
```makefile
include <file-path>
```

需要注意的是，`include` 命令会将被包含的 `Makefile` 在当前位置完全展开。 可以利用这个性质在 `Makefile` 使用一些没有定义的变量，而将其定义放在需要包含此 `Makefile` 的别的 `Makefile` 中相应的 `include` 命令前。 例如：
```makefile
CC = gcc
include compile.mk
```

这样一来，`compile.mk` 中就可以直接使用此 `Makefile` 中的 `CC` 变量了。

## Makefile的运行

Makefile 可以用 make 命令运行。make 命令的格式如下：
```shell
[<env-vars>] make [<arg-vars>] [<options>] [<target>]
```

环境变量、参数变量、构建选项、目标都是可选的。 **当没有目标时，通常会自动构建 `Makefile` 中的第一个目标**。

常用的构建选项有：  

* `-f <file-path>`：指定 `Makefile` 文件。如果不指定，则默认使用当前目录下的 `Makefile` 文件；
* `-C <directory>`：指定 `Makefile` 工作目录。此操作会相当于先将工作目录转移至目标目录，执行 `make`，再回到当前目录；
* `-s`：静默模式，不输出 `Makefile` 规则中的命令；
* `-n`：只输出要执行的命令，但是不执行。
* `-B`：强制执行所有的目标。
* `-j <nproc>`：指定并行执行的任务数。

> 在不加 -s 选项时，构建 `Makefile` 中的目标时会将执行的命令也输出到命令行，这样会导致输出信息过多。 如果想要禁用此输出，可以在 `Makefile` 的目标规则的命令前添加一个 `@`，例如对于如下的 `Makefile`：
```makefile
foo:
    echo Hello, world!

bar:
    @echo Hello, world!
```

执行 `make foo` 与执行 `make bar` 会有不同的输出：

```shell
$ make foo
echo Hello, world!
Hello, world!
$ make bar
Hello, world!
```

前者输出了所执行的 `echo` 命令，而后者则没有输出。

{: .prompt-tip }