// Case Study AI Training Guide JavaScript

// State management
let currentStep = 'intro';
let completedSteps = new Set();
let unlockedSteps = new Set(['intro', 'step1']); // Start with intro and step1 unlocked
let userPath = {
    step2: null, // 'step2a' or 'step2b'
    step3: null, // tracks choice made in step3 (for step unlocking logic)
    step4: null  // 'step4a', 'step4b', or 'step4c'
};

// Step order for progress calculation
const mainSteps = ['intro', 'step1', 'step2', 'step3', 'step4', 'step5', 'step6', 'step7'];
const stepMappings = {
    'step2a': 'step2',
    'step2b': 'step2',
    'step4a': 'step4',
    'step4b': 'step4',
    'step4c': 'step4'
};

// Check if a step should be unlocked based on user progress
function checkStepUnlocking() {
    // Step 2 unlocks after visiting step 1
    if (completedSteps.has('step1') || currentStep === 'step1') {
        unlockedSteps.add('step2');
    }
    
    // Step 3 unlocks after choosing a path in step 2
    if (userPath.step2) {
        unlockedSteps.add('step3');
    }
    
    // Step 4 unlocks after choosing a path in step 3
    if (userPath.step3) {
        unlockedSteps.add('step4');
    }
    
    // Step 5 unlocks after choosing a path in step 4
    if (userPath.step4) {
        unlockedSteps.add('step5');
    }
    
    // Step 6 unlocks after visiting step 5
    if (completedSteps.has('step5') || currentStep === 'step5') {
        unlockedSteps.add('step6');
    }
    
    // Step 7 unlocks after visiting step 6
    if (completedSteps.has('step6') || currentStep === 'step6') {
        unlockedSteps.add('step7');
    }
}

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    setupCopyButtons();
    checkStepUnlocking();  // Check initial unlocking state
    updateNavigation();
    setupStepMarkerNavigation();
    updateSidebarVisibility();  // Initialize sidebar visibility
});

// Setup click navigation for step markers
function setupStepMarkerNavigation() {
    const stepMarkers = document.querySelectorAll('.step-marker');
    stepMarkers.forEach(marker => {
        marker.addEventListener('click', function() {
            const targetStep = this.dataset.step;
            
            // Check if the step is unlocked
            if (!unlockedSteps.has(targetStep)) {
                // Show a message about why they can't access this step
                showStepLockedMessage(targetStep);
                return;
            }
            
            // Determine the actual step to navigate to based on user's previous choices
            let actualStepId = targetStep;
            
            if (targetStep === 'step2' && userPath.step2) {
                actualStepId = userPath.step2; // Go to step2a or step2b based on previous choice
            } else if (targetStep === 'step4' && userPath.step4) {
                actualStepId = userPath.step4; // Go to step4a, step4b, or step4c based on previous choice
            }
            // Note: step3 no longer has intermediate steps, so users always go to the main step3
            
            goToStep(actualStepId);
        });
    });
}

// Show message when user tries to access a locked step
function showStepLockedMessage(stepId) {
    let message = '';
    
    switch(stepId) {
        case 'step2':
            message = 'Please complete Step 1 first to unlock Step 2.';
            break;
        case 'step3':
            message = 'Please choose your path in Step 2 to unlock Step 3.';
            break;
        case 'step4':
            message = 'Please choose your information format in Step 3 to unlock Step 4.';
            break;
        case 'step5':
            message = 'Please share the information in Step 4 to unlock Step 5.';
            break;
        case 'step6':
            message = 'Please complete Step 5 to unlock Step 6.';
            break;
        case 'step7':
            message = 'Please complete Step 6 to unlock Step 7.';
            break;
        default:
            message = 'Please complete the previous steps to unlock this step.';
    }
    
    // Create a temporary notification
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: #ff6b6b;
        color: white;
        padding: 15px 20px;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        z-index: 1000;
        font-weight: 500;
        max-width: 300px;
        opacity: 0;
        transform: translateX(100%);
        transition: all 0.3s ease;
    `;
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    // Animate in
    setTimeout(() => {
        notification.style.opacity = '1';
        notification.style.transform = 'translateX(0)';
    }, 10);
    
    // Remove after 4 seconds
    setTimeout(() => {
        notification.style.opacity = '0';
        notification.style.transform = 'translateX(100%)';
        setTimeout(() => {
            document.body.removeChild(notification);
        }, 300);
    }, 4000);
}

// Navigation functions
function goToStep(stepId) {
    // Get the main step for unlocking checks
    const targetMainStep = stepMappings[stepId] || stepId;
    const currentMainStep = stepMappings[currentStep] || currentStep;
    
    // Check if this is backward navigation (always allowed)
    const isBackwardNavigation = mainSteps.indexOf(targetMainStep) < mainSteps.indexOf(currentMainStep);
    
    // Check if this is a sub-step selection within current step (always allowed)
    const isSubStepSelection = stepMappings[stepId] === currentMainStep;
    
    // Check if target step is unlocked
    if (!isBackwardNavigation && !isSubStepSelection && !unlockedSteps.has(targetMainStep)) {
        showStepLockedMessage(targetMainStep);
        return;
    }
    
    // Hide current step
    const currentElement = document.querySelector('.step-content.active');
    if (currentElement) {
        currentElement.classList.remove('active');
    }
    
    // Show new step
    const newElement = document.getElementById(stepId);
    if (newElement) {
        newElement.classList.add('active');
        
        // Mark previous step as completed (use main step, not sub-step)
        if (currentStep !== 'intro') {
            const previousMainStep = stepMappings[currentStep] || currentStep;
            completedSteps.add(previousMainStep);
        }
        
        // Update current step
        currentStep = stepId;
        
        // Update user path tracking
        updateUserPath(stepId);
        
        // Check and update step unlocking
        checkStepUnlocking();
        
        // Update UI
        updateNavigation();
        
        // Update sidebar visibility
        updateSidebarVisibility();
        
        // Scroll to top
        window.scrollTo(0, 0);
    }
}

function goToPreviousStep() {
    // Determine the previous step based on current path (streamlined flow)
    let previousStep = 'intro';
    
    // Simplified back navigation for streamlined flow
    const stepMap = {
        'step1': 'intro',
        'step2': 'step1',
        'step2a': 'step2',
        'step2b': 'step2',
        'step3': 'step2',
        'step4': 'step3',
        'step4a': 'step3',  // All step 4 variants go back to step 3
        'step4b': 'step3',  // All step 4 variants go back to step 3
        'step4c': 'step3',  // All step 4 variants go back to step 3
        'step5': userPath.step4 || 'step4',
        'step6': 'step5',
        'step7': 'step6'
    };
    
    previousStep = stepMap[currentStep] || 'intro';
    goToStep(previousStep);
}

function updateUserPath(stepId) {
    if (stepId === 'step2a' || stepId === 'step2b') {
        userPath.step2 = stepId;
    } else if (['step3a', 'step3b', 'step3c', 'step3d'].includes(stepId)) {
        userPath.step3 = stepId;
    } else if (['step4a', 'step4b', 'step4c'].includes(stepId)) {
        userPath.step4 = stepId;
    }
}

// Removed - progress is now handled in updateNavigation()

function updateNavigation() {
    // Update step progress navigation indicators
    const stepElements = document.querySelectorAll('.step-marker');
    const stepProgressFill = document.getElementById('stepProgressFill');
    
    stepElements.forEach(element => {
        const stepId = element.dataset.step;
        element.classList.remove('active', 'completed', 'locked');
        
        const mainStep = stepMappings[currentStep] || currentStep;
        
        if (stepId === mainStep) {
            element.classList.add('active');
        } else if (completedSteps.has(stepId) || mainSteps.indexOf(stepId) < mainSteps.indexOf(mainStep)) {
            element.classList.add('completed');
        }
        
        // Add locked class if step is not unlocked
        if (!unlockedSteps.has(stepId)) {
            element.classList.add('locked');
            element.style.cursor = 'not-allowed';
            element.style.opacity = '0.5';
        } else {
            element.style.cursor = 'pointer';
            element.style.opacity = '1';
        }
    });
    
    // Update step progress bar fill
    const currentMainStep = stepMappings[currentStep] || currentStep;
    const currentMainStepIndex = mainSteps.indexOf(currentMainStep);
    const stepProgressPercent = currentMainStepIndex >= 0 ? ((currentMainStepIndex + 1) / mainSteps.length) * 100 : 0;
    stepProgressFill.style.width = Math.round(stepProgressPercent) + '%';
}

function showCompletion() {
    // Mark step 6 as completed
    completedSteps.add('step6');
    goToStep('completion');
}

// Copy to clipboard functionality
function setupCopyButtons() {
    document.addEventListener('click', function(e) {
        if (e.target.classList.contains('copy-btn')) {
            copyPrompt(e.target);
        }
    });
}

function copyPrompt(button) {
    const promptBox = button.closest('.prompt-box');
    const promptContent = promptBox.querySelector('.prompt-content');
    const text = promptContent.textContent;
    
    navigator.clipboard.writeText(text).then(function() {
        // Show success feedback
        const originalText = button.textContent;
        button.textContent = 'Copied!';
        button.classList.add('copied');
        
        setTimeout(function() {
            button.textContent = originalText;
            button.classList.remove('copied');
        }, 2000);
    }).catch(function(err) {
        console.error('Failed to copy text: ', err);
        // Fallback for older browsers
        fallbackCopy(text, button);
    });
}

function fallbackCopy(text, button) {
    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.style.position = 'fixed';
    textArea.style.left = '-999999px';
    textArea.style.top = '-999999px';
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    
    try {
        document.execCommand('copy');
        const originalText = button.textContent;
        button.textContent = 'Copied!';
        button.classList.add('copied');
        
        setTimeout(function() {
            button.textContent = originalText;
            button.classList.remove('copied');
        }, 2000);
    } catch (err) {
        console.error('Fallback copy failed: ', err);
    }
    
    document.body.removeChild(textArea);
}

// Utility function to create prompt boxes
function createPromptBox(title, content) {
    return `
        <div class="prompt-box">
            <div class="prompt-header">
                <div class="prompt-title">${title}</div>
                <button class="copy-btn">Copy to clipboard</button>
            </div>
            <div class="prompt-content">${content}</div>
        </div>
    `;
}

// Reset functionality
function resetGuide() {
    currentStep = 'intro';
    completedSteps.clear();
    unlockedSteps = new Set(['intro', 'step1']); // Reset to initial unlocked steps
    userPath = {
        step2: null,
        step3: null,
        step4: null
    };
    goToStep('intro');
}

// Keyboard navigation
document.addEventListener('keydown', function(e) {
    if (e.ctrlKey || e.metaKey) {
        switch(e.key) {
            case 'ArrowLeft':
                e.preventDefault();
                const backButton = document.querySelector('.step-content.active .btn-secondary');
                if (backButton) backButton.click();
                break;
            case 'ArrowRight':
                e.preventDefault();
                const nextButton = document.querySelector('.step-content.active .btn-primary');
                if (nextButton) nextButton.click();
                break;
        }
    }
});

// Add smooth scrolling for better UX
document.documentElement.style.scrollBehavior = 'smooth';

// Tool selection function
function selectToolAndProceed(toolType) {
    if (toolType === 'pro') {
        userPath.step2 = 'step2a';  // Set the path choice
        checkStepUnlocking();       // Check unlocking before navigating
        goToStep('step2a');
    } else if (toolType === 'free') {
        userPath.step2 = 'step2b';  // Set the path choice
        checkStepUnlocking();       // Check unlocking before navigating
        goToStep('step2b');
    }
}

// Adventure selection function
function selectAdventureAndProceed(step4Path) {
    // Map the step4 path to the corresponding step3 choice for tracking
    const step3ChoiceMap = {
        'step4a': 'step3a',  // In my head -> worksheet
        'step4b': 'step3b',  // Interview -> interview
        'step4c': 'step3c'   // Existing content/draft -> repurpose (both 3c and 3d lead here)
    };
    
    userPath.step3 = step3ChoiceMap[step4Path];  // Set the path choice for tracking
    userPath.step4 = step4Path;                  // Set the step 4 path
    checkStepUnlocking();                        // Check unlocking before navigating
    goToStep(step4Path);                         // Go directly to step 4 variant
}

// Worksheet functionality
function generateWorksheetOutput() {
    const form = document.getElementById('worksheetForm');
    const formData = new FormData(form);
    
    let output = '';
    
    // Check if any required fields are empty
    const requiredFields = ['overall-story', 'describe-merchant', 'describe-partner', 'merchant-challenges', 'shopify-value', 'results', 'success-metrics'];
    let hasEmptyRequired = false;
    
    requiredFields.forEach(fieldName => {
        const value = formData.get(fieldName);
        if (!value || value.trim() === '') {
            hasEmptyRequired = true;
        }
    });
    
    if (hasEmptyRequired) {
        // Try custom error message first, fallback to alert
        try {
            let errorDiv = document.getElementById('worksheetError');
            if (!errorDiv) {
                errorDiv = document.createElement('div');
                errorDiv.id = 'worksheetError';
                errorDiv.style.cssText = 'background: #f8d7da; color: #721c24; border: 1px solid #f5c6cb; border-radius: 6px; padding: 1rem; margin: 1rem 0; font-size: 0.9rem;';
                const worksheetActions = document.querySelector('.worksheet-actions');
                if (worksheetActions) {
                    worksheetActions.parentNode.insertBefore(errorDiv, worksheetActions);
                } else {
                    // Fallback: insert at top of form
                    const form = document.getElementById('worksheetForm');
                    form.insertBefore(errorDiv, form.firstChild);
                }
            }
            errorDiv.textContent = 'Please fill out all the main questions before generating the output.';
            
            // Auto-remove after 5 seconds
            setTimeout(() => {
                if (errorDiv && errorDiv.parentNode) {
                    errorDiv.remove();
                }
            }, 5000);
        } catch (e) {
            // Fallback to alert if custom error fails
            alert('Please fill out all the main questions before generating the output.');
        }
        return;
    }
    
    // Format the output
    output += 'CASE STUDY INFORMATION\n\n';
    
    if (formData.get('overall-story').trim()) {
        output += 'OVERALL STORY:\n';
        output += formData.get('overall-story').trim() + '\n\n';
    }
    
    if (formData.get('describe-merchant').trim()) {
        output += 'ABOUT THE MERCHANT:\n';
        output += formData.get('describe-merchant').trim() + '\n\n';
    }
    
    if (formData.get('describe-partner').trim()) {
        output += 'ABOUT THE PARTNER:\n';
        output += formData.get('describe-partner').trim() + '\n\n';
    }
    
    if (formData.get('merchant-challenges').trim()) {
        output += 'MERCHANT\'S CHALLENGES:\n';
        output += formData.get('merchant-challenges').trim() + '\n\n';
    }
    
    if (formData.get('challenges-quote').trim()) {
        output += 'QUOTE ABOUT CHALLENGES:\n';
        output += formData.get('challenges-quote').trim() + '\n\n';
    }
    
    if (formData.get('shopify-value').trim()) {
        output += 'VALUE OF MOVING TO SHOPIFY:\n';
        output += formData.get('shopify-value').trim() + '\n\n';
    }
    
    if (formData.get('solution-quote').trim()) {
        output += 'QUOTE ABOUT SOLUTION:\n';
        output += formData.get('solution-quote').trim() + '\n\n';
    }
    
    if (formData.get('results').trim()) {
        output += 'RESULTS OF MOVING TO SHOPIFY:\n';
        output += formData.get('results').trim() + '\n\n';
    }
    
    if (formData.get('partnership-outcomes').trim()) {
        output += 'PARTNERSHIP OUTCOMES:\n';
        output += formData.get('partnership-outcomes').trim() + '\n\n';
    }
    
    
    if (formData.get('results-quote').trim()) {
        output += 'QUOTE ABOUT RESULTS:\n';
        output += formData.get('results-quote').trim() + '\n\n';
    }
    
    if (formData.get('success-metrics').trim()) {
        output += 'SUCCESS METRICS:\n';
        output += formData.get('success-metrics').trim() + '\n\n';
    }
    
    // Display the output
    const outputDiv = document.getElementById('worksheetOutput');
    const outputContent = document.getElementById('worksheetOutputContent');
    
    outputContent.textContent = output;
    outputDiv.style.display = 'block';
    
    // Scroll to the output
    outputDiv.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function copyWorksheetOutput() {
    const outputContent = document.getElementById('worksheetOutputContent');
    const text = outputContent.textContent;
    
    if (navigator.clipboard && window.isSecureContext) {
        navigator.clipboard.writeText(text).then(() => {
            const button = event.target;
            const originalText = button.textContent;
            button.textContent = 'Copied!';
            button.classList.add('copied');
            
            setTimeout(() => {
                button.textContent = originalText;
                button.classList.remove('copied');
            }, 2000);
        }).catch(err => {
            console.error('Copy failed: ', err);
            fallbackCopy(text, event.target);
        });
    } else {
        fallbackCopy(text, event.target);
    }
}

function clearWorksheet() {
    if (confirm('Are you sure you want to clear all the form fields? This action cannot be undone.')) {
        const form = document.getElementById('worksheetForm');
        form.reset();
        
        // Hide the output if it's showing
        const outputDiv = document.getElementById('worksheetOutput');
        outputDiv.style.display = 'none';
    }
}



// Toggle Step 3 sidebar function
function toggleStep3Sidebar() {
    const sidebar = document.getElementById('step3Sidebar');
    const toggleArrow = document.getElementById('step3Toggle');
    
    if (sidebar.style.right === '0px' || sidebar.style.right === '') {
        // Slide out (collapse) - leave arrow tab visible
        sidebar.style.right = '-270px';
        toggleArrow.textContent = '◀';
        toggleArrow.style.transform = 'rotate(0deg)';
    } else {
        // Slide in (expand)
        sidebar.style.right = '0px';
        toggleArrow.textContent = '▶';
        toggleArrow.style.transform = 'rotate(0deg)';
    }
}

// Show/hide sidebar based on current step
function updateSidebarVisibility() {
    const step3Sidebar = document.getElementById('step3Sidebar');
    const step3ToggleArrow = document.getElementById('step3Toggle');
    
    // Step 3 sidebar
    if (currentStep === 'step3') {
        step3Sidebar.style.display = 'block';
        // Initialize in extended position
        step3Sidebar.style.right = '0px';
        if (step3ToggleArrow) step3ToggleArrow.textContent = '▶';
    } else {
        step3Sidebar.style.display = 'none';
    }
}



// Toggle interview section function
function toggleInterviewSection(sectionName) {
    const content = document.getElementById(sectionName + 'Content');
    const caret = document.getElementById(sectionName + 'Caret');
    
    if (content.style.display === 'none') {
        content.style.display = 'block';
        caret.textContent = '▼';
    } else {
        content.style.display = 'none';
        caret.textContent = '▶';
    }
}

// Download interview questions for Google Docs
function downloadInterviewQuestions() {
    const content = `SHOPIFY PARTNER CASE STUDY - INTERVIEW QUESTIONS

Use these questions as a guide during your merchant interview. Remember to record and transcribe the interview!

ABOUT (Understanding the business)
• Tell us about how your business got started. How did your products come to be?
• Explain the mission behind your brand. How do your products support this mission?
• Why are you personally passionate about [core goal/mission statement for the company]? What about this work makes you feel energized?

CHALLENGE (Understanding motivations)
• Before partnering with us, what was going well & what was challenging?
• Before Shopify, what platform were you using and what challenges were you running into with it that caused you to consider replatforming?
• What ultimately led to your decision to migrate to Shopify? To work with us as a partner? What excited you about this opportunity?

SOLUTION (Shopify experience)
• In migrating to Shopify, were there any surprises along the way (good and bad)? What aspects of the technology were you most excited about?
• In what ways were we most helpful during your migration?
• What were the key factors that contributed to a successful replatforming?
• Any change management tips for others making a similar migration?
• What's your advice to others who might be considering migrating to Shopify?
• After going live on Shopify, were there any benefits you noticed right away?
• What feedback have you received from customers since moving to Shopify, if any?
• Any Shopify products/features that have been particularly valuable to your business?
• Can you give an example of how you're now better equipped to highlight [mission statement of brand]?
• What have been your/your staff's favorite things about Shopify so far?

RESULTS (Success metrics)
• Growth: Any conversion lifts or other notable growth metrics you've achieved since moving to Shopify? (e.g. YoY sales, AOV, speed of execution, incremental revenue you've been able to add from new channels easily accessible on Shopify, etc.)
• Savings: Did you experience any cost savings by switching to Shopify? If so, do you know the main areas those savings came from (e.g. platform fees, dev costs, support, etc.)? Could you quantify those savings?
• Site Performance: Any improvements to your site speed/performance/uptime?
• Where would you be today if you had not used Shopify?
• What aspect of our partnership have you come to value the most?

WHAT'S NEXT & FUN QUESTIONS
• What's next for your business? What outcomes are you focused on next? Any strategic growth initiatives?

Fun closing questions (examples):
• What is your dream space to furnish? (furniture brand)
• What is the most unique item you've been tasked with shipping? (shipping company)
• What would you be doing if you weren't working at [company]?
• What is your favorite product in your store?

---
Generated from Shopify Partner Case Study AI Tool`;

    // Create a blob and download link
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'Shopify_Interview_Questions.txt';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

// Toggle image specs function
function toggleImageSpecs(imageType) {
    const idMap = {
        'merchant-logo': 'merchantLogo',
        'partner-logo': 'partnerLogo', 
        'hero-image': 'heroImage',
        'card-image': 'cardImage'
    };
    
    const baseId = idMap[imageType];
    const specs = document.getElementById(baseId + 'Specs');
    const caret = document.getElementById(baseId + 'Caret');
    
    if (specs.style.display === 'none') {
        specs.style.display = 'block';
        caret.textContent = '▼';
    } else {
        specs.style.display = 'none';
        caret.textContent = '▶';
    }
}

// Export functions for use in HTML onclick handlers
window.goToStep = goToStep;
window.goToPreviousStep = goToPreviousStep;
window.showCompletion = showCompletion;
window.resetGuide = resetGuide;
window.selectToolAndProceed = selectToolAndProceed;
window.selectAdventureAndProceed = selectAdventureAndProceed;
window.generateWorksheetOutput = generateWorksheetOutput;
window.copyWorksheetOutput = copyWorksheetOutput;
window.clearWorksheet = clearWorksheet;
window.toggleStep3Sidebar = toggleStep3Sidebar;
window.toggleInterviewSection = toggleInterviewSection;
window.downloadInterviewQuestions = downloadInterviewQuestions;
window.toggleImageSpecs = toggleImageSpecs; 