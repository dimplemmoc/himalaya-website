(function () {
    "use strict";

    var journeys = {
        "local-village-stays": {
            type: "experience", title: "Stay in Local Villages", category: "VILLAGE LIFE",
            image: "images/pexels-deekshyant-134459764-10778690.jpg", imageAlt: "Village life in the Himalayas",
            gallery: ["images/pexels-dxaxoxfz-16153351.jpg", "images/pexels-llizzk-18276996.jpg"],
            meta: "Kumaon, Uttarakhand · 2 nights", place: "Kumaon, Uttarakhand", length: "2 nights", style: "Village homestay",
            price: "Ask for a quote", categoryLine: "CULTURAL EXPERIENCES",
            headline: "Come for the views. Stay for the feeling.",
            description: "Wake up to mountain views, local food and warm smiles. Stay with local families, walk through the village at an unhurried pace, and discover the small everyday moments that make a place feel like home. Your days can be full of walks, or wonderfully slow.",
            highlights: ["A warm welcome from people who know the place by heart", "Slow village walks and time to explore at your own pace", "Home-cooked local food and stories shared over tea"]
        },
        "nature-walks": {
            type: "experience", title: "Nature Walks & Forest Trails", category: "NATURE & ADVENTURE",
            image: "images/pexels-anuj-yadav-34803963-8735480 (1).jpg", imageAlt: "Forest trail in the Himalayas",
            gallery: ["images/pexels-ahmet-ciftci-1413580052-35749293.jpg", "images/pexels-ex-route-adventures-656223369-20282345.jpg"],
            meta: "Himalayan forests · Half day or full day", place: "Himalayan forest trails", length: "Half or full day", style: "Guided nature walk",
            price: "Ask for a quote", categoryLine: "NATURE • FOREST TRAILS",
            headline: "Walk slower. Notice more.",
            description: "Follow quiet paths beneath cedar and pine, breathe the cool mountain air, and take in the changing light along the trail. Local guides share their knowledge of the landscape while leaving plenty of space to pause, listen and enjoy the walk.",
            highlights: ["A locally guided route chosen for the season and your pace", "Forest sounds, mountain views and unhurried stops along the way", "A thoughtful walk for curious beginners and regular hikers alike"]
        },
        "stargazing": {
            type: "experience", title: "Stargazing Nights", category: "NIGHT SKY",
            image: "images/pexels-rover-mohit-92806349-39065531.jpg", imageAlt: "Night sky above the Himalayas",
            gallery: ["images/pexels-yademidov-36285486.jpg", "images/pexels-urtimud-89-76108288-32261676.jpg"],
            meta: "Himalayan foothills · One evening", place: "Clear-sky mountain locations", length: "One evening", style: "Small-group night experience",
            price: "Ask for a quote", categoryLine: "STARGAZING • SLOW EVENINGS",
            headline: "A little more sky. A little less hurry.",
            description: "Step away from bright lights and spend an evening under a clear Himalayan sky. Settle in with a local host, learn to find familiar constellations, and let the quiet of the mountains make room for a different kind of night out.",
            highlights: ["A dark-sky spot selected around the weather and season", "Simple guidance for finding constellations and enjoying the view", "Warm drinks and a relaxed evening with a local host"]
        },
        "remote-work": {
            type: "experience", title: "Remote Work Stays", category: "SLOW LIVING",
            image: "images/pexels-prajwalbajracharya-9972988.jpg", imageAlt: "A quiet mountain stay suited to remote work",
            gallery: ["images/pexels-dqnguyen15-31385779.jpg", "images/pexels-hamza-gulzar-54058-17101164.jpg"],
            meta: "Himalayan village stays · Flexible length", place: "Selected village stays", length: "Flexible", style: "Workdays with room to explore",
            price: "Ask for a quote", categoryLine: "REMOTE WORK • SLOW LIVING",
            headline: "Make space for focused work and mountain air.",
            description: "Trade the usual workday backdrop for a quieter village rhythm. We help you find a comfortable local stay, then leave room in the day for walks, home-cooked meals and proper breaks between calls.",
            highlights: ["A locally hosted stay with practical workday essentials", "Flexible days shaped around your schedule", "Nearby trails and local meals for meaningful breaks"]
        },
        "tirthan-local-life": {
            type: "experience", title: "Live Like a Local in Tirthan Valley", category: "VILLAGE LIFE • TIRTHAN VALLEY",
            image: "images/t1.jpg", imageAlt: "Tirthan Valley in Himachal Pradesh",
            gallery: ["images/pexels-dxaxoxfz-16153351.jpg", "images/pexels-deekshyant-134459764-10778690.jpg"],
            meta: "Tirthan Valley, Himachal Pradesh · Flexible itinerary", place: "Tirthan Valley, Himachal Pradesh", length: "Flexible", style: "Village stays and local walks",
            price: "Ask for a quote", categoryLine: "VILLAGE LIFE • LOCAL HOSTS",
            headline: "Meet the valley beyond the view.",
            description: "Slow down, stay with local families, walk through mountain villages and discover the peaceful rhythm of life in Tirthan. Share a meal, follow a village path and get to know the people who make this valley feel special.",
            highlights: ["Time with local families and community hosts", "Easy village walks through the Tirthan landscape", "Regional meals and everyday stories from the valley"]
        },
        "spiti-high-himalayas": {
            type: "experience", title: "Discover Life in the High Himalayas", category: "ADVENTURE • SPITI VALLEY",
            image: "images/h1.jpg", imageAlt: "High mountain landscape in Spiti Valley",
            gallery: ["images/pexels-sinileunen-5823125.jpg", "images/pexels-simarphotos-23476480.jpg"],
            meta: "Spiti Valley, Himachal Pradesh · Flexible itinerary", place: "Spiti Valley, Himachal Pradesh", length: "Flexible", style: "Culture, villages and high-altitude views",
            price: "Ask for a quote", categoryLine: "HIGH HIMALAYAS • CULTURE",
            headline: "Find the stories in Spiti’s wide-open spaces.",
            description: "Explore remote villages, ancient monasteries and dramatic landscapes while discovering the unique culture of Spiti. Take the route at a considered pace, with time to meet local people and appreciate the life shaped by this high-altitude region.",
            highlights: ["Visits to villages and monasteries with local context", "Scenic drives with time for short walks and photo stops", "A flexible pace suited to high-altitude travel"]
        },
        "kinnaur-food-culture": {
            type: "experience", title: "Stories, Food & Traditions of Kinnaur", category: "FOOD & CULTURE • KINNAUR",
            image: "images/k1.jpg", imageAlt: "Kinnaur landscape in the Himalayas",
            gallery: ["images/pexels-zen-chung-5528993.jpg", "images/pexels-kolkatarchobiwala-37151443.jpg"],
            meta: "Kinnaur, Himachal Pradesh · Flexible itinerary", place: "Kinnaur, Himachal Pradesh", length: "Flexible", style: "Food, culture and local encounters",
            price: "Ask for a quote", categoryLine: "FOOD • CULTURE • PEOPLE",
            headline: "Taste the place. Hear the stories behind it.",
            description: "Meet local families, taste traditional Himalayan food and discover the stories and traditions of Kinnauri communities. This experience makes room for conversation, seasonal ingredients and the everyday customs that give the region its character.",
            highlights: ["A closer look at local ingredients and home cooking", "Conversations with hosts about customs and community life", "A relaxed introduction to Kinnaur’s food and culture"]
        },
        "uttarakhand-village-day": {
            type: "experience", title: "A Day in a Himalayan Village", category: "LOCAL LIFE • UTTARAKHAND",
            image: "images/pexels-sagargnawali-33575347.jpg", imageAlt: "Village in Uttarakhand",
            gallery: ["images/pexels-agung-gnuga-1116188-34182906.jpg", "images/pexels-yogendras31-10782850.jpg"],
            meta: "Uttarakhand · One day", place: "Uttarakhand village", length: "One day", style: "Village walk and local encounters",
            price: "Ask for a quote", categoryLine: "LOCAL LIFE • VILLAGE STORIES",
            headline: "A village day, measured in conversations.",
            description: "Walk through quiet mountain lanes, meet local people and experience the simple everyday life of the Himalayas. A local host helps you notice the homes, work and traditions that make each village unique.",
            highlights: ["A relaxed walk through a living mountain village", "Stories and everyday insights from a local host", "Time to pause, enjoy a local meal and take in the landscape"]
        },
        "mountain-family-homestay": {
            type: "stay", title: "The Mountain Family Homestay", category: "HOMESTAY • TIRTHAN VALLEY",
            image: "images/pexels-dxaxoxfz-16153351.jpg", imageAlt: "A welcoming homestay in Tirthan Valley",
            gallery: ["images/pexels-llizzk-18276996.jpg", "images/pexels-dqnguyen15-31385779.jpg"],
            meta: "Tirthan Valley, Himachal Pradesh · From ₹1,800 / night", place: "Tirthan Valley, Himachal Pradesh", length: "From ₹1,800 / night", style: "Family-run homestay",
            price: "₹1,800 / night", categoryLine: "A LOCAL STAY • HOMEMADE FOOD",
            headline: "Wake up to forest views and a family welcome.",
            description: "Wake up to forest views, homemade Himalayan food and the warmth of a local mountain family. This simple, welcoming stay gives you a comfortable base for exploring Tirthan at your own pace.",
            highlights: ["A warm family welcome in the Tirthan Valley", "Homemade meals inspired by local ingredients", "Forest views and a restful base for nearby walks"]
        },
        "spiti-valley-cabin": {
            type: "stay", title: "A Quiet Cabin Above the Valley", category: "MOUNTAIN CABIN • SPITI",
            image: "images/pexels-sinileunen-5823125.jpg", imageAlt: "Mountain cabin in Spiti Valley",
            gallery: ["images/h1.jpg", "images/pexels-simarphotos-23476480.jpg"],
            meta: "Spiti Valley, Himachal Pradesh · From ₹2,400 / night", place: "Spiti Valley, Himachal Pradesh", length: "From ₹2,400 / night", style: "Quiet mountain cabin",
            price: "₹2,400 / night", categoryLine: "A QUIET BASE • MOUNTAIN CABIN",
            headline: "Space, stillness and a wide-open valley.",
            description: "A peaceful mountain stay surrounded by dramatic landscapes, clear skies and the silence of Spiti. Return from the day’s drive to a warm, comfortable cabin and a slower evening under the high-desert sky.",
            highlights: ["A quiet cabin with open mountain views", "A comfortable base for exploring nearby villages", "Clear evening skies and room to slow down"]
        },
        "kinnaur-orchard-stay": {
            type: "stay", title: "Stay Among the Apple Orchards", category: "VILLAGE STAY • KINNAUR",
            image: "images/pexels-zen-chung-5528993.jpg", imageAlt: "Orchard stay in Kinnaur",
            gallery: ["images/k1.jpg", "images/pexels-kolkatarchobiwala-37151443.jpg"],
            meta: "Kinnaur, Himachal Pradesh · From ₹2,000 / night", place: "Kinnaur, Himachal Pradesh", length: "From ₹2,000 / night", style: "Village orchard stay",
            price: "₹2,000 / night", categoryLine: "SEASONAL ORCHARDS • VILLAGE LIFE",
            headline: "A slower stay beneath the orchard trees.",
            description: "Experience slow village life surrounded by apple orchards, mountain views and local traditions. Spend your days close to the landscape, enjoy a welcoming local stay and let the village rhythm set the pace.",
            highlights: ["A village setting among Kinnaur’s apple orchards", "Local hosts and a slower daily rhythm", "Mountain views and seasonal regional food"]
        },
        "uttarakhand-forest-retreat": {
            type: "stay", title: "A Slow Stay in the Forest", category: "FOREST RETREAT • UTTARAKHAND",
            image: "images/pexels-agung-gnuga-1116188-34182906.jpg", imageAlt: "Forest retreat in Uttarakhand",
            gallery: ["images/pexels-sagargnawali-33575347.jpg", "images/pexels-yogendras31-10782850.jpg"],
            meta: "Uttarakhand · From ₹2,200 / night", place: "Uttarakhand", length: "From ₹2,200 / night", style: "Forest-side retreat",
            price: "₹2,200 / night", categoryLine: "FOREST AIR • QUIET MORNINGS",
            headline: "Let the forest set the pace of your stay.",
            description: "Spend quiet mornings among pine forests, mountain air and peaceful Himalayan landscapes. This retreat is a simple place to rest, take short walks and reconnect with the calm of the hills.",
            highlights: ["A peaceful setting close to forest trails", "Quiet mornings and open mountain air", "A restful base for exploring Uttarakhand nearby"]
        },
        "kumaon-explorer": {
            type: "package", title: "Kumaon Explorer", category: "NATURE • VILLAGE STAY • LOCAL FOOD",
            image: "images/pexels-alemdennbiri-2155534134-38322669.jpg", imageAlt: "Kumaon mountain landscape",
            gallery: ["images/pexels-yogendras31-10782850.jpg", "images/h5.jpg"],
            meta: "Kumaon, Uttarakhand · 4 days", place: "Kumaon, Uttarakhand", length: "4 days", style: "Local stays and hidden village gems",
            price: "Ask for a quote", categoryLine: "FOUR DAYS • LOCAL DISCOVERIES",
            headline: "Follow the quieter paths through Kumaon.",
            description: "Explore Turna, Sonmeri Chowk and nearby hidden gems with time to enjoy the places along the way. This journey pairs local stays and regional food with gentle exploration, so the days feel considered instead of rushed.",
            highlights: ["Four days for village life and scenic local routes", "Thoughtful stays and regional food along the journey", "Time to explore Turna, Sonmeri Chowk and nearby places"]
        },
        "valley-of-flowers": {
            type: "package", title: "Valley of Flowers", category: "ALPINE TRAILS • VILLAGE STAYS",
            image: "images/pexels-yogendras31-23534124.jpg", imageAlt: "Himalayan alpine landscape near Valley of Flowers",
            gallery: ["images/pexels-lexi-orizio-2147739941-29753864.jpg", "images/pexels-ex-route-adventures-656223369-20282345.jpg"],
            meta: "Uttarakhand · 5 days", place: "Uttarakhand Himalayas", length: "5 days", style: "Blooming trails and village stays",
            price: "Ask for a quote", categoryLine: "FIVE DAYS • ALPINE VIEWS",
            headline: "Make room for the trail and the villages around it.",
            description: "Blooming trails, alpine views and peaceful village stays shape this five-day Himalayan journey. Build in time to enjoy the landscape and local hospitality between walks, with a pace that lets the route unfold naturally.",
            highlights: ["Five days around seasonal mountain scenery", "Alpine walks paired with restful village stays", "A thoughtful pace with time to enjoy the route"]
        },
        "char-dham-yatra": {
            type: "package", title: "Char Dham Yatra", category: "SPIRITUAL JOURNEY • LOCAL INSIGHTS",
            image: "images/pexels-urtimud-89-76108288-32261676.jpg", imageAlt: "Himalayan peaks on a Char Dham journey",
            gallery: ["images/pexels-yogendras31-10782850.jpg", "images/pexels-agung-gnuga-1116188-34182906.jpg"],
            meta: "Uttarakhand · 7 days", place: "Uttarakhand Himalayas", length: "7 days", style: "A considered pilgrimage journey",
            price: "Ask for a quote", categoryLine: "SEVEN DAYS • LOCAL SUPPORT",
            headline: "A sacred journey, with care in every detail.",
            description: "Travel through the Uttarakhand Himalayas on a seven-day pilgrimage with local insights and comfortable stays. The journey is planned with room for the route, the people you meet and the meaning of each place.",
            highlights: ["A seven-day itinerary planned around the pilgrimage route", "Comfortable stays and local support along the way", "Cultural context and considered travel between destinations"]
        },
        "tirthan-slow-escape": {
            type: "package", title: "The Tirthan Slow Escape", category: "FOREST WALKS • LOCAL FOOD • VILLAGE LIFE",
            image: "images/pexels-beladiya-nikunj-742323377-37916083.jpg", imageAlt: "Tirthan Valley landscape",
            gallery: ["images/pexels-dqnguyen15-31385779.jpg", "images/pexels-hson-27582052.jpg"],
            meta: "Tirthan Valley, Himachal Pradesh · 3 days / 2 nights", place: "Tirthan Valley, Himachal Pradesh", length: "3 days / 2 nights", style: "Forest walks and local village life",
            price: "₹8,999 / person", categoryLine: "THREE DAYS • TWO NIGHTS",
            headline: "Let the river, forest and village set your rhythm.",
            description: "Spend three days in the heart of Tirthan Valley with forest walks, local food, riverside evenings and authentic village life. This short escape is designed to feel spacious, with enough time to enjoy each part of the valley.",
            highlights: ["Forest walks and riverside time in Tirthan Valley", "Local food and two nights in a considered stay", "A relaxed introduction to the valley’s village life"]
        },
        "spiti-land-of-spiti": {
            type: "package", title: "Into the Land of Spiti", category: "MONASTERIES • REMOTE VILLAGES • HIGH HIMALAYAS",
            image: "images/pexels-simarphotos-23476480.jpg", imageAlt: "Spiti Valley mountain landscape",
            gallery: ["images/h1.jpg", "images/pexels-sinileunen-5823125.jpg"],
            meta: "Spiti Valley, Himachal Pradesh · 5 days / 4 nights", place: "Spiti Valley, Himachal Pradesh", length: "5 days / 4 nights", style: "High-altitude culture and landscapes",
            price: "₹15,999 / person", categoryLine: "FIVE DAYS • FOUR NIGHTS",
            headline: "Discover the quiet scale of Spiti.",
            description: "Explore ancient monasteries, remote villages and high-altitude landscapes while learning about the unique culture of Spiti Valley. The route balances memorable places with time to travel thoughtfully through the region.",
            highlights: ["Monasteries and remote villages across Spiti", "High-altitude scenery with planned time to acclimatize", "Four nights on a considered five-day route"]
        }
    };

    function getParameter(name) {
        var pairs = window.location.search.replace(/^\?/, "").split("&");
        for (var i = 0; i < pairs.length; i += 1) {
            var parts = pairs[i].split("=");
            if (decodeURIComponent(parts[0].replace(/\+/g, " ")) === name) {
                return decodeURIComponent((parts[1] || "").replace(/\+/g, " "));
            }
        }
        return "";
    }

    function setText(id, value) {
        var element = document.getElementById(id);
        if (element) element.textContent = value;
    }

    function start() {
        var item = journeys[getParameter("slug")];
        var type = getParameter("type");
        var page = document.getElementById("journey-detail");
        var error = document.getElementById("journey-error");

        if (!item || item.type !== type) {
            if (page) page.hidden = true;
            if (error) error.hidden = false;
            return;
        }

        document.title = item.title + " | Live Local Himalaya";
        setText("journey-title", item.title);
        setText("journey-meta", item.meta);
        setText("journey-category", item.categoryLine);
        setText("journey-intro-title", item.headline);
        setText("journey-description", item.description);
        setText("journey-plan-title", item.price);
        setText("journey-place", item.place);
        setText("journey-length", item.length);
        setText("journey-style", item.style);

        var hero = document.getElementById("journey-hero-image");
        if (hero) {
            hero.src = item.image;
            hero.alt = item.imageAlt;
        }

        var backLink = document.getElementById("journey-back-link");
        if (backLink) {
            backLink.href = item.type === "stay" ? "stays.html#stays" :
                item.type === "package" ? "package.html#packages" : "experience.html#experiences";
            backLink.textContent = item.type === "stay" ? "← Back to stays" :
                item.type === "package" ? "← Back to packages" : "← Back to experiences";
        }

        var gallery = document.getElementById("journey-gallery");
        item.gallery.forEach(function (src, index) {
            var figure = document.createElement("figure");
            var image = document.createElement("img");
            image.src = src;
            image.alt = item.title + (index === 0 ? " — local landscape" : " — a closer look at the journey");
            image.loading = "lazy";
            figure.appendChild(image);
            gallery.appendChild(figure);
        });

        var list = document.getElementById("journey-highlights");
        item.highlights.forEach(function (highlight) {
            var row = document.createElement("li");
            row.textContent = highlight;
            list.appendChild(row);
        });

        var enquiry = document.getElementById("journey-enquiry");
        if (enquiry) {
            enquiry.href = "plan-trip.html?journey=" + encodeURIComponent(item.title) +
                "&destination=" + encodeURIComponent(item.place);
        }
    }

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", start);
    } else {
        start();
    }
}());
