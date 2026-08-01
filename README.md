# 0xshingo.cc

Shingo Wu 的個人 portfolio。純 HTML/CSS/JS 靜態站，無框架、無 build step。

- 內容取材自真實的 GitHub 專案與技術棧
- 互動元件：粒子網路背景、游標光暈、磁吸按鈕、捲動顯現、視差傾斜、打字機效果、即時 GitHub 動態
- 部署：Cloudflare Pages，綁定自訂網域 portfolio.0xshingo.cc
- 另同步部署於 GitHub Pages：https://shingo0620.github.io/portfolio/

## 本機預覽

```bash
python3 -m http.server 8080
```

## 部署

```bash
wrangler pages deploy . --project-name=shingo-portfolio
```
