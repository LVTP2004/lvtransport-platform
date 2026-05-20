const toScore = (value) => Math.max(0, Math.min(100, Math.round(value)));
const classifyInteraction = (intent, text, reply) => {
    if (/complaint|klacht|problem|issue/i.test(text))
        return 'complaint';
    if (/vip|business|zakelijk|airport|luchthaven/i.test(text))
        return 'airport_vip_request';
    if (/price|prijs|cost|tarief/i.test(text))
        return 'price_question';
    if (/track|status|volg|where is/i.test(text))
        return 'tracking_issue';
    if (/help|unclear|confus|wat bedoel/i.test(text))
        return 'customer_confusion';
    if (intent === 'booking_request' && /missing|details/i.test(reply))
        return 'incomplete_booking';
    if (intent === 'escalation_request')
        return 'escalation_needed';
    if (intent === 'general_question')
        return 'potential_improvement';
    return intent === 'booking_request' ? 'successful_booking' : 'unclear_intent';
};
const detectWeaknesses = (text, classification) => {
    const patterns = [];
    if (/\?{2,}|what|hoe|wat/i.test(text))
        patterns.push('confusing_questions');
    if (/price|prijs/i.test(text))
        patterns.push('unclear_price_explanations');
    if (/track|volg|status/i.test(text))
        patterns.push('tracking_confusion');
    if (/airport|luchthaven|vip|business/i.test(text))
        patterns.push('premium_flow_expectation_gap');
    if (classification === 'incomplete_booking')
        patterns.push('repeated_missing_information');
    if (!patterns.length)
        patterns.push('none_detected');
    return patterns;
};
const suggestImprovement = (classification) => {
    switch (classification) {
        case 'incomplete_booking': return 'Improve booking prompts with clearer required fields and examples.';
        case 'price_question': return 'Improve price explanation template with transparent estimate structure and caveats.';
        case 'tracking_issue': return 'Improve tracking fallback with explicit status check steps and escalation path.';
        case 'airport_vip_request': return 'Improve airport and VIP concierge confirmation wording with premium tone.';
        case 'complaint': return 'Improve complaint handling with faster escalation and empathetic acknowledgement.';
        case 'customer_confusion': return 'Improve question wording and add confirmation checkpoints.';
        default: return 'Monitor and refine fallback messaging while preserving operational truthfulness.';
    }
};
export const createLearningRecord = (input) => {
    const classification = classifyInteraction(input.intent, input.userText, input.replyText);
    const success = !['incomplete_booking', 'customer_confusion', 'complaint'].includes(classification);
    const operationalRisk = classification === 'complaint' || classification === 'escalation_needed' ? 'high' :
        classification === 'tracking_issue' || classification === 'customer_confusion' ? 'medium' : 'low';
    const weaknessPatterns = detectWeaknesses(input.userText, classification);
    const clarityScore = toScore(success ? 85 : 55);
    const customerSatisfactionSignal = toScore(success ? 82 : 48);
    return {
        interactionId: `moni_learn_${Date.now()}`,
        timestamp: new Date().toISOString(),
        language: input.language,
        intent: input.intent,
        bookingStage: input.intent.includes('booking') ? 'booking_flow' : 'support_flow',
        success,
        failureReason: success ? '' : classification,
        customerEmotion: /thanks|great|perfect/i.test(input.userText) ? 'positive' : success ? 'neutral' : 'frustrated',
        moniResponseQuality: toScore((clarityScore + customerSatisfactionSignal) / 2),
        operationalRisk,
        suggestedImprovement: suggestImprovement(classification),
        reviewStatus: 'draft',
        classification,
        scores: {
            clarityScore,
            customerSatisfactionSignal,
            completionSuccess: toScore(success ? 100 : 35),
            bookingConversion: toScore(input.intent === 'booking_request' && success ? 90 : 40),
            responseAccuracy: toScore(success ? 88 : 52),
            operationalRiskScore: toScore(operationalRisk === 'high' ? 80 : operationalRisk === 'medium' ? 45 : 20),
            toneQuality: toScore(success ? 90 : 60),
            escalationCorrectness: toScore(classification === 'escalation_needed' ? 90 : 75)
        },
        weaknessPatterns
    };
};
export const persistLearningRecord = (record) => {
    const storageKey = 'moni_controlled_learning_records';
    const current = globalThis.localStorage?.getItem(storageKey);
    const parsed = current ? JSON.parse(current) : [];
    parsed.unshift(record);
    globalThis.localStorage?.setItem(storageKey, JSON.stringify(parsed.slice(0, 200)));
};
