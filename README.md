# Cloudflare Client `v1.0`
ระบบอัพเดต ip ให้กับ cloudflare โดยตรงหรือ จะให้ดึง ip แล้วส่งให้กับ `CUSTOM_URL` ก็ได้

## environment

```conf
DOMAIN_NAME = #โดเมนที่จะอัพเดต
CUSTOM_URL =  #หาต้องการให้ยิง ip ที่ต้องการไปยัง url อื่นให้ระบุใร env นี้
DOMAIN_ZONE = #ได้จาก api ของ cloudflare
DOMAIN_KEY = #ได้จาก api ของ cloudflare
DOMAIN_EMAIL = #ได้จาก api ของ cloudflare
```
