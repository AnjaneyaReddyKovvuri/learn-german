# Automatic daily email at 20:00

The app on the tablet sends each day's practice numbers to a small script in **your own Google account**.
The script keeps them in a Google Sheet and emails you a report **every evening at about 20:00**, from your Gmail to you.
It's free, and nothing goes to any other service.

Setup takes about 10 minutes, once. A computer is easiest.

## 1. Create the script
1. Open <https://script.google.com> and sign in with the Google account that should send the email.
2. Click **New project**. At the top left, rename it from "Untitled project" to **Anshi Bericht**.
3. Delete the few lines shown in the editor (`function myFunction() …`).
4. Paste the whole script. Either:
   - open <https://github.com/AnjaneyaReddyKovvuri/learn-german/blob/main/scripts/auto-email/Code.gs>, click the **Copy raw file** button (⧉), then paste, or
   - in the app: **📈 Fortschritt → ⏰ Automatische E-Mail → 📋 Skript kopieren**, then paste.
5. Optional: at the top, in `CONFIG`, put another address in `EMAIL: ''` (empty = your own Google address), or change `HOUR: 20`.
6. Click **💾 Save** (or Ctrl+S).

## 2. Check the time zone
Click **⚙ Project Settings** (gear icon on the left). Under **Time zone**, choose yours (e.g. *(GMT+01:00) Berlin*). Go back to the **< > Editor**.

## 3. Run the setup once
1. In the toolbar, choose **setup** in the function list and click **▶ Run**.
2. Google asks for permission: **Review permissions** → choose your account. If Google shows "Google hasn't verified this app", click **Advanced → Go to Anshi Bericht (unsafe)**. That warning appears because the script is yours and not published; it only runs in your account.
3. Allow it to: send email as you, create and edit the spreadsheet, and run on a schedule.
4. The **Execution log** at the bottom shows:
   - `Schlüssel für die App · key for the app: ab12cd34ef` → **write this key down**,
   - the link to the new Google Sheet,
   - "Tägliche E-Mail um ca. 20:00 Uhr an …".

## 4. Publish it as a web app
1. Top right: **Deploy → New deployment**.
2. Click the ⚙ next to "Select type" → **Web app**.
3. Description: `Anshi`. **Execute as: Me**. **Who has access: Anyone**.
   ("Anyone" lets the tablet send without signing in. The key from step 3 stops anyone else from sending data.)
4. Click **Deploy**, then copy the **Web app URL** (it starts with `https://script.google.com/macros/s/` and ends with `/exec`).

## 5. Connect the app (on the tablet)
1. Open the app → **📈 Fortschritt** → **⏰ Automatische E-Mail um 20 Uhr**.
2. Paste the **Web app URL** and type the **key**.
3. Tap **💾 Speichern & Test senden · Save & send test**. Within a minute you get an email starting with **[Test]**.

That's it. From now on:
- every practice day is sent automatically (if the tablet is offline, it's sent the next time it's online),
- at about **20:00** (Google runs it between 20:00 and about 20:15) you get the report,
- the Google Sheet keeps her full history.

## Good to know
- **Changing the time or address later:** edit `CONFIG` in the script, save, and run **setup** again. No new deployment is needed.
- **If you change the code itself:** **Deploy → Manage deployments → ✏ Edit → Version: New version → Deploy**. The URL stays the same.
- **Stopping the emails:** in the script, open **⏰ Triggers** (left side) and delete the trigger, or remove the URL in the app.
- **No email on days without practice:** set `SEND_WHEN_NO_PRACTICE: false`, save, and run **setup** again.
- **What is sent:** only the numbers (count, correct, minutes) and the mistaken words, plus the name from the app's progress page. Nothing else leaves the tablet.
- **If practice happens offline** and the tablet only gets online after 20:00, that day's numbers arrive in the Sheet later, and the next email's "last 7 days" includes them.
