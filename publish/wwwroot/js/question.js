/**
 * QUESTION.JS
 */

let questionActive = false;

(function createBanner() {
    const banner = document.createElement('div');
    banner.id = 'question-banner';
    banner.innerHTML =
        '<span>&#9995; Question raised &mdash; navigation blocked</span>' +
        '<button onclick="dismissQuestion()">Dismiss</button>';
    document.body.appendChild(banner);
}());

function syncQuestionState(status) {
    const pending = (status === 'true');
    if (pending === questionActive) return;
    questionActive = pending;

    document.getElementById('question-banner').classList.toggle('visible', pending);

    const nav = document.getElementById('w-nav');
    if (nav) nav.classList.toggle('nav-blocked', pending);
}

function raiseQuestion() {
    fetch('/question/raise').catch(function(err) {
        console.error('Failed to raise question:', err);
    });
}

function dismissQuestion() {
    fetch('/question/dismiss').catch(function(err) {
        console.error('Failed to dismiss question:', err);
    });
}