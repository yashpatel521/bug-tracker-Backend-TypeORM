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
