$base = "src\components\features"
$files = @(
    "$base\AIRecommender\AIRecommender.css",
    "$base\FuelCalculator\FuelCalculator.css",
    "$base\TotalCostOfOwnership\TotalCostOfOwnership.css",
    "$base\BreakEvenAnalysis\BreakEvenAnalysis.css"
)

$displayReplacement = "font-family: var(--font-display);"
$sansReplacement    = "font-family: var(--font-sans);"

foreach ($f in $files) {
    if (Test-Path $f) {
        $c = [System.IO.File]::ReadAllText($f)
        $c = $c.Replace("font-family: 'Space Grotesk', 'Inter', sans-serif;", $displayReplacement)
        $c = $c.Replace("font-family: 'Space Grotesk', sans-serif;",          $displayReplacement)
        [System.IO.File]::WriteAllText($f, $c, [System.Text.Encoding]::UTF8)
        Write-Host "Updated: $f"
    } else {
        Write-Host "Not found: $f"
    }
}

# Fix inline TSX reference in FuelCalculator
$tsx = "$base\FuelCalculator\FuelCalculator.tsx"
if (Test-Path $tsx) {
    $c = [System.IO.File]::ReadAllText($tsx)
    $c = $c.Replace("fontFamily: 'Space Grotesk, sans-serif'", "fontFamily: 'Outfit, Inter, sans-serif'")
    [System.IO.File]::WriteAllText($tsx, $c, [System.Text.Encoding]::UTF8)
    Write-Host "Updated TSX: $tsx"
}

Write-Host "All done!"
