// server.js
const express = require("express");
const fs = require("fs");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;

/* =====================================================
   1️⃣ 基础中间件
===================================================== */

// 允许解析 JSON（fetch / axios 提交用）
app.use(express.json());

// 允许解析表单（HTML form 用）
app.use(express.urlencoded({ extended: true }));

// 静态托管 public 文件夹
app.use(express.static(path.join(__dirname, "public")));

/* =====================================================
   2️⃣ JOIN 表单接口
===================================================== */

// 👉 查看报名数据（调试用）
// 访问：http://localhost:3000/api/join
app.get("/api/join", (req, res) => {
  const filePath = path.join(__dirname, "join-data.json");

  if (!fs.existsSync(filePath)) {
    return res.json([]);
  }

  const data = JSON.parse(fs.readFileSync(filePath, "utf8") || "[]");
  res.json(data);
});

// 👉 提交报名表单
app.post("/api/join", (req, res) => {
  const { contact, reason } = req.body;

  if (!contact) {
    return res.status(400).json({ error: "Contact is required" });
  }

  const entry = {
    contact,
    reason: reason || "",
    createdAt: new Date().toISOString(),
  };

  const filePath = path.join(__dirname, "join-data.json");

  let data = [];
  if (fs.existsSync(filePath)) {
    data = JSON.parse(fs.readFileSync(filePath, "utf8") || "[]");
  }

  data.push(entry);

  fs.writeFileSync(filePath, JSON.stringify(data, null, 2));

  console.log("✅ New join submit:", entry);

  res.json({ ok: true });
});

/* =====================================================
   3️⃣ 启动服务器
===================================================== */

app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});
