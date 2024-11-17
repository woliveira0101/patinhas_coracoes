const fs = require('fs').promises;
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const { uploadToS3, deleteFromS3 } = require('./s3');
const logger = require('./logger');

class StorageService {
  constructor() {
    this.storageType = process.env.STORAGE_TYPE || 'local';
    this.localStoragePath = process.env.LOCAL_STORAGE_PATH || path.join(process.cwd(), 'uploads');
  }

  generateFileName(originalName) {
    // Get file extension
    const ext = path.extname(originalName);
    // Generate a shorter unique ID (first 8 characters of UUID)
    const uniqueId = uuidv4().split('-')[0];
    // Create filename with timestamp prefix for ordering
    const timestamp = new Date().toISOString().split('T')[0].replace(/-/g, '');
    // Combine with a shorter version of the original name (max 20 chars)
    const baseName = path.basename(originalName, ext).substring(0, 20);

    return `${timestamp}-${uniqueId}-${baseName}${ext}`.toLowerCase();
  }

  async saveFile(file) {
    try {
      const fileName = this.generateFileName(file.originalname);

      if (this.storageType === 'local') {
        return await this.saveLocally(file, fileName);
      } else if (this.storageType === 's3') {
        return await this.saveToS3(file, fileName);
      }

      throw new Error('Invalid storage type');
    } catch (error) {
      logger.error('Error saving file:', error);
      throw error;
    }
  }

  async deleteFile(filePath) {
    try {
      if (this.storageType === 'local') {
        await this.deleteLocally(filePath);
      } else if (this.storageType === 's3') {
        await deleteFromS3(filePath);
      }
    } catch (error) {
      logger.error('Error deleting file:', error);
      throw error;
    }
  }

  async saveLocally(file, fileName) {
    try {
      // Ensure uploads directory exists
      await fs.mkdir(this.localStoragePath, { recursive: true });

      const filePath = path.join(this.localStoragePath, fileName);
      await fs.writeFile(filePath, file.buffer);

      // Return only the filename to store in database
      return fileName;
    } catch (error) {
      logger.error('Error saving file locally:', error);
      throw new Error(`Error saving file locally: ${error.message}`);
    }
  }

  async saveToS3(file, fileName) {
    try {
      // Modify the file object to use our generated filename
      const s3File = {
        ...file,
        originalname: fileName,
      };

      const s3Url = await uploadToS3(s3File);

      // Extract and return just the path portion from the S3 URL
      const urlPath = new URL(s3Url).pathname.substring(1);
      return urlPath;
    } catch (error) {
      logger.error('Error saving file to S3:', error);
      throw new Error(`Error saving file to S3: ${error.message}`);
    }
  }

  async deleteLocally(fileName) {
    try {
      const filePath = path.join(this.localStoragePath, fileName);
      await fs.unlink(filePath);
    } catch (error) {
      logger.error('Error deleting local file:', error);
      throw new Error(`Error deleting local file: ${error.message}`);
    }
  }

  getFileUrl(fileName) {
    if (!fileName) return null;

    if (this.storageType === 'local') {
      // For local storage, return the path relative to the uploads directory
      return `/uploads/${fileName}`;
    }

    // For S3, construct the full URL
    const bucket = process.env.AWS_BUCKET_NAME;
    const region = process.env.AWS_REGION;
    return `https://${bucket}.s3.${region}.amazonaws.com/${fileName}`;
  }
}

module.exports = new StorageService();
