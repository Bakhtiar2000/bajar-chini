"""
Upload curated seed images to Cloudinary and record them in images.json.

Usage:  python scripts/seed/upload-images.py <selection.json>

<selection.json> maps an item key to a Wikimedia Commons image:
    { "rui-fish": {"title": "File:...", "url": "<original url>", "thumb": "<thumb url>", "w": 2048}, ...}
Keys prefixed with "cat:" are categories; everything else is a product slug.

Images are fetched by Cloudinary directly from Wikimedia (1280px rendition) and stored
under bajarchini/seed/. Credits (Commons file pages) are written to image-credits.json.
"""
import hashlib, json, os, re, sys, time
import requests

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(os.path.dirname(HERE))


def env():
    vals = {}
    for line in open(os.path.join(ROOT, '.env.local'), encoding='utf-8'):
        if '=' in line and not line.lstrip().startswith('#'):
            k, v = line.strip().split('=', 1)
            vals[k] = v
    return vals


UA = {'User-Agent': 'bajarchini-seed/1.0 (image curation script)'}


def rendition(item):
    """Download the image (with retries for Wikimedia throttling) and return a 1280px JPEG."""
    from io import BytesIO
    from PIL import Image
    # The thumbnail host is far less throttled than original-file downloads.
    urls = [re.sub(r'/\d+px-', '/1280px-', item['thumb'].split('?')[0]), item['url'].split('?')[0]]
    for attempt in range(8):
        for u in urls:
            try:
                r = requests.get(u, headers=UA, timeout=60)
                if r.status_code == 200:
                    im = Image.open(BytesIO(r.content)).convert('RGB')
                    im.thumbnail((1280, 1280))
                    buf = BytesIO()
                    im.save(buf, 'JPEG', quality=85)
                    return buf.getvalue()
            except Exception:
                pass
        time.sleep(5 * (attempt + 1))
    raise RuntimeError(f"download failed: {item['title']}")


def upload(cfg, public_id, src):
    ts = str(int(time.time()))
    params = {'public_id': public_id, 'overwrite': 'true', 'timestamp': ts}
    to_sign = '&'.join(f'{k}={params[k]}' for k in sorted(params)) + cfg['CLOUDINARY_API_SECRET']
    params['signature'] = hashlib.sha1(to_sign.encode()).hexdigest()
    params['api_key'] = cfg['CLOUDINARY_API_KEY']
    url = f"https://api.cloudinary.com/v1_1/{cfg['CLOUDINARY_CLOUD_NAME']}/image/upload"
    for attempt in range(4):
        r = requests.post(url, data=params, files={'file': ('image.jpg', src, 'image/jpeg')}, timeout=120)
        if r.ok:
            return r.json()
        print('  retry', public_id, r.status_code, r.text[:150], flush=True)
        time.sleep(5 * (attempt + 1))
    raise RuntimeError(f'upload failed: {public_id}')


def main():
    cfg = env()
    selection = json.load(open(sys.argv[1], encoding='utf-8'))
    out_path = os.path.join(HERE, 'images.json')
    cred_path = os.path.join(HERE, 'image-credits.json')
    images = json.load(open(out_path, encoding='utf-8'))
    credits = json.load(open(cred_path, encoding='utf-8')) if os.path.exists(cred_path) else {}
    for key, item in selection.items():
        is_cat = key.startswith('cat:')
        slug = key[4:] if is_cat else key
        bucket = images['categories' if is_cat else 'products']
        if bucket.get(slug, {}).get('source') == item['title']:
            continue
        public_id = f"bajarchini/seed/{'category' if is_cat else 'product'}/{slug}"
        try:
            res = upload(cfg, public_id, rendition(item))
        except RuntimeError as err:
            print('FAILED', key, ascii(str(err)), flush=True)  # rerun the script to retry failures
            continue
        time.sleep(1.5)  # be gentle with Wikimedia
        url = res['secure_url']  # the app adds f_auto/q_auto/w_* itself (lib/image-url.ts)
        bucket[slug] = {'url': url, 'publicId': res['public_id'], 'source': item['title']}
        credits[key] = 'https://commons.wikimedia.org/wiki/' + item['title'].replace(' ', '_')
        json.dump(images, open(out_path, 'w', encoding='utf-8'), indent=2, ensure_ascii=False)
        json.dump(credits, open(cred_path, 'w', encoding='utf-8'), indent=2, ensure_ascii=False)
        print('uploaded', key, flush=True)


if __name__ == '__main__':
    main()
