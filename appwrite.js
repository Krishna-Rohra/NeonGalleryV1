import { Client, Storage, ID, Permission, Role } from "appwrite";

const client = new Client()
  .setEndpoint(import.meta.env.VITE_APPWRITE_ENDPOINT)
  .setProject(import.meta.env.VITE_APPWRITE_PROJECT_ID);

const storage = new Storage(client);

// Upload image with public read permission
export async function uploadImage(file) {
  try {
    const uploaded = await storage.createFile(
      import.meta.env.VITE_APPWRITE_BUCKET_ID,
      ID.unique(),
      file,
      [Permission.read(Role.any())]
    );
    return uploaded;
  } catch (err) {
    console.error("Appwrite upload failed:", err.message, err.code, err.response);
    throw err;
  }
}

// Fetch all files from the bucket
export async function fetchImages() {
  try {
    const res = await storage.listFiles(import.meta.env.VITE_APPWRITE_BUCKET_ID);
    return res.files;
  } catch (err) {
    console.error("Failed to fetch images:", err);
    throw err;
  }
}

// Get image preview URL
export function getImagePreview(id) {
  return `${import.meta.env.VITE_APPWRITE_ENDPOINT}/storage/buckets/${import.meta.env.VITE_APPWRITE_BUCKET_ID}/files/${id}/view?project=${import.meta.env.VITE_APPWRITE_PROJECT_ID}`;
}

// Delete file
export async function deleteImage(id) {
  try {
    return await storage.deleteFile(import.meta.env.VITE_APPWRITE_BUCKET_ID, id);
  } catch (err) {
    console.error("Delete failed:", err.message);
    throw err;
  }
}
