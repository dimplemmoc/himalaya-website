<?php
declare(strict_types=1);

function blog_environment(): string {
    return strtolower((string)(getenv('BLOG_ENV') ?: 'local'));
}

function db(): PDO {
    static $pdo = null;
    if ($pdo instanceof PDO) return $pdo;
    $environment = blog_environment();
    $host = getenv('BLOG_DB_HOST');
    $name = getenv('BLOG_DB_NAME');
    $user = getenv('BLOG_DB_USER');
    $password = getenv('BLOG_DB_PASSWORD');

    if ($environment === 'production') {
        if (!$host || !$name || !$user || !$password) {
            throw new RuntimeException('Production database environment variables are missing.');
        }
    } else {
        // XAMPP defaults for local development only.
        $host = $host ?: '127.0.0.1';
        $name = $name ?: 'himalaya_blog';
        $user = $user ?: 'root';
        if ($password === false) $password = '';
    }
    try {
        $pdo = new PDO('mysql:host=' . $host . ';dbname=' . $name . ';charset=utf8mb4', $user, $password, [
            PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
            PDO::ATTR_EMULATE_PREPARES => false,
        ]);
    } catch (Throwable $error) {
        error_log('Local blog database connection failed: ' . $error->getMessage());
        throw new RuntimeException($environment === 'production'
            ? 'The hosted blog database is unavailable. Check the PHP hosting database settings.'
            : 'Database is not ready. Start MySQL in XAMPP and import database/setup.sql.');
    }
    return $pdo;
}
