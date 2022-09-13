
# 介绍
[vite-plugin-progress](https://github.com/jeddygong/vite-plugin-progress) 插件是一个在打包时展示进度条的插件，如果您觉得该插件对您的项目有帮助，欢迎 **star ⭐️ 支持一下**，感谢！

<p align="center">
  <img src="demo.gif" width="100%" alt="Logo"/>
</p>

# 用法

1.  **安装**

```bash
 # npm
 npm i vite-plugin-progress -D 

 # yarn 
 yarn add vite-plugin-progress -D

 # pnpm 
 pnpm i vite-plugin-progress -D
```

2.  **使用（不带参数）**：在 `vite.config.js / vite.config.ts` 中配置

```ts
 import progress from 'vite-plugin-progress'

 export default {
   plugins: [
     progress()
   ]
 }
```

3. **参数 0ptions**：
-   `format` ：自定义进度条的格式；
-   `width` ：进度条在终端中的宽度；
-   `complete` ：完成后的默认字符 `\u2588` ；
-   `incomplete` ：未完成的默认字符 `\u2591` ；
-   `renderThrottle` ：间隔更新时间默认16（毫秒）；
-   `clear` ：完成后是否清除终端，默认 false；
-   `callback` ：完成后执行的回调函数；
-   `stream` 终端中的输出格式流，默认 `stderr` ；
-   `head` ：进度条的头字符；
-   `srcDir`：构建文件的目录，默认是 `src`；

4.  参数 options 中的 `format` 中各个标记含义：

-   `:bar` ：代表进度条；
-   `:current` ：当前执行到哪的刻度；
-   `:total` ：总刻度；
-   `:elapsed` ：所用时间（秒）；
-   `:percent` ：完成的百分比；
-   `:eta` ：预计完成时间（秒）；
-   `:rate` ：每一秒的速率；

5.  **使用（带参数）**：
```ts
// vite.config.js / vite.config.ts
import progress from 'vite-plugin-progress'

export default {
  plugins: [
    progress({
        format: 'building [:bar] :percent',
        total: 200,
        width: 60,
        complete: '=',
        incomplete: '',
    })
  ]
}
```
6. **给自定义进度条加点颜色**：
    
    安装 `picocolors` ：

    ```bash
     pnpm i picocolors -D
    ```
    使用：
    ```ts
     // vite.config.js / vite.config.ts
     import progress from 'vite-plugin-progress'
     import colors from 'picocolors'

     export default {
       plugins: [
         progress({
             format:  `${colors.green(colors.bold('Bouilding'))} ${colors.cyan('[:bar]')} :percent`
         })
       ]
     }
    ```
如果您只想使用该插件的话，那么现在就去**安装使用**吧！

如果您对实现思路感兴趣的话，那么您可以点击此处《[为了让vite打包更顺畅，我开发了这个vite插件](https://juejin.cn/post/7110920974379253791)》查阅哟 ~
