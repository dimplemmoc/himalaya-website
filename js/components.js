
document.addEventListener("DOMContentLoaded", () => {
    console.log("JavaScript loaded");

    // NAVBAR LOAD
    fetch("./navbar.html")
        .then(response => {
            if (!response.ok) {
                throw new Error("Navbar file nahi mili");
            }
            return response.text();
        })
        .then(data => {
            const container = document.getElementById("navbar-container");

            if (!container) {
                console.error("navbar-container nahi mila");
                return;
            }

            container.innerHTML = data;
            console.log("Navbar loaded");

            // Event delegation: button click
            container.addEventListener("click", event => {
                const menuBtn = event.target.closest(".menu-btn");

                if (menuBtn) {
                    const navbar = container.querySelector(".navbar");

                    if (!navbar) {
                        console.error("Navbar element nahi mila");
                        return;
                    }

                    const isOpen = navbar.classList.toggle("active");
                    menuBtn.setAttribute("aria-expanded", String(isOpen));

                    console.log("Menu clicked. Open:", isOpen);
                }

                // Link click par menu close
                if (event.target.closest(".navbar a")) {
                    const navbar = container.querySelector(".navbar");
                    const button = container.querySelector(".menu-btn");

                    navbar?.classList.remove("active");
                    button?.setAttribute("aria-expanded", "false");
                }
            });
        })
        .catch(error => {
            console.error("NAVBAR ERROR:", error);
        });

    // FOOTER LOAD
    fetch("./footer.html")
        .then(response => {
            if (!response.ok) {
                throw new Error("Footer file nahi mili");
            }
            return response.text();
        })
        .then(data => {
            const container = document.getElementById("footer-container");

            if (container) {
                container.innerHTML = data;
            }
        })
        .catch(error => {
            console.error("FOOTER ERROR:", error);
        });
});

