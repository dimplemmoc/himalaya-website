<?php
declare(strict_types=1);
require_once __DIR__ . '/../config.php';
header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: no-store');
if (session_status() !== PHP_SESSION_ACTIVE) {
    session_set_cookie_params(['lifetime'=>0, 'path'=>'/', 'secure'=>!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off', 'httponly'=>true, 'samesite'=>'Lax']);
    session_start();
}
function json_response(array $data, int $status = 200): void {
    http_response_code($status);
    echo json_encode($data, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    exit;
}
function require_admin(): string {
    $username = $_SESSION['llh_admin'] ?? null;
    if (!is_string($username) || $username === '') json_response(['error'=>'Please sign in as admin.'], 401);
    return $username;
}
function csrf_token(): string {
    if (empty($_SESSION['llh_csrf'])) $_SESSION['llh_csrf'] = bin2hex(random_bytes(32));
    return (string)$_SESSION['llh_csrf'];
}
function require_csrf(array $data): void {
    $provided = (string)($data['csrf_token'] ?? '');
    $expected = (string)($_SESSION['llh_csrf'] ?? '');
    if ($expected === '' || !hash_equals($expected, $provided)) {
        json_response(['error'=>'Your session expired. Refresh the page and try again.'], 403);
    }
}
function read_json_body(): array {
    $raw = file_get_contents('php://input');
    $data = json_decode($raw === false ? '' : $raw, true);
    if (!is_array($data)) json_response(['error'=>'Please send valid JSON.'], 400);
    return $data;
}
