import { useState } from 'react';
import Button from './Button';
import './Accordion.css';

function Accordion({ title, children }) {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <div className="accordion">
            <Button
                className="accordion__title"
                aria-expanded={isOpen ? "true" : "false"}
                onClick={() => setIsOpen(!isOpen)}
            >
                {title}
            </Button>

            {isOpen &&
                <div className="accordion__content">
                    {children}
                </div>
            }
        </div>
    );
}

export default Accordion;