# reckonry-site

Website for Reckonry, reckonry.app.

Static HTML/CSS, deployed via Cloudflare Pages with GitHub auto-deploy on push to `main`.

A ledger of estimates: cream paper, IBM Plex Mono for headings and figures as the app sets its verdicts, IBM Plex Sans for reading, and the five divergence stages as the only color. The home page is a reckoning of its own: the visitor says how long reading it will take, the estimate locks, a slip at the top keeps the clock, and End shows how it landed on the arc. Nothing is stored or sent.

```
.
├── index.html         # home page
├── privacy.html       # privacy policy
├── support.html       # support page
├── event/duo.html     # 1.1 In-App Event page (deep link target)
├── styles.css         # shared stylesheet
├── scripts.js         # the page's own reckoning
├── _headers           # Cloudflare Pages headers
├── .well-known/       # apple-app-site-association for universal links
└── images/            # app screenshots and the iPhone Duo image
```

## Analytics

None. The privacy policy says the site collects nothing: no analytics, no cookies, no third-party scripts. Keep it that way.
