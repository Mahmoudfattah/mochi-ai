# M1 device testing

## Run the production preview

1. Connect the HP laptop and Samsung Galaxy A51 to the same trusted Wi-Fi
   network.
2. From the project root on Windows, build the production bundle:

   ```powershell
   npm run build
   ```

3. Start Vite's production preview on every network interface:

   ```powershell
   npm.cmd run preview -- --host=0.0.0.0
   ```

   In PowerShell, use `npm.cmd` and `--host=...` so the option reaches Vite's
   CLI intact.

4. If Windows Defender Firewall prompts, allow Node.js on **Private networks**
   only. If it does not prompt and the phone cannot connect, add/enable a
   private-network inbound rule for the preview's TCP port `4173`; do not expose
   the preview to public networks.
5. On the laptop, run `ipconfig` and find the active Wi-Fi adapter's IPv4
   address (for example, `192.168.1.20`).
6. On the phone, open `http://<laptop-ipv4>:4173/#gallery`, replacing the
   placeholder with the laptop's address.
7. Use the expression selector or state grid to inspect all 33 expressions.
   Test Full and Compact, and toggle Reduced motion. Use the audio slider while
   the selected expression is `speaking` to inspect the imperative audio-level
   response.
8. In Motion preset, compare `spec` (the default) with `reference` to assess the
   written-spec and HTML-reference idle timing on the phone. Keep the other
   settings and expression the same when comparing.

Keep the preview terminal open during testing. Stop it with `Ctrl+C` when done.
If the preview port changes, use the port printed by Vite in the phone URL.

## Frame-rate probe

The gallery probe counts animation frames over approximately one-second
windows and displays the measured frames per second (FPS). Compare readings
after the gallery has settled and while an expression with animated particles,
rings, and movement is selected. A stable reading near the phone's display
refresh rate is the target; temporary dips during page load or state changes
are not representative. The probe is diagnostic rather than a substitute for
profiling or repeated real-device measurements.
