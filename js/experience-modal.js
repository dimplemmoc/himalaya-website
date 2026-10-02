
const experienceDetails = {
  "Stay in Local Villages": {
    category: "CULTURAL EXPERIENCES",
    heading: "Experience the warmth of Himalayan village life",
    image: "assets/images/village-stay.jpg",
    description: "Discover the rhythm of life in Himalayan villages. Stay with local families, experience traditional hospitality, explore mountain homes, and connect with the culture and everyday traditions of the region."
  },

  "Nature Walks & Forest Trails": {
    category: "NATURE & ADVENTURE",
    heading: "Find your path through the Himalayan landscape",
    image: "assets/images/forest-trail.jpg",
    description: "Walk through peaceful forest trails, breathe in the mountain air, and discover the natural beauty of the Himalayas. Enjoy scenic routes, quiet surroundings, and a closer connection with nature."
  },

  "Stargazing Nights": {
    category: "NIGHT SKY EXPERIENCES",
    heading: "Discover the magic of Himalayan night skies",
    image: "assets/images/stargazing.jpg",
    description: "Step away from city lights and enjoy the beauty of the night sky. Spend a peaceful evening under the stars, surrounded by mountain landscapes and the quiet atmosphere of the Himalayas."
  },

  "Remote Work Stays": {
    category: "SLOW LIVING",
    heading: "Work remotely, surrounded by the mountains",
    image: "assets/images/remote-work.jpg",
    description: "Combine focused work with the calm of mountain living. Find a slower daily rhythm, enjoy inspiring surroundings, and make space for meaningful breaks between work sessions."
  }
};

const featuredSection = document.querySelector(".experience-grid")
  ?.closest("section");

const detailSection = document.getElementById("experienceDetail");
const backButton = document.getElementById("backToExperiences");

function openExperience(title) {
  const experience = experienceDetails[title];

  if (!experience || !featuredSection || !detailSection) return;

  document.getElementById("detailImage").src = experience.image;
  document.getElementById("detailImage").alt = title;
  document.getElementById("detailCategory").textContent = experience.category;
  document.getElementById("detailTitle").textContent = title;
  document.getElementById("detailHeading").textContent = experience.heading;
  document.getElementById("detailDescription").textContent =
    experience.description;

  featuredSection.hidden = true;
  detailSection.hidden = false;

  window.scrollTo({ top: 0, behavior: "smooth" });
}

function closeExperience() {
  detailSection.hidden = true;
  featuredSection.hidden = false;

  featuredSection.scrollIntoView({
    behavior: "smooth",
    block: "start"
  });
}

document.querySelectorAll(".experience-card").forEach((card) => {
  const titleElement = card.querySelector("h3");
  if (!titleElement) return;

  const title = titleElement.textContent.trim();

  card.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", (event) => {
      if (!experienceDetails[title]) return;

      event.preventDefault();
      openExperience(title);
    });
  });
});

backButton?.addEventListener("click", closeExperience);