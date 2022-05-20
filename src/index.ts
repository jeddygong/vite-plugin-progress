import type { PluginOption } from 'vite';
import colors from 'picocolors';
import progress from 'progress';
import rd from 'rd';
import { getCacheCode, setCacheCode, ICacheProgress } from './cache';

export default function viteProgressBar(): PluginOption {
    const progressData: ICacheProgress = {
        transformed: 0,
        file: 0,
        lastPercent: 0,
        percent: 0,
        total: 0
    };

    const cacheProgress = getCacheCode();
    console.log(cacheProgress, 'obj');

    const options: ProgressBar.ProgressBarOptions = {
        // curr: , // 当前完成的索引
        total: cacheProgress?.total || 100, // 要完成的总刻度数
        width: 40, // 进度条的显示宽度默认为总
        // stream: , // 默认为 stderr 的输出流
        // head: , // 头字符默认为完整字符
        complete: '\u2588', // 完成默认字符
        incomplete: '\u2591', // 未完成的字符
        renderThrottle: 16 // 更新之间的最短时间（以毫秒为单位）默认为 16
        // clear: true // 完成时清除栏的选项默认为 false
        // callback: // 进度条完成时调用的可选函数
    };

    const bar = new progress(
        `${colors.green(colors.bold('Bouilding'))} ${colors.cyan(
            '[:bar]'
        )} :percent | ${colors.magenta(
            colors.bold('Transforming:')
        )} :current/:total |  ${colors.blue(colors.bold('Time:'))} :elapseds`,
        options
    );

    return {
        name: 'vite-plugin-progress-bar',

        enforce: 'pre',

        apply: 'build',

        config(config, { command }) {
            if (command === 'build') config.logLevel = 'silent';
        },

        buildStart() {
            const readDir = rd.readSync('./src');

            readDir.forEach((item) => {
                if (item.match(/\.(vue|ts|js|jsx|tsx)$/gi)?.length) {
                    progressData.file += 1;
                }
            });
        },

        transform(code, id) {
            if (!id.match(/node_modules/gi)?.length && progressData.percent < 0.5) {

                progressData.transformed += 1;
                progressData.percent = +(progressData.transformed / progressData.file).toFixed(2);
           
                if (progressData.percent < 0.8) progressData.lastPercent = progressData.percent;
               
            }

            if (progressData.percent >= 0.5 && progressData.lastPercent <= 0.95) {
                progressData.lastPercent += 0.01;
                bar.update(progressData.lastPercent);
            }

            progressData.total += 1;

            return code;
        },

        // 在服务器关闭时被调用
        buildEnd() {
            bar.update(1);
            bar.terminate();
            console.log('\n构建结束', 'buildEnd');

            // 缓存数据
            setCacheCode(progressData);

        },

        // 在服务器关闭时被调用
        closeBundle() {
            console.log('\n服务关闭', 'closeBundle');
        }
    };
}
