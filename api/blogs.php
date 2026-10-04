<?php
declare(strict_types=1);
require __DIR__ . '/_bootstrap.php';

function text_length(string $value): int {
    preg_match_all('/./us', $value, $matches);
    return count($matches[0]);
}
function valid_date(string $value): bool {
    if (!preg_match('/^\d{4}-\d{2}-\d{2}$/', $value)) return false;
    [$year, $month, $day] = array_map('intval', explode('-', $value));
    return checkdate($month, $day, $year);
}
function make_slug(string $title): string {
    $plain = function_exists('iconv') ? iconv('UTF-8', 'ASCII//TRANSLIT//IGNORE', $title) : $title;
    if ($plain === false) $plain = $title;
    $slug = strtolower(trim(preg_replace('/[^a-zA-Z0-9]+/', '-', $plain) ?? '', '-'));
    return $slug !== '' ? $slug : 'himalaya-story';
}
function public_post(array $row): array {
    return [
        'id' => (int)$row['id'], 'slug' => $row['slug'], 'title' => $row['title'],
        'category' => $row['category'], 'excerpt' => $row['excerpt'], 'content' => $row['content'],
        'image_url' => $row['image_url'], 'published_at' => $row['published_at'],
    ];
}
$method = $_SERVER['REQUEST_METHOD'] ?? 'GET';
try { $pdo = db(); } catch (Throwable $error) { error_log('Blog API database error: ' . $error->getMessage()); json_response(['error'=>blog_environment() === 'production' ? 'The blog database is not available. Check the PHP hosting database settings.' : 'Database is not ready. Start MySQL in XAMPP and import database/setup.sql.'], 503); }

if ($method === 'GET') {
    $slug = trim((string)($_GET['slug'] ?? ''));
    if ($slug !== '') {
        $statement = $pdo->prepare("SELECT id, slug, title, category, excerpt, content, image_url, published_at FROM blog_posts WHERE slug = :slug AND status = 'published' LIMIT 1");
        $statement->execute(['slug' => $slug]);
        $row = $statement->fetch();
        if (!$row) json_response(['error' => 'Story not found.'], 404);
        json_response(['post' => public_post($row)]);
    }
    $date = trim((string)($_GET['date'] ?? ''));
    $month = trim((string)($_GET['month'] ?? ''));
    if ($date !== '' && !valid_date($date)) json_response(['error' => 'Date must use YYYY-MM-DD.'], 400);
    if ($month !== '' && !preg_match('/^\d{4}-(0[1-9]|1[0-2])$/', $month)) json_response(['error' => 'Month must use YYYY-MM.'], 400);
    $sql = "SELECT id, slug, title, category, excerpt, content, image_url, published_at FROM blog_posts WHERE status = 'published'";
    $params = [];
    if ($date !== '') { $sql .= ' AND published_at = :date'; $params['date'] = $date; }
    elseif ($month !== '') { $sql .= ' AND DATE_FORMAT(published_at, \'%Y-%m\') = :month'; $params['month'] = $month; }
    $sql .= ' ORDER BY published_at DESC, id DESC LIMIT 100';
    $statement = $pdo->prepare($sql);
    $statement->execute($params);
    json_response(['posts' => array_map('public_post', $statement->fetchAll())]);
}

if ($method !== 'POST') json_response(['error' => 'Method not allowed.'], 405);
require_admin();
$data = read_json_body();
require_csrf($data);
$action = (string)($data['action'] ?? 'save');
if ($action === 'delete') {
    $id = filter_var($data['id'] ?? null, FILTER_VALIDATE_INT);
    if (!$id) json_response(['error' => 'Choose a valid story.'], 400);
    $statement = $pdo->prepare('DELETE FROM blog_posts WHERE id = :id');
    $statement->execute(['id' => $id]);
    json_response(['ok' => true]);
}
if ($action !== 'save') json_response(['error' => 'Unknown action.'], 400);
$title = trim((string)($data['title'] ?? ''));
$category = trim((string)($data['category'] ?? ''));
$excerpt = trim((string)($data['excerpt'] ?? ''));
$content = trim((string)($data['content'] ?? ''));
$date = trim((string)($data['published_at'] ?? ''));
$image = trim((string)($data['image_url'] ?? ''));
$id = isset($data['id']) ? filter_var($data['id'], FILTER_VALIDATE_INT) : null;
if ($title === '' || text_length($title) > 300 || $category === '' || text_length($category) > 80 || $excerpt === '' || text_length($excerpt) > 1200 || $content === '' || !valid_date($date)) {
    json_response(['error' => 'Please fill in the title, category, introduction, story, and a valid date.'], 400);
}
if ($image !== '' && (!filter_var($image, FILTER_VALIDATE_URL) || !preg_match('/^https:\/\//i', $image))) {
    json_response(['error' => 'Cover image must use a valid HTTPS URL.'], 400);
}
$baseSlug = make_slug($title);
$slug = $baseSlug . '-' . bin2hex(random_bytes(3));
if ($id) {
    $check = $pdo->prepare('SELECT id FROM blog_posts WHERE id = :id');
    $check->execute(['id' => $id]);
    if (!$check->fetch()) json_response(['error' => 'Story not found.'], 404);
    $statement = $pdo->prepare('UPDATE blog_posts SET title=:title, slug=:slug, category=:category, excerpt=:excerpt, content=:content, image_url=:image, published_at=:published_at, status=\'published\', updated_at=CURRENT_TIMESTAMP WHERE id=:id');
    $statement->execute(['title'=>$title, 'slug'=>$slug, 'category'=>$category, 'excerpt'=>$excerpt, 'content'=>$content, 'image'=>$image !== '' ? $image : null, 'published_at'=>$date, 'id'=>$id]);
} else {
    $statement = $pdo->prepare('INSERT INTO blog_posts (slug, title, category, excerpt, content, image_url, published_at, status) VALUES (:slug,:title,:category,:excerpt,:content,:image,:published_at,\'published\')');
    $statement->execute(['slug'=>$slug, 'title'=>$title, 'category'=>$category, 'excerpt'=>$excerpt, 'content'=>$content, 'image'=>$image !== '' ? $image : null, 'published_at'=>$date]);
    $id = (int)$pdo->lastInsertId();
}
json_response(['ok'=>true, 'id'=>(int)$id, 'slug'=>$slug]);
