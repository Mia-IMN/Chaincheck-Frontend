import axios from "axios";

const aggregator = "https://aggregator.walrus-testnet.walrus.space";

export async function downloadBlogContent(blobId: string): Promise<string | null> {
    try {
        const url = `${aggregator}/v1/blobs/${blobId}`;
        const response = await axios.get(url, {
            responseType: "arraybuffer", 
        });

        const content = Buffer.from(response.data).toString("utf-8");
        console.log("Blog content fetched");
        return content;
    } catch (error: any) {
        console.error("Error downloading blog:", error.message);
        return null;
    }
}

// Download and parse blog post
export async function downloadBlogPost(blobId: string): Promise<any | null> {
    try {
        const content = await downloadBlogContent(blobId);
        if (!content) return null;
        
        return JSON.parse(content);
    } catch (error: any) {
        console.error("Error parsing blog post:", error.message);
        return null;
    }
}

// Delete blob from Walrus - Have to fix later (not working)
export async function deleteBlogPost(blobId: string): Promise<boolean> {
    try {
        const url = `${aggregator}/v1/blobs/${blobId}`;
        await axios.delete(url);
        console.log("Blog post deleted");
        return true;
    } catch (error: any) {
        console.error("Error deleting blog post:", error.message);
        return false;
    }
}