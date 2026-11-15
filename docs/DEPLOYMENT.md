# 部署与域名运维手册 (Deployment & Domain Runbook)

> 本文件是站点对外发布方式的**唯一事实来源**。任何关于"网址是什么""换域名要改哪里"的疑问，都请先读这里。

---

## 1. 当前线上状态 (Current Production)

| 项目 | 值 |
| :--- | :--- |
| 对外网址（主） | **https://manchlab.com/** |
| 备用网址（GitHub Pages 默认） | https://cry-aml.github.io/home/ （301 跳转到主域名） |
| GitHub 仓库 | `Cry-AML/home`（**保持此名称，不要改成 `cry-aml.github.io`**） |
| 发布分支 | `hugo` |
| Pages 构建方式 | GitHub Actions 工作流（`.github/workflows/pages.yml`），非 Jekyll 分支模式 |
| 自定义域名 | `manchlab.com`（配置在 GitHub Pages 设置 + 仓库内 `static/CNAME`） |
| 静态资源根路径 | `/`（不是 `/home/`） |

**关键结论**：`baseURL = "https://manchlab.com/"`，因此站内所有资源引用形如
`/css/main.bundle.min.<hash>.css`、`/images/logos/logo-en.webp`。

---

## 2. 为什么没有改仓库名为 `cry-aml.github.io`

GitHub Pages 的两种地址形态：

| 仓库名 | 默认地址 | 静态资源根路径 |
| :--- | :--- | :--- |
| `<org>/<任意>` 例如 `Cry-AML/home` | `https://cry-aml.github.io/home/` | `/home/` |
| `<org>/<org>.github.io` 例如 `Cry-AML/cry-aml.github.io` | `https://cry-aml.github.io/` | `/` |

要做到 `https://cry-aml.github.io/` 根路径，**必须**把仓库改名为 `cry-aml.github.io`；
但那样会与现有的 `manchlab.com` 自定义域名目的重复，而且：

1. 改仓库名后旧地址 `cry-aml.github.io/home/` 不保证永久 301，已有外链会断；
2. 需要额外清空 Pages 自定义域名，否则根地址仍会跳回 `manchlab.com`；
3. 域名对外统一到 `manchlab.com` 更符合学术站点长期品牌（论文、海报、基金申请里的 URL 不会变）。

> 若**将来确实要**迁到 `cry-aml.github.io/` 根路径，见第 7 节步骤。

---

## 3. 修改 baseURL 只需要动一处

**唯一需要修改的文件：**

```
config/_default/hugo.toml
    baseURL = "https://manchlab.com/"
```

所有检查脚本已改为**从 `hugo.toml` 自动推导路径前缀**，不再硬编码任何域名：

| 文件 | 作用 |
| :--- | :--- |
| `tools/_baseurl.py` | 解析 `baseURL` → 导出 `SITE` / `BASE` / `ORIGIN` |
| `tools/get-base.py` | 供 shell 脚本调用，打印路径前缀（`/` 或 `/home/`） |
| `tools/link-audit.py` | 使用 `BASE` / `ORIGIN` 做链接与 HTTP 校验 |
| `tools/linkcheck.py` | 使用 `BASE` / `ORIGIN` 做离线链接校验 |
| `tools/check-en-no-cjk.py` | 用 `BASE` 拼正则，扫描英文页引用的 JS |
| `docs/verify-hugo.sh` | `BASE="$(python3 tools/get-base.py)"` 后断言全部带 `$BASE` |
| `assets/js/festival.js` | 从 `<img src>` 反推前缀，无硬编码 |

验证方式：

```bash
python3 tools/get-base.py     # 打印当前前缀
```

---

## 4. 从 `/home/` 子路径迁移到根域名时踩过的坑（重要教训）

**现象**：自定义域名配好后，`https://manchlab.com/` 返回的 HTML 里资源仍是
`/home/css/...`，导致 CSS/JS/图片全部 **404**，页面裸奔无样式。

**根因**：只配了 Pages 自定义域名，**没有同步修改 `baseURL`**。
Hugo 生成的绝对路径来自 `baseURL`，与 Pages 域名设置彼此独立。

**正确顺序**（缺一不可）：

1. 改 `config/_default/hugo.toml` 的 `baseURL`；
2. 确认 `static/CNAME` 内容 = 自定义域名（Hugo 会复制到 `public/CNAME`）；
3. 推送 `hugo` 分支，等 Actions 重新构建部署；
4. 部署后**立即验证资源**：
   ```bash
   curl -s https://manchlab.com/ | grep -o 'href=/css/[^"]*' | head -1
   # 期望：href=/css/main.bundle.min.<hash>.css
   # 若出现 /home/css/ 说明 baseURL 没生效或缓存未更新
   ```

---

## 5. GitHub Pages 侧配置清单

### 5.1 仓库设置

| 设置项 | 值 |
| :--- | :--- |
| Settings → Pages → Source | **GitHub Actions** |
| Settings → Pages → Custom domain | `manchlab.com` |
| Settings → Pages → Enforce HTTPS | 建议开启（见 5.3 说明） |

### 5.2 DNS（在域名注册商 / Cloudflare 处）

| 类型 | 名称 | 值 |
| :--- | :--- | :--- |
| A | `@` | `185.199.108.153` |
| A | `@` | `185.199.109.153` |
| A | `@` | `185.199.110.153` |
| A | `@` | `185.199.111.153` |
| CNAME | `www` | `cry-aml.github.io` |

> 若使用 Cloudflare，务必把记录设为 **DNS only（灰云）**，
> 否则 GitHub 无法签发 Let's Encrypt 证书。

### 5.3 HTTPS 证书

- 添加自定义域名后，GitHub 会自动申请 Let's Encrypt 证书，状态经
  `new` → `approved` 通常需几分钟到数小时。
- 查询：
  ```bash
  gh api repos/Cry-AML/home/pages --jq '{cname, https_enforced, cert: .https_certificate.state}'
  ```
- **若 `https_enforced` 无法通过 API 打开**（返回 `Toggling https is disabled`），
  这是 GitHub 的 API 限制，请到网页操作：
  `Settings → Pages → Custom domain` 勾选 **Enforce HTTPS**。
- 证书签发完成前，`https://` 可能显示证书告警，属正常过渡状态。

---

## 6. 发布流程 (Release)

```bash
# 1. 全量门禁（233 项）
python3 tools/check-css-dupes.py && \
python3 tools/check-themes.py && \
python3 tools/check-portrait-scale.py && \
python3 tools/check-team-census.py && \
python3 tools/check-en-no-cjk.py && \
python3 tools/check-mailto.py && \
bash docs/verify-hugo.sh

# 2. 链接完整性
python3 tools/link-audit.py

# 3. 推送（Actions 自动构建部署）
git push origin hugo

# 4. 等待并确认部署结果
gh run list --branch hugo --limit 1

# 5. 上线后抽查
curl -sI https://manchlab.com/ | head -1
curl -s -o /dev/null -w "%{http_code}\n" https://manchlab.com/images/logos/logo-en.webp
```

**部署耗时**：通常 40–60 秒；Cloudflare CDN 缓存为 600 秒（`max-age=600`）。

---

## 7. 附：若将来要迁到 `cry-aml.github.io/` 根路径

1. GitHub 仓库改名：`Cry-AML/home` → `Cry-AML/cry-aml.github.io`；
2. `config/_default/hugo.toml`：`baseURL = "https://cry-aml.github.io/"`；
3. `static/CNAME`：**删除该文件**（或改成空的），并清空 Pages 的自定义域名；
4. 运行 `python3 tools/get-base.py` 应输出 `/`（脚本自动适配，无需改动）；
5. 全量门禁 + `link-audit.py` 通过后推送；
6. 旧地址 `cry-aml.github.io/home/` 需自行准备跳转（GitHub 不保证）。

---

## 8. 常见故障速查

| 症状 | 原因 | 处理 |
| :--- | :--- | :--- |
| 页面无样式、控制台 CSS 404 | `baseURL` 与当前域名不匹配 | 改 `baseURL` → 重新构建部署 |
| `manchlab.com` 打开是 404 | `public/CNAME` 丢失或 Pages 未绑定域名 | 检查 `static/CNAME`、Pages 设置 |
| `https://` 证书告警 | Let's Encrypt 尚在签发 | 等待，或确认 DNS 未开代理（灰云） |
| 访问 `cry-aml.github.io/home/` 跳到自定义域名 | Pages 已绑定自定义域名（预期行为） | 无需处理 |
| 资源路径出现 `/home/` | 旧构建缓存或 `baseURL` 未更新 | 清 `public/ resources/` 后重构建 |
