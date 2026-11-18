const authPagesClient = window.supabase.createClient(
    window.SUPABASE_URL,
    window.SUPABASE_ANON_KEY
);

document.body.dataset.theme = "blue";

const authBackgroundQuotes = [
    "Small steps still move you forward.",
    "Your focus is your superpower.",
    "You are stronger than yesterday.",
    "Your effort is never wasted.",
    "Keep choosing progress over perfection.",
    "Every page you turn is progress.",
    "Your future is built by today's effort.",
    "Consistency turns dreams into reality."
];

const authQuoteLayer = document.getElementById("authQuoteLayer");
authBackgroundQuotes.forEach((quote, index) => {
    const quoteElement = document.createElement("span");
    quoteElement.className = "auth-floating-quote";
    quoteElement.textContent = quote;
    quoteElement.style.animationDelay = `${index * -4}s`;
    authQuoteLayer.appendChild(quoteElement);
});

const loginForm = document.getElementById("loginForm");
if (loginForm) {
    loginForm.addEventListener("submit", async event => {
        event.preventDefault();

        const username = document.getElementById("loginUsername").value.trim();
        const password = document.getElementById("loginPassword").value;
        const message = document.getElementById("loginMessage");
        const isAdminLogin = loginForm.dataset.loginMode === "admin";
        const isAdminUsername = username.toLowerCase() === "admin2004";

        if (isAdminLogin !== isAdminUsername) {
            message.textContent = isAdminLogin
                ? "Enter the administrator username to continue."
                : "Please use the Admin page to log in with the administrator username.";
            return;
        }

        message.textContent = "Logging in...";

        const { data, error } = await authPagesClient.functions.invoke(
            "username-login",
            { body: { username, password } }
        );

        if (error || !data?.access_token || !data?.refresh_token) {
            console.error(error);
            message.textContent = data?.error || "Invalid username or password.";
            return;
        }

        const { error: sessionError } = await authPagesClient.auth.setSession({
            access_token: data.access_token,
            refresh_token: data.refresh_token
        });

        if (sessionError) {
            console.error(sessionError);
            message.textContent = sessionError.message;
            return;
        }

        window.location.href = "index.html";
    });
}

const registerForm = document.getElementById("registerForm");
if (registerForm) {
    registerForm.addEventListener("submit", async event => {
        event.preventDefault();

        const full_name = document.getElementById("registerName").value.trim();
        const username = document.getElementById("registerUsername").value.trim();
        const password = document.getElementById("registerPassword").value;
        const message = document.getElementById("registerMessage");
        const loginAfterRegister = document.getElementById("loginAfterRegister");

        if (username.toLowerCase() === "admin2004") {
            message.textContent = "This username is reserved for the administrator.";
            return;
        }

        message.textContent = "Creating account...";
        loginAfterRegister.classList.add("hidden");

        const { data, error } = await authPagesClient.functions.invoke(
            "username-register",
            { body: { full_name, username, password } }
        );

        if (error || !data?.message) {
            let errorDetails = "";
            if (error?.context) {
                try {
                    errorDetails = await error.context.clone().text();
                } catch (readError) {
                    errorDetails = "Could not read error response.";
                }
            }

            console.error("Registration error:", error);
            message.textContent = errorDetails || error?.message || "Registration failed.";
            return;
        }

        message.textContent = "Account created successfully. You can now log in.";
        registerForm.reset();
        loginAfterRegister.classList.remove("hidden");
    });
}
