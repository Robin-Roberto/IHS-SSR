// server.js
const express = require("express");
const path = require("path");
const { Resend } = require("resend");

const app = express();
const PORT = process.env.PORT || 3000;

// 这三个要在本地/Render 配环境变量
const RESEND_API_KEY = process.env.RESEND_API_KEY;
const TO_EMAIL = process.env.TO_EMAIL;     // 你接收报名的邮箱
const FROM_EMAIL = process.env.FROM_EMAIL; // Resend 允许的发件人（必须是你在 Resend 验证过的）

const resend = new Resend(RESEND_API_KEY);

// 解析 JSON
app.use(express.json());

// 静态托管 public 文件夹
app.use(express.static(path.join(__dirname, "public")));

// join 表单：发邮件
app.post("/api/join", async (req, res) => {
  try {
    const { contact, reason } = req.body || {};
    if (!contact || String(contact).trim() === "") {
      return res.status(400).json({ error: "Contact is required" });
    }

    const contactClean = String(contact).trim();
    const reasonClean = reason ? String(reason).trim() : "";
    const createdAt = new Date().toISOString();

    const subject = `New IHS-SSR Join: ${contactClean}`;
    const html = `
      <div style="font-family: Arial, sans-serif; line-height: 1.6;">
        <h2>New Join Application</h2>
        <p><b>Contact:</b> ${escapeHtml(contactClean)}</p>
        <p><b>Reason:</b><br/>${escapeHtml(reasonClean).replace(/\n/g, "<br/>")}</p>
        <p><b>Time:</b> ${createdAt}</p>
      </div>
    `;

    const result = await resend.emails.send({
      from: FROM_EMAIL,
      to: TO_EMAIL,
      subject,
      html,
    });

    console.log("✅ Email sent:", result?.data?.id || result);
    return res.json({ ok: true });
  } catch (err) {
    console.error("❌ /api/join error:", err);
    return res.status(500).json({ error: "Server error" });
  }
});

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
