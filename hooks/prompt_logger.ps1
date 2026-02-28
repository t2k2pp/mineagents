param(
    [Parameter(Position=0, Mandatory=$true)]
    [string]$Prompt
)

$LogPath = Join-Path $HOME ".agent_prompts.jsonl"
$Timestamp = (Get-Date).ToUniversalTime().ToString("yyyy-MM-ddTHH:mm:ssZ")

$LogEntry = @{
    timestamp = $Timestamp
    prompt = $Prompt
} | ConvertTo-Json -Compress

Add-Content -Path $LogPath -Value $LogEntry
