(function(){
    "use strict";
    var config=window.HIMALAYA_SUPABASE_URL&&window.HIMALAYA_SUPABASE_PUBLISHABLE_KEY;
    function esc(value){return String(value||"").replace(/[&<>"']/g,function(c){return {"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c];});}
    function start(){var host=document.getElementById("cms-stories"),section=document.getElementById("cms-stories-section");if(!host||!section||!config||!window.supabase)return;
        var client=window.supabase.createClient(window.HIMALAYA_SUPABASE_URL,window.HIMALAYA_SUPABASE_PUBLISHABLE_KEY);
        client.from("blog_posts").select("h1,seo_title,slug,category_label,excerpt,featured_image_url,featured_image_alt,published_at").eq("status","published").is("deleted_at",null).order("published_at",{ascending:false}).then(function(result){if(result.error||!result.data||!result.data.length)return;
            section.hidden=false;host.innerHTML=result.data.map(function(post){return '<article class="blog-card"><div class="blog-card-image">'+(post.featured_image_url?'<img loading="lazy" src="'+esc(post.featured_image_url)+'" alt="'+esc(post.featured_image_alt)+'">':'<div class="cms-card-placeholder">HIMALAYAN JOURNAL</div>')+'<span>'+esc(post.category_label||"JOURNAL")+'</span></div><div class="blog-card-content"><small>'+esc(post.published_at?new Date(post.published_at).toLocaleDateString(undefined,{day:"numeric",month:"long",year:"numeric"}):"")+'</small><h3>'+esc(post.h1)+'</h3><p>'+esc(post.excerpt)+'</p><a href="/blog/'+encodeURIComponent(post.slug)+'">READ STORY ↗</a></div></article>';}).join("");
        });
    }
    if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",start);else start();
}());
