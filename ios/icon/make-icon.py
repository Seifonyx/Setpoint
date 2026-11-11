import math, sys
def icon(dark):
    C = dict(
        bg0='#221F1A' if dark else '#FDF8EF', bg1='#0E0D0B' if dark else '#E9DDC8',
        track='#2C2822' if dark else '#E6D9C3', trackHi='#37322A' if dark else '#F1E7D6',
        g0='#2E9E78' if dark else '#0A4434', g1='#7BDDB3' if dark else '#1E9670',
        pro=('#F59A82','#E0654A') if dark else ('#D86A4E','#B4472E'),
        carb=('#F7C677','#E39A3B') if dark else ('#E7A23F','#C27C1C'),
        fat=('#A9C0EE','#7D98D4') if dark else ('#6A89C0','#425F96'),
        shadow='#000000' if dark else '#6b5130', shOp='.55' if dark else '.26',
        glowOp='.75' if dark else '.6', grain='.07' if dark else '.05')
    cx, cy = 512, 588
    def arc(r, frac, stroke, w, extra=''):
        c = 2*math.pi*r; L = c*0.75*frac
        return f'<circle cx="{cx}" cy="{cy}" r="{r}" fill="none" stroke="{stroke}" stroke-width="{w}" stroke-linecap="round" stroke-dasharray="{L:.1f} {c:.1f}" transform="rotate(135 {cx} {cy})" {extra}/>'
    main_r, main_f = 304, 0.8
    a = math.radians(135 + 270*main_f); px, py = cx + main_r*math.cos(a), cy + main_r*math.sin(a)
    rings = [(212, 0.66, 'pro'), (164, 0.86, 'carb'), (116, 0.52, 'fat')]
    s = f'''<svg xmlns="http://www.w3.org/2000/svg" width="1024" height="1024" viewBox="0 0 1024 1024">
<defs>
 <radialGradient id="bg" cx="32%" cy="18%" r="105%"><stop offset="0" stop-color="{C['bg0']}"/><stop offset="1" stop-color="{C['bg1']}"/></radialGradient>
 <linearGradient id="main" x1="0" y1="1" x2="1" y2="0"><stop offset="0" stop-color="{C['g0']}"/><stop offset="1" stop-color="{C['g1']}"/></linearGradient>
 <linearGradient id="pro" x1="0" y1="1" x2="1" y2="0"><stop offset="0" stop-color="{C['pro'][1]}"/><stop offset="1" stop-color="{C['pro'][0]}"/></linearGradient>
 <linearGradient id="carb" x1="0" y1="1" x2="1" y2="0"><stop offset="0" stop-color="{C['carb'][1]}"/><stop offset="1" stop-color="{C['carb'][0]}"/></linearGradient>
 <linearGradient id="fat" x1="0" y1="1" x2="1" y2="0"><stop offset="0" stop-color="{C['fat'][1]}"/><stop offset="1" stop-color="{C['fat'][0]}"/></linearGradient>
 <radialGradient id="dot" cx="36%" cy="30%" r="72%"><stop offset="0" stop-color="#FFF0CF"/><stop offset=".45" stop-color="#F6BE63"/><stop offset="1" stop-color="#C77818"/></radialGradient>
 <radialGradient id="glow"><stop offset="0" stop-color="#F6B85C" stop-opacity="{C['glowOp']}"/><stop offset=".45" stop-color="#F6B85C" stop-opacity=".22"/><stop offset="1" stop-color="#F6B85C" stop-opacity="0"/></radialGradient>
 <radialGradient id="vig" cx="50%" cy="45%" r="75%"><stop offset=".6" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity="{'.35' if dark else '.08'}"/></radialGradient>
 <filter id="sh" x="-30%" y="-30%" width="160%" height="160%"><feDropShadow dx="0" dy="16" stdDeviation="20" flood-color="{C['shadow']}" flood-opacity="{C['shOp']}"/></filter>
 <filter id="inner" x="-10%" y="-10%" width="120%" height="120%"><feGaussianBlur stdDeviation="3"/></filter>
 <filter id="grain"><feTurbulence type="fractalNoise" baseFrequency=".9" numOctaves="2" stitchTiles="stitch"/><feColorMatrix values="0 0 0 0 .5  0 0 0 0 .4  0 0 0 0 .3  0 0 0 {C['grain']} 0"/></filter>
</defs>
<rect width="1024" height="1024" fill="url(#bg)"/>
<rect width="1024" height="1024" filter="url(#grain)"/>
<rect width="1024" height="1024" fill="url(#vig)"/>
<!-- tracks, slightly recessed -->
{arc(main_r, 1, C['track'], 96)}
{arc(main_r-6, 1, C['trackHi'], 4, 'opacity=".7"')}
{''.join(arc(r, 1, C['track'], 30) for r,_,_ in rings)}
<!-- the day: calories, then protein, carbs, fat -->
<g filter="url(#sh)">{arc(main_r, main_f, 'url(#main)', 96)}</g>
{''.join(arc(r, f, f'url(#{k})', 30) for r,f,k in rings)}
<!-- today's point -->
<circle cx="{px:.0f}" cy="{py:.0f}" r="160" fill="url(#glow)"/>
<circle cx="{px:.0f}" cy="{py:.0f}" r="70" fill="url(#dot)" filter="url(#sh)"/>
<ellipse cx="{px-22:.0f}" cy="{py-26:.0f}" rx="24" ry="15" fill="#FFFFFF" opacity=".55" transform="rotate(-25 {px-22:.0f} {py-26:.0f})"/>
</svg>'''
    return s
open('b-light.svg','w').write(icon(False)); open('b-dark.svg','w').write(icon(True))
