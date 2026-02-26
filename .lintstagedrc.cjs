module.exports = {
  '*.{js,cjs,mjs,ts,vue,json,md,css,scss,html}': ['prettier --write'],
  '*.{ts,vue}': ['eslint --fix --max-warnings=0'],
}
