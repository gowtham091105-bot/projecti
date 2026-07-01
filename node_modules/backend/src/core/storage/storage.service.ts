import { Injectable, BadRequestException } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class StorageService {
  private uploadDir = path.join(process.cwd(), 'uploads');

  constructor() {
    if (!fs.existsSync(this.uploadDir)) {
      fs.mkdirSync(this.uploadDir, { recursive: true });
    }
  }

  async saveFile(
    fileName: string,
    buffer: Buffer
  ): Promise<{ fileAssetId: string; sizeString: string }> {
    // 1. Validate file type
    const ext = path.extname(fileName).toLowerCase();
    const allowed = ['.pdf', '.png', '.jpg', '.jpeg'];
    if (!allowed.includes(ext)) {
      throw new BadRequestException(`Allowed file types: PDF, PNG, JPG, JPEG. Received: ${ext}`);
    }

    // 2. Validate file size (10MB limit)
    const sizeInMB = buffer.length / (1024 * 1024);
    if (sizeInMB > 10.0) {
      throw new BadRequestException('File size exceeds maximum limit of 10MB.');
    }

    const fileAssetId = 'asset_' + Math.random().toString(36).substr(2, 9);
    const saveName = `${fileAssetId}${ext}`;
    const filePath = path.join(this.uploadDir, saveName);

    await fs.promises.writeFile(filePath, buffer);

    return {
      fileAssetId,
      sizeString: `${sizeInMB.toFixed(2)} MB`,
    };
  }

  async getFilePath(fileAssetId: string, fileName: string): Promise<string> {
    const ext = path.extname(fileName).toLowerCase();
    const saveName = `${fileAssetId}${ext}`;
    const filePath = path.join(this.uploadDir, saveName);
    if (!fs.existsSync(filePath)) {
      throw new BadRequestException('File asset not found on disk.');
    }
    return filePath;
  }
}
