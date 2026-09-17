# Todo

Here, issues are listed after going over the app and seeing what we are
missing for 0.1 version release. No order.

## 1. Login/Sign-up

- (done) No password complexity check 12345678 works perfectly
  - Rule: at least 10 characters, not only numbers, at least 5 different characters, must not
    contain the email name. No "uppercase + symbol" rules — current standard (NIST) is length
    plus blocking obvious passwords.
- (done) No Email after sign up
  - Welcome email through Resend, sent after the sign-up response.
  - Sender is `onboarding@resend.dev` until a domain is verified in Resend. Until then Resend only
    delivers to the Resend account's own email, so real users get nothing. Verify a domain and set
    `EMAIL_FROM` before going live.
- (done) No need to commit to store/private selection on registration, this step should be in /user
- (done) On sign up, redirect user to /user page (basic user settings there) + user ads

## 2. Homepage

- (done) If item card name spans two lines e.g. "Sony A7 III + Sigma 30mm f/1.4 DC DN Contemporary",
  while rest of the cards in row have shorter names, grey "chin" with the price is separated from the
  bottom border of the card that is stretched. Keep the name max two lines, (clamp or whatever) + allow
  text with 1 line to have extra space bellow
- (done) search dialog should be bigger and have more "breathing room", also, in recently viewed section
  prices are floating weirdly, they should be justify: space-between
- (done) move search to its own space below just header
- (done) if signed in, user should see link to /user and Sell cta, not "sign in" and when not signed in,
  "Sell" and "sign in" (sell redirects to login page)
