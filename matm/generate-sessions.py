#!/usr/bin/env python3
"""Generate session HTML pages from curated JSON data."""

import json
import os
from pathlib import Path

def roman(n):
    vals = [(10,'X'),(9,'IX'),(5,'V'),(4,'IV'),(1,'I')]
    r = ''
    for v,s in vals:
        while n >= v:
            r += s
            n -= v
    return r

def generate_session_html(json_path, output_path):
    with open(json_path, 'r') as f:
        data = json.load(f)

    session = data
    h = data.get('highlights', {})

    # Generate quotes section
    quotes_html = ''
    for q in session.get('quotes_of_the_session', data.get('highlights', {}).get('quotes_of_the_session', []))[:6]:
        quotes_html += f'''
        <div class="quote-card">
          <p class="quote-text">{q['quote']}</p>
          <p class="quote-speaker">— {q['speaker']}</p>
          <p class="quote-context">{q['context']}</p>
        </div>'''

    # Generate highlights
    highlights_html = ''
    for m in h.get('best_moments', []):
        quotes_block = ''
        for q in m.get('quotes', []):
            quotes_block += f'''
          <div class="quote-block">
            <p class="quote-text">"{q['text']}"</p>
            <p class="quote-speaker">— {q['speaker']}</p>
          </div>'''

        highlights_html += f'''
        <div class="highlight-card">
          <div class="highlight-header">
            <h3 class="highlight-title">{m['title']}</h3>
            <span class="highlight-type type-{m['type']}">{m['type'].title()}</span>
          </div>
          <p class="highlight-description">{m['description']}</p>
          {quotes_block}
        </div>'''

    # Character spotlights
    spotlight_html = ''
    for char, info in h.get('character_spotlight', {}).items():
        moments_li = ''.join([f'<li>{m}</li>' for m in info.get('moments', [])])
        spotlight_html += f'''
        <div class="spotlight-card">
          <h3 class="spotlight-name">{char}</h3>
          <ul class="spotlight-moments">{moments_li}</ul>
          <p class="spotlight-quote">"{info.get('one_liner', '')}"</p>
        </div>'''

    # Combat encounters
    combat_html = ''
    for enc in h.get('combat_encounters', []):
        events_li = ''.join([f'<li>{e}</li>' for e in enc.get('notable_events', [])])
        mvp_html = f'''
          <div class="combat-detail">
            <div class="combat-detail-label">MVP</div>
            <div class="combat-detail-value">{enc.get('mvp', 'Team effort')}</div>
          </div>''' if enc.get('mvp') else ''

        combat_html += f'''
      <div class="combat-card">
        <div class="combat-header">
          <h3 class="combat-name">{enc['name']}</h3>
          <span class="combat-outcome">{enc.get('outcome', 'Victory')}</span>
        </div>
        <div class="combat-details">
          <div class="combat-detail">
            <div class="combat-detail-label">Enemies</div>
            <div class="combat-detail-value">{', '.join(enc.get('enemies', []))}</div>
          </div>
          <div class="combat-detail">
            <div class="combat-detail-label">Location</div>
            <div class="combat-detail-value">{enc.get('location', 'Unknown')}</div>
          </div>
          {mvp_html}
        </div>
        <ul class="combat-events">{events_li}</ul>
      </div>'''

    # Plot developments
    plot_html = ''
    icons = ['🔍', '🗺', '⚔', '👥', '📜', '🏠', '💰', '🎭']
    for i, p in enumerate(session.get('plot_developments', [])):
        icon = icons[i % len(icons)]
        plot_html += f'''
        <li>
          <span class="plot-icon">{icon}</span>
          <span class="plot-text">{p}</span>
        </li>'''

    # End state
    end = session.get('end_state', {})

    # Level up badge
    level_badge = ''
    if session.get('level_up'):
        level_badge = f'''<div class="level-up-badge">
        <span>⬆</span>
        Level Up! → Level {session.get('new_level', '?')}
      </div>'''

    # Nav links
    prev_num = session['session_number'] - 1
    next_num = session['session_number'] + 1
    prev_link = f'session-{str(prev_num).zfill(2)}.html' if prev_num > 0 else '#'
    next_link = f'session-{str(next_num).zfill(2)}.html'
    prev_class = ' class="disabled"' if prev_num < 1 else ''

    html = f'''<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Session {session['session_number']}: {session['title']} | Mage Against The Machine</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Cinzel:wght@400;600;700&family=Crimson+Pro:ital,wght@0,400;0,600;1,400&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="../nav.css">
  <link rel="stylesheet" href="../base.css">
  <style>
    :root {{
      --bg-dark: #0a0a0f;
      --bg-card: rgba(20, 16, 28, 0.9);
      --bg-card-hover: rgba(30, 24, 42, 0.95);
      --gold: #d4a857;
      --gold-dim: #a68642;
      --gold-bright: #ffd700;
      --purple: #8b5cf6;
      --purple-dim: #6d4aad;
      --red: #dc2626;
      --green: #22c55e;
      --blue: #3b82f6;
      --text-primary: #f5f5f4;
      --text-secondary: rgba(245, 245, 244, 0.7);
      --text-dim: rgba(245, 245, 244, 0.5);
      --border-subtle: rgba(212, 168, 87, 0.2);
      --border-glow: rgba(212, 168, 87, 0.4);
    }}
    * {{ margin: 0; padding: 0; box-sizing: border-box; }}
    body {{
      font-family: 'Crimson Pro', Georgia, serif;
      background: var(--bg-dark);
      color: var(--text-primary);
      min-height: 100vh;
      line-height: 1.6;
    }}
    body::before {{
      content: '';
      position: fixed;
      top: 0; left: 0;
      width: 100%; height: 100%;
      background:
        radial-gradient(ellipse at 20% 20%, rgba(139, 92, 246, 0.1) 0%, transparent 50%),
        radial-gradient(ellipse at 80% 80%, rgba(212, 168, 87, 0.08) 0%, transparent 50%);
      pointer-events: none;
      z-index: -1;
    }}
    .container {{ max-width: 1000px; margin: 0 auto; padding: 2rem; padding-top: 100px; }}
    .session-hero {{ text-align: center; padding: 3rem 0; margin-bottom: 3rem; }}
    .session-number {{
      font-family: 'Cinzel', serif;
      font-size: 0.9rem;
      color: var(--gold);
      letter-spacing: 0.3em;
      text-transform: uppercase;
      margin-bottom: 0.5rem;
    }}
    .session-title {{
      font-family: 'Cinzel', serif;
      font-size: 3rem;
      font-weight: 700;
      color: var(--text-primary);
      margin-bottom: 1rem;
      text-shadow: 0 0 40px rgba(212, 168, 87, 0.3);
    }}
    .session-meta {{
      display: flex;
      justify-content: center;
      gap: 2rem;
      flex-wrap: wrap;
      margin-bottom: 1.5rem;
    }}
    .meta-item {{ display: flex; align-items: center; gap: 0.5rem; color: var(--text-secondary); font-size: 0.95rem; }}
    .meta-icon {{ color: var(--gold-dim); }}
    .level-up-badge {{
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      background: linear-gradient(90deg, rgba(34, 197, 94, 0.2), rgba(34, 197, 94, 0.1));
      border: 1px solid rgba(34, 197, 94, 0.4);
      color: var(--green);
      padding: 0.5rem 1rem;
      border-radius: 2rem;
      font-family: 'Cinzel', serif;
      font-size: 0.9rem;
      font-weight: 600;
      margin-bottom: 1.5rem;
    }}
    .session-summary {{ color: var(--text-secondary); font-size: 1.1rem; max-width: 800px; margin: 0 auto; }}
    .section {{ margin-bottom: 3rem; }}
    .section-header {{ display: flex; align-items: center; gap: 1rem; margin-bottom: 1.5rem; }}
    .section-icon {{ font-size: 1.5rem; }}
    .section-title {{ font-family: 'Cinzel', serif; font-size: 1.5rem; font-weight: 600; color: var(--gold); }}
    .quotes-grid {{ display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 1rem; }}
    .quote-card {{
      background: var(--bg-card);
      border: 1px solid var(--border-subtle);
      border-radius: 10px;
      padding: 1.25rem;
      transition: all 0.3s ease;
    }}
    .quote-card:hover {{ border-color: var(--gold-dim); transform: translateY(-2px); }}
    .quote-text {{ font-size: 1rem; font-style: italic; color: var(--text-primary); margin-bottom: 0.75rem; }}
    .quote-speaker {{ font-family: 'Cinzel', serif; font-size: 0.85rem; color: var(--gold); margin-bottom: 0.25rem; }}
    .quote-context {{ font-size: 0.8rem; color: var(--text-dim); }}
    .highlights-grid {{ display: grid; gap: 1.25rem; }}
    .highlight-card {{
      background: var(--bg-card);
      border: 1px solid var(--border-subtle);
      border-radius: 12px;
      padding: 1.5rem;
    }}
    .highlight-header {{ display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem; }}
    .highlight-title {{ font-family: 'Cinzel', serif; font-size: 1.2rem; font-weight: 600; color: var(--text-primary); }}
    .highlight-type {{
      font-size: 0.7rem;
      padding: 0.25rem 0.75rem;
      border-radius: 1rem;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      font-family: 'Cinzel', serif;
    }}
    .type-comedy {{ background: rgba(251, 191, 36, 0.2); color: #fbbf24; }}
    .type-combat {{ background: rgba(220, 38, 38, 0.2); color: #f87171; }}
    .type-roleplay {{ background: rgba(139, 92, 246, 0.2); color: #a78bfa; }}
    .type-tension {{ background: rgba(59, 130, 246, 0.2); color: #60a5fa; }}
    .type-plot {{ background: rgba(212, 168, 87, 0.2); color: #d4a857; }}
    .type-epic {{ background: rgba(251, 191, 36, 0.2); color: #fbbf24; }}
    .type-funny {{ background: rgba(251, 191, 36, 0.2); color: #fbbf24; }}
    .highlight-description {{ color: var(--text-secondary); margin-bottom: 1rem; }}
    .quote-block {{
      background: rgba(0, 0, 0, 0.3);
      padding: 0.75rem;
      border-radius: 8px;
      margin-top: 0.75rem;
    }}
    .spotlight-grid {{ display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 1.25rem; }}
    .spotlight-card {{
      background: var(--bg-card);
      border: 1px solid var(--border-subtle);
      border-radius: 12px;
      padding: 1.5rem;
    }}
    .spotlight-name {{ font-family: 'Cinzel', serif; font-size: 1.2rem; font-weight: 600; color: var(--gold); margin-bottom: 1rem; }}
    .spotlight-moments {{ list-style: none; margin-bottom: 1rem; }}
    .spotlight-moments li {{
      color: var(--text-secondary);
      padding: 0.35rem 0;
      padding-left: 1rem;
      position: relative;
    }}
    .spotlight-moments li::before {{ content: '◆'; position: absolute; left: 0; color: var(--gold-dim); font-size: 0.6rem; }}
    .spotlight-quote {{
      background: rgba(0, 0, 0, 0.3);
      padding: 0.75rem;
      border-radius: 8px;
      font-style: italic;
      color: var(--text-primary);
      font-size: 0.95rem;
    }}
    .combat-card {{
      background: linear-gradient(135deg, rgba(220, 38, 38, 0.1), rgba(20, 16, 28, 0.9));
      border: 1px solid rgba(220, 38, 38, 0.3);
      border-radius: 12px;
      padding: 1.5rem;
    }}
    .combat-header {{ display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem; }}
    .combat-name {{ font-family: 'Cinzel', serif; font-size: 1.3rem; font-weight: 600; color: var(--text-primary); }}
    .combat-outcome {{
      background: rgba(34, 197, 94, 0.2);
      color: var(--green);
      padding: 0.25rem 0.75rem;
      border-radius: 1rem;
      font-family: 'Cinzel', serif;
      font-size: 0.8rem;
      font-weight: 600;
    }}
    .combat-details {{ display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1rem; margin-bottom: 1rem; }}
    .combat-detail {{ background: rgba(0, 0, 0, 0.3); padding: 0.75rem; border-radius: 8px; }}
    .combat-detail-label {{ color: var(--text-dim); font-size: 0.8rem; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 0.25rem; }}
    .combat-detail-value {{ color: var(--text-primary); font-size: 0.95rem; }}
    .combat-events {{ list-style: none; }}
    .combat-events li {{
      color: var(--text-secondary);
      padding: 0.5rem 0;
      padding-left: 1.5rem;
      position: relative;
      border-bottom: 1px solid rgba(255, 255, 255, 0.05);
    }}
    .combat-events li:last-child {{ border-bottom: none; }}
    .combat-events li::before {{ content: '⚔'; position: absolute; left: 0; color: var(--red); }}
    .plot-list {{ list-style: none; }}
    .plot-list li {{
      background: var(--bg-card);
      border: 1px solid var(--border-subtle);
      border-radius: 8px;
      padding: 1rem 1.25rem;
      margin-bottom: 0.75rem;
      display: flex;
      align-items: flex-start;
      gap: 1rem;
      transition: all 0.3s ease;
    }}
    .plot-list li:hover {{ border-color: var(--purple-dim); }}
    .plot-icon {{ color: var(--purple); font-size: 1.2rem; margin-top: 0.1rem; }}
    .plot-text {{ color: var(--text-secondary); flex: 1; }}
    .end-state {{
      background: linear-gradient(135deg, rgba(139, 92, 246, 0.1), rgba(20, 16, 28, 0.9));
      border: 1px solid rgba(139, 92, 246, 0.3);
      border-radius: 12px;
      padding: 1.5rem;
      text-align: center;
    }}
    .end-state-title {{
      font-family: 'Cinzel', serif;
      font-size: 1rem;
      color: var(--purple);
      text-transform: uppercase;
      letter-spacing: 0.1em;
      margin-bottom: 1rem;
    }}
    .end-state-content {{ display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 1.5rem; }}
    .end-item-label {{ color: var(--text-dim); font-size: 0.8rem; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 0.25rem; }}
    .end-item-value {{ color: var(--text-primary); font-size: 1.05rem; }}
    .session-nav {{
      display: flex;
      justify-content: space-between;
      margin-top: 3rem;
      padding-top: 2rem;
      border-top: 1px solid var(--border-subtle);
    }}
    .session-nav a {{
      display: flex;
      align-items: center;
      gap: 0.5rem;
      color: var(--text-secondary);
      text-decoration: none;
      font-family: 'Cinzel', serif;
      font-size: 0.9rem;
      padding: 0.75rem 1.25rem;
      border: 1px solid var(--border-subtle);
      border-radius: 8px;
      transition: all 0.3s ease;
    }}
    .session-nav a:hover {{ color: var(--gold); border-color: var(--gold-dim); background: rgba(212, 168, 87, 0.1); }}
    .session-nav a.disabled {{ opacity: 0.3; pointer-events: none; }}
    @media (max-width: 768px) {{
      .container {{ padding: 1rem; padding-top: 80px; }}
      .session-title {{ font-size: 2rem; }}
      .session-meta {{ gap: 1rem; }}
      .quotes-grid, .spotlight-grid {{ grid-template-columns: 1fr; }}
    }}
  </style>
</head>
<body>
  <div class="container">
    <header class="session-hero">
      <div class="session-number">Session {roman(session['session_number'])}</div>
      <h1 class="session-title">{session['title']}</h1>
      <div class="session-meta">
        <span class="meta-item">
          <span class="meta-icon">📅</span>
          {session['date']}
        </span>
        <span class="meta-item">
          <span class="meta-icon">⏱</span>
          {session.get('duration', '~3 hours')}
        </span>
        <span class="meta-item">
          <span class="meta-icon">👥</span>
          {len(session.get('player_attendance', []))} players
        </span>
      </div>
      {level_badge}
      <p class="session-summary">{session['summary']}</p>
    </header>

    <section class="section">
      <div class="section-header">
        <div class="section-icon">💬</div>
        <h2 class="section-title">Quotes of the Session</h2>
      </div>
      <div class="quotes-grid">{quotes_html}</div>
    </section>

    <section class="section">
      <div class="section-header">
        <div class="section-icon">⭐</div>
        <h2 class="section-title">Best Moments</h2>
      </div>
      <div class="highlights-grid">{highlights_html}</div>
    </section>

    <section class="section">
      <div class="section-header">
        <div class="section-icon">⚔</div>
        <h2 class="section-title">Combat Encounters</h2>
      </div>
      {combat_html}
    </section>

    <section class="section">
      <div class="section-header">
        <div class="section-icon">👤</div>
        <h2 class="section-title">Character Spotlight</h2>
      </div>
      <div class="spotlight-grid">{spotlight_html}</div>
    </section>

    <section class="section">
      <div class="section-header">
        <div class="section-icon">📜</div>
        <h2 class="section-title">Plot Developments</h2>
      </div>
      <ul class="plot-list">{plot_html}</ul>
    </section>

    <section class="section">
      <div class="end-state">
        <h3 class="end-state-title">To Be Continued...</h3>
        <div class="end-state-content">
          <div>
            <div class="end-item-label">Location</div>
            <div class="end-item-value">{end.get('location', 'Unknown')}</div>
          </div>
          <div>
            <div class="end-item-label">Party Status</div>
            <div class="end-item-value">{end.get('party_condition', 'Unknown')}</div>
          </div>
          <div>
            <div class="end-item-label">Next Objective</div>
            <div class="end-item-value">{end.get('next_objective', 'Unknown')}</div>
          </div>
        </div>
      </div>
    </section>

    <nav class="session-nav">
      <a href="{prev_link}"{prev_class}>
        <span>←</span>
        <span>Session {prev_num}</span>
      </a>
      <a href="{next_link}">
        <span>Session {next_num}</span>
        <span>→</span>
      </a>
    </nav>
  </div>
  <script src="../nav.js"></script>
  <script>initNav('sessions');</script>
</body>
</html>'''

    with open(output_path, 'w') as f:
        f.write(html)

    print(f"Generated {output_path}")

if __name__ == '__main__':
    sessions_dir = Path('/mnt/nightblood/dev/MATM/prod/sessions')

    for json_file in sessions_dir.glob('session-*-curated.json'):
        session_num = json_file.stem.split('-')[1]
        output_file = sessions_dir / f'session-{session_num}.html'
        generate_session_html(json_file, output_file)

    print("All session pages generated!")
