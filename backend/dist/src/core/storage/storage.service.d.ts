export declare class StorageService {
    private uploadDir;
    constructor();
    saveFile(fileName: string, buffer: Buffer): Promise<{
        fileAssetId: string;
        sizeString: string;
    }>;
    getFilePath(fileAssetId: string, fileName: string): Promise<string>;
}
