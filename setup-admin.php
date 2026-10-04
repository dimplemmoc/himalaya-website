<?php
declare(strict_types=1);
require __DIR__ . '/config.php';
if (session_status() !== PHP_SESSION_ACTIVE) {
    session_set_cookie_params(['lifetime'=>0, 'path'=>'/', 'secure'=>!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off', 'httponly'=>true, 'samesite'=>'Lax']);
    session_start();
}
if (empty($_SESSION['admin_setup_token'])) $_SESSION['admin_setup_token'] = bin2hex(random_bytes(32));
$message = '';
$created = false;
try {
    $count = (int)db()->query('SELECT COUNT(*) FROM blog_admins')->fetchColumn();
} catch (Throwable $error) {
    $count = -1;
    $message = blog_environment() === 'production' ? 'The hosted database is not ready. Check the PHP hosting database settings first.' : 'Start MySQL in XAMPP and import database/setup.sql in phpMyAdmin first.';
}
if ($count === 0 && ($_SERVER['REQUEST_METHOD'] ?? 'GET') === 'POST') {
    $token = (string)($_POST['setup_token'] ?? '');
    $username = trim((string)($_POST['username'] ?? ''));
    $password = (string)($_POST['password'] ?? '');
    $confirm = (string)($_POST['confirm_password'] ?? '');
    if (!hash_equals((string)$_SESSION['admin_setup_token'], $token)) $message = 'Refresh this page and try again.';
    elseif (!preg_match('/^[A-Za-z0-9_.-]{3,80}$/', $username)) $message = 'Use 3–80 letters, numbers, dots, underscores, or hyphens for the username.';
    elseif (strlen($password) < 12) $message = 'Choose a password with at least 12 characters.';
    elseif ($password !== $confirm) $message = 'The two passwords do not match.';
    else {
        try {
            $insert = db()->prepare('INSERT INTO blog_admins (username, password_hash) VALUES (:username, :password_hash)');
            $insert->execute(['username'=>$username, 'password_hash'=>password_hash($password, PASSWORD_DEFAULT)]);
            unset($_SESSION['admin_setup_token']);
            $created = true;
            $count = 1;
        } catch (Throwable $error) {
            error_log('Initial blog admin creation failed: ' . $error->getMessage());
            $message = 'Could not create the admin. Check that the database is ready and try again.';
        }
    }
}
?>
<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Set up Journal Admin</title><link rel="stylesheet" href="css/admin.css"><style>body{font-family:system-ui,sans-serif}.setup-note{max-width:480px;margin:12px auto;color:#718078;font-size:12px;line-height:1.7}.success-box{padding:15px;background:#edf5ed;color:#315c3f;border:1px solid #cfe0cf;font-size:13px;line-height:1.7}.setup-link{display:inline-block;margin-top:15px;color:#234637}</style></head>
<body class="journal-admin"><div class="admin-top"><a href="blog.html" class="admin-brand">LIVE LOCAL <span>HIMALAYA</span></a><a href="blog.html" class="back-site">View public journal ↗</a></div>
<main class="admin-wrap"><section class="login-card"><span class="admin-kicker">ONE-TIME SETUP</span>
<?php if ($count < 0): ?><h1>Database first</h1><p><?= htmlspecialchars($message, ENT_QUOTES, 'UTF-8') ?></p>
<?php elseif ($count > 0): ?><h1>Admin already set</h1><div class="success-box"><?= $created ? 'Your admin login is ready.' : 'An admin account already exists. Sign in to manage the journal.' ?><br><a class="setup-link" href="admin.html">Open admin sign in →</a></div>
<?php else: ?><h1>Create admin login</h1><p>This one-time form creates the admin username and password for your local blog dashboard.</p><form method="post" autocomplete="off"><input type="hidden" name="setup_token" value="<?= htmlspecialchars((string)$_SESSION['admin_setup_token'], ENT_QUOTES, 'UTF-8') ?>"><label for="username">Admin username</label><input id="username" name="username" required minlength="3" maxlength="80" pattern="[A-Za-z0-9_.-]+"><label for="password">Password (at least 12 characters)</label><input id="password" name="password" type="password" required minlength="12" autocomplete="new-password"><label for="confirm_password">Confirm password</label><input id="confirm_password" name="confirm_password" type="password" required minlength="12" autocomplete="new-password"><button class="admin-primary" type="submit" style="width:100%;margin-top:22px">Create admin login →</button><?php if ($message !== ''): ?><p class="form-message"><?= htmlspecialchars($message, ENT_QUOTES, 'UTF-8') ?></p><?php endif; ?></form><?php endif; ?>
</section><p class="setup-note">Keep your admin password private. This one-time page can create the first admin account only. On a live website, the PHP files and MySQL database must be hosted online.</p></main></body></html>
