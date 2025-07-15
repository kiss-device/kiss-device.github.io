// --- Supabase Client Initialization ---
const { createClient } = supabase
const SUPABASE_URL = 'https://jdamkaxhjsnoadheacjq.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpkYW1rYXhoanNub2FkaGVhY2pxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDkxNDQ0NzgsImV4cCI6MjA2NDcyMDQ3OH0.iah-KUzgpeKpkwoG1ici2EfnWNueHXnKHu3-A23WOZs';

const _supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// --- DOM Elements ---
const signupBtn = document.getElementById('signup-cta-su');


const dialog = document.querySelector("dialog");
const closeButton = document.querySelector("dialog button");

const emailValidationRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/
const strongPasswordRegex = /^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-]).{8,}$/

//Helper funstions
function showDialog(message) {
    document.getElementById("dialog-text").innerHTML = message;
    dialog.showModal();    
}

closeButton.addEventListener("click", () => {
    dialog.close();
});

async function handleSignUp() {
    const nameInput = document.getElementById('name-ip-su').value;
    const emailInput = document.getElementById('email-ip-su').value;
    const mobileInput = document.getElementById('mobile-ip-su').value;
    const ageInput = document.getElementById('age-ip-su').value;
    const passwordInput = document.getElementById('password-ip-su').value;
    const passwordRepeatInput = document.getElementById('password2-ip-su').value;

    if (!nameInput || !emailInput || !passwordInput || !passwordRepeatInput) {
        showDialog("Required fields can't be empty!<br/><b>Name</b>, <b>Email</b>, <b>Password</b> are required fields.")
        return;
    } else if(!emailValidationRegex.test(emailInput)) {
        showDialog("Enter a valid email!")
        return;
    } else if (passwordInput !== passwordRepeatInput) {
        showDialog("Re-enetered password mismtach!")
        return; // Add a return here to stop further execution if passwords don't match
    } else if (!strongPasswordRegex.test(passwordInput)) {
        showDialog("<b>Strong password needed!</b><br/>Password must contain <b>atleast one</b>:<br/><b>number</b>, <b>special character</b>, <b>uppercase letter</b> & <b>lowercase letter</b><br/>Should be <b>8 characters</b> long")
        return; // Add a return here to stop further execution if passwords don't match
    } else {
        //Sign Up Logic
        try {
            const { data, error } = await _supabase.auth.signUp({
                email: emailInput,
                password: passwordInput,
                options: {
                    // This 'data' object is where you put extra metadata
                    data: {
                        name: nameInput,
                        mobile: mobileInput, // Store as string if not using for calculations
                        age: ageInput ? parseInt(ageInput, 10) : null // Convert age to a number or null if empty
                    }
                }
            });
    
            if (error) {
                showDialog(`<b>Sign up error:</b> ${error.message}`);
                console.error('Supabase Sign Up Error:', error.message);
            } else {
                showDialog("Sign up successful!<br/>Please check your email to confirm your account.");
                console.log('Sign up data:', data);
                // The full user object with metadata will be in data.user.user_metadata after signup
                console.log('User metadata:', data.user?.user_metadata);
    
                // Clear inputs after successful signup
                nameInput.value = '';
                emailInput.value = '';
                mobileInput.value = '';
                ageInput.value = '';
                passwordInput.value = '';
                passwordRepeatInput.value = '';
            }
        } catch (err) {
            showDialog(`<b>An unexpected error occurred:</b> ${err.message}`);
            console.error('Unhandled Sign Up Error:', err);
        }
    }

}

async function handleSignIn() {
    const email = document.getElementById('email-ip').value;
    const password = document.getElementById('password-ip').value;
    const { data, error } = await _supabase.auth.signInWithPassword({ email, password });

    if (error) {
        showDialog(`<b>Sign up error:</b> ${error.message}`);
        console.error('Sign in error:', error.message);
    } else {
        window.location.pathname = "bubble_app_login/success.html"
        console.log('Sign in data:', data);
        
    }
}

async function handleSignOut() {
    try {
        const { error } = await _supabase.auth.signOut();
        if (error) {
            showDialog(`<b>Sign out error:</b> ${error.message}`);
        } else {
            // Redirect to login page after sign out
            window.location.pathname = 'bubble_app_login/index.html'; // Or login page
        }
    } catch (err) {
        showDialog(`<b>An unexpected error occurred:</b> ${err.message}`);
    }
}

async function handleForgotPassword() {
    const email = document.getElementById('email-ip-fp').value;

    if(!email || !emailValidationRegex.test(email)) {
        showDialog("Please enter your valid email address!")
        return;
    }

    try {
        const { error } = await _supabase.auth.resetPasswordForEmail(email, {
            redirectTo: window.location.origin + '/bubble_app_login/update-password.html' // URL where user will land after clicking reset link
        });
        if (error) {
            showDialog(`<b>Error:</b> ${error.message}`);
        } else {
            showDialog("Password reset email sent!<br/>Check your inbox.");
        }
    } catch (err) {
        showDialog(`<b>An unexpected error occurred:</b> ${err.message}`);
    }
}

async function handleUpdatePassword() {
    const passwordInput = document.getElementById('password-ip-up').value;
    const passwordRepeatInput = document.getElementById('password2-ip-up').value;

    if (passwordInput !== passwordRepeatInput) {
        showDialog("Re-enetered password mismtach!")
        return; 
    } else if (!strongPasswordRegex.test(passwordInput)) {
        showDialog("<b>Strong password needed!</b><br/>Password must contain <b>atleast one</b>:<br/><b>number</b>, <b>special character</b>, <b>uppercase letter</b> & <b>lowercase letter</b><br/>Should be <b>8 characters</b> long")
        return;
    }

    try {
        const { data, error } = await _supabase.auth.updateUser({
            password: passwordInput
        });

        if (error) {
            showDialog(`Failed to update password: ${error.message}`, true);
        } else {
            showDialog("Password updated successfully! You can now log in with your new password.", false);
            window.location.pathname = 'bubble_app_login/index.html';
        }
    } catch (err) {
        showDialog(`An unexpected error occurred: ${err.message}`, true);
    }
}

async function handleGoogleSignIn() {
    try {
        const { data, error } = await _supabase.auth.signInWithOAuth({
            provider: 'google',
            options: {
                // This `redirectTo` is where Supabase will send the user
                // AFTER Google authenticates them and Supabase processes the callback.
                // It should be a page in YOUR app where you want the user to land
                // after a successful Google login/signup.
                // For example, your dashboard or main app page.
                redirectTo: window.location.origin + '/bubble_app_login/success.html'
            }
        });

        if (error) {
            showDialog(`<b>Google sign-in error:</b> ${error.message}`);
            console.error('Google sign-in error:', error);
        } else {
            // Supabase will automatically redirect the user to Google's authentication page.
            // The `data.url` contains this redirect URL.
            window.location.href = data.url; // This line is not usually needed for `signInWithOAuth`
                                             // as Supabase handles the redirection automatically.
                                             // The method itself initiates the redirect.
                                             // However, if the redirect doesn't happen, uncomment it.
        }
    } catch (err) {
        showDialog(`<b>An unexpected error occurred during Google sign-in:</b><br/>${err.message}`, true);
        console.error('Unhandled Google sign-in error:', err);
    }
}