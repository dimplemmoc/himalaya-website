(function () {
    "use strict";
    function param(name){return new URLSearchParams(window.location.search).get(name)||"";}
    function setMeta(selector,attribute,value){var el=document.querySelector(selector);if(el&&value)el.setAttribute(attribute,value);}
    function setText(id,value){var el=document.getElementById(id);if(el)el.textContent=value||"";}
    function renderLegacy(){
        var title=param("title"),image=param("image"),category=param("category"),date=param("date"),excerpt=param("excerpt"),titleElement=document.getElementById("article-title"),imageElement=document.getElementById("article-image"),body=document.getElementById("article-body");
        if(!title){setText("article-title","Story not found");if(body)body.textContent="Choose a story from the journal to read it here.";return;}
        document.title=title+" | Live Local Himalaya";titleElement.textContent=title;setText("article-category",category||"HIMALAYAN JOURNAL");setText("article-meta",date);
        if(imageElement&&image){imageElement.src=image;imageElement.alt=param("alt")||title;imageElement.hidden=false;}
        var lead=document.createElement("p");lead.className="article-lead";lead.textContent=excerpt||"A story from the people and places of the Himalayas.";body.appendChild(lead);
    }
    function renderPost(post){
        var title=post.seo_title||post.h1;document.title=title+" | Live Local Himalaya";
        setText("article-title",post.h1);setText("article-category",post.category_label||"HIMALAYAN JOURNAL");setText("article-meta",post.published_at?new Date(post.published_at).toLocaleDateString(undefined,{day:"numeric",month:"long",year:"numeric"}):"");
        var img=document.getElementById("article-image");if(post.featured_image_url){img.src=post.featured_image_url;img.alt=post.featured_image_alt||post.h1;img.hidden=false;}else img.hidden=true;
        var body=document.getElementById("article-body");body.innerHTML="";
        if(post.excerpt){var lead=document.createElement("p");lead.className="article-lead";lead.textContent=post.excerpt;body.appendChild(lead);}
        var content=document.createElement("div");content.className="cms-article-body";content.innerHTML=window.DOMPurify?DOMPurify.sanitize(post.content_html||"",{USE_PROFILES:{html:true}}):"";body.appendChild(content);
        var canonical=window.location.origin+"/blog/"+encodeURIComponent(post.slug);setMeta('link[rel="canonical"]',"href",canonical);setMeta('meta[property="og:url"]',"content",canonical);setMeta('meta[property="og:title"]',"content",title);setMeta('meta[name="twitter:title"]',"content",title);
        if(post.seo_description){setMeta('meta[name="description"]',"content",post.seo_description);setMeta('meta[property="og:description"]',"content",post.seo_description);setMeta('meta[name="twitter:description"]',"content",post.seo_description);}
        if(post.featured_image_url){setMeta('meta[property="og:image"]',"content",post.featured_image_url);setMeta('meta[name="twitter:image"]',"content",post.featured_image_url);}
    }
    async function start(){
        var slug=param("slug")||decodeURIComponent(window.location.pathname.match(/^\/blog\/([^/]+)\/?$/)?.[1]||"");
        if(!slug){renderLegacy();return;}
        if(!window.supabase||!window.HIMALAYA_SUPABASE_URL||!window.HIMALAYA_SUPABASE_PUBLISHABLE_KEY){setText("article-title","Journal is being connected");document.getElementById("article-body").textContent="Please check back soon.";return;}
        var client=window.supabase.createClient(window.HIMALAYA_SUPABASE_URL,window.HIMALAYA_SUPABASE_PUBLISHABLE_KEY);
        var result=await client.from("blog_posts").select("h1,seo_title,slug,category_label,excerpt,content_html,featured_image_url,featured_image_alt,seo_description,published_at").eq("slug",slug).eq("status","published").is("deleted_at",null).maybeSingle();
        if(result.error||!result.data){setText("article-title","Story not found");document.getElementById("article-body").textContent="This story may have moved. Visit the journal to explore other stories.";return;}
        renderPost(result.data);
    }
    if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",start);else start();
}());
