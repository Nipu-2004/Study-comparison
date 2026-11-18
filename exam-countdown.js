(function () {
    const timerByElement = new WeakMap();

    function usernameKey(username) {
        return username.trim().toLowerCase();
    }

    function isValidExamDetails(level, examMonth) {
        return ["A/L", "O/L"].includes(level) &&
            /^\d{4}-(0[1-9]|1[0-2])$/.test(examMonth);
    }

    function save(username, level, examMonth) {
        if (!username || !isValidExamDetails(level, examMonth)) {
            throw new Error("Valid student level and exam month are required.");
        }

        const key = usernameKey(username);
        localStorage.setItem(`studyTrackerExamLevel:${key}`, level);
        localStorage.setItem(`studyTrackerExamMonth:${key}`, examMonth);
    }

    function get(username) {
        if (!username) return null;

        const key = usernameKey(username);
        const level = localStorage.getItem(`studyTrackerExamLevel:${key}`);
        const examMonth = localStorage.getItem(`studyTrackerExamMonth:${key}`);

        if (!level && !examMonth) return null;
        if (!isValidExamDetails(level, examMonth)) {
            console.error("Saved exam details are invalid for this account.");
            return null;
        }

        return { level, examMonth };
    }

    function clear(element) {
        const timer = timerByElement.get(element);
        if (timer) clearInterval(timer);
        timerByElement.delete(element);
        element.textContent = "";
    }

    function render(element, level, examMonth) {
        if (!isValidExamDetails(level, examMonth)) {
            throw new Error("Cannot display a countdown for invalid exam details.");
        }

        clear(element);

        const [year, month] = examMonth.split("-").map(Number);
        const target = new Date(year, month, 0, 23, 59, 59, 999);
        const targetLabel = target.toLocaleDateString(undefined, {
            year: "numeric",
            month: "long",
            day: "numeric"
        });

        function update() {
            const remaining = target.getTime() - Date.now();
            if (remaining < 0) {
                element.textContent = `${level} exam period ended on ${targetLabel}.`;
                clearInterval(timerByElement.get(element));
                timerByElement.delete(element);
                return;
            }

            const totalSeconds = Math.floor(remaining / 1000);
            const days = Math.floor(totalSeconds / 86400);
            const hours = Math.floor((totalSeconds % 86400) / 3600);
            const minutes = Math.floor((totalSeconds % 3600) / 60);
            const seconds = totalSeconds % 60;
            element.textContent =
                `${level} exam: ${targetLabel} — ${days} days, ${hours} hours, ${minutes} minutes, ${seconds} seconds remaining.`;
        }

        update();
        if (target.getTime() > Date.now()) {
            timerByElement.set(element, setInterval(update, 1000));
        }
    }

    window.ExamCountdown = { save, get, render, clear };
})();
