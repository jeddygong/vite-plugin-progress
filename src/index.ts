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

    const options: ProgressBar.ProgressBarOptions = {
        total: cacheProgress?.total || 100,
        width: 40,
        complete: '\u2588',
        incomplete: '\u2591',
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
            process.stderr.write('\n');

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

        buildEnd() {
            bar.update(1);
            bar.terminate();

            // set cache
            setCacheCode(progressData);

        },

        closeBundle() {
            console.log(
                `${colors.cyan(colors.bold('Build successful. Please see dist directory'))} \n`
            );
        }
    };
}
