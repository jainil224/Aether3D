import urllib.request

url = "https://res.cloudinary.com/dsn0ks2hl/video/upload/person_video_nss3tv.m3u8"
try:
    req = urllib.request.Request(url, method="HEAD")
    with urllib.request.urlopen(req) as resp:
        print("Status Code:", resp.status)
        print("Content Type:", resp.headers.get("Content-Type"))
        print("Content Length:", resp.headers.get("Content-Length"))
except Exception as e:
    print("Error:", e)
