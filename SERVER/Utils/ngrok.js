import 'dotenv/config';
import { Octokit } from "@octokit/rest";

/**
 * Cập nhật URL Ngrok vào GitHub Repository
 * @param {string} url - URL Ngrok mới
 */
async function updateNgrokURL(url) {
  const octokit = new Octokit({
    auth: process.env.GITHUB_TOKEN
  });

  const owner = 'pntan';
  const repo = 'pntan.github.io';
  const path = 'ngrokServer.json'; // Đường dẫn file bạn muốn lưu trong repo
  
  try {
    // BƯỚC 1: Lấy SHA của file cũ (nếu file đã tồn tại)
    let sha;
    try {
      const { data } = await octokit.repos.getContent({
        owner,
        repo,
        path,
      });
      sha = data.sha;
    } catch (error) {
      // Nếu lỗi 404 nghĩa là file chưa tồn tại -> bỏ qua, sha sẽ là undefined (tạo file mới)
      if (error.status !== 404) throw error;
    }

    // BƯỚC 2: Mã hóa nội dung sang Base64
    // Chúng ta lưu dưới dạng JSON để dễ dàng fetch và parse sau này
    const content = JSON.stringify({ url: url, updatedAt: new Date().toISOString() }, null, 2);
    const contentBase64 = Buffer.from(content).toString('base64');

    // BƯỚC 3: Tạo mới hoặc Cập nhật file
    await octokit.repos.createOrUpdateFileContents({
      owner,
      repo,
      path,
      message: `Update Ngrok URL: ${url}`, // Message commit
      content: contentBase64,
      sha, // Cần thiết nếu cập nhật file cũ
      committer: {
        name: 'Ngrok Bot',
        email: 'bot@example.com'
      },
      author: {
        name: 'Ngrok Bot',
        email: 'bot@example.com'
      }
    });

    console.log(`✅ Đã cập nhật Ngrok URL thành công: ${url}`);
    console.log(`📄 File: https://github.com/${owner}/${repo}/blob/main/${path}`);

  } catch (error) {
    console.error('❌ Lỗi khi cập nhật Ngrok URL:', error.message);
  }
}

// Export hàm để sử dụng ở nơi khác
export { updateNgrokURL };