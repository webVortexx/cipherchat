import { BlobServiceClient } from "@azure/storage-blob";
import dotenv from "dotenv";

dotenv.config();

const blobServiceClient = BlobServiceClient.fromConnectionString(
  process.env.AZURE_STORAGE_CONNECTION_STRING
);

export const containerClient = blobServiceClient.getContainerClient(
  process.env.AZURE_CONTAINER_NAME
);
