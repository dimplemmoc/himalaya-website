# Run the blog admin locally with XAMPP

This version uses PHP sessions and MySQL on your computer. It does not require Aiven, Vercel database services, Node, or Composer.

## First-time setup

1. Install XAMPP if it is not already installed. Open **XAMPP Control Panel** and click **Start** beside **Apache** and **MySQL**.
2. Copy this whole project folder into `C:\xampp\htdocs\himalaya` (rename the folder to `himalaya` so the URL stays simple).
3. Open `http://localhost/phpmyadmin`, choose **Import**, select `C:\xampp\htdocs\himalaya\database\setup.sql`, and click **Import** at the bottom.
4. Open `http://localhost/himalaya/setup-admin.php`. Create the admin username and password. The password is saved as a one-way password hash in MySQL. This setup page locks itself after the first admin is created.
5. Admin login: `http://localhost/himalaya/admin.html`.
6. Public blog: `http://localhost/himalaya/blog.html`.

The admin form can add, edit, and delete posts. The public journal shows the latest publication date first and allows month/date filtering. A story opens at its own blog detail page. Cover images use HTTPS image URLs.

## XAMPP database login defaults

`config.php` uses XAMPP's usual local MySQL defaults: host `127.0.0.1`, database `himalaya_blog`, username `root`, and a blank password. If you set a MySQL root password in XAMPP, add it to `config.php` locally as `$password` or define `BLOG_DB_PASSWORD` in your Apache/PHP environment. Do not upload real passwords to GitHub.

## Local-only note

`localhost` means the website runs on this computer. Your Vercel site and the public internet cannot use this local database. To let your client and viewers use the admin/blog online, the same PHP app and MySQL database must later be hosted on an internet-accessible PHP host, then the Vercel page can call that API. Never expose XAMPP directly to the internet.

## Prepare the complete site for a live PHP host

The simplest launch is to host this **whole project folder** on one PHP + MySQL hosting account. The `.html`, CSS, JavaScript, PHP API, and database then share the same website address, so the blog pages can call `api/blogs.php` without cross-site browser settings.

1. Choose a PHP hosting plan that includes HTTPS, PHP 8.1 or newer, PDO MySQL, and a MySQL database. XAMPP on a personal computer is for local work, not public hosting.
2. Create the hosting database and database user in the provider dashboard. Import `database/setup.sql` into that database using the provider's phpMyAdmin or database tool.
3. Upload the project files to the website's document root. Do not upload the `.git` folder. Keep the root `.htaccess` and `database/.htaccess` files; they block directory listings and direct downloads of setup files.
4. In the hosting provider's PHP environment settings, set `BLOG_ENV=production`, `BLOG_DB_HOST`, `BLOG_DB_NAME`, `BLOG_DB_USER`, and `BLOG_DB_PASSWORD`. Use the database details from the provider, not XAMPP's `root` account. Never put the live database password in GitHub or in browser JavaScript.
5. Open the live HTTPS address ending in `/setup-admin.php` once and create the client's admin login. After setup, sign in at `/admin.html` and publish a small sample story; confirm it appears on `/blog.html` and opens correctly.
6. Keep the setup page protected by its one-time account check; once an admin exists it no longer permits creating another account.

If you keep the public pages on Vercel while hosting PHP elsewhere, this project needs additional API-address, HTTPS session, and cross-origin configuration. The current browser code uses same-origin API paths, so uploading only the PHP files to another host will not connect them automatically. Vercel documents PHP through a community runtime rather than an officially supported runtime; a single PHP host for this existing PHP/MySQL setup is the simpler route.
