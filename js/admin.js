(function () {
    "use strict";
    var supabase = null, user = null, posts = [], categories = [], editingPost = null;
    var byId = function (id) { return document.getElementById(id); };
    var esc = function (value) { return String(value || "").replace(/[&<>"']/g, function (c) { return {"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]; }); };
    var slugify = function (value) { return String(value || "").normalize("NFKD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, ""); };
    var message = function (id, text, bad) { var el = byId(id); el.textContent = text || ""; el.classList.toggle("is-error", !!bad); };
    function showConnectionIssue(text) { var el = byId("connection-notice"); el.textContent = text; el.hidden = false; }
    function editorContent(html) { return window.DOMPurify ? DOMPurify.sanitize(html || "", {USE_PROFILES:{html:true}}) : ""; }
    function formatDate(value) { return value ? new Date(value).toLocaleDateString(undefined,{day:"numeric",month:"short",year:"numeric"}) : "Not published"; }
    function currentView(name) {
        ["posts","trash","categories","activity"].forEach(function (key) { byId(key + "-panel").hidden = key !== name; });
        document.querySelectorAll(".cms-tabs button").forEach(function (button) { button.classList.toggle("is-active",button.dataset.view === name); });
        if (name === "activity") loadActivity();
    }
    async function init() {
        if (!window.supabase || !window.HIMALAYA_SUPABASE_URL || !window.HIMALAYA_SUPABASE_ANON_KEY) {
            showConnectionIssue("Supabase is not connected yet. Add the project URL and public anon key in js/supabase-config.js, then apply the setup steps in README.md.");
            return;
        }
        supabase = window.supabase.createClient(window.HIMALAYA_SUPABASE_URL, window.HIMALAYA_SUPABASE_ANON_KEY);
        byId("login-form").addEventListener("submit", login);
        byId("signout-button").addEventListener("click", async function () { await supabase.auth.signOut(); location.reload(); });
        byId("post-search").addEventListener("input", renderPosts);
        byId("status-filter").addEventListener("change", renderPosts);
        byId("new-post").addEventListener("click", function () { openEditor(null); });
        byId("close-editor").addEventListener("click", closeEditor); byId("cancel-editor").addEventListener("click", closeEditor);
        byId("save-draft").addEventListener("click", function () { savePost("draft"); });
        byId("publish-post").addEventListener("click", function () { savePost("published"); });
        byId("post-h1").addEventListener("input", function () { if (!byId("post-id").value || !byId("post-slug").dataset.edited) byId("post-slug").value = slugify(this.value); if (!byId("post-seo-title").dataset.edited) byId("post-seo-title").value = this.value; });
        byId("post-seo-title").addEventListener("input", function () { this.dataset.edited = "true"; });
        byId("post-slug").addEventListener("input", function () { this.dataset.edited = "true"; this.value = slugify(this.value); });
        byId("image-file").addEventListener("change", imagePreview); byId("image-url").addEventListener("input", imagePreview);
        byId("document-file").addEventListener("change", importDocument);
        document.querySelectorAll(".editor-toolbar [data-command]").forEach(function (button) { button.addEventListener("click", function () { byId("content-editor").focus(); document.execCommand(button.dataset.command,false,button.dataset.value || null); }); });
        byId("add-link").addEventListener("click", addLink); byId("add-table").addEventListener("click", addTable);
        byId("inline-image-file").addEventListener("change", uploadInlineImage);
        byId("category-form").addEventListener("submit", createCategory);
        document.querySelectorAll(".cms-tabs button").forEach(function (button) { button.addEventListener("click", function () { currentView(button.dataset.view); }); });
        document.addEventListener("click", onActionClick);
        var result = await supabase.auth.getSession();
        if (result.data.session) { user = result.data.session.user; await signedIn(); } else { byId("login-view").hidden = false; }
        supabase.auth.onAuthStateChange(function (_event, session) { if (!session) { byId("app-view").hidden=true; byId("login-view").hidden=false; } });
    }
    async function login(event) {
        event.preventDefault(); message("login-message","Signing in…");
        var result = await supabase.auth.signInWithPassword({email:byId("login-email").value.trim(),password:byId("login-password").value});
        if (result.error) return message("login-message",result.error.message,true);
        user = result.data.user; await signedIn();
    }
    async function signedIn() {
        byId("login-view").hidden = true; byId("app-view").hidden = false; byId("signout-button").hidden = false;
        var adminCheck = await supabase.from("cms_admins").select("user_id").eq("user_id",user.id).maybeSingle();
        if (adminCheck.error || !adminCheck.data) { await supabase.auth.signOut(); byId("login-view").hidden=false; byId("app-view").hidden=true; return message("login-message","This account is not on the CMS admin list. Ask the site owner to add your email in Supabase setup.",true); }
        await Promise.all([loadPosts(),loadCategories()]);
    }
    async function loadPosts() {
        var result = await supabase.from("blog_posts").select("*").order("updated_at",{ascending:false});
        if (result.error) { showConnectionIssue("Could not load blog posts: " + result.error.message); return; }
        posts = result.data || []; renderPosts(); renderTrash();
    }
    async function loadCategories() {
        var result = await supabase.from("blog_categories").select("*").order("name");
        if (result.error) return;
        categories=result.data||[]; var select=byId("post-category"); select.innerHTML='<option value="">Choose category</option>'+categories.map(function(c){return '<option value="'+esc(c.id)+'">'+esc(c.name)+'</option>';}).join("");
        byId("category-list").innerHTML=categories.length ? categories.map(function(c){return '<div class="category-row"><span>'+esc(c.name)+'</span><button class="text-action" data-action="delete-category" data-id="'+esc(c.id)+'">Remove</button></div>';}).join("") : '<p class="cms-empty">No categories yet.</p>';
    }
    function renderPosts() {
        var query=byId("post-search").value.trim().toLowerCase(), status=byId("status-filter").value;
        var visible=posts.filter(function(p){return !p.deleted_at && (status==="all"||p.status===status) && (!query||(p.h1+" "+p.seo_title).toLowerCase().includes(query));});
        byId("posts-list").innerHTML=visible.length ? visible.map(function(p){return '<article class="cms-post-row"><div class="post-thumb">'+(p.featured_image_url?'<img src="'+esc(p.featured_image_url)+'" alt="">':'<span>H</span>')+'</div><div class="post-summary"><h3>'+esc(p.h1)+'</h3><p>'+esc(p.category_label||"Uncategorized")+' <span>·</span> '+esc(p.slug)+'</p></div><span class="status-pill status-'+esc(p.status)+'">'+esc(p.status)+'</span><span class="post-date">'+formatDate(p.updated_at)+'</span><div class="row-actions"><button data-action="edit" data-id="'+esc(p.id)+'">Edit</button><button data-action="trash" data-id="'+esc(p.id)+'">Delete</button></div></article>';}).join("") : '<div class="cms-empty">No stories match this search.</div>';
    }
    function renderTrash() {
        var items=posts.filter(function(p){return !!p.deleted_at;});
        byId("trash-list").innerHTML=items.length?items.map(function(p){return '<article class="cms-post-row"><div class="post-summary"><h3>'+esc(p.h1)+'</h3><p>Deleted '+formatDate(p.deleted_at)+'</p></div><button class="button-secondary" data-action="restore" data-id="'+esc(p.id)+'">Restore</button></article>';}).join(""):'<div class="cms-empty">Trash is empty.</div>';
    }
    function openEditor(post) {
        editingPost=post||null; byId("post-form").reset(); byId("post-id").value=post?post.id:""; byId("editor-heading").textContent=post?"Edit story":"New story";
        byId("post-h1").value=post?post.h1:""; byId("post-seo-title").value=post?post.seo_title:""; byId("post-seo-title").dataset.edited=post?"true":"";
        byId("post-slug").value=post?post.slug:""; byId("post-slug").dataset.edited=post?"true":""; byId("post-category").value=post?post.category_id||"":"";
        byId("post-excerpt").value=post?post.excerpt:""; byId("image-url").value=post?post.featured_image_url:""; byId("image-alt").value=post?post.featured_image_alt:"";
        byId("post-description").value=post?post.seo_description:""; byId("content-editor").innerHTML=post?editorContent(post.content_html):""; imagePreview(); message("save-message","");
        byId("version-section").hidden=!post; if(post) loadVersions(post.id);
        byId("post-form").onsubmit=function(event){event.preventDefault();};
        byId("editor-dialog").showModal();
    }
    function closeEditor(){byId("editor-dialog").close();editingPost=null;}
    function imagePreview(){var url=byId("image-url").value.trim(), file=byId("image-file").files[0], box=byId("image-preview");if(file)url=URL.createObjectURL(file);box.hidden=!url;box.innerHTML=url?'<img src="'+esc(url)+'" alt="Preview">':'';}
    async function upload(file,bucket) {
        var safe=file.name.toLowerCase().replace(/[^a-z0-9._-]+/g,"-"); var path=user.id+"/"+Date.now()+"-"+safe;
        var result=await supabase.storage.from(bucket).upload(path,file,{upsert:false,contentType:file.type}); if(result.error)throw result.error;
        return bucket==="blog-media"?supabase.storage.from(bucket).getPublicUrl(path).data.publicUrl:path;
    }
    async function savePost(status) {
        var h1=byId("post-h1").value.trim(), slug=slugify(byId("post-slug").value||h1);
        if(!h1||!slug){return message("save-message","Add a heading and a valid URL slug.",true);}
        message("save-message","Saving…");
        try {
            var imageUrl=byId("image-url").value.trim(), imageFile=byId("image-file").files[0];
            if(imageFile) imageUrl=await upload(imageFile,"blog-media");
            var category=categories.find(function(c){return c.id===byId("post-category").value;});
            var payload={h1:h1,seo_title:byId("post-seo-title").value.trim()||h1,slug:slug,category_id:category?category.id:null,category_label:category?category.name:"",excerpt:byId("post-excerpt").value.trim(),content_html:editorContent(byId("content-editor").innerHTML),featured_image_url:imageUrl,featured_image_alt:byId("image-alt").value.trim(),seo_description:byId("post-description").value.trim(),status:status,published_at:status==="published"?(editingPost&&editingPost.published_at||new Date().toISOString()):null,updated_by:user.id,updated_at:new Date().toISOString(),deleted_at:null};
            var result=editingPost?await supabase.from("blog_posts").update(payload).eq("id",editingPost.id).select().single():await supabase.from("blog_posts").insert(Object.assign(payload,{created_by:user.id})).select().single();
            if(result.error)throw result.error;
            var doc=byId("document-file").files[0]; if(doc) await upload(doc,"blog-documents");
            closeEditor(); await loadPosts(); message("save-message","");
        } catch(error){message("save-message",error.message||"Could not save this story.",true);}
    }
    async function createCategory(event){event.preventDefault();var name=byId("category-name").value.trim();if(!name)return;var slug=slugify(name);var result=await supabase.from("blog_categories").insert({name:name,slug:slug});if(result.error)return alert(result.error.message);byId("category-name").value="";await loadCategories();}
    async function loadActivity(){var result=await supabase.from("blog_activity").select("*").order("created_at",{ascending:false}).limit(100);if(result.error){byId("activity-list").textContent=result.error.message;return;}byId("activity-list").innerHTML=result.data.length?result.data.map(function(a){return '<div class="activity-row"><span>'+esc(a.action)+'</span><b>'+esc(a.post_title)+'</b><time>'+formatDate(a.created_at)+'</time></div>';}).join(""):'<p class="cms-empty">No activity yet.</p>';}
    async function loadVersions(id){var result=await supabase.from("blog_post_versions").select("id,snapshot,changed_at").eq("post_id",id).order("changed_at",{ascending:false}).limit(20);if(result.error)return;var section=byId("version-section");section.hidden=!result.data.length;byId("version-list").innerHTML=result.data.map(function(v){return '<div class="version-row"><span>'+formatDate(v.changed_at)+'</span><button data-action="version" data-id="'+v.id+'">Restore this version</button></div>';}).join("");}
    async function onActionClick(event){var button=event.target.closest("[data-action]");if(!button)return;var action=button.dataset.action,id=button.dataset.id,post=posts.find(function(p){return p.id===id;});
        if(action==="edit"&&post)openEditor(post);
        if(action==="trash"&&post){var r=await supabase.from("blog_posts").update({deleted_at:new Date().toISOString(),status:"unpublished",updated_by:user.id,updated_at:new Date().toISOString()}).eq("id",id);if(r.error)alert(r.error.message);else await loadPosts();}
        if(action==="restore"&&post){var r2=await supabase.from("blog_posts").update({deleted_at:null,updated_by:user.id,updated_at:new Date().toISOString()}).eq("id",id);if(r2.error)alert(r2.error.message);else await loadPosts();}
        if(action==="delete-category"){var r3=await supabase.from("blog_categories").delete().eq("id",id);if(r3.error)alert(r3.error.message);else await loadCategories();}
        if(action==="version")restoreVersion(id);
    }
    async function restoreVersion(versionId){var result=await supabase.from("blog_post_versions").select("snapshot").eq("id",versionId).single();if(result.error)return alert(result.error.message);var snapshot=result.data.snapshot;var fields=["h1","seo_title","slug","category_id","category_label","excerpt","content_html","featured_image_url","featured_image_alt","seo_description","status","published_at"];var payload={};fields.forEach(function(k){payload[k]=snapshot[k];});payload.updated_by=user.id;payload.updated_at=new Date().toISOString();var saved=await supabase.from("blog_posts").update(payload).eq("id",editingPost.id);if(saved.error)return alert(saved.error.message);var latest=(await supabase.from("blog_posts").select("*").eq("id",editingPost.id).single()).data;await loadPosts();openEditor(latest);}
    async function importDocument(event){var file=event.target.files[0];if(!file)return;message("document-status","Reading document…");try{var ext=file.name.split(".").pop().toLowerCase(),html="";if(ext==="docx"){if(!window.mammoth)throw new Error("Document reader did not load.");var result=await mammoth.convertToHtml({arrayBuffer:await file.arrayBuffer()});html=result.value;}else if(ext==="pdf"){if(!window.pdfjsLib)throw new Error("PDF reader did not load.");pdfjsLib.GlobalWorkerOptions.workerSrc="https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js";var pdf=await pdfjsLib.getDocument({data:await file.arrayBuffer()}).promise;for(var p=1;p<=pdf.numPages;p++){var page=await pdf.getPage(p),content=await page.getTextContent(),text=content.items.map(function(i){return i.str;}).join(" ");html+="<p>"+esc(text)+"</p>";}}else if(ext==="doc"){throw new Error("Please save this Word file as DOCX, then import it.");}else{throw new Error("Choose a DOCX or PDF file.");}byId("content-editor").innerHTML=editorContent(html);message("document-status","Text imported. Review and edit it before publishing.");}catch(error){message("document-status",error.message,true);}}
    function addLink(){var url=prompt("Paste the link URL:");if(!url)return;try{var parsed=new URL(url,location.href);if(!["http:","https:","mailto:"].includes(parsed.protocol))throw new Error();}catch(_e){return alert("Enter a valid http, https, or email link.");}var follow=confirm("Choose OK for a normal follow link. Choose Cancel for no-follow.");byId("content-editor").focus();document.execCommand("createLink",false,url);var selection=window.getSelection();if(selection&&selection.anchorNode){var node=selection.anchorNode.parentElement.closest("a");if(node){node.rel=follow?"":"nofollow";node.target="_blank";node.rel+=(node.rel?" ":"")+"noopener noreferrer";node.dataset.follow=follow?"follow":"nofollow";}}}
    function addTable(){var rows=parseInt(prompt("Number of rows (1–10):","3"),10)||3,cols=parseInt(prompt("Number of columns (1–6):","2"),10)||2;rows=Math.min(10,Math.max(1,rows));cols=Math.min(6,Math.max(1,cols));var table=document.createElement("table"),body=document.createElement("tbody");for(var r=0;r<rows;r++){var tr=document.createElement("tr");for(var c=0;c<cols;c++){var cell=document.createElement(r===0?"th":"td");cell.innerHTML="<br>";tr.appendChild(cell);}body.appendChild(tr);}table.appendChild(body);byId("content-editor").appendChild(table);}
    async function uploadInlineImage(event){var file=event.target.files[0];if(!file)return;try{var url=await upload(file,"blog-media");var img=document.createElement("img");img.src=url;img.alt=prompt("Image alt text:","")||"";byId("content-editor").appendChild(img);}catch(error){alert(error.message);}event.target.value="";}
    document.addEventListener("DOMContentLoaded",init);
}());
