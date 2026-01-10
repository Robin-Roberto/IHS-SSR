// server.js
const express = require("express");
const fs = require("fs");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;

// 1. 让服务器可以解析 JSON 请求
app.use(express.json());

// 2. 静态托管 public 文件夹
app.use(express.static(path.join(__dirname, "public")));

// 3. 处理 join 表单提交
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

  // 读取历史数据
  let data = [];
  if (fs.existsSync(filePath)) {
    data = JSON.parse(fs.readFileSync(filePath, "utf8") || "[]");
  }

  // 添加当前记录
  data.push(entry);

  // 写回文件
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2));

  console.log("New join submit:", entry);

  res.json({ ok: true });
});

// 4. 启动 Node 服务器
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
