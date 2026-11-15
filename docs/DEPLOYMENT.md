# 部署与域名运维手册 (Deployment & Domain Runbook)

> 本文件是站点对外发布方式的**唯一事实来源**。任何关于"网址是什么""换域名要改哪里"的疑问，都请先读这里。

---

## 1. 当前线上状态 (Current Production)

| 项目 | 值 |
| :--- | :--- |
| 对外网址（主） | **https://manchlab.com/** |
| HTTPS | 已启用（Let's Encrypt，`cert: approved`，到期 2027-02-13，自动续签） |
| Enforce HTTPS | 已开启（`https_enforced: true`） |
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

> **签发期间**必须设为 **DNS only（灰云）**，否则 GitHub 无法签发 Let's Encrypt 证书。
> 证书 `approved` 之后可以切回橙云（Proxied），但 SSL/TLS 模式必须是 **Full**。
>
> Cloudflare 默认会为 apex 同时下发 AAAA（`2606:4700::/32`，橙云代理地址）。
> 灰云切换后若 AAAA 变为 `2606:50c0::/32`（GitHub 官方 IPv6 段）即为正常，**不阻塞签发**；
> 但若仍残留 `2606:4700::` 说明代理未完全关闭。

### 5.3 HTTPS 证书

- 添加自定义域名后，GitHub 会自动申请 Let's Encrypt 证书，状态经
  `new` → `approved` 通常需几分钟到数小时。
- 查询：
  ```bash
  gh api repos/Cry-AML/home/pages --jq '{cname, https_enforced, cert: .https_certificate.state}'
  ```
- **`https_enforced` 的两种失败信息含义不同**：
  | 返回 | 含义 | 处理 |
  | :--- | :--- | :--- |
  | `Unavailable for your site because a certificate has not yet been issued` | 证书还没签发 | 等签发完成（或见第 8 节重触发） |
  | `Toggling https is disabled` | 该入口被 GitHub 限制 | 到网页 `Settings → Pages` 勾选 Enforce HTTPS |
- 证书签发完成前，`https://` 会返回 `000` 并伴随证书告警，属正常过渡状态。
- 证书有效期 90 天，GitHub 在到期前 30 天自动续签；无需人工干预。
  可用 `gh api repos/Cry-AML/home/pages --jq .https_certificate.expires_at` 查看。

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

## 8. TLS 证书签发实录（2026-11-15）

本次从 Cloudflare 橙云切换到灰云并签发 GitHub Pages 证书的完整过程，供以后复现参考。

### 8.1 时间线

| 时刻 (UTC) | 事件 | `cert` 状态 |
| :--- | :--- | :--- |
| 03:54 | 首次添加自定义域名，GitHub 发起 Let's Encrypt 申请 | `new` |
| ~05:00 | 用户改为灰云（DNS only），A 记录指向 GitHub 官方 IP | `new` |
| 05:37 | 确认 A 记录 ✅、CAA 无阻塞、AAAA 属 GitHub 官方 IPv6 段 | `new` |
| 05:40 | 重新 `PUT pages -f cname=manchlab.com` 触发重新校验 | `new` |
| 05:53 | 轮询 **12 分钟无进展** —— 判定流程卡死 | `new` |
| ~06:00 | 网页端显示 3 步进度："Certificate Requested" | `new` |
| 06:02 | 轮询第 2 轮：证书 **approved** | **`approved`** |
| 06:03 | HTTPS 实测 200 + `ssl_verify_result=0` | `approved` |
| 06:04 | 开启 `Enforce HTTPS` → 成功 | `approved`, enforced |

最终证书：

```
subject  CN=manchlab.com
issuer   Let's Encrypt
notAfter Feb 13 04:59:41 2027 GMT
SAN      DNS:manchlab.com          ← 不含 www
```

### 8.2 关键判定：`cert: new` 卡住时的排查顺序

按以下顺序逐项排除，**每一项都给出可复制命令**：

```bash
# 1) 证书状态
gh api repos/Cry-AML/home/pages --jq '{cname, cert: .https_certificate.state, enforced: .https_enforced}'

# 2) A 记录必须全部是 GitHub 官方 IP（185.199.108-111.153）
curl -s "https://dns.google/resolve?name=manchlab.com&type=A" | python3 -m json.tool | grep data

# 3) 是否仍有 Cloudflare 代理（橙云）残留
curl -sI https://manchlab.com/ | grep -iE "^(server|cf-ray):"
#   server: cloudflare + 有 cf-ray  → 仍在代理，证书签发会被干扰

# 4) AAAA 记录（GitHub 官方 IPv6 段 2606:50c0::/32 是正常的，不阻塞）
curl -s "https://dns.google/resolve?name=manchlab.com&type=AAAA" | python3 -m json.tool | grep data

# 5) CAA 记录不得限制 letsencrypt.org
curl -s "https://dns.google/resolve?name=manchlab.com&type=CAA"
#   Status=0 且无 Answer → 无 CAA，正常

# 6) www 子域（GitHub 证书只含 apex，www 需单独走代理或另配）
curl -s "https://dns.google/resolve?name=www.manchlab.com&type=CNAME"
#   Status=3 (NXDOMAIN) → 未配置，不影响 apex 签发
```

### 8.3 本次真正的原因与新发现的坑

**表面现象**：DNS 全部正确（灰云、4 条 A 记录、无 CAA 阻塞），但证书 40+ 分钟停留在 `new`。

**处理**：重新 `PUT pages -f cname=manchlab.com` 触发 GitHub 侧重新校验，
随后网页端出现 3 步进度条（"Certificate Requested"），约 2 分钟后签发完成。

**结论**：**在 Cloudflare 橙云期间添加的自定义域名，其证书申请可能已失败并被静默终止；
仅把 DNS 改成灰云并不会自动重试。必须重新提交一次 cname 才会重新发起 CA 申请。**

> ⚠️ **绝对不要用 API 清空 `cname` 再重设**。本次尝试
> `PUT pages -f cname=""` 会导致 Pages 直接解绑自定义域名
> （`html_url` 立刻退回 `https://cry-aml.github.io/home/`），且重设请求在
> 同一时刻可能不生效，需要再次单独绑定。**正确做法是直接重发一次
> `PUT -f cname=manchlab.com`，不要先清空。**

### 8.4 签发完成后的验证清单

```bash
# 证书主体（必须 CN=manchlab.com，而不是 *.github.io）
echo | openssl s_client -connect 185.199.108.153:443 -servername manchlab.com 2>/dev/null \
  | openssl x509 -noout -subject -dates -ext subjectAltName

# 全站 HTTPS 抽查（verify 必须为 0）
for p in / /team/ /zh-cn/ /zh-tw/ /publications/ /images/logos/logo-en.webp; do
  printf "%-32s " "$p"
  curl -s -o /dev/null -m 15 -w "https=%{http_code} verify=%{ssl_verify_result}\n" "https://manchlab.com$p"
done

# 强制 HTTPS 状态
gh api repos/Cry-AML/home/pages --jq '{enforced: .https_enforced, expires: .https_certificate.expires_at}'
```

### 8.5 Cloudflare 橙云（Proxied）注意事项

证书 `approved` 之后，**可以**安全切回橙云，但必须满足：

| 项 | 要求 |
| :--- | :--- |
| SSL/TLS 模式 | **Full**（不能用 Flexible，否则 HTTP↔HTTPS 301 死循环） |
| `www` 子域 | GitHub 证书**不含** `www`，需加 `CNAME www → cry-aml.github.io` 且**走橙云**（由 CF 提供边缘证书） |
| 灰云→橙云时机 | 必须在 GitHub 证书 `approved` 之后；否则 CA 验证会被 CF 边缘拦截 |

---

## 9. 常见故障速查

| 症状 | 原因 | 处理 |
| :--- | :--- | :--- |
| 页面无样式、控制台 CSS 404 | `baseURL` 与当前域名不匹配 | 改 `baseURL` → 重新构建部署 |
| `manchlab.com` 打开是 404 | `public/CNAME` 丢失或 Pages 未绑定域名 | 检查 `static/CNAME`、Pages 设置 |
| `https://` 证书告警 / `https=000` | 证书未签发或仍为 `*.github.io` 默认证书 | 见第 8 节排查 |
| **`cert` 长期停留在 `new`** | 橙云期间申请失败且不会自动重试 | 重新 `PUT -f cname=manchlab.com`（**勿先清空**） |
| 访问 `cry-aml.github.io/home/` 跳到自定义域名 | Pages 已绑定自定义域名（预期行为） | 无需处理 |
| 资源路径出现 `/home/` | 旧构建缓存或 `baseURL` 未更新 | 清 `public/ resources/` 后重构建 |
| `http://` 不跳 `https://` | `Enforce HTTPS` 刚开启，GitHub 侧传播需数分钟 | 等待；橙云下由 CF "Always Use HTTPS" 兜住 |
| `www.manchlab.com` 证书错误 | GitHub 证书仅含 apex | 加 `CNAME www` 并走橙云 |
