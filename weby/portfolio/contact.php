<?php
// Simple contact endpoint for Websupport hosting
// Sends email to site owner using PHP mail()

// Ensure POST
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
  http_response_code(405);
  header('Content-Type: text/plain; charset=utf-8');
  echo 'Method Not Allowed';
  exit;
}

// Basic CSRF mitigation via same-origin (for static hosting, referrer check is optional)
// Honeypot
if (!empty($_POST['hp'])) {
  http_response_code(200);
  echo 'OK';
  exit; // silently accept spam
}

$email = isset($_POST['email']) ? trim($_POST['email']) : '';
$message = isset($_POST['message']) ? trim($_POST['message']) : '';

if ($email === '' || $message === '') {
  http_response_code(400);
  header('Content-Type: text/plain; charset=utf-8');
  echo 'Chýbajúce údaje';
  exit;
}

// Sanitize
if (preg_match('/[\r\n]/', $email)) { // prevent header injection
  http_response_code(400);
  echo 'Neplatný e‑mail';
  exit;
}

$to = 'tomasmichalko71@gmail.com';
$subject = 'Kontakt z portfólia';
$body = "Od: {$email}\n\nSpráva:\n{$message}\n";

// Many hosts require a valid local From: address; set one tied to your domain.
$fromAddress = 'no-reply@testwebtomas.online'; // domain-based address for mail() sender
$headers = [
  'MIME-Version: 1.0',
  'Content-Type: text/plain; charset=utf-8',
  'Content-Transfer-Encoding: 8bit',
  'From: '.$fromAddress,
  'Reply-To: '.$email,
];

$ok = @mail($to, '=?UTF-8?B?'.base64_encode($subject).'?=', $body, implode("\r\n", $headers));

if ($ok) {
  // Redirect back with success anchor
  header('Location: portfolio.html#kontakt');
  exit;
} else {
  http_response_code(500);
  header('Content-Type: text/plain; charset=utf-8');
  echo 'Odoslanie zlyhalo. Skúste neskôr.';
}
?>
