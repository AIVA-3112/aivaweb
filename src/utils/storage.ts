import { BlobServiceClient } from "@azure/storage-blob";
import { Upload } from "lucide-react";
import { blob } from "stream/consumers";

const AZURE_STORAGE_CONNECTION_STRING = process.env.AZURE_STORAGE_CONNECTION_STRING || "";

if (!AZURE_STORAGE_CONNECTION_STRING) {
  throw new Error("Azure Storage Connection string not found in environment variables.");
}

const blobServiceClient = BlobServiceClient.fromConnectionString(AZURE_STORAGE_CONNECTION_STRING);

// Upload file to container
export async function uploadBlob(containerName: string, blobName: string, content: string) {
  const containerClient = blobServiceClient.getContainerClient(containerName);
  await containerClient.createIfNotExists();
  
  const blockBlobClient = containerClient.getBlockBlobClient(blobName);
  const uploadResponse = await blockBlobClient.upload(content, content.length);
  console.log(`Upload successful. Request ID: ${uploadResponse.requestId}`);
}

// Download file
export async function downloadBlob(containerName: string, blobName: string): Promise<string> {
  const containerClient = blobServiceClient.getContainerClient(containerName);
  const blockBlobClient = containerClient.getBlockBlobClient(blobName);
  
  const downloadResponse = await blockBlobClient.download(0);
  const downloaded = await streamToString(downloadResponse.readableStreamBody!);
  console.log(`Downloaded blob content: ${downloaded}`);
  return downloaded;
}

async function streamToString(readableStream: NodeJS.ReadableStream): Promise<string> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    readableStream.on("data", (data) => chunks.push(data instanceof Buffer ? data : Buffer.from(data)));
    readableStream.on("end", () => resolve(Buffer.concat(chunks).toString("utf8")));
    readableStream.on("error", reject);
  });
}