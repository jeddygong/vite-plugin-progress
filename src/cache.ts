import fs from 'fs';
import path from 'path';

const dirPath = path.join(process.cwd(), 'node_modules', '.progress');
const filePath = path.join(dirPath, 'index.json');

export interface ICacheData {
    /**
     * Transform all count
     */
    cacheTransformCount: number;

    /**
     * chunk all count
     */
    cacheChunkCount: number
}

/**
 * It has been cached
 * @return boolean
 */
export const isExists = fs.existsSync(filePath) || false;

/**
 * Get cached data
 * @returns ICacheData
 */
export const getCacheData = (): ICacheData => {
    if (!isExists) return {
        cacheTransformCount: 0,
        cacheChunkCount: 0
    };

    return JSON.parse(fs.readFileSync(filePath, 'utf8'));
};

/**
 * Set the data to be cached
 * @returns 
 */
export const setCacheData = (data: ICacheData) => {
    !isExists && fs.mkdirSync(dirPath);
    fs.writeFileSync(filePath, JSON.stringify(data));
};
