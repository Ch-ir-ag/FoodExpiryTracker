try {
    Write-Host "Testing Supabase MCP connection..."
    $result = npx -y @supabase/mcp-server-supabase@latest --access-token sbp_1b1c80e1002276dd7dc9b45931d52f7f9244bffe --list-projects
    Write-Host "Results:"
    $result
} catch {
    Write-Host "Error occurred: $_"
} 