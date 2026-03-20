$srcPath = 'c:\Users\FRATCLIFFE\Documents\ANGULAR PROYECTOS\TicketOnlineNG\src'
$files = Get-ChildItem -Path $srcPath -Recurse -Include '*.scss','*.html','*.ts'
$count = 0

foreach ($file in $files) {
    $content = Get-Content $file.FullName -Raw -Encoding UTF8
    $original = $content

    $content = $content -replace '\$purple-400', '$blue-400'
    $content = $content -replace '\$purple-500', '$blue-500'
    $content = $content -replace '\$purple-600', '$blue-600'

    $content = $content -replace '#c084fc', '#47bcff'
    $content = $content -replace '#a855f7', '#21a9ff'
    $content = $content -replace '#9333ea', '#0088d4'
    $content = $content -replace '#7c3aed', '#0063a3'
    $content = $content -replace '#a78bfa', '#60a5fa'

    $content = $content -replace '#0f0a1e', '#040f1c'
    $content = $content -replace '#08041a', '#020b14'
    $content = $content -replace '#160d2e', '#071525'
    $content = $content -replace '#221540', '#0a1e33'
    $content = $content -replace '#1a0d35', '#0a1e33'
    $content = $content -replace '#1e0a3c', '#020f1e'
    $content = $content -replace '#3b0764', '#034a7d'
    $content = $content -replace '#f3f0ff', '#edf6ff'

    $content = $content -replace 'rgba\(192, 132, 252,', 'rgba(71, 188, 255,'
    $content = $content -replace 'rgba\(168, 85, 247,',  'rgba(33, 169, 255,'
    $content = $content -replace 'rgba\(139, 92, 246,',  'rgba(33, 169, 255,'
    $content = $content -replace 'rgba\(22, 13, 46,',    'rgba(7, 21, 37,'
    $content = $content -replace 'rgba\(34, 21, 64,',    'rgba(7, 28, 51,'
    $content = $content -replace 'rgba\(15, 10, 30,',    'rgba(4, 15, 28,'
    $content = $content -replace 'rgba\(8, 4, 26,',      'rgba(4, 10, 20,'

    $content = $content -replace 'rgba\(192,132,252,', 'rgba(71,188,255,'
    $content = $content -replace 'rgba\(168,85,247,',  'rgba(33,169,255,'
    $content = $content -replace 'rgba\(139,92,246,',  'rgba(33,169,255,'
    $content = $content -replace 'rgba\(22,13,46,',    'rgba(7,21,37,'
    $content = $content -replace 'rgba\(34,21,64,',    'rgba(7,28,51,'
    $content = $content -replace 'rgba\(15,10,30,',    'rgba(4,15,28,'
    $content = $content -replace 'rgba\(8,4,26,',      'rgba(4,10,20,'

    $content = $content -replace 'rgba\(156, 163, 175,', 'rgba(139, 168, 190,'
    $content = $content -replace 'rgba\(156,163,175,',   'rgba(139,168,190,'

    $content = $content -replace '#9ca3af', '#8ba8be'

    if ($content -ne $original) {
        $file.IsReadOnly = $false
        [System.IO.File]::WriteAllText($file.FullName, $content, [System.Text.Encoding]::UTF8)
        $count++
        Write-Host "Updated: $($file.Name)"
    }
}
Write-Host ""
Write-Host "Total files updated: $count"
