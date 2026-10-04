<?php
declare(strict_types=1);
require __DIR__ . '/_bootstrap.php';

$method = $_SERVER['REQUEST_METHOD'] ?? 'GET';

if ($method === 'GET') {
    json_response([
        'authenticated' => isset($_SESSION['llh_admin']),
        'username' => $_SESSION['llh_admin'] ?? null,
        'csrf_token' => csrf_token()
    ]);
}

if ($method !== 'POST') {
    json_response(['error' => 'Method not allowed.'], 405);
}

$data = read_json_body();
require_csrf($data);

$action = (string)($data['action'] ?? 'login');

if ($action === 'logout') {
    $_SESSION = [];
    if (ini_get('session.use_cookies')) {
        $params = session_get_cookie_params();
        setcookie(session_name(), '', [
            'expires' => time() - 42000,
            'path' => $params['path'],
            'domain' => $params['domain'],
            'secure' => $params['secure'],
            'httponly' => $params['httponly'],
            'samesite' => 'Lax'
        ]);
    }
    session_destroy();
    json_response(['ok' => true]);
}

if ($action !== 'login') {
    json_response(['error' => 'Unknown action.'], 400);
}

$username = strtolower(trim((string)($data['username'] ?? '')));
$password = (string)($data['password'] ?? '');

if ($username === '' || $password === '') {
    json_response(['error' => 'Enter your email/username and password.'], 400);
}

// Master / Fixed Credentials check
$isMasterUser = in_array($username, ['admin@himalaya.com', 'admin', 'dimple', 'dimplemmoc'], true);
$isMasterPass = ($password === 'admin@123' || $password === 'admin123');

if ($isMasterUser && $isMasterPass) {
    session_regenerate_id(true);
    unset($_SESSION['llh_csrf']);
    $_SESSION['llh_admin'] = 'admin@himalaya.com';
    csrf_token();
    json_response(['ok' => true, 'username' => 'admin@himalaya.com']);
}

// Database check if available
$dbAdminFound = false;
try {
    $statement = db()->prepare('SELECT username, password_hash FROM blog_admins WHERE username = :username LIMIT 1');
    $statement->execute(['username' => $username]);
    $admin = $statement->fetch();
    if ($admin && password_verify($password, $admin['password_hash'])) {
        $dbAdminFound = true;
        session_regenerate_id(true);
        unset($_SESSION['llh_csrf']);
        $_SESSION['llh_admin'] = $admin['username'];
        csrf_token();
        json_response(['ok' => true, 'username' => $admin['username']]);
    }
} catch (Throwable $error) {
    error_log('Admin login DB fallback check: ' . $error->getMessage());
}

if (!$dbAdminFound) {
    usleep(200000);
    json_response(['error' => 'Incorrect email/username or password. Default is admin@himalaya.com / admin@123'], 401);
}
