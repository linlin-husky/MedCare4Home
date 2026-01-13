import Button from "./Button";
import "./About.css";
import PanelImage1 from "./images/elaine-casap-qgHGDbbSNm8-unsplash.jpg";
import PanelImage2 from "./images/lesly-juarez-DFtjXYd5Pto-unsplash.jpg";
import PanelImage3 from "./images/alex-shute-bGOemOApXo4-unsplash.jpg";
import PanelImage4 from "./images/simon-maage-KTzZVDjUsXw-unsplash.jpg";
import PanelImage5 from "./images/sticker-mule-xdDfrh1sAp0-unsplash.jpg";
import PanelImage6 from "./images/prophsee-journals-sFTMwH2Tvec-unsplash.jpg";
import Accordion from "./Accordion";
import Carousel from "./Carousel";

function About({ changePage }) {
  return (
    <div>

      <h2 className="page-title">About Lend and Borrow Tracker</h2>
      <Carousel />
      <div className="about-accordion">
        <Accordion title="What We Share">
          <img
            className="accordion__pic"
            src={PanelImage1}
            alt="One hand with a bare arm and the other with a gloved hand and sleeve are holding a terra-cotta bowl filled with cherry tomatoes."
          />
          We believe in building trust through shared resources — from tools and books to everyday essentials — making
          life more connected, sustainable, and simple for everyone.
        </Accordion>

        <Accordion title="What We Educate">
          <img
            className="accordion__pic"
            src={PanelImage2}
            alt="A card with the word 'mindfulness' written in script is sitting on a windowsill in front of a window."
          />
          We promote mindful sharing by teaching responsible borrowing, clear communication, and mutual respect — helping
          users grow in trust, accountability, and community care.
        </Accordion>

        <Accordion title="What We Offer">
          <img
            className="accordion__pic"
            src={PanelImage3}
            alt="The word 'TRUST' is spelled out with wooden letter tiles, with some small blue and yellow flowers to the left and a sprig of blue flowers to the right."
          />
          A simple, smart way to track what you borrow and lend — keeping everything organized, reducing misunderstandings, and
          strengthening trust among friends, families, and communities.
        </Accordion>

        <Accordion title="What We Create">
          <img
            className="accordion__pic"
            src={PanelImage4}
            alt="A person is holding a framed sign with the words 'GIVE. THANKS.' written in black text."
          />
          We create a culture of sharing — one built on trust, simplicity, and connection — where lending and borrowing become effortless
          parts of everyday life.
        </Accordion>

        <Accordion title="What We Make Together">
          <img
            className="accordion__pic"
            src={PanelImage5}
            alt="A hand holds a 'Generosity' sticker between two frosted miniature trees."
          />
          Together, we make a trustworthy, caring community where sharing isn't just practical — it's a way of life rooted in
          generosity and respect.
        </Accordion>

        <Accordion title="What We Celebrate">
          <img
            className="accordion__pic"
            src={PanelImage6}
            alt="A hand is holding a white card that reads, 'LIFE IS YOUR CREATION.'"
          />
          We celebrate the joy of giving, the beauty of trust, and the meaningful connections built through everyday acts of sharing.
        </Accordion>
      </div>

      <Button
        className="skip-button"
        onClick={() => {
          changePage("/");
        }}
        visual="link"
      >
        Back to homepage
      </Button>
    </div>
  );
}

export default About;