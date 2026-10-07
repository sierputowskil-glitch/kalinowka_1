<?php
declare(strict_types=1);

/**
 * Obsługa formularza zapytań (Kalinówka). Wymaga PHP >= 7.4 i działającej funkcji mail() (home.pl).
 * Zabezpieczenia: tylko POST, kontrola Origin/Referer, honeypot, limit zgłoszeń na IP,
 * walidacja po stronie serwera, brak wstrzykiwania nagłówków, brak zapisu danych osobowych na dysku.
 */

const MAIL_TO   = 'kontakt@kalinowka.com.pl';
const MAIL_FROM = 'kontakt@kalinowka.com.pl';   // istniejąca skrzynka w domenie serwisu (SPF)
const HOST_RE   = '/(^|\.)kalinowka\.com\.pl$/i';
const MAX_PER_HOUR = 5;
const MAX_PER_DAY  = 40;      // globalny dzienny limit zgłoszeń
const MAX_LINKS    = 1;       // maks. liczba linków w treści
const MIN_AGE_S    = 3;       // formularz wysłany szybciej = bot
const MAX_AGE_S    = 7200;    // token ważny 2 h
const TOKEN_SECRET = 'd544cdcc4682d1bcda70447a9f94efa58312654dab2c02da'; // zmień na własny losowy ciąg przy wdrożeniu

header('Content-Type: application/json; charset=utf-8');
header('X-Content-Type-Options: nosniff');
header('Cache-Control: no-store');

function out(bool $ok, string $err = '', int $code = 200): void {
    http_response_code($code);
    echo json_encode(['ok' => $ok, 'error' => $err], JSON_UNESCAPED_UNICODE);
    exit;
}
function clean(string $s, int $max): string {
    $s = preg_replace('/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/u', '', $s) ?? '';
    return mb_substr(trim($s), 0, $max);
}

function sign(int $ts): string { return hash_hmac('sha256', (string)$ts, TOKEN_SECRET); }

// GET ?t=1 -> podpisany znacznik czasu ładowania formularza
if (($_SERVER['REQUEST_METHOD'] ?? '') === 'GET' && isset($_GET['t'])) {
    $ts = time();
    echo json_encode(['ok' => true, 'tok' => $ts . '.' . sign($ts)]);
    exit;
}

if (($_SERVER['REQUEST_METHOD'] ?? '') !== 'POST') out(false, 'Niedozwolona metoda.', 405);

// Źródło żądania musi pochodzić z naszej domeny (ochrona przed CSRF / nadużyciami z obcych stron)
$src = $_SERVER['HTTP_ORIGIN'] ?? ($_SERVER['HTTP_REFERER'] ?? '');
$host = $src !== '' ? parse_url($src, PHP_URL_HOST) : null;
if (!$host || !preg_match(HOST_RE, (string)$host)) out(false, 'Niedozwolone źródło żądania.', 403);

// Honeypot: boty wypełniają ukryte pole — udajemy sukces i nic nie wysyłamy
if (!empty($_POST['website'])) out(true);

// Token czasowy: podpis musi się zgadzać, a od załadowania formularza musi minąć >= MIN_AGE_S
$tok = (string)($_POST['tok'] ?? '');
if (!preg_match('/^(\d{9,11})\.([a-f0-9]{64})$/', $tok, $tm) || !hash_equals(sign((int)$tm[1]), $tm[2])) out(false, 'Odśwież stronę i spróbuj ponownie.', 400);
$age = time() - (int)$tm[1];
if ($age < MIN_AGE_S) out(false, 'Formularz wysłano zbyt szybko. Spróbuj ponownie.', 429);
if ($age > MAX_AGE_S) out(false, 'Formularz wygasł. Odśwież stronę i spróbuj ponownie.', 400);

// Limit zgłoszeń na adres IP (w pliku tymczasowym trzymamy tylko skrót IP i czasy)
$ip = $_SERVER['REMOTE_ADDR'] ?? '0';
$rl = sys_get_temp_dir() . '/kal_rl_' . hash('sha256', $ip . '|kalinowka');
$now = time();
$hits = [];
if (is_file($rl)) {
    $hits = array_values(array_filter(array_map('intval', (array)file($rl, FILE_IGNORE_NEW_LINES)), fn($t) => $t > $now - 3600));
}
if (count($hits) >= MAX_PER_HOUR) out(false, 'Zbyt wiele zgłoszeń. Spróbuj później lub zadzwoń: 501 743 517.', 429);

// Globalny dzienny limit (ochrona skrzynki przed zalaniem z wielu adresów IP)
$dayFile = sys_get_temp_dir() . '/kal_day_' . date('Ymd');
$dayCount = is_file($dayFile) ? (int)@file_get_contents($dayFile) : 0;
if ($dayCount >= MAX_PER_DAY) out(false, 'Formularz jest chwilowo niedostępny. Zadzwoń: 501 743 517.', 429);

// Dane i walidacja
$name    = clean((string)($_POST['name'] ?? ''), 100);
$phone   = clean((string)($_POST['phone'] ?? ''), 30);
$email   = clean((string)($_POST['email'] ?? ''), 120);
$date    = clean((string)($_POST['date'] ?? ''), 10);
$guests  = (int)($_POST['guests'] ?? 0);
$type    = clean((string)($_POST['type'] ?? ''), 60);
$message = clean((string)($_POST['message'] ?? ''), 2000);
$source  = clean((string)($_POST['source'] ?? ''), 120);
$types   = [
    // wesela
    'Wesele', 'Ślub plenerowy + wesele',
    // rodzinne
    'Chrzciny', 'Komunia', 'Urodziny', 'Jubileusz lub rocznica', 'Stypa', 'Inne spotkanie rodzinne',
    'Chrzciny lub komunia', 'Urodziny, jubileusz lub rocznica',
    // firmowe
    'Kolacja zespołowa', 'Integracja firmowa', 'Wigilia lub spotkanie świąteczne', 'Jubileusz firmy lub przyjęcie dla pracowników', 'Inne wydarzenie firmowe',
    'Impreza firmowa',
    // ogólne / zgodność ze starszymi wartościami
    'Inne wydarzenie', 'Chrzciny / komunia', 'Inne przyjęcie',
];

if (mb_strlen($name) < 2) out(false, 'Podaj imię i nazwisko.', 422);
if (!preg_match('/^[0-9+()\s-]{6,30}$/', $phone)) out(false, 'Podaj poprawny numer telefonu.', 422);
if (!filter_var($email, FILTER_VALIDATE_EMAIL) || preg_match('/[\r\n]/', $email)) out(false, 'Podaj poprawny adres e-mail.', 422);
$d = DateTime::createFromFormat('Y-m-d', $date);
if (!$d || $d->format('Y-m-d') !== $date) out(false, 'Podaj poprawną datę.', 422);
if ($guests < 1 || $guests > 500) out(false, 'Podaj liczbę gości.', 422);
if ($type !== '' && !in_array($type, $types, true)) out(false, 'Wybierz typ wydarzenia.', 422);
if ($source !== '' && !preg_match('~^/[a-z0-9/-]{0,110}$~', $source)) $source = '';
if (empty($_POST['consent'])) out(false, 'Potwierdź zapoznanie się z polityką prywatności.', 422);

// Filtr linków i duplikatów
if (preg_match_all('~https?://|www\.|[a-z0-9-]+\.(?:ru|cn|top|xyz|click|shop)\b~i', $name . ' ' . $message) > MAX_LINKS) out(false, 'Wiadomość nie może zawierać linków.', 422);
if (preg_match('~https?://|www\.~i', $name)) out(false, 'Podaj imię i nazwisko.', 422);
$dup = sys_get_temp_dir() . '/kal_dup_' . hash('sha256', mb_strtolower($email . '|' . $message));
if (is_file($dup) && filemtime($dup) > $now - 86400) out(true); // identyczne zgłoszenie: ciche odrzucenie

$body = "Nowe zapytanie ze strony kalinowka.com.pl\n\n"
      . "Imię i nazwisko: $name\nTelefon: $phone\nE-mail: $email\n"
      . "Data wydarzenia: $date\nLiczba gości: $guests\nRodzaj wydarzenia: " . ($type ?: '-') . "\nStrona zapytania: " . ($source ?: '-') . "\n\n"
      . "Wiadomość:\n" . ($message ?: '-') . "\n\n"
      . "Potwierdzono zapoznanie z polityką prywatności: tak\n";

$headers = [
    'From: Formularz Kalinówka <' . MAIL_FROM . '>',
    'Reply-To: ' . $email,
    'MIME-Version: 1.0',
    'Content-Type: text/plain; charset=UTF-8',
    'Content-Transfer-Encoding: 8bit',
];
$subject = '=?UTF-8?B?' . base64_encode('Zapytanie o termin: ' . $name) . '?=';

if (!mail(MAIL_TO, $subject, $body, implode("\r\n", $headers), '-f' . MAIL_FROM)) {
    error_log('kalinowka send.php: mail() failed');
    out(false, 'Nie udało się wysłać wiadomości. Zadzwoń: 501 743 517.', 500);
}

$hits[] = $now;
@file_put_contents($rl, implode("\n", $hits), LOCK_EX);
@file_put_contents($dayFile, (string)($dayCount + 1), LOCK_EX);
@touch($dup);
out(true);
