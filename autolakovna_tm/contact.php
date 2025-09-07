<?php
// contact.php – spracovanie formulára a odoslanie e-mailu (UTF-8, honeypot, envelope sender)
// Umiestni do koreňa webu vedľa index.html

declare(strict_types=1);
header('Content-Type: application/json; charset=UTF-8');
date_default_timezone_set('Europe/Bratislava');

// ===== KONFIGURÁCIA =====
$to       = 'tomasmichalko71@gmail.com';          // cieľová schránka
$from     = 'no-reply@autolakovnatm.sk';          // musí byť z tvojej domény (vytvor alias/schránku)
$fromName = 'Autolakovňa TM';

// ===== METÓDA =====
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
  http_response_code(405);
  echo json_encode(['ok' => false, 'msg' => 'Method not allowed']);
  exit;
}

// ===== HONEYPOT (pole "website" musí zostať prázdne) =====
$hp = isset($_POST['website']) ? trim((string)$_POST['website']) : '';
if ($hp !== '') {
  http_response_code(400);
  echo json_encode(['ok' => false, 'msg' => 'Spam zablokovaný']);
  exit;
}

// ===== VSTUPY =====
$email   = filter_input(INPUT_POST, 'email', FILTER_VALIDATE_EMAIL);
$message = isset($_POST['message']) ? trim((string)$_POST['message']) : '';

if (!$email || $message === '') {
  http_response_code(422);
  echo json_encode(['ok' => false, 'msg' => 'Vyplňte platný e-mail a správu.']);
  exit;
}

// Stráž proti header injection v e-maile
if (preg_match('/[\r\n]/', (string)$email)) {
  http_response_code(400);
  echo json_encode(['ok' => false, 'msg' => 'Neplatný e-mail.']);
  exit;
}

// Obmedzenie dĺžky správy (ochrana servera)
$maxLen = 5000;
if (mb_strlen($message, 'UTF-8') > $maxLen) {
  $message = mb_substr($message, 0, $maxLen, 'UTF-8');
}

// ===== E-MAIL =====
$subject = 'Nová správa z webu – Autolakovňa TM';
$body = implode("\n", [
  'E-mail od: ' . $email,
  '',
  'Správa:',
  $message,
  '',
  '---',
  'Dátum: ' . date('Y-m-d H:i:s'),
  'IP: ' . ($_SERVER['REMOTE_ADDR'] ?? 'unknown'),
  'UA: ' . ($_SERVER['HTTP_USER_AGENT'] ?? 'unknown'),
]);

$headers = [
  'MIME-Version: 1.0',
  'Content-Type: text/plain; charset=UTF-8',
  'From: ' . $fromName . ' <' . $from . '>',
  'Reply-To: ' . $email,
  'X-Mailer: PHP/' . phpversion(),
];

// MIME-kódovanie predmetu kvôli diakritike
$encodedSubject = '=?UTF-8?B?' . base64_encode($subject) . '?=';

// Najprv s envelope senderom (-f), potom fallback bez neho
$sent = @mail($to, $encodedSubject, $body, implode("\r\n", $headers), '-f ' . $from);
if (!$sent) {
  $sent = @mail($to, $encodedSubject, $body, implode("\r\n", $headers));
}

if ($sent) {
  echo json_encode(['ok' => true, 'msg' => 'Ďakujeme, správa bola odoslaná.']);
} else {
  http_response_code(500);
  echo json_encode(['ok' => false, 'msg' => 'Správu sa nepodarilo odoslať. Skúste neskôr alebo zavolajte.']);
}
