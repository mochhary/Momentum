<?php
$data = [
    'customer_name' => 'Test User',
    'customer_email' => 'test@example.com',
    'customer_phone' => '08123456789',
    'frame_type' => 1,
    'final_photo' => 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEAAAAAAAD/2wBDAP//////////////////////////////////////////////////////////////////////////////////////wgALCAABAAEBAREA/8QAFBABAAAAAAAAAAAAAAAAAAAAAP/aAAGBAQABAAAAAA//8QAFBABAAAAAAAAAAAAAAAAAAAAAP/aAAgBAQAAPwA='
];

$ch = curl_init('http://localhost:8000/upload');
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_POSTFIELDS, http_build_query($data));
// get CSRF token from upload page first
$html = file_get_contents('http://localhost:8000/upload/1');
preg_match('/<meta name="csrf-token" content="([^"]+)">/', $html, $matches);
$csrf = $matches[1] ?? '';
// Extract session cookie from headers
preg_match_all('/^Set-Cookie:\s*([^;]*)/mi', $http_response_header[0] ?? '', $cookies);
$cookieStr = implode('; ', $cookies[1] ?? []);

curl_setopt($ch, CURLOPT_HTTPHEADER, [
    'X-CSRF-TOKEN: ' . $csrf,
    'Cookie: ' . $cookieStr,
    'Accept: application/json'
]);

$response = curl_exec($ch);
$httpcode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
curl_close($ch);

echo "HTTP Code: " . $httpcode . "\n";
echo "Response: " . substr($response, 0, 500);
