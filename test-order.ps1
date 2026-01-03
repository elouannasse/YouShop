$body = @{
    items = @(
        @{
            productId = "76f24f4e-fec7-48f2-bffd-35026724ee15"
            quantity = 10
        },
        @{
            productId = "faa42762-c403-410c-a0f0-79378f00ca61"
            quantity = 1
        }
    )
} | ConvertTo-Json -Depth 10

$loginBody = @{
    email = "superadmin@youshop.com"
    password = "Dyablo2009"
} | ConvertTo-Json

Write-Host "=== Login ===" -ForegroundColor Green
$response = Invoke-RestMethod -Uri "http://localhost:3000/auth/login" -Method POST -ContentType "application/json" -Body $loginBody
$token = $response.accessToken
Write-Host "Token obtained: $($token.Substring(0, 20))..." -ForegroundColor Yellow

Write-Host "`n=== Creating Order ===" -ForegroundColor Green
Write-Host "Request body:" -ForegroundColor Cyan
Write-Host $body

try {
    $order = Invoke-RestMethod -Uri "http://localhost:3000/orders" -Method POST -ContentType "application/json" -Headers @{Authorization = "Bearer $token"} -Body $body
    Write-Host "`nOrder created successfully!" -ForegroundColor Green
    Write-Host "Order ID: $($order.id)" -ForegroundColor Yellow
    Write-Host "Order Number: $($order.orderNumber)" -ForegroundColor Yellow
    Write-Host "Status: $($order.status)" -ForegroundColor Yellow
    Write-Host "Total Amount: $($order.totalAmount)" -ForegroundColor Yellow
    $order | ConvertTo-Json -Depth 10
} catch {
    Write-Host "`nError creating order:" -ForegroundColor Red
    $errorDetails = $_.ErrorDetails.Message | ConvertFrom-Json
    Write-Host "Status Code: $($errorDetails.statusCode)" -ForegroundColor Red
    Write-Host "Message: $($errorDetails.message)" -ForegroundColor Red
    Write-Host "Error: $($errorDetails.error)" -ForegroundColor Red
}
