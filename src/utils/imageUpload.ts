import path from "path";
import fs from "fs";
import { UploadedFile } from "express-fileupload";

export const fileUploader = async (
  file: UploadedFile,
  uploadDir: string
): Promise<string> => {
  try {
    const extension = path.extname(file.name);
    const unquieFileName = Date.now().toString();
    const pathInDB = path.join(
      "uploads/",
      uploadDir,
      unquieFileName + extension
    );
    const uploadPath = path.join(__dirname, "../../", pathInDB);

    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(path.dirname(uploadPath), { recursive: true });
    }

    await file.mv(uploadPath);
    return pathInDB.toString();
  } catch (error) {
    throw new Error("File upload failed");
  }
};

export const deleteFile = async (filePath: string): Promise<void> => {
  try {
    // remove http or https from file path if exists
    if (filePath.startsWith("https://") || filePath.startsWith("http://")) {
      filePath = filePath.replace(/^(https?:\/\/)?/, "").split("/")[1];
    }
    if (!fs.existsSync(filePath)) {
      return; // file does not exist, do nothing
    } else {
      await fs.promises.unlink(filePath);
    }
  } catch (error) {
    throw new Error("File deletion failed");
  }
};
