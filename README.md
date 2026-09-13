# Janhavi Lande — Personal Website

Source for [janhavilande.github.io](https://janhavilande.github.io) — a personal site styled like the
pages of a book (in the spirit of my poetry collection, *Ivied Walls*): a dark, ivy-toned exterior with
warm parchment "leaves" of content, chapter numerals, and gold flourishes.

Built with [Jekyll](https://jekyllrb.com/), based on the [academic-homepage](https://github.com/luost26/academic-homepage) theme.

## Running locally

```bash
bundle install
bundle exec jekyll serve
```

Then open http://localhost:4000.

## Structure

- `_data/profile.yml` — name, bio, education, contact links
- `_data/navigation.yml` — navbar links
- `_data/display.yml` — homepage display toggles and footer text
- `_data/timeline.yml` — the "Journey So Far" entries on the homepage
- `_data/book.yml` — *Ivied Walls* book copy and buy links (used on the homepage and `/book`)
- `_publications/` — publication entries, grouped by year
- `book.html` — the dedicated page for *Ivied Walls*
- `assets/` — CSS, JS, and images
