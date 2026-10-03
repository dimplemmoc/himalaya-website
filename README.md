# Live Local Himalaya

Static, multi-page website for Live Local Himalaya.

## Project layout

- The HTML files in the project root are the public page routes. Keeping them there preserves the existing page URLs.
- `css/` contains the shared stylesheet and page-specific stylesheets.
- `js/` contains shared site behavior and the blog article routing.
- `details.html` and `js/details.js` provide matching detail pages for experiences, stays and packages.
- `components/` contains the reusable navigation and footer fragments.
- `images/` contains the website's images and video.
- `reference/captured-site/` contains the saved reference website and its companion files.

Serve the project root over HTTP when previewing the site so the shared header and footer fragments can load in the browser.

## Blog CMS setup

The website stays a static Vercel site. Blog records and categories live in Supabase Database, public blog images use the `blog-media` bucket, and imported source documents use the private `blog-documents` bucket. The site's existing pages and legacy journal stories remain in place; CMS posts appear in a separate journal section and use `/blog/{slug}` URLs.

### One-time Supabase setup

1. Create a Supabase project and open **SQL Editor**. Run `supabase/migrations/202610030001_blog_cms.sql`.
2. In Supabase **Authentication → Users**, create the first editor account with the email and password the client will use to sign in. Keep public sign-ups disabled.
3. Add that account to the CMS allow-list from SQL Editor, replacing the email below:

   ```sql
   insert into public.cms_admins (user_id, email)
   select id, email from auth.users where lower(email) = lower('editor@example.com')
   on conflict (user_id) do update set email = excluded.email;
   ```

   Repeat this for each editor account. The `cms_admins` table is checked by row-level security; a Supabase login alone does not grant CMS access.
4. In **Project Settings → API**, copy the Project URL and the public `anon` key into `js/supabase-config.js`. These two values are intended for the browser. **Never put a `service_role` key in this file or in website code.**
5. In **Authentication → URL Configuration**, set the production site as the Site URL and add its `/admin` URL to the allowed redirect URLs. Give the client the `/admin` link and their editor credentials; their normal workflow does not require Supabase or Vercel dashboards.
6. Preview the website and confirm sign-in, draft save, publish, edit, trash/restore, version restore, category management, image upload, and `/blog/{slug}`. Publishing writes to Supabase, so the public journal updates without a Vercel deployment.

If Supabase is not configured yet, `/admin` displays a setup notice. The supplied website repo does not include Supabase credentials, an existing Supabase project, or Vercel account access, so a live publish cannot be exercised until the owner completes the one-time setup above. Do not commit real project keys.
