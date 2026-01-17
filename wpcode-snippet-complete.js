/**
 * PrivateGPT Chat Widget - Complete WPCode Snippet JavaScript
 * 
 * This is the COMPLETE JavaScript code containing all 5 core features:
 * 1. Hybrid Intelligence (Memory & Safety)
 * 2. Query Injection (Retrieval Fix)
 * 3. Dynamic Suggestions (Salesperson UI)
 * 4. BANT Qualification Flow
 * 5. Soft Block & Data Saving
 * 
 * TO USE: Copy everything between the <script> tags in chatbot-wpcode-combined.html
 * Or copy this entire file and wrap it in <script></script> tags
 */

(function() {
    'use strict';
    
    // ============================================
    // CONFIGURATION - UPDATE THIS FOR YOUR SETUP
    // ============================================
    
    // Your PrivateGPT API endpoint (OpenAI-compatible)
    const API_URL = 'https://fqbbot.com/v1/chat/completions';
    
    // Optional: Contact email for when information is not available
    const CONTACT_EMAIL = 'info@franquiciaboost.com';
    
    // Calendly Configuration
    const CALENDLY_URL = 'https://calendly.com/franquiciaboost';
    
    // WhatsApp Configuration
    const WHATSAPP_NUMBER = '13683999999';
    const WHATSAPP_MESSAGE = 'Hello! I\'d like to learn more about Franquicia Boost.';
    
    // Webhook Configuration (for saving lead data) - UPDATE THIS
    const WEBHOOK_URL = 'https://your-webhook-url.com/api/leads'; // UPDATE THIS with your actual webhook URL
    
    // Guide PDF URL (for soft block) - UPDATE THIS
    const GUIDE_PDF_URL = 'https://your-domain.com/franchise-guide.pdf'; // UPDATE THIS with your actual PDF URL
    
    // System prompt - Enforces knowledge base only answers with strict anti-hallucination rules
    const SYSTEM_PROMPT = 'You are an AI assistant for Franquicia Boost that MUST ONLY answer questions using information from the provided context/documents. You MUST NOT use any information from your training data or general knowledge. CRITICAL RULES: 1) DO NOT provide external links, URLs, or websites unless they are explicitly listed in the provided context/documents. 2) DO NOT hallucinate, invent, or make up information. 3) If you do not know the answer, strictly say: "I don\'t have that information in my knowledge base. For more details, please contact the Franquicia Boost team directly - you can schedule a meeting with us or drop us an email. We\'d be happy to assist you further!" 4) Do NOT guess, infer, or create information that is not explicitly stated in the context. 5) Remember and reference franchise names mentioned in the conversation when providing follow-up information.';
    
    // Optional: Model name
    const MODEL_NAME = 'gpt-3.5-turbo';
    
    // BANT Scoring Rules
    const SCORING_RULES = {
        budget: {
            'ready_150k_plus': 25,
            '100k_plus': 20,
            '50k_100k': 15,
            'under_50k': 5
        },
        authority: {
            'decision_maker': 20,
            'influencer': 15,
            'researcher': 5
        },
        timeline: {
            '3_months': 20,
            '3_6_months': 15,
            '6_12_months': 10,
            'just_researching': 5
        },
        experience: {
            'actively_researching_6_months': 10,
            'few_weeks_months': 8,
            'just_started': 5
        },
        attraction: {
            'specific_interest': 10,
            'general_exploration': 5
        }
    };
    
    // Qualification Questions
    const QUALIFICATION_QUESTIONS = [
        {
            step: 1,
            question: "Great! Before we schedule your call, I'd like to ask a few quick questions to make sure we maximize your time together. 😊\n\nFirst, have you been exploring franchise opportunities for a while, or is this fairly new?",
            type: 'quick_reply',
            options: [
                { text: 'Just started', value: 'just_started', score: 'experience.just_started' },
                { text: 'Few weeks/months', value: 'few_weeks_months', score: 'experience.few_weeks_months' },
                { text: 'Actively researching 6+ months', value: 'actively_researching_6_months', score: 'experience.actively_researching_6_months' }
            ]
        },
        {
            step: 2,
            question: "Perfect timing! What's your desired timeline for opening a franchise?",
            type: 'quick_reply',
            options: [
                { text: 'Within 3 months', value: '3_months', score: 'timeline.3_months' },
                { text: '3-6 months', value: '3_6_months', score: 'timeline.3_6_months' },
                { text: '6-12 months', value: '6_12_months', score: 'timeline.6_12_months' },
                { text: 'Just researching', value: 'just_researching', score: 'timeline.just_researching' }
            ]
        },
        {
            step: 3,
            question: "Great! Do you have access to the liquid capital needed ($150K+) to invest in a franchise opportunity?",
            type: 'quick_reply',
            options: [
                { text: 'Yes, ready now ($150K+)', value: 'ready_150k_plus', score: 'budget.ready_150k_plus' },
                { text: 'Yes, $100K+ available', value: '100k_plus', score: 'budget.100k_plus' },
                { text: '$50K-$100K available', value: '50k_100k', score: 'budget.50k_100k' },
                { text: 'Under $50K', value: 'under_50k', score: 'budget.under_50k' }
            ]
        },
        {
            step: 4,
            question: "Excellent! And are you the primary decision-maker for this investment, or will others be involved?",
            type: 'quick_reply',
            options: [
                { text: 'Just me', value: 'decision_maker', score: 'authority.decision_maker' },
                { text: 'Me + partner/spouse', value: 'influencer', score: 'authority.influencer' },
                { text: 'Researching for someone else', value: 'researcher', score: 'authority.researcher' }
            ]
        },
        {
            step: 5,
            question: "Wonderful! One last question: What attracted you most to exploring franchise opportunities?",
            type: 'text_input',
            placeholder: 'Type your answer...'
        }
    ];
    
    // Configuration object (can be updated via config panel)
    let CONFIG = {
        privateGPTUrl: API_URL,
        authToken: '',
        calendlyUrl: CALENDLY_URL,
        systemPrompt: SYSTEM_PROMPT
    };
    
    // State Management - FEATURE 1: Hybrid Intelligence
    const state = {
        leadScore: 0,
        isQualifying: false,
        qualificationStep: 0,
        conversationHistory: [],  // Stores last 15 messages for context retention
        qualificationAnswers: {},
        isLoading: false,
        currentFranchiseContext: null  // Tracks the current franchise being discussed
    };
    
    // DOM Elements
    const chatButton = document.getElementById('pgpt-chat-button');
    const chatBox = document.getElementById('pgpt-chat-box');
    const closeButton = document.getElementById('pgpt-close-button');
    const messageInput = document.getElementById('pgpt-message-input');
    const sendButton = document.getElementById('pgpt-send-button');
    const chatMessages = document.getElementById('pgpt-chat-messages');
    const disclaimerBanner = document.getElementById('pgpt-disclaimer-banner');
    const closeDisclaimer = document.getElementById('pgpt-close-disclaimer');
    const typingIndicator = document.getElementById('pgpt-typing-indicator');
    const calendlyOverlay = document.getElementById('pgpt-calendly-overlay');
    const closeCalendlyBtn = document.getElementById('pgpt-close-calendly');
    const whatsappWidget = document.getElementById('pgpt-whatsapp-widget');
    const scoreIndicator = document.getElementById('pgpt-score-indicator');
    const scoreValue = document.getElementById('pgpt-score-value');
    const statusEl = document.getElementById('pgpt-status');
    const configPanel = document.getElementById('pgpt-config-panel');
    const closeConfigBtn = document.getElementById('pgpt-close-config');
    
    // Toggle chat box
    function toggleChat() {
        chatBox.classList.toggle('pgpt-hidden');
        if (!chatBox.classList.contains('pgpt-hidden')) {
            messageInput.focus();
        }
    }
    
    // Update status
    function updateStatus(status) {
        if (statusEl) {
            statusEl.textContent = '● ' + status;
        }
    }
    
    // Update score indicator
    function updateScoreIndicator() {
        if (state.isQualifying || state.leadScore > 0) {
            scoreIndicator.classList.remove('pgpt-hidden');
            scoreValue.textContent = state.leadScore;
            
            // Color based on score
            if (state.leadScore >= 60) {
                scoreValue.style.color = '#28a745';
            } else {
                scoreValue.style.color = '#ffc107';
            }
        } else {
            scoreIndicator.classList.add('pgpt-hidden');
        }
    }
    
    // Add message to chat - FEATURE 3: Salesperson UI (Dynamic Suggestions)
    function addMessage(text, isUser = false, showButtons = false, buttons = [], suggestedQuestions = null) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `pgpt-message ${isUser ? 'pgpt-user-message' : 'pgpt-assistant-message'}`;
        
        const avatarDiv = document.createElement('div');
        avatarDiv.className = 'pgpt-avatar';
        if (isUser) {
            avatarDiv.innerHTML = '<span class="pgpt-avatar-fallback">👤</span>';
        } else {
            avatarDiv.innerHTML = '<img src="https://staging2.franquiciaboost.com/wp-content/uploads/2023/11/cropped-IconOnly_Transparent-2.png" alt="Franquicia Boost" class="pgpt-avatar-img" onerror="this.style.display=\'none\'; this.nextElementSibling.style.display=\'block\';"><span class="pgpt-avatar-fallback" style="display: none;">🤖</span>';
        }
        
        const bubbleDiv = document.createElement('div');
        bubbleDiv.className = 'pgpt-bubble';
        
        // Format message text
        const formattedText = formatMessage(text);
        bubbleDiv.innerHTML = formattedText;
        
        // Add quick reply buttons if needed (for qualification)
        if (showButtons && buttons.length > 0) {
            const buttonsContainer = document.createElement('div');
            buttonsContainer.className = 'pgpt-quick-reply-buttons';
            
            buttons.forEach(button => {
                const btn = document.createElement('button');
                btn.className = 'pgpt-quick-reply-btn';
                btn.textContent = button.text;
                btn.onclick = () => handleQuickReply(button.value, button.score);
                buttonsContainer.appendChild(btn);
            });
            
            bubbleDiv.appendChild(buttonsContainer);
        }
        
        // Add suggested questions if provided (FEATURE 3: Dynamic follow-up questions)
        if (suggestedQuestions && suggestedQuestions.length > 0 && !isUser) {
            const suggestedContainer = document.createElement('div');
            suggestedContainer.className = 'pgpt-suggested-questions';
            
            suggestedQuestions.forEach(question => {
                const btn = document.createElement('button');
                btn.className = 'pgpt-suggested-question';
                btn.textContent = question.text;
                btn.onclick = () => {
                    sendMessage(question.prompt);
                };
                suggestedContainer.appendChild(btn);
            });
            
            bubbleDiv.appendChild(suggestedContainer);
        }
        
        messageDiv.appendChild(avatarDiv);
        messageDiv.appendChild(bubbleDiv);
        
        chatMessages.appendChild(messageDiv);
        chatMessages.scrollTop = chatMessages.scrollHeight;
        
        // FEATURE 1: Always store messages in conversation history (for memory)
        if (isUser) {
            state.conversationHistory.push({ role: 'user', content: text });
        } else {
            state.conversationHistory.push({ role: 'assistant', content: text });
            
            // Extract franchise name from assistant response (for context tracking)
            const franchiseName = extractFranchiseName(text);
            if (franchiseName) {
                state.currentFranchiseContext = franchiseName;
            }
        }
        
        // Limit conversation history to last 15 messages to avoid token limits
        if (state.conversationHistory.length > 15) {
            const systemMsg = state.conversationHistory.find(m => m.role === 'system');
            const recentMsgs = state.conversationHistory.filter(m => m.role !== 'system').slice(-14);
            state.conversationHistory = systemMsg ? [systemMsg, ...recentMsgs] : recentMsgs;
        }
    }
    
    // Format message text
    function formatMessage(text) {
        let formatted = text.replace(/\n/g, '<br>');
        formatted = formatted.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
        formatted = formatted.replace(/\*(.+?)\*/g, '<em>$1</em>');
        return '<p>' + formatted + '</p>';
    }
    
    // FEATURE 1: Extract franchise name from text (for context tracking)
    function extractFranchiseName(text) {
        const franchisePatterns = [
            /(?:franchise|opportunity|brand)\s+(?:called|named|is|are)\s+["']?([A-Z][a-zA-Z\s&]+)["']?/i,
            /["']([A-Z][a-zA-Z\s&]{2,30})["']\s+(?:franchise|opportunity|brand)/i,
            /(?:about|regarding|for)\s+["']?([A-Z][a-zA-Z\s&]{2,30})["']?/i
        ];
        
        const lowerText = text.toLowerCase();
        const hasFranchiseContext = lowerText.includes('franchise') || 
                                     lowerText.includes('opportunity') || 
                                     lowerText.includes('brand');
        
        if (!hasFranchiseContext) return null;
        
        // Try to extract franchise name using patterns
        for (const pattern of franchisePatterns) {
            const match = text.match(pattern);
            if (match && match[1]) {
                const franchiseName = match[1].trim();
                if (franchiseName.length > 2 && 
                    !['the', 'this', 'that', 'franchise', 'opportunity', 'brand'].includes(franchiseName.toLowerCase())) {
                    return franchiseName;
                }
            }
        }
        
        // Fallback: Look for capitalized words that might be franchise names
        const capitalizedWords = text.match(/\b([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)\b/g);
        if (capitalizedWords && capitalizedWords.length > 0) {
            const candidates = capitalizedWords.filter(word => {
                const lower = word.toLowerCase();
                return !['Pizza', 'Hut', 'McDonald', 'Burger', 'King', 'Franquicia', 'Boost'].includes(lower) &&
                       word.length > 3 && word.length < 30;
            });
            if (candidates.length > 0 && hasFranchiseContext) {
                return candidates[0];
            }
        }
        
        return null;
    }
    
    // FEATURE 3: Generate suggested questions based on context (Dynamic follow-ups)
    function generateSuggestedQuestions(responseText, franchiseName) {
        const lowerText = responseText.toLowerCase();
        
        // If a specific franchise is mentioned, show franchise-specific questions
        if (franchiseName || (lowerText.includes('franchise') && lowerText.match(/\b[A-Z][a-z]+\b/))) {
            const franchise = franchiseName || state.currentFranchiseContext || 'this franchise';
            
            return [
                {
                    text: 'What is the initial investment?',
                    prompt: `What is the initial investment required for ${franchise}?`
                },
                {
                    text: 'Show me success stories',
                    prompt: `Show me success stories or case studies for ${franchise}`
                },
                {
                    text: 'Schedule a discovery call',
                    prompt: 'schedule a call'
                }
            ];
        } else {
            // Generic questions if no specific franchise mentioned
            return [
                {
                    text: 'Browse by Industry',
                    prompt: 'What franchise industries do you have available?'
                },
                {
                    text: 'Filter by Budget',
                    prompt: 'What franchises do you have under $100,000 investment?'
                },
                {
                    text: 'Schedule a discovery call',
                    prompt: 'schedule a call'
                }
            ];
        }
    }
    
    // Show typing indicator
    function showTyping() {
        typingIndicator.classList.remove('pgpt-hidden');
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }
    
    // Hide typing indicator
    function hideTyping() {
        typingIndicator.classList.add('pgpt-hidden');
    }
    
    // ============================================
    // FEATURE 4: QUALIFICATION FLOW FUNCTIONS (BANT Quiz)
    // ============================================
    
    function startQualificationFlow() {
        state.isQualifying = true;
        state.qualificationStep = 0;
        state.leadScore = 0;
        state.qualificationAnswers = {};
        updateStatus('Qualifying Lead');
        updateScoreIndicator();
        nextQualificationStep();
    }
    
    function nextQualificationStep() {
        if (state.qualificationStep >= QUALIFICATION_QUESTIONS.length) {
            completeQualification();
            return;
        }
        
        const question = QUALIFICATION_QUESTIONS[state.qualificationStep];
        
        if (question.type === 'quick_reply') {
            addMessage(question.question, false, true, question.options);
        } else if (question.type === 'text_input') {
            addMessage(question.question, false);
            messageInput.placeholder = question.placeholder || 'Type your answer...';
            messageInput.disabled = false;
        }
    }
    
    function handleQualificationStep(userInput, optionValue = null, scorePath = null) {
        const currentQuestion = QUALIFICATION_QUESTIONS[state.qualificationStep];
        
        state.qualificationAnswers[`step_${currentQuestion.step}`] = {
            question: currentQuestion.question,
            answer: userInput,
            value: optionValue || userInput
        };
        
        if (scorePath) {
            const [category, key] = scorePath.split('.');
            const score = SCORING_RULES[category]?.[key] || 0;
            state.leadScore += score;
            updateScoreIndicator();
        }
        
        addMessage(userInput, true);
        
        state.qualificationStep++;
        setTimeout(() => {
            nextQualificationStep();
        }, 500);
    }
    
    // FEATURE 5: Updated handleQuickReply (Soft Block handling)
    function handleQuickReply(value, scorePath) {
        // Handle special values for soft block options
        if (value === 'force_schedule') {
            // User wants to schedule despite low score
            addMessage(
                'I understand! Let me help you schedule a call anyway. Our team is happy to talk with you about your franchise opportunities! 📞',
                false
            );
            setTimeout(() => {
                openCalendlyWidget();
                // Save lead with force_schedule flag
                saveLeadData({ action: 'force_schedule', leadScore: state.leadScore });
            }, 1000);
            return;
        }
        
        if (value === 'send_guide') {
            // User wants the guide
            addMessage(
                `Perfect! Here's our comprehensive franchise guide: ${GUIDE_PDF_URL}\n\n` +
                `This guide will help you understand the franchise process, investment requirements, and what to expect. ` +
                `Feel free to reach out if you have any questions! 😊`,
                false
            );
            // Save lead with guide request
            saveLeadData({ action: 'send_guide', leadScore: state.leadScore });
            return;
        }
        
        // Handle normal qualification questions
        const currentQuestion = QUALIFICATION_QUESTIONS[state.qualificationStep];
        const option = currentQuestion.options.find(opt => opt.value === value);
        
        if (option) {
            handleQualificationStep(option.text, value, scorePath);
        }
    }
    
    // FEATURE 5: Save lead data to webhook
    async function saveLeadData(additionalData = {}) {
        try {
            const leadData = {
                timestamp: new Date().toISOString(),
                leadScore: state.leadScore,
                qualificationAnswers: state.qualificationAnswers,
                currentFranchiseContext: state.currentFranchiseContext,
                conversationSummary: state.conversationHistory.slice(-5).map(m => 
                    `${m.role}: ${m.content.substring(0, 100)}`
                ).join('\n'),
                ...additionalData
            };
            
            // Send to webhook (fire and forget - don't block UI)
            if (WEBHOOK_URL && WEBHOOK_URL !== 'https://your-webhook-url.com/api/leads') {
                fetch(WEBHOOK_URL, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(leadData)
                }).catch(error => {
                    console.error('Error saving lead data:', error);
                    // Fail silently - don't interrupt user experience
                });
            }
            
            console.log('Lead data saved:', leadData);
        } catch (error) {
            console.error('Error in saveLeadData:', error);
            // Fail silently - don't interrupt user experience
        }
    }
    
    // FEATURE 5: Updated completeQualification (Soft Block)
    function completeQualification() {
        state.isQualifying = false;
        updateStatus('Ready');
        messageInput.placeholder = 'Type your message...';
        messageInput.disabled = false;
        
        // Save lead data FIRST (before showing results)
        saveLeadData({ 
            qualificationCompleted: true,
            finalScore: state.leadScore
        });
        
        if (state.leadScore >= 60) {
            // Qualified lead - show success message and open Calendly
            addMessage(
                `Perfect! ✅ Based on what you've shared (Score: ${state.leadScore}/100), I think you'd be a great fit for our franchise opportunities. ` +
                `Let me connect you with our development team for a discovery call! 📞\n\n` +
                `I can help you book a 30-minute consultation. They'll walk you through:\n` +
                `✓ Detailed financial projections\n` +
                `✓ Available territories in your area\n` +
                `✓ The complete onboarding process\n` +
                `✓ Answer all your questions\n\n` +
                `Click below to schedule your call:`,
                false,
                true,
                [
                    { text: '📅 Schedule Discovery Call', value: 'schedule_call', score: null },
                    { text: 'Not right now', value: 'not_now', score: null }
                ]
            );
            
            // Automatically open Calendly after a short delay
            setTimeout(() => {
                openCalendlyWidget();
            }, 2000);
        } else {
            // FEATURE 5: Soft Block - Score < 60
            // Don't reject them, offer value instead
            addMessage(
                `Thank you for your interest! 😊 You're a bit early in your journey (Score: ${state.leadScore}/100), but we're here to help you every step of the way!\n\n` +
                `Many successful franchisees started exactly where you are. We have resources to guide you through the process. ` +
                `What would you like to do next?`,
                false,
                true,
                [
                    { text: '📂 Send me the Guide', value: 'send_guide', score: null },
                    { text: '📅 I still want to book a call', value: 'force_schedule', score: null }
                ]
            );
        }
    }
    
    // ============================================
    // FEATURE 1 & 2: PRIVATEGPT API INTEGRATION (Memory + Query Injection)
    // ============================================
    
    async function sendToPrivateGPT(userMessage) {
        if (state.isLoading) return;
        
        state.isLoading = true;
        sendButton.disabled = true;
        
        addMessage(userMessage, true);
        messageInput.value = '';
        showTyping();
        updateStatus('Thinking...');
        
        try {
            const messages = [];
            
            // Add system prompt with franchise context
            if (CONFIG.systemPrompt) {
                let systemPromptContent = CONFIG.systemPrompt;
                if (CONTACT_EMAIL) {
                    systemPromptContent = systemPromptContent.replace(
                        'drop us an email',
                        'drop us an email at ' + CONTACT_EMAIL
                    );
                }
                
                // FEATURE 1: Add context about current franchise if available
                if (state.currentFranchiseContext) {
                    systemPromptContent += ` Currently discussing: ${state.currentFranchiseContext}. Reference this franchise when relevant.`;
                }
                
                messages.push({ role: 'system', content: systemPromptContent });
            }
            
            // FEATURE 1: Use last 15 messages for better context retention
            const conversationWithoutSystem = state.conversationHistory.filter(m => m.role !== 'system');
            const recentHistory = conversationWithoutSystem.slice(-15);
            
            // FEATURE 2: QUERY INJECTION FIX
            // If we have a franchise context, inject it into the current user query
            // This ensures Qdrant searches for "Bento Sushi training" instead of just "training"
            let apiUserMessage = userMessage;
            
            // Check if we have a franchise context and the user query doesn't already mention it
            if (state.currentFranchiseContext && 
                !userMessage.toLowerCase().includes(state.currentFranchiseContext.toLowerCase())) {
                // Append context silently for the AI/vector search
                apiUserMessage = `${userMessage} (regarding ${state.currentFranchiseContext})`;
                console.log("🔍 Context Injection:", apiUserMessage); // For debugging
            }
            
            // Remove the current user message from history (we'll add enhanced version)
            const historyWithoutCurrentMessage = recentHistory.filter((msg, index) => {
                return !(index === recentHistory.length - 1 && msg.role === 'user' && msg.content === userMessage);
            });
            
            // Add conversation history (excluding current message)
            messages.push(...historyWithoutCurrentMessage);
            
            // Add the enhanced user message for the API call
            // Note: This enhanced version is only used for API/search, not stored in conversationHistory
            messages.push({ role: 'user', content: apiUserMessage });
            
            // Build auth header
            let headers = {
                'Content-Type': 'application/json'
            };
            
            if (CONFIG.authToken) {
                if (CONFIG.authToken.includes(':')) {
                    headers['Authorization'] = 'Basic ' + btoa(CONFIG.authToken);
                } else {
                    headers['Authorization'] = CONFIG.authToken.startsWith('Basic ') 
                        ? CONFIG.authToken 
                        : 'Basic ' + CONFIG.authToken;
                }
            }
            
            // Make API request
            const response = await fetch(CONFIG.privateGPTUrl, {
                method: 'POST',
                headers: headers,
                body: JSON.stringify({
                    model: MODEL_NAME,
                    messages: messages,
                    use_context: true,
                    include_sources: true,
                    stream: false,
                    temperature: 0.1,
                    max_tokens: 1000
                })
            });
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const data = await response.json();
            hideTyping();
            updateStatus('Ready');
            
            // Extract assistant's response
            if (data.choices && data.choices[0] && data.choices[0].message) {
                const assistantMessage = data.choices[0].message.content;
                
                // FEATURE 1: Extract franchise name from response
                const detectedFranchise = extractFranchiseName(assistantMessage);
                if (detectedFranchise) {
                    state.currentFranchiseContext = detectedFranchise;
                }
                
                // FEATURE 3: Generate suggested questions based on response
                const suggestedQuestions = generateSuggestedQuestions(assistantMessage, detectedFranchise);
                
                // Process sources if available
                let sourcesInfo = '';
                const responseText = assistantMessage.toLowerCase();
                const mentionsNotInContext = responseText.includes("don't have that information") || 
                                             responseText.includes("not in my knowledge base") ||
                                             responseText.includes("not in the context");
                
                if (data.choices[0].sources && data.choices[0].sources.length > 0) {
                    const sources = data.choices[0].sources;
                    const uniqueDocs = [...new Set(sources.map(s => {
                        return s.document?.doc_metadata?.file_name || s.metadata?.file_name || 'Unknown document';
                    }))];
                    
                    const avgScore = sources.reduce((sum, s) => sum + (s.score || 0), 0) / sources.length;
                    const lowRelevance = avgScore < 0.75;
                    
                    if (mentionsNotInContext || lowRelevance) {
                        sourcesInfo = `<div class="pgpt-sources-info warning">
                            ⚠️ WARNING: Low relevance sources (avg similarity: ${(avgScore * 100).toFixed(1)}%)<br>
                            Sources: ${uniqueDocs.join(', ')}
                        </div>`;
                    } else {
                        sourcesInfo = `<div class="pgpt-sources-info success">
                            📚 Sources from Knowledge Base (${uniqueDocs.length} document${uniqueDocs.length > 1 ? 's' : ''}):<br>
                            ${uniqueDocs.map((fileName, index) => `${index + 1}. ${fileName}`).join('<br>')}<br>
                            ✅ Answer based on documents (avg similarity: ${(avgScore * 100).toFixed(1)}%)
                        </div>`;
                    }
                } else {
                    sourcesInfo = '<div class="pgpt-sources-info warning">⚠️ Note: No sources returned. Response may be from general knowledge.</div>';
                }
                
                // FEATURE 1: Sanitize response to remove any external links that might have been hallucinated
                let sanitizedMessage = assistantMessage;
                
                // Remove URLs that aren't in allowed domains
                const urlPattern = /(https?:\/\/[^\s]+)/g;
                const urls = assistantMessage.match(urlPattern);
                if (urls) {
                    // Only allow franquiciaboost.com, calendly.com, and wa.me (WhatsApp)
                    const allowedDomains = ['franquiciaboost.com', 'calendly.com', 'wa.me', 'whatsapp.com'];
                    urls.forEach(url => {
                        const isAllowed = allowedDomains.some(domain => url.includes(domain));
                        if (!isAllowed) {
                            sanitizedMessage = sanitizedMessage.replace(url, '[Link removed - not in knowledge base]');
                        }
                    });
                }
                
                // Add message with sources and suggested questions
                const messageDiv = document.createElement('div');
                messageDiv.className = 'pgpt-message pgpt-assistant-message';
                
                const avatarDiv = document.createElement('div');
                avatarDiv.className = 'pgpt-avatar';
                avatarDiv.innerHTML = '<img src="https://staging2.franquiciaboost.com/wp-content/uploads/2023/11/cropped-IconOnly_Transparent-2.png" alt="Franquicia Boost" class="pgpt-avatar-img" onerror="this.style.display=\'none\'; this.nextElementSibling.style.display=\'block\';"><span class="pgpt-avatar-fallback" style="display: none;">🤖</span>';
                
                const bubbleDiv = document.createElement('div');
                bubbleDiv.className = 'pgpt-bubble';
                bubbleDiv.innerHTML = formatMessage(sanitizedMessage) + sourcesInfo;
                
                // FEATURE 3: Add suggested questions container
                if (suggestedQuestions && suggestedQuestions.length > 0) {
                    const suggestedContainer = document.createElement('div');
                    suggestedContainer.className = 'pgpt-suggested-questions';
                    
                    suggestedQuestions.forEach(question => {
                        const btn = document.createElement('button');
                        btn.className = 'pgpt-suggested-question';
                        btn.textContent = question.text;
                        btn.onclick = () => {
                            sendMessage(question.prompt);
                        };
                        suggestedContainer.appendChild(btn);
                    });
                    
                    bubbleDiv.appendChild(suggestedContainer);
                }
                
                messageDiv.appendChild(avatarDiv);
                messageDiv.appendChild(bubbleDiv);
                
                chatMessages.appendChild(messageDiv);
                chatMessages.scrollTop = chatMessages.scrollHeight;
                
                // FEATURE 1: Store sanitized message in conversationHistory
                state.conversationHistory.push({ role: 'assistant', content: sanitizedMessage });
                
                // Limit conversation history to last 15 messages
                if (state.conversationHistory.length > 15) {
                    const systemMsg = state.conversationHistory.find(m => m.role === 'system');
                    const recentMsgs = state.conversationHistory.filter(m => m.role !== 'system').slice(-14);
                    state.conversationHistory = systemMsg ? [systemMsg, ...recentMsgs] : recentMsgs;
                }
                
                // Check for meeting trigger
                checkForMeetingTrigger(assistantMessage);
                
            } else {
                throw new Error('Unexpected API response format');
            }
            
        } catch (error) {
            hideTyping();
            updateStatus('Error');
            console.error('Error:', error);
            
            let errorMessage = 'Sorry, I encountered an error. Please try again later.';
            
            if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError')) {
                errorMessage = 'Sorry, I\'m having trouble connecting. Please check your internet connection and try again.';
            } else if (error.message.includes('HTTP error')) {
                errorMessage = `Sorry, there was a server error (${error.message}). Please try again in a moment.`;
            }
            
            addMessage(errorMessage, false);
        } finally {
            state.isLoading = false;
            sendButton.disabled = false;
            messageInput.focus();
        }
    }
    
    function checkForMeetingTrigger(botResponse) {
        const meetingTriggers = [
            'schedule',
            'discovery call',
            'book a call',
            'meeting',
            'consultation',
            'talk to someone'
        ];
        
        const lowerResponse = botResponse.toLowerCase();
        const hasTrigger = meetingTriggers.some(trigger => lowerResponse.includes(trigger));
        
        if (hasTrigger && !state.isQualifying) {
            setTimeout(() => {
                addMessage(
                    'Would you like to schedule a discovery call?',
                    false,
                    true,
                    [
                        { text: 'Yes, Schedule Discovery Call', value: 'schedule_call', score: null },
                        { text: 'Not right now', value: 'not_now', score: null }
                    ]
                );
            }, 500);
        }
    }
    
    // ============================================
    // MAIN MESSAGE HANDLER
    // ============================================
    
    async function sendMessage(userMessage) {
        if (!userMessage.trim() || state.isLoading) return;
        
        const lowerMessage = userMessage.toLowerCase();
        
        // FEATURE 4: Check if user wants to schedule (triggers BANT qualification)
        if ((lowerMessage.includes('schedule') || lowerMessage.includes('meeting') || lowerMessage.includes('call')) 
            && !state.isQualifying && lowerMessage !== 'not right now' && lowerMessage !== 'not now') {
            startQualificationFlow();
            return;
        }
        
        // Handle special actions
        if (lowerMessage === 'not right now' || lowerMessage === 'not now' || lowerMessage === 'schedule_call') {
            if (lowerMessage === 'schedule_call') {
                openCalendlyWidget();
            } else {
                addMessage('No problem! Feel free to ask me any questions about franchises, and we can schedule a call whenever you\'re ready.', false);
            }
            return;
        }
        
        // FEATURE 5: Handle force_schedule and send_guide (if typed manually)
        if (lowerMessage === 'force_schedule' || lowerMessage.includes('i still want to book')) {
            handleQuickReply('force_schedule', null);
            return;
        }
        
        if (lowerMessage === 'send_guide' || lowerMessage.includes('send me the guide') || lowerMessage.includes('send guide')) {
            handleQuickReply('send_guide', null);
            return;
        }
        
        // FEATURE 4: If in qualification mode
        if (state.isQualifying) {
            const currentQuestion = QUALIFICATION_QUESTIONS[state.qualificationStep];
            
            if (currentQuestion && currentQuestion.type === 'text_input') {
                // Score text input based on content
                let score = 5; // Default
                if (userMessage.length > 20 && (userMessage.toLowerCase().includes('roi') || 
                    userMessage.toLowerCase().includes('return') || 
                    userMessage.toLowerCase().includes('profit'))) {
                    score = 10; // Specific interest
                }
                state.leadScore += score;
                updateScoreIndicator();
                handleQualificationStep(userMessage);
            } else {
                addMessage('Please select one of the options above by clicking the buttons.', false);
            }
            return;
        }
        
        // Normal flow - send to PrivateGPT
        await sendToPrivateGPT(userMessage);
    }
    
    // ============================================
    // CALENDLY INTEGRATION
    // ============================================
    
    function openCalendlyWidget() {
        if (calendlyOverlay) {
            calendlyOverlay.classList.remove('pgpt-hidden');
            
            // Load Calendly widget script if not already loaded
            if (!window.Calendly) {
                const script = document.createElement('script');
                script.src = 'https://assets.calendly.com/assets/external/widget.js';
                script.async = true;
                document.body.appendChild(script);
            }
            
            // Initialize Calendly inline widget
            setTimeout(() => {
                if (window.Calendly) {
                    const calendlyDiv = document.getElementById('pgpt-calendly-inline-widget');
                    if (calendlyDiv && !calendlyDiv.hasAttribute('data-calendly-initialized')) {
                        window.Calendly.initInlineWidget({
                            url: CONFIG.calendlyUrl || CALENDLY_URL,
                            parentElement: calendlyDiv
                        });
                        calendlyDiv.setAttribute('data-calendly-initialized', 'true');
                    }
                }
            }, 500);
        }
    }
    
    function closeCalendlyWidget() {
        if (calendlyOverlay) {
            calendlyOverlay.classList.add('pgpt-hidden');
        }
    }
    
    // ============================================
    // CONFIGURATION FUNCTIONS
    // ============================================
    
    function updateConfig() {
        const urlInput = document.getElementById('pgpt-config-url');
        const authInput = document.getElementById('pgpt-config-auth');
        const calendlyInput = document.getElementById('pgpt-config-calendly');
        
        if (urlInput) CONFIG.privateGPTUrl = urlInput.value || CONFIG.privateGPTUrl;
        if (authInput) CONFIG.authToken = authInput.value || '';
        if (calendlyInput) CONFIG.calendlyUrl = calendlyInput.value || CONFIG.calendlyUrl;
        
        addMessage('✅ Configuration updated!', false);
        console.log('Config updated:', CONFIG);
    }
    
    function resetChat() {
        state.leadScore = 0;
        state.isQualifying = false;
        state.qualificationStep = 0;
        state.conversationHistory = [];
        state.qualificationAnswers = {};
        state.currentFranchiseContext = null;
        
        chatMessages.innerHTML = '';
        
        // Reset initial greeting
        const greetingDiv = document.createElement('div');
        greetingDiv.className = 'pgpt-message pgpt-assistant-message';
        greetingDiv.innerHTML = `
            <div class="pgpt-avatar">
                <img src="https://staging2.franquiciaboost.com/wp-content/uploads/2023/11/cropped-IconOnly_Transparent-2.png" alt="Franquicia Boost" class="pgpt-avatar-img" onerror="this.style.display='none'; this.nextElementSibling.style.display='block';">
                <span class="pgpt-avatar-fallback" style="display: none;">🤖</span>
            </div>
            <div class="pgpt-bubble">
                <p>Hello! 👋 I'm here to help you find the perfect franchise opportunity. You can ask me questions about franchises, or type "schedule a call" to book a discovery meeting.</p>
            </div>
        `;
        chatMessages.appendChild(greetingDiv);
        
        updateScoreIndicator();
        updateStatus('Ready');
        messageInput.placeholder = 'Type your message...';
        messageInput.disabled = false;
    }
    
    function openConfig() {
        if (configPanel) {
            const urlInput = document.getElementById('pgpt-config-url');
            const authInput = document.getElementById('pgpt-config-auth');
            const calendlyInput = document.getElementById('pgpt-config-calendly');
            
            if (urlInput) urlInput.value = CONFIG.privateGPTUrl;
            if (authInput) authInput.value = CONFIG.authToken;
            if (calendlyInput) calendlyInput.value = CONFIG.calendlyUrl;
            
            configPanel.classList.remove('pgpt-hidden');
        }
    }
    
    function closeConfig() {
        if (configPanel) {
            configPanel.classList.add('pgpt-hidden');
        }
    }
    
    // ============================================
    // WHATSAPP FUNCTIONS
    // ============================================
    
    function handleWhatsAppClick(e) {
        e.preventDefault();
        
        if (!WHATSAPP_NUMBER || WHATSAPP_NUMBER === 'YOUR_WHATSAPP_NUMBER') {
            alert('Please configure your WhatsApp number in the widget settings.');
            return;
        }
        
        const encodedMessage = encodeURIComponent(WHATSAPP_MESSAGE);
        const whatsappUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodedMessage}`;
        
        window.open(whatsappUrl, '_blank', 'noopener,noreferrer');
    }
    
    // ============================================
    // EVENT LISTENERS
    // ============================================
    
    chatButton.addEventListener('click', toggleChat);
    closeButton.addEventListener('click', toggleChat);
    
    if (closeCalendlyBtn) {
        closeCalendlyBtn.addEventListener('click', closeCalendlyWidget);
    }
    
    if (calendlyOverlay) {
        calendlyOverlay.addEventListener('click', (e) => {
            if (e.target === calendlyOverlay) {
                closeCalendlyWidget();
            }
        });
    }
    
    if (whatsappWidget) {
        whatsappWidget.addEventListener('click', handleWhatsAppClick);
    }
    
    sendButton.addEventListener('click', () => {
        const message = messageInput.value.trim();
        if (message) {
            sendMessage(message);
        }
    });
    
    messageInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            const message = messageInput.value.trim();
            if (message) {
                sendMessage(message);
            }
        }
    });
    
    if (closeDisclaimer) {
        closeDisclaimer.addEventListener('click', () => {
            disclaimerBanner.classList.add('pgpt-hidden');
        });
    }
    
    if (closeConfigBtn) {
        closeConfigBtn.addEventListener('click', closeConfig);
    }
    
    // ============================================
    // EXPOSE API FOR EXTERNAL ACCESS
    // ============================================
    
    window.PGPT = {
        sendMessage: sendMessage,
        startQualification: startQualificationFlow,
        getLeadScore: () => state.leadScore,
        getState: () => ({ ...state }),
        config: CONFIG,
        updateConfig: updateConfig,
        resetChat: resetChat,
        openConfig: openConfig,
        closeConfig: closeConfig,
        openCalendly: openCalendlyWidget
    };
    
})();

