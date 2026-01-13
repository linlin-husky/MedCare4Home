import Button from "./Button";
import Accordion from "./Accordion";

function FAQ({ changePage }) {
  return (
    <div>
      <h2 className="page-title">FAQ</h2>
      <div className="faq-accordion">
        <Accordion title="How to start lending or borrowing items">
          Start by creating a clear record in the app: add the item name, set
          lending or borrowing status, and choose start and return dates. Always
          agree on expectations beforehand.
        </Accordion>

        <Accordion title="How to welcome new members to your sharing circle">
          Send them a warm welcome message and share the purpose of the tracker.
          Encourage them to use the app responsibly and lead by example with kind,
          clear communication.
        </Accordion>

        <Accordion title="How to track borrowed items responsibly">
          Log every item in the tracker with dates and notes. Update the status as
          soon as it's returned or renewed. Respect due dates and notify others if
          plans change.
        </Accordion>

        <Accordion title="How to know if borrowing/lending is going smoothly">
          If items are returned on time, updates are communicated, and no reminders
          are needed, things are going well! The app's dashboard can help track this
          easily.
        </Accordion>

        <Accordion title="How to celebrate return days or lending milestones">
          Celebrate with a simple thank-you, a message of appreciation, or a sticker/badge
          system within the app. Kindness builds a lasting sharing culture.
        </Accordion>

        <Accordion title="What should be done when lending to a new or unfamiliar person">
          Start small with low-risk items. Use the app to document everything clearly.
          Set a return date and share your expectations for care and timing.
        </Accordion>

        <Accordion title="How to support someone feeling anxious about lending or borrowing">
          Reassure them by being transparent, kind, and consistent. Walk them through the
          app so they feel confident and in control. Respect their pace.
        </Accordion>

        <Accordion title="If I lend to multiple people, how do I prevent conflicts or confusion?">
          Use the app to track who has what, and set clear dates. Avoid double-lending the same
          item by marking it as unavailable once it's lent. Communication is key.
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

export default FAQ;