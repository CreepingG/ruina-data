$path = 'D:\3D Objects\游戏相关\废都物语\原版\ruina121\game'
$dist = 'jp'
New-Item -Path '.' -Name $dist -ItemType 'directory' -Force | Out-Null
$list = Get-ChildItem $path -Name -Include *.l??
foreach ($s in $list){
    Write-Output $s
    $match = (($s -match 'lmu') -or ($s -match 'lmt') -or ($s -match 'ldb'))
    if ($match){
        & '.\lcf2xml' $path\$s
        $from = ($s -replace '\.l([a-z]{2})$','.e$1')
        $to = "${s}.xml"
        Move-Item -Path $from -Destination $dist\$to -Force
    }
}