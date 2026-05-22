import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useMemo, useState } from 'react';
const navItems = ['Hero', 'Book', 'Track', 'Moni'];
export function App() {
    const [activeNav, setActiveNav] = useState('Hero');
    const [assistantOpen, setAssistantOpen] = useState(false);
    const [bookingStep, setBookingStep] = useState('route');
    const [fieldFocus, setFieldFocus] = useState('');
    const [trackingOn, setTrackingOn] = useState(false);
    const [soundOn, setSoundOn] = useState(true);
    const [statusIndex, setStatusIndex] = useState(0);
    const trackingStates = useMemo(() => ['Ride requested', 'Driver assigned', 'Driver approaching', 'Passenger onboard', 'Trip complete'], []);
    useEffect(() => {
        if (!trackingOn)
            return;
        const timer = setInterval(() => {
            setStatusIndex((prev) => (prev < trackingStates.length - 1 ? prev + 1 : prev));
        }, 1800);
        return () => clearInterval(timer);
    }, [trackingOn, trackingStates.length]);
    const playTone = (frequency = 460, duration = 0.09) => {
        if (!soundOn)
            return;
        const context = new (window.AudioContext || window.webkitAudioContext)();
        const oscillator = context.createOscillator();
        const gain = context.createGain();
        oscillator.frequency.value = frequency;
        gain.gain.value = 0.04;
        oscillator.connect(gain);
        gain.connect(context.destination);
        oscillator.start();
        setTimeout(() => {
            oscillator.stop();
            context.close();
        }, duration * 1000);
    };
    const bookingProgress = bookingStep === 'route' ? 33 : bookingStep === 'details' ? 66 : 100;
    return (_jsxs("main", { className: "app-shell", children: [_jsx("div", { className: "ambient-layer" }), _jsxs("header", { className: "top-nav glass", children: [_jsx("div", { className: "brand", children: "LVTRANSPORT LIVE OPS" }), _jsx("nav", { children: navItems.map((item) => (_jsx("button", { className: `nav-btn ${activeNav === item ? 'active' : ''}`, onClick: () => {
                                setActiveNav(item);
                                playTone(520, 0.08);
                            }, children: item }, item))) }), _jsx("button", { className: "sound-toggle", onClick: () => setSoundOn((s) => !s), children: soundOn ? 'Sound On' : 'Sound Off' })] }), _jsxs("section", { className: "hero glass depth-card", children: [_jsxs("div", { className: "hero-copy", children: [_jsx("h1", { children: "Premium Interactive Mobility Platform" }), _jsx("p", { children: "Real-time operational atmosphere with intelligent motion, smooth interactions, and confident booking flow." }), _jsxs("div", { className: "hero-actions", children: [_jsx("button", { className: "cta", onClick: () => setActiveNav('Book'), children: "Start Booking" }), _jsx("button", { className: "ghost", onClick: () => setAssistantOpen(true), children: "Open Moni Ride" })] })] }), _jsxs("div", { className: "hero-visual", children: [_jsx("div", { className: "route-grid" }), _jsx("div", { className: "moving-glow glow-a" }), _jsx("div", { className: "moving-glow glow-b" }), _jsx("div", { className: "route-line route-1" }), _jsx("div", { className: "route-line route-2" })] })] }), _jsxs("section", { className: "panel-grid", children: [_jsxs("article", { className: "glass depth-card booking", children: [_jsx("h2", { children: "Immersive Booking Flow" }), _jsx("div", { className: "progress-wrap", children: _jsx("div", { className: "progress", style: { width: `${bookingProgress}%` } }) }), _jsxs("div", { className: "field-group", children: [_jsx("input", { className: fieldFocus === 'pickup' ? 'focused' : '', placeholder: "Pickup", onFocus: () => setFieldFocus('pickup'), onBlur: () => setFieldFocus('') }), _jsx("input", { className: fieldFocus === 'dropoff' ? 'focused' : '', placeholder: "Dropoff", onFocus: () => setFieldFocus('dropoff'), onBlur: () => setFieldFocus('') })] }), _jsxs("div", { className: "booking-actions", children: [_jsx("button", { onClick: () => { setBookingStep('route'); playTone(420); }, children: "Route" }), _jsx("button", { onClick: () => { setBookingStep('details'); playTone(480); }, children: "Details" }), _jsx("button", { onClick: () => { setBookingStep('confirm'); playTone(560, 0.12); }, children: "Confirm" })] }), _jsxs("p", { className: "hint", children: ["Current step: ", _jsx("strong", { children: bookingStep })] })] }), _jsxs("article", { className: "glass depth-card tracking", children: [_jsx("h2", { children: "Live Tracking Evolution" }), _jsx("button", { className: "cta small", onClick: () => { setTrackingOn(true); setStatusIndex(0); playTone(510); }, children: "Start Live Tracking" }), _jsx("ul", { className: "timeline", children: trackingStates.map((state, idx) => (_jsx("li", { className: idx <= statusIndex ? 'done' : '', children: state }, state))) })] })] }), _jsxs("aside", { className: `moni ${assistantOpen ? 'open' : ''}`, children: [_jsx("button", { className: "moni-trigger", onClick: () => { setAssistantOpen((o) => !o); playTone(600, 0.08); }, children: "Moni Ride" }), _jsxs("div", { className: "moni-panel glass", children: [_jsx("h3", { children: "Moni Ride Assistant" }), _jsx("p", { children: "Quick fare estimate + operational shortcuts." }), _jsxs("div", { className: "quick-cards", children: [_jsx("button", { children: "Estimate Fare" }), _jsx("button", { children: "Map Preview" }), _jsx("button", { children: "Priority Support" })] })] })] })] }));
}
