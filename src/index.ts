import type { PluginOption } from 'vite';
import colors from 'picocolors';
import progress from 'progress';
import rd from 'rd';
import { isExists, getCacheData, setCacheData, ICacheProgress } from './cache';

type Omit<T, K extends keyof T> = Pick<T, Exclude<keyof T, K>>;
type Merge<M, N> = Omit<M, Extract<keyof M, keyof N>> & N;

type PluginOptions = Merge<
    ProgressBar.ProgressBarOptions,
    {
        /**
         * total number of ticks to complete
         * @default 100
         */
        total?: number;

        /**
         * The format of the progress bar
         */
        format?: string;
    }
>;

export default function viteProgressBar(options?: PluginOptions): PluginOption {
    const cacheProgress = getCacheData();

    const progressData: ICacheProgress = cacheProgress || {
        transformed: 0,
        file: 0,
        lastPercent: 0,
        percent: 0,
        total: 0
    };

    let { transformed, file, lastPercent, percent, total } = progressData;

    let bar: progress;
    const stream = options?.stream || process.stderr;
    let outDir: string;

    return {
        name: 'vite-plugin-progress',

        enforce: 'pre',

        apply: 'build',

        config(config, { command }) {
            if (command === 'build') {
                config.logLevel = 'silent';
                outDir = config.build?.outDir || 'dist';

                options = {
                    width: 40,
                    complete: '\u2588',
                    incomplete: '\u2591',
                    ...options
                };
                options.total = options?.total || total || 100;

                const transforming = isExists
                    ? `${colors.magenta(colors.bold('Transforming:'))} :current/:total | `
                    : '';
                const barText = `${colors.cyan(
                    `${colors.bold('[')}:bar${colors.bold(']')}`
                )}`

                const barFormat =
                    options.format ||
                    `${colors.green(colors.bold('Bouilding'))} ${barText} :percent | ${transforming}${colors.blue(colors.bold('Time:'))} :elapseds`;

                delete options.format;
                bar = new progress(barFormat, options as ProgressBar.ProgressBarOptions);
            }
        },

        buildStart() {
            stream.write('\n');
            // initialize
            transformed = file = lastPercent = percent = total = 0;

            // Loop files in src directory
            const readDir = rd.readSync('src');
            const reg = /\.(vue|ts|js|jsx|tsx|css|scss||sass|styl|less)$/gi;
            readDir.forEach((item) => reg.test(item) && (file += 1));
        },

        transform(code, id) {
            const reg = /node_modules/gi;

            if (!reg.test(id) && percent < 0.5) {
                transformed += 1;
                percent = +(transformed / file).toFixed(2);
                percent < 0.8 && (lastPercent = percent);
            }

            if (percent >= 0.5 && lastPercent <= 0.95) {
                lastPercent = +(lastPercent + 0.01).toFixed(2);
                bar.update(lastPercent);
            }

            total += 1;

            return {
                code,
                map: null
            };
        },

        buildEnd() {
            bar.update(1);
            bar.terminate();

            // set cache data
            setCacheData({
                transformed,
                file,
                lastPercent,
                percent,
                total
            });
        },

        closeBundle() {
            stream.write(
                `${colors.cyan(colors.bold(`Build successful. Please see ${outDir} directory`))}`
            );
            stream.write('\n');
            stream.write('\n');
        }
    };
}
