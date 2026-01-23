import { useState, useEffect } from "react";
import "./login.css";
import { setAuth } from "../utils/auth";

export default function Login() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [feedback, setFeedback] = useState({ type: "", msg: "" });
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);

    function updateFeedback(type, msg) {
        setFeedback({ type, msg });
    }

    async function handleSubmit(e) {
        e.preventDefault();

        if (!email.trim()) {
            updateFeedback("error", "Upišite elektroničku poštu");
            return;
        }
        if (!password) {
            updateFeedback("error", "Upišite lozinku");
            return;
        }

        updateFeedback("info", "Prijava...");
        setLoading(true);

        try {
            const res = await fetch("/api/auth/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, password }),
            });

            const data = await res.json().catch(() => ({}));

            if (!res.ok) {
                updateFeedback("error", data.error || "Došlo je do greške");
                return;
            }

            // Save token + user using new unified auth system
            setAuth(data.token, data.user);

            updateFeedback("success", "Uspješna prijava!");

            // Redirect based on role
            const role = data.user?.role?.toLowerCase();
            if (role === "admin") {
                window.location.href = "/admin";
            } else {
                window.location.href = "/";
            }
        } catch (err) {
            console.error(err);
            updateFeedback("error", "Greška u komunikaciji s poslužiteljem");
        } finally {
            setLoading(false);
        }
    }

    // Handle Google OAuth redirect token or errors
    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const googleToken = params.get("token");
        const oauthError = params.get("error");

        async function handleGoogleLogin(token) {
            // Save token first
            setAuth(token, null);
            try {
                // Fetch user from backend using token
                const res = await fetch("/api/auth/me", {
                    headers: { Authorization: "Bearer " + token },
                });
                const me = await res.json().catch(() => ({}));

                if (res.ok && me && me.email) {
                    const user = {
                        email: me.email,
                        role: me.role,
                        firstName: me.firstName || "",
                        lastName: me.lastName || "",
                    };
                    setAuth(token, user);

                    const role = (user.role || "").toLowerCase();
                    window.location.href = role === "admin" ? "/admin" : "/";
                } else {
                    // Fallback to home
                    window.location.href = "/";
                }
            } catch (e) {
                window.location.href = "/";
            }
        }

        if (googleToken) {
            handleGoogleLogin(googleToken);
        } else if (oauthError) {
            updateFeedback("error", oauthError);
            // Clean URL so message doesn't persist on refresh
            window.history.replaceState({}, "", window.location.pathname);
        }
    }, []);

    return (
        <div className="page">
            <main className="card">
                <form onSubmit={handleSubmit} autoComplete="on" noValidate>
                    <div className="field">
                        <label htmlFor="email" className="label">
                            Elektronička pošta
                        </label>
                        <input
                            id="email"
                            name="email"
                            type="email"
                            required
                            placeholder="elektronicka.posta@hotmail.com"
                            className="input"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                    </div>

                    <div className="field">
                        <label htmlFor="password" className="label">
                            Lozinka
                        </label>
                        <input
                            id="password"
                            name="password"
                            type={showPassword ? "text" : "password"}
                            required
                            minLength={6}
                            placeholder="********"
                            className="input"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />

                        <button
                            type="button"
                            className="toggle-btn"
                            onClick={() => setShowPassword((prev) => !prev)}
                        >
                            {showPassword ? "Vidljiva šifra 👁️" : "Skrivena šifra 🙈"}
                        </button>
                    </div>

                    <div className="google-login">
                        <a href="/auth/google" className="google-link">
                            Prijava putem Googlea
                        </a>
                    </div>

                    <div
                        className={`feedback ${feedback.type}`}
                        role="status"
                        aria-live="polite"
                    >
                        {feedback.msg}
                    </div>

                    <button type="submit" className="btn" disabled={loading}>
                        Ulazak
                    </button>
                </form>
            </main>
        </div>
    );
}
