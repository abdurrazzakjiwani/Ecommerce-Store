$ErrorActionPreference = 'Stop'

# Generates placeholder product imagery as SVG.
#
# Offline by design: no external placeholder service, so the prototype renders
# identically on a laptop with no connection, which matters when demonstrating to
# a client in an office.
#
# Each image is a soft cream-toned panel with the product name and a frame
# number, so the carousel is visibly scrollable in a demo and nobody mistakes a
# placeholder for a finished photograph.

$dir = Join-Path $PSScriptRoot '..\public\media'
New-Item -ItemType Directory -Force -Path $dir | Out-Null

# Cream palette drawn from the frozen design tokens.
$backgrounds = @('#F5F0E6', '#EFE7D8', '#F7F2E9', '#EAE0CC', '#F3EEE3', '#E9E2D3')
$foregrounds = @('#44403C', '#1C1917', '#57534E', '#3F3B36')
$accents     = @('#B45309', '#92400E', '#C67B5C', '#A16207')

# slug, label, frame count
#
# Expanded 2026-10-01 for feature 002, alongside the catalogue growth from 9 to 27
# products. Each new product needs its own image set, otherwise its card renders a
# broken frame - which is the exact failure the imageless-product requirement is
# meant to make visible in only one deliberate place.
$items = @(
  @{ slug = 'laptop';      label = 'Business Laptop';   frames = 4 },
  @{ slug = 'ultrabook';   label = 'Ultrabook';         frames = 3 },
  @{ slug = 'dock';        label = 'USB-C Dock';        frames = 3 },
  @{ slug = 'monitor';     label = '24in Monitor';      frames = 3 },
  @{ slug = 'software';    label = 'Office Software';   frames = 4 },
  @{ slug = 'accounting';  label = 'Accounting';        frames = 3 },
  @{ slug = 'network';     label = 'Network Install';   frames = 4 },
  @{ slug = 'support';     label = 'Maintenance';       frames = 3 },
  @{ slug = 'recovery';    label = 'Data Recovery';     frames = 2 },
  @{ slug = 'desktop';     label = 'Desktop';           frames = 3 },
  @{ slug = 'keyboard';    label = 'Keyboard';          frames = 2 },
  @{ slug = 'ssd';         label = 'External SSD';      frames = 3 },
  @{ slug = 'webcam';      label = 'Webcam';            frames = 2 },
  @{ slug = 'security';    label = 'Security';          frames = 2 },
  @{ slug = 'email';       label = 'Business Email';    frames = 3 },
  @{ slug = 'server';      label = 'Server Install';    frames = 3 },
  @{ slug = 'backup';      label = 'Managed Backup';    frames = 2 }
)

$width  = 800
$height = 1000

foreach ($item in $items) {
  for ($frame = 1; $frame -le $item.frames; $frame++) {
    $bg   = $backgrounds[($frame - 1) % $backgrounds.Count]
    $fg   = $foregrounds[($frame - 1) % $foregrounds.Count]
    $accent = $accents[($frame - 1) % $accents.Count]

    # Escape the label for XML.
    $safeLabel = [System.Security.SecurityElement]::Escape($item.label)

    $svg = @"
<svg xmlns="http://www.w3.org/2000/svg" width="$width" height="$height" viewBox="0 0 $width $height" role="img" aria-label="$safeLabel, view $frame of $($item.frames)">
  <defs>
    <linearGradient id="g$frame$($frame)" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="$bg"/>
      <stop offset="100%" stop-color="#FFFFFF"/>
    </linearGradient>
  </defs>

  <rect width="$width" height="$height" fill="url(#g$frame$($frame))"/>

  <!-- Soft corner accents, echoing the card radius in the design -->
  <rect x="0" y="0" width="$width" height="14" fill="$accent" opacity="0.85"/>

  <!-- Generic device silhouette so the panel reads as a product photo slot -->
  <g opacity="0.16" fill="none" stroke="$fg" stroke-width="6">
    <rect x="$($width/2 - 150)" y="$($height/2 - 210)" width="300" height="380" rx="18"/>
    <line x1="$($width/2 - 110)" y1="$($height/2 - 150)" x2="$($width/2 + 110)" y2="$($height/2 - 150)"/>
    <line x1="$($width/2 - 110)" y1="$($height/2 - 90)" x2="$($width/2 + 110)" y2="$($height/2 - 90)"/>
    <line x1="$($width/2 - 110)" y1="$($height/2 - 30)" x2="$($width/2 + 60)" y2="$($height/2 - 30)"/>
    <rect x="$($width/2 - 80)" y="$($height/2 + 170)" width="160" height="26" rx="13"/>
  </g>

  <text x="$($width/2)" y="$($height/2 + 290)" text-anchor="middle" font-family="Segoe UI, Arial, sans-serif" font-size="34" font-weight="600" fill="$fg">$safeLabel</text>
  <text x="$($width/2)" y="$($height/2 + 340)" text-anchor="middle" font-family="Segoe UI, Arial, sans-serif" font-size="24" fill="$accent">View $frame of $($item.frames)</text>
  <text x="$($width/2)" y="$($height/2 + 400)" text-anchor="middle" font-family="Segoe UI, Arial, sans-serif" font-size="18" fill="$fg" opacity="0.6">Placeholder image</text>
</svg>
"@

    $path = Join-Path $dir "$($item.slug)-$frame.svg"
    [System.IO.File]::WriteAllText($path, $svg.Trim())
  }
}

Write-Host "Generated $($items.Count * 1) image sets in $dir"
Get-ChildItem $dir -Filter *.svg | Measure-Object | ForEach-Object { "  $($_.Count) SVG files" }
