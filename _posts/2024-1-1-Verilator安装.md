---
title: Verilator安装教程
date: 2024-01-01 11:50:00 +0800
categories: [数字电路, Verilator]
tags: [数字电路, Verilog, Verilator, 教程]
image: /assets/img/post_img/数字电路/Verilator安装.png
---
> 以下教程适用于Ubuntu系统
{: .prompt-warning }

## 安装依赖
```shell
sudo apt-get install git help2man perl python3 make autoconf g++ flex bison ccache
sudo apt-get install libgoogle-perftools-dev numactl perl-doc
sudo apt-get install libfl2  # Ubuntu only (ignore if gives error)
sudo apt-get install libfl-dev  # Ubuntu only (ignore if gives error)
sudo apt-get install zlibc zlib1g zlib1g-dev  # Ubuntu only (ignore if gives error)
```

## 获取源码
```shell
git clone -b v5.008 https://github.com/verilator/verilator  # (我需要v5.008版本)
git checkout v{version}  # 获取指定版本的源码（如果有需要)
```
## 编译安装
进入源码目录，执行如下命令：
```shell
autoconf
./configure
make -j <nproc>
sudo make install
```
**注意，`make -j <nporc>`命令中的任务数要根据自己电脑的配置来调整，数量不要超过电脑最大线程数。可以使用'lscpu'查看相关参数**

## 测试安装
执行以下命令：
```shell
verilator --version
```
如果出现了Verilator版本号，说明安装成功。

还可以通过`apt-get install gtkwave`安装GTKWave来查看波形。

