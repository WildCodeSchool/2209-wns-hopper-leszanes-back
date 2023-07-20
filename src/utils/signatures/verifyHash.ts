import fs from "fs";
import crypto from "crypto";

const getHash = (content: string) => {
  const hash = crypto.createHash("md5");
  // passing the data to be hashed
  const data = hash.update(content, "utf-8");
  // Creating the hash in the required format
  const genHash = data.digest("hex");
  return genHash;
};

export const verifyHash = async (
  filePath: string,
  fileHash: string
): Promise<boolean> => {
  const myReadStream = fs.createReadStream(filePath);
  const hash = crypto.createHash("md5");
  hash.setEncoding("hex");
  return new Promise((resolve, reject) => {
    let rContents = ""; // to hold the read contents;
    myReadStream.on("data", (chunk) => {
      rContents += chunk;
    });
    myReadStream.on("error", (err) => reject(err));
    myReadStream.on("end", () => {
      // Calling the getHash() function to get the hash
      const currentHash = getHash(rContents);
      if (currentHash === fileHash) {
        return resolve(true);
      }
      return resolve(false);
    });
  });
};
