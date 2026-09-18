import './Button.css';

export default function Button({
  children,
  variant = 'primary',
  block = false,
  size = 'md',
  icon: Icon,
  onClick,
  type = 'button',
}) {
  const classes = [
    'btn',
    `btn-${variant}`,
    block ? 'btn-block' : '',
    size === 'sm' ? 'btn-sm' : '',
  ].filter(Boolean).join(' ');

  return (
    <button type={type} className={classes} onClick={onClick}>
      {Icon && <Icon size={18} strokeWidth={2} />}
      {children}
    </button>
  );
}
