function Button({
    children,
    className,
    disabled = false,
    onClick,
    type = "button"
    ,
    visual = "button"
    ,
    ...props
}) {
    let buttonClass = "button";
    if (visual === "link") {
        buttonClass = "button-link";
    }
    return (
        <button
            className={`${buttonClass} ${className}`}
            disabled={disabled} type={type}
            onClick={onClick}
            {...props}
        >
            {children}
        </button>
    );
}

export default Button;