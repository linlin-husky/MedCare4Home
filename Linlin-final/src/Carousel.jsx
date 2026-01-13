import { useState } from "react";
import "./Carousel.css";
import Button from "./Button";
import slide1 from "./images/madalyn-cox-aJkFP5Q1eus-unsplash.jpg";
import slide2 from "./images/recha-oktaviani-t__61ap00Mc-unsplash.jpg";
import slide3 from "./images/dave-photoz-FdTmaUlEr4A-unsplash.jpg";
import slide4 from "./images/daria-nepriakhina-xY55bL5mZAM-unsplash.jpg";
import slide5 from "./images/sincerely-media-CXYPfveiuis-unsplash.jpg";
import slide6 from "./images/devvrat-jadon-WLNkAHCjYOw-unsplash.jpg";
import slide7 from "./images/benjamin-lehman-EJU7A__krX0-unsplash.jpg";
import slide8 from "./images/studio-media-9DaOYUYnOls-unsplash.jpg";
import slide9 from "./images/katherine-chase-VNBUJ6imfGs-unsplash.jpg";

const Carousel = () => {
  const slides = [
    {
      src: slide1,
      alt: "The book called The Fellowship Of The Ring with black cover lies on the wooden table.",
    },
    {
      src: slide2,
      alt: "A single crescent wrench against a solid white background.",
    },
    {
      src: slide3,
      alt: "A low-angle shot of a game board for game called 'Ticket to Ride' showing a hand moving a green train piece among other train pieces on the map.",
    },
    {
      src: slide4,
      alt: "A stack of business and self-help books are resting on the white table.",
    },
    {
      src: slide5,
      alt: "The book called 'milk and honey' by Rupi Kaur with a black cover is resting on top of another book on a wooden surface.",
    },
    {
      src: slide6,
      alt: "A black and white image shows a claw hammer lying next to a cluster of nails arranged in a fan-like pattern on a white surface.",
    },
    {
      src: slide7,
      alt: "various woodworking tools including a cordless drill, hammer, screws, and sawdust are scattered on a rustic wooden surface.",
    },
    {
      src: slide8,
      alt: "A stack of three books, with the top one open and a bookmark visible, is against a simple beige background.",
    },
    {
      src: slide9,
      alt: "A shiny stainless steel Instant Pot sits on a marble countertop against a bright, neutral background.",
    },
  ];

  const [selectedIndex, setSelectedIndex] = useState(0);
  const cellCount = slides.length;

  const next = () => setSelectedIndex((prev) => (prev + 1) % cellCount);
  const prev = () => setSelectedIndex((prev) => (prev - 1 + cellCount) % cellCount);

  const carouselClass = `carousel rotate-${selectedIndex}`;

  return (
    <>
      <div className="scene">
        <div className={carouselClass}>
          {slides.map((slide, i) => (
            <div key={i} className={`carousel__cell cell-${i}`}>
              <img src={slide.src} alt={slide.alt} />
            </div>
          ))}
        </div>
      </div>

      <div className="carousel__controls">
        <Button onClick={prev}>‹ Prev</Button>
        <Button onClick={next}>Next ›</Button>
      </div>
    </>
  );
};

export default Carousel;