import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useOperationalSound } from '../../hooks/useOperationalSound';
export function OperationalSoundToggle() {
    const { enabled, toggle, play } = useOperationalSound();
    const handleToggle = () => {
        const next = toggle();
        if (next)
            play('tracking_updated');
    };
    return (_jsxs("button", { type: "button", className: "lv-sound-toggle", onClick: handleToggle, "aria-pressed": enabled, title: enabled ? 'Geluid uitschakelen' : 'Geluid inschakelen', children: [_jsx("span", { "aria-hidden": "true", children: enabled ? '●' : '○' }), _jsx("span", { children: enabled ? 'Geluid aan' : 'Geluid uit' })] }));
}
