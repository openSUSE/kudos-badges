# 🏅 openSUSE Kudos Badges

<img width="737" height="220" alt="image" src="https://github.com/user-attachments/assets/e46c4aff-b900-49c6-b0ff-7bf264f66a41" />

Badges for the **openSUSE Kudos** recognition system.
Each badge celebrates contributions, collaboration, and creativity across the openSUSE community.

---

## 🎨 Design Guidelines

### 🌈 Color Palette
Generic badges should follow the **hellcp's (Jay Michalska) amazing color parellte** to ensure a consistent visual identity.
Platform-specific or hardware-related badges (e.g. POWER, System-Z, ARM) may use distinctive colors for quick recognition.

```
orange:        #f68946
radish-red:    #0a0a0a
plum-purple:   #a498ff
butterfly-blue:#00c8ff
turquoise-teal:#20caa3
bagel-beige:   #fff8ee
gabbro-gray:   #b8aeab
maple-maroon:  #301a14
```

---

## 🖼️ Resolution & Format

- **Preferred resolution:** `800×600 px`
- **Preferred formats:** `.png` for production, `.svg` as editable source
- Export badges using nearest-neighbor or pixel-perfect scaling for a crisp 8-bit look.
- File names should be lowercase and hyphen-separated, for example:
  ```
  mentor.png
  bug-squasher.png
  systemz-hero.png
  ```

- After exporting a badge, run it through **[optipng](http://optipng.sourceforge.net/)**  
  ```
  optipng -o7 badge-name.png
  ```
---

### ✍️ Font Guidelines

Badges should use **Pixel Operator** (or **Pixel Operator Bold**) for all text. The font itself is not listed in Google fonts api so it has to be selfhosted.
This font maintains the consistent pixel-art aesthetic used across openSUSE Kudos visuals.

- **Primary font:** [Pixel Operator](https://www.dafont.com/pixel-operator.font) licensed under [SIL Open Font License 1.1](https://scripts.sil.org/OFL)
- **Recommended sizes:**
  - Titles: 24–32 px
  - Subtext / labels: 16–20 px
- **Style:** All-caps or small-caps when appropriate.
- **Color:** Use one of the approved palette colors for text, typically
  `butterfly-blue`, `geeko-green`, or `bagel-beige`, depending on background contrast.

---

## 🧠 Badge Criteria

Each badge should have a **clear, measurable reason** for being awarded.
This ensures fairness, consistency, and transparency across the recognition system.

- Explain *what the badge represents* and *why it’s awarded*
- Include measurable criteria where possible (e.g. “Merged 10 pull requests”, “Mentored 3 new contributors”).
- When submitting a new badge, include its description and criteria in your PR.

The title and description shown in Kudos live next to the artwork in this repository — see [Adding a badge](#-adding-a-badge).

---

## ➕ Adding a badge

A badge is three things, all in this repository:

1. **The artwork** — `<slug>.png` in the top-level directory, plus its previews
   in `previews/200/` and `previews/800/` (run `./generate-previews.sh`).
2. **Metadata** — `meta/<slug>.json`. The file name is the badge's slug, the
   permanent ID that bots and Kudos use to grant it:
   ```json
   {
     "image": "mentor.png",
     "link": "https://en.opensuse.org/Mentoring"
   }
   ```
   `link` is optional. Set `"retired": true` to stop showing a badge in the
   catalog; people who earned it keep it. Don't delete a badge's meta file:
   badges are never revoked, and the file keeps its name and art.
3. **English strings** — an entry in `locales/en.json`:
   ```json
   "mentor": {
     "title": "Mentor",
     "description": "For mentoring 3 new contributors."
   }
   ```
   Other `locales/<lang>.json` files are translations, managed via
   [Weblate](https://l10n.opensuse.org/projects/kudos/) — don't edit them by hand.

Check your work with `node scripts/check-badges.mjs`; CI runs the same check
on every pull request. Every top-level `.png` must have metadata, so keep
artwork that isn't a badge yet out of the top-level directory.

Once merged, the `kudos-badges` package is rebuilt and installed, and Kudos
picks the badge up on its own: it syncs this catalog into its database every
time it starts.

## 🧩 Usage of badges

This repository is packaged as `kudos-badges` and installed next to the [openSUSE Kudos webapp](https://github.com/openSUSE/kudos).  
It provides assets for rendering **printable achievements** and **peer-to-peer kudos** by the Kudos app designed for sharing on social networks.

Please **do not use badges from this repository outside of the Kudos application or its official promotion**.  
These badges are meant to recognize specific contributions, and using them elsewhere would diminish their intended value and meaning.

## 🪪 License

All badge designs are licensed under the
**Creative Commons Attribution–ShareAlike 4.0 International (CC BY-SA 4.0)** license.

SPDX-License-Identifier: `CC-BY-SA-4.0`
© 2025 Lubos Kocman and openSUSE contributors

You are free to share and adapt these badges, provided you give proper credit
and distribute derivative works under the same license.
See <https://creativecommons.org/licenses/by-sa/4.0/> for full details.

---

## 🧩 Contributing

Contributions are welcome!
When submitting new badges:
- Follow the **LCP color palette** and **800×600 px** layout.
- Provide a **short reasoning or measurable criteria** for the badge.
- Include both **PNG and SVG** if possible.
- Add yourself to [`AUTHORS.md`](AUTHORS.md).

---

💚 *Geeko thanks you for helping recognize our contributors!*
