import axios from "axios";

const publisher = "https://publisher.walrus-testnet.walrus.space";

// Pass blog content as a string (can include HTML, markdown, or embedded base64 images)
export async function uploadBlogContent(
  content: string,
  epochs: number = 5
): Promise<string | null> {
  try {
    const url = `${publisher}/v1/blobs?epochs=${epochs}`;

    const encoder = new TextEncoder();
    const contentBuffer = encoder.encode(content);

    const response = await axios.put(url, contentBuffer, {
      headers: {
        "Content-Type": "application/octet-stream",
      },
    });

    // Adjusted blob_id extraction:
    if (!response.data?.newlyCreated?.blobObject?.blobId) {
      console.error(
        "❌ Malformed response from Walrus:",
        JSON.stringify(response.data, null, 2)
      );
      return null;
    }

    const blobId = response.data.newlyCreated.blobObject.blobId;
    console.log("✅ Uploaded blog. Blob ID:", blobId);
    return blobId;
  } catch (error: any) {
    console.error(
      "❌ Error uploading blog:",
      error?.response?.data || error.message
    );
    return null;
  }
}

// Upload blog metadata and content together
export async function uploadBlogPost(
  blogData: {
    title: string;
    content: string;
    author: string;
    excerpt: string;
    category: string;
    image?: string;
    acceptDonation?: boolean;
  },
  epochs: number = 5
): Promise<string | null> {
  try {
    const blogPost = {
      ...blogData,
      publishedAt: new Date().toISOString(),
      readTime: Math.ceil(blogData.content.length / 1000) + " min read", // Rough estimate
    };

    const content = JSON.stringify(blogPost);
    return await uploadBlogContent(content, epochs);
  } catch (error: any) {
    console.error(
      "❌ Error uploading blog post:",
      error?.response?.data || error.message
    );
    return null;
  }
}
