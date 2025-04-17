document.addEventListener("DOMContentLoaded", () => {
    const cardsWrapper = document.querySelector(".cards");
    const cards = document.querySelectorAll(".card");
    const prevButton = document.querySelector(".prev");
    const nextButton = document.querySelector(".next");

    let index = 0;
    const cardWidth = cards[0].offsetWidth + 20; // Including gap
    const totalCards = cards.length;

    // Duplicate first and last cards
    const firstClone = cards[0].cloneNode(true);
    const lastClone = cards[totalCards - 1].cloneNode(true);
    
    cardsWrapper.appendChild(firstClone);
    cardsWrapper.insertBefore(lastClone, cards[0]);

    index = 1;
    cardsWrapper.style.transform = `translateX(${-cardWidth * index}px)`;

    function moveSlider(direction) {
        index += direction;
        cardsWrapper.style.transition = "transform 0.5s ease-in-out";
        cardsWrapper.style.transform = `translateX(${-cardWidth * index}px)`;

        setTimeout(() => {
            if (index === totalCards + 1) {
                cardsWrapper.style.transition = "none";
                index = 1;
                cardsWrapper.style.transform = `translateX(${-cardWidth * index}px)`;
            } else if (index === 0) {
                cardsWrapper.style.transition = "none";
                index = totalCards;
                cardsWrapper.style.transform = `translateX(${-cardWidth * index}px)`;
            }
        }, 500);
    }

    // Button Click Events
    nextButton.addEventListener("click", () => moveSlider(1));
    prevButton.addEventListener("click", () => moveSlider(-1));
});
