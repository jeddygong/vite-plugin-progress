import type { PluginOption } from 'vite';
import colors from 'picocolors';
import progress from 'progress';
import rd from 'rd';
import { isExists, getCacheData, setCacheData } from './cache';

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

    const { cacheTransformCount, cacheChunkCount } = getCacheData()

    let bar: progress;
    const stream = options?.stream || process.stderr;
    let outDir: string;
    let transformCount = 0
    let chunkCount = 0
    let transformed = 0
    let fileCount = 0
    let lastPercent = 0
    let percent = 0

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
                options.total = options?.total || 100;

                const transforming = isExists ? `${colors.magenta('Transforms:')} :transformCur/:transformTotal | ` : ''
                const chunks = isExists ? `${colors.magenta('Chunks:')} :chunkCur/:chunkTotal | ` : ''
                const barText = `${colors.cyan(`[:bar]`)}`

                const barFormat =
                    options.format ||
                    `${colors.green('Bouilding')} ${barText} :percent | ${transforming}${chunks}Time: :elapseds`

                delete options.format;
                bar = new progress(barFormat, options as ProgressBar.ProgressBarOptions);



                // not cache: Loop files in src directory
                if (!isExists) {
                    const readDir = rd.readSync('src');
                    const reg = /\.(vue|ts|js|jsx|tsx|css|scss||sass|styl|less)$/gi;
                    readDir.forEach((item) => reg.test(item) && fileCount++);
                }
            }
        },

        transform(code, id) {
            transformCount++
            
            // not cache
            if(!isExists) {
                const reg = /node_modules/gi;

                if (!reg.test(id) && percent < 0.25) {
                    transformed++
                    percent = +(transformed / (fileCount * 2)).toFixed(2)
                    percent < 0.8 && (lastPercent = percent)
                  }
          
                if (percent >= 0.25 && lastPercent <= 0.65) {
                    lastPercent = +(lastPercent + 0.001).toFixed(4)
                } 
            }

            // go cache
            if (isExists) runCachedData()
            
            bar.update(lastPercent, {
                transformTotal: cacheTransformCount,
                transformCur: transformCount,
                chunkTotal: cacheChunkCount,
                chunkCur: 0,
            })

            return {
                code,
                map: null
            };
        },

        renderChunk() {
            chunkCount++

            if (lastPercent <= 0.95) 
                isExists ? runCachedData() : (lastPercent = +(lastPercent + 0.005).toFixed(4))

            bar.update(lastPercent, {
                transformTotal: cacheTransformCount,
                transformCur: transformCount,
                chunkTotal: cacheChunkCount,
                chunkCur: chunkCount,
            })

            return null
        },

        closeBundle() {
            // close progress
            bar.update(1)
            bar.terminate()

            // set cache data
            setCacheData({
                cacheTransformCount: transformCount,
                cacheChunkCount: chunkCount,
            })

            // out successful message
            stream.write(
                `${colors.cyan(colors.bold(`Build successful. Please see ${outDir} directory`))}`
            );
            stream.write('\n');
            stream.write('\n');
        }
    };

    /**
     * run cache data of progress
     */
    function runCachedData() {
        
        if (transformCount === 1) {
            stream.write('\n');
            
            bar.tick({
                transformTotal: cacheTransformCount,
                transformCur: transformCount,
                chunkTotal: cacheChunkCount,
                chunkCur: 0,
            })
        }

        transformed++
        percent = lastPercent = +(transformed / (cacheTransformCount + cacheChunkCount)).toFixed(2)
    }
}
